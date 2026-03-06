import { createClient } from "@/lib/supabase/server";
import { CoursesAdmin } from "./courses-admin";

export const metadata = {
  title: "Gerenciar Cursos | INEMA Academia",
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const [{ data: coursesData }, { data: subjectsData }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, subject_id, name, slug, description, thumbnail_url, order, is_active, created_at, subjects(name, slug)")
      .order("order"),
    supabase
      .from("subjects")
      .select("id, name, slug, description, icon, color, category, order, is_active, created_at")
      .order("order"),
  ]);

  const coursesList = (coursesData ?? []).map((c: Record<string, unknown>) => {
    const subj = c.subjects as { name: string; slug: string } | null;
    return {
      id: c.id as string,
      subjectId: c.subject_id as string,
      name: c.name as string,
      slug: c.slug as string,
      description: c.description as string | null,
      thumbnailUrl: c.thumbnail_url as string | null,
      order: c.order as number,
      isActive: c.is_active as boolean,
      createdAt: new Date(c.created_at as string),
      subjectName: subj?.name ?? null,
      subjectSlug: subj?.slug ?? null,
    };
  });

  const subjectsList = (subjectsData ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    icon: s.icon,
    color: s.color,
    category: s.category,
    order: s.order,
    isActive: s.is_active,
    createdAt: new Date(s.created_at),
  }));

  return (
    <CoursesAdmin initialCourses={coursesList} subjects={subjectsList} />
  );
}
