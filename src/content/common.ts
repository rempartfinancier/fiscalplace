import type { Locale, Localized } from "@/lib/i18n";

/**
 * Shared UI strings (nav, footer, recurring CTAs, generic labels).
 * Page-specific copy lives next to each page component, never here.
 */

export interface CommonStrings {
  brandTagline: string;
  nav: {
    howItWorks: string;
    services: string;
    pricing: string;
    countries: string;
    resources: string;
    tools: string;
    about: string;
    login: string;
    simulateCta: string;
    menu: string;
    close: string;
  };
  trustLine: string;
  demoBanner: string;
  footer: {
    baseline: string;
    services: string;
    countries: string;
    resources: string;
    company: string;
    legal: string;
    disclaimer: string;
    ratesNote: string;
    langLabel: string;
    copyrightLine: string;
  };
  cta: {
    simulate: string;
    seePricing: string;
    contactUs: string;
    openAccount: string;
    readMore: string;
  };
  labels: {
    statutoryRate: string;
    treatyRate: string;
    recoverable: string;
    withheld: string;
    owedByTreaty: string;
    overWithholding: string;
    grossDividends: string;
    solDeadline: string;
    lastReviewed: string;
    illustrative: string;
    perYear: string;
    treatyRef: string;
    free: string;
    settled: string;
    potential: string;
  };
  a11y: {
    skipToContent: string;
    openInNewTab: string;
    breadcrumb: string;
  };
}

const fr: CommonStrings = {
  brandTagline: "L'argent de vos dividendes étrangers, récupéré ligne à ligne.",
  nav: {
    howItWorks: "Comment ça marche",
    services: "Services",
    pricing: "Tarifs",
    countries: "Pays",
    resources: "Ressources",
    tools: "Outils",
    about: "À propos",
    login: "Connexion",
    simulateCta: "Calculer mon trop-perçu",
    menu: "Menu",
    close: "Fermer",
  },
  trustLine: "No win, no fee · Tarifs 100 % publics · FR / EN",
  demoBanner:
    "Espace de démonstration : toutes les données affichées sont fictives et servent à illustrer le produit.",
  footer: {
    baseline:
      "FiscalPlace récupère le trop-perçu de retenue à la source sur vos dividendes étrangers. En direct, sans avance de frais, avec des tarifs publics.",
    services: "Services",
    countries: "Pays",
    resources: "Ressources",
    company: "FiscalPlace",
    legal: "Légal",
    disclaimer:
      "FiscalPlace fournit un service spécialisé de démarches administratives et fiscales (préparation, dépôt et suivi de demandes de remboursement de retenue à la source). FiscalPlace ne fournit pas de conseil fiscal personnalisé au sens réglementaire : pour une stratégie fiscale d'ensemble, rapprochez-vous d'un avocat fiscaliste ou d'un expert-comptable.",
    ratesNote:
      "Les taux et délais affichés sur ce site sont indicatifs, revus régulièrement, et vérifiés dossier par dossier avant tout dépôt.",
    langLabel: "Langue",
    copyrightLine: "© 2026 FiscalPlace · [DÉNOMINATION SOCIALE ET SIREN À COMPLÉTER]",
  },
  cta: {
    simulate: "Calculer mon trop-perçu",
    seePricing: "Nos tarifs, en clair",
    contactUs: "Nous contacter",
    openAccount: "Ouvrir mon dossier",
    readMore: "Lire la suite",
  },
  labels: {
    statutoryRate: "Taux statutaire",
    treatyRate: "Taux conventionnel",
    recoverable: "À récupérer",
    withheld: "Retenue prélevée",
    owedByTreaty: "Retenue conventionnelle",
    overWithholding: "Trop-perçu à récupérer",
    grossDividends: "Dividendes bruts",
    solDeadline: "Délai de prescription",
    lastReviewed: "Données revues le",
    illustrative: "Montants indicatifs — chaque dossier est vérifié avant dépôt.",
    perYear: "par an",
    treatyRef: "Réf. convention",
    free: "Gratuit",
    settled: "Soldé",
    potential: "Potentiel",
  },
  a11y: {
    skipToContent: "Aller au contenu",
    openInNewTab: "S'ouvre dans un nouvel onglet",
    breadcrumb: "Fil d'Ariane",
  },
};

const en: CommonStrings = {
  brandTagline: "Your foreign-dividend money, recovered line by line.",
  nav: {
    howItWorks: "How it works",
    services: "Services",
    pricing: "Pricing",
    countries: "Countries",
    resources: "Resources",
    tools: "Tools",
    about: "About",
    login: "Log in",
    simulateCta: "Calculate my refund",
    menu: "Menu",
    close: "Close",
  },
  trustLine: "No win, no fee · Pricing 100% public · FR / EN",
  demoBanner: "Demo environment: all data shown is fictitious and illustrates the product.",
  footer: {
    baseline:
      "FiscalPlace recovers over-withheld tax on your foreign dividends. Direct to you, no upfront fees, public pricing.",
    services: "Services",
    countries: "Countries",
    resources: "Resources",
    company: "FiscalPlace",
    legal: "Legal",
    disclaimer:
      "FiscalPlace provides a specialised administrative and tax-filing service (preparation, filing and follow-up of withholding-tax refund claims). FiscalPlace does not provide personalised tax advice in the regulatory sense: for an overall tax strategy, consult a tax lawyer or chartered accountant.",
    ratesNote:
      "Rates and deadlines shown on this site are indicative, reviewed regularly, and verified claim by claim before any filing.",
    langLabel: "Language",
    copyrightLine: "© 2026 FiscalPlace · [COMPANY NAME AND SIREN TO BE COMPLETED]",
  },
  cta: {
    simulate: "Calculate my refund",
    seePricing: "Our pricing, in plain terms",
    contactUs: "Contact us",
    openAccount: "Start my claim",
    readMore: "Read more",
  },
  labels: {
    statutoryRate: "Statutory rate",
    treatyRate: "Treaty rate",
    recoverable: "Recoverable",
    withheld: "Tax withheld",
    owedByTreaty: "Treaty withholding",
    overWithholding: "Over-withholding to recover",
    grossDividends: "Gross dividends",
    solDeadline: "Statute of limitations",
    lastReviewed: "Data reviewed on",
    illustrative: "Indicative amounts — every claim is verified before filing.",
    perYear: "per year",
    treatyRef: "Treaty ref.",
    free: "Free",
    settled: "Settled",
    potential: "Potential",
  },
  a11y: {
    skipToContent: "Skip to content",
    openInNewTab: "Opens in a new tab",
    breadcrumb: "Breadcrumb",
  },
};

const COMMON: Localized<CommonStrings> = { fr, en };

export function getCommon(locale: Locale): CommonStrings {
  return COMMON[locale];
}
