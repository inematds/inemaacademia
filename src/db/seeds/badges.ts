import { randomUUID } from "crypto";

function id(): string {
  return randomUUID();
}

export interface BadgeSeed {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  category: "streak" | "xp" | "mastery" | "special" | "community";
  condition: Record<string, unknown>;
  xpReward: number;
}

// Streak badges: 3, 7, 30, 100, 365 days
const streakBadges: BadgeSeed[] = [
  {
    id: id(),
    name: "3 Dias Seguidos",
    slug: "streak-3",
    description: "Estude por 3 dias consecutivos",
    iconUrl: "/badges/streak-3.svg",
    category: "streak",
    condition: { type: "streak", value: 3 },
    xpReward: 50,
  },
  {
    id: id(),
    name: "Semana Completa",
    slug: "streak-7",
    description: "Estude por 7 dias consecutivos",
    iconUrl: "/badges/streak-7.svg",
    category: "streak",
    condition: { type: "streak", value: 7 },
    xpReward: 100,
  },
  {
    id: id(),
    name: "Mes de Dedicacao",
    slug: "streak-30",
    description: "Estude por 30 dias consecutivos",
    iconUrl: "/badges/streak-30.svg",
    category: "streak",
    condition: { type: "streak", value: 30 },
    xpReward: 300,
  },
  {
    id: id(),
    name: "Centenario",
    slug: "streak-100",
    description: "Estude por 100 dias consecutivos",
    iconUrl: "/badges/streak-100.svg",
    category: "streak",
    condition: { type: "streak", value: 100 },
    xpReward: 1000,
  },
  {
    id: id(),
    name: "Ano Inteiro",
    slug: "streak-365",
    description: "Estude por 365 dias consecutivos",
    iconUrl: "/badges/streak-365.svg",
    category: "streak",
    condition: { type: "streak", value: 365 },
    xpReward: 5000,
  },
];

// XP badges: 1000, 5000, 10000, 50000, 100000
const xpBadges: BadgeSeed[] = [
  {
    id: id(),
    name: "Primeiro Milhar",
    slug: "xp-1000",
    description: "Acumule 1.000 XP",
    iconUrl: "/badges/xp-1000.svg",
    category: "xp",
    condition: { type: "xp", value: 1000 },
    xpReward: 100,
  },
  {
    id: id(),
    name: "Cinco Mil",
    slug: "xp-5000",
    description: "Acumule 5.000 XP",
    iconUrl: "/badges/xp-5000.svg",
    category: "xp",
    condition: { type: "xp", value: 5000 },
    xpReward: 250,
  },
  {
    id: id(),
    name: "Dez Mil",
    slug: "xp-10000",
    description: "Acumule 10.000 XP",
    iconUrl: "/badges/xp-10000.svg",
    category: "xp",
    condition: { type: "xp", value: 10000 },
    xpReward: 500,
  },
  {
    id: id(),
    name: "Cinquenta Mil",
    slug: "xp-50000",
    description: "Acumule 50.000 XP",
    iconUrl: "/badges/xp-50000.svg",
    category: "xp",
    condition: { type: "xp", value: 50000 },
    xpReward: 2000,
  },
  {
    id: id(),
    name: "Cem Mil",
    slug: "xp-100000",
    description: "Acumule 100.000 XP",
    iconUrl: "/badges/xp-100000.svg",
    category: "xp",
    condition: { type: "xp", value: 100000 },
    xpReward: 5000,
  },
];

// Mastery badges: 1, 10, 50, 100 skills mastered
const masteryBadges: BadgeSeed[] = [
  {
    id: id(),
    name: "Primeiro Dominio",
    slug: "mastery-1",
    description: "Domine 1 habilidade",
    iconUrl: "/badges/mastery-1.svg",
    category: "mastery",
    condition: { type: "mastery", value: 1 },
    xpReward: 100,
  },
  {
    id: id(),
    name: "Dez Dominios",
    slug: "mastery-10",
    description: "Domine 10 habilidades",
    iconUrl: "/badges/mastery-10.svg",
    category: "mastery",
    condition: { type: "mastery", value: 10 },
    xpReward: 500,
  },
  {
    id: id(),
    name: "Cinquenta Dominios",
    slug: "mastery-50",
    description: "Domine 50 habilidades",
    iconUrl: "/badges/mastery-50.svg",
    category: "mastery",
    condition: { type: "mastery", value: 50 },
    xpReward: 2000,
  },
  {
    id: id(),
    name: "Cem Dominios",
    slug: "mastery-100",
    description: "Domine 100 habilidades",
    iconUrl: "/badges/mastery-100.svg",
    category: "mastery",
    condition: { type: "mastery", value: 100 },
    xpReward: 5000,
  },
];

// Special badges
const specialBadges: BadgeSeed[] = [
  {
    id: id(),
    name: "Primeiro Acesso",
    slug: "first-login",
    description: "Faca seu primeiro login na plataforma",
    iconUrl: "/badges/first-login.svg",
    category: "special",
    condition: { type: "login", value: 1 },
    xpReward: 25,
  },
  {
    id: id(),
    name: "Primeiro Exercicio",
    slug: "first-exercise",
    description: "Complete seu primeiro exercicio",
    iconUrl: "/badges/first-exercise.svg",
    category: "special",
    condition: { type: "exercise", value: 1 },
    xpReward: 25,
  },
  {
    id: id(),
    name: "Curso Completo",
    slug: "first-course-complete",
    description: "Complete um curso inteiro",
    iconUrl: "/badges/first-course.svg",
    category: "special",
    condition: { type: "course_complete", value: 1 },
    xpReward: 500,
  },
  {
    id: id(),
    name: "Quiz Perfeito",
    slug: "perfect-quiz",
    description: "Acerte todas as questoes de um quiz sem errar",
    iconUrl: "/badges/perfect-quiz.svg",
    category: "special",
    condition: { type: "perfect_quiz", value: 1 },
    xpReward: 200,
  },
];

export const allBadges: BadgeSeed[] = [
  ...streakBadges,
  ...xpBadges,
  ...masteryBadges,
  ...specialBadges,
];

/**
 * Returns badge seed data formatted for Supabase insert.
 * Uses snake_case keys matching the database columns.
 */
export function getBadgeSeedRows() {
  return allBadges.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description,
    icon_url: b.iconUrl,
    category: b.category,
    condition: b.condition,
    xp_reward: b.xpReward,
  }));
}
