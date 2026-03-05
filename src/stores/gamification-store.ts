import { create } from "zustand";

interface LevelUpEvent {
  level: number;
  timestamp: number;
}

interface GamificationState {
  xp: number;
  level: number;
  pendingLevelUps: LevelUpEvent[];
  showingLevelUp: boolean;
  currentLevelUp: LevelUpEvent | null;

  setXp: (xp: number) => void;
  setLevel: (level: number) => void;
  addLevelUp: (level: number) => void;
  showLevelUp: () => void;
  hideLevelUp: () => void;
  processLevelUp: (newLevel: number, oldLevel: number) => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xp: 0,
  level: 1,
  pendingLevelUps: [],
  showingLevelUp: false,
  currentLevelUp: null,

  setXp: (xp) => set({ xp }),

  setLevel: (level) => set({ level }),

  addLevelUp: (level) =>
    set((state) => ({
      pendingLevelUps: [
        ...state.pendingLevelUps,
        { level, timestamp: Date.now() },
      ],
    })),

  showLevelUp: () => {
    const { pendingLevelUps } = get();
    if (pendingLevelUps.length === 0) return;

    const [next, ...rest] = pendingLevelUps;
    set({
      showingLevelUp: true,
      currentLevelUp: next,
      pendingLevelUps: rest,
    });
  },

  hideLevelUp: () => {
    set({
      showingLevelUp: false,
      currentLevelUp: null,
    });

    // Show next level up if pending
    setTimeout(() => {
      const { pendingLevelUps } = get();
      if (pendingLevelUps.length > 0) {
        get().showLevelUp();
      }
    }, 300);
  },

  processLevelUp: (newLevel, oldLevel) => {
    if (newLevel <= oldLevel) return;

    for (let l = oldLevel + 1; l <= newLevel; l++) {
      get().addLevelUp(l);
    }

    set({ level: newLevel });

    // Trigger display
    if (!get().showingLevelUp) {
      get().showLevelUp();
    }
  },
}));
