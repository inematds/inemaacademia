import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "crypto";
import {
  subjects as subjectsTable,
  courses as coursesTable,
  units as unitsTable,
  lessons as lessonsTable,
  lessonContent as lessonContentTable,
} from "./schema/content";
import { exercises as exercisesTable, questions as questionsTable } from "./schema/exercises";
import { badges as badgesTable, avatars as avatarsTable } from "./schema/gamification";

// ---------------------------------------------------------------------------
// DB Connection
// ---------------------------------------------------------------------------
const connectionString = process.env.DATABASE_URL || "";
if (!connectionString) {
  console.error("DATABASE_URL nao definida. Defina no .env");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function id(): string {
  return randomUUID();
}

// ---------------------------------------------------------------------------
// Subjects (4 as specified)
// ---------------------------------------------------------------------------
const subjectMatematica = {
  id: id(),
  name: "Matematica",
  slug: "matematica",
  description: "Numeros, algebra, geometria e mais",
  icon: "calculator",
  color: "#3B82F6",
  order: 1,
  isActive: true,
};
const subjectCiencias = {
  id: id(),
  name: "Ciencias",
  slug: "ciencias",
  description: "Biologia, quimica e fisica",
  icon: "flask-conical",
  color: "#16A34A",
  order: 2,
  isActive: true,
};
const subjectPortugues = {
  id: id(),
  name: "Portugues",
  slug: "portugues",
  description: "Gramatica, literatura e interpretacao de texto",
  icon: "book-open",
  color: "#EA580C",
  order: 3,
  isActive: true,
};
const subjectHistoria = {
  id: id(),
  name: "Historia",
  slug: "historia",
  description: "Historia do Brasil e do mundo",
  icon: "landmark",
  color: "#7C3AED",
  order: 4,
  isActive: true,
};

const subjectsData = [subjectMatematica, subjectCiencias, subjectPortugues, subjectHistoria];

// ---------------------------------------------------------------------------
// Courses (2 per subject)
// ---------------------------------------------------------------------------
function makeCourses(subject: typeof subjectMatematica, names: [string, string]) {
  return names.map((name, i) => ({
    id: id(),
    subjectId: subject.id,
    name,
    slug: `${subject.slug}-${name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")}`,
    description: `Curso de ${name}`,
    thumbnailUrl: null,
    order: i + 1,
    isActive: true,
  }));
}

const coursesData = [
  ...makeCourses(subjectMatematica, ["Algebra Basica", "Geometria Plana"]),
  ...makeCourses(subjectCiencias, ["Biologia Celular", "Quimica Geral"]),
  ...makeCourses(subjectPortugues, ["Gramatica", "Literatura Brasileira"]),
  ...makeCourses(subjectHistoria, ["Historia do Brasil", "Historia Geral"]),
];

// ---------------------------------------------------------------------------
// Units (3 per course)
// ---------------------------------------------------------------------------
function makeUnits(course: (typeof coursesData)[0], names: string[]) {
  return names.map((name, i) => ({
    id: id(),
    courseId: course.id,
    name,
    slug: `${course.slug}-${name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")}`,
    description: `Unidade: ${name}`,
    order: i + 1,
    isActive: true,
  }));
}

const unitNames: Record<string, string[]> = {
  "Algebra Basica": ["Expressoes Numericas", "Equacoes do 1o Grau", "Inequacoes"],
  "Geometria Plana": ["Pontos e Retas", "Triangulos", "Circunferencia"],
  "Biologia Celular": ["Celula Procarionte", "Celula Eucarionte", "Divisao Celular"],
  "Quimica Geral": ["Atomos e Moleculas", "Tabela Periodica", "Ligacoes Quimicas"],
  "Gramatica": ["Morfologia", "Sintaxe", "Semantica"],
  "Literatura Brasileira": ["Romantismo", "Realismo", "Modernismo"],
  "Historia do Brasil": ["Brasil Colonia", "Brasil Imperio", "Brasil Republica"],
  "Historia Geral": ["Grecia Antiga", "Roma Antiga", "Idade Media"],
};

const unitsData: Array<{
  id: string;
  courseId: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}> = [];

for (const course of coursesData) {
  const names = unitNames[course.name] || ["Unidade 1", "Unidade 2", "Unidade 3"];
  unitsData.push(...makeUnits(course, names));
}

// ---------------------------------------------------------------------------
// Lessons (5 per unit, mix of video/article/exercise)
// ---------------------------------------------------------------------------
const lessonTypes = ["video", "article", "exercise", "video", "article"] as const;

const lessonsData: Array<{
  id: string;
  unitId: string;
  name: string;
  slug: string;
  description: string;
  type: "video" | "article" | "exercise" | "quiz";
  order: number;
  isActive: boolean;
}> = [];

for (const unit of unitsData) {
  for (let i = 0; i < 5; i++) {
    lessonsData.push({
      id: id(),
      unitId: unit.id,
      name: `${unit.name} - Aula ${i + 1}`,
      slug: `${unit.slug}-aula-${i + 1}`,
      description: `Aula ${i + 1} da unidade ${unit.name}`,
      type: lessonTypes[i],
      order: i + 1,
      isActive: true,
    });
  }
}

// ---------------------------------------------------------------------------
// Lesson Content
// ---------------------------------------------------------------------------
const sampleVideoUrls = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=9bZkp7q19f0",
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
];

const sampleArticles = [
  `# Introducao

Este e um artigo de exemplo sobre o tema da aula.

## Conceitos Fundamentais

A matematica e a ciencia que estuda quantidades, formas, estruturas e variacoes. Desde a antiguidade, os seres humanos utilizaram conceitos matematicos para resolver problemas do cotidiano.

### Formula de Bhaskara

A equacao do segundo grau e resolvida pela formula:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Onde $a$, $b$ e $c$ sao os coeficientes da equacao $ax^2 + bx + c = 0$.

## Exemplos Praticos

1. Calcule as raizes de $x^2 - 5x + 6 = 0$
2. Verifique se $2x^2 + 3x - 2 = 0$ possui raizes reais

## Conclusao

Pratique os exercicios para fixar o conteudo.`,

  `# O Conteudo da Aula

## Visao Geral

Nesta aula, vamos explorar os conceitos fundamentais do tema proposto, com exemplos praticos e aplicacoes no dia a dia.

## Topicos Abordados

- **Definicao**: O que e e por que e importante
- **Historia**: Como esse conhecimento se desenvolveu
- **Aplicacoes**: Onde usamos no cotidiano

### Detalhes Importantes

> "O conhecimento e a unica coisa que ninguem pode tirar de voce." - B.B. King

## Exercicios Sugeridos

Apos estudar este material, resolva os exercicios propostos para fixar o aprendizado.

## Referencias

- Livro didatico, capitulo 3
- Material complementar disponivel na plataforma`,
];

const lessonContentData: Array<{
  id: string;
  lessonId: string;
  contentType: "video" | "article" | "exercise";
  videoUrl: string | null;
  articleBody: string | null;
  exerciseData: unknown;
}> = [];

for (const lesson of lessonsData) {
  if (lesson.type === "video") {
    lessonContentData.push({
      id: id(),
      lessonId: lesson.id,
      contentType: "video",
      videoUrl: sampleVideoUrls[Math.floor(Math.random() * sampleVideoUrls.length)],
      articleBody: null,
      exerciseData: null,
    });
  } else if (lesson.type === "article") {
    lessonContentData.push({
      id: id(),
      lessonId: lesson.id,
      contentType: "article",
      videoUrl: null,
      articleBody: sampleArticles[Math.floor(Math.random() * sampleArticles.length)],
      exerciseData: null,
    });
  } else if (lesson.type === "exercise") {
    lessonContentData.push({
      id: id(),
      lessonId: lesson.id,
      contentType: "exercise",
      videoUrl: null,
      articleBody: null,
      exerciseData: {
        questions: [
          {
            question: `Questao sobre ${lesson.name}`,
            options: ["Opcao A", "Opcao B", "Opcao C", "Opcao D"],
            correct: 0,
          },
        ],
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Exercises & Questions (for exercise-type lessons)
// ---------------------------------------------------------------------------
const exercisesData: Array<{
  id: string;
  lessonId: string;
  title: string;
  instructions: string;
  order: number;
}> = [];

const questionsData: Array<{
  id: string;
  exerciseId: string;
  type: "multiple_choice";
  questionText: string;
  options: unknown;
  correctAnswer: unknown;
  explanation: string;
  hints: unknown;
  points: number;
  order: number;
}> = [];

const exerciseLessons = lessonsData.filter((l) => l.type === "exercise");

for (const lesson of exerciseLessons) {
  const exerciseId = id();
  exercisesData.push({
    id: exerciseId,
    lessonId: lesson.id,
    title: `Exercicio: ${lesson.name}`,
    instructions: "Responda as questoes abaixo.",
    order: 1,
  });

  for (let q = 0; q < 3; q++) {
    questionsData.push({
      id: id(),
      exerciseId,
      type: "multiple_choice",
      questionText: `Questao ${q + 1} de ${lesson.name}`,
      options: [
        { label: "A", text: "Opcao A" },
        { label: "B", text: "Opcao B" },
        { label: "C", text: "Opcao C" },
        { label: "D", text: "Opcao D" },
      ],
      correctAnswer: { label: "A" },
      explanation: "A opcao A e a correta porque atende ao conceito apresentado na aula.",
      hints: ["Dica: revise o conteudo da aula."],
      points: 10,
      order: q + 1,
    });
  }
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
const badgesData = [
  { id: id(), name: "3 Dias Seguidos", slug: "streak-3", description: "Estude por 3 dias consecutivos", iconUrl: "/badges/streak-3.svg", category: "streak" as const, condition: { type: "streak", value: 3 }, xpReward: 50 },
  { id: id(), name: "Semana Completa", slug: "streak-7", description: "Estude por 7 dias consecutivos", iconUrl: "/badges/streak-7.svg", category: "streak" as const, condition: { type: "streak", value: 7 }, xpReward: 100 },
  { id: id(), name: "Mes de Dedicacao", slug: "streak-30", description: "Estude por 30 dias consecutivos", iconUrl: "/badges/streak-30.svg", category: "streak" as const, condition: { type: "streak", value: 30 }, xpReward: 300 },
  { id: id(), name: "Primeiro Milhar", slug: "xp-1000", description: "Acumule 1.000 XP", iconUrl: "/badges/xp-1000.svg", category: "xp" as const, condition: { type: "xp", value: 1000 }, xpReward: 100 },
  { id: id(), name: "Primeiro Acesso", slug: "first-login", description: "Faca seu primeiro login", iconUrl: "/badges/first-login.svg", category: "special" as const, condition: { type: "login", value: 1 }, xpReward: 25 },
  { id: id(), name: "Primeiro Exercicio", slug: "first-exercise", description: "Complete seu primeiro exercicio", iconUrl: "/badges/first-exercise.svg", category: "special" as const, condition: { type: "exercise", value: 1 }, xpReward: 25 },
  { id: id(), name: "Curso Completo", slug: "first-course-complete", description: "Complete um curso inteiro", iconUrl: "/badges/first-course.svg", category: "special" as const, condition: { type: "course_complete", value: 1 }, xpReward: 500 },
];

// ---------------------------------------------------------------------------
// Avatars
// ---------------------------------------------------------------------------
const avatarsData = [
  { id: id(), name: "Estudante Iniciante", imageUrl: "/avatars/beginner.svg", requiredXp: 0, requiredLevel: 1 },
  { id: id(), name: "Explorador", imageUrl: "/avatars/explorer.svg", requiredXp: 500, requiredLevel: 2 },
  { id: id(), name: "Cientista", imageUrl: "/avatars/scientist.svg", requiredXp: 2000, requiredLevel: 5 },
  { id: id(), name: "Mestre", imageUrl: "/avatars/master.svg", requiredXp: 5000, requiredLevel: 8 },
  { id: id(), name: "Genio", imageUrl: "/avatars/genius.svg", requiredXp: 10000, requiredLevel: 10 },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
async function seed() {
  console.log("Iniciando seed...");

  // Clear existing data in reverse dependency order
  console.log("Limpando dados existentes...");
  await db.delete(questionsTable);
  await db.delete(exercisesTable);
  await db.delete(lessonContentTable);
  await db.delete(lessonsTable);
  await db.delete(unitsTable);
  await db.delete(coursesTable);
  await db.delete(subjectsTable);
  await db.delete(badgesTable);
  await db.delete(avatarsTable);

  // Insert subjects
  console.log(`Inserindo ${subjectsData.length} materias...`);
  await db.insert(subjectsTable).values(subjectsData);

  // Insert courses
  console.log(`Inserindo ${coursesData.length} cursos...`);
  await db.insert(coursesTable).values(coursesData);

  // Insert units
  console.log(`Inserindo ${unitsData.length} unidades...`);
  await db.insert(unitsTable).values(unitsData);

  // Insert lessons
  console.log(`Inserindo ${lessonsData.length} licoes...`);
  // Insert in batches of 50 to avoid query too large
  for (let i = 0; i < lessonsData.length; i += 50) {
    await db.insert(lessonsTable).values(lessonsData.slice(i, i + 50));
  }

  // Insert lesson content
  console.log(`Inserindo ${lessonContentData.length} conteudos de licao...`);
  for (let i = 0; i < lessonContentData.length; i += 50) {
    await db.insert(lessonContentTable).values(lessonContentData.slice(i, i + 50));
  }

  // Insert exercises
  console.log(`Inserindo ${exercisesData.length} exercicios...`);
  for (let i = 0; i < exercisesData.length; i += 50) {
    await db.insert(exercisesTable).values(exercisesData.slice(i, i + 50));
  }

  // Insert questions
  console.log(`Inserindo ${questionsData.length} questoes...`);
  for (let i = 0; i < questionsData.length; i += 50) {
    await db.insert(questionsTable).values(questionsData.slice(i, i + 50));
  }

  // Insert badges
  console.log(`Inserindo ${badgesData.length} badges...`);
  await db.insert(badgesTable).values(badgesData);

  // Insert avatars
  console.log(`Inserindo ${avatarsData.length} avatares...`);
  await db.insert(avatarsTable).values(avatarsData);

  console.log("Seed concluido com sucesso!");
  console.log(`  - ${subjectsData.length} materias`);
  console.log(`  - ${coursesData.length} cursos`);
  console.log(`  - ${unitsData.length} unidades`);
  console.log(`  - ${lessonsData.length} licoes`);
  console.log(`  - ${lessonContentData.length} conteudos`);
  console.log(`  - ${exercisesData.length} exercicios`);
  console.log(`  - ${questionsData.length} questoes`);
  console.log(`  - ${badgesData.length} badges`);
  console.log(`  - ${avatarsData.length} avatares`);
}

seed()
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
    process.exit(0);
  });
