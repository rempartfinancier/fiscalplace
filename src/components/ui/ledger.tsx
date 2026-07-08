import type { ReactNode } from "react";

/**
 * THE signature element — "l'Écriture soldée" (the settled ledger entry).
 * Three reconciliation lines + the accountant's double rule:
 *   withheld (debit red) / owed by treaty (green, with treaty ref) /
 *   over-withholding to recover (gold highlight), then the double rule.
 * Variants: full entry (hero, simulator, country pages), micro gauge
 * (table cells, cards), progress gauge (portal claims).
 */

export function LedgerLine({
  label,
  amount,
  tone = "ink",
  sub,
  highlight = false,
  bold = false,
}: {
  label: ReactNode;
  amount: ReactNode;
  tone?: "ink" | "debit" | "brand" | "gold" | "mine";
  sub?: ReactNode;
  highlight?: boolean;
  bold?: boolean;
}) {
  const toneClass = {
    ink: "text-ink",
    debit: "text-debit",
    brand: "text-brand",
    gold: "text-gold-ink",
    mine: "text-mine",
  }[tone];
  return (
    <div className={highlight ? "-mx-2 rounded-[4px] bg-gold-wash px-2 py-1" : "py-1"}>
      <div className={`flex items-baseline text-[15px] ${toneClass} ${bold ? "font-semibold" : ""}`}>
        <span className="shrink-0">{label}</span>
        <span className="leaders" aria-hidden="true" />
        <span className="shrink-0 font-mono">{amount}</span>
      </div>
      {sub && <div className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-mine">{sub}</div>}
    </div>
  );
}

/** Two thin superposed rules — the universal sign of a settled total. */
export function DoubleRule({ className = "" }: { className?: string }) {
  return <div className={`double-rule h-[6px] w-full ${className}`} aria-hidden="true" />;
}

export interface LedgerEntryProps {
  withheldLabel: string;
  withheldAmount: string;
  owedLabel: string;
  owedAmount: string;
  treatyRef?: string;
  recoverLabel: string;
  recoverAmount: string;
  /** Draw the double rule under the entry (settled / result state). */
  settled?: boolean;
  footnote?: string;
  className?: string;
  animate?: boolean;
}

export function LedgerEntry({
  withheldLabel,
  withheldAmount,
  owedLabel,
  owedAmount,
  treatyRef,
  recoverLabel,
  recoverAmount,
  settled = true,
  footnote,
  className = "",
  animate = false,
}: LedgerEntryProps) {
  return (
    <div className={`rounded-[6px] border border-rule bg-white p-5 sm:p-6 ${className}`}>
      <div className={animate ? "animate-settle" : ""}>
        <LedgerLine label={withheldLabel} amount={withheldAmount} tone="debit" />
        <LedgerLine label={owedLabel} amount={owedAmount} tone="brand" sub={treatyRef} />
        <div className="my-2 border-t border-rule" aria-hidden="true" />
        <LedgerLine label={recoverLabel} amount={recoverAmount} tone="ink" highlight bold />
        {settled && <DoubleRule className="mt-3" />}
        {footnote && <p className="mt-3 text-[13px] leading-relaxed text-mine">{footnote}</p>}
      </div>
    </div>
  );
}

/**
 * Micro gauge (compact form): horizontal bar from 0 to the statutory rate.
 * Solid green segment = treaty rate; 45° gold hatching = recoverable gap.
 */
export function MicroGauge({
  statutoryRate,
  treatyRate,
  label,
  className = "",
}: {
  statutoryRate: number;
  treatyRate: number;
  label?: string;
  className?: string;
}) {
  const max = Math.max(statutoryRate, 0.0001);
  const treatyPct = (treatyRate / max) * 100;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="relative inline-block h-2 w-12 overflow-hidden rounded-[2px] border border-rule bg-white"
        role="img"
        aria-label={label}
      >
        <span className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${treatyPct}%` }} />
        <span
          className="absolute inset-y-0 hatch-gold"
          style={{ left: `${treatyPct}%`, right: 0 }}
        />
      </span>
      {label && <span className="font-mono text-xs text-gold-ink">{label}</span>}
    </span>
  );
}

/**
 * Progress gauge (portal form): a claim is an open entry whose gauge turns
 * from gold hatching (potential) to solid green (realised) as it progresses.
 */
export function ProgressGauge({
  progress,
  className = "",
  ariaLabel,
}: {
  /** 0–1 share of the pipeline completed. */
  progress: number;
  className?: string;
  ariaLabel?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <span
      className={`relative block h-2 w-full overflow-hidden rounded-[2px] border border-rule bg-white ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <span className="absolute inset-0 hatch-gold" />
      <span className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${pct}%` }} />
    </span>
  );
}
