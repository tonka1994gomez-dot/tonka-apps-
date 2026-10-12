# ScanPro — beta funcional

Aplicación original en español para escanear documentos, procesar imágenes y crear PDF. React + TypeScript, PWA y proyecto Android con Capacitor. Esta entrega NO declara terminada la Fase 1: faltan validaciones reales de cámara/PWA/Android, OCR español y Supabase con dos cuentas independientes.

## Empezar

Requisitos: Node 22 y pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile --ignore-scripts
node scripts/prepare-scanpro.mjs
pnpm run dev
```

La cámara web necesita HTTPS o localhost y permiso del usuario. En Android se utiliza el plugin oficial Camera. No hay cuentas ni documentos de demostración.

## Generar el APK en GitHub

1. Crea un repositorio vacío, preferiblemente privado, en tu cuenta de GitHub.
2. Sube **el contenido** de este proyecto (no el ZIP como único archivo). Incluye `.github/workflows/android.yml`, `pnpm-lock.yaml` y la carpeta `android`.
3. Abre **Actions → Compilar ScanPro Android → Run workflow**. También se ejecuta al enviar cambios a `main`.
4. Cuando finalice correctamente, descarga **ScanPro-Android-APK** en Artifacts, descomprime e instala `app-debug.apk` en tu teléfono.

El flujo instala Java 21, SDK Android, compila React y ejecuta Gradle. El APK es de pruebas con firma debug: no es una publicación de Google Play. El flujo está preparado, pero aún no se ha ejecutado en la cuenta del usuario. No se generó un APK durante esta entrega porque no hay repositorio accesible ni SDK Android local.

## Supabase

1. Crea un proyecto Supabase y ejecuta `supabase/migrations/001_scanpro.sql` una sola vez en SQL Editor.
2. Activa autenticación por correo. Configura Site URL y Redirect URLs para la URL web de ScanPro. Recuperación de contraseña en Android con enlace profundo queda pendiente; usa la versión web.
3. En ScanPro → Perfil, introduce la URL del proyecto y una clave **pública** `publishable` o `anon`. Nunca introduzcas `service_role` ni una clave secreta.
4. Regístrate, confirma el correo e inicia sesión.
5. Abre un documento y elige **Guardar en nube**. Solo entonces se envía el PDF al proyecto Supabase configurado.
6. En otro dispositivo, configura el mismo proyecto, inicia sesión y elige **Recuperar de la nube**.

Storage utiliza un bucket privado `documents`, rutas `user-id/document-id.pdf` y RLS. No se generan enlaces públicos. La migración crea las once tablas del PRD con restricciones de pertenencia, índices y políticas RLS. `share_links` queda sin permisos de emisión desde el cliente: la funcionalidad no está implementada y requerirá backend.

La sincronización actual es manual de PDF. Carpetas, fuentes originales, filtros y OCR se conservan localmente: aún no se sincronizan a Supabase. Los botones distinguen la copia local y la copia de nube. La eliminación definitiva de la nube elimina el objeto y el registro; es una operación en dos pasos reintentable.

## Funciones implementadas

- Captura con cámara web y cámara nativa Android, e importación JPG/PNG/PDF.
- Detección de bordes con OpenCV cargado bajo demanda; detección automática tras capturar y botón para imágenes importadas.
- Ajuste de cuatro esquinas con dedo, mouse o flechas del teclado, y corrección geométrica de perspectiva.
- Rotación, cinco filtros, brillo y contraste, restauración de original y vista previa.
- Documento de hasta 40 imágenes, orden por arrastre o botones y eliminación de páginas.
- PDF real multipágina en A4, Carta, Oficio (8.5 × 13 pulgadas) y tamaño según imagen; tres niveles de calidad; tamaño real tras guardar.
- Descarga PDF/JPG, compartir navegador con alternativa de descarga, y exportación nativa Android mediante hoja de compartir.
- IndexedDB: documentos, originales de los escaneos guardados, borrador, carpetas/subcarpetas, renombrado, movimiento, duplicación, favoritos y papelera.
- Visor PDF del navegador con alternativa de descarga en dispositivos sin visor integrado.
- OCR Tesseract local de todas las páginas de un PDF, español e inglés, progreso, edición, guardado, copia, TXT y búsqueda de texto local.
- Supabase Auth, registro, acceso y recuperación web; carga y recuperación manual de PDF privados, sujetos a configurar el servicio y validar RLS.
- Diseño responsive, modo oscuro, manifiesto PWA, iconos y service worker de activos estáticos. Recarga completamente offline no garantizada en el alojamiento privado.

## Limitaciones / no disponibles

- No se implementaron anotaciones, firmas, marcas de agua, edición vectorial de PDF ni PDF buscable.
- No se implementaron modos ID/libro/pizarra, reducción avanzada de sombras, nitidez, tablas, Word/Excel/PowerPoint, traducción, IA, fax, OAuth Drive/Dropbox/OneDrive, enlaces compartidos protegidos o PDF cifrado.
- Filtros sencillos no prometen eliminación de sombras ni reconstrucción de texto borroso.
- Detección OpenCV y filtros ejecutan cálculos en el hilo principal; se necesita perfilar y migrar trabajo pesado a Web Workers para gama media. La corrección de perspectiva cede periódicamente el hilo; OCR usa su worker.
- OpenCV se descarga bajo demanda (~11 MB sin compresión); OCR descarga motor e idiomas en el primer uso. No se envía el contenido documental a un proveedor OCR.
- Las imágenes originales de galería se conservan como fuente; las de cámara son la captura JPEG. Procesamiento limitado a 2400 px (perspectiva a 2200 px) para controlar memoria. Importación de imagen: 35 MB; PDF: 50 MB y OCR hasta 40 páginas.
- El almacenamiento local pertenece al navegador/dispositivo, no a una cuenta Supabase. No está cifrado por ScanPro; permanece tras cerrar sesión y se pierde al borrar los datos del navegador. No utilizar modo local en dispositivos compartidos sin eliminar las copias.
- Contraseñas de enlaces no se almacenan porque no hay enlaces implementados.
- El APK no tiene todavía una identidad de firma de distribución ni pruebas físicas; no se debe considerar listo para publicar en Play Store.

## Verificación realizada

```sh
pnpm exec tsc --noEmit
node tests/run.mjs
pnpm run build:android
node scripts/prepare-scanpro.mjs
pnpm run build
```

Se verificaron: PDF de cinco páginas en cuatro formatos, orden de las imágenes incrustadas, dimensiones de recorte de perspectiva, rechazo de esquinas cruzadas, rotación, cinco filtros y detección OpenCV sobre un documento sintético de alto contraste. TypeScript y compilación web/paquete web de Android pasan. Se generó y sincronizó el proyecto nativo Android con los plugins Camera, Filesystem y Share.

**No verificado:** interacción visual de navegador, cámara en teléfono, instalación PWA/APK, OCR español sobre fotografía real, entrega de correo, recuperación, carga Supabase y aislamiento entre dos cuentas. No hay credenciales Supabase ni un repositorio GitHub accesible en esta sesión. La Fase 1 permanece en beta hasta completar estas pruebas.

## Prueba de aceptación pendiente

- En Android, capturar cinco hojas; ajustar esquinas, aplicar filtros, reordenar y comprobar el PDF de cinco páginas.
- Cerrar y reabrir: documento, carpeta, OCR y borrador deben persistir.
- Con Supabase configurado, registrar dos usuarios A y B. Subir como A; comprobar que B no puede consultar el registro, descargar el objeto ni insertar relaciones con IDs de A.
- Recuperar la copia en otro dispositivo, probar permisos de cámara denegados y desconexión de red.
- OCR sobre hoja impresa en español y comparación manual del resultado.
- Ejecutar GitHub Actions, instalar el APK generado y comprobar captura/exportación en Android.

## Arquitectura

- `app/page.tsx`: interfaz y flujos de usuario.
- `lib/scanpro/imaging.ts`: OpenCV, homografía y filtros.
- `lib/scanpro/pdf.ts`: creación y rasterización PDF.
- `lib/scanpro/storage.ts`: IndexedDB y exportación.
- `lib/scanpro/cloud.ts`: conexión Supabase.
- `supabase/migrations/001_scanpro.sql`: esquema y seguridad.
- `android-web/`, `capacitor.config.ts`, `android/`: aplicación Android.
- `.github/workflows/android.yml`: compilación APK.

Documentación de referencia: https://supabase.com/docs/guides/storage/security/access-control y https://capacitorjs.com/docs/getting-started/environment-setup .
