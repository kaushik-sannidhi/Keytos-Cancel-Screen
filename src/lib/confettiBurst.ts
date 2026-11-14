"use client";

import confetti from "canvas-confetti";

export function fireEvilConfetti(): void {
  if (typeof window === "undefined") return;
  try {
    void confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.58 },
      colors: ["#10b981", "#6366f1", "#f59e0b", "#ec4899"],
    });
    setTimeout(() => {
      void confetti({
        particleCount: 55,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.65 },
      });
      void confetti({
        particleCount: 55,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.65 },
      });
    }, 160);
  } catch {
    // ignore canvas-confetti failures in headless environments
  }
}
