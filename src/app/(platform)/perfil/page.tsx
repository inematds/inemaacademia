import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Perfil | INEMA Academia",
};

const gradeLevelLabels: Record<string, string> = {
  "6-fund": "6o ano (Fundamental)",
  "7-fund": "7o ano (Fundamental)",
  "8-fund": "8o ano (Fundamental)",
  "9-fund": "9o ano (Fundamental)",
  "1-em": "1o ano (Ensino Medio)",
  "2-em": "2o ano (Ensino Medio)",
  "3-em": "3o ano (Ensino Medio)",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, role, grade_level")
      .eq("id", user.id)
      .single(),
    supabase
      .from("student_stats")
      .select("total_xp, current_streak, level")
      .eq("student_id", user.id)
      .single(),
  ]);

  return (
    <ProfileForm
      userId={user.id}
      email={user.email ?? ""}
      fullName={profile?.full_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
      role={profile?.role ?? "aluno"}
      gradeLevel={profile?.grade_level ?? null}
      gradeLevelLabels={gradeLevelLabels}
      stats={{
        totalXp: stats?.total_xp ?? 0,
        currentStreak: stats?.current_streak ?? 0,
        level: stats?.level ?? 1,
      }}
    />
  );
}
