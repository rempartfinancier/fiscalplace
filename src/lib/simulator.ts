import {
  type CountryTaxProfile,
  type Residence,
  recoveryGap,
  treatyRateFor,
} from "@/data/countries";
import { computeCommission, type CommissionResult } from "@/config/pricing";

/**
 * Refund estimation logic shared by the public simulator, the pricing page
 * examples and the portal onboarding. Pure functions, no UI.
 */

export interface SimulationInput {
  country: CountryTaxProfile;
  residence: Residence;
  /** Gross dividend amount in EUR for the period considered. */
  grossDividend: number;
}

export interface SimulationResult {
  statutoryRate: number;
  treatyRate: number;
  /** Recoverable rate gap (0–1). */
  gap: number;
  withheld: number;
  treatyDue: number;
  /** Estimated recoverable over-withholding, before fees. */
  recoverable: number;
  commission: CommissionResult;
  /** Net amount returned to the investor after the success fee. */
  netToClient: number;
  /** True when the gap is zero — honest "nothing to recover" case. */
  nothingToRecover: boolean;
  /** True when recoverable is positive but below the profitability advice threshold. */
  smallClaim: boolean;
}

/**
 * Below this recoverable amount we tell visitors plainly that the net gain is
 * marginal once the floor fee applies (transparency over conversion).
 */
export const SMALL_CLAIM_ADVICE_THRESHOLD = 60;

export function simulate({ country, residence, grossDividend }: SimulationInput): SimulationResult {
  const statutoryRate = country.statutoryRate;
  const treatyRate = treatyRateFor(country, residence);
  const gap = recoveryGap(country, residence);
  const withheld = grossDividend * statutoryRate;
  const treatyDue = grossDividend * treatyRate;
  const recoverable = grossDividend * gap;
  const commission = computeCommission(recoverable);
  return {
    statutoryRate,
    treatyRate,
    gap,
    withheld,
    treatyDue,
    recoverable,
    commission,
    netToClient: commission.net,
    nothingToRecover: gap === 0,
    smallClaim: recoverable > 0 && recoverable < SMALL_CLAIM_ADVICE_THRESHOLD,
  };
}
