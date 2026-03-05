"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { subjects, courses } from "@/db/schema/content";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/db/queries/content";

// ---------------------------------------------------------------------------
// Auth check helper
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nao autenticado");
  }

  const profile = await getUserProfile(user.id);
  if (!profile || profile.role !== "admin") {
    throw new Error("Acesso negado");
  }

  return user;
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const subjectSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  slug: z.string().min(1, "Slug e obrigatorio").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const courseSchema = z.object({
  subjectId: z.string().uuid("Materia e obrigatoria"),
  name: z.string().min(1, "Nome e obrigatorio"),
  slug: z.string().min(1, "Slug e obrigatorio").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;

// ---------------------------------------------------------------------------
// Subject CRUD
// ---------------------------------------------------------------------------

export async function createSubject(data: SubjectFormData) {
  await requireAdmin();

  const validated = subjectSchema.parse(data);

  const result = await db
    .insert(subjects)
    .values({
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      icon: validated.icon ?? null,
      color: validated.color ?? null,
      order: validated.order,
      isActive: validated.isActive,
    })
    .returning();

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true, data: result[0] };
}

export async function updateSubject(id: string, data: SubjectFormData) {
  await requireAdmin();

  const validated = subjectSchema.parse(data);

  const result = await db
    .update(subjects)
    .set({
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      icon: validated.icon ?? null,
      color: validated.color ?? null,
      order: validated.order,
      isActive: validated.isActive,
    })
    .where(eq(subjects.id, id))
    .returning();

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true, data: result[0] };
}

export async function deleteSubject(id: string) {
  await requireAdmin();

  await db.delete(subjects).where(eq(subjects.id, id));

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true };
}

export async function toggleSubjectActive(id: string, isActive: boolean) {
  await requireAdmin();

  await db
    .update(subjects)
    .set({ isActive })
    .where(eq(subjects.id, id));

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true };
}

export async function reorderSubjects(orderedIds: string[]) {
  await requireAdmin();

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(subjects)
      .set({ order: i + 1 })
      .where(eq(subjects.id, orderedIds[i]));
  }

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true };
}

// ---------------------------------------------------------------------------
// Course CRUD
// ---------------------------------------------------------------------------

export async function createCourse(data: CourseFormData) {
  await requireAdmin();

  const validated = courseSchema.parse(data);

  const result = await db
    .insert(courses)
    .values({
      subjectId: validated.subjectId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      thumbnailUrl: validated.thumbnailUrl ?? null,
      order: validated.order,
      isActive: validated.isActive,
    })
    .returning();

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true, data: result[0] };
}

export async function updateCourse(id: string, data: CourseFormData) {
  await requireAdmin();

  const validated = courseSchema.parse(data);

  const result = await db
    .update(courses)
    .set({
      subjectId: validated.subjectId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      thumbnailUrl: validated.thumbnailUrl ?? null,
      order: validated.order,
      isActive: validated.isActive,
    })
    .where(eq(courses.id, id))
    .returning();

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true, data: result[0] };
}

export async function deleteCourse(id: string) {
  await requireAdmin();

  await db.delete(courses).where(eq(courses.id, id));

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true };
}

export async function toggleCourseActive(id: string, isActive: boolean) {
  await requireAdmin();

  await db
    .update(courses)
    .set({ isActive })
    .where(eq(courses.id, id));

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true };
}
