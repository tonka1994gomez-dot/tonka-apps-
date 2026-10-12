package gt.scanpro.app;
import android.os.Bundle;
import android.content.Intent;
import android.app.PendingIntent;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import com.getcapacitor.BridgeActivity;
import java.util.function.Consumer;
public class MainActivity extends BridgeActivity {
    private ActivityResultLauncher<IntentSenderRequest> driveLauncher;
    private Consumer<Intent> driveCallback;
    @Override public void onCreate(Bundle savedInstanceState) {
        driveLauncher = registerForActivityResult(new ActivityResultContracts.StartIntentSenderForResult(), result -> {
            Consumer<Intent> callback = driveCallback; driveCallback = null;
            if (callback != null) callback.accept(result.getData());
        });
        registerPlugin(GoogleAccountPlugin.class);
        super.onCreate(savedInstanceState);
    }
    public void requestDrive(PendingIntent intent, Consumer<Intent> callback) {
        if (driveCallback != null) throw new IllegalStateException("Ya hay una solicitud de permisos abierta");
        driveCallback = callback;
        driveLauncher.launch(new IntentSenderRequest.Builder(intent.getIntentSender()).build());
    }
}
