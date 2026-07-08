import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { Card, Container } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Legal-article scaffolding — duplicated in each of the five legal    */
/* page modules (foundation files are read-only and this mission only  */
/* owns the legal pages). Keep visually in sync with termsOfUse,       */
/* termsOfSale, privacy and cookies.                                   */
/* ------------------------------------------------------------------ */

const UPDATED = "2026-07-08";
/** Same address as the contact page (src/components/site/ContactForm.tsx). */
const CONTACT_EMAIL = "contact@fiscalplace.com";

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

function IdentityRows({ rows }: { rows: { label: string; value: string; mono?: boolean }[] }) {
  return (
    <Card>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 border-b border-rule px-4 py-3 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-4"
          >
            <dt className="font-mono text-xs font-medium uppercase tracking-wide text-mine">
              {row.label}
            </dt>
            <dd className={`text-[15px] leading-relaxed text-ink ${row.mono ? "font-mono text-sm" : ""}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface LegalNoticeCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  updatedLabel: string;
  artLabel: string;
  lede: string;
  tocLabel: string;
  publisher: { title: string; intro: string; rows: { label: string; value: string; mono?: boolean }[] };
  director: { title: string; p: string[] };
  hosting: {
    title: string;
    intro: string;
    rows: { label: string; value: string }[];
    note: string;
  };
  service: { title: string; p: string[] };
  ip: { title: string; p: string[] };
  data: {
    title: string;
    body: (privacy: ReactNode, cookies: ReactNode) => ReactNode;
    privacyLabel: string;
    cookiesLabel: string;
  };
  contact: { title: string; body: string; formLink: string };
}

const copy: Localized<LegalNoticeCopy> = {
  fr: {
    metaTitle: "Mentions légales",
    metaDescription:
      "Identité de l'éditeur de fiscalplace.com, hébergeur, directeur de la publication et nature exacte du service : démarches administratives et fiscales spécialisées, sans conseil fiscal personnalisé réglementé.",
    kicker: "Légal",
    h1: "Mentions légales",
    updatedLabel: "Dernière mise à jour",
    artLabel: "Art.",
    lede: "Cette page identifie l'éditeur de fiscalplace.com et précise la nature exacte de notre service, conformément à la loi pour la confiance dans l'économie numérique (LCEN). Les mentions en attente de finalisation sont signalées entre crochets : nous préférons un crochet honnête à une fausse précision.",
    tocLabel: "Sommaire",
    publisher: {
      title: "Éditeur du site",
      intro: "Le site fiscalplace.com (ci-après « le Site ») est édité par :",
      rows: [
        { label: "Dénomination sociale", value: "[DÉNOMINATION SOCIALE À COMPLÉTER]" },
        { label: "Forme juridique", value: "[FORME JURIDIQUE À COMPLÉTER]" },
        { label: "Capital social", value: "[CAPITAL SOCIAL À COMPLÉTER]" },
        { label: "Immatriculation", value: "[SIREN / RCS À COMPLÉTER]", mono: true },
        { label: "TVA intracommunautaire", value: "[N° DE TVA INTRACOMMUNAUTAIRE À COMPLÉTER]", mono: true },
        { label: "Siège social", value: "[ADRESSE DU SIÈGE SOCIAL À COMPLÉTER]" },
        { label: "Courriel", value: CONTACT_EMAIL, mono: true },
      ],
    },
    director: {
      title: "Directeur de la publication",
      p: [
        "Le directeur de la publication est [NOM DU DIRECTEUR DE LA PUBLICATION À COMPLÉTER], en qualité de représentant légal de l'éditeur.",
      ],
    },
    hosting: {
      title: "Hébergement",
      intro: "Le Site est hébergé par :",
      rows: [
        { label: "Hébergeur", value: "[HÉBERGEUR UE À CONFIRMER]" },
        { label: "Adresse", value: "[ADRESSE DE L'HÉBERGEUR À COMPLÉTER]" },
      ],
      note: "L'hébergement est prévu au sein de l'Union européenne ; le prestataire retenu sera confirmé sur cette page avant l'ouverture commerciale du service.",
    },
    service: {
      title: "Nature du service — ce que FiscalPlace est, et n'est pas",
      p: [
        "FiscalPlace fournit un service spécialisé de démarches administratives et fiscales : identification des retenues à la source prélevées en excès sur dividendes étrangers, préparation des dossiers de remboursement, dépôt auprès des administrations fiscales compétentes et suivi jusqu'à la décision, sur mandat exprès du client.",
        "FiscalPlace ne fournit pas de conseil fiscal personnalisé au sens réglementaire. Les contenus publiés sur le Site — taux, délais, guides, simulateurs — sont des informations générales, indicatives, revues régulièrement mais jamais adaptées à une situation individuelle. Ils ne constituent ni une consultation juridique ou fiscale, ni une recommandation d'investissement. Pour une stratégie fiscale d'ensemble, rapprochez-vous d'un avocat fiscaliste ou d'un expert-comptable.",
        "Selon les juridictions dans lesquelles les demandes sont déposées, la représentation devant une administration fiscale étrangère peut relever d'un statut ou d'un agrément particulier : [STATUT / AGRÉMENT ÉVENTUEL DE MANDATAIRE FISCAL SELON LES JURIDICTIONS — À VALIDER PAR CONSEIL JURIDIQUE].",
      ],
    },
    ip: {
      title: "Propriété intellectuelle",
      p: [
        "L'ensemble des éléments du Site (textes, structure, charte graphique, illustrations, logiciels, bases de données) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable de l'éditeur est interdite, à l'exception des courtes citations avec mention de la source.",
        "Les noms d'administrations, de courtiers ou de sociétés cités sur le Site appartiennent à leurs titulaires respectifs ; ils ne sont mentionnés qu'à des fins d'identification et n'impliquent aucun partenariat.",
      ],
    },
    data: {
      title: "Données personnelles et cookies",
      body: (privacy, cookies) => (
        <>
          Le traitement de vos données personnelles est décrit dans notre {privacy}. L'inventaire
          complet et honnête de ce que votre navigateur stocke — quatre entrées, zéro traceur —
          figure dans la {cookies}.
        </>
      ),
      privacyLabel: "politique de confidentialité",
      cookiesLabel: "politique de cookies",
    },
    contact: {
      title: "Contact",
      body: "Pour toute question relative au Site ou aux présentes mentions légales :",
      formLink: "Ou passez par la page contact",
    },
  },
  en: {
    metaTitle: "Legal Notice",
    metaDescription:
      "Publisher identity for fiscalplace.com, hosting provider, publication director, and the exact nature of the service: specialised administrative and tax filings, not regulated personalised tax advice.",
    kicker: "Legal",
    h1: "Legal notice",
    updatedLabel: "Last updated",
    artLabel: "Art.",
    lede: "This page identifies the publisher of fiscalplace.com and states exactly what our service is, as required by French law (LCEN). Items still being finalised are shown in brackets: we prefer an honest bracket to false precision.",
    tocLabel: "Contents",
    publisher: {
      title: "Site publisher",
      intro: "The fiscalplace.com website (the “Site”) is published by:",
      rows: [
        { label: "Company name", value: "[COMPANY NAME TO BE COMPLETED]" },
        { label: "Legal form", value: "[LEGAL FORM TO BE COMPLETED]" },
        { label: "Share capital", value: "[SHARE CAPITAL TO BE COMPLETED]" },
        { label: "Registration", value: "[SIREN / RCS NUMBER TO BE COMPLETED]", mono: true },
        { label: "EU VAT number", value: "[EU VAT NUMBER TO BE COMPLETED]", mono: true },
        { label: "Registered office", value: "[REGISTERED OFFICE ADDRESS TO BE COMPLETED]" },
        { label: "Email", value: CONTACT_EMAIL, mono: true },
      ],
    },
    director: {
      title: "Publication director",
      p: [
        "The publication director is [PUBLICATION DIRECTOR NAME TO BE COMPLETED], acting as legal representative of the publisher.",
      ],
    },
    hosting: {
      title: "Hosting",
      intro: "The Site is hosted by:",
      rows: [
        { label: "Hosting provider", value: "[EU HOSTING PROVIDER TO BE CONFIRMED]" },
        { label: "Address", value: "[HOSTING PROVIDER ADDRESS TO BE COMPLETED]" },
      ],
      note: "Hosting is planned within the European Union; the chosen provider will be confirmed on this page before the service opens commercially.",
    },
    service: {
      title: "Nature of the service — what FiscalPlace is, and is not",
      p: [
        "FiscalPlace provides a specialised administrative and tax-filing service: identifying over-withheld tax on foreign dividends, preparing refund claims, filing them with the competent tax administrations and following them through to the decision, under an express mandate from the client.",
        "FiscalPlace does not provide personalised tax advice in the regulatory sense. The content published on the Site — rates, deadlines, guides, calculators — is general, indicative information, reviewed regularly but never tailored to an individual situation. It is neither legal or tax advice nor an investment recommendation. For an overall tax strategy, consult a tax lawyer or a chartered accountant.",
        "Depending on the jurisdictions where claims are filed, representing clients before a foreign tax administration may require a specific status or licence: [POSSIBLE TAX-AGENT STATUS OR LICENCE PER JURISDICTION — TO BE VALIDATED BY LEGAL COUNSEL].",
      ],
    },
    ip: {
      title: "Intellectual property",
      p: [
        "All elements of the Site (texts, structure, visual identity, illustrations, software, databases) are protected by intellectual-property law. Any reproduction or representation, in whole or in part, without the publisher's prior written consent is prohibited, except for short quotations with attribution.",
        "Names of administrations, brokers or companies mentioned on the Site belong to their respective owners; they are cited for identification purposes only and imply no partnership.",
      ],
    },
    data: {
      title: "Personal data and cookies",
      body: (privacy, cookies) => (
        <>
          How we process your personal data is described in our {privacy}. The complete, honest
          inventory of what your browser stores — four entries, zero trackers — is in the {cookies}.
        </>
      ),
      privacyLabel: "privacy policy",
      cookiesLabel: "cookie policy",
    },
    contact: {
      title: "Contact",
      body: "For any question about the Site or this legal notice:",
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

  const sections = [
    { id: "publisher", title: t.publisher.title },
    { id: "director", title: t.director.title },
    { id: "hosting", title: t.hosting.title },
    { id: "service", title: t.service.title },
    { id: "ip", title: t.ip.title },
    { id: "data", title: t.data.title },
    { id: "contact", title: t.contact.title },
  ];

  const linkClass = "text-brand underline underline-offset-4 hover:text-brand-deep";

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
            <Sec n={1} id="publisher" artLabel={t.artLabel} title={t.publisher.title}>
              <P>{t.publisher.intro}</P>
              <IdentityRows rows={t.publisher.rows} />
            </Sec>

            <Sec n={2} id="director" artLabel={t.artLabel} title={t.director.title}>
              {t.director.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={3} id="hosting" artLabel={t.artLabel} title={t.hosting.title}>
              <P>{t.hosting.intro}</P>
              <IdentityRows rows={t.hosting.rows} />
              <P>{t.hosting.note}</P>
            </Sec>

            <Sec n={4} id="service" artLabel={t.artLabel} title={t.service.title}>
              {t.service.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={5} id="ip" artLabel={t.artLabel} title={t.ip.title}>
              {t.ip.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={6} id="data" artLabel={t.artLabel} title={t.data.title}>
              <P>
                {t.data.body(
                  <Link href={href(locale, "privacy")} className={linkClass}>
                    {t.data.privacyLabel}
                  </Link>,
                  <Link href={href(locale, "cookies")} className={linkClass}>
                    {t.data.cookiesLabel}
                  </Link>,
                )}
              </P>
            </Sec>

            <Sec n={7} id="contact" artLabel={t.artLabel} title={t.contact.title}>
              <P>{t.contact.body}</P>
              <p>
                <a href={`mailto:${CONTACT_EMAIL}`} className={`font-mono text-[15px] ${linkClass}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
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
