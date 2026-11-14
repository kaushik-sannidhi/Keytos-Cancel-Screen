"use client";

import React, { useEffect, useReducer, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  PartyPopper,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  GauntletStage,
  INITIAL_GAUNTLET_STATE,
  STAGE_METADATA,
  gauntletReducer,
} from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";
import { fireEvilConfetti } from "@/lib/confettiBurst";
import { HostilityHud } from "@/components/HostilityHud";
import { RetentionBot } from "@/components/RetentionBot";
import { Stage0DashboardTrap } from "@/components/stages/Stage0DashboardTrap";
import { Stage1PhysicsSwarm } from "@/components/stages/Stage1PhysicsSwarm";
import { Stage2HostileSurvey } from "@/components/stages/Stage2HostileSurvey";
import { Stage3SoulCaptcha } from "@/components/stages/Stage3SoulCaptcha";
import { Stage4LegalSpeedTrap } from "@/components/stages/Stage4LegalSpeedTrap";
import { Stage5NuclearCeremony } from "@/components/stages/Stage5NuclearCeremony";
import { Stage6SvalbardReceipt } from "@/components/stages/Stage6SvalbardReceipt";

const ALL_STAGES: GauntletStage[] = [0, 1, 2, 3, 4, 5, 6];

export default function HomePage() {
  const [state, dispatch] = useReducer(gauntletReducer, INITIAL_GAUNTLET_STATE);
  const [presenterOpen, setPresenterOpen] = useState(false);

  // Initialize start timestamp on client mount without SSR mismatch
  useEffect(() => {
    dispatch({ type: "ENSURE_STARTED", nowMs: Date.now() });
  }, []);

  // Presenter / Judge shortcut: Ctrl+Shift+K (or Cmd+Shift+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPresenterOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const advanceStage = () => {
    soundEngine.stopSadViolin();
    dispatch({ type: "NEXT_STAGE", nowMs: Date.now() });
  };

  const jumpToStage = (stage: GauntletStage) => {
    soundEngine.stopSadViolin();
    dispatch({ type: "SET_STAGE", stage });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <HostilityHud
        state={state}
        dispatch={dispatch}
        onTogglePresenter={() => setPresenterOpen((prev) => !prev)}
      />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {state.stage === 0 ? (
              <Stage0DashboardTrap
                dispatch={dispatch}
                onComplete={advanceStage}
              />
            ) : null}
            {state.stage === 1 ? (
              <Stage1PhysicsSwarm
                dispatch={dispatch}
                onComplete={advanceStage}
              />
            ) : null}
            {state.stage === 2 ? (
              <Stage2HostileSurvey
                dispatch={dispatch}
                onComplete={advanceStage}
              />
            ) : null}
            {state.stage === 3 ? (
              <Stage3SoulCaptcha
                dispatch={dispatch}
                onComplete={advanceStage}
              />
            ) : null}
            {state.stage === 4 ? (
              <Stage4LegalSpeedTrap
                dispatch={dispatch}
                onComplete={advanceStage}
              />
            ) : null}
            {state.stage === 5 ? (
              <Stage5NuclearCeremony
                dispatch={dispatch}
                onComplete={advanceStage}
              />
            ) : null}
            {state.stage === 6 ? (
              <Stage6SvalbardReceipt state={state} dispatch={dispatch} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-[11px] text-slate-400 no-print">
        Keytos Shield™ Forever-Lock Enterprise Billing • Zero-Trust PKI Parody Gauntlet • Presenter Stage Switcher:{" "}
        <button
          type="button"
          onClick={() => setPresenterOpen((prev) => !prev)}
          className="font-mono font-semibold text-slate-600 underline decoration-dotted hover:text-indigo-600"
        >
          Ctrl+Shift+K
        </button>
      </footer>

      <RetentionBot stage={state.stage} dispatch={dispatch} />

      {/* Judge / Presenter Stage Switcher Bar */}
      <AnimatePresence>
        {presenterOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-4 left-4 z-50 max-w-3xl rounded-2xl border border-indigo-500/40 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-md no-print"
          >
            <div className="mb-2 flex items-center justify-between gap-4 px-1">
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Presenter / Judge Stage Jumper (Ctrl+Shift+K)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playAirhorn();
                    fireEvilConfetti();
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-2 py-1 font-mono text-[10px] text-emerald-300 hover:bg-emerald-900/60"
                >
                  <PartyPopper className="h-3 w-3" />
                  Test Airhorn + Confetti
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "RESET_GAUNTLET", nowMs: Date.now() })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setPresenterOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Close presenter bar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ALL_STAGES.map((stg) => {
                const active = state.stage === stg;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => jumpToStage(stg)}
                    className={`rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {STAGE_METADATA[stg].shortTitle}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
