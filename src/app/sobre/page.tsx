"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Code2,
  Heart,
  Globe,
  Shield,
  ArrowRight,
  Laptop,
  Brain,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.5 },
};

const values = [
  {
    icon: Heart,
    title: "Educacao como direito",
    description:
      "Acreditamos que todo brasileiro merece acesso a educacao de qualidade, independente de renda, localizacao ou condicao social.",
  },
  {
    icon: Globe,
    title: "Acessibilidade universal",
    description:
      "Plataforma projetada para funcionar em qualquer dispositivo, com ou sem internet rapida. Conteudo pensado para incluir, nao excluir.",
  },
  {
    icon: Shield,
    title: "Transparencia e privacidade",
    description:
      "Codigo aberto, sem anuncios, sem venda de dados. Respeitamos a privacidade dos estudantes e seguimos a LGPD.",
  },
];

const techStack = [
  {
    icon: Laptop,
    title: "Stack moderna",
    description:
      "Next.js 15, TypeScript, Tailwind CSS, Supabase e Drizzle ORM. Arquitetura robusta e escalavel.",
  },
  {
    icon: Brain,
    title: "Inteligencia Artificial",
    description:
      "Tutor IA socratico alimentado por modelos de linguagem avancados. Exercicios adaptativos que se ajustam ao nivel do aluno.",
  },
  {
    icon: BookOpen,
    title: "Conteudo pedagogico",
    description:
      "Curriculo desenvolvido por educadores e alinhado a BNCC. Cada topico passa por revisao pedagogica antes de ser publicado.",
  },
];

export default function SobrePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Sobre a{" "}
              <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                INEMA Academia
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Uma plataforma educacional brasileira, gratuita e open source, inspirada
              na Khan Academy e adaptada a realidade do nosso curriculo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Missao e Visao */}
      <section className="bg-white/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <motion.div
              {...fadeUp}
              className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-sm sm:p-10"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                Nossa Missao
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Democratizar a educacao de qualidade no Brasil por meio de tecnologia.
                Queremos que qualquer estudante, de qualquer cidade, tenha acesso ao
                mesmo nivel de conteudo e suporte que os melhores colegios oferecem.
                Nosso objetivo e ser a ponte entre o potencial de cada aluno e o
                conhecimento que ele precisa para realiza-lo.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-sm sm:p-10"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                Nossa Visao
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Um Brasil onde nenhum estudante fica para tras por falta de recursos.
                Onde a tecnologia serve a educacao, e nao o contrario. Onde aprender e
                um prazer, nao uma obrigacao. Onde todo professor tem ferramentas para
                entender e apoiar cada aluno individualmente. Esse e o futuro que
                estamos construindo.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Nossos Valores
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Os principios que guiam cada decisao que tomamos.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnologia */}
      <section className="bg-white/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tecnologia Aberta
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A INEMA Academia e um projeto open source. Qualquer pessoa pode
              contribuir, auditar o codigo ou adaptar a plataforma para sua instituicao.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-3">
            {techStack.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Faca parte dessa transformacao
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Seja como aluno, professor ou contribuidor, voce pode ajudar a mudar
              a educacao no Brasil.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/register">
                  Comecar agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
                <Link href="https://github.com/inema-academia" target="_blank">
                  <Code2 className="h-4 w-4" />
                  Ver no GitHub
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
