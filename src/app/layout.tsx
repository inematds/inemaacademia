import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "INEMA Academia",
  description: "Plataforma educacional inspirada na Khan Academy para BNCC/ENEM",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${sourceSerif.variable}`}>{children}</body>
    </html>
  );
}
