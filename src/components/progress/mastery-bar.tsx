"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import type { MasteryLevel } from "@/services/mastery";
import { cn } from "@/lib/utils";

const MASTERY_CONFIG: Record<
  MasteryLevel,
  { label: string; color: string; bgColor: string; percentage: number; glowColor: string }
> = {
  not_started: {
    label: "Nao iniciado",
    color: "#9CA3AF",
    bgColor: "bg-gray-200 dark:bg-gray-700",
    percentage: 0,
    glowColor: "rgba(156, 163, 175, 0)",
  },
  familiar: {
    label: "Familiar",
    color: "#F59E0B",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    percentage: 33,
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  proficient: {
    label: "Proficiente",
    color: "#3B82F6",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    percentage: 66,
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  mastered: {
    label: "Dominado",
    color: "#10B981",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    percentage: 100,
    glowColor: "rgba(16, 185, 129, 0.5)",
  },
};

interface MasteryBarProps {
  level: MasteryLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onLevelUp?: () => void;
}

export function MasteryBar({
  level,
  showLabel = true,
  size = "md",
  className,
  onLevelUp,
}: MasteryBarProps) {
  const config = MASTERY_CONFIG[level];
  const [previousLevel, setPreviousLevel] = useState<MasteryLevel>(level);
  const [showGlow, setShowGlow] = useState(false);

  const springValue = useSpring(MASTERY_CONFIG[previousLevel].percentage, {
    stiffness: 120,
    damping: 20,
    mass: 1,
  });

  const width = useTransform(springValue, (v) => `${v}%`);

  useEffect(() => {
    const prevOrder = getMasteryOrder(previousLevel);
    const currOrder = getMasteryOrder(level);

    springValue.set(config.percentage);

    if (currOrder > prevOrder && previousLevel !== level) {
      setShowGlow(true);
      onLevelUp?.();
      const timer = setTimeout(() => setShowGlow(false), 1500);
      return () => clearTimeout(timer);
    }

    setPreviousLevel(level);
  }, [level, config.percentage, springValue, previousLevel, onLevelUp]);

  useEffect(() => {
    setPreviousLevel(level);
  }, [level]);

  const heightClass = size === "sm" ? "h-1.5" : size === "md" ? "h-2.5" : "h-4";
  const textClass = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className={cn("mb-1 flex items-center justify-between", textClass)}>
          <motion.span
            className="font-medium"
            style={{ color: config.color }}
            initial={false}
            animate={{ color: config.color }}
            transition={{ duration: 0.5 }}
          >
            {config.label}
          </motion.span>
          <span className="text-muted-foreground">
            {config.percentage}%
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full",
          config.bgColor,
          heightClass,
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width,
            backgroundColor: config.color,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />

        {showGlow && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, boxShadow: `0 0 0px ${config.glowColor}` }}
            animate={{
              opacity: [0, 1, 0],
              boxShadow: [
                `0 0 4px ${config.glowColor}`,
                `0 0 20px ${config.glowColor}`,
                `0 0 4px ${config.glowColor}`,
              ],
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}

        {showGlow && (
          <Particles color={config.color} />
        )}
      </div>
    </div>
  );
}

function Particles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-visible">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            backgroundColor: color,
            right: 0,
            top: "50%",
          }}
          initial={{
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [1, 0],
            scale: [0, 1.5],
            x: [0, (Math.random() - 0.5) * 40],
            y: [0, (Math.random() - 0.5) * 30],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function getMasteryOrder(level: MasteryLevel): number {
  const order: Record<MasteryLevel, number> = {
    not_started: 0,
    familiar: 1,
    proficient: 2,
    mastered: 3,
  };
  return order[level];
}
