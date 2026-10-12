import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'ScanPro — Tu papel, en digital',description:'Escanea, convierte a PDF y organiza tus documentos. Procesamiento local y nube privada opcional.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
