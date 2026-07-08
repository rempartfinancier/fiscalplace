import { CLAIM_STAGES, STAGE_LABELS, type ClaimEvent, type ClaimStage } from "@/data/demo-portal";
import { formatDate, type Locale } from "@/lib/i18n";

/**
 * The 8-stage recovery pipeline. The only place on the site where numbered
 * steps are legitimate: this is a real chronological sequence.
 */

export function stageIndex(stage: ClaimStage): number {
  return CLAIM_STAGES.indexOf(stage);
}

/** Compact horizontal variant: dashboard cards. */
export function TimelineCompact({
  currentStage,
  locale,
}: {
  currentStage: ClaimStage;
  locale: Locale;
}) {
  const current = stageIndex(currentStage);
  return (
    <div>
      <div className="flex items-center gap-1" aria-hidden="true">
        {CLAIM_STAGES.map((stage, i) => (
          <span
            key={stage}
            className={`h-1.5 flex-1 rounded-[2px] ${
              i < current ? "bg-brand" : i === current ? "hatch-gold border border-gold/40" : "bg-rule"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-mine">
        {current + 1}/8 · {STAGE_LABELS[currentStage][locale]}
      </p>
    </div>
  );
}

/** Detailed vertical variant: claim detail page + marketing "how it works". */
export function TimelineVertical({
  currentStage,
  history = [],
  locale,
  descriptions,
}: {
  currentStage: ClaimStage;
  history?: ClaimEvent[];
  locale: Locale;
  /** Optional per-stage descriptions (marketing usage). */
  descriptions?: Partial<Record<ClaimStage, string>>;
}) {
  const current = stageIndex(currentStage);
  const eventFor = (stage: ClaimStage) => history.find((e) => e.stage === stage);
  return (
    <ol className="relative border-l border-rule pl-6">
      {CLAIM_STAGES.map((stage, i) => {
        const event = eventFor(stage);
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={stage} className="relative pb-6 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute -left-6 top-0.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border font-mono text-[10px] ${
                state === "done"
                  ? "border-brand bg-brand text-white"
                  : state === "current"
                    ? "border-gold bg-tint-gold text-gold-ink"
                    : "border-rule bg-white text-mine"
              }`}
            >
              {i + 1}
            </span>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <p
                className={`text-[15px] font-medium ${
                  state === "todo" ? "text-mine" : "text-ink"
                }`}
              >
                {STAGE_LABELS[stage][locale]}
              </p>
              {event && (
                <span className="font-mono text-xs text-mine">{formatDate(event.date, locale)}</span>
              )}
            </div>
            {event?.note && (
              <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-mine">
                {event.note[locale]}
              </p>
            )}
            {descriptions?.[stage] && (
              <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-mine">
                {descriptions[stage]}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
