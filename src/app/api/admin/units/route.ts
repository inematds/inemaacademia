import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-auth";
import { unitSchema } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const parsed = unitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, slug, description, courseId } = parsed.data;

  const { data: last } = await supabase
    .from("units")
    .select("order")
    .eq("course_id", courseId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("units")
    .insert({
      course_id: courseId,
      name,
      slug: slug || slugify(name),
      description: description || null,
      order: (last?.order ?? 0) + 1,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
