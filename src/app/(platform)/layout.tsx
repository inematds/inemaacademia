import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getUserStats } from "@/db/queries/content";
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

  const profile = await getUserProfile(user.id);
  const stats = await getUserStats(user.id);

  return (
    <PlatformShell
      user={{
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.fullName ?? "Estudante",
        avatarUrl: profile?.avatarUrl ?? null,
        role: profile?.role ?? "aluno",
      }}
      stats={{
        totalXp: stats?.totalXp ?? 0,
        currentStreak: stats?.currentStreak ?? 0,
        level: stats?.level ?? 1,
      }}
    >
      {children}
      <Toaster position="top-center" richColors />
      <PushNotificationPrompt />
    </PlatformShell>
  );
}
