import { z } from "zod";
import type { requireAdmin } from "@/lib/admin-auth";

export const unitSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  courseId: z.guid(),
  // Serie da unidade (null = vale para todas). Filtra o que o aluno ve no curso.
  gradeLevel: z.enum(["6-fund", "7-fund", "8-fund", "9-fund", "1-em", "2-em", "3-em"]).optional().nullable(),
});

export const GRADE_LEVEL_LABELS: Record<string, string> = {
  "6-fund": "6º ano",
  "7-fund": "7º ano",
  "8-fund": "8º ano",
  "9-fund": "9º ano",
  "1-em": "1º EM",
  "2-em": "2º EM",
  "3-em": "3º EM",
};

export const lessonSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(["video", "article", "exercise", "quiz"]),
  unitId: z.guid(),
  videoUrl: z.string().max(2000).optional().nullable(),
  articleBody: z.string().max(500_000).optional().nullable(),
});

export type LessonInput = z.infer<typeof lessonSchema>;

type SupabaseServer = NonNullable<Awaited<ReturnType<typeof requireAdmin>>["supabase"]>;

/** Grava (ou substitui) o lesson_content de artigo/video da licao. */
export async function saveLessonContent(supabase: SupabaseServer, lessonId: string, input: LessonInput) {
  if (input.type !== "article" && input.type !== "video") return null;
  const row = {
    lesson_id: lessonId,
    content_type: input.type,
    article_body: input.type === "article" ? input.articleBody || null : null,
    video_url: input.type === "video" ? input.videoUrl || null : null,
  };
  const { data: existing } = await supabase
    .from("lesson_content")
    .select("id")
    .eq("lesson_id", lessonId)
    .limit(1)
    .maybeSingle();
  const { error } = existing
    ? await supabase.from("lesson_content").update(row).eq("id", existing.id)
    : await supabase.from("lesson_content").insert(row);
  return error;
}

