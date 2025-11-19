import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reportes de Ventas - Mandala Tickets",
  description: "Sistema de reportes de ventas para eventos",
  icons: {
    icon: "https://mandalatickets.com/assets/img/favicon_nuevo.png",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ backgroundColor: "#000000", color: "#ffffff" }}>
        <header style={{ 
          backgroundColor: "#000000", 
          padding: "20px 0",
          borderBottom: "1px solid #333"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <img
              src="/images/logo_nuevo_azul.png"
              alt="Mandala Tickets Logo"
              style={{ height: "60px", width: "auto" }}
            />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}


