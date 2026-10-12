# ScanGaia 1.0.4

Escáner Android y web con cámara, importación de imágenes y PDF, recorte, filtros, PDF multipágina, lector PDF integrado, carpetas, favoritos, papelera y OCR.

## Uso local y compartición manual

La integración automática de Drive y el acceso con Google dentro de ScanGaia se retiraron. La app funciona sin cuenta, proyecto de Google Cloud, OAuth ni servicios de pago.

Para enviar un documento: abre el PDF, pulsa Compartir PDF y elige una aplicación en el menú nativo del teléfono. Si Google Drive está instalado y aparece en ese menú, selecciónalo y elige la cuenta y carpeta dentro de Drive. El guardado es manual; ScanGaia no realiza subidas automáticas ni confirma que el destinatario haya recibido el archivo. El almacenamiento de Drive depende del espacio disponible en la cuenta del usuario.

Los documentos locales y el identificador de Android se conservan. Desinstalar la app o borrar sus datos elimina esos archivos locales: exportar copias antes. La papelera local no elimina copias compartidas previamente. Los datos antiguos de la cola de Drive quedan inactivos y ningún servicio automático los procesa.

## Compilación

GitHub Actions ejecuta TypeScript y pruebas del visor PDF y la interfaz móvil antes de generar el APK de prueba. La firma de prueba se conserva mediante una caché de GitHub; si cambia o se pierde, Android puede exigir reinstalación. La selección nativa de aplicaciones y la recepción efectiva en Drive deben verificarse en un teléfono real.
