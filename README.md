# ScanGaia 1.0.4

Escáner Android y web con cámara, importación de imágenes y PDF, recorte, filtros, PDF multipágina, lector PDF integrado, carpetas, favoritos, papelera y OCR.

## Uso local y compartición manual

La integración automática de Drive y el acceso con Google dentro de ScanGaia se retiraron. La app funciona sin cuenta, proyecto de Google Cloud, OAuth ni servicios de pago.

Para enviar un documento: abre el PDF, pulsa Compartir PDF y elige una aplicación en el menú nativo del teléfono. Si Google Drive está instalado y aparece en ese menú, selecciónalo y elige la cuenta y carpeta dentro de Drive. El guardado es manual; ScanGaia no realiza subidas automáticas ni confirma que el destinatario haya recibido el archivo. El almacenamiento de Drive depende del espacio disponible en la cuenta del usuario.

Los documentos locales y el identificador de Android se conservan. Desinstalar la app o borrar sus datos elimina esos archivos locales: exportar copias antes. La papelera local no elimina copias compartidas previamente. Los datos antiguos de la cola de Drive quedan inactivos y ningún servicio automático los procesa.

## Compilación

GitHub Actions ejecuta TypeScript y pruebas del visor PDF y la interfaz móvil antes de generar el APK de prueba. La firma de prueba se conserva mediante una caché de GitHub; si cambia o se pierde, Android puede exigir reinstalación. La selección nativa de aplicaciones y la recepción efectiva en Drive deben verificarse en un teléfono real.

## 1.0.5: escaneo por lote

La cámara integrada permanece abierta entre capturas en modo Lote. Un Web Worker separado detecta los bordes y aplica corrección de perspectiva a cada imagen; las fotos sin un contorno fiable se conservan completas y se marcan para revisión. Hasta 100 páginas por PDF, con un máximo de seis fotos pendientes para controlar el uso de memoria. Los trabajos pendientes se conservan en el borrador y se reanudan al abrir la app. Este procesamiento ocurre con la app abierta; no es un servicio Android que continúe tras cerrar la aplicación.

Los efectos muestran solo sus nombres. Guardar PDF permanece en la cabecera del editor durante el desplazamiento y espera a que la cola termine. Cámara del teléfono es el respaldo si el WebView no permite una cámara continua. En ese respaldo se debe volver a pulsar para cada foto. Google Cloud y la sincronización automática siguen retirados; el envío del PDF es manual.

Las pruebas automáticas usan tres documentos sintéticos y una cámara simulada para verificar que la cámara permanece abierta, el trabajador recorta y el botón superior genera un PDF de tres páginas. Se requiere validar la cámara y el rendimiento en un teléfono real.
