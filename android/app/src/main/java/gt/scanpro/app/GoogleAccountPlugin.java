package gt.scanpro.app;

import android.content.Context;
import android.accounts.Account;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.AuthorizationResult;
import com.google.android.gms.common.api.Scope;
import java.util.Collections;
import android.content.SharedPreferences;
import android.util.Base64;
import androidx.core.content.ContextCompat;
import androidx.credentials.*;
import androidx.credentials.exceptions.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.*;
import java.security.SecureRandom;
import org.json.JSONObject;

@CapacitorPlugin(name = "GoogleAccount")
public class GoogleAccountPlugin extends Plugin {
    private SharedPreferences preferences() { return getContext().getSharedPreferences("scangaia-google-profile", Context.MODE_PRIVATE); }
    @PluginMethod public void getProfile(PluginCall call) {
        JSObject result = new JSObject();
        String saved = preferences().getString("profile", null);
        try { result.put("profile", saved == null ? JSONObject.NULL : new JSONObject(saved)); call.resolve(result); }
        catch (Exception e) { call.reject("No se pudo leer la cuenta recordada."); }
    }
    @PluginMethod public void signIn(PluginCall call) {
        String clientId = call.getString("clientId", "");
        if (!clientId.endsWith(".apps.googleusercontent.com")) { call.reject("Falta registrar ScanGaia en Google Cloud."); return; }
        byte[] random = new byte[32]; new SecureRandom().nextBytes(random);
        String nonce = Base64.encodeToString(random, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
        getActivity().runOnUiThread(() -> {
            try {
                GetSignInWithGoogleOption option = new GetSignInWithGoogleOption.Builder(clientId).setNonce(nonce).build();
                GetCredentialRequest request = new GetCredentialRequest.Builder().addCredentialOption(option).build();
                CredentialManager.create(getActivity()).getCredentialAsync(getActivity(), request, null,
                    ContextCompat.getMainExecutor(getContext()), new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override public void onResult(GetCredentialResponse response) {
                        try {
                            Credential credential = response.getCredential();
                            if (!(credential instanceof CustomCredential) || !GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                                call.reject("Google no devolvió una cuenta válida."); return;
                            }
                            GoogleIdTokenCredential google = GoogleIdTokenCredential.createFrom(credential.getData());
                            JSONObject claims = new JSONObject(new String(Base64.decode(google.getIdToken().split("\\.")[1], Base64.URL_SAFE), java.nio.charset.StandardCharsets.UTF_8));
                            if (!nonce.equals(claims.optString("nonce")) || !clientId.equals(claims.optString("aud"))) { call.reject("Respuesta de Google no válida para esta solicitud."); return; }
                            JSObject profile = new JSObject();
                            profile.put("email", google.getId());
                            profile.put("name", google.getDisplayName() == null ? google.getId() : google.getDisplayName());
                            if (google.getProfilePictureUri() != null) profile.put("picture", google.getProfilePictureUri().toString());
                            // Only remember display data. No tokens, passwords or server authorization are stored here.
                            preferences().edit().putString("profile", profile.toString()).apply();
                            call.resolve(profile);
                        } catch (Exception e) { call.reject("No se pudo interpretar la cuenta de Google."); }
                    }
                    @Override public void onError(GetCredentialException e) {
                        if (e instanceof GetCredentialCancellationException) call.reject("Inicio de sesión cancelado.", "CANCELLED");
                        else call.reject("No se pudo iniciar sesión con Google. Revisa la conexión, Google Play Services y el registro OAuth de ScanGaia.");
                    }
                });
            } catch (Exception e) { call.reject("No se pudo abrir el selector de cuentas de Google."); }
        });
    }
    @PluginMethod public void authorizeDrive(PluginCall call) {
        try {
            JSONObject profile = new JSONObject(preferences().getString("profile", "{}"));
            String email = profile.optString("email");
            if (email.isEmpty()) { call.reject("Inicia sesión con Google primero."); return; }
            boolean interactive = Boolean.TRUE.equals(call.getBoolean("interactive", false));
            String scope = "https://www.googleapis.com/auth/drive.file";
            AuthorizationRequest request = AuthorizationRequest.builder()
                .setAccount(new Account(email, "com.google"))
                .setRequestedScopes(Collections.singletonList(new Scope(scope))).build();
            getActivity().runOnUiThread(() -> Identity.getAuthorizationClient(getActivity()).authorize(request)
                .addOnSuccessListener(result -> {
                    if (!result.hasResolution()) { resolveDrive(call, result, email); return; }
                    if (!interactive) { call.reject("Vuelve a autorizar Google Drive desde Perfil.", "NEEDS_PERMISSION"); return; }
                    try { ((MainActivity)getActivity()).requestDrive(result.getPendingIntent(), data -> {
                        if (data == null) { call.reject("Permiso de Drive cancelado.", "CANCELLED"); return; }
                        try { resolveDrive(call, Identity.getAuthorizationClient(getActivity()).getAuthorizationResultFromIntent(data), email); }
                        catch (Exception e) { call.reject("No se pudo autorizar Google Drive."); }
                    }); } catch (Exception e) { call.reject("No se pudo abrir el permiso de Google Drive."); }
                }).addOnFailureListener(e -> call.reject("No se pudo conectar con Google Drive. Revisa el registro OAuth y tu conexión.")));
        } catch (Exception e) { call.reject("No se pudo leer la cuenta de Google."); }
    }
    private void resolveDrive(PluginCall call, AuthorizationResult result, String email) {
        if (result.getAccessToken() == null || !result.getGrantedScopes().contains("https://www.googleapis.com/auth/drive.file")) {
            call.reject("Falta el permiso para guardar archivos en Google Drive."); return;
        }
        JSObject response = new JSObject(); response.put("token", result.getAccessToken()); response.put("account", email); call.resolve(response);
    }
    @PluginMethod public void signOut(PluginCall call) {
        CredentialManager.create(getContext()).clearCredentialStateAsync(new ClearCredentialStateRequest(), null,
            ContextCompat.getMainExecutor(getContext()), new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override public void onResult(Void result) { preferences().edit().clear().apply(); call.resolve(); }
                @Override public void onError(ClearCredentialException e) { call.reject("No se pudo cerrar la sesión. Inténtalo otra vez."); }
            });
    }
}
