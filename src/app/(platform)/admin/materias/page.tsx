import { createClient } from "@/lib/supabase/server";
import { SubjectsAdmin } from "./subjects-admin";

export const metadata = {
  title: "Gerenciar Materias | INEMA Academia",
};

export default async function AdminSubjectsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subjects")
    .select("id, name, slug, description, icon, color, category, order, is_active, created_at")
    .order("order");

  const subjectsList = (data ?? []).map((s) => ({
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

  return <SubjectsAdmin initialSubjects={subjectsList} />;
}
