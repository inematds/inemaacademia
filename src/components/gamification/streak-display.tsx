"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  activityDates?: string[];
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  activityDates = [],
  className,
}: StreakDisplayProps) {
  const isActive = currentStreak > 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Streak counter */}
      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          animate={
            isActive
              ? {
                  scale: [1, 1.15, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Flame
            className={cn(
              "h-8 w-8",
              isActive ? "text-orange-500" : "text-gray-400",
            )}
          />
          {isActive && (
            <motion.div
              className="absolute -inset-1 -z-10 rounded-full bg-orange-400/30 blur-md"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>

        <div>
          <motion.p
            className="text-2xl font-bold text-foreground"
            key={currentStreak}
            initial={{ scale: 1.3, color: "#F97316" }}
            animate={{ scale: 1, color: "var(--color-foreground, #000)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
          </motion.p>
          <p className="text-xs text-muted-foreground">
            Recorde: {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
          </p>
        </div>
      </div>

      {/* Activity calendar */}
      <ActivityCalendar activityDates={activityDates} />
    </div>
  );
}

interface ActivityCalendarProps {
  activityDates: string[];
}

function ActivityCalendar({ activityDates }: ActivityCalendarProps) {
  const today = new Date();
  const weeks = 15;
  const totalDays = weeks * 7;

  // Count activities per day for intensity
  const activityCounts = new Map<string, number>();
  for (const d of activityDates) {
    activityCounts.set(d, (activityCounts.get(d) ?? 0) + 1);
  }

  // Generate calendar cells going back from today
  const cells: Array<{ date: string; level: number; dayOfWeek: number }> = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = activityCounts.get(dateStr) ?? 0;

    let level = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 5) level = 3;
    if (count >= 8) level = 4;

    cells.push({
      date: dateStr,
      level,
      dayOfWeek: date.getDay(),
    });
  }

  // Group by weeks
  const weekGroups: typeof cells[] = [];
  let currentWeek: typeof cells = [];

  for (const cell of cells) {
    currentWeek.push(cell);
    if (cell.dayOfWeek === 6) {
      weekGroups.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weekGroups.push(currentWeek);
  }

  const levelColors = [
    "bg-gray-100 dark:bg-gray-800",
    "bg-green-200 dark:bg-green-900",
    "bg-green-400 dark:bg-green-700",
    "bg-green-500 dark:bg-green-600",
    "bg-green-700 dark:bg-green-500",
  ];

  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="flex h-[12px] w-[12px] items-center justify-center text-[8px] text-muted-foreground"
            >
              {i % 2 === 1 ? label : ""}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weekGroups.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-[3px]">
            {/* Pad the first week if it doesn't start on Sunday */}
            {weekIdx === 0 &&
              week[0] &&
              Array.from({ length: week[0].dayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} className="h-[12px] w-[12px]" />
              ))}

            {week.map((cell) => (
              <TooltipProvider key={cell.date} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className={cn(
                        "h-[12px] w-[12px] rounded-[2px]",
                        levelColors[cell.level],
                      )}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: weekIdx * 0.02,
                        duration: 0.15,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>
                      {formatDateBR(cell.date)}
                      {cell.level > 0
                        ? ` - ${activityCounts.get(cell.date) ?? 0} atividades`
                        : " - Sem atividade"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Menos</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className={cn("h-[10px] w-[10px] rounded-[2px]", color)}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}

function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
