"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertOctagon,
  Flame,
  Hammer,
  KeyRound,
  Lock,
  Radio,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { GauntletAction } from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";
import { fireEvilConfetti } from "@/lib/confettiBurst";

interface Stage5Props {
  dispatch: React.Dispatch<GauntletAction>;
  onComplete: () => void;
}

export function Stage5NuclearCeremony({ dispatch, onComplete }: Stage5Props) {
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [touchAssistArmed, setTouchAssistArmed] = useState(false);
  const [dragPct, setDragPct] = useState(0);
  const [isDraggingKeyB, setIsDraggingKeyB] = useState(false);

  const [ceremonyLatched, setCeremonyLatched] = useState(false);
  const [shredProgress, setShredProgress] = useState(0);
  const [fakeoutTriggered, setFakeoutTriggered] = useState(false);
  const [yubikeyHits, setYubikeyHits] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string>(
    "STEP 1: Hold down [SPACE] to turn Left Key A • STEP 2: While holding [SPACE], drag Right Key B to 100%!"
  );

  const trackRef = useRef<HTMLDivElement | null>(null);
  const keyAArmed = spaceHeld || touchAssistArmed;

  // Listen for [SPACE] hold globally during Stage 5
  useEffect(() => {
    if (ceremonyLatched) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) {
          setSpaceHeld(true);
          soundEngine.playRoboticServo();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceHeld(false);
        setDragPct(0);
        setIsDraggingKeyB(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [ceremonyLatched]);

  // Run the 99.9% -> 99.89% progress fakeout sequence once both keys latch!
  useEffect(() => {
    if (!ceremonyLatched) return;

    const steps: Array<{ delay: number; val: number; msg?: string; fakeout?: boolean }> = [
      { delay: 180, val: 38.4, msg: "Zeroizing Azure Managed HSM Partition 01..." },
      { delay: 520, val: 76.2, msg: "Publishing Master CRL #000001 to 190 edge POPs..." },
      { delay: 920, val: 96.8, msg: "Demagnetizing backup YubiKey smartcards..." },
      { delay: 1350, val: 99.9, msg: "99.90% — Finalizing Sovereign Cancellation..." },
      {
        delay: 2350,
        val: 99.89,
        fakeout: true,
        msg: "ERROR AT 99.89%: Progress ticked backwards! 1 stubborn FIPS YubiKey refuses to die!",
      },
    ];

    const timers = steps.map((s) =>
      setTimeout(() => {
        setShredProgress(s.val);
        if (s.msg) setStatusMsg(s.msg);
        if (s.fakeout) {
          setFakeoutTriggered(true);
          soundEngine.playErrorBuzzer();
          dispatch({
            type: "TRIGGER_DARK_PATTERN",
            surcharge: {
              id: "progress-regression-9989",
              label: "99.9% → 99.89% Reverse Progress Bar Tax",
              amount: 17.89,
            },
          });
        }
      }, s.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [ceremonyLatched, dispatch]);

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (ceremonyLatched) return;
    if (!keyAArmed) {
      soundEngine.playErrorBuzzer();
      setStatusMsg(
        "ACCESS DENIED: Hold [SPACE] first to keep Left Key A armed while dragging Right Key B!"
      );
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingKeyB(true);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingKeyB || !keyAArmed || ceremonyLatched || !trackRef.current) {
      return;
    }
    const rect = trackRef.current.getBoundingClientRect();
    const usable = Math.max(1, rect.width - 64);
    const rawX = e.clientX - rect.left - 32;
    const pct = Math.max(0, Math.min(100, Math.round((rawX / usable) * 100)));
    setDragPct(pct);

    if (pct >= 95) {
      setIsDraggingKeyB(false);
      setDragPct(100);
      setCeremonyLatched(true);
      soundEngine.playStageAdvance();
    }
  };

  const handleTrackPointerUp = () => {
    if (ceremonyLatched) return;
    setIsDraggingKeyB(false);
    if (dragPct < 95) {
      setDragPct(0);
    }
  };

  const handleFakeDialogTrap = (label: string) => {
    soundEngine.playAirhorn();
    fireEvilConfetti();
    dispatch({
      type: "ACCIDENTAL_UPGRADE",
      id: `stage5-dialog-${Date.now()}`,
      label,
      amount: 89.0,
    });
    setStatusMsg(`Intercepted by "${label}" (+$89.00)! Keep holding [SPACE] and drag Key B!`);
  };

  const handleSmashStubbornYubikey = () => {
    const nextHits = yubikeyHits + 1;
    setYubikeyHits(nextHits);
    soundEngine.playHeavyThud();

    if (nextHits === 1) {
      setShredProgress(99.94);
    } else if (nextHits === 2) {
      setShredProgress(99.98);
    } else if (nextHits >= 3) {
      setShredProgress(100);
      soundEngine.playStageAdvance();
      setTimeout(() => {
        onComplete();
      }, 320);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 text-white shadow-2xl">
        {/* Top Bunker Header */}
        <div className="bg-hazard-stripes h-3 w-full" />
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-red-400">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Stage 5 • FIPS 140-3 Level 9 Dual-Custodian HSM Bunker
            </div>
            <h1 className="text-lg font-bold">
              Execute Simultaneous Two-Key Master Root Destruction
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setTouchAssistArmed((prev) => !prev)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-[10px] text-slate-400 transition hover:border-amber-500 hover:text-amber-300"
          >
            {touchAssistArmed
              ? "Accessibility Key-A Latch: ON"
              : "No Spacebar? Toggle Key-A Latch"}
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Status Readout */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 font-mono text-xs text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{statusMsg}</span>
          </div>

          {!ceremonyLatched ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
              {/* Left Key A ([SPACE] Hold) */}
              <div className="md:col-span-4 flex flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-center">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Custodian Key A
                </div>

                <motion.div
                  animate={{ rotate: keyAArmed ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className={`my-4 flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-xl ${
                    keyAArmed
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/25"
                      : "border-slate-700 bg-slate-800 text-slate-400"
                  }`}
                >
                  <KeyRound className="h-10 w-10" />
                </motion.div>

                <div className="space-y-1">
                  <div
                    className={`font-mono text-xs font-black ${
                      keyAArmed ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {keyAArmed ? "KEY A ARMED (90°)" : "KEY A SAFE (0°)"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hold{" "}
                    <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-white">
                      SPACE
                    </kbd>{" "}
                    continuously
                  </p>
                </div>
              </div>

              {/* Right Key B Drag Track + Drifting Intercept Dialogs */}
              <div className="md:col-span-8 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  <span>Custodian Key B • Horizontal Blast Track</span>
                  <span className="text-amber-300">{dragPct}% Engaged</span>
                </div>

                {/* Drifting Fake System Dialogs when Key A is armed */}
                {keyAArmed ? (
                  <div
                    className={`my-2 flex flex-wrap items-center justify-around gap-2 ${
                      isDraggingKeyB ? "pointer-events-none opacity-65" : ""
                    }`}
                  >
                    <motion.button
                      type="button"
                      animate={{ y: [-6, 8, -6] }}
                      transition={{
                        duration: 2.1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      onClick={() =>
                        handleFakeDialogTrap("SmartScreen Auto-Stay Shield")
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-600 px-3 py-1.5 text-left text-[11px] font-bold text-white shadow-lg"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      System Popup: Click to Abort &amp; Save Chad!
                    </motion.button>

                    <motion.button
                      type="button"
                      animate={{ y: [8, -7, 8] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      onClick={() =>
                        handleFakeDialogTrap("10-Year HSM Warranty Add-On")
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-400/50 bg-indigo-600 px-3 py-1.5 text-left text-[11px] font-bold text-white shadow-lg"
                    >
                      HSM Update: Extend Lock-In (+$89)
                    </motion.button>
                  </div>
                ) : (
                  <div className="my-4 text-center text-xs text-slate-500">
                    Arm Left Key A first to unlock the Right Key B detonation rail.
                  </div>
                )}

                {/* Armored Drag Track */}
                <div
                  ref={trackRef}
                  className={`relative h-16 w-full rounded-2xl border-2 p-1.5 transition ${
                    keyAArmed
                      ? "border-amber-500/70 bg-slate-950"
                      : "border-slate-800 bg-slate-950/60 opacity-60"
                  }`}
                >
                  {/* Fill */}
                  <div
                    style={{ width: `${dragPct}%` }}
                    className="h-full rounded-xl bg-gradient-to-r from-amber-600/40 to-red-600/60"
                  />

                  {/* Target Lock Socket on Right */}
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 font-mono text-[10px] font-bold text-red-400">
                    <Flame className="h-4 w-4" />
                    SHRED LOCK
                  </div>

                  {/* Draggable Key B Handle */}
                  <button
                    type="button"
                    data-cancel-target="true"
                    onPointerDown={handleTrackPointerDown}
                    onPointerMove={handleTrackPointerMove}
                    onPointerUp={handleTrackPointerUp}
                    onPointerCancel={handleTrackPointerUp}
                    style={{
                      left: `calc((100% - 64px) * ${(dragPct / 100).toFixed(3)})`,
                    }}
                    className={`absolute top-1.5 left-1.5 flex h-12 w-14 items-center justify-center rounded-xl font-mono text-xs font-black shadow-lg select-none touch-none ${
                      keyAArmed
                        ? "cursor-grab active:cursor-grabbing bg-amber-400 text-slate-950 ring-2 ring-white"
                        : "cursor-not-allowed bg-slate-700 text-slate-400"
                    }`}
                    aria-label="Drag Custodian Key B across track"
                  >
                    {keyAArmed ? "KEY B" : <Lock className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 99.9% -> 99.89% Shredder Fakeout Panel */
            <div className="space-y-5 rounded-2xl border border-red-500/40 bg-slate-900 p-6">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs uppercase tracking-wider text-slate-300">
                  Master Root Key &amp; CRL Shredder Progress
                </span>
                <span
                  className={`text-xl font-black ${
                    fakeoutTriggered ? "text-rose-400" : "text-amber-300"
                  }`}
                >
                  {shredProgress.toFixed(2)}%
                </span>
              </div>

              <div className="h-5 w-full overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-700">
                <motion.div
                  animate={{ width: `${shredProgress}%` }}
                  transition={{ duration: 0.25 }}
                  className={`h-full ${
                    fakeoutTriggered
                      ? "bg-rose-600"
                      : "bg-gradient-to-r from-amber-500 to-red-500"
                  }`}
                />
              </div>

              {fakeoutTriggered ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-500/60 bg-rose-950/50 p-4"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-rose-300">
                      <AlertOctagon className="h-4 w-4 text-rose-400" />
                      99.90% → 99.89% REGRESSION DETECTED!
                    </div>
                    <p className="text-xs text-slate-300">
                      One titanium-cased YubiKey 5C FIPS jammed the cryptographic shredder blades! Physically smash it 3 times to finish the final 0.11%!
                    </p>
                  </div>

                  <button
                    type="button"
                    data-cancel-target="true"
                    onClick={handleSmashStubbornYubikey}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-mono text-xs font-black text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 active:scale-95"
                  >
                    <Hammer className="h-4 w-4" />
                    SMASH YUBIKEY ({yubikeyHits}/3)
                  </button>
                </motion.div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
