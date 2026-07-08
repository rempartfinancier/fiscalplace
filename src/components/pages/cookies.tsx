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
/* owns the legal pages). Keep visually in sync with legalNotice,      */
/* termsOfUse, termsOfSale and privacy.                                */
/* ------------------------------------------------------------------ */

const UPDATED = "2026-07-08";
/** Same address as the contact page (src/components/site/ContactForm.tsx). */
const CONTACT_EMAIL = "contact@fiscalplace.com";

/**
 * The REAL storage inventory. These keys mirror, character for character,
 * what the code actually writes to localStorage:
 * - src/components/site/CookieBanner.tsx  → fp-cookie-consent
 * - src/components/portal/PortalContext.tsx → fp-demo-session, fp-demo-signed,
 *   fp-demo-notifs-read
 * If a key is added or removed in those files, this table must be updated.
 */
const STORAGE_KEYS = ["fp-cookie-consent", "fp-demo-session", "fp-demo-signed", "fp-demo-notifs-read"] as const;
type StorageKey = (typeof STORAGE_KEYS)[number];

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

interface CookiesCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  updatedLabel: string;
  artLabel: string;
  lede: string;
  tocLabel: string;
  approach: { title: string; p: string[] };
  inventory: {
    title: string;
    intro: string;
    caption: string;
    colName: string;
    colPurpose: string;
    colDuration: string;
    purposes: Record<StorageKey, string>;
    duration: string;
    note: string;
  };
  notUsed: { title: string; intro: string; items: string[] };
  future: { title: string; p: string[] };
  clearing: { title: string; p: string[] };
  contact: {
    title: string;
    body: (privacy: ReactNode) => ReactNode;
    privacyLabel: string;
    emailIntro: string;
    formLink: string;
  };
}

const copy: Localized<CookiesCopy> = {
  fr: {
    metaTitle: "Politique de cookies",
    metaDescription:
      "L'inventaire exact de ce que fiscalplace.com stocke dans votre navigateur : quatre entrées strictement nécessaires, aucun cookie publicitaire, aucune mesure d'audience, aucun traceur tiers.",
    kicker: "Légal",
    h1: "Politique de cookies",
    updatedLabel: "Dernière mise à jour",
    artLabel: "Art.",
    lede: "La version courte : aucun traceur. La version longue tient sur cette page — l'inventaire exact, vérifiable, de ce que votre navigateur stocke quand vous utilisez fiscalplace.com.",
    tocLabel: "Sommaire",
    approach: {
      title: "Notre approche",
      p: [
        "Le site n'utilise que des stockages strictement nécessaires à son fonctionnement. Aucun cookie publicitaire, aucun outil de mesure d'audience, aucun traceur tiers n'est en place à ce jour.",
        "Le bandeau affiché lors de votre première visite est donc un bandeau d'information : il ne conditionne l'accès à rien et n'a rien d'autre à vous faire accepter. Il existe pour que vous sachiez exactement à quoi vous en tenir — et il ne réapparaît pas une fois votre choix enregistré.",
      ],
    },
    inventory: {
      title: "L'inventaire exact",
      intro:
        "À ce jour, fiscalplace.com ne dépose aucun cookie HTTP. Il utilise quatre entrées de stockage local (localStorage), une technologie du navigateur soumise aux mêmes exigences de transparence que les cookies. Les voici, toutes :",
      caption: "Inventaire des stockages du navigateur : nom, finalité, durée",
      colName: "Nom",
      colPurpose: "Finalité",
      colDuration: "Durée",
      purposes: {
        "fp-cookie-consent":
          "Retient que vous avez vu le bandeau d'information, et le choix effectué, pour ne pas le réafficher à chaque visite.",
        "fp-demo-session":
          "Retient que vous avez ouvert l'espace client de démonstration, pour ne pas rejouer l'écran d'entrée.",
        "fp-demo-signed":
          "Retient les signatures de mandat simulées dans la démonstration — données entièrement fictives.",
        "fp-demo-notifs-read":
          "Retient que les notifications de démonstration ont été marquées comme lues.",
      },
      duration: "Jusqu'à suppression par vous — le stockage local n'expire pas de lui-même.",
      note: "Aucune de ces entrées ne contient de donnée permettant de vous identifier ; aucune ne quitte votre navigateur ; aucune n'est transmise à quiconque.",
    },
    notUsed: {
      title: "Ce que nous n'utilisons pas",
      intro: "Pour lever toute ambiguïté, voici ce qui est absent du site à ce jour :",
      items: [
        "aucun outil de mesure d'audience (pas de Google Analytics ni d'équivalent) ;",
        "aucun cookie publicitaire ou de reciblage ;",
        "aucun pixel ou bouton de réseau social ;",
        "aucun partage de données de navigation avec des tiers, à quelque fin que ce soit.",
      ],
    },
    future: {
      title: "Et si cela change un jour ?",
      p: [
        "Si nous ajoutons un jour un outil de mesure d'audience ou tout autre stockage non strictement nécessaire, trois engagements s'appliqueront : il sera désactivé par défaut ; votre consentement préalable sera recueilli via le bandeau avant tout dépôt ; et le tableau ci-dessus sera mis à jour avant l'activation. Refuser restera aussi simple qu'accepter.",
      ],
    },
    clearing: {
      title: "Effacer ces stockages",
      p: [
        "Vous pouvez supprimer ces entrées à tout moment via les réglages de votre navigateur (« effacer les données de site »). Conséquences, honnêtement modestes : le bandeau d'information réapparaîtra et l'état de la démonstration sera réinitialisé. Rien d'autre.",
      ],
    },
    contact: {
      title: "Contact",
      body: (privacy) => (
        <>
          Pour la vue d'ensemble des traitements de données — dossier fiscal, KYC, durées de
          conservation, droits RGPD — consultez la {privacy}.
        </>
      ),
      privacyLabel: "politique de confidentialité",
      emailIntro: "Pour toute question sur cette politique :",
      formLink: "Ou passez par la page contact",
    },
  },
  en: {
    metaTitle: "Cookie Policy",
    metaDescription:
      "The exact inventory of what fiscalplace.com stores in your browser: four strictly necessary entries, no advertising cookies, no analytics, no third-party trackers.",
    kicker: "Legal",
    h1: "Cookie Policy",
    updatedLabel: "Last updated",
    artLabel: "Art.",
    lede: "The short version: no trackers. The long version fits on this page — the exact, verifiable inventory of what your browser stores when you use fiscalplace.com.",
    tocLabel: "Contents",
    approach: {
      title: "Our approach",
      p: [
        "The site only uses storage strictly necessary for it to work. No advertising cookies, no analytics tools, no third-party trackers are in place to date.",
        "The banner shown on your first visit is therefore an information banner: it gates nothing and has nothing else for you to accept. It exists so you know exactly where you stand — and it does not reappear once your choice is saved.",
      ],
    },
    inventory: {
      title: "The exact inventory",
      intro:
        "To date, fiscalplace.com sets no HTTP cookies. It uses four local-storage entries (localStorage), a browser technology subject to the same transparency requirements as cookies. Here they are, all of them:",
      caption: "Browser storage inventory: name, purpose, duration",
      colName: "Name",
      colPurpose: "Purpose",
      colDuration: "Duration",
      purposes: {
        "fp-cookie-consent":
          "Remembers that you saw the information banner, and the choice you made, so it is not shown again on every visit.",
        "fp-demo-session":
          "Remembers that you opened the demo client area, so the entry screen is not replayed.",
        "fp-demo-signed":
          "Remembers the mandate signatures simulated in the demo — entirely fictitious data.",
        "fp-demo-notifs-read": "Remembers that the demo notifications were marked as read.",
      },
      duration: "Until you delete it — local storage does not expire on its own.",
      note: "None of these entries contains data that could identify you; none leaves your browser; none is transmitted to anyone.",
    },
    notUsed: {
      title: "What we do not use",
      intro: "To remove any ambiguity, here is what is absent from the site to date:",
      items: [
        "no audience-measurement tool (no Google Analytics or equivalent);",
        "no advertising or retargeting cookies;",
        "no social-network pixels or buttons;",
        "no sharing of browsing data with third parties, for any purpose.",
      ],
    },
    future: {
      title: "And if that ever changes?",
      p: [
        "If we ever add an analytics tool or any other storage that is not strictly necessary, three commitments will apply: it will be off by default; your prior consent will be collected through the banner before anything is set; and the table above will be updated before activation. Refusing will remain as easy as accepting.",
      ],
    },
    clearing: {
      title: "Clearing this storage",
      p: [
        "You can delete these entries at any time through your browser settings (“clear site data”). The consequences, honestly modest: the information banner will reappear and the demo state will reset. Nothing else.",
      ],
    },
    contact: {
      title: "Contact",
      body: (privacy) => (
        <>
          For the full picture of data processing — tax file, KYC, retention periods, GDPR rights —
          see the {privacy}.
        </>
      ),
      privacyLabel: "privacy policy",
      emailIntro: "For any question about this policy:",
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
    { id: "approach", title: t.approach.title },
    { id: "inventory", title: t.inventory.title },
    { id: "not-used", title: t.notUsed.title },
    { id: "future", title: t.future.title },
    { id: "clearing", title: t.clearing.title },
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
            <Sec n={1} id="approach" artLabel={t.artLabel} title={t.approach.title}>
              {t.approach.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={2} id="inventory" artLabel={t.artLabel} title={t.inventory.title}>
              <P>{t.inventory.intro}</P>
              <div className="overflow-x-auto rounded-[6px] border border-rule">
                <table className="w-full min-w-[640px] border-collapse bg-white text-left text-[15px]">
                  <caption className="sr-only">{t.inventory.caption}</caption>
                  <thead>
                    <tr className="border-b border-rule">
                      <th scope="col" className={TH_CLASS}>
                        {t.inventory.colName}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.inventory.colPurpose}
                      </th>
                      <th scope="col" className={TH_CLASS}>
                        {t.inventory.colDuration}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {STORAGE_KEYS.map((key) => (
                      <tr key={key} className="border-b border-rule last:border-b-0 align-top">
                        <th scope="row" className="px-4 py-3 font-mono text-[13px] font-normal text-ink">
                          {key}
                        </th>
                        <td className="px-4 py-3 text-[14px] text-mine">{t.inventory.purposes[key]}</td>
                        <td className="px-4 py-3 text-[14px] text-mine">{t.inventory.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <P>{t.inventory.note}</P>
            </Sec>

            <Sec n={3} id="not-used" artLabel={t.artLabel} title={t.notUsed.title}>
              <P>{t.notUsed.intro}</P>
              <Ul items={t.notUsed.items} />
            </Sec>

            <Sec n={4} id="future" artLabel={t.artLabel} title={t.future.title}>
              {t.future.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={5} id="clearing" artLabel={t.artLabel} title={t.clearing.title}>
              {t.clearing.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={6} id="contact" artLabel={t.artLabel} title={t.contact.title}>
              <P>
                {t.contact.body(
                  <Link href={href(locale, "privacy")} className={linkClass}>
                    {t.contact.privacyLabel}
                  </Link>,
                )}
              </P>
              <P>{t.contact.emailIntro}</P>
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
