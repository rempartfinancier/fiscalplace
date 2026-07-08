"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  type Locale,
  type Localized,
} from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { claimHref, href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import {
  COUNTRIES,
  RESIDENCES,
  RESIDENCE_LABELS,
  recoveryGap,
  solDeadline,
  treatyRateFor,
  type Residence,
} from "@/data/countries";
import { DEMO_CLAIMS } from "@/data/demo-portal";
import { PRICING } from "@/config/pricing";
import { simulate, SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import {
  Badge,
  Button,
  ButtonLink,
  TreatyRef,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerEntry, LedgerLine, MicroGauge } from "@/components/ui/ledger";

/* ------------------------------------------------------------------ */
/* Types & static data                                                 */
/* ------------------------------------------------------------------ */

type InvestorType = "individual" | "familyOffice" | "advisor" | "company";
type KycState = "idle" | "running" | "verified";
type StepId = "profile" | "residence" | "kyc" | "portfolio" | "result";

const STEP_IDS: StepId[] = ["profile", "residence", "kyc", "portfolio", "result"];

/** Prefill of step 4 — same figures as the demo account's claims (single source). */
const EXAMPLE_COUNTRY_IDS = ["CH", "DE", "IE"] as const;
function buildExampleAmounts(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of EXAMPLE_COUNTRY_IDS) {
    const claim = DEMO_CLAIMS.find((c) => c.countryId === id);
    if (claim) out[id] = String(claim.grossDividends);
  }
  return out;
}

/** The demo claim whose mandate signature can be experienced in the claim detail. */
const MANDATE_DEMO_CLAIM_ID =
  DEMO_CLAIMS.find((c) => c.countryId === "IE")?.id ?? DEMO_CLAIMS[0].id;

/** Illustrative dividend year used for the statute-of-limitations preview. */
const ASSUMED_DIVIDEND_YEAR = new Date().getFullYear() - 1;
const ASSUMED_PAYMENT_ISO = `${ASSUMED_DIVIDEND_YEAR}-07-01`;

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => vars[key] ?? m);
}

function formatPoints(gap: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    maximumFractionDigits: 1,
  }).format(gap * 100);
}

function parseAmount(raw: string): number {
  const value = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface ProfileCopy {
  residenceLead: string;
  residenceLabel: string;
  kycNote: string;
  portfolioLead: string;
  resultLead: string;
  netLabel: string;
}

interface OnboardingCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  intro: string;
  stepper: {
    navLabel: string;
    stepOf: string;
    doneHint: string;
    steps: Record<StepId, string>;
  };
  nav: { prev: string; next: string; create: string };
  errors: {
    profile: string;
    residence: string;
    kyc: string;
    noCountry: string;
    missingAmounts: string;
  };
  profileStep: {
    legend: string;
    lead: string;
    options: Record<InvestorType, { label: string; hint: string }>;
  };
  residenceStep: { placeholder: string; otherHint: string };
  kycStep: {
    realIntro: string;
    realSteps: string[];
    howLink: string;
    simulateBtn: string;
    running: string;
    verifiedBadge: string;
    verifiedNote: string;
  };
  portfolioStep: {
    countriesLegend: string;
    pts: string;
    zeroPts: string;
    amountsLegend: string;
    amountsHint: string;
    amountLabel: string;
    amountPlaceholder: string;
    exampleBtn: string;
    exampleHint: string;
  };
  resultStep: {
    nothingBadge: string;
    nothingZeroRate: string;
    nothingTreatyEqual: string;
    commissionLabel: string;
    smallNote: string;
    gridNote: string;
    totalHeading: string;
    totalRef: string;
    totalFootnote: string;
    deadlineTitle: string;
    deadlineBody: string;
    deadlineAssumption: string;
    zeroTotal: string;
  };
  confirm: {
    badge: string;
    title: string;
    body: string;
    nextTitle: string;
    nextSteps: string[];
    signatureNote: string;
    seeClaims: string;
    seeMandate: string;
    backToResult: string;
  };
  byProfile: Record<InvestorType, ProfileCopy>;
}

const copy: Localized<OnboardingCopy> = {
  fr: {
    metaTitle: "Démarrer votre récupération — espace client (démo)",
    metaDescription:
      "Assistant d'ouverture en 5 étapes : profil, résidence fiscale, vérification d'identité, portefeuille et estimation chiffrée — sur données de démonstration.",
    kicker: "Assistant d'ouverture — démonstration",
    title: "Démarrer votre récupération",
    intro:
      "Cinq étapes pour estimer votre trop-perçu et voir comment un dossier s'ouvre réellement. Tout est simulé ici : rien n'est envoyé, rien n'est signé — vous explorez librement.",
    stepper: {
      navLabel: "Étapes de l'assistant",
      stepOf: "Étape {n} sur {total}",
      doneHint: "terminée — revenir à cette étape",
      steps: {
        profile: "Profil",
        residence: "Résidence fiscale",
        kyc: "Vérification d'identité",
        portfolio: "Portefeuille",
        result: "Résultat",
      },
    },
    nav: { prev: "Précédent", next: "Suivant", create: "Créer mes dossiers (démo)" },
    errors: {
      profile: "Choisissez un profil : les écrans suivants s'adaptent à votre situation.",
      residence: "Sélectionnez un pays de résidence pour appliquer les bonnes conventions fiscales.",
      kyc: "Lancez la vérification simulée pour voir cette étape telle qu'elle se déroule en réel.",
      noCountry:
        "Sélectionnez au moins un pays source — ou cliquez sur « Utiliser l'exemple » pour voir l'assistant avec des chiffres réalistes.",
      missingAmounts: "Indiquez un montant brut annuel supérieur à zéro pour : {list}.",
    },
    profileStep: {
      legend: "Vous êtes…",
      lead: "Dites-nous pour qui vous récupérez : l'assistant adapte les étapes suivantes à votre situation.",
      options: {
        individual: {
          label: "Particulier",
          hint: "Vous détenez des actions étrangères en direct, sur un ou plusieurs comptes-titres.",
        },
        familyOffice: {
          label: "Family office / gérant de fortune",
          hint: "Vous pilotez les portefeuilles d'une ou plusieurs familles ou clients sous mandat.",
        },
        advisor: {
          label: "CGP — pour mes clients",
          hint: "Vous ouvrez des dossiers au nom de vos clients et suivez leurs récupérations.",
        },
        company: {
          label: "Société / holding",
          hint: "Les dividendes sont encaissés par une société, une holding ou une société civile.",
        },
      },
    },
    residenceStep: {
      placeholder: "Sélectionnez un pays…",
      otherHint:
        "Vous ne trouvez pas votre pays ? Nous couvrons d'autres pays de résidence sur étude : choisissez « Autre pays conventionné » pour une première estimation aux taux par défaut — chaque dossier est ensuite vérifié avant tout engagement.",
    },
    kycStep: {
      realIntro:
        "Avant d'agir auprès d'une administration fiscale en votre nom, la réglementation nous impose de vérifier votre identité. Voici exactement ce qui se passerait en réel :",
      realSteps: [
        "Vous photographiez ou chargez une pièce d'identité (carte nationale d'identité ou passeport) — quelques minutes, depuis votre téléphone.",
        "Un prestataire spécialisé, [NOM DU PRESTATAIRE KYC RÉEL], vérifie automatiquement le document et effectue le filtrage sanctions et personnes politiquement exposées (PEP).",
        "Les cas ambigus ne sont jamais tranchés par la machine : un membre de notre équipe les revoit un par un.",
      ],
      howLink: "Pourquoi cette vérification ? Voir comment ça marche",
      simulateBtn: "Simuler la vérification",
      running: "Vérification en cours…",
      verifiedBadge: "Vérifié (démo)",
      verifiedNote:
        "En réel, vous recevriez une confirmation par e-mail et pourriez reprendre l'assistant exactement où vous l'avez laissé.",
    },
    portfolioStep: {
      countriesLegend: "Pays sources de vos dividendes",
      pts: "{pts} pts d'écart",
      zeroPts: "0 pt d'écart",
      amountsLegend: "Montants bruts annuels",
      amountsHint:
        "Une estimation de bonne foi suffit : le chiffrage exact se fera sur vos relevés, ligne à ligne.",
      amountLabel: "{country} — dividendes bruts par an (€)",
      amountPlaceholder: "ex. 5 000",
      exampleBtn: "Utiliser l'exemple",
      exampleHint:
        "Pré-remplit la sélection avec les chiffres du compte de démonstration (Suisse, Allemagne, Irlande).",
    },
    resultStep: {
      nothingBadge: "Rien à récupérer",
      nothingZeroRate:
        "Ce pays ne prélève pas de retenue à la source sur les dividendes ordinaires : il n'y a rien à récupérer — on vous évite un dossier inutile.",
      nothingTreatyEqual:
        "Le taux prélevé correspond déjà à ce que la convention autorise : ouvrir un dossier ne vous rapporterait rien — on vous évite une démarche inutile.",
      commissionLabel: "Commission (au succès)",
      smallNote:
        "Sous {threshold} récupérables, la commission minimale de {floor} mange l'essentiel du gain : nous vous le disons avant d'ouvrir un dossier, pas après.",
      gridNote:
        "Commission selon la grille publique, marginale par tranche : chaque tranche du montant récupéré est facturée à son taux. Rien de récupéré, rien de facturé.",
      totalHeading: "Total estimé",
      totalRef: "{n} pays source(s) · taux conventionnels par pays",
      totalFootnote:
        "Commission estimée {fee}, calculée dossier par dossier, uniquement au succès — {netLabel} : {net}. {illustrative}",
      deadlineTitle: "Prescription la plus proche",
      deadlineBody:
        "{country} : dossier à déposer avant le {date} pour des dividendes encaissés en {year}.",
      deadlineAssumption:
        "Hypothèse indicative — en réel, la prescription se calcule à la date exacte de chaque versement.",
      zeroTotal:
        "Rien à récupérer sur cette sélection — et c'est plutôt une bonne nouvelle : les bons taux sont déjà appliqués. Revenez à l'étape précédente pour tester d'autres pays sources.",
    },
    confirm: {
      badge: "Dossiers créés (démo)",
      title: "La démo s'arrête ici — volontairement.",
      body: "En réel, « Créer mes dossiers » déclencherait les étapes ci-dessous. Dans cette démonstration, rien n'a été envoyé ni signé.",
      nextTitle: "Ce qui suivrait en réel",
      nextSteps: [
        "Vous signez électroniquement un mandat de représentation par pays — c'est lui qui nous autorise à agir auprès de chaque administration.",
        "Vous déposez vos relevés dans l'espace Documents : nous en extrayons les lignes de dividendes et montons chaque dossier.",
        "Nous obtenons ou vérifions votre certificat de résidence fiscale, pièce exigée par toutes les administrations.",
        "Nous déposons, suivons et relançons chaque administration — vous suivez tout depuis votre tableau de bord, et la commission n'est facturée qu'au succès.",
      ],
      signatureNote:
        "La signature de mandat n'est pas simulée dans cet assistant : elle se vit dans le détail d'un dossier. Le dossier irlandais du compte démo en a justement une en attente.",
      seeClaims: "Voir des dossiers d'exemple",
      seeMandate: "Voir une signature de mandat",
      backToResult: "Revenir au résultat",
    },
    byProfile: {
      individual: {
        residenceLead:
          "Votre pays de résidence fiscale détermine les conventions applicables — et donc ce que chaque pays doit vous rendre.",
        residenceLabel: "Votre résidence fiscale",
        kycNote:
          "Vos documents servent uniquement à cette vérification et aux dossiers que vous ouvrez — jamais revendus, jamais partagés au-delà du nécessaire.",
        portfolioLead:
          "Dans quels pays vos dividendes sont-ils prélevés à la source ? Sélectionnez les pays concernés, puis indiquez un montant brut annuel approximatif — une estimation suffit.",
        resultLead:
          "Voici ce que donnerait votre portefeuille, pays par pays. Les montants sont indicatifs : chaque dossier est vérifié sur vos relevés avant tout dépôt.",
        netLabel: "Net pour vous",
      },
      familyOffice: {
        residenceLead:
          "La résidence fiscale du bénéficiaire détermine les conventions applicables — et donc ce que chaque pays doit rendre.",
        residenceLabel: "Résidence fiscale du bénéficiaire",
        kycNote:
          "Chaque bénéficiaire final est vérifié individuellement, conformément aux obligations LCB-FT — pas de raccourci groupé.",
        portfolioLead:
          "Dans quels pays les dividendes du portefeuille sont-ils prélevés à la source ? Sélectionnez les pays concernés, puis indiquez un montant brut annuel par pays.",
        resultLead:
          "Voici ce que donnerait ce portefeuille, pays par pays. Les montants sont indicatifs : chaque dossier est vérifié sur relevés avant tout dépôt.",
        netLabel: "Net pour le bénéficiaire",
      },
      advisor: {
        residenceLead:
          "La résidence fiscale de votre client détermine les conventions applicables — et donc ce que chaque pays doit lui rendre.",
        residenceLabel: "Résidence fiscale de votre client",
        kycNote:
          "Chaque client final est vérifié individuellement à l'ouverture de son premier dossier — pas de vérification groupée au rabais.",
        portfolioLead:
          "Dans quels pays les dividendes de votre client sont-ils prélevés à la source ? Sélectionnez les pays concernés, puis indiquez un montant brut annuel approximatif.",
        resultLead:
          "Voici ce que donnerait le portefeuille de votre client, pays par pays. Montants indicatifs — et en réel, les dossiers de vos clients apparaissent dans votre espace partenaire, avec votre rétrocession de {share} de notre commission.",
        netLabel: "Net pour votre client",
      },
      company: {
        residenceLead:
          "La résidence fiscale de la société détermine les conventions applicables — et donc ce que chaque pays doit lui rendre.",
        residenceLabel: "Résidence fiscale de la société",
        kycNote:
          "Pour une société s'ajoute l'identification des bénéficiaires effectifs (extrait de registre et justificatifs) — nous vous guidons pièce par pièce.",
        portfolioLead:
          "Dans quels pays les dividendes de la société sont-ils prélevés à la source ? Sélectionnez les pays concernés, puis indiquez un montant brut annuel par pays.",
        resultLead:
          "Voici ce que donnerait le portefeuille de la société, pays par pays. Montants indicatifs — et attention : pour une société, les taux conventionnels peuvent différer des taux par défaut affichés, pensés pour un particulier. Nous les confirmons à l'étude du dossier.",
        netLabel: "Net pour la société",
      },
    },
  },
  en: {
    metaTitle: "Start your recovery — client area (demo)",
    metaDescription:
      "A 5-step onboarding assistant: profile, tax residence, identity check, portfolio and a figured estimate — on demonstration data.",
    kicker: "Onboarding assistant — demo",
    title: "Start your recovery",
    intro:
      "Five steps to estimate your over-withheld tax and see how a claim actually gets opened. Everything here is simulated: nothing is sent, nothing is signed — explore freely.",
    stepper: {
      navLabel: "Assistant steps",
      stepOf: "Step {n} of {total}",
      doneHint: "completed — go back to this step",
      steps: {
        profile: "Profile",
        residence: "Tax residence",
        kyc: "Identity check",
        portfolio: "Portfolio",
        result: "Result",
      },
    },
    nav: { prev: "Back", next: "Next", create: "Create my claims (demo)" },
    errors: {
      profile: "Pick a profile so the next screens match your situation.",
      residence: "Select a residence country so we apply the right tax treaties.",
      kyc: "Run the simulated check to see this step as it works for real.",
      noCountry:
        "Select at least one source country — or click 'Use the example' to see the assistant with realistic figures.",
      missingAmounts: "Enter an annual gross amount above zero for: {list}.",
    },
    profileStep: {
      legend: "You are…",
      lead: "Tell us who you are recovering for: the assistant tailors the next steps to your situation.",
      options: {
        individual: {
          label: "Individual investor",
          hint: "You hold foreign shares directly, in one or more brokerage accounts.",
        },
        familyOffice: {
          label: "Family office / wealth manager",
          hint: "You run portfolios for one or more families or clients under mandate.",
        },
        advisor: {
          label: "Financial adviser — for my clients",
          hint: "You open claims on behalf of your clients and track their recoveries.",
        },
        company: {
          label: "Company / holding",
          hint: "Dividends are received by a company, a holding or a civil partnership.",
        },
      },
    },
    residenceStep: {
      placeholder: "Select a country…",
      otherHint:
        "Can't find your country? We cover other residence countries on a case-by-case review: pick 'Other treaty country' for a first estimate at default rates — every claim is then verified before you commit to anything.",
    },
    kycStep: {
      realIntro:
        "Before acting with a foreign tax administration on your behalf, regulations require us to verify your identity. Here is exactly what would happen for real:",
      realSteps: [
        "You photograph or upload an ID document (national ID card or passport) — a few minutes, from your phone.",
        "A specialised provider, [REAL KYC PROVIDER NAME], checks the document automatically and runs sanctions and politically-exposed-person (PEP) screening.",
        "Ambiguous cases are never decided by the machine: a member of our team reviews them one by one.",
      ],
      howLink: "Why this check? See how it works",
      simulateBtn: "Simulate the check",
      running: "Verification in progress…",
      verifiedBadge: "Verified (demo)",
      verifiedNote:
        "In the real flow you would get an e-mail confirmation and could pick the assistant back up exactly where you left it.",
    },
    portfolioStep: {
      countriesLegend: "Source countries of your dividends",
      pts: "{pts} pts gap",
      zeroPts: "0 pts gap",
      amountsLegend: "Annual gross amounts",
      amountsHint:
        "A good-faith estimate is enough: the exact figures will come from your statements, line by line.",
      amountLabel: "{country} — gross dividends per year (€)",
      amountPlaceholder: "e.g. 5,000",
      exampleBtn: "Use the example",
      exampleHint:
        "Prefills the selection with the demo account's figures (Switzerland, Germany, Ireland).",
    },
    resultStep: {
      nothingBadge: "Nothing to recover",
      nothingZeroRate:
        "This country levies no withholding tax on ordinary dividends: there is nothing to recover — we're saving you a pointless claim.",
      nothingTreatyEqual:
        "The rate withheld already matches what the treaty allows: opening a claim would earn you nothing — we're saving you a pointless one.",
      commissionLabel: "Fee (on success)",
      smallNote:
        "Below {threshold} recoverable, the {floor} minimum fee eats most of the gain: we tell you before opening a claim, not after.",
      gridNote:
        "Fee per the public grid, marginal by bracket: each slice of the recovered amount is charged at its own rate. Nothing recovered, nothing charged.",
      totalHeading: "Estimated total",
      totalRef: "{n} source country(ies) · per-country treaty rates",
      totalFootnote:
        "Estimated fee {fee}, computed claim by claim, charged on success only — {netLabel}: {net}. {illustrative}",
      deadlineTitle: "Nearest filing deadline",
      deadlineBody: "{country}: claim must be filed by {date} for dividends received in {year}.",
      deadlineAssumption:
        "Indicative assumption — in the real flow, the deadline is computed from each payment's exact date.",
      zeroTotal:
        "Nothing to recover on this selection — which is rather good news: the right rates are already applied. Go back one step to test other source countries.",
    },
    confirm: {
      badge: "Claims created (demo)",
      title: "The demo stops here — deliberately.",
      body: "For real, 'Create my claims' would trigger the steps below. In this demonstration, nothing was sent or signed.",
      nextTitle: "What would follow for real",
      nextSteps: [
        "You e-sign one representation mandate per country — it is what authorises us to act with each administration.",
        "You drop your statements in the Documents area: we extract the dividend lines and build each claim.",
        "We obtain or verify your certificate of tax residence, required by every administration.",
        "We file, track and chase each administration — you follow everything from your dashboard, and the fee is only charged on success.",
      ],
      signatureNote:
        "Mandate signing is not simulated in this assistant: it lives in the claim detail. The demo account's Irish claim has one waiting right now.",
      seeClaims: "See example claims",
      seeMandate: "See a mandate signature",
      backToResult: "Back to the result",
    },
    byProfile: {
      individual: {
        residenceLead:
          "Your country of tax residence determines which treaties apply — and therefore what each country owes you back.",
        residenceLabel: "Your tax residence",
        kycNote:
          "Your documents are used solely for this verification and for the claims you open — never sold, never shared beyond what is necessary.",
        portfolioLead:
          "Where are your dividends taxed at source? Select the countries concerned, then enter a rough gross annual amount — an estimate is enough.",
        resultLead:
          "Here is what your portfolio would yield, country by country. Amounts are indicative: every claim is verified against your statements before anything is filed.",
        netLabel: "Net for you",
      },
      familyOffice: {
        residenceLead:
          "The beneficiary's tax residence determines which treaties apply — and therefore what each country owes back.",
        residenceLabel: "Beneficiary's tax residence",
        kycNote:
          "Each end beneficiary is verified individually, in line with AML/CFT obligations — no bulk shortcuts.",
        portfolioLead:
          "Where are the portfolio's dividends taxed at source? Select the countries concerned, then enter a rough gross annual amount per country.",
        resultLead:
          "Here is what this portfolio would yield, country by country. Amounts are indicative: every claim is verified against statements before anything is filed.",
        netLabel: "Net for the beneficiary",
      },
      advisor: {
        residenceLead:
          "Your client's tax residence determines which treaties apply — and therefore what each country owes them back.",
        residenceLabel: "Your client's tax residence",
        kycNote:
          "Each end client is verified individually when their first claim is opened — no discounted bulk verification.",
        portfolioLead:
          "Where are your client's dividends taxed at source? Select the countries concerned, then enter a rough gross annual amount.",
        resultLead:
          "Here is what your client's portfolio would yield, country by country. Indicative amounts — and in the real flow, your clients' claims appear in your partner area, with your {share} share of our fee.",
        netLabel: "Net for your client",
      },
      company: {
        residenceLead:
          "The company's tax residence determines which treaties apply — and therefore what each country owes it back.",
        residenceLabel: "The company's tax residence",
        kycNote:
          "For a company, beneficial-owner identification is added (register extract and supporting documents) — we guide you item by item.",
        portfolioLead:
          "Where are the company's dividends taxed at source? Select the countries concerned, then enter a rough gross annual amount per country.",
        resultLead:
          "Here is what the company's portfolio would yield, country by country. Indicative amounts — one caution: for an entity, applicable treaty rates can differ from the individual-investor defaults shown. We confirm them during the file review.",
        netLabel: "Net for the company",
      },
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<InvestorType | null>(null);
  const [residence, setResidence] = useState<Residence | "">("");
  const [kyc, setKyc] = useState<KycState>("idle");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const kycTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (kycTimer.current !== null) window.clearTimeout(kycTimer.current);
    },
    [],
  );

  // Move keyboard/screen-reader focus to the step heading on navigation.
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, confirmed]);

  const pc = t.byProfile[profile ?? "individual"];
  const residenceForSim: Residence = residence === "" ? "FR" : residence;
  const eur = (v: number) => formatCurrency(v, locale);
  const pct = (v: number) => formatPercent(v, locale, 1);

  const selectedCountries = COUNTRIES.filter((c) => selectedIds.includes(c.id));
  const results = selectedCountries.map((country) => ({
    country,
    sim: simulate({
      country,
      residence: residenceForSim,
      grossDividend: parseAmount(amounts[country.id] ?? ""),
    }),
  }));
  const totalWithheld = results.reduce((s, r) => s + r.sim.withheld, 0);
  const totalTreatyDue = results.reduce((s, r) => s + r.sim.treatyDue, 0);
  const totalRecoverable = results.reduce((s, r) => s + r.sim.recoverable, 0);
  const totalFee = results.reduce((s, r) => s + r.sim.commission.fee, 0);
  const totalNet = results.reduce((s, r) => s + r.sim.netToClient, 0);

  const soonest = results
    .filter((r) => r.sim.recoverable > 0)
    .reduce<{ country: (typeof COUNTRIES)[number]; deadline: Date } | null>((acc, r) => {
      const deadline = solDeadline(r.country, ASSUMED_PAYMENT_ISO);
      return !acc || deadline < acc.deadline ? { country: r.country, deadline } : acc;
    }, null);

  const validate = (s: number): string | null => {
    if (s === 0 && !profile) return t.errors.profile;
    if (s === 1 && residence === "") return t.errors.residence;
    if (s === 2 && kyc !== "verified") return t.errors.kyc;
    if (s === 3) {
      if (selectedIds.length === 0) return t.errors.noCountry;
      const missing = selectedCountries
        .filter((c) => parseAmount(amounts[c.id] ?? "") <= 0)
        .map((c) => c.name[locale]);
      if (missing.length > 0)
        return fill(t.errors.missingAmounts, { list: missing.join(", ") });
    }
    return null;
  };

  const goNext = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_IDS.length - 1));
  };
  const goPrev = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };
  const goTo = (i: number) => {
    if (i < step) {
      setError(null);
      setStep(i);
    }
  };

  const runKyc = () => {
    setError(null);
    setKyc("running");
    kycTimer.current = window.setTimeout(() => setKyc("verified"), 1400);
  };

  const toggleCountry = (id: string) => {
    setError(null);
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const useExample = () => {
    setError(null);
    setSelectedIds([...EXAMPLE_COUNTRY_IDS]);
    setAmounts((a) => ({ ...a, ...buildExampleAmounts() }));
  };

  const currentId = STEP_IDS[step];
  const stepHeadingId = `step-${currentId}-title`;

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
        {t.kicker}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">{t.title}</h1>
      <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">{t.intro}</p>

      {!confirmed && (
        <nav aria-label={t.stepper.navLabel} className="mt-8">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {STEP_IDS.map((id, i) => {
              const isDone = i < step;
              const isCurrent = i === step;
              const box =
                "flex h-7 w-7 items-center justify-center rounded-[6px] border font-mono text-[13px]";
              return (
                <li
                  key={id}
                  className="flex items-center gap-1.5"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {i > 0 && <span className="h-px w-3 bg-rule" aria-hidden="true" />}
                  {isDone ? (
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      className={`${box} cursor-pointer border-brand bg-brand text-white transition-colors hover:bg-brand-deep`}
                      aria-label={`${fill(t.stepper.stepOf, { n: String(i + 1), total: String(STEP_IDS.length) })} — ${t.stepper.steps[id]} (${t.stepper.doneHint})`}
                    >
                      {i + 1}
                    </button>
                  ) : (
                    <span
                      className={`${box} ${isCurrent ? "border-ink bg-white font-semibold text-ink" : "border-rule bg-white text-mine"}`}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span
                    className={`hidden text-[13px] md:inline ${isCurrent ? "font-medium text-ink" : "text-mine"}`}
                  >
                    {t.stepper.steps[id]}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 font-mono text-xs text-mine md:hidden">
            {fill(t.stepper.stepOf, { n: String(step + 1), total: String(STEP_IDS.length) })} —{" "}
            {t.stepper.steps[currentId]}
          </p>
        </nav>
      )}

      {confirmed ? (
        /* ---------------------------- Confirmation --------------------- */
        <section aria-labelledby="confirm-title" className="mt-8">
          <Badge tone="green" className="animate-stamp">
            {t.confirm.badge}
          </Badge>
          <h2
            id="confirm-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-display text-xl font-semibold text-ink sm:text-2xl"
          >
            {t.confirm.title}
          </h2>
          <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
            {t.confirm.body}
          </p>
          <h3 className="mt-6 text-[15px] font-semibold text-ink">{t.confirm.nextTitle}</h3>
          <ol className="mt-3 space-y-3">
            {t.confirm.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-rule bg-white font-mono text-[13px] text-brand"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-mine">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-[6px] border border-rule bg-white p-4 text-[14px] leading-relaxed text-mine">
            {t.confirm.signatureNote}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={href(locale, "portalClaims")}>{t.confirm.seeClaims}</ButtonLink>
            <ButtonLink href={claimHref(locale, MANDATE_DEMO_CLAIM_ID)} variant="secondary">
              {t.confirm.seeMandate}
            </ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-3" />
          <div className="mt-4">
            <Button variant="ghost" onClick={() => setConfirmed(false)}>
              {t.confirm.backToResult}
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section aria-labelledby={stepHeadingId} className="mt-8">
            <h2
              id={stepHeadingId}
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-xl font-semibold text-ink sm:text-2xl"
            >
              {t.stepper.steps[currentId]}
            </h2>

            {/* ------------------------- Step 1 : profile ---------------- */}
            {currentId === "profile" && (
              <>
                <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                  {t.profileStep.lead}
                </p>
                <fieldset className="mt-5">
                  <legend className="text-[15px] font-medium text-ink">
                    {t.profileStep.legend}
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(Object.keys(t.profileStep.options) as InvestorType[]).map((id) => {
                      const opt = t.profileStep.options[id];
                      const checked = profile === id;
                      return (
                        <label
                          key={id}
                          className={`flex cursor-pointer items-start gap-3 rounded-[6px] border p-4 transition-colors ${
                            checked ? "border-brand bg-tint-green" : "border-rule bg-white hover:bg-paper"
                          }`}
                        >
                          <input
                            type="radio"
                            name="investor-profile"
                            value={id}
                            checked={checked}
                            onChange={() => {
                              setProfile(id);
                              setError(null);
                            }}
                            className="mt-1 accent-brand"
                          />
                          <span className="flex-1">
                            <span className="block text-[15px] font-medium text-ink">
                              {opt.label}
                            </span>
                            <span className="mt-0.5 block text-[13px] leading-relaxed text-mine">
                              {opt.hint}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </>
            )}

            {/* ------------------------- Step 2 : residence -------------- */}
            {currentId === "residence" && (
              <>
                <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                  {pc.residenceLead}
                </p>
                <div className="mt-5 max-w-sm">
                  <label htmlFor="residence-select" className="block text-[15px] font-medium text-ink">
                    {pc.residenceLabel}
                  </label>
                  <select
                    id="residence-select"
                    value={residence}
                    onChange={(e) => {
                      setResidence(e.target.value as Residence | "");
                      setError(null);
                    }}
                    className="mt-2 w-full rounded-[6px] border border-rule bg-white px-3 py-2.5 text-[15px] text-ink"
                  >
                    <option value="" disabled>
                      {t.residenceStep.placeholder}
                    </option>
                    {RESIDENCES.map((r) => (
                      <option key={r} value={r}>
                        {RESIDENCE_LABELS[r][locale]}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-4 max-w-[68ch] rounded-[6px] border border-rule bg-white p-4 text-[13px] leading-relaxed text-mine">
                  {t.residenceStep.otherHint}
                </p>
              </>
            )}

            {/* ------------------------- Step 3 : KYC --------------------- */}
            {currentId === "kyc" && (
              <>
                <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                  {t.kycStep.realIntro}
                </p>
                <ol className="mt-4 space-y-3">
                  {t.kycStep.realSteps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-rule bg-white font-mono text-[13px] text-brand"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <p className="text-[15px] leading-relaxed text-mine">{s}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 max-w-[68ch] rounded-[6px] border border-rule bg-white p-4 text-[13px] leading-relaxed text-mine">
                  {pc.kycNote}
                </p>
                <p className="mt-3">
                  <Link
                    href={href(locale, "howItWorks")}
                    className="font-mono text-[13px] text-brand underline-offset-4 hover:underline"
                  >
                    {t.kycStep.howLink}
                  </Link>
                </p>
                <div className="mt-6">
                  {kyc === "idle" && (
                    <Button onClick={runKyc}>{t.kycStep.simulateBtn}</Button>
                  )}
                  {kyc === "running" && (
                    <span
                      role="status"
                      className="inline-flex items-center gap-2 font-mono text-[13px] text-mine"
                    >
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-brand"
                      />
                      {t.kycStep.running}
                    </span>
                  )}
                  {kyc === "verified" && (
                    <div role="status">
                      <Badge tone="green" className="animate-stamp">
                        {t.kycStep.verifiedBadge}
                      </Badge>
                      <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-mine">
                        {t.kycStep.verifiedNote}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ------------------------- Step 4 : portfolio --------------- */}
            {currentId === "portfolio" && (
              <>
                <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                  {pc.portfolioLead}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="secondary" onClick={useExample}>
                    {t.portfolioStep.exampleBtn}
                  </Button>
                  <p className="text-[13px] text-mine">{t.portfolioStep.exampleHint}</p>
                </div>
                <fieldset className="mt-6">
                  <legend className="text-[15px] font-medium text-ink">
                    {t.portfolioStep.countriesLegend}
                  </legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {COUNTRIES.map((c) => {
                      const checked = selectedIds.includes(c.id);
                      const gap = recoveryGap(c, residenceForSim);
                      return (
                        <label
                          key={c.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-[6px] border p-3 transition-colors ${
                            checked ? "border-brand bg-tint-green" : "border-rule bg-white hover:bg-paper"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCountry(c.id)}
                            className="mt-1 accent-brand"
                          />
                          <span className="flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="text-[15px] font-medium text-ink">
                                <span aria-hidden="true">{c.flag}</span> {c.name[locale]}
                              </span>
                              {gap > 0 ? (
                                <span className="shrink-0 font-mono text-[12px] font-medium text-gold-ink">
                                  {fill(t.portfolioStep.pts, { pts: formatPoints(gap, locale) })}
                                </span>
                              ) : (
                                <span className="shrink-0 font-mono text-[12px] text-mine">
                                  {t.portfolioStep.zeroPts}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-wide text-mine">
                              {pct(c.statutoryRate)} → {pct(treatyRateFor(c, residenceForSim))}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {selectedCountries.length > 0 && (
                  <fieldset className="mt-6">
                    <legend className="text-[15px] font-medium text-ink">
                      {t.portfolioStep.amountsLegend}
                    </legend>
                    <p className="mt-1 text-[13px] text-mine">{t.portfolioStep.amountsHint}</p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      {selectedCountries.map((c) => (
                        <div key={c.id}>
                          <label
                            htmlFor={`amount-${c.id}`}
                            className="block text-[13px] font-medium text-ink"
                          >
                            <span aria-hidden="true">{c.flag}</span>{" "}
                            {fill(t.portfolioStep.amountLabel, { country: c.name[locale] })}
                          </label>
                          <input
                            id={`amount-${c.id}`}
                            type="text"
                            inputMode="decimal"
                            placeholder={t.portfolioStep.amountPlaceholder}
                            value={amounts[c.id] ?? ""}
                            onChange={(e) => {
                              setAmounts((a) => ({ ...a, [c.id]: e.target.value }));
                              setError(null);
                            }}
                            className="mt-1.5 w-full rounded-[6px] border border-rule bg-white px-3 py-2 font-mono text-[15px] text-ink"
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                )}
              </>
            )}

            {/* ------------------------- Step 5 : result ------------------ */}
            {currentId === "result" && (
              <>
                <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                  {fill(pc.resultLead, {
                    share: formatPercent(PRICING.partnerRevShare, locale, 0),
                  })}
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {results.map(({ country, sim }) => (
                    <li
                      key={country.id}
                      className="rounded-[6px] border border-rule bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[15px] font-medium text-ink">
                          <span aria-hidden="true">{country.flag}</span> {country.name[locale]}
                        </p>
                        {sim.nothingToRecover ? (
                          <Badge tone="neutral">{t.resultStep.nothingBadge}</Badge>
                        ) : (
                          <Badge tone="gold">{common.labels.potential}</Badge>
                        )}
                      </div>
                      {sim.nothingToRecover ? (
                        <>
                          <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-mine">
                            {pct(sim.statutoryRate)} → {pct(sim.treatyRate)}
                          </p>
                          <p className="mt-2 text-[13px] leading-relaxed text-mine">
                            {sim.statutoryRate === 0
                              ? t.resultStep.nothingZeroRate
                              : t.resultStep.nothingTreatyEqual}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <MicroGauge
                              statutoryRate={sim.statutoryRate}
                              treatyRate={sim.treatyRate}
                              label={fill(t.portfolioStep.pts, {
                                pts: formatPoints(sim.gap, locale),
                              })}
                            />
                            <TreatyRef>
                              {pct(sim.statutoryRate)} → {pct(sim.treatyRate)}
                            </TreatyRef>
                          </div>
                          <div className="mt-3 border-t border-rule pt-2">
                            <LedgerLine
                              label={common.labels.recoverable}
                              amount={eur(sim.recoverable)}
                              tone="ink"
                              highlight
                            />
                            <LedgerLine
                              label={t.resultStep.commissionLabel}
                              amount={`− ${eur(sim.commission.fee)}`}
                              tone="mine"
                            />
                            <LedgerLine
                              label={pc.netLabel}
                              amount={eur(sim.netToClient)}
                              tone="brand"
                              bold
                            />
                          </div>
                          {sim.smallClaim && (
                            <p className="mt-2 text-[13px] leading-relaxed text-mine">
                              {fill(t.resultStep.smallNote, {
                                threshold: eur(SMALL_CLAIM_ADVICE_THRESHOLD),
                                floor: eur(PRICING.floorFee),
                              })}
                            </p>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-mine">
                  {t.resultStep.gridNote}
                </p>

                {totalRecoverable > 0 ? (
                  <>
                    <h3 className="mt-6 text-[15px] font-semibold text-ink">
                      {t.resultStep.totalHeading}
                    </h3>
                    <LedgerEntry
                      className="mt-3"
                      withheldLabel={common.labels.withheld}
                      withheldAmount={eur(totalWithheld)}
                      owedLabel={common.labels.owedByTreaty}
                      owedAmount={eur(totalTreatyDue)}
                      treatyRef={fill(t.resultStep.totalRef, {
                        n: String(results.length),
                      })}
                      recoverLabel={common.labels.overWithholding}
                      recoverAmount={eur(totalRecoverable)}
                      settled={false}
                      footnote={fill(t.resultStep.totalFootnote, {
                        fee: eur(totalFee),
                        netLabel: pc.netLabel,
                        net: eur(totalNet),
                        illustrative: common.labels.illustrative,
                      })}
                    />
                    {soonest && (
                      <div className="mt-4 rounded-[6px] border border-gold/40 bg-tint-gold p-4">
                        <p className="font-mono text-[11px] uppercase tracking-wide text-gold-ink">
                          {t.resultStep.deadlineTitle}
                        </p>
                        <p className="mt-1 text-[15px] text-ink">
                          {fill(t.resultStep.deadlineBody, {
                            country: soonest.country.name[locale],
                            date: formatDate(
                              soonest.deadline.toISOString().slice(0, 10),
                              locale,
                            ),
                            year: String(ASSUMED_DIVIDEND_YEAR),
                          })}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-mine">
                          {soonest.country.sol.notes[locale]} {t.resultStep.deadlineAssumption}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-6 max-w-[68ch] rounded-[6px] border border-rule bg-white p-4 text-[14px] leading-relaxed text-mine">
                    {t.resultStep.zeroTotal}
                  </p>
                )}
              </>
            )}
          </section>

          {/* --------------------------- Wizard footer ------------------- */}
          <div className="mt-8 border-t border-rule pt-5">
            {error && (
              <p
                role="alert"
                className="mb-4 rounded-[6px] border border-debit/30 bg-tint-red px-4 py-3 text-[14px] leading-relaxed text-debit"
              >
                {error}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {step > 0 && (
                <Button variant="secondary" onClick={goPrev}>
                  {t.nav.prev}
                </Button>
              )}
              {step < STEP_IDS.length - 1 ? (
                <Button onClick={goNext}>{t.nav.next}</Button>
              ) : (
                <Button onClick={() => setConfirmed(true)} disabled={totalRecoverable <= 0}>
                  {t.nav.create}
                </Button>
              )}
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
        </>
      )}
    </div>
  );
}
