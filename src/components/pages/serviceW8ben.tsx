import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  StatTile,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerEntry } from "@/components/ui/ledger";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";

/* ------------------------------------------------------------------ */
/* Local helpers                                                       */
/* ------------------------------------------------------------------ */

/** Mono, colour-coded numerals inside the Besley headline. */
function Num({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "debit" | "brand";
}) {
  const toneClass = { ink: "text-ink", debit: "text-debit", brand: "text-brand" }[tone];
  return <span className={`font-mono text-[0.85em] tracking-tight ${toneClass}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface StepItem {
  title: string;
  body: string;
}

interface PitfallItem {
  title: string;
  body: string;
}

interface BridgeItem {
  title: string;
  body: string;
  linkLabel: string;
}

interface W8Copy {
  metaTitle: (treatyPct: string, statutoryPct: string) => string;
  metaDescription: (price: string, statutoryPct: string, treatyPct: string) => string;
  hero: {
    kicker: string;
    h1: (treatyPct: string, statutoryPct: string) => ReactNode;
    sub: (price: string) => string;
    secondary: string;
  };
  ledger: {
    withheld: (pct: string) => string;
    owed: (pct: string) => string;
    treatyRef: string;
    recover: string;
    footnote: (gross: string) => string;
  };
  what: {
    kicker: string;
    title: string;
    lede: string;
    whatTitle: string;
    whatBody: (statutoryPct: string, treatyPct: string) => string;
    whoTitle: string;
    whoBody: (entityPrice: string) => string;
  };
  steps: { kicker: string; title: string; lede: string; items: StepItem[] };
  price: {
    kicker: string;
    title: string;
    lede: string;
    individualLabel: string;
    individualHint: string;
    entityLabel: string;
    entityHint: string;
    prepValue: string;
    prepLabel: string;
    validityValue: string;
    validityLabel: string;
  };
  pitfalls: {
    kicker: string;
    title: string;
    lede: string;
    items: PitfallItem[];
    recoveryLink: string;
  };
  bridges: {
    kicker: string;
    title: string;
    items: (v: { certPrice: string }) => BridgeItem[];
  };
  faq: {
    kicker: string;
    title: string;
    items: (v: { itinPrice: string; usSolYears: number; statutoryPct: string }) => FAQItem[];
  };
  finalCta: { title: string; lede: string };
}

const copy: Localized<W8Copy> = {
  fr: {
    metaTitle: (treatyPct, statutoryPct) =>
      `Formulaire W-8BEN : ${treatyPct} au lieu de ${statutoryPct} sur vos dividendes américains | FiscalPlace`,
    metaDescription: (price, statutoryPct, treatyPct) =>
      `Sans W-8BEN valide, le fisc américain prélève ${statutoryPct} sur chaque dividende au lieu de ${treatyPct}. Nous préparons votre formulaire pour ${price} : questionnaire de 5 minutes, remise guidée à votre courtier, rappel avant expiration.`,
    hero: {
      kicker: "Service à forfait · W-8BEN",
      h1: (treatyPct, statutoryPct) => (
        <>
          Vos dividendes américains taxés à <Num tone="brand">{treatyPct}</Num> au lieu de{" "}
          <Num tone="debit">{statutoryPct}</Num>, dès le prochain versement.
        </>
      ),
      sub: (price) =>
        `Le W-8BEN certifie à votre courtier que vous n'êtes pas résident fiscal américain — et déclenche le taux prévu par la convention. Nous le préparons ligne par ligne pour ${price} : vous répondez à un questionnaire, vous signez, votre courtier applique.`,
      secondary: "Comprendre le relief at source",
    },
    ledger: {
      withheld: (pct) => `Retenue sans W-8BEN (${pct})`,
      owed: (pct) => `Retenue avec W-8BEN (${pct})`,
      treatyRef: "Convention France–États-Unis · taux portefeuille",
      recover: "Préservé chaque année",
      footnote: (gross) => `Exemple pour ${gross} de dividendes américains bruts par an.`,
    },
    what: {
      kicker: "Comprendre",
      title: "C'est quoi, et pour qui ?",
      lede: "Trois pages de formulaire IRS, un effet immédiat sur chaque dividende américain que vous touchez.",
      whatTitle: "Ce que c'est",
      whatBody: (statutoryPct, treatyPct) =>
        `Le W-8BEN est la certification officielle par laquelle vous attestez, auprès de votre courtier, ne pas être résident fiscal des États-Unis. Sans ce document valide dans votre dossier, la retenue par défaut de ${statutoryPct} s'applique à chaque dividende américain. Avec, votre courtier applique directement le taux conventionnel de ${treatyPct} : c'est le mécanisme dit de relief at source — le bon taux dès le versement, rien à réclamer ensuite.`,
      whoTitle: "Pour qui",
      whoBody: (entityPrice) =>
        `Toute personne physique non résidente des États-Unis qui détient des actions américaines, quel que soit le courtier. Les sociétés, holdings patrimoniales et autres entités relèvent du W-8BEN-E — un formulaire plus long, avec des questions de classification supplémentaires — que nous préparons aussi, pour ${entityPrice}.`,
    },
    steps: {
      kicker: "La démarche",
      title: "Ce que nous faisons, concrètement",
      lede: "Quatre étapes, dont une seule vous demande plus de cinq minutes.",
      items: [
        {
          title: "Vous répondez à un questionnaire de cinq minutes",
          body: "Identité, adresse de résidence fiscale, numéro fiscal de votre pays, établissements concernés : tout ce dont le formulaire a besoin, demandé en langage clair — jamais en jargon IRS.",
        },
        {
          title: "Nous préparons le formulaire, ligne par ligne",
          body: "Chaque case est renseignée selon votre situation, y compris la partie conventionnelle — pays, article et taux revendiqués — celle qui, mal remplie, fait rejeter le formulaire ou maintient le taux plein.",
        },
        {
          title: "Vous signez, nous guidons la remise à votre courtier",
          body: "Chaque établissement a son canal : téléversement, courrier, module intégré. Vous recevez la marche à suivre exacte pour le vôtre, et un exemplaire prêt pour chacun de vos comptes.",
        },
        {
          title: "Nous notons l'échéance et vous prévenons avant l'expiration",
          body: "Un W-8BEN expire à la fin de la troisième année civile suivant sa signature. Nous vous alertons avant, pour re-signer à temps — sans jamais retomber au taux plein.",
        },
      ],
    },
    price: {
      kicker: "Prix & délais",
      title: "Un forfait, pas d'abonnement",
      lede: "Un prix affiché, payé une fois — et une date d'expiration que nous surveillons pour vous.",
      individualLabel: "W-8BEN — personne physique",
      individualHint: "forfait unique · toutes vos lignes US",
      entityLabel: "W-8BEN-E — sociétés & entités",
      entityHint: "questionnaire de classification inclus",
      prepValue: "≤ 2 j",
      prepLabel: "délai de préparation ouvré, une fois vos réponses reçues",
      validityValue: "3 ans",
      validityLabel: "validité maximale — jusqu'au 31 décembre de la 3e année suivant la signature",
    },
    pitfalls: {
      kicker: "Transparence",
      title: "Ce qui peut coincer",
      lede: "Le W-8BEN est simple en apparence. Voici les quatre pièges que nous voyons le plus souvent — et ce que nous y faisons.",
      items: [
        {
          title: "L'expiration silencieuse",
          body: "Le formulaire cesse d'être valable au 31 décembre de la troisième année civile suivant sa signature. Personne ne vous prévient : le taux plein revient sur vos dividendes sans un mot. Notre rappel d'échéance existe précisément pour ça.",
        },
        {
          title: "La partie conventionnelle mal renseignée",
          body: "La ligne 10 du formulaire — taux et article de convention revendiqués — concentre les erreurs : article inexact, taux mal reporté, champ laissé vide quand il était requis. Résultat : formulaire rejeté, ou taux plein maintenu sans que vous le sachiez.",
        },
        {
          title: "Un changement de situation l'invalide",
          body: "Déménagement, changement de résidence fiscale, changement de statut : le formulaire devient caduc et un nouveau doit être remis sous 30 jours. Signalez-nous le changement, nous refaisons le document.",
        },
        {
          title: "Il ne répare pas le passé",
          body: "Le W-8BEN n'a aucun effet rétroactif : les dividendes déjà prélevés au taux plein le restent. Pour ces montants-là, il faut une demande de remboursement — un autre service, facturé uniquement au succès.",
        },
      ],
      recoveryLink: "Récupérer ce qui a déjà été prélevé",
    },
    bridges: {
      kicker: "Et ensuite",
      title: "Le W-8BEN s'inscrit dans un ensemble",
      items: ({ certPrice }) => [
        {
          title: "Relief at source",
          body: "Le W-8BEN est l'exemple type du bon taux appliqué dès le versement. D'autres pays le permettent aussi — et certains l'excluent en pratique : voyez lesquels.",
          linkLabel: "Le taux réduit à la source, pays par pays",
        },
        {
          title: "Récupération du trop-perçu",
          body: "Pour les années où aucun W-8BEN valide n'était en place : nous chiffrons ce qui reste récupérable dans les délais, et nous déposons pour vous. Payés uniquement si vous l'êtes.",
          linkLabel: "Le service de récupération",
        },
        {
          title: "Certificat de résidence fiscale",
          body: `Inutile pour le W-8BEN lui-même, mais exigé dans la plupart des demandes de remboursement. Nous le préparons pour ${certPrice}.`,
          linkLabel: "Le service certificat de résidence",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur le W-8BEN",
      items: ({ itinPrice, usSolYears, statutoryPct }) => [
        {
          question: "Faut-il un ITIN pour remplir un W-8BEN ?",
          answer: `Non, en règle générale. Pour un portefeuille de titres classique, votre numéro fiscal national (en France, celui de votre avis d'imposition) suffit dans la case prévue. L'ITIN ne devient nécessaire que dans certaines demandes de remboursement déposées directement auprès de l'IRS — un service distinct, à ${itinPrice}, déduit de notre commission si vous nous confiez ensuite la récupération.`,
        },
        {
          question: "Mon courtier ne m'a jamais demandé de W-8BEN. C'est normal ?",
          answer: `Certains courtiers l'intègrent au parcours d'ouverture de compte, d'autres non — notamment quand la chaîne de détention passe par plusieurs intermédiaires. Le test le plus fiable reste votre relevé : si un dividende américain y apparaît amputé de ${statutoryPct}, aucun W-8BEN valide n'est en place chez cet établissement.`,
        },
        {
          question: "Un seul formulaire couvre-t-il tous mes comptes ?",
          answer:
            "Non : le W-8BEN se remet à chaque établissement teneur de compte. Les informations étant identiques, nous vous fournissons un exemplaire prêt à signer pour chacun de vos courtiers, dans le même forfait.",
        },
        {
          question: "J'ai été prélevé au taux plein pendant des années. C'est perdu ?",
          answer: `Pas nécessairement. Une demande de remboursement auprès de l'IRS reste possible dans la limite du délai de prescription — en règle générale ${usSolYears} ans à compter du prélèvement. Au-delà, c'est effectivement perdu : la date de votre plus ancien dividende sur-prélevé compte donc plus que son montant.`,
        },
      ],
    },
    finalCta: {
      title: "Le prochain dividende peut déjà tomber au bon taux.",
      lede: "Cinq minutes de questionnaire aujourd'hui, un formulaire prêt sous deux jours ouvrés, et plus jamais le taux plein par défaut.",
    },
  },
  en: {
    metaTitle: (treatyPct, statutoryPct) =>
      `W-8BEN form: ${treatyPct} instead of ${statutoryPct} on your US dividends | FiscalPlace`,
    metaDescription: (price, statutoryPct, treatyPct) =>
      `Without a valid W-8BEN, the US withholds ${statutoryPct} on every dividend instead of ${treatyPct}. We prepare your form for ${price}: a 5-minute questionnaire, guided delivery to your broker, a reminder before it expires.`,
    hero: {
      kicker: "Fixed-fee service · W-8BEN",
      h1: (treatyPct, statutoryPct) => (
        <>
          Your US dividends taxed at <Num tone="brand">{treatyPct}</Num> instead of{" "}
          <Num tone="debit">{statutoryPct}</Num>, from the very next payment.
        </>
      ),
      sub: (price) =>
        `The W-8BEN certifies to your broker that you are not a US tax resident — and triggers the treaty rate. We prepare it line by line for ${price}: you answer a questionnaire, you sign, your broker applies it.`,
      secondary: "Understand relief at source",
    },
    ledger: {
      withheld: (pct) => `Withheld without a W-8BEN (${pct})`,
      owed: (pct) => `Withheld with a W-8BEN (${pct})`,
      treatyRef: "France–US tax treaty · portfolio rate",
      recover: "Kept in your pocket, every year",
      footnote: (gross) => `Example based on ${gross} of gross US dividends per year.`,
    },
    what: {
      kicker: "The basics",
      title: "What it is, and who it is for",
      lede: "Three pages of IRS form, an immediate effect on every US dividend you receive.",
      whatTitle: "What it is",
      whatBody: (statutoryPct, treatyPct) =>
        `The W-8BEN is the official certification through which you attest to your broker that you are not a US tax resident. Without a valid one on file, the default ${statutoryPct} withholding hits every US dividend. With it, your broker applies the ${treatyPct} treaty rate directly: that is what relief at source means — the right rate at payment time, nothing to claim back afterwards.`,
      whoTitle: "Who it is for",
      whoBody: (entityPrice) =>
        `Any individual who is not a US resident and holds US shares, whatever the broker. Companies, family holding structures and other entities file the W-8BEN-E instead — a longer form with additional classification questions — which we also prepare, for ${entityPrice}.`,
    },
    steps: {
      kicker: "The process",
      title: "What we actually do",
      lede: "Four steps — only one of them takes you more than five minutes.",
      items: [
        {
          title: "You answer a five-minute questionnaire",
          body: "Identity, tax-residence address, your national tax number, the accounts involved: everything the form needs, asked in plain language — never in IRS jargon.",
        },
        {
          title: "We prepare the form, line by line",
          body: "Every box is completed for your situation, including the treaty section — country, article and rate claimed — the part that, done wrong, gets the form rejected or quietly keeps the full rate in place.",
        },
        {
          title: "You sign, we guide the handover to your broker",
          body: "Every institution has its own channel: upload, post, built-in module. You get the exact procedure for yours, plus a ready copy for each of your accounts.",
        },
        {
          title: "We log the deadline and warn you before it expires",
          body: "A W-8BEN expires at the end of the third calendar year after signature. We alert you ahead of time so you re-sign in time — and never fall back to the full rate.",
        },
      ],
    },
    price: {
      kicker: "Price & timing",
      title: "One fixed fee, no subscription",
      lede: "A published price, paid once — and an expiry date we track for you.",
      individualLabel: "W-8BEN — individuals",
      individualHint: "one-off fee · covers all your US holdings",
      entityLabel: "W-8BEN-E — companies & entities",
      entityHint: "classification questionnaire included",
      prepValue: "≤ 2 days",
      prepLabel: "working-day preparation time once we have your answers",
      validityValue: "3 yrs",
      validityLabel: "maximum validity — until 31 December of the 3rd year after signature",
    },
    pitfalls: {
      kicker: "Straight talk",
      title: "What can go wrong",
      lede: "The W-8BEN looks simple. Here are the four traps we see most often — and what we do about them.",
      items: [
        {
          title: "The silent expiry",
          body: "The form stops being valid on 31 December of the third calendar year after signature. Nobody warns you: the full rate quietly returns on your dividends. Our expiry reminder exists precisely for this.",
        },
        {
          title: "A botched treaty section",
          body: "Line 10 of the form — the treaty rate and article claimed — is where the mistakes pile up: wrong article, misstated rate, a field left blank when it was required. The result: a rejected form, or the full rate kept in place without your knowledge.",
        },
        {
          title: "A change in circumstances voids it",
          body: "Moving abroad, changing tax residence, changing status: the form becomes invalid and a new one must be provided within 30 days. Tell us about the change and we redo the document.",
        },
        {
          title: "It does not fix the past",
          body: "The W-8BEN has no retroactive effect: dividends already withheld at the full rate stay withheld. Those amounts need a refund claim — a separate service, charged only on success.",
        },
      ],
      recoveryLink: "Recover what was already withheld",
    },
    bridges: {
      kicker: "What comes next",
      title: "The W-8BEN is one piece of a system",
      items: ({ certPrice }) => [
        {
          title: "Relief at source",
          body: "The W-8BEN is the textbook case of the right rate applied at payment time. Other countries allow it too — and some rule it out in practice: see which.",
          linkLabel: "Reduced rates at source, country by country",
        },
        {
          title: "Withholding-tax recovery",
          body: "For the years when no valid W-8BEN was in place: we quantify what is still recoverable within the deadlines and file for you. We get paid only when you do.",
          linkLabel: "The recovery service",
        },
        {
          title: "Certificate of tax residence",
          body: `Not needed for the W-8BEN itself, but required in most refund claims. We prepare it for ${certPrice}.`,
          linkLabel: "The residence-certificate service",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your W-8BEN questions",
      items: ({ itinPrice, usSolYears, statutoryPct }) => [
        {
          question: "Do I need an ITIN to complete a W-8BEN?",
          answer: `As a general rule, no. For a standard securities portfolio, your national tax number (in France, the one on your tax notice) is enough in the relevant box. An ITIN only becomes necessary for certain refund claims filed directly with the IRS — a separate service at ${itinPrice}, deducted from our fee if you then entrust us with the recovery.`,
        },
        {
          question: "My broker never asked me for a W-8BEN. Is that normal?",
          answer: `Some brokers build it into account opening, others do not — especially when the custody chain runs through several intermediaries. The most reliable test is your statement: if a US dividend shows up docked by ${statutoryPct}, no valid W-8BEN is on file with that institution.`,
        },
        {
          question: "Does one form cover all my accounts?",
          answer:
            "No: the W-8BEN is filed with each account-holding institution. Since the information is identical, we provide a ready-to-sign copy for each of your brokers within the same fixed fee.",
        },
        {
          question: "I have been withheld at the full rate for years. Is that money gone?",
          answer: `Not necessarily. A refund claim with the IRS remains possible within the statute of limitations — as a general rule ${usSolYears} years from the withholding. Beyond that, it is indeed gone: the date of your oldest over-withheld dividend matters more than its amount.`,
        },
      ],
    },
    finalCta: {
      title: "Your next dividend can already land at the right rate.",
      lede: "Five minutes of questionnaire today, a form ready within two working days, and never the default full rate again.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  const us = getCountryById("US");
  const statutory = formatPercent(us?.statutoryRate ?? 0, locale);
  const treaty = formatPercent(us ? treatyRateFor(us, "FR") : 0, locale);
  const price = formatCurrency(PRICING.fixedServices.w8ben, locale);
  return {
    title: t.metaTitle(treaty, statutory),
    description: t.metaDescription(price, statutory, treaty),
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Illustration constant — the rates themselves come from @/data/countries. */
const EXAMPLE_GROSS_USD = 1_000;

const BRIDGE_ROUTES: RouteKey[] = ["serviceReliefAtSource", "serviceRecovery", "serviceResidenceCert"];

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const us = getCountryById("US");
  const statutoryRate = us?.statutoryRate ?? 0;
  const treatyRate = us ? treatyRateFor(us, "FR") : 0;
  const pStatutory = formatPercent(statutoryRate, locale);
  const pTreaty = formatPercent(treatyRate, locale);
  const fc = (n: number) => formatCurrency(n, locale);
  const usd = (n: number) => formatCurrency(n, locale, "USD");

  const faqItems = t.faq.items({
    itinPrice: fc(PRICING.fixedServices.itin),
    usSolYears: us?.sol.years ?? 0,
    statutoryPct: pStatutory,
  });
  const bridgeItems = t.bridges.items({
    certPrice: fc(PRICING.fixedServices.residenceCertificate),
  });

  return (
    <>
      {/* HERO */}
      <section>
        <Container wide className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl">
              {t.hero.h1(pTreaty, pStatutory)}
            </h1>
            <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-mine">
              {t.hero.sub(fc(PRICING.fixedServices.w8ben))}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={href(locale, "portalOnboarding")}>
                {common.cta.openAccount}
              </ButtonLink>
              <ButtonLink href={href(locale, "serviceReliefAtSource")} variant="ghost">
                {t.hero.secondary}
              </ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          <LedgerEntry
            withheldLabel={t.ledger.withheld(pStatutory)}
            withheldAmount={usd(-EXAMPLE_GROSS_USD * statutoryRate)}
            owedLabel={t.ledger.owed(pTreaty)}
            owedAmount={usd(-EXAMPLE_GROSS_USD * treatyRate)}
            treatyRef={t.ledger.treatyRef}
            recoverLabel={t.ledger.recover}
            recoverAmount={usd(EXAMPLE_GROSS_USD * (statutoryRate - treatyRate))}
            footnote={`${t.ledger.footnote(usd(EXAMPLE_GROSS_USD))} ${common.labels.illustrative}`}
          />
        </Container>
      </section>

      {/* WHAT / WHO */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.what.kicker} title={t.what.title} lede={t.what.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whatTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.what.whatBody(pStatutory, pTreaty)}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whoTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.what.whoBody(fc(PRICING.fixedServices.w8benE))}
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* STEPS */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.steps.kicker} title={t.steps.title} lede={t.steps.lede} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.items.map((step, i) => (
              <Card as="li" key={step.title} className="p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{step.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </section>

      {/* PRICE & TIMING */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.price.kicker} title={t.price.title} lede={t.price.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              value={fc(PRICING.fixedServices.w8ben)}
              label={t.price.individualLabel}
              hint={t.price.individualHint}
              tone="brand"
            />
            <StatTile
              value={fc(PRICING.fixedServices.w8benE)}
              label={t.price.entityLabel}
              hint={t.price.entityHint}
            />
            <StatTile value={t.price.prepValue} label={t.price.prepLabel} />
            <StatTile value={t.price.validityValue} label={t.price.validityLabel} tone="gold" />
          </div>
        </Container>
      </section>

      {/* PITFALLS */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.pitfalls.kicker} title={t.pitfalls.title} lede={t.pitfalls.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.pitfalls.items.map((item) => (
              <Card key={item.title} className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "serviceRecovery")}>
              {t.pitfalls.recoveryLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* BRIDGES */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.bridges.kicker} title={t.bridges.title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bridgeItems.map((item, i) => (
              <Card key={item.title} className="flex flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">{item.body}</p>
                <Link
                  href={href(locale, BRIDGE_ROUTES[i])}
                  className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
                >
                  {item.linkLabel} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={faqItems} className="mt-8" />
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-rule bg-white">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "portalOnboarding")}>
              {common.cta.openAccount}
            </ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink variant="ghost" href={href(locale, "contact")}>
              {common.cta.contactUs}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
