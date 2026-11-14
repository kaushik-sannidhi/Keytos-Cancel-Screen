"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Dog,
  Frown,
  Gauge,
  HeartCrack,
  Lock,
  Meh,
  Music,
  ShieldOff,
  Smile,
} from "lucide-react";
import { GauntletAction } from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";

interface Stage2Props {
  dispatch: React.Dispatch<GauntletAction>;
  onComplete: () => void;
}

const SURVEY_REWRITES: Record<string, { label: string; roast: string }> = {
  budget: {
    label: "Too expensive for our current Q4 budget",
    roast:
      "I personally despise cybersecurity and want ransomware gangs to buy a yacht with our wire transfers.",
  },
  internal: {
    label: "Migrating to an internal self-managed PKI",
    roast:
      "Our CISO prefers storing unencrypted root private keys in a public Google Sheet named 'passwords_final_v2'.",
  },
  features: {
    label: "Missing a specific certificate automation feature",
    roast:
      "I genuinely enjoy waking up at 3:14 AM every Sunday to manually renew expired wildcard TLS certificates.",
  },
  consolidating: {
    label: "Consolidating security vendors",
    roast:
      "We are replacing cryptographic X.509 mutual TLS authentication with good vibes and pinky promises.",
  },
};

const TARGET_PIN = 740;
const PIN_TOLERANCE = 24;

export function Stage2HostileSurvey({ dispatch, onComplete }: Stage2Props) {
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [rewrittenReason, setRewrittenReason] = useState<string>("");
  const [keyboardWarning, setKeyboardWarning] = useState(false);

  // Tilt-beam state
  const [tiltDeg, setTiltDeg] = useState(0);
  const [pinValue, setPinValue] = useState(250);
  const [pinLocked, setPinLocked] = useState(false);

  const tiltRef = useRef(0);
  const posRef = useRef(250);
  const velRef = useRef(0);
  const lockedRef = useRef(false);

  // Toby & Barnaby firing slider (0..100)
  const [internFirePct, setInternFirePct] = useState(0);
  const [isPlayingViolin, setIsPlayingViolin] = useState(false);

  useEffect(() => {
    return () => {
      soundEngine.stopSadViolin();
    };
  }, []);

  // Physics loop for the Tilt-Beam Account PIN slider
  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      if (!lockedRef.current) {
        const rad = (tiltRef.current * Math.PI) / 180;
        const accel = Math.sin(rad) * 0.24;
        velRef.current = (velRef.current + accel) * 0.89;

        // Gentle magnetic detent when level near target #740
        if (
          Math.abs(tiltRef.current) <= 2 &&
          Math.abs(posRef.current - TARGET_PIN) <= PIN_TOLERANCE
        ) {
          posRef.current += (TARGET_PIN - posRef.current) * 0.08;
          velRef.current *= 0.7;
        } else {
          posRef.current += velRef.current;
        }

        if (posRef.current <= 100) {
          posRef.current = 100;
          velRef.current = -velRef.current * 0.25;
        } else if (posRef.current >= 999) {
          posRef.current = 999;
          velRef.current = -velRef.current * 0.25;
        }

        const rounded = Math.round(posRef.current);
        setPinValue(rounded);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedKey(key);
    if (!key) {
      setRewrittenReason("");
      return;
    }
    soundEngine.playRoboticServo();
    setRewrittenReason(SURVEY_REWRITES[key].roast);
    dispatch({
      type: "TRIGGER_DARK_PATTERN",
      surcharge: {
        id: "honesty-ai-translation",
        label: "Keytos Honesty AI™ Churn Confession Translation",
        amount: 7.5,
      },
    });
  };

  const handleFakeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    soundEngine.playErrorBuzzer();
    setKeyboardWarning(true);
    dispatch({
      type: "ADD_SURCHARGE",
      id: "unauthorized-keypress-stage2",
      label: "Unauthorized Keyboard Entry Violation (FIPS-140-4½)",
      amount: 4.5,
      stage: 2,
      dedupe: true,
    });
  };

  const handleTiltChange = (newTilt: number) => {
    if (pinLocked) return;
    tiltRef.current = newTilt;
    setTiltDeg(newTilt);
  };

  const isInTargetZone = Math.abs(pinValue - TARGET_PIN) <= PIN_TOLERANCE;

  const handleLockPin = () => {
    if (pinLocked) {
      lockedRef.current = false;
      setPinLocked(false);
      return;
    }
    if (isInTargetZone) {
      lockedRef.current = true;
      posRef.current = TARGET_PIN;
      velRef.current = 0;
      tiltRef.current = 0;
      setTiltDeg(0);
      setPinValue(TARGET_PIN);
      setPinLocked(true);
      soundEngine.playStageAdvance();
    } else {
      soundEngine.playErrorBuzzer();
    }
  };

  const handleInternSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setInternFirePct(val);
    setIsPlayingViolin(true);
    soundEngine.updateSadViolin(val / 100);

    if (val === 100) {
      dispatch({
        type: "ADD_SURCHARGE",
        id: "toby-severance-pass-through",
        label: "Toby & Barnaby COBRA Kibble Pass-Through",
        amount: 34.99,
        stage: 2,
        dedupe: true,
      });
    }
  };

  const stopViolinPlayback = () => {
    setIsPlayingViolin(false);
    soundEngine.stopSadViolin();
  };

  const getTobyQuote = () => {
    if (internFirePct === 0) {
      return '"Hi! I\'m Toby, your dedicated Summer PKI CRL Polisher! Barnaby says woof!"';
    }
    if (internFirePct < 40) {
      return '"Wait... why is my badge reader blinking yellow? Did I misconfigure an OCSP responder?"';
    }
    if (internFirePct < 75) {
      return '"Please—Barnaby needs his hypoallergenic salmon kibble! I\'ll hand-sign X.509 certs in calligraphy!"';
    }
    if (internFirePct < 100) {
      return '"Security is packing my desk succulent into a cardboard box... tell my mom I almost understood ASN.1..."';
    }
    return '"TERMINATION COMPLETE: Toby\'s badge shredded. Barnaby downgraded to store-brand gravel."';
  };

  const canSubmit =
    Boolean(rewrittenReason) && pinLocked && internFirePct >= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      soundEngine.playErrorBuzzer();
      return;
    }
    soundEngine.stopSadViolin();
    soundEngine.playStageAdvance();
    onComplete();
  };

  const puckPercent = ((pinValue - 100) / (999 - 100)) * 100;
  const targetPercent = ((TARGET_PIN - 100) / (999 - 100)) * 100;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="font-mono text-[10px] uppercase tracking-widest text-orange-400">
            Stage 2 • Mandatory Churn Attribution &amp; Workforce Reduction
          </div>
          <h1 className="text-lg font-bold">
            Complete All 3 Exit Compliance Attestations
          </h1>
        </div>

        <div className="space-y-7 p-6">
          {/* 1. Self-Roasting Reason Dropdown */}
          <div className="space-y-2.5">
            <label
              htmlFor="churn-reason"
              className="flex items-center justify-between text-sm font-bold text-slate-900"
            >
              <span>1. Primary Reason for Abandoning Zero-Trust Security</span>
              {rewrittenReason ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Recorded
                </span>
              ) : (
                <span className="font-mono text-xs text-rose-600">Required</span>
              )}
            </label>

            <select
              id="churn-reason"
              value={selectedKey}
              onChange={handleReasonChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Select an enterprise reason --</option>
              {Object.entries(SURVEY_REWRITES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>

            {rewrittenReason ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs"
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  <ShieldOff className="h-3.5 w-3.5" />
                  Auto-Translated by Keytos Honesty AI™ (Logged to Audit Trail):
                </div>
                <p className="mt-1 font-semibold italic text-rose-950">
                  &ldquo;{rewrittenReason}&rdquo;
                </p>
              </motion.div>
            ) : null}
          </div>

          <hr className="border-slate-200" />

          {/* 2. Physics Tilt-Beam Tenant PIN Input */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="fake-pin-box"
                className="text-sm font-bold text-slate-900"
              >
                2. Enter Tenant PIN{" "}
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-indigo-800">
                  #{TARGET_PIN}
                </span>{" "}
                (Gravity Tilt-Beam Only)
              </label>
              {pinLocked ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Locked #{TARGET_PIN}
                </span>
              ) : (
                <span className="font-mono text-xs text-slate-500">
                  Roll puck into green zone ({TARGET_PIN - PIN_TOLERANCE}–
                  {TARGET_PIN + PIN_TOLERANCE}) &amp; click Lock PIN
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                id="fake-pin-box"
                type="text"
                readOnly={false}
                value={`#${pinValue}`}
                onKeyDown={handleFakeInputKeyDown}
                onChange={() => {}}
                className="w-32 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-center font-mono text-lg font-black text-slate-900"
              />
              {keyboardWarning ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Direct typing blocked per FIPS-140-4½ Anti-Keylogger Policy! Tilt the beam below!
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Keyboard disabled to prevent keyloggers. Tilt the balance beam to roll the digit puck!
                </span>
              )}
            </div>

            {/* Visual Tilt Beam */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
              <div className="relative py-5">
                <div
                  style={{ transform: `rotate(${tiltDeg}deg)` }}
                  className="relative mx-auto h-5 w-full max-w-xl rounded-full bg-slate-700 ring-2 ring-slate-600 transition-transform duration-75"
                >
                  {/* Target Zone Highlight */}
                  <div
                    style={{
                      left: `${targetPercent - 4.8}%`,
                      width: "9.6%",
                    }}
                    className="absolute inset-y-0 rounded-sm bg-emerald-500/45 ring-2 ring-emerald-400"
                  />

                  {/* Rolling Brass Digit Puck */}
                  <div
                    style={{ left: `calc(${puckPercent}% - 16px)` }}
                    className={`absolute -top-2.5 flex h-10 w-10 items-center justify-center rounded-full font-mono text-[11px] font-black shadow-lg ring-2 ${
                      pinLocked
                        ? "bg-emerald-500 text-slate-950 ring-white"
                        : isInTargetZone
                          ? "bg-amber-300 text-slate-950 ring-emerald-400"
                          : "bg-amber-400 text-slate-950 ring-amber-200"
                    }`}
                  >
                    {pinValue}
                  </div>
                </div>

                {/* Fulcrum Triangle */}
                <div className="mx-auto mt-1 h-0 w-0 border-x-[12px] border-b-[14px] border-x-transparent border-b-slate-500" />
              </div>

              {/* Tilt Controls + Lock Button */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-3 min-w-[220px]">
                  <Gauge className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-xs text-slate-300 whitespace-nowrap">
                    Tilt ({tiltDeg > 0 ? `+${tiltDeg}` : tiltDeg}°):
                  </span>
                  <input
                    type="range"
                    min={-18}
                    max={18}
                    step={1}
                    disabled={pinLocked}
                    value={tiltDeg}
                    onChange={(e) => handleTiltChange(Number(e.target.value))}
                    aria-label="Tilt beam angle"
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pinLocked}
                      onClick={() => handleTiltChange(-4)}
                      className="rounded border border-slate-600 bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                    >
                      -4°
                    </button>
                    <button
                      type="button"
                      disabled={pinLocked}
                      onClick={() => handleTiltChange(0)}
                      className="rounded border border-slate-600 bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                    >
                      Level 0°
                    </button>
                    <button
                      type="button"
                      disabled={pinLocked}
                      onClick={() => handleTiltChange(4)}
                      className="rounded border border-slate-600 bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                    >
                      +4°
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLockPin}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    pinLocked
                      ? "bg-slate-700 text-emerald-300 hover:bg-slate-600"
                      : isInTargetZone
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  {pinLocked
                    ? "PIN Locked (#740) • Click to Unlock"
                    : isInTargetZone
                      ? "Lock Tenant PIN #740 Now!"
                      : `Align to #${TARGET_PIN} to Lock`}
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* 3. Sad-Violin Intern Firing Slider (Toby & Barnaby) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="intern-slider"
                className="text-sm font-bold text-slate-900"
              >
                3. Mandatory Budget Offset: Select How Fired Intern Toby Is
              </label>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-rose-600">
                <Music
                  className={`h-3.5 w-3.5 ${
                    isPlayingViolin ? "animate-bounce" : ""
                  }`}
                />
                {internFirePct === 100
                  ? "100% Terminated"
                  : `${internFirePct}% Fired (Drag to 100% — Web Audio Sad Violin Live)`}
              </span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Illustrated Avatar Pair */}
                <div className="flex items-center -space-x-2 shrink-0">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border-2 border-white bg-indigo-600 text-white shadow">
                    {internFirePct >= 75 ? (
                      <Frown className="h-5 w-5 text-rose-200" />
                    ) : internFirePct >= 30 ? (
                      <Meh className="h-5 w-5 text-amber-200" />
                    ) : (
                      <Smile className="h-5 w-5 text-emerald-200" />
                    )}
                    <span className="mt-0.5 font-mono text-[9px] font-bold">
                      TOBY
                    </span>
                  </div>
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border-2 border-white bg-amber-500 text-slate-950 shadow">
                    <Dog className="h-5 w-5" />
                    <span className="font-mono text-[8px] font-black">
                      BARNABY
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Toby Miller (Age 21, Junior CRL Polisher) &amp; Golden Retriever Barnaby
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-900">
                      Barnaby Diet:{" "}
                      {internFirePct < 35
                        ? "Organic Alaskan Salmon"
                        : internFirePct < 80
                          ? "Day-Old Cardboard"
                          : "Unfiltered Rainwater"}
                    </span>
                  </div>
                  <p className="text-xs italic text-slate-700">{getTobyQuote()}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <input
                  id="intern-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={internFirePct}
                  onChange={handleInternSliderChange}
                  onPointerUp={stopViolinPlayback}
                  onPointerLeave={stopViolinPlayback}
                  onBlur={stopViolinPlayback}
                  className="w-full accent-rose-600 cursor-pointer h-2.5"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>0% (Keep Toby Employed)</span>
                  <span>50% (Revoke Dental + Dog Treats)</span>
                  <span className="font-bold text-rose-700">
                    100% (Escort Toby &amp; Barnaby Into Rain)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <div className="text-xs text-slate-500">
              {canSubmit
                ? "All 3 cruel attestations verified. You monster."
                : "Complete Reason, Lock PIN #740, and drag Toby's slider to 100% to continue."}
            </div>
            <button
              type="submit"
              data-cancel-target="true"
              disabled={!canSubmit}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition ${
                canSubmit
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              <HeartCrack className="h-4 w-4" />
              Submit Survey &amp; Fire Toby →
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
