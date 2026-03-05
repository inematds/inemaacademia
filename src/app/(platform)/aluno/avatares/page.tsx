import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvatarSelector } from "./avatar-selector";

export const metadata = {
  title: "Avatares | INEMA Academia",
};

export default async function AvatarsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const { data: stats } = await supabase
    .from("student_stats")
    .select("total_xp, level")
    .eq("student_id", user.id)
    .single();

  const { data: allAvatars } = await supabase
    .from("avatars")
    .select("*")
    .order("required_level", { ascending: true });

  const { data: ownedAvatars } = await supabase
    .from("student_avatars")
    .select("avatar_id, is_active")
    .eq("student_id", user.id);

  const ownedSet = new Set(
    (ownedAvatars ?? []).map((a: Record<string, unknown>) => a.avatar_id as string)
  );
  const activeAvatarId = (ownedAvatars ?? []).find(
    (a: Record<string, unknown>) => a.is_active === true
  )?.avatar_id as string | undefined;

  const avatars = (allAvatars ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    name: a.name as string,
    imageUrl: a.image_url as string,
    requiredXp: a.required_xp as number,
    requiredLevel: a.required_level as number,
    owned: ownedSet.has(a.id as string),
    isActive: (a.id as string) === activeAvatarId,
    canUnlock:
      (stats?.total_xp ?? 0) >= (a.required_xp as number) &&
      (stats?.level ?? 1) >= (a.required_level as number),
  }));

  return (
    <AvatarSelector
      avatars={avatars}
      currentAvatarUrl={profile?.avatar_url ?? null}
      userXp={stats?.total_xp ?? 0}
      userLevel={stats?.level ?? 1}
    />
  );
}
