import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-auth";
import { lessonSchema, saveLessonContent } from "@/lib/admin-content";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const parsed = lessonSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const { error } = await auth.supabase
    .from("lessons")
    .update({
      name: input.name,
      slug: input.slug || slugify(input.name),
      description: input.description || null,
      type: input.type,
      unit_id: input.unitId,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const contentError = await saveLessonContent(auth.supabase, id, input);
  if (contentError) return NextResponse.json({ error: contentError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const { count } = await auth.supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", id);
  if ((count ?? 0) > 0) {
    // Licao ja estudada: desativa em vez de apagar, para nao perder o historico.
    const { error } = await auth.supabase.from("lessons").update({ is_active: false }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, deactivated: true });
  }

  await auth.supabase.from("lesson_content").delete().eq("lesson_id", id);
  const { error } = await auth.supabase.from("lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
