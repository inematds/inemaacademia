import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inemaacademia.com.br";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/aluno/", "/professor/", "/admin/", "/perfil/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
