import { Suspense } from "react";

import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { formatCurrency } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { COUNTRIES, DATA_VERSION } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import { ButtonLink, Card, Container, SectionHeading, TrustLine } from "@/components/ui/primitives";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SolCalculatorTool } from "@/components/site/SolCalculatorTool";

/* ---------------------------------------------------- data-derived figures */

const N_COUNTRIES = COUNTRIES.length;
const MIN_YEARS = Math.min(...COUNTRIES.map((c) => c.sol.years));
const MAX_YEARS = Math.max(...COUNTRIES.map((c) => c.sol.years));
const SHORTEST = COUNTRIES.reduce((a, b) => (b.sol.years < a.sol.years ? b : a));
const PRIORITY_FEE = {
  fr: formatCurrency(PRICING.fixedServices.priorityHandling, "fr"),
  en: formatCurrency(PRICING.fixedServices.priorityHandling, "en"),
} as const;

const CALENDAR_COUNTRIES = COUNTRIES.filter((c) => c.sol.rule === "calendar-year-end");
const ANNIVERSARY_COUNTRIES = COUNTRIES.filter((c) => c.sol.rule === "anniversary");

/* ----------------------------------------------------------------- copy */

interface PageCopy {
  metaTitle: string;
  metaDescription: string;
  hero: { kicker: string; title: string; lede: string };
  toolFallback: string;
  rules: {
    kicker: string;
    title: string;
    lede: string;
    calendar: { title: string; body: string };
    anniversary: { title: string; body: string };
    yearsUnit: string;
    verifyMark: string;
    warning: { title: string; body: string; dataLine: string };
  };
  faq: { kicker: string; title: string; items: { question: string; answer: string }[] };
  final: { title: string; body: string };
}

const copy: Localized<PageCopy> = {
  fr: {
    metaTitle: "Calculateur de délais de prescription — dividendes étrangers",
    metaDescription: `Chaque pays a sa propre horloge : de ${MIN_YEARS} à ${MAX_YEARS} ans pour récupérer la retenue à la source sur un dividende étranger. Entrez la date de versement et obtenez votre date limite, pays par pays. Gratuit, sans compte.`,
    hero: {
      kicker: "Outil self-service · Gratuit · Sans compte",
      title: "Calculateur de délais de prescription",
      lede: `Chaque administration fiscale a sa propre horloge : de ${MIN_YEARS} à ${MAX_YEARS} ans pour réclamer le trop-perçu, décomptés tantôt depuis le versement, tantôt depuis la fin de l'année. Passé la date, l'argent est perdu définitivement — c'est la seule vraie urgence de ce métier. Entrez la date de votre dividende : ce calculateur vous dit combien de temps il vous reste, pays par pays.`,
    },
    toolFallback: "Chargement du calculateur…",
    rules: {
      kicker: "Les règles simplifiées",
      title: "Deux façons de compter, un même couperet",
      lede: `Toutes les administrations accordent un délai pour réclamer, mais elles ne le décomptent pas de la même façon. Deux logiques couvrent nos ${N_COUNTRIES} pays.`,
      calendar: {
        title: "Fin d'année civile",
        body: "Le compteur ne démarre qu'au 31 décembre de l'année du versement. Conséquence contre-intuitive : un dividende encaissé en janvier profite de presque un an de délai « gratuit » par rapport à un dividende de décembre de la même année — les deux expirent le même jour.",
      },
      anniversary: {
        title: "Date anniversaire",
        body: "Le compteur démarre le jour du versement, jour pour jour. Chaque ligne de dividende a donc sa propre date limite : un portefeuille qui distribue tous les trimestres égrène des échéances toute l'année.",
      },
      yearsUnit: "ans",
      verifyMark: "donnée à confirmer",
      warning: {
        title: "Ce que ce calculateur ne garantit pas",
        body: "Ces règles sont volontairement simplifiées. Certains pays décomptent selon leur propre année fiscale, qui ne se termine pas toujours au 31 décembre ; d'autres font dépendre le calcul de la date de dépôt d'une déclaration. Les lignes marquées « donnée à confirmer » portent une incertitude connue. C'est pourquoi la date exacte de votre dossier est systématiquement recalculée et vérifiée avant tout dépôt — et si elle est déjà passée, nous vous le disons au lieu de déposer un dossier voué au rejet.",
        dataLine: `Base pays — version ${DATA_VERSION} · délais indicatifs, revus régulièrement`,
      },
    },
    faq: {
      kicker: "FAQ",
      title: "Questions fréquentes sur la prescription",
      items: [
        {
          question: "Que se passe-t-il une fois le délai dépassé ?",
          answer:
            "Le trop-perçu est définitivement perdu. Aucune administration n'instruit une demande hors délai, et aucun prestataire — nous compris — ne peut y changer quoi que ce soit. Si quelqu'un vous promet de récupérer un dividende prescrit, c'est un signal d'alarme, pas une solution.",
        },
        {
          question: "Le délai est-il le même dans tous les pays ?",
          answer: `Non. Sur les ${N_COUNTRIES} pays que nous couvrons, il va de ${MIN_YEARS} ans (le plus court, ${SHORTEST.name.fr}) à ${MAX_YEARS} ans, et le point de départ varie : parfois la date du versement, parfois la fin de l'année civile. C'est précisément ce que ce calculateur compare pour vous.`,
        },
        {
          question: "La date affichée est-elle contractuelle ?",
          answer:
            "Non : c'est une règle simplifiée, calculée à partir de données revues régulièrement mais indicatives. Avant tout dépôt, nous recalculons la date exacte de votre dossier (année fiscale locale, date de dépôt de déclaration, cas particuliers) et nous vous confirmons si la fenêtre est encore ouverte.",
        },
        {
          question: "Mon délai expire dans moins de 6 mois : que faire ?",
          answer: `Ouvrir le dossier sans attendre. Le traitement prioritaire (${PRIORITY_FEE.fr} par dossier proche de la prescription, en plus de la commission au succès) place votre demande en tête de file. Et si la vérification montre que la date exacte est déjà passée, nous vous le disons avant toute démarche.`,
        },
      ],
    },
    final: {
      title: "La date limite n'est que la moitié de la question",
      body: "L'autre moitié : combien ces dividendes peuvent vous rendre. Le simulateur chiffre votre trop-perçu en deux minutes, sans créer de compte.",
    },
  },
  en: {
    metaTitle: "Statute-of-limitations deadline calculator — foreign dividends",
    metaDescription: `Every country runs its own clock: ${MIN_YEARS} to ${MAX_YEARS} years to reclaim over-withheld tax on a foreign dividend. Enter the payment date and get your filing deadline, country by country. Free, no account needed.`,
    hero: {
      kicker: "Self-service tool · Free · No account",
      title: "Deadline calculator for withholding-tax refunds",
      lede: `Every tax administration runs its own clock: ${MIN_YEARS} to ${MAX_YEARS} years to reclaim the over-withholding, counted sometimes from the payment date, sometimes from the end of the year. Once the date has passed, the money is permanently lost — that is the one real urgency in this business. Enter your dividend's payment date: this calculator tells you how much time you have left, country by country.`,
    },
    toolFallback: "Loading the calculator…",
    rules: {
      kicker: "The simplified rules",
      title: "Two ways of counting, one same cut-off",
      lede: `Every administration grants a claim window, but they do not count it the same way. Two logics cover our ${N_COUNTRIES} countries.`,
      calendar: {
        title: "Calendar year-end",
        body: "The clock only starts on 31 December of the payment year. The counter-intuitive consequence: a dividend received in January enjoys almost a full 'free' year compared with a December dividend from the same year — both expire on the same day.",
      },
      anniversary: {
        title: "Anniversary date",
        body: "The clock starts on the payment day, to the day. Each dividend line therefore has its own deadline: a portfolio that distributes every quarter drops due dates all year round.",
      },
      yearsUnit: "yrs",
      verifyMark: "to be confirmed",
      warning: {
        title: "What this calculator cannot guarantee",
        body: "These rules are deliberately simplified. Some countries count by their own tax year, which does not always end on 31 December; others make the computation depend on when a tax return was filed. Lines marked 'to be confirmed' carry known uncertainty. That is why your claim's exact deadline is always recomputed and verified before any filing — and if it has already passed, we tell you rather than file a claim doomed to rejection.",
        dataLine: `Country database — version ${DATA_VERSION} · indicative deadlines, reviewed regularly`,
      },
    },
    faq: {
      kicker: "FAQ",
      title: "Frequently asked questions about limitation periods",
      items: [
        {
          question: "What happens once the deadline has passed?",
          answer:
            "The over-withheld tax is permanently lost. No administration processes a late claim, and no provider — us included — can change that. If someone promises to recover a time-barred dividend, that is a red flag, not a solution.",
        },
        {
          question: "Is the deadline the same in every country?",
          answer: `No. Across the ${N_COUNTRIES} countries we cover, it runs from ${MIN_YEARS} years (the shortest, ${SHORTEST.name.en}) to ${MAX_YEARS} years, and the starting point varies: sometimes the payment date, sometimes the end of the calendar year. That is exactly what this calculator compares for you.`,
        },
        {
          question: "Is the displayed date contractual?",
          answer:
            "No: it is a simplified rule, computed from data that is reviewed regularly but remains indicative. Before any filing, we recompute your claim's exact deadline (local tax year, return filing date, special cases) and confirm whether the window is still open.",
        },
        {
          question: "My deadline expires in under 6 months — what should I do?",
          answer: `Open the claim without waiting. Priority handling (${PRIORITY_FEE.en} per claim close to its limitation deadline, on top of the success fee) moves your claim to the front of the queue. And if verification shows the exact date has already passed, we tell you before starting anything.`,
        },
      ],
    },
    final: {
      title: "The deadline is only half the question",
      body: "The other half: how much these dividends can give back. The simulator puts a figure on your over-withholding in two minutes, no account needed.",
    },
  },
};

/* ------------------------------------------------------------------- page */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[24ch] font-display text-4xl font-semibold text-ink sm:text-5xl text-balance">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.hero.lede}</p>
        </Container>
      </section>

      {/* Tool */}
      <section>
        <Container className="py-10 sm:py-12">
          <Suspense
            fallback={
              <Card className="p-8 text-center">
                <p className="font-mono text-sm text-mine">{t.toolFallback}</p>
              </Card>
            }
          >
            <SolCalculatorTool locale={locale} />
          </Suspense>
        </Container>
      </section>

      {/* Simplified rules */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <SectionHeading kicker={t.rules.kicker} title={t.rules.title} lede={t.rules.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.rules.calendar.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.rules.calendar.body}</p>
              <ul className="mt-4">
                {CALENDAR_COUNTRIES.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-baseline justify-between gap-3 border-t border-rule py-1.5 first:border-t-0"
                  >
                    <span className="text-sm text-ink">
                      <span aria-hidden="true">{c.flag}</span> {c.name[locale]}
                      {c.sol.verify && (
                        <span className="text-gold-ink" title={t.rules.verifyMark}>
                          {" "}
                          *
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-sm text-ink">
                      {c.sol.years} {t.rules.yearsUnit}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.rules.anniversary.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">
                {t.rules.anniversary.body}
              </p>
              <ul className="mt-4">
                {ANNIVERSARY_COUNTRIES.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-baseline justify-between gap-3 border-t border-rule py-1.5 first:border-t-0"
                  >
                    <span className="text-sm text-ink">
                      <span aria-hidden="true">{c.flag}</span> {c.name[locale]}
                      {c.sol.verify && (
                        <span className="text-gold-ink" title={t.rules.verifyMark}>
                          {" "}
                          *
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-sm text-ink">
                      {c.sol.years} {t.rules.yearsUnit}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="mt-4 border-gold/40 bg-tint-gold p-5 sm:p-6">
            <h3 className="font-display text-xl font-semibold text-ink">
              {t.rules.warning.title}
            </h3>
            <p className="mt-2 max-w-[72ch] text-[15px] leading-relaxed text-ink">
              {t.rules.warning.body}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-gold-ink">
              {t.rules.warning.dataLine}
            </p>
          </Card>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-12 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={t.faq.items} className="mt-8" />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 sm:py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl text-balance">
            {t.final.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-[17px] leading-relaxed text-mine">
            {t.final.body}
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <TrustLine text={common.trustLine} />
          </div>
        </Container>
      </section>
    </>
  );
}
