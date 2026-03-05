export const APP_NAME = "INEMA Academia";

export const ROLES = {
  aluno: "aluno",
  professor: "professor",
  admin: "admin",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];
