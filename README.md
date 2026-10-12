# ScanGaia

Escáner de documentos para Android. Cámara e importación de imágenes/PDF, recorte con perspectiva, filtros, PDF multipágina, lector PDF interno, carpetas, favoritos, papelera y OCR.

## Android 1.0.3: Google y Drive

El acceso con Supabase fue retirado. La app usa el selector oficial de cuentas Google mediante Credential Manager. El permiso de Drive se solicita por separado con AuthorizationClient y el alcance drive.file.

Para activar Google, el propietario debe crear en Google Cloud un cliente OAuth Android para el paquete `gt.scanpro.app` y la huella SHA-1 del APK, además de un cliente OAuth de tipo Web. Configurar en GitHub Settings > Secrets and variables > Actions > Variables la variable `VITE_GOOGLE_WEB_CLIENT_ID` con el ID del cliente Web. Activar Google Drive API y añadir drive.file al consentimiento OAuth; mientras la app esté en pruebas, registrar los usuarios de prueba. No se necesita ni se debe introducir un client secret en la app.

El artefacto del APK incluye `google-signing-fingerprint.txt` con la huella pública para el registro OAuth. La firma de la beta se conserva en la caché de GitHub Actions; si la caché se pierde y cambia la firma, hay que actualizar el cliente OAuth y respaldar los documentos antes de reinstalar. Una distribución permanente requiere una clave de firma administrada para producción.

### Subida automática

1. Iniciar sesión con Google.
2. Abrir Perfil y elegir Vincular Drive y subir documentos.
3. Autorizar el permiso de Drive. Se suben los PDF locales existentes y los nuevos escaneos guardados o PDF importados a la carpeta ScanGaia.

Cada documento muestra pendiente, subiendo, guardado o error. Sin conexión, la cola se conserva en IndexedDB y se reintenta al abrir la app, volver a primer plano, recuperar conexión y cada minuto mientras la app está abierta. No se ejecuta con la app cerrada. La cola se vincula a una cuenta concreta. Cambiar o desconectar la cuenta detiene esa cola. La papelera local no elimina archivos de Drive.

Las subidas usan sesiones reanudables con bloques de 1 MiB y un ID de archivo persistido antes de empezar, evitando duplicar documentos al reintentar. Ante una interrupción se inicia una nueva sesión con ese mismo ID y se verifica el tamaño final. No se conserva una sesión de bytes entre cierres. Los tokens de acceso solo se usan en memoria. El perfil recordado es información de presentación; las operaciones de Drive siempre requieren autorización de Google. Las copias locales no quedan aisladas por cuenta ni cifradas; el acceso con Google no constituye un bloqueo de documentos.

### Compilar

```sh
pnpm install --frozen-lockfile --ignore-scripts
node scripts/prepare-scanpro.mjs
pnpm exec tsc --noEmit -p tsconfig.android.json
pnpm exec vite build --config vite.android.config.ts
pnpm exec cap sync android
cd android
./gradlew assembleDebug
```

GitHub Actions ejecuta las comprobaciones de TypeScript, las pruebas de cola de Drive y las pruebas de interfaz móvil antes de compilar. Sin un registro OAuth real, el APK se puede compilar y escanear en modo local, pero Google y Drive permanecen sin activar. El consentimiento real y la carga a una cuenta real deben verificarse después del registro.
