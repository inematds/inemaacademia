import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-auth";
import { unitSchema } from "@/lib/admin-content";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const parsed = unitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, slug, description, courseId } = parsed.data;

  const { error } = await auth.supabase
    .from("units")
    .update({ name, slug: slug || slugify(name), description: description || null, course_id: courseId })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const { count } = await auth.supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("unit_id", id);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Remova ou mova as licoes desta unidade antes de exclui-la." },
      { status: 409 },
    );
  }

  const { error } = await auth.supabase.from("units").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
