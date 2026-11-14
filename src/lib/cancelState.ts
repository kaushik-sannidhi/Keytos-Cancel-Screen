export type GauntletStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SurchargeItem {
  id: string;
  label: string;
  amount: number;
  stage: number;
}

export interface GauntletState {
  stage: GauntletStage;
  startedAtMs: number;
  accidentalUpgrades: number;
  darkPatternsTriggered: number;
  surcharges: SurchargeItem[];
  muted: boolean;
}

export const BASE_MONTHLY_PRICE = 4299.0;

export interface StageMeta {
  stage: GauntletStage;
  shortTitle: string;
  portalTitle: string;
  nonEuclideanStep: string;
  fakePercentDisplay: string;
  barFillPercent: number;
  barColorClass: string;
  pkiPanicHeadline: string;
}

export const STAGE_METADATA: Record<GauntletStage, StageMeta> = {
  0: {
    stage: 0,
    shortTitle: "0: Portal Trap",
    portalTitle: "Subscription & Sovereign PKI Governance",
    nonEuclideanStep: "Step 0 of 1 (Easy 1-Click Self-Service!)",
    fakePercentDisplay: "0% Canceled",
    barFillPercent: 8,
    barColorClass: "bg-indigo-600",
    pkiPanicHeadline:
      "EZCA TELEMETRY: 12,408 production mTLS leaf certificates healthy • Auto-renewing every 30s",
  },
  1: {
    stage: 1,
    shortTitle: "1: Gravity Swarm",
    portalTitle: "Primary Root CA Decommissioning Confirmation",
    nonEuclideanStep: "Step 1 of 3",
    fakePercentDisplay: "33.3̄% Complete",
    barFillPercent: 34,
    barColorClass: "bg-amber-500",
    pkiPanicHeadline:
      "WARNING: Hovering near Cancel degrades OCSP responder morale by 42%",
  },
  2: {
    stage: 2,
    shortTitle: "2: Guilt Survey",
    portalTitle: "Mandatory Churn Attribution & Intern Allocation",
    nonEuclideanStep: "Step 2.75 of 3",
    fakePercentDisplay: "91.6% (ish)",
    barFillPercent: 78,
    barColorClass: "bg-orange-500",
    pkiPanicHeadline:
      "HR NOTICE: Summer PKI Fellow Toby's badge access tied directly to Tenant #740",
  },
  3: {
    stage: 3,
    shortTitle: "3: Soul CAPTCHA",
    portalTitle: "Zero-Trust Cold-Heartedness & Regret Attestation",
    nonEuclideanStep: "Step √(-1) of 3",
    fakePercentDisplay: "404i% Imaginary",
    barFillPercent: 52,
    barColorClass: "bg-rose-600",
    pkiPanicHeadline:
      "CRITICAL: Revoking Root CA-01 will brick 1,842 YubiKeys and 1 Executive Espresso Machine",
  },
  4: {
    stage: 4,
    shortTitle: "4: Speed Trap",
    portalTitle: "Terms of Abandonment & Eternal CRL Liability",
    nonEuclideanStep: "Step 9 of 4",
    fakePercentDisplay: "225% Over-Indexed",
    barFillPercent: 94,
    barColorClass: "bg-purple-600",
    pkiPanicHeadline:
      "PKI HIGHWAY PATROL ACTIVE: Strict 180 px/s reading speed limit enforced in Legal Zone",
  },
  5: {
    stage: 5,
    shortTitle: "5: Nuclear Keys",
    portalTitle: "FIPS 140-3 Level 9 Dual-Custodian HSM Destruction",
    nonEuclideanStep: "Step ∞ - 1 of 3",
    fakePercentDisplay: "-14% Complete",
    barFillPercent: 14,
    barColorClass: "bg-red-600",
    pkiPanicHeadline:
      "DEFCON 1: Dual-Custodian cryptographic turnkeys required to shred Master Root Key",
  },
  6: {
    stage: 6,
    shortTitle: "6: 2094 Receipt",
    portalTitle: "Svalbard Permafrost Carrier-Pigeon Queue (#CRL-000001)",
    nonEuclideanStep: "Step 3 of 3 (Pending 68-Yr Analog Transit)",
    fakePercentDisplay: "99.9991% Queued",
    barFillPercent: 99,
    barColorClass: "bg-emerald-600",
    pkiPanicHeadline:
      "DISPATCHED: Arctic Carrier Pigeon 'Barnaby II' en route to Longyearbyen Vault (ETA Nov 2094)",
  },
};

export const INITIAL_GAUNTLET_STATE: GauntletState = {
  stage: 0,
  startedAtMs: 0,
  accidentalUpgrades: 0,
  darkPatternsTriggered: 0,
  surcharges: [
    {
      id: "init-convenience",
      label: "Self-Service Portal Lookup Fee",
      amount: 9.99,
      stage: 0,
    },
  ],
  muted: false,
};

export type GauntletAction =
  | { type: "ENSURE_STARTED"; nowMs: number }
  | { type: "SET_STAGE"; stage: GauntletStage; nowMs?: number }
  | { type: "NEXT_STAGE"; nowMs?: number }
  | {
      type: "ADD_SURCHARGE";
      id: string;
      label: string;
      amount: number;
      stage?: number;
      dedupe?: boolean;
    }
  | { type: "TRIGGER_DARK_PATTERN"; surcharge?: Omit<SurchargeItem, "stage"> }
  | {
      type: "ACCIDENTAL_UPGRADE";
      label: string;
      amount: number;
      id: string;
    }
  | { type: "TOGGLE_MUTE"; feeId: string }
  | { type: "RESET_GAUNTLET"; nowMs: number };

export function gauntletReducer(
  state: GauntletState,
  action: GauntletAction
): GauntletState {
  switch (action.type) {
    case "ENSURE_STARTED": {
      if (state.startedAtMs > 0) return state;
      return { ...state, startedAtMs: action.nowMs };
    }
    case "SET_STAGE": {
      return {
        ...state,
        stage: action.stage,
        startedAtMs: state.startedAtMs || action.nowMs || 0,
      };
    }
    case "NEXT_STAGE": {
      const next = Math.min(6, state.stage + 1) as GauntletStage;
      return {
        ...state,
        stage: next,
        startedAtMs: state.startedAtMs || action.nowMs || 0,
      };
    }
    case "ADD_SURCHARGE": {
      if (action.dedupe && state.surcharges.some((s) => s.id === action.id)) {
        return state;
      }
      const item: SurchargeItem = {
        id: action.id,
        label: action.label,
        amount: action.amount,
        stage: action.stage ?? state.stage,
      };
      return {
        ...state,
        surcharges: [...state.surcharges, item],
      };
    }
    case "TRIGGER_DARK_PATTERN": {
      const nextSurcharges = action.surcharge
        ? [
            ...state.surcharges,
            {
              ...action.surcharge,
              stage: state.stage,
            },
          ]
        : state.surcharges;
      return {
        ...state,
        darkPatternsTriggered: state.darkPatternsTriggered + 1,
        surcharges: nextSurcharges,
      };
    }
    case "ACCIDENTAL_UPGRADE": {
      return {
        ...state,
        accidentalUpgrades: state.accidentalUpgrades + 1,
        darkPatternsTriggered: state.darkPatternsTriggered + 1,
        surcharges: [
          ...state.surcharges,
          {
            id: action.id,
            label: action.label,
            amount: action.amount,
            stage: state.stage,
          },
        ],
      };
    }
    case "TOGGLE_MUTE": {
      const nextMuted = !state.muted;
      const surchargeLabel = nextMuted
        ? "Peace & Quiet Surcharge (Mute Tax)"
        : "Acoustic Re-Engagement Provisioning Fee";
      return {
        ...state,
        muted: nextMuted,
        surcharges: [
          ...state.surcharges,
          {
            id: action.feeId,
            label: surchargeLabel,
            amount: 4.99,
            stage: state.stage,
          },
        ],
      };
    }
    case "RESET_GAUNTLET": {
      return {
        ...INITIAL_GAUNTLET_STATE,
        startedAtMs: action.nowMs,
      };
    }
    default:
      return state;
  }
}

export function getTotalSurcharges(surcharges: SurchargeItem[]): number {
  return surcharges.reduce((sum, item) => sum + item.amount, 0);
}

export interface HostilityRank {
  grade: string;
  title: string;
  citation: string;
}

export function computeHostilityRank(state: GauntletState): HostilityRank {
  const score =
    state.darkPatternsTriggered * 15 +
    state.accidentalUpgrades * 25 +
    state.surcharges.length * 8;

  if (score >= 90) {
    return {
      grade: "S+",
      title: "CERTIFIED PKI MASOCHIST",
      citation:
        "Triggered nearly every retention landmine, financed Chad's third jet-ski, and still refused to stay.",
    };
  }
  if (score >= 55) {
    return {
      grade: "S",
      title: "ZERO-TRUST HERETIC SUPREME",
      citation:
        "Fired Toby without flinching, overpowered a robotic compliance arm, and survived quadruple negatives.",
    };
  }
  return {
    grade: "A+",
    title: "COLD-BLOODED ROOT REVOKER",
    citation:
      "Sliced through enterprise retention psychological warfare with terrifying precision.",
  };
}
