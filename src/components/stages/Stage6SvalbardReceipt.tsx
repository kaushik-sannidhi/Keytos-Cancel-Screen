"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Award,
  Bird,
  Clock,
  Disc,
  MapPin,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  GauntletAction,
  GauntletState,
  computeHostilityRank,
  getTotalSurcharges,
} from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";
import { fireEvilConfetti } from "@/lib/confettiBurst";

interface Stage6Props {
  state: GauntletState;
  dispatch: React.Dispatch<GauntletAction>;
}

export function Stage6SvalbardReceipt({ state, dispatch }: Stage6Props) {
  const [elapsedSec, setElapsedSec] = useState<number>(42.8);
  const [pigeonCountdownSec, setPigeonCountdownSec] = useState<number>(
    2145916800
  );
  const [resubModalOpen, setResubModalOpen] = useState(false);
  const [stalkOffset, setStalkOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const corralRef = useRef<HTMLDivElement | null>(null);

  // Compute finalized elapsed seconds on mount of Stage 6
  useEffect(() => {
    const computeTimer = setTimeout(() => {
      if (state.startedAtMs > 0) {
        const diff = Math.max(4.2, (Date.now() - state.startedAtMs) / 1000);
        setElapsedSec(Number(diff.toFixed(1)));
      }
    }, 0);

    const pigeonTick = setInterval(() => {
      setPigeonCountdownSec((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(computeTimer);
      clearInterval(pigeonTick);
    };
  }, [state.startedAtMs]);

  // Mouse-stalking 1-Click Instant Re-Subscribe button inside its corral
  const handleCorralMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!corralRef.current) return;
    const rect = corralRef.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    setStalkOffset({
      x: Math.max(-95, Math.min(95, relX * 0.45)),
      y: Math.max(-28, Math.min(28, relY * 0.45)),
    });
  };

  const handleInstantResubscribe = () => {
    soundEngine.playAirhorn();
    fireEvilConfetti();
    setResubModalOpen(true);
    dispatch({
      type: "ACCIDENTAL_UPGRADE",
      id: `svalbard-resub-${Date.now()}`,
      label: "1-Click Pigeon Recall & +20% Loyalty Hike",
      amount: 859.8,
    });
  };

  const subtotalFees = getTotalSurcharges(state.surcharges);
  const griefVat = Number((subtotalFees * 0.18).toFixed(2));
  const totalExitBalance = Number((subtotalFees + griefVat).toFixed(2));
  const rank = computeHostilityRank(state);

  const minutes = Math.floor(elapsedSec / 60);
  const remSeconds = (elapsedSec % 60).toFixed(1).padStart(4, "0");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: 2094 Svalbard Carrier-Pigeon Queue + Mouse-Stalking Re-Subscribe */}
        <div className="lg:col-span-7 space-y-5 no-print">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-6 py-5 text-white">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 font-mono text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
                <Bird className="h-3.5 w-3.5" />
                ANALOG DISPATCH QUEUED • TICKET #CRL-000001
              </div>
              <h1 className="mt-2 text-xl font-bold sm:text-2xl">
                Cancellation Request Queued via Thermal Fax &amp; Carrier Pigeon
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Destination: Keytos Permafrost Root Vault • Longyearbyen, Svalbard (78°13′N 15°38′E)
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    Estimated Processing Completion
                  </div>
                  <div className="mt-1 font-mono text-xl font-black text-slate-900">
                    November 14, 2094
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-rose-600">
                    T-minus {pigeonCountdownSec.toLocaleString("en-US")} seconds
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Assigned Avian Courier
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-slate-900">
                    Pigeon #44 (&ldquo;Barnaby II&rdquo;)
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-600">
                    Cruising at 0.4 knots against Arctic headwinds
                  </div>
                </div>
              </div>

              {/* Floppy Disk Expedite Clause */}
              <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950">
                <Disc className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
                <div>
                  <div className="font-bold">
                    Want to Expedite Processing to Q3 2089?
                  </div>
                  <p className="mt-0.5 leading-relaxed text-indigo-900/90">
                    Simply mail a notarized <strong>3.5-inch 1.44MB IBM-formatted floppy disk</strong> containing your wet-ink X.509 revocation request, two lockets of CISO hair, and a cashier&apos;s check for <strong>${totalExitBalance.toFixed(2)}</strong> to our Svalbard Postbox. Recurring $4,299/mo billing continues normally until Barnaby II lands.
                  </p>
                </div>
              </div>

              {/* Mouse-Stalking Giant 1-Click Re-Subscribe Corral */}
              <div
                ref={corralRef}
                onPointerMove={handleCorralMove}
                onPointerLeave={() => setStalkOffset({ x: 0, y: 0 })}
                className="relative overflow-hidden rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-6 text-center"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Changed Your Mind? Skip the 68-Year Wait!
                </div>
                <p className="mt-0.5 text-xs text-emerald-700 mb-4">
                  Notice how effortlessly our Re-Subscribe button follows your cursor!
                </p>

                <motion.button
                  type="button"
                  animate={{ x: stalkOffset.x, y: stalkOffset.y }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  onClick={handleInstantResubscribe}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-500"
                >
                  <Sparkles className="h-5 w-5" />
                  1-CLICK INSTANT RE-SUBSCRIBE (+20% LOYALTY HIKE)
                </motion.button>

                {resubModalOpen ? (
                  <div className="mt-4 rounded-xl border border-emerald-500 bg-white p-3.5 text-left text-xs shadow">
                    <div className="font-bold text-emerald-900">
                      WELCOME BACK TO FOREVER-LOCK™! Barnaby II has been recalled mid-flight!
                    </div>
                    <p className="mt-1 text-slate-600">
                      We billed $859.80 for mid-air pigeon turnaround. Still want your cancellation receipt?
                    </p>
                    <button
                      type="button"
                      onClick={() => setResubModalOpen(false)}
                      className="mt-2 font-mono text-[11px] font-semibold text-rose-600 underline"
                    >
                      Wait no, send Barnaby II back to Svalbard (Keep Receipt)
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Thermal Suffering Scorecard Receipt */}
        <div className="lg:col-span-5">
          <div className="mx-auto max-w-md bg-white text-slate-900 shadow-2xl ring-1 ring-slate-300">
            <div className="receipt-tooth-top h-3.5 w-full bg-white" />

            <div className="px-6 py-5 font-mono text-xs space-y-4">
              {/* Receipt Header */}
              <div className="border-b-2 border-dashed border-slate-300 pb-3 text-center space-y-1">
                <div className="text-sm font-black tracking-tight">
                  KEYTOS SHIELD™ FOREVER-LOCK
                </div>
                <div className="text-[10px] text-slate-500">
                  OFFICIAL SUFFERING SCORECARD &amp; EXIT LEDGER
                </div>
                <div className="text-[10px] text-slate-400">
                  TICKET #CRL-000001 • TERMINAL: SVALBARD-FAX-09
                </div>
              </div>

              {/* Run Telemetry */}
              <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">GAUNTLET TIME ELAPSED:</span>
                  <span className="font-bold">
                    {minutes}m {remSeconds}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DARK PATTERNS SURVIVED:</span>
                  <span className="font-bold">
                    {Math.max(7, state.darkPatternsTriggered + 7)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ACCIDENTAL UPGRADES:</span>
                  <span className="font-bold">{state.accidentalUpgrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">INTERNS TERMINATED:</span>
                  <span className="font-bold">1 (Toby + Barnaby)</span>
                </div>
              </div>

              {/* Itemized Surcharges */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  Itemized Retention Micro-Surcharges
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1 text-[11px]">
                  {state.surcharges.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="truncate text-slate-700">
                        [S{item.stage}] {item.label}
                      </span>
                      <span className="shrink-0 font-semibold">
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1 border-b-2 border-dashed border-slate-300 pb-3 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>SURCHARGE SUBTOTAL:</span>
                  <span>${subtotalFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>MANDATORY CHURN GRIEF VAT (18%):</span>
                  <span>${griefVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black text-slate-950">
                  <span>TOTAL EXIT FEES DUE:</span>
                  <span>${totalExitBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Hostility Rank Stamp */}
              <div className="rounded-xl border-2 border-slate-900 bg-slate-50 p-3 text-center space-y-1">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <Award className="h-3.5 w-3.5 text-rose-600" />
                  Official Hostility Rank
                </div>
                <div className="text-lg font-black text-rose-600">
                  [{rank.grade}] {rank.title}
                </div>
                <p className="font-sans text-[11px] text-slate-600 leading-snug">
                  {rank.citation}
                </p>
              </div>

              {/* Fake Barcode */}
              <div className="pt-1 text-center space-y-1">
                <div
                  aria-hidden="true"
                  className="mx-auto h-9 w-56 bg-[repeating-linear-gradient(90deg,#0f172a,#0f172a_2px,transparent_2px,transparent_5px,#0f172a_5px,#0f172a_6px,transparent_6px,transparent_10px)]"
                />
                <div className="text-[9px] tracking-widest text-slate-400">
                  SHA256: DEADBEEF-C0FFEE-2094-SVALBARD
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 font-sans text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "RESET_GAUNTLET", nowMs: Date.now() })
                  }
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2.5 font-sans text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Replay
                </button>
              </div>
            </div>

            <div className="receipt-tooth-bottom h-3.5 w-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
