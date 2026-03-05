import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/aluno";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For OAuth signups, ensure profile exists
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          await supabase.from("profiles").insert({
            id: user.id,
            full_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              "Usuário",
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role: "aluno",
          });
        }

        // Determine redirect based on role
        if (next === "/aluno" || next === "/") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          const role = profile?.role ?? "aluno";
          switch (role) {
            case "professor":
              return NextResponse.redirect(`${origin}/professor`);
            case "admin":
              return NextResponse.redirect(`${origin}/admin`);
            default:
              return NextResponse.redirect(`${origin}/aluno`);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
