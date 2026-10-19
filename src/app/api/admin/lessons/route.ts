import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-auth";
import { lessonSchema, saveLessonContent } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const parsed = lessonSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const { data: last } = await supabase
    .from("lessons")
    .select("order")
    .eq("unit_id", input.unitId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      unit_id: input.unitId,
      name: input.name,
      slug: input.slug || slugify(input.name),
      description: input.description || null,
      type: input.type,
      order: (last?.order ?? 0) + 1,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const contentError = await saveLessonContent(supabase, data.id, input);
  if (contentError) return NextResponse.json({ error: contentError.message }, { status: 400 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
