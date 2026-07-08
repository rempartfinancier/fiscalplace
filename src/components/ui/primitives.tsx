import Link from "next/link";
import type { ReactNode } from "react";

/** Layout container — single rhythm across the whole site. */
export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-6xl" : "max-w-5xl"} px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-deep border border-brand hover:border-brand-deep",
  secondary: "bg-white text-ink border border-ink hover:bg-paper",
  ghost: "bg-transparent text-brand hover:underline underline-offset-4 border border-transparent",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-2.5 text-[15px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${BUTTON_BASE} ${BUTTON_STYLES[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button className={`${BUTTON_BASE} ${BUTTON_STYLES[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/** Card: white surface on paper background, 1px rule, no shadow. */
export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag className={`rounded-[6px] border border-rule bg-white ${className}`}>{children}</Tag>
  );
}

type BadgeTone = "green" | "gold" | "red" | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  green: "text-brand bg-tint-green border-brand/30",
  gold: "text-gold-ink bg-tint-gold border-gold/40",
  red: "text-debit bg-tint-red border-debit/30",
  neutral: "text-mine bg-paper border-rule",
};

/** Stamp-style status badge: mono uppercase, 1px rule, tinted background. */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** KPI tile: mono figure + label. */
export function StatTile({
  value,
  label,
  hint,
  tone = "ink",
}: {
  value: string;
  label: string;
  hint?: string;
  tone?: "ink" | "brand" | "gold" | "debit";
}) {
  const toneClass = {
    ink: "text-ink",
    brand: "text-brand",
    gold: "text-gold-ink",
    debit: "text-debit",
  }[tone];
  return (
    <Card className="p-5">
      <p className={`font-mono text-2xl font-medium ${toneClass}`}>{value}</p>
      <p className="mt-1 text-sm text-mine">{label}</p>
      {hint && <p className="mt-2 font-mono text-xs text-mine">{hint}</p>}
    </Card>
  );
}

/** Section heading: mono kicker + Besley title + optional lede. */
export function SectionHeading({
  kicker,
  title,
  lede,
  className = "",
  center = false,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  className?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      {kicker && (
        <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl text-balance">
        {title}
      </h2>
      {lede && (
        <p className={`mt-4 max-w-[68ch] text-[17px] leading-relaxed text-mine ${center ? "mx-auto" : ""}`}>
          {lede}
        </p>
      )}
    </div>
  );
}

/** The Sheridan trust line under primary CTAs — mono, quiet, always the same. */
export function TrustLine({ text, className = "" }: { text: string; className?: string }) {
  return <p className={`font-mono text-[13px] text-mine ${className}`}>{text}</p>;
}

/** Legal reference in official-mention style ("CDI FR-CH · 15 %"). */
export function TreatyRef({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[11px] uppercase tracking-wide text-mine ${className}`}>
      {children}
    </span>
  );
}
