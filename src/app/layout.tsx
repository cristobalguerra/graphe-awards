import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Graphe Awards — Design Contest",
  description:
    "Premiamos los mejores proyectos de diseno grafico de la Universidad de Monterrey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
