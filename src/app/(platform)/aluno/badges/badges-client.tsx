"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Trophy, Zap, Flame, Target, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string | null;
  category: string;
  condition: Record<string, unknown> | null;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
}

interface BadgesPageClientProps {
  badges: BadgeData[];
}

const categories = [
  { key: "all", label: "Todas", icon: Trophy },
  { key: "streak", label: "Sequencia", icon: Flame },
  { key: "xp", label: "Experiencia", icon: Zap },
  { key: "mastery", label: "Dominio", icon: Target },
  { key: "special", label: "Especial", icon: Star },
];

const categoryColors: Record<string, string> = {
  streak: "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950",
  xp: "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-950",
  mastery: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
  special: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
  community: "border-pink-300 bg-pink-50 dark:border-pink-800 dark:bg-pink-950",
};

const categoryIconColors: Record<string, string> = {
  streak: "text-orange-500",
  xp: "text-purple-500",
  mastery: "text-emerald-500",
  special: "text-blue-500",
  community: "text-pink-500",
};

function getConditionHint(condition: Record<string, unknown> | null): string {
  if (!condition) return "";
  const type = condition.type as string;
  const value = condition.value as number;

  switch (type) {
    case "streak":
      return `Estude por ${value} dias seguidos`;
    case "xp":
      return `Acumule ${value.toLocaleString("pt-BR")} XP`;
    case "mastery":
      return `Domine ${value} habilidades`;
    case "login":
      return "Faca login na plataforma";
    case "exercise":
      return "Complete um exercicio";
    case "course_complete":
      return "Complete um curso inteiro";
    case "perfect_quiz":
      return "Acerte todas as questoes de um quiz";
    default:
      return "";
  }
}

export function BadgesPageClient({ badges }: BadgesPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBadges =
    selectedCategory === "all"
      ? badges
      : badges.filter((b) => b.category === selectedCategory);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Conquistas
        </h1>
        <p className="text-muted-foreground">
          {earnedCount} de {badges.length} conquistas desbloqueadas
        </p>
      </div>

      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="w-full flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.key} value={cat.key} className="gap-1.5">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {filteredBadges.map((badge, idx) => (
                  <AnimatedBadge
                    key={badge.id}
                    badge={badge}
                    index={idx}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredBadges.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                Nenhuma conquista nesta categoria.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AnimatedBadge({
  badge,
  index,
}: {
  badge: BadgeData;
  index: number;
}) {
  const CategoryIcon = getCategoryIcon(badge.category);
  const hint = getConditionHint(badge.condition);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 20 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all",
          badge.earned
            ? categoryColors[badge.category] ?? "border-gray-300"
            : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900",
          badge.earned && "hover:shadow-md",
        )}
      >
        <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
          {/* Icon */}
          <motion.div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              badge.earned
                ? "bg-white/80 dark:bg-black/20"
                : "bg-gray-200 dark:bg-gray-800",
            )}
            whileHover={badge.earned ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
            transition={{ duration: 0.4 }}
          >
            {badge.earned ? (
              <CategoryIcon
                className={cn(
                  "h-7 w-7",
                  categoryIconColors[badge.category] ?? "text-gray-500",
                )}
              />
            ) : (
              <Lock className="h-6 w-6 text-gray-400" />
            )}
          </motion.div>

          {/* Name */}
          <p
            className={cn(
              "text-sm font-semibold leading-tight",
              !badge.earned && "text-gray-400",
            )}
          >
            {badge.name}
          </p>

          {/* Description or hint */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {badge.earned ? badge.description : hint}
          </p>

          {/* XP reward */}
          <Badge
            variant={badge.earned ? "default" : "outline"}
            className="text-[10px]"
          >
            +{badge.xpReward} XP
          </Badge>

          {/* Earned date */}
          {badge.earned && badge.earnedAt && (
            <p className="text-[10px] text-muted-foreground">
              {formatDateBR(badge.earnedAt)}
            </p>
          )}

          {/* Shine effect for earned */}
          {badge.earned && (
            <motion.div
              className="absolute -inset-px rounded-xl bg-gradient-to-tr from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 2,
                delay: index * 0.1 + 1,
                ease: "easeInOut",
              }}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "streak":
      return Flame;
    case "xp":
      return Zap;
    case "mastery":
      return Target;
    case "special":
      return Star;
    default:
      return Trophy;
  }
}

function formatDateBR(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
