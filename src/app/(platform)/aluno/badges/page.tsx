import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BadgesPageClient } from "./badges-client";

export const metadata = {
  title: "Conquistas | INEMA Academia",
};

export default async function BadgesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentId = user.id;

  // Get all badges
  const { data: allBadges } = await supabase
    .from("badges")
    .select("id, name, slug, description, icon_url, category, condition, xp_reward")
    .order("category")
    .order("xp_reward");

  // Get student's earned badges
  const { data: earnedBadges } = await supabase
    .from("student_badges")
    .select("badge_id, earned_at")
    .eq("student_id", studentId);

  const earnedMap = new Map(
    (earnedBadges ?? []).map((eb) => [eb.badge_id, eb.earned_at]),
  );

  const badgesData = (allBadges ?? []).map((badge) => ({
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    description: badge.description ?? "",
    iconUrl: badge.icon_url,
    category: badge.category as string,
    condition: badge.condition as Record<string, unknown> | null,
    xpReward: badge.xp_reward,
    earned: earnedMap.has(badge.id),
    earnedAt: earnedMap.get(badge.id) ?? null,
  }));

  return <BadgesPageClient badges={badgesData} />;
}
