import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "@/components/ui/sonner";
import { PlatformShell } from "./platform-shell";
import { PushNotificationPrompt } from "@/components/push-notification-prompt";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("student_stats")
      .select("total_xp, current_streak, level")
      .eq("student_id", user.id)
      .single(),
  ]);

  return (
    <PlatformShell
      user={{
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name ?? "Estudante",
        avatarUrl: profile?.avatar_url ?? null,
        role: profile?.role ?? "aluno",
      }}
      stats={{
        totalXp: stats?.total_xp ?? 0,
        currentStreak: stats?.current_streak ?? 0,
        level: stats?.level ?? 1,
      }}
    >
      {children}
      <Toaster position="top-center" richColors />
      <PushNotificationPrompt />
    </PlatformShell>
  );
}
