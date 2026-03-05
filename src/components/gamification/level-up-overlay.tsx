"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerConfetti } from "@/lib/animations";
import { useGamificationStore } from "@/stores/gamification-store";

export function LevelUpOverlay() {
  const showingLevelUp = useGamificationStore((s) => s.showingLevelUp);
  const currentLevelUp = useGamificationStore((s) => s.currentLevelUp);
  const hideLevelUp = useGamificationStore((s) => s.hideLevelUp);

  const dismiss = useCallback(() => {
    hideLevelUp();
  }, [hideLevelUp]);

  useEffect(() => {
    if (!showingLevelUp || !currentLevelUp) return;

    triggerConfetti();

    const timer = setTimeout(() => {
      dismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [showingLevelUp, currentLevelUp, dismiss]);

  return (
    <AnimatePresence>
      {showingLevelUp && currentLevelUp && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 px-8 py-12"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              mass: 0.8,
            }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-20 rounded-full bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Star icon */}
            <motion.div
              className="relative mb-2 text-6xl"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: 0.2,
              }}
            >
              <span className="drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]">
                &#11088;
              </span>
            </motion.div>

            {/* "Novo nivel" text */}
            <motion.p
              className="text-lg font-medium tracking-widest text-amber-300 uppercase"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Novo nivel!
            </motion.p>

            {/* Level number */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 12,
                delay: 0.4,
              }}
            >
              <h1 className="bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-8xl font-black text-transparent drop-shadow-lg sm:text-9xl">
                {currentLevelUp.level}
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="max-w-xs text-center text-base text-white/80"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Parabens! Voce alcancou o nivel {currentLevelUp.level}. Continue assim!
            </motion.p>

            {/* Tap to dismiss */}
            <motion.p
              className="mt-4 text-xs text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Toque para fechar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
