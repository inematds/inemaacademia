import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UnitsAdmin } from "./units-admin";

export const metadata = {
  title: "Gerenciar Unidades | INEMA Academia",
};

export default async function AdminUnitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/aluno");

  const { data: units } = await supabase
    .from("units")
    .select("*")
    .order("order", { ascending: true });

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, subject_id, subjects(name)")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const formattedUnits = (units ?? []).map((u: Record<string, unknown>) => ({
    id: u.id as string,
    name: u.name as string,
    slug: u.slug as string,
    description: (u.description as string) ?? null,
    courseId: u.course_id as string,
    order: u.order as number,
    isActive: u.is_active as boolean,
  }));

  const formattedCourses = (courses ?? []).map((c: Record<string, unknown>) => {
    const subject = c.subjects as Record<string, unknown> | null;
    return {
      id: c.id as string,
      name: c.name as string,
      subjectName: (subject?.name as string) ?? "",
    };
  });

  return <UnitsAdmin initialUnits={formattedUnits} courses={formattedCourses} />;
}
