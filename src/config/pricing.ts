/**
 * PRICING CONFIGURATION — single source of truth for every price shown anywhere
 * on the site (pricing page, simulator, CGV, service pages, portal invoices).
 *
 * These figures are a launch recommendation derived from market analysis, not
 * from FiscalPlace's real cost accounting. They are deliberately kept in this
 * isolated config layer so they can be adjusted after launch without touching
 * application logic. Do NOT copy these values into components: import them.
 */

export interface CommissionTier {
  /** Upper bound of the tier in EUR (Infinity for the last tier). */
  upTo: number;
  /** Commission rate applied to the slice of the recovered amount within this tier. */
  rate: number;
}

export const PRICING = {
  currency: "EUR",
  /**
   * Success fee: degressive, MARGINAL by tranche (like income-tax brackets) —
   * each slice of the recovered amount is charged at its own tier rate.
   * Charged ONLY on amounts actually recovered. No recovery, no fee.
   */
  successFeeTiers: [
    { upTo: 2_500, rate: 0.25 },
    { upTo: 15_000, rate: 0.18 },
    { upTo: 75_000, rate: 0.12 },
    { upTo: Infinity, rate: 0.08 },
  ] as CommissionTier[],
  /** Minimum fee per successfully recovered claim. Never charged upfront, never charged on failure. */
  floorFee: 39,
  /** The commission never exceeds this amount per claim, whatever the recovery. */
  capFee: 5_000,
  /** Above this recovered amount, institutional/family-office volume pricing is quoted individually. */
  institutionalThreshold: 75_000,

  /** Fixed-fee standalone services (one-off, VAT treatment defined in CGV). */
  fixedServices: {
    w8ben: 49,
    w8benE: 129,
    residenceCertificate: 79,
    itin: 149, // deducted from the success fee if the client upgrades to full recovery
    priorityHandling: 89, // per claim close to its statute-of-limitations deadline
  },

  /** Recurring subscription: monitoring & alerts, per portfolio. */
  subscription: {
    monthly: 19,
    yearly: 149,
  },

  /**
   * Partner programme (CGP / wealth managers): share of the success fee
   * FiscalPlace actually collects on referred claims, paid to the partner.
   */
  partnerRevShare: 0.2,

  /**
   * Human-review threshold used by the automation pipeline: claims whose
   * estimated recovery exceeds this amount always get a final human check
   * before filing (compliance guardrail — configurable, never removable).
   */
  humanReviewThreshold: 10_000,
} as const;

export interface CommissionBreakdownLine {
  from: number;
  to: number;
  rate: number;
  fee: number;
}

export interface CommissionResult {
  /** Final fee after floor and cap. */
  fee: number;
  /** Fee before floor/cap adjustments. */
  marginalFee: number;
  breakdown: CommissionBreakdownLine[];
  floorApplied: boolean;
  capApplied: boolean;
  effectiveRate: number;
  net: number;
}

/** Compute the success fee for a recovered amount, per the public grid. */
export function computeCommission(recovered: number): CommissionResult {
  const breakdown: CommissionBreakdownLine[] = [];
  let marginalFee = 0;
  let lower = 0;
  for (const tier of PRICING.successFeeTiers) {
    if (recovered <= lower) break;
    const upper = Math.min(recovered, tier.upTo);
    const slice = upper - lower;
    const fee = slice * tier.rate;
    breakdown.push({ from: lower, to: upper, rate: tier.rate, fee });
    marginalFee += fee;
    lower = tier.upTo;
  }
  let fee = marginalFee;
  let floorApplied = false;
  let capApplied = false;
  if (recovered > 0 && fee < PRICING.floorFee) {
    fee = PRICING.floorFee;
    floorApplied = true;
  }
  if (fee > PRICING.capFee) {
    fee = PRICING.capFee;
    capApplied = true;
  }
  return {
    fee,
    marginalFee,
    breakdown,
    floorApplied,
    capApplied,
    effectiveRate: recovered > 0 ? fee / recovered : 0,
    net: Math.max(0, recovered - fee),
  };
}
