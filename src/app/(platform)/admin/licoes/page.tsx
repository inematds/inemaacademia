import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonsAdmin } from "./lessons-admin";

export const metadata = {
  title: "Gerenciar Licoes | INEMA Academia",
};

export default async function AdminLessonsPage() {
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

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, units(name, courses(name, subjects(name)))")
    .order("order", { ascending: true });

  const { data: units } = await supabase
    .from("units")
    .select("id, name, course_id, courses(name, subject_id, subjects(name))")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const formattedLessons = (lessons ?? []).map((l: Record<string, unknown>) => {
    const unit = l.units as Record<string, unknown> | null;
    const course = unit?.courses as Record<string, unknown> | null;
    const subject = course?.subjects as Record<string, unknown> | null;

    return {
      id: l.id as string,
      name: l.name as string,
      slug: l.slug as string,
      type: l.type as string,
      unitId: l.unit_id as string,
      order: l.order as number,
      isActive: l.is_active as boolean,
      unitName: (unit?.name as string) ?? "",
      courseName: (course?.name as string) ?? "",
      subjectName: (subject?.name as string) ?? "",
    };
  });

  const formattedUnits = (units ?? []).map((u: Record<string, unknown>) => {
    const course = u.courses as Record<string, unknown> | null;
    const subject = course?.subjects as Record<string, unknown> | null;
    return {
      id: u.id as string,
      name: u.name as string,
      courseName: (course?.name as string) ?? "",
      subjectName: (subject?.name as string) ?? "",
    };
  });

  return <LessonsAdmin initialLessons={formattedLessons} units={formattedUnits} />;
}
