import type { Locale, Localized } from "@/lib/i18n";

export interface PortalStrings {
  gate: {
    title: string;
    text: string;
    enterDemo: string;
    backToSite: string;
  };
  nav: {
    dashboard: string;
    claims: string;
    documents: string;
    messages: string;
    billing: string;
    entities: string;
    notifications: string;
    partner: string;
    settings: string;
    logout: string;
  };
  entitySwitcher: {
    label: string;
    all: string;
  };
  common: {
    claim: string;
    country: string;
    stage: string;
    recoverable: string;
    deadline: string;
    actionRequired: string;
    viewClaim: string;
    empty: string;
    demoTag: string;
    signed: string;
    sign: string;
    download: string;
    send: string;
    back: string;
  };
}

const fr: PortalStrings = {
  gate: {
    title: "Espace client — démonstration",
    text: "Cet espace présente le portail FiscalPlace avec un compte fictif complet : dossiers en cours, documents, messagerie, facturation. Aucune donnée réelle, aucun engagement — explorez librement.",
    enterDemo: "Explorer le compte démo",
    backToSite: "Retour au site",
  },
  nav: {
    dashboard: "Tableau de bord",
    claims: "Dossiers",
    documents: "Documents",
    messages: "Messages",
    billing: "Facturation",
    entities: "Entités",
    notifications: "Notifications",
    partner: "Partenaire",
    settings: "Paramètres",
    logout: "Quitter la démo",
  },
  entitySwitcher: {
    label: "Entité",
    all: "Vue consolidée",
  },
  common: {
    claim: "Dossier",
    country: "Pays",
    stage: "Étape",
    recoverable: "À récupérer",
    deadline: "Prescription",
    actionRequired: "Action requise",
    viewClaim: "Voir le dossier",
    empty: "Rien à afficher pour cette entité.",
    demoTag: "DONNÉES DE DÉMONSTRATION",
    signed: "Signé",
    sign: "Signer",
    download: "Télécharger",
    send: "Envoyer",
    back: "Retour",
  },
};

const en: PortalStrings = {
  gate: {
    title: "Client area — demo",
    text: "This area showcases the FiscalPlace portal with a complete fictitious account: active claims, documents, messaging, billing. No real data, no commitment — explore freely.",
    enterDemo: "Explore the demo account",
    backToSite: "Back to the site",
  },
  nav: {
    dashboard: "Dashboard",
    claims: "Claims",
    documents: "Documents",
    messages: "Messages",
    billing: "Billing",
    entities: "Entities",
    notifications: "Notifications",
    partner: "Partner",
    settings: "Settings",
    logout: "Exit demo",
  },
  entitySwitcher: {
    label: "Entity",
    all: "Consolidated view",
  },
  common: {
    claim: "Claim",
    country: "Country",
    stage: "Stage",
    recoverable: "Recoverable",
    deadline: "Deadline",
    actionRequired: "Action required",
    viewClaim: "View claim",
    empty: "Nothing to show for this entity.",
    demoTag: "DEMO DATA",
    signed: "Signed",
    sign: "Sign",
    download: "Download",
    send: "Send",
    back: "Back",
  },
};

const PORTAL: Localized<PortalStrings> = { fr, en };

export function getPortalStrings(locale: Locale): PortalStrings {
  return PORTAL[locale];
}

/**
 * Page titles for portal routes — kept here (server-safe) because portal page
 * modules are client components whose exports cannot be called from
 * generateMetadata.
 */
export function portalTitle(locale: Locale, key: string): string {
  const t = PORTAL[locale];
  const map: Record<string, string> = {
    portal: t.nav.dashboard,
    portalOnboarding: locale === "fr" ? "Démarrer" : "Get started",
    portalClaims: t.nav.claims,
    portalDocuments: t.nav.documents,
    portalMessages: t.nav.messages,
    portalBilling: t.nav.billing,
    portalEntities: t.nav.entities,
    portalNotifications: t.nav.notifications,
    portalPartner: t.nav.partner,
    portalSettings: t.nav.settings,
  };
  return map[key] ?? t.gate.title;
}
