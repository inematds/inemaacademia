import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "INEMA Academia",
    short_name: "INEMA",
    description: "Plataforma educacional interativa para estudantes brasileiros",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1B4D3E",
    orientation: "portrait-primary",
    categories: ["education"],
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
