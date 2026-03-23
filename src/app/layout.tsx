import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import AnimatedOrbs from "@/components/AnimatedOrbs";
import PageDust from "@/components/PageDust";

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
      <body className="min-h-screen">
        <SmoothScroll>
          <AnimatedOrbs />
          <ScrollProgress />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
