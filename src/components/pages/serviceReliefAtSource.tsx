import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, countryHref, type RouteKey } from "@/lib/routes";
import { COUNTRIES, getCountryById, recoveryGap, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  StatTile,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerEntry } from "@/components/ui/ledger";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";
import { LeadCaptureButton } from "@/components/site/LeadCaptureButton";

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

interface ReliefCopy {
  metaTitle: string;
  metaDescription: string;
  leadServiceLabel: string;
  hero: {
    kicker: string;
    h1: string;
    sub: string;
    secondary: string;
  };
  ledger: {
    withheld: (pct: string) => string;
    owed: (pct: string) => string;
    treatyRef: (country: string) => string;
    recover: string;
    footnote: (gross: string, country: string) => string;
  };
  what: {
    kicker: string;
    title: string;
    lede: string;
    whatTitle: string;
    whatBody: string;
    whoTitle: string;
    whoBody: string;
  };
  map: {
    kicker: string;
    title: string;
    lede: string;
    possibleTitle: string;
    possibleBadge: string;
    impossibleTitle: string;
    impossibleBadge: string;
    impossibleNote: string;
    ratesNote: string;
  };
  steps: { kicker: string; title: string; lede: string; items: StepItem[] };
  price: {
    kicker: string;
    title: string;
    lede: string;
    w8benLabel: string;
    w8benELabel: string;
    certLabel: string;
    auditValue: string;
    auditLabel: string;
  };
  pitfalls: {
    kicker: string;
    title: string;
    lede: string;
    items: (recoveryOnlyNames: string) => PitfallItem[];
    recoveryLink: string;
  };
  bridges: { kicker: string; title: string; items: BridgeItem[] };
  faq: {
    kicker: string;
    title: string;
    items: (v: {
      chName: string;
      chStatutory: string;
      chTreaty: string;
      w8benPrice: string;
      certPrice: string;
    }) => FAQItem[];
  };
  finalCta: { title: string; lede: string };
}

const copy: Localized<ReliefCopy> = {
  fr: {
    metaTitle:
      "Relief at source : le taux conventionnel appliqué dès le versement, pays par pays",
    metaDescription:
      "Le relief at source, c'est le bon taux de retenue appliqué au moment où le dividende tombe — rien à récupérer ensuite. Nous mettons en place les documents pays par pays, à forfait, et nous vous disons honnêtement où le mécanisme n'existe pas.",
    leadServiceLabel: "Relief at source",
    hero: {
      kicker: "Service à forfait · relief at source",
      h1: "Le meilleur trop-perçu est celui qu'on ne vous prélève jamais.",
      sub: "Le relief at source, c'est le taux conventionnel appliqué dès le versement du dividende, au lieu du taux plein suivi d'une demande de remboursement. Quand le pays et votre courtier le permettent, c'est la voie la plus efficace — nous préparons les documents qui l'activent, à forfait.",
      secondary: "Récupérer le passé",
    },
    ledger: {
      withheld: (pct) => `Retenue par défaut (${pct})`,
      owed: (pct) => `Dû par convention (${pct})`,
      treatyRef: (country) => `Exonération conventionnelle · ${country}`,
      recover: "Évité à la source, chaque année",
      footnote: (gross, country) =>
        `Exemple pour ${gross} de dividendes bruts de source ${country} avec déclaration d'exemption en place.`,
    },
    what: {
      kicker: "Comprendre",
      title: "C'est quoi, et pour qui ?",
      lede: "Deux chemins mènent au taux conventionnel : avant le prélèvement, ou après. Celui-ci est le chemin d'avant.",
      whatTitle: "Ce que c'est",
      whatBody:
        "Chaque convention fiscale plafonne la retenue qu'un pays peut prélever sur vos dividendes. Le relief at source consiste à faire appliquer ce taux réduit directement au versement : le bon document, remis au bon intermédiaire avant la date de détachement, et le trop-perçu n'existe tout simplement jamais. Pas de formulaire de remboursement, pas d'attente de douze mois, pas de commission — juste le bon taux, tout de suite.",
      whoTitle: "Pour qui",
      whoBody:
        "Tout investisseur qui détient des titres de pays où le mécanisme existe — États-Unis, Irlande, Canada, Japon, Australie notamment — et dont le courtier accepte de transmettre le statut. C'est le complément naturel de la récupération : on solde le passé par une demande de remboursement, on protège l'avenir par le relief at source.",
    },
    map: {
      kicker: "Le registre",
      title: "Où c'est possible, où ça ne l'est pas",
      lede: "La moitié du travail consiste à savoir où le mécanisme existe réellement pour un particulier. Voici la réponse, pays par pays.",
      possibleTitle: "Taux réduit possible dès le versement",
      possibleBadge: "à la source",
      impossibleTitle: "Pas de voie praticable pour un particulier",
      impossibleBadge: "récupération uniquement",
      impossibleNote:
        "Pour ces pays, personne ne peut vous éviter le prélèvement au taux plein — quiconque le promet se trompe. La seule voie est la demande de remboursement a posteriori : c'est exactement notre service de récupération.",
      ratesNote:
        "Taux affichés pour une résidence fiscale en France — montants indicatifs, vérifiés dossier par dossier.",
    },
    steps: {
      kicker: "La démarche",
      title: "Ce que nous faisons, concrètement",
      lede: "Un audit honnête d'abord, les documents ensuite — jamais l'inverse.",
      items: [
        {
          title: "Nous auditons vos lignes et votre courtier — gratuitement",
          body: "Vos relevés suffisent : quels pays, quels taux réellement appliqués aujourd'hui, et ce que votre courtier est capable de transmettre à la source. Si rien n'est activable, vous le savez sans avoir rien payé.",
        },
        {
          title: "Nous préparons les documents, pays par pays",
          body: "W-8BEN pour les États-Unis, déclaration d'exemption pour l'Irlande, formulaires conventionnels là où le pays les accepte : chaque document au format exigé, à forfait.",
        },
        {
          title: "Vous les remettez à votre courtier, avec nos instructions",
          body: "C'est l'intermédiaire qui applique le taux : nous vous donnons la marche à suivre exacte pour votre établissement, et ce qu'il faut lui demander de confirmer par écrit.",
        },
        {
          title: "Nous contrôlons le premier dividende suivant",
          body: "Le taux réellement appliqué est vérifié sur le versement d'après. S'il est toujours faux, vous le savez immédiatement — et le trop-perçu part en récupération avant de s'accumuler.",
        },
      ],
    },
    price: {
      kicker: "Prix",
      title: "Les briques du relief at source, à forfait",
      lede: "Le relief at source n'est pas un abonnement : c'est un jeu de documents corrects, en place au bon moment. Chacun a un prix public.",
      w8benLabel: "W-8BEN — dividendes américains, personne physique",
      w8benELabel: "W-8BEN-E — entités",
      certLabel: "certificat de résidence — quand le pays l'exige à la source",
      auditValue: "0 €",
      auditLabel: "l'audit initial de vos lignes et de votre courtier",
    },
    pitfalls: {
      kicker: "Transparence",
      title: "Ce qui peut coincer",
      lede: "Le relief at source est le mécanisme le plus efficace du secteur — quand il fonctionne. Voici ses quatre limites réelles.",
      items: (recoveryOnlyNames) => [
        {
          title: "Tous les courtiers ne le proposent pas",
          body: "Appliquer un taux conventionnel à la source suppose une infrastructure : transmettre votre statut à la chaîne de dépôt, gérer des taux différenciés par client. Certains intermédiaires ne l'ont tout simplement pas — ce n'est pas de la mauvaise volonté, c'est structurel. Votre document peut être parfait et le taux plein continuer de tomber : notre audit vous dit ce que votre courtier peut réellement appliquer, avant que vous ne payiez quoi que ce soit.",
        },
        {
          title: "Des pays entiers l'excluent pour les particuliers",
          body: `${recoveryOnlyNames} : dans ces pays, aucune voie praticable n'existe à la source pour un investisseur individuel. Le prélèvement au taux plein est inévitable — et la récupération a posteriori est le seul chemin vers votre argent.`,
        },
        {
          title: "Les chaînes de dépositaires font perdre le statut",
          body: "Même avec un courtier bien paramétré, un titre qui transite par plusieurs dépositaires peut voir le taux plein appliqué : le statut se perd en route. C'est fréquent sur les comptes multi-intermédiaires — d'où notre contrôle systématique du premier versement suivant.",
        },
        {
          title: "Rien n'est rétroactif",
          body: "Le relief at source protège les dividendes à venir, pas ceux d'hier. Ce qui a déjà été prélevé au taux plein reste dû — dans la limite des délais de prescription, qui courent déjà.",
        },
      ],
      recoveryLink: "Récupérer ce qui a déjà été prélevé",
    },
    bridges: {
      kicker: "Et ensuite",
      title: "Protéger l'avenir, solder le passé",
      items: [
        {
          title: "Récupération du trop-perçu",
          body: "Le relief at source ne règle que l'avenir. Pour les années déjà prélevées au taux plein — et pour tous les pays sans voie à la source —, la demande de remboursement reste le seul chemin. Sans avance de frais.",
          linkLabel: "Le service de récupération",
        },
        {
          title: "Formulaire W-8BEN",
          body: "Le cas d'école du relief at source : la certification qui fait passer vos dividendes américains au taux conventionnel dès le versement.",
          linkLabel: "Le service W-8BEN",
        },
        {
          title: "Certificat de résidence fiscale",
          body: "Certains pays conditionnent le taux réduit à la source à cette preuve délivrée par votre administration. Nous la préparons à forfait.",
          linkLabel: "Le service certificat de résidence",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur le relief at source",
      items: ({ chName, chStatutory, chTreaty, w8benPrice, certPrice }) => [
        {
          question: "Mon courtier applique déjà le bon taux sur mes dividendes américains. Ai-je besoin de vous ?",
          answer:
            "Pour les États-Unis, non — et nous préférons vous le dire : un taux conventionnel appliqué signifie qu'un W-8BEN valide est en place. Vérifiez simplement sa date, car il expire à la fin de la troisième année civile suivant la signature. La question mérite ensuite d'être posée pour vos autres lignes : Irlande, Canada, Japon, Australie…",
        },
        {
          question: `Et pour mes actions suisses ?`,
          answer: `Rien à faire à la source : la ${chName} ne propose pas de voie praticable pour un particulier. ${chStatutory} sont prélevés, ${chTreaty} sont dus par convention, et l'écart se récupère uniquement a posteriori — c'est d'ailleurs le dossier de récupération le plus rentable d'Europe.`,
        },
        {
          question: "Dois-je changer de courtier pour un établissement qui gère le relief at source ?",
          answer:
            "Ce n'est pas à nous de vous le dire : le choix d'un courtier engage bien d'autres critères — frais, marchés, service — et nous ne recommandons aucun établissement. Notre rôle est factuel : vous dire précisément ce que votre courtier actuel peut appliquer, et récupérer ce qui passe à travers.",
        },
        {
          question: "Combien ça coûte au total ?",
          answer: `Cela dépend de vos lignes. Un portefeuille uniquement américain se règle avec un W-8BEN à ${w8benPrice}. Ajoutez un certificat de résidence à ${certPrice} si un pays l'exige à la source. L'audit initial, lui, est gratuit — comme le diagnostic de récupération.`,
        },
      ],
    },
    finalCta: {
      title: "Le bon taux au prochain versement, la récupération pour le reste.",
      lede: "Envoyez vos relevés : l'audit vous dit gratuitement ce qui est activable à la source, et ce qui doit passer par la récupération.",
    },
  },
  en: {
    metaTitle:
      "Relief at source: the treaty rate applied at payment time, country by country",
    metaDescription:
      "Relief at source means the right withholding rate applied the moment the dividend lands — nothing to claw back afterwards. We set up the documents country by country, at fixed fees, and tell you honestly where the mechanism does not exist.",
    leadServiceLabel: "Relief at source",
    hero: {
      kicker: "Fixed-fee service · relief at source",
      h1: "The best over-withholding is the kind that never gets taken.",
      sub: "Relief at source means the treaty rate applied when the dividend is paid, instead of the full rate followed by a refund claim. Where the country and your broker allow it, it is the most efficient route — we prepare the documents that switch it on, at fixed fees.",
      secondary: "Recover the past",
    },
    ledger: {
      withheld: (pct) => `Default withholding (${pct})`,
      owed: (pct) => `Owed by treaty (${pct})`,
      treatyRef: (country) => `Treaty exemption · ${country}`,
      recover: "Avoided at source, every year",
      footnote: (gross, country) =>
        `Example based on ${gross} of gross dividends from ${country} with an exemption declaration in place.`,
    },
    what: {
      kicker: "The basics",
      title: "What it is, and who it is for",
      lede: "Two roads lead to the treaty rate: before the withholding, or after. This is the road before.",
      whatTitle: "What it is",
      whatBody:
        "Every tax treaty caps the withholding a country may take on your dividends. Relief at source means having that reduced rate applied directly at payment: the right document, filed with the right intermediary before the ex-date, and the over-withholding simply never exists. No refund form, no twelve-month wait, no fee — just the right rate, right away.",
      whoTitle: "Who it is for",
      whoBody:
        "Any investor holding securities from countries where the mechanism exists — the United States, Ireland, Canada, Japan and Australia in particular — and whose broker will pass the status along. It is the natural complement to recovery: you settle the past with a refund claim, you protect the future with relief at source.",
    },
    map: {
      kicker: "The ledger",
      title: "Where it works, and where it does not",
      lede: "Half the job is knowing where the mechanism actually exists for an individual. Here is the answer, country by country.",
      possibleTitle: "Reduced rate possible at payment time",
      possibleBadge: "at source",
      impossibleTitle: "No practical route for individuals",
      impossibleBadge: "recovery only",
      impossibleNote:
        "In these countries nobody can spare you the full-rate withholding — anyone promising otherwise is wrong. The only route is the after-the-fact refund claim: that is exactly our recovery service.",
      ratesNote:
        "Rates shown for a French tax residence — indicative figures, verified claim by claim.",
    },
    steps: {
      kicker: "The process",
      title: "What we actually do",
      lede: "An honest audit first, the documents second — never the other way round.",
      items: [
        {
          title: "We audit your holdings and your broker — for free",
          body: "Your statements are enough: which countries, which rates are actually applied today, and what your broker can pass through at source. If nothing can be activated, you know it without having paid a thing.",
        },
        {
          title: "We prepare the documents, country by country",
          body: "A W-8BEN for the United States, an exemption declaration for Ireland, treaty forms where the country accepts them: each document in the required format, at a fixed fee.",
        },
        {
          title: "You hand them to your broker, with our instructions",
          body: "The intermediary is the one who applies the rate: we give you the exact procedure for your institution, and what to ask it to confirm in writing.",
        },
        {
          title: "We check the very next dividend",
          body: "The rate actually applied is verified on the following payment. If it is still wrong, you know immediately — and the over-withholding goes into recovery before it piles up.",
        },
      ],
    },
    price: {
      kicker: "Pricing",
      title: "The building blocks of relief at source, at fixed fees",
      lede: "Relief at source is not a subscription: it is a set of correct documents, in place at the right time. Each has a public price.",
      w8benLabel: "W-8BEN — US dividends, individuals",
      w8benELabel: "W-8BEN-E — entities",
      certLabel: "residence certificate — where the country requires it at source",
      auditValue: "€0",
      auditLabel: "the initial audit of your holdings and your broker",
    },
    pitfalls: {
      kicker: "Straight talk",
      title: "What can go wrong",
      lede: "Relief at source is the most efficient mechanism in the field — when it works. Here are its four real limits.",
      items: (recoveryOnlyNames) => [
        {
          title: "Not every broker offers it",
          body: "Applying a treaty rate at source takes infrastructure: passing your status down the custody chain, handling per-client rates. Some intermediaries simply do not have it — not bad faith, just structure. Your document can be perfect and the full rate keep landing: our audit tells you what your broker can actually apply, before you pay anything.",
        },
        {
          title: "Entire countries rule it out for individuals",
          body: `${recoveryOnlyNames}: in these countries there is no practical route at source for an individual investor. The full-rate withholding is unavoidable — and the after-the-fact refund is the only way to your money.`,
        },
        {
          title: "Custody chains lose the status en route",
          body: "Even with a well-configured broker, a security that passes through several custodians can end up withheld at the full rate: the status gets lost along the way. It is common on multi-intermediary accounts — hence our systematic check of the very next payment.",
        },
        {
          title: "Nothing is retroactive",
          body: "Relief at source protects tomorrow's dividends, not yesterday's. What was already withheld at the full rate remains owed to you — within the limitation periods, which are already running.",
        },
      ],
      recoveryLink: "Recover what was already withheld",
    },
    bridges: {
      kicker: "What comes next",
      title: "Protect the future, settle the past",
      items: [
        {
          title: "Withholding-tax recovery",
          body: "Relief at source only fixes the future. For the years already withheld at the full rate — and for every country with no route at source — the refund claim remains the only way. No upfront fees.",
          linkLabel: "The recovery service",
        },
        {
          title: "W-8BEN form",
          body: "The textbook case of relief at source: the certification that moves your US dividends to the treaty rate from the very next payment.",
          linkLabel: "The W-8BEN service",
        },
        {
          title: "Certificate of tax residence",
          body: "Some countries make the reduced rate at source conditional on this proof from your own administration. We prepare it at a fixed fee.",
          linkLabel: "The residence-certificate service",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your relief-at-source questions",
      items: ({ chName, chStatutory, chTreaty, w8benPrice, certPrice }) => [
        {
          question: "My broker already applies the right rate on my US dividends. Do I need you?",
          answer:
            "For the United States, no — and we would rather tell you: a treaty rate being applied means a valid W-8BEN is in place. Just check its date, as it expires at the end of the third calendar year after signature. The question is then worth asking for your other holdings: Ireland, Canada, Japan, Australia…",
        },
        {
          question: "What about my Swiss shares?",
          answer: `Nothing can be done at source: ${chName} offers no practical route for individuals. ${chStatutory} is withheld, ${chTreaty} is owed by treaty, and the gap can only be recovered after the fact — which happens to be the most rewarding recovery file in Europe.`,
        },
        {
          question: "Should I switch to a broker that handles relief at source?",
          answer:
            "That is not ours to say: choosing a broker involves many other criteria — fees, markets, service — and we recommend no institution. Our role is factual: telling you precisely what your current broker can apply, and recovering whatever slips through.",
        },
        {
          question: "How much does it cost in total?",
          answer: `It depends on your holdings. A US-only portfolio is solved with a ${w8benPrice} W-8BEN. Add a ${certPrice} residence certificate if a country requires one at source. The initial audit is free — like the recovery diagnostic.`,
        },
      ],
    },
    finalCta: {
      title: "The right rate on the next payment, recovery for the rest.",
      lede: "Send your statements: the audit tells you for free what can be activated at source, and what needs to go through recovery.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Illustration constant — the rates themselves come from @/data/countries. */
const EXAMPLE_GROSS = 1_000;

const BRIDGE_ROUTES: RouteKey[] = ["serviceRecovery", "serviceW8ben", "serviceResidenceCert"];

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const fc = (n: number) => formatCurrency(n, locale);
  const fp = (rate: number) => formatPercent(rate, locale, 3);

  /* Country split — computed from the data module, never hardcoded. */
  const possible = COUNTRIES.filter((c) => c.reliefAtSource && recoveryGap(c, "FR") > 0);
  const recoveryOnly = COUNTRIES.filter((c) => !c.reliefAtSource && recoveryGap(c, "FR") > 0);
  const recoveryOnlyNames = recoveryOnly.map((c) => c.name[locale]).join(" · ");

  /* Hero example: Ireland, the most spectacular relief case in the panel. */
  const ie = getCountryById("IE");
  const ieStatutory = ie?.statutoryRate ?? 0;
  const ieTreaty = ie ? treatyRateFor(ie, "FR") : 0;
  const ieName = ie?.name[locale] ?? "";

  const ch = getCountryById("CH");
  const faqItems = t.faq.items({
    chName: ch?.name[locale] ?? "",
    chStatutory: formatPercent(ch?.statutoryRate ?? 0, locale),
    chTreaty: formatPercent(ch ? treatyRateFor(ch, "FR") : 0, locale),
    w8benPrice: fc(PRICING.fixedServices.w8ben),
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
              {t.hero.h1}
            </h1>
            <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-mine">{t.hero.sub}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <LeadCaptureButton serviceLabel={t.leadServiceLabel}>
                {common.cta.openAccount}
              </LeadCaptureButton>
              <ButtonLink href={href(locale, "serviceRecovery")} variant="ghost">
                {t.hero.secondary}
              </ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          <LedgerEntry
            withheldLabel={t.ledger.withheld(formatPercent(ieStatutory, locale))}
            withheldAmount={fc(-EXAMPLE_GROSS * ieStatutory)}
            owedLabel={t.ledger.owed(formatPercent(ieTreaty, locale))}
            owedAmount={fc(-EXAMPLE_GROSS * ieTreaty)}
            treatyRef={t.ledger.treatyRef(ieName)}
            recoverLabel={t.ledger.recover}
            recoverAmount={fc(EXAMPLE_GROSS * (ieStatutory - ieTreaty))}
            footnote={`${t.ledger.footnote(fc(EXAMPLE_GROSS), ieName)} ${common.labels.illustrative}`}
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
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.what.whatBody}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whoTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.what.whoBody}</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* COUNTRY MAP */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.map.kicker} title={t.map.title} lede={t.map.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {t.map.possibleTitle}
                </h3>
                <Badge tone="green">{t.map.possibleBadge}</Badge>
              </div>
              <ul className="mt-4 divide-y divide-rule">
                {possible.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <Link
                      href={countryHref(locale, c.slug[locale])}
                      className="flex items-center gap-2 text-[15px] font-medium text-ink hover:text-brand"
                    >
                      <span aria-hidden="true">{c.flag}</span>
                      {c.name[locale]}
                    </Link>
                    <span className="shrink-0 font-mono text-sm">
                      <span className="text-debit">{fp(c.statutoryRate)}</span>
                      <span className="text-mine"> → </span>
                      <span className="text-brand">{fp(treatyRateFor(c, "FR"))}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {t.map.impossibleTitle}
                </h3>
                <Badge tone="gold">{t.map.impossibleBadge}</Badge>
              </div>
              <ul className="mt-4 divide-y divide-rule">
                {recoveryOnly.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <Link
                      href={countryHref(locale, c.slug[locale])}
                      className="flex items-center gap-2 text-[15px] font-medium text-ink hover:text-brand"
                    >
                      <span aria-hidden="true">{c.flag}</span>
                      {c.name[locale]}
                    </Link>
                    <span className="shrink-0 font-mono text-sm">
                      <span className="text-debit">{fp(c.statutoryRate)}</span>
                      <span className="text-mine"> → </span>
                      <span className="text-brand">{fp(treatyRateFor(c, "FR"))}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-relaxed text-mine">
                {t.map.impossibleNote}
              </p>
            </Card>
          </div>
          <p className="mt-3 text-[13px] text-mine">{t.map.ratesNote}</p>
        </Container>
      </section>

      {/* STEPS */}
      <section className="border-y border-rule bg-white">
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

      {/* PRICE */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.price.kicker} title={t.price.title} lede={t.price.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile value={t.price.auditValue} label={t.price.auditLabel} tone="brand" />
            <StatTile value={fc(PRICING.fixedServices.w8ben)} label={t.price.w8benLabel} />
            <StatTile value={fc(PRICING.fixedServices.w8benE)} label={t.price.w8benELabel} />
            <StatTile
              value={fc(PRICING.fixedServices.residenceCertificate)}
              label={t.price.certLabel}
            />
          </div>
        </Container>
      </section>

      {/* PITFALLS */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.pitfalls.kicker}
            title={t.pitfalls.title}
            lede={t.pitfalls.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.pitfalls.items(recoveryOnlyNames).map((item) => (
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
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.bridges.kicker} title={t.bridges.title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.bridges.items.map((item, i) => (
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
      <section className="border-t border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={faqItems} className="mt-8" />
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-rule">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <LeadCaptureButton serviceLabel={t.leadServiceLabel}>
              {common.cta.openAccount}
            </LeadCaptureButton>
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
