"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion } from "motion/react";
import {
  AlertTriangle,
  GripHorizontal,
  Hammer,
  Sparkles,
} from "lucide-react";
import { GauntletAction } from "@/lib/cancelState";
import { soundEngine } from "@/lib/soundEngine";
import { fireEvilConfetti } from "@/lib/confettiBurst";

interface Stage1Props {
  dispatch: React.Dispatch<GauntletAction>;
  onComplete: () => void;
}

interface DecoyBtn {
  id: string;
  label: string;
  sub: string;
  amount: number;
  x: number;
  y: number;
}

interface PhysicsBrickSpec {
  id: string;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  variant: "concrete" | "gold" | "cancel";
}

const EVADE_POSITIONS = [
  { x: 0, y: 0 },
  { x: 175, y: -68 },
  { x: -165, y: 64 },
  { x: 140, y: 72 },
];

const INITIAL_DECOYS: DecoyBtn[] = [
  {
    id: "decoy-turbo",
    label: "Confirm Turbomode (+$99/mo)",
    sub: "Doubles OCSP staple velocity",
    amount: 99,
    x: -155,
    y: -52,
  },
  {
    id: "decoy-cancel-cancel",
    label: "Cancel Cancelation",
    sub: "Abort churn & send Chad flowers",
    amount: 39,
    x: 150,
    y: 48,
  },
  {
    id: "decoy-yubi",
    label: "Order 50 Bonus YubiKeys",
    sub: "Express Overnight (+$2,450)",
    amount: 245,
    x: -20,
    y: 82,
  },
];

const PHYSICS_BODIES_SPEC: PhysicsBrickSpec[] = [
  {
    id: "real-cancel",
    label: "PROCEED TO CANCEL",
    sublabel: "Click once uncovered!",
    width: 210,
    height: 54,
    variant: "cancel",
  },
  {
    id: "brick-1",
    label: "KEEP 50% OFF?*",
    sublabel: "*For 4 minutes • Drag me aside",
    width: 250,
    height: 74,
    variant: "concrete",
  },
  {
    id: "brick-2",
    label: "50% OFF CONCRETE SLAB",
    sublabel: "Reinforced Retention Block #2",
    width: 265,
    height: 76,
    variant: "concrete",
  },
  {
    id: "brick-3",
    label: "FREE YUBIKEY LANYARD!",
    sublabel: "Worth $1.40 • Weighs 400 lbs",
    width: 235,
    height: 70,
    variant: "gold",
  },
  {
    id: "brick-4",
    label: "KEEP 50% OFF FOREVER-ISH",
    sublabel: "Heavy Enterprise Loyalty Brick",
    width: 255,
    height: 72,
    variant: "concrete",
  },
  {
    id: "brick-5",
    label: "THINK OF YOUR OCSP UPTIME",
    sublabel: "Zero-Trust Guilt Ballast",
    width: 240,
    height: 68,
    variant: "concrete",
  },
];

export function Stage1PhysicsSwarm({ dispatch, onComplete }: Stage1Props) {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [gravityCollapsed, setGravityCollapsed] = useState(false);
  const [decoyCountShown, setDecoyCountShown] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const decoyClickSeqRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const domRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesMapRef = useRef<Record<string, Matter.Body>>({});
  const dragInfoRef = useRef<{
    body: Matter.Body | null;
    constraint: Matter.Constraint | null;
    downX: number;
    downY: number;
    bodyId: string | null;
  }>({
    body: null,
    constraint: null,
    downX: 0,
    downY: 0,
    bodyId: null,
  });

  const handleEvadeAttempt = () => {
    if (gravityCollapsed) return;
    const nextCount = dodgeCount + 1;

    if (nextCount <= 3) {
      soundEngine.playRoboticServo();
      setDodgeCount(nextCount);
      setDecoyCountShown(nextCount);
      dispatch({
        type: "ADD_SURCHARGE",
        id: `button-evasion-${nextCount}`,
        label: `Cursor Evasion Wear-and-Tear #${nextCount}`,
        amount: 6.5,
        stage: 1,
        dedupe: true,
      });
      setStatusBanner(
        `Attempt ${nextCount}/3: Cancel button detected hostile intent and relocated!`
      );
    } else {
      // 4th attempt triggers Matter.js Gravity Collapse!
      soundEngine.playHeavyThud();
      soundEngine.playErrorBuzzer();
      setGravityCollapsed(true);
      dispatch({
        type: "TRIGGER_DARK_PATTERN",
        surcharge: {
          id: "gravity-collapse-fee",
          label: "UI Structural Collapse Cleanup Surcharge",
          amount: 24.99,
        },
      });
      setStatusBanner(
        "CRITICAL: UI load-bearing bolts snapped! Drag the concrete '50% OFF' blocks off the buried Cancel button!"
      );
    }
  };

  const handleDecoyClick = (decoy: DecoyBtn) => {
    soundEngine.playAirhorn();
    fireEvilConfetti();
    decoyClickSeqRef.current += 1;
    dispatch({
      type: "ACCIDENTAL_UPGRADE",
      id: `${decoy.id}-${decoyClickSeqRef.current}`,
      label: decoy.label,
      amount: decoy.amount,
    });
    setStatusBanner(`Tricked! Activated "${decoy.label}" — keep hunting the real button!`);
  };

  // Initialize Matter.js simulation when gravityCollapsed activates
  useEffect(() => {
    if (!gravityCollapsed) return;
    const container = arenaRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = 430;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.15, scale: 0.001 },
    });
    engineRef.current = engine;

    const wallThickness = 100;
    const floor = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 6,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true, friction: 0.85, restitution: 0.15 }
    );
    const ceiling = Matter.Bodies.rectangle(
      width / 2,
      -wallThickness / 2,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true }
    );
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2 + 4,
      height / 2,
      wallThickness,
      height * 2,
      { isStatic: true, restitution: 0.3 }
    );
    const rightWall = Matter.Bodies.rectangle(
      width + wallThickness / 2 - 4,
      height / 2,
      wallThickness,
      height * 2,
      { isStatic: true, restitution: 0.3 }
    );

    const createdBodies: Matter.Body[] = [floor, ceiling, leftWall, rightWall];
    const bodyLookup: Record<string, Matter.Body> = {};

    const centerX = width / 2;

    PHYSICS_BODIES_SPEC.forEach((spec, index) => {
      const isCancel = spec.id === "real-cancel";
      // Place real cancel button near the bottom center so concrete bricks pile directly on top of it
      const startX = isCancel
        ? centerX
        : centerX + ((index % 3) - 1) * 34;
      const startY = isCancel ? height - 48 : 35 + (index - 1) * 52;

      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        spec.width,
        spec.height,
        {
          label: spec.id,
          chamfer: { radius: 12 },
          restitution: isCancel ? 0.15 : 0.22,
          friction: 0.65,
          frictionAir: 0.018,
          density: isCancel ? 0.004 : 0.0025,
          angle: isCancel ? 0 : ((index % 2 === 0 ? 1 : -1) * 0.08),
        }
      );

      bodyLookup[spec.id] = body;
      createdBodies.push(body);
    });

    bodiesMapRef.current = bodyLookup;
    Matter.Composite.add(engine.world, createdBodies);

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(32, Math.max(8, now - lastTime));
      lastTime = now;
      Matter.Engine.update(engine, dt);

      // Keep real-cancel clamped safely inside horizontal bounds just in case
      const cancelBody = bodyLookup["real-cancel"];
      if (cancelBody) {
        const clampedX = Math.max(115, Math.min(width - 115, cancelBody.position.x));
        const clampedY = Math.max(40, Math.min(height - 32, cancelBody.position.y));
        if (
          clampedX !== cancelBody.position.x ||
          clampedY !== cancelBody.position.y
        ) {
          Matter.Body.setPosition(cancelBody, { x: clampedX, y: clampedY });
        }
      }

      for (const spec of PHYSICS_BODIES_SPEC) {
        const b = bodyLookup[spec.id];
        const el = domRefs.current[spec.id];
        if (b && el) {
          const x = b.position.x - spec.width / 2;
          const y = b.position.y - spec.height / 2;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
            1
          )}px, 0) rotate(${b.angle.toFixed(4)}rad)`;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
    };
  }, [gravityCollapsed]);

  const handleArenaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gravityCollapsed || !engineRef.current || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check non-cancel bricks first so blocks covering the cancel button intercept grabs!
    const brickBodies = PHYSICS_BODIES_SPEC.filter(
      (s) => s.id !== "real-cancel"
    )
      .map((s) => bodiesMapRef.current[s.id])
      .filter(Boolean);

    const hitBricks = Matter.Query.point(brickBodies, { x: px, y: py });
    let chosenBody: Matter.Body | null = hitBricks[0] ?? null;

    if (!chosenBody) {
      const cancelBody = bodiesMapRef.current["real-cancel"];
      if (cancelBody) {
        const hitCancel = Matter.Query.point([cancelBody], { x: px, y: py });
        chosenBody = hitCancel[0] ?? null;
      }
    }

    if (!chosenBody) return;

    arenaRef.current.setPointerCapture(e.pointerId);

    const constraint = Matter.Constraint.create({
      pointA: { x: px, y: py },
      bodyB: chosenBody,
      pointB: {
        x: px - chosenBody.position.x,
        y: py - chosenBody.position.y,
      },
      stiffness: 0.22,
      damping: 0.1,
    });

    Matter.Composite.add(engineRef.current.world, constraint);
    dragInfoRef.current = {
      body: chosenBody,
      constraint,
      downX: px,
      downY: py,
      bodyId: chosenBody.label,
    };
  };

  const handleArenaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragInfoRef.current;
    if (!drag.constraint || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    drag.constraint.pointA = {
      x: Math.max(16, Math.min(rect.width - 16, e.clientX - rect.left)),
      y: Math.max(16, Math.min(rect.height - 16, e.clientY - rect.top)),
    };
  };

  const releasePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragInfoRef.current;
    if (drag.constraint && engineRef.current) {
      Matter.Composite.remove(engineRef.current.world, drag.constraint);
    }

    if (arenaRef.current && drag.body) {
      const rect = arenaRef.current.getBoundingClientRect();
      const upX = e.clientX - rect.left;
      const upY = e.clientY - rect.top;
      const travel = Math.hypot(upX - drag.downX, upY - drag.downY);

      if (drag.bodyId === "real-cancel" && travel < 22) {
        soundEngine.playStageAdvance();
        onComplete();
      } else if (travel >= 22) {
        soundEngine.playHeavyThud();
      }
    }

    dragInfoRef.current = {
      body: null,
      constraint: null,
      downX: 0,
      downY: 0,
      bodyId: null,
    };
  };

  const handleBulldozerBlast = () => {
    if (!engineRef.current) return;
    soundEngine.playHeavyThud();
    dispatch({
      type: "ADD_SURCHARGE",
      id: `bulldozer-${Date.now()}`,
      label: "Emergency Hydraulic Brick Bulldozer Rental",
      amount: 35.0,
      stage: 1,
    });

    PHYSICS_BODIES_SPEC.forEach((spec, idx) => {
      if (spec.id === "real-cancel") return;
      const b = bodiesMapRef.current[spec.id];
      if (b) {
        Matter.Body.setVelocity(b, {
          x: (idx % 2 === 0 ? -1 : 1) * 14,
          y: -16,
        });
        Matter.Body.setAngularVelocity(b, (idx % 2 === 0 ? 1 : -1) * 0.25);
      }
    });
    setStatusBanner(
      "BULLDOZER FIRED! Click 'PROCEED TO CANCEL' before the concrete settles back over it!"
    );
  };

  const evadeOffset = EVADE_POSITIONS[Math.min(dodgeCount, 3)];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Stage Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
              Stage 1 • Decommissioning Intent &amp; Gravity Stress Test
            </div>
            <h1 className="text-lg font-bold">
              Confirm Primary Root CA Destruction
            </h1>
          </div>
          {gravityCollapsed ? (
            <button
              type="button"
              onClick={handleBulldozerBlast}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/30"
            >
              <Hammer className="h-3.5 w-3.5" />
              Blast Concrete Aside ($35.00 Fee)
            </button>
          ) : (
            <span className="rounded-full bg-slate-800 px-3 py-1 font-mono text-xs text-slate-300">
              Evasion Shield: {3 - dodgeCount} charges left
            </span>
          )}
        </div>

        {/* Status Banner */}
        <div className="border-b border-slate-100 bg-amber-50/80 px-6 py-2.5 text-xs font-medium text-amber-950 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            {statusBanner ??
              "Click 'Proceed to Cancel' below to confirm revoking 12,408 production mTLS certificates."}
          </span>
        </div>

        {/* Phase A: Evading Button + Lookalike Decoys */}
        {!gravityCollapsed ? (
          <div className="relative flex h-[430px] flex-col items-center justify-center overflow-hidden bg-slate-50 p-6">
            <div className="mb-8 max-w-md text-center space-y-1.5 pointer-events-none">
              <p className="text-sm font-semibold text-slate-800">
                Are you 100% positive you want to orphan 1,842 employee YubiKeys?
              </p>
              <p className="text-xs text-slate-500">
                Warning: Our retention buttons use military-grade cursor avoidance until exhausted.
              </p>
            </div>

            <div className="relative flex items-center justify-center w-full h-48">
              {/* Spawned Decoys */}
              {INITIAL_DECOYS.slice(0, decoyCountShown).map((decoy) => (
                <motion.button
                  key={decoy.id}
                  type="button"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: decoy.x,
                    y: decoy.y,
                  }}
                  onClick={() => handleDecoyClick(decoy)}
                  className="absolute rounded-xl bg-emerald-600 px-4 py-2.5 text-left text-xs font-bold text-white shadow-lg transition hover:bg-emerald-500"
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {decoy.label}
                  </span>
                  <span className="block text-[10px] font-normal text-emerald-100">
                    {decoy.sub}
                  </span>
                </motion.button>
              ))}

              {/* Evading Real Button */}
              <motion.button
                type="button"
                data-cancel-target="true"
                animate={{ x: evadeOffset.x, y: evadeOffset.y }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                onPointerEnter={handleEvadeAttempt}
                onClick={handleEvadeAttempt}
                className="relative z-10 rounded-xl border-2 border-rose-600 bg-white px-5 py-3 text-xs font-bold text-rose-700 shadow-md transition hover:bg-rose-50"
              >
                Proceed to Cancel ({dodgeCount}/3 Evasions)
              </motion.button>
            </div>
          </div>
        ) : (
          /* Phase B: Matter.js Rigid-Body Collapse Arena */
          <div
            ref={arenaRef}
            onPointerDown={handleArenaPointerDown}
            onPointerMove={handleArenaPointerMove}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
            className="relative h-[430px] w-full overflow-hidden bg-danger-stripes select-none touch-none cursor-grab active:cursor-grabbing"
          >
            {/* Arena Background Watermark */}
            <div className="pointer-events-none absolute inset-x-0 top-4 flex flex-col items-center text-center px-4">
              <span className="rounded-full bg-slate-900/90 px-3 py-1 font-mono text-[11px] font-bold text-amber-300 shadow">
                GRAVITY COLLAPSE ACTIVE • DRAG CONCRETE BLOCKS ASIDE &amp; CLICK &quot;PROCEED TO CANCEL&quot;
              </span>
            </div>

            {/* Rigid Body Synced DOM Elements */}
            {PHYSICS_BODIES_SPEC.map((spec) => {
              const isCancel = spec.variant === "cancel";
              const isGold = spec.variant === "gold";
              return (
                <div
                  key={spec.id}
                  ref={(el) => {
                    domRefs.current[spec.id] = el;
                  }}
                  data-cancel-target={isCancel ? "true" : undefined}
                  style={{
                    width: `${spec.width}px`,
                    height: `${spec.height}px`,
                    zIndex: isCancel ? 10 : 20,
                  }}
                  className={`pointer-events-none absolute left-0 top-0 flex flex-col items-center justify-center rounded-xl px-3 text-center shadow-xl will-change-transform ${
                    isCancel
                      ? "border-2 border-rose-500 bg-rose-600 text-white ring-4 ring-rose-500/30"
                      : isGold
                        ? "border-2 border-amber-500 bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950"
                        : "border-2 border-slate-500 bg-gradient-to-b from-slate-300 to-slate-400 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-tight">
                    {!isCancel ? (
                      <GripHorizontal className="h-3.5 w-3.5 opacity-60" />
                    ) : null}
                    {spec.label}
                  </div>
                  <div
                    className={`text-[10px] font-medium ${
                      isCancel ? "text-rose-100" : "text-slate-700"
                    }`}
                  >
                    {spec.sublabel}
                  </div>
                </div>
              );
            })}

            {/* Steel Hazard Floor Visual */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2.5 bg-hazard-stripes" />
          </div>
        )}
      </div>
    </div>
  );
}
