import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";

import { OfflineDetector } from "@/components/offline-detector";
import { ServiceWorkerRegister } from "@/components/sw-register";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "INEMA Academia - Plataforma Educacional",
    template: "%s | INEMA Academia",
  },
  description:
    "Plataforma educacional gratuita e interativa para estudantes brasileiros. Aprenda Matematica, Ciencias, Portugues e mais com exercicios, videos e tutor IA.",
  keywords: [
    "educacao",
    "ENEM",
    "BNCC",
    "matematica",
    "ciencias",
    "portugues",
    "historia",
    "exercicios",
    "plataforma educacional",
    "khan academy brasil",
  ],
  authors: [{ name: "INEMA" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "INEMA Academia",
    title: "INEMA Academia - Plataforma Educacional",
    description:
      "Aprenda no seu ritmo com exercicios interativos, videos e tutor IA. Gratuito para todos os estudantes brasileiros.",
  },
  twitter: {
    card: "summary_large_image",
    title: "INEMA Academia",
    description:
      "Plataforma educacional interativa para estudantes brasileiros.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.geogebra.org" />
        <link rel="dns-prefetch" href="https://www.desmos.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable}`}>
        {children}
        <Toaster richColors position="top-right" />
        <ServiceWorkerRegister />
        <OfflineDetector />
      </body>
    </html>
  );
}
