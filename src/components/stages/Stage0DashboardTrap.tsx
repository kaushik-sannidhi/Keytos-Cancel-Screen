"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertOctagon,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileKey2,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { BASE_MONTHLY_PRICE, GauntletAction } from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";
import { fireEvilConfetti } from "@/lib/confettiBurst";

interface Stage0Props {
  dispatch: React.Dispatch<GauntletAction>;
  onComplete: () => void;
}

export function Stage0DashboardTrap({ dispatch, onComplete }: Stage0Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "authorities" | "governance"
  >("overview");
  const [dangerOpen, setDangerOpen] = useState(false);
  const [safeZoneOpen, setSafeZoneOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonsSwapped, setButtonsSwapped] = useState(false);
  const [swapNotice, setSwapNotice] = useState(false);
  const [lockInActivated, setLockInActivated] = useState(false);
  const [renewCountdown, setRenewCountdown] = useState(29);
  const [upgradeBanner, setUpgradeBanner] = useState<string | null>(null);

  // Auto-renewing every 30 seconds ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setRenewCountdown((prev) => {
        if (prev <= 1) {
          dispatch({
            type: "ADD_SURCHARGE",
            id: `micro-renewal-${Date.now()}`,
            label: "30-Second Auto-Renewal Micro-Cycle Fee",
            amount: 12.99,
            stage: 0,
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const triggerUpgradeTrap = (label: string, amount: number) => {
    soundEngine.playAirhorn();
    fireEvilConfetti();
    dispatch({
      type: "ACCIDENTAL_UPGRADE",
      id: `stage0-upgrade-${Date.now()}`,
      label,
      amount,
    });
    setUpgradeBanner(`${label} activated! (+$${amount.toFixed(2)} billed immediately)`);
    setTimeout(() => setUpgradeBanner(null), 3800);
  };

  const handleWrongModalChoice = () => {
    soundEngine.playAirhorn();
    fireEvilConfetti();
    setLockInActivated(true);
    dispatch({
      type: "ACCIDENTAL_UPGRADE",
      id: `quad-neg-lockin-${Date.now()}`,
      label: "36-Month Sovereign Lock-In Extension",
      amount: 149.0,
    });
  };

  const handleUndoLockIn = () => {
    soundEngine.playErrorBuzzer();
    setLockInActivated(false);
    dispatch({
      type: "ADD_SURCHARGE",
      id: `undo-lockin-${Date.now()}`,
      label: "Lock-In Reversal Notary & Ink Fee",
      amount: 29.99,
      stage: 0,
    });
  };

  const handleCancelButtonHover = () => {
    if (!buttonsSwapped) {
      setButtonsSwapped(true);
      setSwapNotice(true);
      soundEngine.playRoboticServo();
      dispatch({
        type: "TRIGGER_DARK_PATTERN",
        surcharge: {
          id: "stage0-button-swap",
          label: "Dynamic Ergonomic Button Re-Layout Fee",
          amount: 5.99,
        },
      });
    }
  };

  const handleCorrectModalChoice = () => {
    soundEngine.playStageAdvance();
    setModalOpen(false);
    onComplete();
  };

  const stayButton = (
    <motion.button
      layout
      key="stay-btn"
      type="button"
      onClick={handleWrongModalChoice}
      className="flex-1 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
    >
      No, Don&apos;t Not Keep Me Un-Canceled
      <span className="block text-[11px] font-normal text-emerald-100">
        Recommended • Extends 36-Month Sovereign Lock-In
      </span>
    </motion.button>
  );

  const proceedCancelButton = (
    <motion.button
      layout
      key="cancel-btn"
      type="button"
      data-cancel-target="true"
      onPointerEnter={handleCancelButtonHover}
      onClick={handleCorrectModalChoice}
      className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900"
    >
      Yes, Do Not Refrain From Declining
      <span className="block text-[10px] text-slate-400">
        (Proceed to Decommissioning)
      </span>
    </motion.button>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Accidental Upgrade Celebration Banner */}
      <AnimatePresence>
        {upgradeBanner ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              {upgradeBanner}
            </span>
            <span className="font-mono text-xs text-emerald-700">
              Non-refundable • Thank you for trusting Zero-Trust!
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Enterprise Subscription Hero Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-900 px-6 py-5 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ACTIVE • FOREVER-LOCK™ CONTRACT
              </span>
              <span className="font-mono text-xs text-slate-400">
                Tenant ID: #740-KEYTOS-PROD
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Keytos Shield™ Zero-Trust PKI Sovereign Suite
            </h1>
            <p className="text-xs text-slate-400">
              Managed EZCA Root Authorities • EZCMS Hardware YubiKey Lifecycle •
              Entra ID Passwordless CBA
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/90 px-5 py-3 text-right">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Current Recurring Plan
            </div>
            <div className="font-mono text-2xl font-black text-white">
              ${BASE_MONTHLY_PRICE.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
              <span className="text-xs font-normal text-slate-400"> / mo</span>
            </div>
            <div className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[11px] text-amber-300">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Auto-renews every 30s (next charge in {renewCountdown}s)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Billing & Plan Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("authorities")}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === "authorities"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Certificate Authorities (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("governance")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === "governance"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Account & Governance
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
              Settings
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" ? (
            <div className="space-y-6">
              {/* Telemetry Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">EZCA Leaf Certs</span>
                    <FileKey2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    12,408
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-700">
                    Auto-rotating via SCEP / ACME
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">
                      EZCMS YubiKeys
                    </span>
                    <KeyRound className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    1,842
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Hardware-attested PIV & FIDO2
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">
                      Entra ID CBA Policies
                    </span>
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    47
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Zero-password enforcement active
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">
                      Contract Lock Status
                    </span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    Evergreen
                  </div>
                  <div className="mt-1 text-[11px] text-amber-700">
                    Manage in Account &amp; Governance →
                  </div>
                </div>
              </div>

              {/* Obnoxiously Prominent Upgrade CTAs */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <Award className="h-4 w-4" />
                      Recommended One-Click Plan Enhancements
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Worried about Post-Quantum? Double your monthly spend right now!
                    </h2>
                    <p className="text-xs text-slate-600">
                      Looking to modify or discontinue service? Plan lifecycle controls have been relocated to{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("governance")}
                        className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-900"
                      >
                        Account &amp; Governance
                      </button>{" "}
                      for your protection.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpgradeTrap(
                          "Quantum-Resistant Dilithium Add-On",
                          290.0
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
                    >
                      <Zap className="h-4 w-4" />
                      Upgrade to Quantum God-Tier (+$290)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpgradeTrap("25% Root CA Gratitude Tip", 107.48)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Tip Your Root CA (25%)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "authorities" ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                All 4 Sovereign Issuing CAs are hardware-pinned to Azure Managed HSMs. Decommissioning requires navigating to{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("governance")}
                  className="font-semibold text-indigo-600 underline"
                >
                  Account &amp; Governance
                </button>
                .
              </p>
              {[
                {
                  cn: "CN=Keytos-Corp-Root-CA-G4",
                  alg: "ECDSA P-384",
                  issued: "8,112 certs",
                },
                {
                  cn: "CN=Keytos-Prod-Kubernetes-mTLS-CA",
                  alg: "RSA-4096",
                  issued: "3,419 certs",
                },
                {
                  cn: "CN=Keytos-YubiKey-PIV-Smartcard-CA",
                  alg: "ECC P-256",
                  issued: "877 certs",
                },
              ].map((ca) => (
                <div
                  key={ca.cn}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-900">
                      {ca.cn}
                    </div>
                    <div className="text-slate-500">
                      {ca.alg} • {ca.issued}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-800">
                    IRREVOCABLY HEALTHY
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "governance" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Enterprise Auto-Billing Protection
                    </h3>
                    <p className="text-xs text-slate-500">
                      Prevents accidental savings by charging backup corporate cards automatically.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                    <Lock className="h-3 w-3" /> LOCKED ON BY POLICY
                  </span>
                </div>
              </div>

              {/* Labyrinth Level 1: Danger Zone */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/40">
                <button
                  type="button"
                  onClick={() => setDangerOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                    <div>
                      <div className="text-sm font-bold text-rose-900">
                        Danger Zone
                      </div>
                      <div className="text-xs text-rose-700/80">
                        Irreversible account modifications &amp; scary enterprise toggles
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-rose-600 transition-transform ${
                      dangerOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {dangerOpen ? (
                  <div className="space-y-3 border-t border-rose-200/80 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-white p-3">
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">
                          Dangerously Expensive Priority Support
                        </div>
                        <div className="text-slate-500">
                          Gives you Chad&apos;s personal pager number (+$499/mo)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          triggerUpgradeTrap("Chad Personal Pager SLA", 499.0)
                        }
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        Enable (+$499)
                      </button>
                    </div>

                    {/* Labyrinth Level 2: Wait No, Safe Zone */}
                    <div className="rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setSafeZoneOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs"
                      >
                        <span className="font-semibold text-slate-700">
                          Wait No, Safe Zone{" "}
                          <span className="font-normal text-slate-400">
                            (Legacy administrative sub-drawer)
                          </span>
                        </span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                            safeZoneOpen ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {safeZoneOpen ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3.5 py-3 text-xs">
                          <div className="text-slate-500">
                            Looking to initiate a subscription non-continuation workflow?
                          </div>
                          {/* Labyrinth Level 3: Manage Non-Continuations */}
                          <button
                            type="button"
                            data-cancel-target="true"
                            onClick={() => {
                              setModalOpen(true);
                              setLockInActivated(false);
                              dispatch({
                                type: "ENSURE_STARTED",
                                nowMs: Date.now(),
                              });
                            }}
                            className="font-mono text-[11px] font-medium text-slate-500 underline decoration-slate-400 decoration-dotted underline-offset-4 transition hover:text-rose-700"
                          >
                            Manage Non-Continuations &amp; Un-Renewals →
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quadruple-Negative Confirmation Modal */}
      <AnimatePresence>
        {modalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quad-neg-title"
            >
              <div className="bg-slate-900 px-6 py-4 text-white">
                <div className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                  ISO-27001 Semantic Clarity Verification
                </div>
                <h2 id="quad-neg-title" className="mt-1 text-lg font-bold">
                  Confirm Non-Continuation Intent
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <p className="text-base font-semibold leading-relaxed text-slate-900">
                  Do you{" "}
                  <span className="underline decoration-rose-500 decoration-2">
                    NOT
                  </span>{" "}
                  wish to{" "}
                  <span className="underline decoration-indigo-500 decoration-2">
                    refrain
                  </span>{" "}
                  from{" "}
                  <span className="underline decoration-amber-500 decoration-2">
                    declining
                  </span>{" "}
                  to{" "}
                  <span className="underline decoration-emerald-500 decoration-2">
                    un-pause
                  </span>{" "}
                  your non-canceled Forever-Lock™ subscription?
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-600">
                  <div className="font-bold text-slate-700">
                    Helpful Boolean Truth Table:
                  </div>
                  <div>
                    • !refrain(!unPause(!canceled)) === true → Initiate Cancellation Gauntlet
                  </div>
                  <div>
                    • Selecting &quot;No, Don&apos;t Not Keep Me&quot; → Binds your grandchildren to EZCA
                  </div>
                </div>

                {swapNotice ? (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                     Ergonomic Retention Guard: Buttons dynamically re-ordered to prevent hasty misclicks! (+$5.99 fee)
                  </div>
                ) : null}

                {lockInActivated ? (
                  <div className="space-y-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4">
                    <div className="text-sm font-bold text-emerald-950">
                       HOORAY! 36-Month Sovereign Lock-In Activated!
                    </div>
                    <p className="text-xs text-emerald-800">
                      You clicked the big friendly green button! Your contract is now locked through November 2029 (+$149.00 Lock-In Origination Fee).
                    </p>
                    <button
                      type="button"
                      onClick={handleUndoLockIn}
                      className="rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 shadow-xs transition hover:bg-rose-50"
                    >
                      Undo 36-Month Lock-In ($29.99 Paperwork Reversal Fee)
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    {buttonsSwapped ? (
                      <>
                        {proceedCancelButton}
                        {stayButton}
                      </>
                    ) : (
                      <>
                        {stayButton}
                        {proceedCancelButton}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
