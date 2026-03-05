import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AssignContentClient } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssignContentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify class belongs to teacher
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) notFound();

  // Load content hierarchy for browsing
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("order", { ascending: true });

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, slug, subject_id")
    .eq("is_active", true)
    .order("order", { ascending: true });

  const { data: units } = await supabase
    .from("units")
    .select("id, name, slug, course_id")
    .eq("is_active", true)
    .order("order", { ascending: true });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, name, slug, unit_id, type")
    .eq("is_active", true)
    .order("order", { ascending: true });

  const contentTree = (subjects ?? []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    name: s.name as string,
    courses: (courses ?? [])
      .filter((c: Record<string, unknown>) => c.subject_id === s.id)
      .map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        units: (units ?? [])
          .filter((u: Record<string, unknown>) => u.course_id === c.id)
          .map((u: Record<string, unknown>) => ({
            id: u.id as string,
            name: u.name as string,
            lessons: (lessons ?? [])
              .filter(
                (l: Record<string, unknown>) => l.unit_id === u.id
              )
              .map((l: Record<string, unknown>) => ({
                id: l.id as string,
                name: l.name as string,
                type: l.type as string,
              })),
          })),
      })),
  }));

  return (
    <AssignContentClient
      classId={id}
      className={cls.name as string}
      contentTree={contentTree}
    />
  );
}
