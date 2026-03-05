"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Trophy,
  ArrowRight,
  GraduationCap,
  Users,
  Sparkles,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  PenLine,
  UserPlus,
  Compass,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { designTokens } from "@/styles/design-tokens";

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useAnimatedCounter(target: number, duration = 2000, inView = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);
  return count;
}

/* ------------------------------------------------------------------ */
/*  Section animation wrapper                                          */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat counter item                                                  */
/* ------------------------------------------------------------------ */
function StatItem({
  value,
  suffix,
  label,
  inView,
}: {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
}) {
  const count = useAnimatedCounter(value, 2000, inView);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold text-primary sm:text-4xl" style={{ fontFamily: "var(--font-source-serif), serif" }}>
        {count.toLocaleString("pt-BR")}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subject data                                                       */
/* ------------------------------------------------------------------ */
const subjects = [
  {
    name: "Matematica",
    icon: Calculator,
    color: designTokens.colors.subjects.matematica,
    courses: 42,
    description: "Aritmetica, algebra, geometria, estatistica e calculo",
  },
  {
    name: "Ciencias da Natureza",
    icon: FlaskConical,
    color: designTokens.colors.subjects.ciencias,
    courses: 36,
    description: "Fisica, quimica, biologia e meio ambiente",
  },
  {
    name: "Ciencias Humanas",
    icon: Globe,
    color: designTokens.colors.subjects.humanas,
    courses: 31,
    description: "Historia, geografia, filosofia e sociologia",
  },
  {
    name: "Linguagens",
    icon: Languages,
    color: designTokens.colors.subjects.linguagens,
    courses: 28,
    description: "Portugues, literatura, ingles e artes",
  },
  {
    name: "Redacao",
    icon: PenLine,
    color: designTokens.colors.subjects.redacao,
    courses: 15,
    description: "Dissertacao argumentativa, generos textuais e pratica",
  },
];

/* ------------------------------------------------------------------ */
/*  Features data                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: BookOpen,
    title: "Conteudo Estruturado",
    description:
      "Cursos organizados em arvore de conhecimento, alinhados a BNCC e ao ENEM. Cada topico conecta ao proximo, garantindo uma aprendizagem solida e progressiva.",
  },
  {
    icon: Brain,
    title: "Tutor IA Socratico",
    description:
      "Um assistente inteligente que nao te da a resposta pronta. Ele faz perguntas que te guiam ao raciocinio correto, exatamente como faria um bom professor.",
  },
  {
    icon: Trophy,
    title: "Gamificacao e Motivacao",
    description:
      "Pontos de dominio, streaks diarios, conquistas e leaderboards. Cada exercicio resolvido te aproxima do proximo nivel. Aprender vira habito.",
  },
];

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */
const steps = [
  {
    icon: UserPlus,
    title: "Cadastre-se gratuitamente",
    description: "Crie sua conta em segundos. Sem cartao, sem pegadinhas. Educacao de qualidade e um direito.",
  },
  {
    icon: Compass,
    title: "Escolha seu caminho",
    description: "Selecione a disciplina e o nivel que deseja estudar. Nossa IA sugere por onde comecar com base no seu perfil.",
  },
  {
    icon: TrendingUp,
    title: "Aprenda e evolua",
    description: "Assista aulas, resolva exercicios e acompanhe seu progresso em tempo real. O dominio vem com a pratica.",
  },
];

/* ------------------------------------------------------------------ */
/*  Landing page                                                       */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-40px" });

  return (
    <PublicLayout>
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden pb-16 pt-20 sm:pb-24 sm:pt-28 lg:pt-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-xs">
                <Sparkles className="h-3 w-3" />
                100% gratuito e open source
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Aprenda no seu ritmo,{" "}
              <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                domine o curriculo brasileiro
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Plataforma educacional gratuita com conteudo alinhado a BNCC e ao ENEM.
              Cursos interativos, exercicios adaptativos e um tutor IA que te ajuda
              a pensar, nao a copiar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            >
              <Button size="lg" className="w-full gap-2 text-base sm:w-auto" asChild>
                <Link href="/register">
                  <GraduationCap className="h-5 w-5" />
                  Comecar gratis
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full gap-2 text-base sm:w-auto" asChild>
                <Link href="/explorar">
                  Explorar conteudo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== STATS ============== */}
      <section
        ref={statsRef}
        className="border-y border-border/40 bg-white/60 py-10"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6">
          <StatItem value={150} suffix="+" label="Cursos" inView={statsInView} />
          <StatItem value={10000} suffix="+" label="Exercicios" inView={statsInView} />
          <StatItem value={24} suffix="/7" label="Tutor IA" inView={statsInView} />
          <StatItem value={100} suffix="%" label="Gratuito" inView={statsInView} />
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Por que a INEMA Academia?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Combinamos o melhor da pedagogia com tecnologia de ponta para criar
              uma experiencia de aprendizagem verdadeiramente eficaz.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============== SUBJECTS ============== */}
      <AnimatedSection className="bg-white/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Disciplinas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Conteudo organizado por area de conhecimento, do Ensino Fundamental
              ao Ensino Medio. Tudo alinhado a BNCC.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href="/explorar"
                  className="group flex flex-col gap-3 rounded-2xl border border-border/50 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    <subject.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{subject.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {subject.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: subject.color }}
                    >
                      {subject.courses} cursos
                    </span>
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============== HOW IT WORKS ============== */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tres passos para transformar sua educacao.
            </p>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
                  <step.icon className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ============== FOR TEACHERS ============== */}
      <AnimatedSection className="bg-white/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border/50 bg-gradient-to-br from-secondary/5 to-primary/5 p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Para Professores
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Acompanhe o progresso de seus alunos em tempo real. Crie turmas, atribua
              exercicios e identifique dificuldades antes que se tornem problemas.
              Ferramentas pensadas para quem ensina.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" variant="secondary" className="gap-2 text-base" asChild>
                <Link href="/register">
                  Criar conta de professor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ============== FINAL CTA ============== */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comece sua jornada hoje
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Milhares de alunos ja estao aprendendo na INEMA Academia.
            Junte-se a eles e domine o curriculo brasileiro no seu ritmo.
          </p>
          <div className="mt-8">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/register">
                <GraduationCap className="h-5 w-5" />
                Comecar gratis agora
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </PublicLayout>
  );
}
