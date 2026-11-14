"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ChevronDown,
  DollarSign,
  Receipt,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  BASE_MONTHLY_PRICE,
  GauntletAction,
  GauntletState,
  STAGE_METADATA,
  getTotalSurcharges,
} from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";

interface HostilityHudProps {
  state: GauntletState;
  dispatch: React.Dispatch<GauntletAction>;
  onTogglePresenter: () => void;
}

const PANIC_TICKER_ITEMS = [
  "CRL ENDPOINT ALERT: Canceling publishes your CEO's browser history to OCSP responders",
  "EZCA SLA NOTICE: Downtime caused by churn is billed at $850/millisecond",
  "YUBIKEY TELEMETRY: 1,842 hardware tokens preparing simultaneous dramatic brick sequence",
  "ENTRA ID CBA WARNING: Passwordless users will revert to 94-character Wingdings passwords",
  "COMPLIANCE BULLETIN: NIST SP 800-STAY mandates 36-month retention cooling-off period",
];

export function HostilityHud({
  state,
  dispatch,
  onTogglePresenter,
}: HostilityHudProps) {
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [recentFeeToast, setRecentFeeToast] = useState<string | null>(null);
  const prevSurchargeCountRef = useRef(state.surcharges.length);
  const lastMousePosRef = useRef<{ x: number; y: number; t: number } | null>(
    null
  );
  const hesitationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meta = STAGE_METADATA[state.stage];
  const surchargeTotal = getTotalSurcharges(state.surcharges);
  const grandMonthly = BASE_MONTHLY_PRICE + surchargeTotal;

  // Toast whenever a new surcharge is added
  useEffect(() => {
    if (state.surcharges.length > prevSurchargeCountRef.current) {
      const newest = state.surcharges[state.surcharges.length - 1];
      prevSurchargeCountRef.current = state.surcharges.length;
      const showTimer = setTimeout(() => {
        setRecentFeeToast(
          `+$${newest.amount.toFixed(2)} ${newest.label}`
        );
      }, 0);
      const hideTimer = setTimeout(() => {
        setRecentFeeToast(null);
      }, 2800);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    prevSurchargeCountRef.current = state.surcharges.length;
  }, [state.surcharges]);

  // Passive micro-fee surveillance (Mouse Hesitation & Cursor Velocity Violation) in Stages 1-5
  useEffect(() => {
    if (state.stage === 0 || state.stage === 6) return;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (lastMousePosRef.current) {
        const dt = now - lastMousePosRef.current.t;
        if (dt > 16) {
          const dist = Math.hypot(
            e.clientX - lastMousePosRef.current.x,
            e.clientY - lastMousePosRef.current.y
          );
          const velocityPxPerSec = (dist / dt) * 1000;
          if (velocityPxPerSec > 4200) {
            dispatch({
              type: "ADD_SURCHARGE",
              id: `cursor-velocity-stage-${state.stage}`,
              label: "Cursor Velocity Violation (>4,200 px/s)",
              amount: 8.5,
              stage: state.stage,
              dedupe: true,
            });
          }
        }
      }
      lastMousePosRef.current = { x: e.clientX, y: e.clientY, t: now };

      if (hesitationTimerRef.current) {
        clearTimeout(hesitationTimerRef.current);
      }
      hesitationTimerRef.current = setTimeout(() => {
        dispatch({
          type: "ADD_SURCHARGE",
          id: `mouse-hesitation-stage-${state.stage}`,
          label: "Mouse Hesitation & Doubt Micro-Fee",
          amount: 14.99,
          stage: state.stage,
          dedupe: true,
        });
      }, 9500);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (hesitationTimerRef.current) {
        clearTimeout(hesitationTimerRef.current);
      }
    };
  }, [state.stage, dispatch]);

  const handleToggleMute = () => {
    const nextMuted = !state.muted;
    soundEngine.setMuted(nextMuted);
    dispatch({
      type: "TOGGLE_MUTE",
      feeId: `audio-fee-${state.surcharges.length + 1}`,
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-950 text-white shadow-lg no-print">
      {/* Top Enterprise Brand + Live Surcharge Bar */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-mono text-sm font-black tracking-tighter text-white shadow-inner">
            KZ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                Keytos Shield™ Forever-Lock
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-300 ring-1 ring-indigo-400/30">
                Sovereign PKI v9.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{meta.portalTitle}</p>
          </div>
        </div>

        {/* Non-Euclidean Progress Readout */}
        <div className="flex flex-1 max-w-md flex-col gap-1 px-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-semibold text-amber-300">
              {meta.nonEuclideanStep}
            </span>
            <span className="text-slate-300">{meta.fakePercentDisplay}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700">
            <motion.div
              className={`h-full ${meta.barColorClass}`}
              initial={false}
              animate={{ width: `${meta.barFillPercent}%` }}
              transition={{ type: "spring", stiffness: 110, damping: 16 }}
            />
          </div>
        </div>

        {/* Right Controls: Surcharge Ticker + Mute Surcharge + Presenter Shortcut */}
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLedgerOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/60 px-3 py-1.5 text-xs font-mono transition hover:bg-rose-900/70"
            >
              <DollarSign className="h-3.5 w-3.5 text-rose-400" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-rose-300">
                  Exit Balance + Cycle
                </div>
                <div className="font-bold text-white">
                  ${grandMonthly.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="ml-1.5 text-[10px] text-rose-300">
                    (+${surchargeTotal.toFixed(2)} fees)
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-rose-300 transition-transform ${
                  ledgerOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {recentFeeToast ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="pointer-events-none absolute right-0 top-full mt-1.5 z-50 whitespace-nowrap rounded-md border border-rose-400/50 bg-rose-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-xl"
                >
                  {recentFeeToast}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Dropdown Ledger */}
            <AnimatePresence>
              {ledgerOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs shadow-2xl"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Receipt className="h-3.5 w-3.5 text-rose-400" />
                      Itemized Retention Surcharges
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {state.surcharges.length} items
                    </span>
                  </div>
                  <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Forever-Lock Base Tier</span>
                      <span>${BASE_MONTHLY_PRICE.toFixed(2)}</span>
                    </div>
                    {state.surcharges.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-2 text-rose-300"
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="shrink-0">
                          +${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-800 pt-2 font-mono text-xs font-bold text-white">
                    <span>Accrued Surcharges:</span>
                    <span className="text-rose-400">
                      ${surchargeTotal.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            title="Toggle audio ($4.99 Peace & Quiet Surcharge applies)"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
              state.muted
                ? "border-amber-500/50 bg-amber-950/60 text-amber-200 hover:bg-amber-900/60"
                : "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {state.muted ? (
              <VolumeX className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span className="hidden md:inline">
              {state.muted ? "Muted (+$4.99)" : "Audio ($4.99 Mute Fee)"}
            </span>
          </button>

          <button
            type="button"
            onClick={onTogglePresenter}
            title="Toggle Judge / Presenter Stage Switcher (Ctrl+Shift+K)"
            className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 font-mono text-[10px] text-slate-400 transition hover:border-indigo-500 hover:text-indigo-300"
          >
            Ctrl+Shift+K
          </button>
        </div>
      </div>

      {/* Live PKI Panic Marquee Strip (Stages 1+) */}
      {state.stage >= 1 ? (
        <div className="overflow-hidden border-t border-slate-800 bg-slate-900/95 py-1 text-[11px] font-mono text-amber-300/90">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {[...PANIC_TICKER_ITEMS, ...PANIC_TICKER_ITEMS].map((msg, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                {idx % 2 === 0 ? (
                  <ShieldAlert className="h-3 w-3 text-rose-400" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                )}
                {msg}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
