"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
  Gauge,
  Siren,
} from "lucide-react";
import { GauntletAction } from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";

interface Stage4Props {
  dispatch: React.Dispatch<GauntletAction>;
  onComplete: () => void;
}

const SPEED_LIMIT_PX_PER_SEC = 180;
const REQUIRED_OATH = "I RENOUNCE ZERO TRUST";

const LEGAL_CLAUSES = [
  "Clause 1 (Definitions): 'Customer' means the ungrateful entity attempting to abandon industry-leading X.509 perfection.",
  "Clause 2 (Inverted Ergonomics): Scroll direction in this legal instrument is inverted (Wheel UP scrolls DOWN) to build character.",
  "Clause 3 (Speed Enforcement): Scrolling faster than 180 px/sec constitutes Unlawful Legal Skimming ($12.00 fine + instant rewind).",
  "Clause 4 (OCSP Public Shaming): Upon cancellation, our OCSP responders will reply 'CHEAPSKATE_REVOKED' to all relying parties.",
  "Clause 5 (YubiKey Custody): Chad retains weekend visitation rights to all 1,842 hardware FIDO2 security keys.",
  "Clause 6 (Browser Warnings): Every laptop in your org will display bright red NET::ERR_CERT_CISO_HAS_REGRETS interstitials.",
  "Clause 7 (SCEP Nostalgia): You agree to manually copy-paste Base64 PEM chains via carrier pigeon for the next 48 quarters.",
  "Clause 8 (Espresso Clause): Smartcard authentication on your 4th-floor espresso machine is immediately revoked.",
  "Clause 9 (Intern Liability): You acknowledge personal moral responsibility for Barnaby the Golden Retriever's generic kibble.",
  "Clause 10 (Perpetual Audit): Keytos may audit your self-signed certificates at 2:00 AM on national holidays.",
  "Clause 11 (Quantum Curse): Any future quantum computer must factor your RSA keys first out of spite.",
  "Clause 12 (No Takebacksies): Re-onboarding after churn incurs a mandatory 'Told You So' keynote presentation.",
  "Clause 13 (Governing Weather): Disputes shall be arbitrated outdoors in Longyearbyen, Svalbard during polar night.",
  "CLAUSE 14 (SECRET MANDATORY OATH PASSPHRASE): To prove you read every word slowly, type the exact oath: I RENOUNCE ZERO TRUST",
  "Clause 15 (Case-Swap Humility): Our Oath Box automatically SpongeCases your typing and pastes 'BILL ME DOUBLE' if you pause.",
  "Clause 16 (Finality): Reaching the bottom of this scroll box binds your eternal cryptographic soul. End of instrument.",
];

function toMockingSpongeCase(raw: string): string {
  return raw
    .split("")
    .map((ch, idx) => (idx % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()))
    .join("");
}

export function Stage4LegalSpeedTrap({ dispatch, onComplete }: Stage4Props) {
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);
  const lastScrollRef = useRef<{ top: number; time: number }>({
    top: 0,
    time: 0,
  });
  const ticketCooldownUntilRef = useRef<number>(0);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [unlockedOath, setUnlockedOath] = useState(false);
  const [speedTicket, setSpeedTicket] = useState<number | null>(null);

  const [oathDisplay, setOathDisplay] = useState("");
  const [sabotageNotice, setSabotageNotice] = useState(false);

  const normalizedOath = oathDisplay.trim().replace(/\s+/g, " ").toUpperCase();
  const oathSealed = normalizedOath === REQUIRED_OATH;

  // Decay speedometer smoothly back to 0 when stationary
  useEffect(() => {
    const decay = setInterval(() => {
      setCurrentSpeed((prev) => (prev < 6 ? 0 : Math.round(prev * 0.65)));
    }, 120);
    return () => clearInterval(decay);
  }, []);

  // Attach non-passive wheel listener for inverted scrolling
  useEffect(() => {
    const el = scrollBoxRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (performance.now() < ticketCooldownUntilRef.current) return;
      // Inverted wheel scrolling: scrolling down moves up, scrolling up moves down!
      const step = Math.max(-55, Math.min(55, e.deltaY * 0.45));
      el.scrollTop = Math.max(
        0,
        Math.min(el.scrollHeight - el.clientHeight, el.scrollTop - step)
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleScroll = () => {
    const el = scrollBoxRef.current;
    if (!el) return;

    const now = performance.now();
    if (now < ticketCooldownUntilRef.current) return;

    const prev = lastScrollRef.current;
    const dt = now - prev.time;

    if (prev.time > 0 && dt > 12 && dt < 450) {
      const deltaPx = Math.abs(el.scrollTop - prev.top);
      const instantSpeed = Math.round((deltaPx / dt) * 1000);
      setCurrentSpeed(instantSpeed);

      if (instantSpeed > SPEED_LIMIT_PX_PER_SEC && deltaPx > 18) {
        // BUSTED BY RADAR SPEED TRAP!
        ticketCooldownUntilRef.current = now + 1100;
        soundEngine.playRadarSiren();
        setSpeedTicket(instantSpeed);
        el.scrollTop = 0;
        lastScrollRef.current = { top: 0, time: now };
        setScrollPct(0);

        dispatch({
          type: "TRIGGER_DARK_PATTERN",
          surcharge: {
            id: `speed-trap-${Date.now()}`,
            label: `Legal Skimming Ticket (${instantSpeed} px/s in 180 Zone)`,
            amount: 12.0,
          },
        });

        setTimeout(() => {
          setSpeedTicket(null);
        }, 2600);
        return;
      }
    }

    lastScrollRef.current = { top: el.scrollTop, time: now };

    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
    const pct = Math.min(100, Math.round((el.scrollTop / maxScroll) * 100));
    setScrollPct(pct);
    if (pct >= 88) {
      setUnlockedOath(true);
    }
  };

  // Safe crawl buttons so users can also click/tap steadily at legal ~120 px/s
  const nudgeScroll = (deltaPx: number) => {
    const el = scrollBoxRef.current;
    if (!el) return;
    lastScrollRef.current = {
      top: el.scrollTop,
      time: performance.now() - 420,
    };
    el.scrollTop = Math.max(
      0,
      Math.min(el.scrollHeight - el.clientHeight, el.scrollTop + deltaPx)
    );
  };

  // Sabotage oath input if left idle for 4.2 seconds mid-typing
  useEffect(() => {
    if (!oathDisplay || oathSealed) return;

    const timer = setTimeout(() => {
      soundEngine.playChatPing();
      setOathDisplay((prev) => toMockingSpongeCase(`${prev} BILL ME DOUBLE`));
      setSabotageNotice(true);
      dispatch({
        type: "ADD_SURCHARGE",
        id: `oath-idle-sabotage-${Date.now()}`,
        label: "Oath Hesitation Ghost-Typing Assist Fee",
        amount: 5.5,
        stage: 4,
      });
    }, 4200);

    return () => clearTimeout(timer);
  }, [oathDisplay, oathSealed, dispatch]);

  const handleOathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSabotageNotice(false);
    setOathDisplay(toMockingSpongeCase(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockedOath || !oathSealed) {
      soundEngine.playErrorBuzzer();
      return;
    }
    soundEngine.playStageAdvance();
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header + Live Radar Speedometer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400">
              Stage 4 • Inverted-Scroll Legal Radar Speed Trap
            </div>
            <h1 className="text-lg font-bold">
              Read Slowly (&le;180 px/s) &amp; Recite Clause 14 Oath
            </h1>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 font-mono">
            <Gauge
              className={`h-5 w-5 ${
                currentSpeed > 140 ? "text-rose-400" : "text-emerald-400"
              }`}
            />
            <div>
              <div className="text-[10px] uppercase text-slate-400">
                Scroll Radar (Limit 180)
              </div>
              <div
                className={`text-sm font-black ${
                  currentSpeed > SPEED_LIMIT_PX_PER_SEC
                    ? "text-rose-400"
                    : currentSpeed > 135
                      ? "text-amber-300"
                      : "text-emerald-400"
                }`}
              >
                {currentSpeed} px/s
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Instructions + Safe Crawl Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-950">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              Wheel scrolling is INVERTED (scroll UP to move DOWN). Exceeding 180 px/s rewinds to top + $12 fine!
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => nudgeScroll(-48)}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 hover:bg-amber-100"
              >
                <ArrowUp className="h-3 w-3" /> Crawl Up
              </button>
              <button
                type="button"
                onClick={() => nudgeScroll(52)}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-800 hover:bg-amber-100"
              >
                <ArrowDown className="h-3 w-3" /> Safe Crawl Down (120 px/s)
              </button>
            </div>
          </div>

          {/* Legal Scroll Box with Radar Flash */}
          <div className="relative">
            <AnimatePresence>
              {speedTicket !== null ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl border-4 border-rose-500 bg-slate-950/90 p-6 text-center text-white"
                >
                  <Siren className="h-10 w-10 text-rose-400 mb-2" />
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
                    PKI Highway Patrol Radar Flash
                  </div>
                  <div className="mt-1 text-xl font-black">
                    CLOCKED AT {speedTicket} px/s IN A 180 px/s ZONE!
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    $12.00 Legal Skimming Fine added • Rewinding contract to Clause 1!
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div
              ref={scrollBoxRef}
              onScroll={handleScroll}
              className="h-60 overflow-y-auto rounded-xl border-2 border-slate-300 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px] font-bold uppercase text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Keytos Terms of Abandonment &amp; Eternal Liability
                </span>
                <span>Read Progress: {scrollPct}%</span>
              </div>

              {LEGAL_CLAUSES.map((clause, idx) => {
                const isSecret = idx === 13;
                return (
                  <p
                    key={idx}
                    className={
                      isSecret
                        ? "rounded-lg border-2 border-indigo-400 bg-indigo-50 p-3 font-bold text-indigo-950"
                        : ""
                    }
                  >
                    {clause}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Part 2: Case-Swapping Sabotaged Oath Input */}
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="oath-input"
                className="text-sm font-bold text-slate-900"
              >
                Sworn Cryptographic Oath (Found in Clause 14)
              </label>
              {unlockedOath ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Scroll Verified
                </span>
              ) : (
                <span className="font-mono text-xs text-amber-700">
                  Scroll to bottom (&ge;88%) at &le;180 px/s to unlock Oath Box
                </span>
              )}
            </div>

            <input
              id="oath-input"
              type="text"
              disabled={!unlockedOath}
              value={oathDisplay}
              onChange={handleOathChange}
              placeholder={
                unlockedOath
                  ? "Type passphrase from Clause 14 without pausing..."
                  : "Locked until Terms of Abandonment are read slowly..."
              }
              autoComplete="off"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              {sabotageNotice ? (
                <span className="font-semibold text-rose-600">
                  Idle &gt;4s! Chad ghost-typed &quot;BILL ME DOUBLE&quot; into your oath—backspace it quick!
                </span>
              ) : oathSealed ? (
                <span className="font-semibold text-emerald-700">
                  Oath semantically verified despite SpongeCase™ humiliation filter!
                </span>
              ) : (
                <span className="text-slate-500">
                  Auto-SpongeCase™ Shame Filter active (case-insensitive match accepted; don&apos;t idle &gt;4s!).
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-slate-200 pt-3">
            <button
              type="submit"
              data-cancel-target="true"
              disabled={!unlockedOath || !oathSealed}
              className={`rounded-xl px-5 py-3 text-xs font-bold transition ${
                unlockedOath && oathSealed
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              Notarize Oath &amp; Enter HSM Vault →
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
