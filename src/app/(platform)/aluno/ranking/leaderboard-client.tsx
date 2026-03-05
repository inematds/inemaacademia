"use client";

import { motion } from "framer-motion";
import { Crown, Medal, Trophy, Flame, Zap, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface RankingEntry {
  studentId: string;
  totalXp: number;
  level: number;
  currentStreak?: number;
  fullName: string;
  avatarUrl: string | null;
}

interface LeaderboardClientProps {
  currentUserId: string;
  allTimeRanking: RankingEntry[];
  classRanking: RankingEntry[];
  className_: string | null;
}

const podiumColors = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-orange-700",
];

const podiumIcons = [Crown, Medal, Medal];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LeaderboardClient({
  currentUserId,
  allTimeRanking,
  classRanking,
  className_,
}: LeaderboardClientProps) {
  const hasClassData = classRanking.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Ranking
        </h1>
        <p className="text-muted-foreground">
          Veja como voce se compara com outros estudantes
        </p>
      </div>

      <Tabs defaultValue="all-time" className="w-full">
        <TabsList>
          <TabsTrigger value="all-time" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            Geral
          </TabsTrigger>
          {hasClassData && (
            <TabsTrigger value="class" className="gap-1.5">
              <Star className="h-4 w-4" />
              {className_ ?? "Turma"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all-time">
          <RankingList
            entries={allTimeRanking}
            currentUserId={currentUserId}
          />
        </TabsContent>

        {hasClassData && (
          <TabsContent value="class">
            <RankingList
              entries={classRanking}
              currentUserId={currentUserId}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function RankingList({
  entries,
  currentUserId,
}: {
  entries: RankingEntry[];
  currentUserId: string;
}) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Nenhum estudante no ranking ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  const top3 = entries.slice(0, 3);
  const _rest = entries.slice(3);

  // Find current user position
  const userIndex = entries.findIndex((e) => e.studentId === currentUserId);

  return (
    <div className="space-y-4">
      {/* Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-2 pb-4 sm:gap-4">
          {/* 2nd place */}
          <PodiumCard entry={top3[1]} rank={2} isCurrentUser={top3[1].studentId === currentUserId} />
          {/* 1st place */}
          <PodiumCard entry={top3[0]} rank={1} isCurrentUser={top3[0].studentId === currentUserId} />
          {/* 3rd place */}
          <PodiumCard entry={top3[2]} rank={3} isCurrentUser={top3[2].studentId === currentUserId} />
        </div>
      )}

      {/* Rest of the list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Classificacao</CardTitle>
          <CardDescription>Top 50 estudantes por XP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 px-2 sm:px-6">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isCurrentUser = entry.studentId === currentUserId;

            return (
              <motion.div
                key={entry.studentId}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  isCurrentUser
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-muted/50",
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                {/* Rank */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {rank <= 3 ? (
                    <RankMedal rank={rank} />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt="" />}
                  <AvatarFallback className="text-xs">
                    {getInitials(entry.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm",
                      isCurrentUser ? "font-bold" : "font-medium",
                    )}
                  >
                    {entry.fullName}
                    {isCurrentUser && (
                      <span className="ml-1.5 text-xs text-primary">
                        (voce)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nivel {entry.level}
                  </p>
                </div>

                {/* Streak */}
                {entry.currentStreak !== undefined && entry.currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-500">
                    <Flame className="h-3.5 w-3.5" />
                    {entry.currentStreak}
                  </div>
                )}

                {/* XP */}
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-purple-500" />
                  {entry.totalXp.toLocaleString("pt-BR")}
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Current user position if not in top 50 */}
      {userIndex === -1 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Voce ainda nao esta no ranking. Continue estudando para aparecer aqui!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: RankingEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const Icon = podiumIcons[rank - 1] ?? Medal;
  const heightClass = rank === 1 ? "h-32" : rank === 2 ? "h-24" : "h-20";

  return (
    <motion.div
      className={cn(
        "flex w-24 flex-col items-center gap-1 sm:w-28",
        isCurrentUser && "ring-2 ring-primary rounded-xl",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: "spring" }}
    >
      {/* Avatar with crown/medal */}
      <div className="relative">
        <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-amber-400 sm:h-14 sm:w-14">
          {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt="" />}
          <AvatarFallback>{getInitials(entry.fullName)}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-white",
            podiumColors[rank - 1],
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Name */}
      <p className="w-full truncate text-center text-xs font-semibold">
        {entry.fullName}
      </p>

      {/* XP */}
      <p className="text-xs font-medium text-purple-500">
        {entry.totalXp.toLocaleString("pt-BR")} XP
      </p>

      {/* Podium block */}
      <div
        className={cn(
          "w-full rounded-t-lg bg-gradient-to-br",
          podiumColors[rank - 1],
          heightClass,
        )}
      >
        <p className="pt-2 text-center text-2xl font-black text-white/90">
          {rank}
        </p>
      </div>
    </motion.div>
  );
}

function RankMedal({ rank }: { rank: number }) {
  const colors = [
    "text-yellow-500",
    "text-gray-400",
    "text-amber-600",
  ];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, delay: rank * 0.1 }}
    >
      {rank === 1 ? (
        <Crown className={cn("h-5 w-5", colors[rank - 1])} />
      ) : (
        <Medal className={cn("h-5 w-5", colors[rank - 1])} />
      )}
    </motion.div>
  );
}
