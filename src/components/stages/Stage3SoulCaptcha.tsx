"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertOctagon,
  Bot,
  Check,
  CheckCircle2,
  Cpu,
  FileWarning,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  Skull,
  Smile,
  Sparkles,
} from "lucide-react";
import { GauntletAction } from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";

interface Stage3Props {
  dispatch: React.Dispatch<GauntletAction>;
  onComplete: () => void;
}

interface CaptchaTile {
  id: string;
  title: string;
  subtitle: string;
  isTarget: boolean;
  category: "regret" | "root-ca" | "decoy";
}

const INITIAL_TILES: CaptchaTile[] = [
  {
    id: "tile-root-sha1",
    title: "SHA-1 Prod Root CA",
    subtitle: "Unrevoked • Valid til 2099",
    isTarget: true,
    category: "root-ca",
  },
  {
    id: "tile-decoy-coupon",
    title: "50% Off Loyalty Coupon",
    subtitle: "Zero Regret • Pure Savings",
    isTarget: false,
    category: "decoy",
  },
  {
    id: "tile-regret-3am",
    title: "3:14 AM PagerDuty Incident",
    subtitle: "100% Genuine CISO Regret",
    isTarget: true,
    category: "regret",
  },
  {
    id: "tile-decoy-jetski",
    title: "Chad's Corporate Jet-Ski",
    subtitle: "Zero Regret • Very Fast",
    isTarget: false,
    category: "decoy",
  },
  {
    id: "tile-root-wildcard",
    title: "CN=*.prod.corp Root CA",
    subtitle: "Unrevoked Master Authority",
    isTarget: true,
    category: "root-ca",
  },
  {
    id: "tile-decoy-pfx",
    title: "passwordless_final.pfx",
    subtitle: "Emailed to All-Hands (No Regret)",
    isTarget: false,
    category: "decoy",
  },
  {
    id: "tile-regret-postmortem",
    title: "SEV-0 Outage Post-Mortem",
    subtitle: "Deep Career Regret",
    isTarget: true,
    category: "regret",
  },
  {
    id: "tile-decoy-revoked",
    title: "Staging Cert from 2018",
    subtitle: "Already Revoked on CRL",
    isTarget: false,
    category: "decoy",
  },
  {
    id: "tile-decoy-hacker",
    title: "Smiling Threat Actor",
    subtitle: "Thrilled You Canceled EZCA",
    isTarget: false,
    category: "decoy",
  },
];

// Deterministic mid-selection shuffle order
const SHUFFLED_ORDER = [4, 0, 7, 2, 8, 1, 5, 6, 3];
const REQUIRED_HOLD_MS = 3000;

export function Stage3SoulCaptcha({ dispatch, onComplete }: Stage3Props) {
  const [holdMs, setHoldMs] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [checkboxLocked, setCheckboxLocked] = useState(false);
  const [armExtending, setArmExtending] = useState(false);
  const [armMessage, setArmMessage] = useState<string | null>(null);

  const [tiles, setTiles] = useState<CaptchaTile[]>(INITIAL_TILES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [shuffleAlert, setShuffleAlert] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const startHold = () => {
    if (checkboxLocked) return;
    setIsHolding(true);
    setArmExtending(true);
    setArmMessage("COMPLIANCE ACTUATOR RESISTING... KEEP HOLDING 3.0s!");
    soundEngine.playRoboticServo();

    const started = performance.now() - holdMs;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Math.min(REQUIRED_HOLD_MS, performance.now() - started);
      setHoldMs(elapsed);

      if (elapsed >= REQUIRED_HOLD_MS) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setArmExtending(false);
        setCheckboxLocked(true);
        setArmMessage(
          "ACTUATOR SERVO SNAPPED! Cold-heartedness verified & permanently latched."
        );
        soundEngine.playStageAdvance();
      }
    }, 40);
  };

  const endHold = () => {
    if (checkboxLocked) return;
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (!isHolding) return;
    setIsHolding(false);

    if (holdMs < REQUIRED_HOLD_MS) {
      // Robotic arm wins and unchecks the box!
      soundEngine.playRoboticServo();
      soundEngine.playErrorBuzzer();
      setArmExtending(true);
      setHoldMs(0);
      setArmMessage(
        "Robotic Arm Auto-Unchecked Box: Insufficient finger conviction! Hold down for 3 full seconds!"
      );
      dispatch({
        type: "TRIGGER_DARK_PATTERN",
        surcharge: {
          id: `robotic-uncheck-${Date.now()}`,
          label: "Robotic Arm Auto-Uncheck Servo Wear Fee",
          amount: 9.99,
        },
      });
      setTimeout(() => {
        setArmExtending(false);
      }, 650);
    }
  };

  const handleTileToggle = (tileId: string) => {
    setCaptchaError(null);
    const alreadySelected = selectedIds.includes(tileId);
    const nextSelected = alreadySelected
      ? selectedIds.filter((id) => id !== tileId)
      : [...selectedIds, tileId];

    setSelectedIds(nextSelected);

    // Mid-selection shuffle once when selecting the 2nd tile!
    if (!hasShuffled && !alreadySelected && nextSelected.length === 2) {
      setHasShuffled(true);
      setShuffleAlert(true);
      soundEngine.playRoboticServo();
      setTiles((prev) => SHUFFLED_ORDER.map((idx) => prev[idx]));
      dispatch({
        type: "TRIGGER_DARK_PATTERN",
        surcharge: {
          id: "captcha-entropy-shuffle",
          label: "NIST SP 800-CHAOS Mid-CAPTCHA Tile Shuffle Fee",
          amount: 6.75,
        },
      });
    }
  };

  const targetIds = INITIAL_TILES.filter((t) => t.isTarget).map((t) => t.id);
  const allTargetsSelected =
    selectedIds.length === targetIds.length &&
    targetIds.every((id) => selectedIds.includes(id));

  const handleVerifySubmit = () => {
    if (!checkboxLocked) {
      soundEngine.playErrorBuzzer();
      setCaptchaError(
        "Hold down the Cold-Heartedness Checkbox for 3.0 seconds first!"
      );
      return;
    }
    if (!allTargetsSelected) {
      soundEngine.playErrorBuzzer();
      const wrongPicked = selectedIds.some((id) => !targetIds.includes(id));
      setCaptchaError(
        wrongPicked
          ? "You selected a non-regret decoy tile! Uncheck decoys and select all 4 Genuine Regret / Unrevoked Root CA tiles."
          : `Selected ${selectedIds.length} of 4 required Genuine Regret / Unrevoked Root CA tiles.`
      );
      return;
    }

    soundEngine.playStageAdvance();
    onComplete();
  };

  const holdPct = Math.round((holdMs / REQUIRED_HOLD_MS) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="font-mono text-[10px] uppercase tracking-widest text-rose-400">
            Stage 3 • Zero-Trust Soul &amp; Remorse Verification
          </div>
          <h1 className="text-lg font-bold">
            Prove You Are Not a Sympathetic Human Being
          </h1>
        </div>

        <div className="space-y-6 p-6">
          {/* Part 1: Robotic Arm Self-Unchecking Checkbox */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
            {/* Flashing CISO Panic Banner while holding */}
            {isHolding ? (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-rose-600 px-3.5 py-2 font-mono text-xs font-bold text-white animate-jitter">
                <span className="flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 shrink-0" />
                  CISO PAGER ALERT: 12,408 PROD CERTIFICATES BEGGING FOR MERCY!
                </span>
                <span>{(holdMs / 1000).toFixed(1)}s / 3.0s</span>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 max-w-xl">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checkboxLocked || isHolding}
                  data-cancel-target="true"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    startHold();
                  }}
                  onPointerUp={endHold}
                  onPointerCancel={endHold}
                  onKeyDown={(e) => {
                    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                      e.preventDefault();
                      startHold();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      endHold();
                    }
                  }}
                  className={`relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition select-none touch-none ${
                    checkboxLocked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : isHolding
                        ? "border-rose-600 bg-rose-100 text-rose-700"
                        : "border-slate-400 bg-white text-transparent hover:border-rose-500"
                  }`}
                >
                  <Check className="h-6 w-6 stroke-[3]" />
                  {!checkboxLocked && holdMs > 0 ? (
                    <span className="absolute -bottom-2 rounded bg-rose-600 px-1 font-mono text-[9px] font-bold text-white">
                      {holdPct}%
                    </span>
                  ) : null}
                </button>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900">
                    I am cold-hearted enough to immediately revoke 12,408 production SSL/TLS certificates
                  </div>
                  <p className="text-xs text-slate-600">
                    {checkboxLocked
                      ? "Actuator defeated! Checkbox locked."
                      : "Press and HOLD mouse button down for 3.0 full seconds to overpower the Keytos Compliance Robotic Arm."}
                  </p>
                  {armMessage ? (
                    <p
                      className={`font-mono text-[11px] font-semibold ${
                        checkboxLocked ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {armMessage}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Hold Progress Meter */}
              <div className="w-full sm:w-44 space-y-1 shrink-0">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>Grip Torque</span>
                  <span>
                    {checkboxLocked
                      ? "LOCKED"
                      : `${(holdMs / 1000).toFixed(1)}s / 3.0s`}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-75 ${
                      checkboxLocked ? "bg-emerald-500" : "bg-rose-600"
                    }`}
                    style={{ width: `${checkboxLocked ? 100 : holdPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Articulated Mechanical Robotic Arm Overlay */}
            <motion.div
              initial={false}
              animate={{
                x: armExtending ? 0 : 220,
                opacity: armExtending ? 1 : 0.35,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="pointer-events-none hidden md:flex items-center absolute right-0 top-1/2 -translate-y-1/2 pr-2"
            >
              {/* Claw */}
              <div className="flex items-center">
                <div className="h-7 w-4 rounded-l-md border-2 border-r-0 border-slate-700 bg-amber-400" />
                <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 font-mono text-[10px] font-bold text-amber-300 rounded-l-lg border border-slate-600 shadow-lg">
                  <Cpu className="h-3.5 w-3.5 text-amber-400" />
                  AUTO-UNCHECK ARM v4
                </div>
                <div className="h-3 w-16 bg-hazard-stripes" />
              </div>
            </motion.div>
          </div>

          {/* Part 2: 3x3 Visual Grid CAPTCHA */}
          <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
            {/* Authentic CAPTCHA Blue Banner */}
            <div className="bg-indigo-600 px-5 py-4 text-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-indigo-200">
                  Select all squares containing
                </div>
                <div className="text-lg font-black leading-snug">
                  Genuine Regret or Unrevoked Root CAs
                </div>
                <div className="text-[11px] text-indigo-100">
                  (4 tiles total • Watch out for mid-selection entropy rotation)
                </div>
              </div>
              <Bot className="h-9 w-9 text-indigo-200 shrink-0" />
            </div>

            {shuffleAlert ? (
              <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 font-mono text-[11px] font-bold text-amber-950 border-b border-amber-200">
                <RefreshCw className="h-3.5 w-3.5 text-amber-700" />
                ENTROPY ROTATION: Grid shuffled mid-selection per NIST SP 800-CHAOS!
              </div>
            ) : null}

            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3">
              {tiles.map((tile) => {
                const isSelected = selectedIds.includes(tile.id);
                return (
                  <motion.button
                    layout
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    key={tile.id}
                    type="button"
                    onClick={() => handleTileToggle(tile.id)}
                    className={`relative flex flex-col items-center justify-between rounded-xl border-2 p-3 text-center transition min-h-[108px] ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/30 scale-[0.97]"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    {isSelected ? (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : null}

                    <div className="mt-1">
                      {tile.category === "root-ca" ? (
                        <KeyRound className="h-6 w-6 text-indigo-600" />
                      ) : tile.category === "regret" ? (
                        <Skull className="h-6 w-6 text-rose-600" />
                      ) : tile.id === "tile-decoy-coupon" ? (
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                      ) : tile.id === "tile-decoy-pfx" ? (
                        <FileWarning className="h-6 w-6 text-amber-600" />
                      ) : (
                        <Smile className="h-6 w-6 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold leading-tight text-slate-900">
                        {tile.title}
                      </div>
                      <div className="text-[10px] leading-tight text-slate-500">
                        {tile.subtitle}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* CAPTCHA Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
              <div className="text-xs">
                {captchaError ? (
                  <span className="font-semibold text-rose-600">
                    {captchaError}
                  </span>
                ) : allTargetsSelected && checkboxLocked ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Ready to verify!
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Selected {selectedIds.length}/4 targets
                  </span>
                )}
              </div>

              <button
                type="button"
                data-cancel-target="true"
                onClick={handleVerifySubmit}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-500"
              >
                <ShieldAlert className="h-4 w-4" />
                Verify Lack of Soul →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
