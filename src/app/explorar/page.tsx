"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  PenLine,
  ArrowRight,
  BookOpen,
  Clock,
  BarChart3,
  ChevronDown,
  GraduationCap,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { designTokens } from "@/styles/design-tokens";

/* ------------------------------------------------------------------ */
/*  Course data                                                        */
/* ------------------------------------------------------------------ */
interface Course {
  title: string;
  lessons: number;
  duration: string;
  level: string;
  free: boolean;
}

interface Subject {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  courseCount: number;
  courses: Course[];
}

const subjects: Subject[] = [
  {
    id: "matematica",
    name: "Matematica",
    icon: Calculator,
    color: designTokens.colors.subjects.matematica,
    description:
      "Do basico ao avancado: aritmetica, algebra, geometria, funcoes, estatistica e introducao ao calculo. Conteudo alinhado a BNCC do Ensino Fundamental e Medio.",
    courseCount: 42,
    courses: [
      { title: "Aritmetica Fundamental", lessons: 24, duration: "8h", level: "Iniciante", free: true },
      { title: "Algebra: Equacoes e Inequacoes", lessons: 32, duration: "12h", level: "Intermediario", free: true },
      { title: "Geometria Plana e Espacial", lessons: 28, duration: "10h", level: "Intermediario", free: true },
      { title: "Funcoes e Graficos", lessons: 20, duration: "7h", level: "Avancado", free: false },
      { title: "Estatistica e Probabilidade", lessons: 18, duration: "6h", level: "Intermediario", free: false },
    ],
  },
  {
    id: "ciencias",
    name: "Ciencias da Natureza",
    icon: FlaskConical,
    color: designTokens.colors.subjects.ciencias,
    description:
      "Fisica, quimica e biologia com experimentos virtuais e simulacoes interativas. Prepare-se para o ENEM com conteudo aprofundado e exercicios contextualizados.",
    courseCount: 36,
    courses: [
      { title: "Fisica: Mecanica Classica", lessons: 30, duration: "11h", level: "Intermediario", free: true },
      { title: "Quimica Geral e Inorganica", lessons: 26, duration: "9h", level: "Intermediario", free: true },
      { title: "Biologia Celular e Molecular", lessons: 22, duration: "8h", level: "Iniciante", free: true },
      { title: "Termodinamica e Ondas", lessons: 20, duration: "7h", level: "Avancado", free: false },
      { title: "Ecologia e Meio Ambiente", lessons: 16, duration: "5h", level: "Iniciante", free: false },
    ],
  },
  {
    id: "humanas",
    name: "Ciencias Humanas",
    icon: Globe,
    color: designTokens.colors.subjects.humanas,
    description:
      "Historia do Brasil e do mundo, geografia fisica e humana, filosofia e sociologia. Desenvolva pensamento critico e compreensao da sociedade.",
    courseCount: 31,
    courses: [
      { title: "Historia do Brasil Colonial", lessons: 20, duration: "7h", level: "Iniciante", free: true },
      { title: "Geografia do Brasil", lessons: 24, duration: "8h", level: "Intermediario", free: true },
      { title: "Filosofia: Grandes Pensadores", lessons: 18, duration: "6h", level: "Iniciante", free: true },
      { title: "Sociologia Contemporanea", lessons: 16, duration: "5h", level: "Intermediario", free: false },
      { title: "Geopolitica Mundial", lessons: 22, duration: "8h", level: "Avancado", free: false },
    ],
  },
  {
    id: "linguagens",
    name: "Linguagens",
    icon: Languages,
    color: designTokens.colors.subjects.linguagens,
    description:
      "Lingua portuguesa, literatura brasileira e portuguesa, ingles e artes. Domine a interpretacao de texto e a comunicacao escrita e oral.",
    courseCount: 28,
    courses: [
      { title: "Gramatica Essencial", lessons: 28, duration: "10h", level: "Iniciante", free: true },
      { title: "Literatura Brasileira", lessons: 22, duration: "8h", level: "Intermediario", free: true },
      { title: "Ingles: do Basico ao Intermediario", lessons: 30, duration: "12h", level: "Iniciante", free: true },
      { title: "Interpretacao de Texto para ENEM", lessons: 16, duration: "5h", level: "Avancado", free: false },
      { title: "Artes e Cultura Brasileira", lessons: 14, duration: "4h", level: "Iniciante", free: false },
    ],
  },
  {
    id: "redacao",
    name: "Redacao",
    icon: PenLine,
    color: designTokens.colors.subjects.redacao,
    description:
      "Domine a dissertacao argumentativa do ENEM. Aprenda estrutura, argumentacao, coesao e coerencia. Pratique com temas reais e receba feedback da IA.",
    courseCount: 15,
    courses: [
      { title: "Estrutura da Dissertacao Argumentativa", lessons: 12, duration: "4h", level: "Iniciante", free: true },
      { title: "Repertorio Socio-Cultural", lessons: 16, duration: "6h", level: "Intermediario", free: true },
      { title: "Coesao e Coerencia Textual", lessons: 10, duration: "3h", level: "Intermediario", free: true },
      { title: "Temas ENEM: Pratica Guiada", lessons: 20, duration: "8h", level: "Avancado", free: false },
      { title: "Redacao Nota 1000", lessons: 14, duration: "5h", level: "Avancado", free: false },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Level badge color helper                                           */
/* ------------------------------------------------------------------ */
function levelColor(level: string) {
  switch (level) {
    case "Iniciante":
      return "bg-emerald-100 text-emerald-700";
    case "Intermediario":
      return "bg-amber-100 text-amber-700";
    case "Avancado":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ExplorarPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pb-12 pt-20 sm:pb-16 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Explore nossos cursos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Navegue por todas as disciplinas e descubra o conteudo disponivel.
              Cadastre-se para desbloquear o acesso completo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Subjects grid */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                {/* Subject card */}
                <button
                  onClick={() => toggleExpand(subject.id)}
                  className="group w-full rounded-2xl border border-border/50 bg-white/90 p-6 text-left shadow-sm transition-all hover:shadow-md sm:p-8"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      <subject.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                          {subject.name}
                        </h2>
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          {subject.courseCount} cursos
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {subject.description}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        expandedId === subject.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded course list */}
                <AnimatePresence>
                  {expandedId === subject.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-2xl border border-border/40 bg-white/70 p-4 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground">
                            Cursos disponiveis
                          </h3>
                          <button
                            onClick={() => setExpandedId(null)}
                            className="rounded-lg p-1 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {subject.courses.map((course) => (
                            <div
                              key={course.title}
                              className="relative rounded-xl border border-border/40 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                              {!course.free && (
                                <div className="absolute right-3 top-3">
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                                </div>
                              )}
                              <h4 className="mb-2 pr-5 text-sm font-semibold text-foreground">
                                {course.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${levelColor(course.level)}`}>
                                  {course.level}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <BookOpen className="h-3 w-3" />
                                  {course.lessons} aulas
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}
                                </span>
                              </div>
                              {course.free ? (
                                <span
                                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium"
                                  style={{ color: subject.color }}
                                >
                                  <BarChart3 className="h-3 w-3" />
                                  Acesso livre
                                </span>
                              ) : (
                                <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  Cadastro necessario
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-white/60 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Pronto para comecar a aprender?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Crie sua conta gratuita e tenha acesso a todos os cursos, exercicios
              interativos e ao tutor IA.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/register">
                  Cadastrar-se gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
