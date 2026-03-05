import confetti from "canvas-confetti";

export function triggerConfetti() {
  confetti({
    particleCount: 120,
    spread: 75,
    origin: { y: 0.6 },
  });
}
