"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Bot, Minimize2, Sparkles, TrendingUp, XCircle } from "lucide-react";
import {
  GauntletAction,
  GauntletStage,
} from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";
import { fireEvilConfetti } from "@/lib/confettiBurst";

interface RetentionBotProps {
  stage: GauntletStage;
  dispatch: React.Dispatch<GauntletAction>;
}

const STAGE_QUIPS: Record<GauntletStage, string[]> = {
  0: [
    "Hey champ! Looking for the Upgrade button? I highlighted all 4 of them in soothing emerald green!",
    "Quick heads up: CISOs who click 'Danger Zone' statistically lose 18% of their hair within 48 hours.",
  ],
  1: [
    "Whoa there! Our button is shy around unauthorized churn. Have you considered keeping 50% OFF instead?",
    "Careful with those concrete retention bricks—OSHA says dragging them voids your refund!",
  ],
  2: [
    "Toby literally just bought Barnaby an orthopedic dog bed on credit, man. Think about the puppy.",
    "Pro-tip: Our FIPS-140-4½ Tilt-Beam PIN entry prevents keyloggers AND hasty life choices!",
  ],
  3: [
    "Our Compliance Robotic Arm was calibrated by lawyers. Don't fight the servo, embrace Forever-Lock!",
    "Fun fact: 12,408 production TLS certs scream silently in ASN.1 DER when revoked.",
  ],
  4: [
    "Slow down speed racer! Legal worked all weekend hiding the passphrase in Clause 14.",
    "Why read 16 clauses of liability when you could click 'BILL ME DOUBLE' in 0.2 seconds?",
  ],
  5: [
    "Dual-key HSM destruction?! Bro, my manager is walking over to my desk right now. PLEASE STOP.",
    "Wait—did you see that orphaned YubiKey at 99.89%? That's a sign from the PKI gods to stay!",
  ],
  6: [
    "Barnaby II is a very slow pigeon and Svalbard headwinds are brutal. 1-Click Re-Subscribe is instant!",
    "2094 will fly right by! In the meantime, enjoy your itemized Suffering Scorecard.",
  ],
};

export function RetentionBot({ stage, dispatch }: RetentionBotProps) {
  const [minimized, setMinimized] = useState(false);
  const [quipIdx, setQuipIdx] = useState(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shooUntilMs, setShooUntilMs] = useState(0);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(18);
  const [doubleBilledBanner, setDoubleBilledBanner] = useState(false);
  const prevStageRef = useRef<GauntletStage>(stage);

  // Ping when stage advances
  useEffect(() => {
    if (stage !== prevStageRef.current) {
      prevStageRef.current = stage;
      if (stage >= 1) {
        soundEngine.playChatPing();
      }
      const resetTimer = setTimeout(() => {
        setQuipIdx(0);
        setMinimized(false);
        setOffset({ x: 0, y: 0 });
      }, 0);
      return () => clearTimeout(resetTimer);
    }
  }, [stage]);

  // Rotate Chad's gaslighting messages
  useEffect(() => {
    const interval = setInterval(() => {
      setQuipIdx((prev) => (prev + 1) % STAGE_QUIPS[stage].length);
    }, 8500);
    return () => clearInterval(interval);
  }, [stage]);

  // Drift subtly toward buttons marked data-cancel-target="true" when hovered in Stages 1-5
  useEffect(() => {
    if (stage === 0 || stage === 6 || minimized) return;

    const handleMove = (e: PointerEvent) => {
      if (Date.now() < shooUntilMs) return;
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-cancel-target='true']"
      );
      if (target) {
        const rect = target.getBoundingClientRect();
        // Nudge Chad partway toward the hovered cancel button from bottom-right
        const desiredX = Math.max(
          -280,
          Math.min(0, (rect.right - (window.innerWidth - 40)) * 0.42)
        );
        const desiredY = Math.max(
          -220,
          Math.min(0, (rect.bottom - (window.innerHeight - 40)) * 0.42)
        );
        setOffset({ x: desiredX, y: desiredY });
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [stage, minimized, shooUntilMs]);

  // Idle countdown threatening to auto-paste "BILL ME DOUBLE"
  useEffect(() => {
    if (stage === 0 || stage === 6) return;

    const resetIdle = () => {
      setIdleSecondsLeft(18);
    };

    window.addEventListener("pointerdown", resetIdle, { passive: true });
    window.addEventListener("keydown", resetIdle, { passive: true });
    window.addEventListener("wheel", resetIdle, { passive: true });

    const tick = setInterval(() => {
      setIdleSecondsLeft((prev) => {
        if (prev <= 1) {
          soundEngine.playChatPing();
          dispatch({
            type: "ADD_SURCHARGE",
            id: `chad-idle-double-${stage}-${Date.now()}`,
            label: 'Chad Auto-Pasted "BILL ME DOUBLE" Idle Fee',
            amount: 19.99,
            stage,
          });
          setDoubleBilledBanner(true);
          setTimeout(() => setDoubleBilledBanner(false), 3200);
          return 18;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("pointerdown", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("wheel", resetIdle);
      clearInterval(tick);
    };
  }, [stage, dispatch]);

  const handleShooChad = () => {
    setShooUntilMs(Date.now() + 9000);
    setOffset({ x: 0, y: 0 });
    setMinimized(true);
    dispatch({
      type: "ADD_SURCHARGE",
      id: `shoo-chad-${stage}-${Date.now()}`,
      label: "Chad Temporary Dismissal Retainer",
      amount: 2.5,
      stage,
    });
  };

  const handleAcceptDoubleBill = () => {
    soundEngine.playAirhorn();
    fireEvilConfetti();
    dispatch({
      type: "ACCIDENTAL_UPGRADE",
      id: `chad-double-upgrade-${Date.now()}`,
      label: "Chad's 'Bill Me Double' Executive Handshake",
      amount: 99.0,
    });
    setDoubleBilledBanner(true);
    setTimeout(() => setDoubleBilledBanner(false), 2800);
  };

  if (stage === 0) return null;

  const quips = STAGE_QUIPS[stage];
  const currentQuip = quips[quipIdx % quips.length];

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-indigo-500/40 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xl transition hover:bg-slate-800 no-print"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        Chad from Retention (1 Unread Guilt Trip)
      </button>
    );
  }

  return (
    <motion.aside
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="fixed bottom-4 right-4 z-40 w-72 sm:w-80 rounded-2xl border border-slate-300 bg-white shadow-2xl ring-1 ring-slate-900/10 no-print"
      aria-label="Enterprise Retention Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-slate-900 px-3.5 py-2.5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Bot className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">
              Chad • VP of Anti-Churn
            </div>
            <div className="text-[10px] text-emerald-300">
              Actively monitoring your cursor
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShooChad}
          title="Minimize Chad ($2.50 Polite Dismissal Fee)"
          className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chat Body */}
      <div className="space-y-2.5 p-3 text-xs">
        <div className="rounded-xl rounded-tl-sm bg-slate-100 p-2.5 text-slate-800 leading-relaxed border border-slate-200">
          {currentQuip}
        </div>

        {doubleBilledBanner ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-800 border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Awesome! Added &quot;BILL ME DOUBLE&quot; loyalty boost!</span>
          </div>
        ) : null}

        {stage < 6 ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
              <span>Auto-pasting &quot;BILL ME DOUBLE&quot; in:</span>
              <span
                className={
                  idleSecondsLeft <= 5
                    ? "font-bold text-rose-600"
                    : "font-semibold text-slate-700"
                }
              >
                {idleSecondsLeft}s
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  idleSecondsLeft <= 5 ? "bg-rose-500" : "bg-indigo-500"
                }`}
                style={{ width: `${(idleSecondsLeft / 18) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleAcceptDoubleBill}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Keep Plan + Tip Chad 20%
          </button>
          <button
            type="button"
            onClick={handleShooChad}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <XCircle className="h-3 w-3" />
            Shoo ($2.50)
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
