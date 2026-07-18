import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { COUNTRIES } from "@/data/countries";
import { Card, Container } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Legal-article scaffolding — duplicated in each of the five legal    */
/* page modules (foundation files are read-only and this mission only  */
/* owns the legal pages). Keep visually in sync with legalNotice,      */
/* termsOfUse, termsOfSale and cookies.                                */
/* ------------------------------------------------------------------ */

const UPDATED = "2026-07-17";
/** Same address as the contact page (src/components/site/ContactForm.tsx). */
const CONTACT_EMAIL = "contact@fiscalplace.com";
/**
 * EU membership of the covered source countries (stable public fact) —
 * used to name, from the single data source, the non-EU administrations
 * to which filings inherently transfer data.
 */
const EU_MEMBER_IDS = new Set(["DE", "NL", "IE", "AT", "SE"]);

function Sec({
  n,
  id,
  artLabel,
  title,
  children,
}: {
  n: number;
  id: string;
  artLabel: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-rule pt-8">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
        {artLabel} {String(n).padStart(2, "0")}
      </p>
      <h2 id={`${id}-title`} className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[72ch] text-[15px] leading-relaxed text-mine">{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[72ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-mine marker:text-brand">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Toc({ label, items }: { label: string; items: { id: string; title: string }[] }) {
  return (
    <Card as="section" className="p-5">
      <nav aria-label={label}>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">{label}</p>
        <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="group inline-flex items-baseline gap-2 text-[15px] text-ink hover:text-brand"
              >
                <span className="font-mono text-xs text-mine group-hover:text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Card>
  );
}

const TH_CLASS = "px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface PrivacyCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  updatedLabel: string;
  artLabel: string;
  lede: string;
  tocLabel: string;
  controller: {
    title: string;
    body: (legalNotice: ReactNode, email: ReactNode) => ReactNode;
    legalNoticeLabel: string;
  };
  dataCollected: {
    title: string;
    categories: { name: string; detail: string }[];
    closing: string;
  };
  purposes: {
    title: string;
    intro: string;
    caption: string;
    colPurpose: string;
    colBasis: string;
    colDetail: string;
    rows: { purpose: string; basis: string; detail: string }[];
  };
  recipients: { title: string; p: string[] };
  transfers: { title: string; p1: (nonEuList: string) => string; p2: string };
  security: {
    title: string;
    body: (securityPage: ReactNode) => ReactNode;
    securityPageLabel: string;
  };
  retention: {
    title: string;
    intro: string;
    caption: string;
    colCategory: string;
    colDuration: string;
    colWhy: string;
    rows: { category: string; duration: string; why: string }[];
    cookiesRowCategory: string;
    cookiesRowWhy: string;
    cookiesLinkLabel: string;
    closing: string;
  };
  rights: { title: string; intro: string; items: string[]; how: string };
  dpo: { title: string; p: string[] };
  cnil: { title: string; body: (cnilLink: ReactNode) => ReactNode; cnilLabel: string };
  contact: { title: string; updates: string; body: string; formLink: string };
}

const copy: Localized<PrivacyCopy> = {
  fr: {
    metaTitle: "Politique de confidentialité",
    metaDescription:
      "Ce que FiscalPlace traite comme données (identité, KYC, relevés financiers, documents fiscaux), pourquoi, sur quelles bases légales, pour combien de temps, avec quels destinataires — et comment exercer vos droits RGPD.",
    kicker: "Légal",
    h1: "Politique de confidentialité",
    updatedLabel: "Dernière mise à jour",
    artLabel: "Art.",
    lede: "Récupérer une retenue à la source suppose de traiter des données sensibles par nature : identité, relevés financiers, documents fiscaux. Cette page décrit ce que nous traitons, pourquoi, pour combien de temps, à qui ces données sont transmises — et comment exercer vos droits. Sans jargon inutile.",
    tocLabel: "Sommaire",
    controller: {
      title: "Responsable de traitement",
      body: (legalNotice, email) => (
        <>
          Le responsable de traitement est EXP Capital, dont l'identification complète figure dans
          les {legalNotice}. Point de contact pour toute question relative aux données : {email}.
        </>
      ),
      legalNoticeLabel: "mentions légales",
    },
    dataCollected: {
      title: "Données que nous traitons",
      categories: [
        {
          name: "Identité et contact",
          detail: "nom, prénom, adresse électronique, téléphone, adresse postale, pays de résidence fiscale.",
        },
        {
          name: "Données de vérification (KYC)",
          detail: "pièce d'identité, justificatifs exigés par la réglementation, résultats des contrôles de conformité.",
        },
        {
          name: "Données financières",
          detail: "relevés de courtage, lignes de dividendes et retenues prélevées, coordonnées bancaires pour le reversement des sommes récupérées.",
        },
        {
          name: "Documents fiscaux",
          detail: "certificats de résidence, formulaires conventionnels, mandats signés, décisions et correspondances des administrations.",
        },
        {
          name: "Données d'utilisation du site",
          detail: "journaux techniques de sécurité et les quatre stockages du navigateur décrits dans la politique de cookies — aucun traceur publicitaire.",
        },
      ],
      closing: "Nous ne collectons que ce qui sert le dossier : pas de données « au cas où ».",
    },
    purposes: {
      title: "Finalités et bases légales",
      intro: "Chaque traitement repose sur une base légale de l'article 6 du RGPD :",
      caption: "Finalités des traitements et bases légales correspondantes",
      colPurpose: "Finalité",
      colBasis: "Base légale",
      colDetail: "Concrètement",
      rows: [
        {
          purpose: "Traiter votre dossier de récupération : diagnostic, préparation, dépôt, suivi, reversement",
          basis: "Exécution du contrat (art. 6.1.b)",
          detail: "Sans ces données, aucune demande ne peut être déposée.",
        },
        {
          purpose: "Vérifier votre identité et prévenir le blanchiment (KYC / LCB-FT)",
          basis: "Obligation légale (art. 6.1.c)",
          detail: "Contrôles imposés par la réglementation applicable.",
        },
        {
          purpose: "Facturer et tenir notre comptabilité",
          basis: "Obligation légale (art. 6.1.c)",
          detail: "Factures et pièces comptables obligatoires.",
        },
        {
          purpose: "Améliorer le service : statistiques internes, fiabilisation des parcours",
          basis: "Intérêt légitime (art. 6.1.f)",
          detail: "Données agrégées ; jamais de profilage publicitaire.",
        },
        {
          purpose: "Vous adresser des communications non indispensables au dossier",
          basis: "Consentement (art. 6.1.a)",
          detail: "Le cas échéant seulement — retirable à tout moment.",
        },
      ],
    },
    recipients: {
      title: "Destinataires",
      p: [
        "Les administrations fiscales des pays concernés par vos demandes : c'est l'objet même du mandat que vous nous confiez. Ne leur sont transmises que les données que leur procédure de remboursement exige.",
        "Des prestataires techniques agissant pour notre compte et sous contrat : vérification d'identité, signature électronique, paiement, hébergement. [PRESTATAIRES KYC / SIGNATURE / PAIEMENT À CONFIRMER — la liste nominative sera publiée sur cette page.]",
        "Le cas échéant, nos conseils soumis au secret professionnel (avocats, experts-comptables) et les autorités lorsque la loi l'exige.",
        "Vos données ne sont ni vendues, ni louées, ni transmises à des tiers à des fins publicitaires.",
      ],
    },
    transfers: {
      title: "Transferts hors de l'Union européenne",
      p1: (nonEuList) =>
        `Ils sont inhérents au service : déposer une demande auprès d'une administration établie hors de l'UE — ${nonEuList} dans notre panel actuel — implique de lui transmettre les données que sa procédure exige. Ce transfert repose sur les dérogations de l'article 49 du RGPD : il est nécessaire à l'exécution du contrat conclu dans votre intérêt.`,
      p2: "Lorsque des prestataires techniques sont établis hors de l'UE, le transfert est encadré par les garanties de l'article 46 du RGPD (clauses contractuelles types, décision d'adéquation le cas échéant). Nous privilégions des prestataires établis dans l'UE chaque fois que c'est possible.",
    },
    security: {
      title: "Sécurité",
      body: (securityPage) => (
        <>
          Les mesures de sécurité — chiffrement, cloisonnement des accès, journalisation — sont
          décrites sur la page {securityPage}. En cas de violation de données susceptible
          d'engendrer un risque élevé pour vos droits, vous en êtes informé conformément à
          l'article 34 du RGPD.
        </>
      ),
      securityPageLabel: "sécurité et confidentialité",
    },
    retention: {
      title: "Durées de conservation",
      intro: "Chaque catégorie de données a sa propre horloge :",
      caption: "Durées de conservation par catégorie de données",
      colCategory: "Catégorie",
      colDuration: "Durée",
      colWhy: "Fondement",
      rows: [
        {
          category: "Dossier fiscal : demandes, formulaires, décisions, justificatifs",
          duration: "10 ans",
          why: "Durée légale de conservation comptable et fiscale des pièces.",
        },
        {
          category: "Données KYC / LCB-FT",
          duration: "5 ans après la fin de la relation",
          why: "Obligation légale de lutte contre le blanchiment.",
        },
        {
          category: "Compte client et documents contractuels",
          duration: "Durée de la relation, puis 5 ans",
          why: "Prescription légale des actions contractuelles.",
        },
        {
          category: "Prospects sans suite contractuelle",
          duration: "3 ans après le dernier contact",
          why: "Intérêt légitime, aligné sur la doctrine de la CNIL.",
        },
      ],
      cookiesRowCategory: "Stockages du navigateur",
      cookiesRowWhy: "Quatre entrées techniques, zéro traceur.",
      cookiesLinkLabel: "Voir la politique de cookies",
      closing: "À l'issue de ces durées, les données sont supprimées ou anonymisées de manière irréversible.",
    },
    rights: {
      title: "Vos droits et comment les exercer",
      intro: "Le RGPD vous donne, sur vos données :",
      items: [
        "un droit d'accès (obtenir la copie de ce que nous détenons) ;",
        "un droit de rectification des données inexactes ou incomplètes ;",
        "un droit à l'effacement, dans les limites des durées légales de conservation ci-dessus ;",
        "un droit à la limitation du traitement ;",
        "un droit d'opposition, notamment aux traitements fondés sur l'intérêt légitime et, à tout moment, à la prospection ;",
        "un droit à la portabilité des données que vous nous avez fournies ;",
        "le droit de retirer un consentement à tout moment, sans effet rétroactif ;",
        "le droit de définir des directives sur le sort de vos données après votre décès.",
      ],
      how: "Pour les exercer : un courriel avec l'objet « Données personnelles » suffit. Nous répondons dans un délai d'un mois, prolongeable de deux mois pour les demandes complexes (article 12 du RGPD) ; un justificatif d'identité ne vous est demandé qu'en cas de doute raisonnable sur l'identité du demandeur.",
    },
    dpo: {
      title: "Délégué à la protection des données",
      p: [
        "La désignation formelle d'un délégué à la protection des données est en cours d'évaluation : [DPO OU RÉFÉRENT PROTECTION DES DONNÉES À DÉSIGNER LE CAS ÉCHÉANT]. Dans l'intervalle, toutes les demandes relatives aux données sont traitées via le point de contact indiqué à l'article 1, avec le même sérieux et les mêmes délais.",
      ],
    },
    cnil: {
      title: "Réclamation auprès de la CNIL",
      body: (cnilLink) => (
        <>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous
          pouvez adresser une réclamation à la Commission nationale de l'informatique et des
          libertés : {cnilLink}. Si vous résidez dans un autre État de l'Union européenne, votre
          autorité locale de protection des données est également compétente.
        </>
      ),
      cnilLabel: "www.cnil.fr",
    },
    contact: {
      title: "Contact et mises à jour",
      updates:
        "Cette politique évolue avec le service ; la date de mise à jour figure en tête de page. Toute modification substantielle est signalée aux clients disposant d'un dossier actif avant son entrée en vigueur.",
      body: "Pour toute question relative à vos données :",
      formLink: "Ou passez par la page contact",
    },
  },
  en: {
    metaTitle: "Privacy Policy",
    metaDescription:
      "What data FiscalPlace processes (identity, KYC, financial statements, tax documents), why, on which legal bases, for how long, with which recipients — and how to exercise your GDPR rights.",
    kicker: "Legal",
    h1: "Privacy Policy",
    updatedLabel: "Last updated",
    artLabel: "Art.",
    lede: "Recovering withholding tax inherently means processing sensitive-by-nature data: identity, financial statements, tax documents. This page describes what we process, why, for how long, who receives it — and how to exercise your rights. No unnecessary jargon.",
    tocLabel: "Contents",
    controller: {
      title: "Data controller",
      body: (legalNotice, email) => (
        <>
          The data controller is EXP Capital, fully identified in the {legalNotice}. Contact point
          for any data question: {email}.
        </>
      ),
      legalNoticeLabel: "legal notice",
    },
    dataCollected: {
      title: "Data we process",
      categories: [
        {
          name: "Identity and contact",
          detail: "surname, first name, email address, phone, postal address, country of tax residence.",
        },
        {
          name: "Verification data (KYC)",
          detail: "identity document, evidence required by regulation, results of compliance checks.",
        },
        {
          name: "Financial data",
          detail: "brokerage statements, dividend lines and tax withheld, bank details for paying out recovered amounts.",
        },
        {
          name: "Tax documents",
          detail: "residence certificates, treaty forms, signed mandates, administrations' decisions and correspondence.",
        },
        {
          name: "Site usage data",
          detail: "technical security logs and the four browser-storage entries described in the cookie policy — no advertising trackers.",
        },
      ],
      closing: "We only collect what serves the claim: no “just in case” data.",
    },
    purposes: {
      title: "Purposes and legal bases",
      intro: "Each processing operation rests on a legal basis under article 6 GDPR:",
      caption: "Processing purposes and their corresponding legal bases",
      colPurpose: "Purpose",
      colBasis: "Legal basis",
      colDetail: "In practice",
      rows: [
        {
          purpose: "Processing your recovery claim: diagnostic, preparation, filing, follow-up, payout",
          basis: "Performance of the contract (art. 6.1.b)",
          detail: "Without this data, no claim can be filed.",
        },
        {
          purpose: "Verifying your identity and preventing money laundering (KYC / AML)",
          basis: "Legal obligation (art. 6.1.c)",
          detail: "Checks imposed by applicable regulation.",
        },
        {
          purpose: "Invoicing and bookkeeping",
          basis: "Legal obligation (art. 6.1.c)",
          detail: "Mandatory invoices and accounting records.",
        },
        {
          purpose: "Improving the service: internal statistics, hardening user journeys",
          basis: "Legitimate interest (art. 6.1.f)",
          detail: "Aggregated data; never advertising profiling.",
        },
        {
          purpose: "Sending you communications not required for your claim",
          basis: "Consent (art. 6.1.a)",
          detail: "Only where applicable — withdrawable at any time.",
        },
      ],
    },
    recipients: {
      title: "Recipients",
      p: [
        "The tax administrations of the countries covered by your claims: that is the very purpose of the mandate you give us. They receive only the data their refund procedure requires.",
        "Technical providers acting on our behalf under contract: identity verification, electronic signature, payment, hosting. [KYC / SIGNATURE / PAYMENT PROVIDERS TO BE CONFIRMED — the named list will be published on this page.]",
        "Where relevant, our advisers bound by professional secrecy (lawyers, accountants) and the authorities where the law requires it.",
        "Your data is never sold, rented, or passed to third parties for advertising purposes.",
      ],
    },
    transfers: {
      title: "Transfers outside the European Union",
      p1: (nonEuList) =>
        `They are inherent to the service: filing a claim with an administration established outside the EU — ${nonEuList} in our current panel — means transmitting to it the data its procedure requires. This transfer relies on the derogations of article 49 GDPR: it is necessary for the performance of the contract concluded in your interest.`,
      p2: "Where technical providers are established outside the EU, the transfer is framed by the safeguards of article 46 GDPR (standard contractual clauses, adequacy decision where available). We favour EU-based providers whenever possible.",
    },
    security: {
      title: "Security",
      body: (securityPage) => (
        <>
          Security measures — encryption, access segregation, logging — are described on the{" "}
          {securityPage} page. In the event of a data breach likely to create a high risk to your
          rights, you are informed as required by article 34 GDPR.
        </>
      ),
      securityPageLabel: "security and privacy",
    },
    retention: {
      title: "Retention periods",
      intro: "Each category of data has its own clock:",
      caption: "Retention periods by data category",
      colCategory: "Category",
      colDuration: "Duration",
      colWhy: "Grounds",
      rows: [
        {
          category: "Tax file: claims, forms, decisions, supporting evidence",
          duration: "10 years",
          why: "Statutory accounting and tax record-keeping period.",
        },
        {
          category: "KYC / AML data",
          duration: "5 years after the relationship ends",
          why: "Statutory anti-money-laundering obligation.",
        },
        {
          category: "Client account and contractual documents",
          duration: "Duration of the relationship, then 5 years",
          why: "Statutory limitation period for contractual actions.",
        },
        {
          category: "Prospects with no ensuing contract",
          duration: "3 years after last contact",
          why: "Legitimate interest, aligned with CNIL guidance.",
        },
      ],
      cookiesRowCategory: "Browser storage",
      cookiesRowWhy: "Four technical entries, zero trackers.",
      cookiesLinkLabel: "See the cookie policy",
      closing: "Once these periods expire, data is deleted or irreversibly anonymised.",
    },
    rights: {
      title: "Your rights and how to exercise them",
      intro: "Under the GDPR you have, over your data:",
      items: [
        "a right of access (obtain a copy of what we hold);",
        "a right to rectification of inaccurate or incomplete data;",
        "a right to erasure, within the limits of the statutory retention periods above;",
        "a right to restriction of processing;",
        "a right to object, notably to processing based on legitimate interest and, at any time, to direct marketing;",
        "a right to portability of the data you provided to us;",
        "the right to withdraw consent at any time, without retroactive effect;",
        "the right to set directives on what happens to your data after your death (French law).",
      ],
      how: "To exercise them: an email with the subject “Personal data” is enough. We answer within one month, extendable by two months for complex requests (article 12 GDPR); proof of identity is only requested where there is reasonable doubt about the requester's identity.",
    },
    dpo: {
      title: "Data protection officer",
      p: [
        "The formal appointment of a data protection officer is under assessment: [DPO OR DATA-PROTECTION CONTACT TO BE APPOINTED WHERE REQUIRED]. In the meantime, all data requests are handled through the contact point in article 1, with the same rigour and the same deadlines.",
      ],
    },
    cnil: {
      title: "Complaint to the CNIL",
      body: (cnilLink) => (
        <>
          If, after contacting us, you consider that your rights are not respected, you may lodge a
          complaint with the French data protection authority (CNIL): {cnilLink}. If you reside in
          another EU member state, your local data protection authority is also competent.
        </>
      ),
      cnilLabel: "www.cnil.fr",
    },
    contact: {
      title: "Contact and updates",
      updates:
        "This policy evolves with the service; the update date appears at the top of the page. Any substantial change is notified to clients with an active claim before it takes effect.",
      body: "For any question about your data:",
      formLink: "Or use the contact page",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta + page                                                         */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];

  /* Non-EU administrations named from the single country data source. */
  const nonEuList = COUNTRIES.filter((c) => !EU_MEMBER_IDS.has(c.id))
    .map((c) => c.name[locale])
    .join(", ");

  const sections = [
    { id: "controller", title: t.controller.title },
    { id: "data", title: t.dataCollected.title },
    { id: "purposes", title: t.purposes.title },
    { id: "recipients", title: t.recipients.title },
    { id: "transfers", title: t.transfers.title },
    { id: "security", title: t.security.title },
    { id: "retention", title: t.retention.title },
    { id: "rights", title: t.rights.title },
    { id: "dpo", title: t.dpo.title },
    { id: "cnil", title: t.cnil.title },
    { id: "contact", title: t.contact.title },
  ];

  const linkClass = "text-brand underline underline-offset-4 hover:text-brand-deep";
  const emailLink = (
    <a href={`mailto:${CONTACT_EMAIL}`} className={`font-mono ${linkClass}`}>
      {CONTACT_EMAIL}
    </a>
  );

  return (
    <article>
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-[76ch]">
          <header>
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.kicker}
            </p>
            <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
              {t.h1}
            </h1>
            <p className="mt-3 font-mono text-[13px] text-mine">
              {t.updatedLabel} · {formatDate(UPDATED, locale)}
            </p>
            <p className="mt-5 max-w-[72ch] text-[16px] leading-relaxed text-mine">{t.lede}</p>
          </header>

          <div className="mt-8">
            <Toc label={t.tocLabel} items={sections} />
          </div>

          <div className="mt-10 space-y-10">
            <Sec n={1} id="controller" artLabel={t.artLabel} title={t.controller.title}>
              <P>
                {t.controller.body(
                  <Link href={href(locale, "legalNotice")} className={linkClass}>
                    {t.controller.legalNoticeLabel}
                  </Link>,
                  emailLink,
                )}
              </P>
            </Sec>

            <Sec n={2} id="data" artLabel={t.artLabel} title={t.dataCollected.title}>
              <ul className="max-w-[72ch] space-y-3">
                {t.dataCollected.categories.map((cat) => (
                  <li key={cat.name} className="text-[15px] leading-relaxed text-mine">
                    <strong className="font-semibold text-ink">{cat.name}</strong> — {cat.detail}
                  </li>
                ))}
              </ul>
              <P>{t.dataCollected.closing}</P>
            </Sec>

            <Sec n={3} id="purposes" artLabel={t.artLabel} title={t.purposes.title}>
              <P>{t.purposes.intro}</P>
              <div className="overflow-x-auto rounded-[6px] border border-rule">
                <table className="w-full min-w-[640px] border-collapse bg-white text-left text-[15px]">
                  <caption className="sr-only">{t.purposes.caption}</caption>
                  <thead>
                    <tr className="border-b border-rule">
                      <th scope="col" className={TH_CLASS}>
                        {t.purposes.colPurpose}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.purposes.colBasis}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.purposes.colDetail}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.purposes.rows.map((row) => (
                      <tr key={row.purpose} className="border-b border-rule last:border-b-0 align-top">
                        <td className="px-4 py-3 text-ink">{row.purpose}</td>
                        <td className="px-4 py-3 font-mono text-[13px] text-brand">{row.basis}</td>
                        <td className="px-4 py-3 text-[14px] text-mine">{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Sec>

            <Sec n={4} id="recipients" artLabel={t.artLabel} title={t.recipients.title}>
              {t.recipients.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={5} id="transfers" artLabel={t.artLabel} title={t.transfers.title}>
              <P>{t.transfers.p1(nonEuList)}</P>
              <P>{t.transfers.p2}</P>
            </Sec>

            <Sec n={6} id="security" artLabel={t.artLabel} title={t.security.title}>
              <P>
                {t.security.body(
                  <Link href={href(locale, "security")} className={linkClass}>
                    {t.security.securityPageLabel}
                  </Link>,
                )}
              </P>
            </Sec>

            <Sec n={7} id="retention" artLabel={t.artLabel} title={t.retention.title}>
              <P>{t.retention.intro}</P>
              <div className="overflow-x-auto rounded-[6px] border border-rule">
                <table className="w-full min-w-[640px] border-collapse bg-white text-left text-[15px]">
                  <caption className="sr-only">{t.retention.caption}</caption>
                  <thead>
                    <tr className="border-b border-rule">
                      <th scope="col" className={TH_CLASS}>
                        {t.retention.colCategory}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.retention.colDuration}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.retention.colWhy}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.retention.rows.map((row) => (
                      <tr key={row.category} className="border-b border-rule align-top">
                        <td className="px-4 py-3 text-ink">{row.category}</td>
                        <td className="px-4 py-3 font-mono text-[13px] text-ink">{row.duration}</td>
                        <td className="px-4 py-3 text-[14px] text-mine">{row.why}</td>
                      </tr>
                    ))}
                    <tr className="align-top">
                      <td className="px-4 py-3 text-ink">{t.retention.cookiesRowCategory}</td>
                      <td className="px-4 py-3 font-mono text-[13px]">
                        <Link href={href(locale, "cookies")} className={linkClass}>
                          {t.retention.cookiesLinkLabel}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[14px] text-mine">{t.retention.cookiesRowWhy}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <P>{t.retention.closing}</P>
            </Sec>

            <Sec n={8} id="rights" artLabel={t.artLabel} title={t.rights.title}>
              <P>{t.rights.intro}</P>
              <Ul items={t.rights.items} />
              <P>{t.rights.how}</P>
              <p>{emailLink}</p>
            </Sec>

            <Sec n={9} id="dpo" artLabel={t.artLabel} title={t.dpo.title}>
              {t.dpo.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={10} id="cnil" artLabel={t.artLabel} title={t.cnil.title}>
              <P>
                {t.cnil.body(
                  <a
                    href="https://www.cnil.fr"
                    rel="noopener noreferrer"
                    className={`font-mono ${linkClass}`}
                  >
                    {t.cnil.cnilLabel}
                  </a>,
                )}
              </P>
            </Sec>

            <Sec n={11} id="contact" artLabel={t.artLabel} title={t.contact.title}>
              <P>{t.contact.updates}</P>
              <P>{t.contact.body}</P>
              <p>{emailLink}</p>
              <P>
                <Link
                  href={href(locale, "contact")}
                  className="font-medium text-brand hover:underline underline-offset-4"
                >
                  {t.contact.formLink} →
                </Link>
              </P>
            </Sec>
          </div>
        </div>
      </Container>
    </article>
  );
}
