import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Garante usuario autenticado com role admin para as rotas /api/admin/*.
 * Retorna o client (sujeito ao RLS) ou uma resposta de erro pronta.
 */
export async function requireAdmin(): Promise<
  { supabase: SupabaseServer; error?: undefined } | { supabase?: undefined; error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Nao autorizado" }, { status: 401 }) };
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 }),
    };
  }
  return { supabase };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
