"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Acesso negado");
  }

  return { user, supabase };
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
  const { supabase } = await requireAdmin();
  const validated = subjectSchema.parse(data);

  const { data: result, error } = await supabase
    .from("subjects")
    .insert({
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      icon: validated.icon ?? null,
      color: validated.color ?? null,
      order: validated.order,
      is_active: validated.isActive,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true, data: result };
}

export async function updateSubject(id: string, data: SubjectFormData) {
  const { supabase } = await requireAdmin();
  const validated = subjectSchema.parse(data);

  const { data: result, error } = await supabase
    .from("subjects")
    .update({
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      icon: validated.icon ?? null,
      color: validated.color ?? null,
      order: validated.order,
      is_active: validated.isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true, data: result };
}

export async function deleteSubject(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true };
}

export async function toggleSubjectActive(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("subjects")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true };
}

export async function reorderSubjects(orderedIds: string[]) {
  const { supabase } = await requireAdmin();

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("subjects")
      .update({ order: i + 1 })
      .eq("id", orderedIds[i]);
  }

  revalidatePath("/admin/materias");
  revalidatePath("/materias");

  return { success: true };
}

// ---------------------------------------------------------------------------
// Course CRUD
// ---------------------------------------------------------------------------

export async function createCourse(data: CourseFormData) {
  const { supabase } = await requireAdmin();
  const validated = courseSchema.parse(data);

  const { data: result, error } = await supabase
    .from("courses")
    .insert({
      subject_id: validated.subjectId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      thumbnail_url: validated.thumbnailUrl ?? null,
      order: validated.order,
      is_active: validated.isActive,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true, data: result };
}

export async function updateCourse(id: string, data: CourseFormData) {
  const { supabase } = await requireAdmin();
  const validated = courseSchema.parse(data);

  const { data: result, error } = await supabase
    .from("courses")
    .update({
      subject_id: validated.subjectId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description ?? null,
      thumbnail_url: validated.thumbnailUrl ?? null,
      order: validated.order,
      is_active: validated.isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true, data: result };
}

export async function deleteCourse(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true };
}

export async function toggleCourseActive(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("courses")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/cursos");
  revalidatePath("/materias");

  return { success: true };
}
