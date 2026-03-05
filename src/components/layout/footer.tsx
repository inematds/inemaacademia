import Link from "next/link";
import { GraduationCap } from "lucide-react";

const footerSections = [
  {
    title: "Plataforma",
    links: [
      { label: "Explorar cursos", href: "/explorar" },
      { label: "Sobre o projeto", href: "/sobre" },
      { label: "Cadastrar-se", href: "/register" },
      { label: "Entrar", href: "/login" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Cursos por disciplina", href: "/explorar" },
      { label: "Tutor IA", href: "/sobre" },
      { label: "Para professores", href: "/sobre" },
      { label: "Acessibilidade", href: "/sobre" },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "contato@inema.edu.br", href: "mailto:contato@inema.edu.br" },
      { label: "GitHub", href: "https://github.com/inema-academia" },
      { label: "Twitter / X", href: "https://x.com/inemaacademia" },
      { label: "Instagram", href: "https://instagram.com/inemaacademia" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-source-serif), serif" }}>
                INEMA Academia
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Educacao de qualidade, gratuita e acessivel para todos os brasileiros.
              Alinhada a BNCC e ao ENEM.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright bar */}
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} INEMA Academia. Projeto open source sob licenca MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}
