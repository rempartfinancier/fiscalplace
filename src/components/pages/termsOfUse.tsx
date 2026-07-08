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

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface TermsOfUseCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  updatedLabel: string;
  artLabel: string;
  lede: (cgv: ReactNode) => ReactNode;
  cgvLabel: string;
  tocLabel: string;
  purpose: { title: string; p1: string; p2: (cgv: ReactNode) => ReactNode };
  access: { title: string; p: string[] };
  account: { title: string; p: string[] };
  acceptableUse: { title: string; intro: string; items: string[]; closing: string };
  ip: { title: string; p: string[] };
  availability: { title: string; p: string[] };
  data: {
    title: string;
    body: (privacy: ReactNode, cookies: ReactNode) => ReactNode;
    privacyLabel: string;
    cookiesLabel: string;
  };
  liability: { title: string; p: string[] };
  law: { title: string; p: string[] };
  contact: { title: string; body: string; formLink: string };
}

const copy: Localized<TermsOfUseCopy> = {
  fr: {
    metaTitle: "Conditions générales d'utilisation (CGU)",
    metaDescription:
      "Les règles d'accès et d'utilisation de fiscalplace.com et de l'espace client : compte, sécurité des identifiants, usage acceptable, disponibilité, responsabilité, droit applicable et médiation.",
    kicker: "Légal",
    h1: "Conditions générales d'utilisation",
    updatedLabel: "Dernière mise à jour",
    artLabel: "Art.",
    lede: (cgv) => (
      <>
        Les présentes conditions (« CGU ») encadrent l'accès au site fiscalplace.com et à l'espace
        client. Elles sont volontairement lisibles : la transparence que nous appliquons aux tarifs
        vaut aussi pour le droit. Les prestations payantes relèvent des {cgv}.
      </>
    ),
    cgvLabel: "conditions générales de vente",
    tocLabel: "Sommaire",
    purpose: {
      title: "Objet",
      p1: "Les CGU définissent les règles d'accès et d'utilisation du site fiscalplace.com (le « Site ») et de l'espace client associé, édités par [DÉNOMINATION SOCIALE À COMPLÉTER] (« l'éditeur », « nous »). Elles s'appliquent à tout visiteur, client ou non. Naviguer sur le Site vaut acceptation des CGU en vigueur à la date de la visite.",
      p2: (cgv) => (
        <>
          La commande de prestations — récupération au succès, forfaits, abonnement — est régie par
          les {cgv}, qui prévalent sur les présentes CGU en cas de contradiction.
        </>
      ),
    },
    access: {
      title: "Accès au Site et à l'espace client",
      p: [
        "Le Site public — y compris le simulateur de récupération et le calculateur de délais de prescription — est accessible gratuitement, sans création de compte. Les résultats de ces outils en libre-service sont des estimations indicatives, jamais un engagement.",
        "L'espace client est réservé aux utilisateurs disposant d'un compte. À ce jour, l'espace accessible depuis le Site est un environnement de démonstration : toutes les données qui y figurent sont fictives et servent uniquement à illustrer le fonctionnement du produit.",
        "L'accès au Site peut être suspendu pour maintenance, mise à jour ou raison de sécurité, sans préavis lorsque l'urgence le justifie.",
      ],
    },
    account: {
      title: "Compte : exactitude des informations et sécurité des identifiants",
      p: [
        "Lors de la création d'un compte, vous vous engagez à fournir des informations exactes, complètes et à jour, et à les corriger sans délai en cas de changement. L'exactitude de ces informations conditionne la validité des démarches effectuées pour votre compte : une résidence fiscale erronée, par exemple, peut invalider une demande entière.",
        "Vos identifiants sont strictement personnels. Vous êtes responsable de leur confidentialité et des actions effectuées depuis votre compte. En cas de perte, de vol ou d'utilisation suspecte, prévenez-nous immédiatement pour que le compte soit sécurisé.",
        "Un compte correspond à une personne physique ou morale. Les entités supplémentaires (compte-titres distinct, société, structure patrimoniale) se gèrent au sein du même compte, pas par la multiplication de comptes.",
      ],
    },
    acceptableUse: {
      title: "Usage acceptable",
      intro:
        "Le Site est conçu pour préparer et suivre des démarches réelles. Sont notamment interdits :",
      items: [
        "toute utilisation illicite ou frauduleuse, notamment la transmission de documents falsifiés ou de données que vous savez inexactes ;",
        "toute tentative d'accès non autorisé au Site, à ses serveurs ou aux comptes d'autres utilisateurs, et tout test de sécurité non sollicité ;",
        "l'extraction massive ou automatisée du contenu du Site (scraping) à des fins de réutilisation commerciale ;",
        "toute perturbation volontaire du fonctionnement du Site : surcharge, injection de code, contournement des mesures techniques.",
      ],
      closing:
        "En cas de manquement, l'éditeur peut suspendre ou clôturer le compte concerné, sans préjudice des actions et des signalements que la loi impose ou permet.",
    },
    ip: {
      title: "Propriété intellectuelle",
      p: [
        "Le Site, sa structure, ses contenus rédactionnels, ses simulateurs et sa charte graphique sont protégés par le droit de la propriété intellectuelle et demeurent la propriété de l'éditeur. L'utilisation du Site ne vous confère aucun droit sur ces éléments au-delà de la consultation personnelle.",
        "Les documents que vous déposez dans l'espace client restent les vôtres. Vous nous accordez uniquement le droit de les traiter, de les reproduire et de les transmettre aux administrations compétentes, dans la stricte mesure nécessaire à l'exécution du service demandé.",
      ],
    },
    availability: {
      title: "Disponibilité et évolution du Site",
      p: [
        "Nous mettons en œuvre des efforts raisonnables pour maintenir le Site accessible et sécurisé, sans obligation de résultat sur la disponibilité : des interruptions restent possibles (maintenance planifiée, incident, défaillance d'un prestataire d'hébergement).",
        "Le Site et ses fonctionnalités évoluent. Nous pouvons modifier, remplacer ou retirer une fonctionnalité, en veillant à ne pas dégrader le suivi des dossiers en cours.",
      ],
    },
    data: {
      title: "Données personnelles",
      body: (privacy, cookies) => (
        <>
          Les traitements de données liés au Site et au service sont décrits dans la {privacy}.
          L'inventaire exact des stockages du navigateur figure dans la {cookies}. Aucune donnée de
          navigation n'est vendue ni transmise à des régies publicitaires.
        </>
      ),
      privacyLabel: "politique de confidentialité",
      cookiesLabel: "politique de cookies",
    },
    liability: {
      title: "Responsabilité",
      p: [
        "Les contenus publics du Site — taux, délais, guides, simulations — sont des informations générales à caractère indicatif : ils sont revus régulièrement, mais ne remplacent ni la vérification dossier par dossier effectuée avant tout dépôt, ni un conseil personnalisé. Les décisions de remboursement appartiennent aux administrations fiscales, jamais à FiscalPlace.",
        "L'éditeur ne répond pas des dommages résultant d'une utilisation du Site contraire aux CGU, d'informations inexactes fournies par l'utilisateur, ou d'événements échappant à son contrôle raisonnable. Rien dans les présentes n'exclut ni ne limite une responsabilité qui ne peut l'être en vertu de la loi (dol, faute lourde, dommage corporel).",
      ],
    },
    law: {
      title: "Droit applicable et médiation de la consommation",
      p: [
        "Les CGU sont soumises au droit français [DROIT APPLICABLE À VALIDER PAR CONSEIL JURIDIQUE], sans préjudice des dispositions impératives protégeant les consommateurs de leur pays de résidence.",
        "Si vous êtes consommateur et qu'un litige n'est pas résolu directement avec nous, vous pouvez recourir gratuitement à un médiateur de la consommation : [MÉDIATEUR DE LA CONSOMMATION À DÉSIGNER — coordonnées et modalités de saisine à publier ici]. À défaut de résolution amiable, les tribunaux compétents sont saisis dans les conditions de droit commun.",
      ],
    },
    contact: {
      title: "Contact",
      body: "Pour toute question relative aux présentes CGU :",
      formLink: "Ou passez par la page contact",
    },
  },
  en: {
    metaTitle: "Terms of Use",
    metaDescription:
      "The rules governing access to and use of fiscalplace.com and the client area: account accuracy, credential security, acceptable use, availability, liability, governing law and consumer mediation.",
    kicker: "Legal",
    h1: "Terms of Use",
    updatedLabel: "Last updated",
    artLabel: "Art.",
    lede: (cgv) => (
      <>
        These terms (the “Terms of Use”) govern access to the fiscalplace.com website and the client
        area. They are deliberately readable: the transparency we apply to pricing applies to the
        legal fine print too. Paid services are governed by the {cgv}.
      </>
    ),
    cgvLabel: "terms of sale",
    tocLabel: "Contents",
    purpose: {
      title: "Purpose",
      p1: "These Terms of Use set the rules for accessing and using the fiscalplace.com website (the “Site”) and the associated client area, published by [COMPANY NAME TO BE COMPLETED] (the “publisher”, “we”). They apply to every visitor, client or not. Browsing the Site constitutes acceptance of the Terms of Use in force on the date of the visit.",
      p2: (cgv) => (
        <>
          Ordering services — success-fee recovery, fixed-fee services, subscription — is governed
          by the {cgv}, which prevail over these Terms of Use in case of conflict.
        </>
      ),
    },
    access: {
      title: "Access to the Site and the client area",
      p: [
        "The public Site — including the refund simulator and the deadline calculator — is free to use, with no account required. Results from these self-service tools are indicative estimates, never a commitment.",
        "The client area is reserved for users with an account. At this time, the area accessible from the Site is a demonstration environment: all data shown in it is fictitious and only illustrates how the product works.",
        "Access to the Site may be suspended for maintenance, updates or security reasons, without notice where urgency requires it.",
      ],
    },
    account: {
      title: "Account: accurate information and credential security",
      p: [
        "When creating an account, you undertake to provide accurate, complete and up-to-date information, and to correct it without delay when it changes. The accuracy of this information conditions the validity of the filings made on your behalf: a wrong tax residence, for instance, can invalidate an entire claim.",
        "Your credentials are strictly personal. You are responsible for keeping them confidential and for the actions performed from your account. If they are lost, stolen or misused, tell us immediately so the account can be secured.",
        "One account corresponds to one natural or legal person. Additional entities (a separate brokerage account, a company, a holding structure) are managed within the same account, not by multiplying accounts.",
      ],
    },
    acceptableUse: {
      title: "Acceptable use",
      intro:
        "The Site exists to prepare and track real filings. The following are prohibited, among others:",
      items: [
        "any unlawful or fraudulent use, including submitting falsified documents or data you know to be inaccurate;",
        "any attempt to gain unauthorised access to the Site, its servers or other users' accounts, and any unsolicited security testing;",
        "bulk or automated extraction of Site content (scraping) for commercial reuse;",
        "any deliberate disruption of the Site: overload, code injection, circumvention of technical measures.",
      ],
      closing:
        "In case of breach, the publisher may suspend or close the account concerned, without prejudice to the actions and reports the law requires or permits.",
    },
    ip: {
      title: "Intellectual property",
      p: [
        "The Site, its structure, editorial content, calculators and visual identity are protected by intellectual-property law and remain the publisher's property. Using the Site grants you no rights over these elements beyond personal consultation.",
        "The documents you upload to the client area remain yours. You grant us only the right to process, reproduce and transmit them to the competent administrations, strictly as needed to perform the service you requested.",
      ],
    },
    availability: {
      title: "Availability and changes to the Site",
      p: [
        "We use reasonable efforts to keep the Site accessible and secure, with no guarantee of availability: interruptions remain possible (planned maintenance, incidents, hosting-provider failures).",
        "The Site and its features evolve. We may modify, replace or remove a feature, taking care not to degrade the tracking of claims in progress.",
      ],
    },
    data: {
      title: "Personal data",
      body: (privacy, cookies) => (
        <>
          Data processing related to the Site and the service is described in the {privacy}. The
          exact inventory of browser storage is in the {cookies}. No browsing data is sold or passed
          to advertising networks.
        </>
      ),
      privacyLabel: "privacy policy",
      cookiesLabel: "cookie policy",
    },
    liability: {
      title: "Liability",
      p: [
        "The Site's public content — rates, deadlines, guides, simulations — is general, indicative information: it is reviewed regularly but replaces neither the claim-by-claim verification performed before any filing, nor personalised advice. Refund decisions belong to the tax administrations, never to FiscalPlace.",
        "The publisher is not liable for damage resulting from use of the Site in breach of these Terms of Use, from inaccurate information supplied by the user, or from events beyond its reasonable control. Nothing in these terms excludes or limits any liability that cannot be excluded or limited by law (wilful misconduct, gross negligence, personal injury).",
      ],
    },
    law: {
      title: "Governing law and consumer mediation",
      p: [
        "These Terms of Use are governed by French law [GOVERNING LAW TO BE VALIDATED BY LEGAL COUNSEL], without prejudice to the mandatory consumer-protection rules of your country of residence.",
        "If you are a consumer and a dispute is not resolved directly with us, you may refer it free of charge to a consumer mediator: [CONSUMER MEDIATOR TO BE APPOINTED — contact details and referral process to be published here]. Failing amicable resolution, the competent courts have jurisdiction under ordinary rules.",
      ],
    },
    contact: {
      title: "Contact",
      body: "For any question about these Terms of Use:",
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
    { id: "purpose", title: t.purpose.title },
    { id: "access", title: t.access.title },
    { id: "account", title: t.account.title },
    { id: "acceptable-use", title: t.acceptableUse.title },
    { id: "ip", title: t.ip.title },
    { id: "availability", title: t.availability.title },
    { id: "data", title: t.data.title },
    { id: "liability", title: t.liability.title },
    { id: "law", title: t.law.title },
    { id: "contact", title: t.contact.title },
  ];

  const linkClass = "text-brand underline underline-offset-4 hover:text-brand-deep";
  const cgvLink = (
    <Link href={href(locale, "termsOfSale")} className={linkClass}>
      {t.cgvLabel}
    </Link>
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
            <p className="mt-5 max-w-[72ch] text-[16px] leading-relaxed text-mine">
              {t.lede(cgvLink)}
            </p>
          </header>

          <div className="mt-8">
            <Toc label={t.tocLabel} items={sections} />
          </div>

          <div className="mt-10 space-y-10">
            <Sec n={1} id="purpose" artLabel={t.artLabel} title={t.purpose.title}>
              <P>{t.purpose.p1}</P>
              <P>{t.purpose.p2(cgvLink)}</P>
            </Sec>

            <Sec n={2} id="access" artLabel={t.artLabel} title={t.access.title}>
              {t.access.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={3} id="account" artLabel={t.artLabel} title={t.account.title}>
              {t.account.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={4} id="acceptable-use" artLabel={t.artLabel} title={t.acceptableUse.title}>
              <P>{t.acceptableUse.intro}</P>
              <Ul items={t.acceptableUse.items} />
              <P>{t.acceptableUse.closing}</P>
            </Sec>

            <Sec n={5} id="ip" artLabel={t.artLabel} title={t.ip.title}>
              {t.ip.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={6} id="availability" artLabel={t.artLabel} title={t.availability.title}>
              {t.availability.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={7} id="data" artLabel={t.artLabel} title={t.data.title}>
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

            <Sec n={8} id="liability" artLabel={t.artLabel} title={t.liability.title}>
              {t.liability.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={9} id="law" artLabel={t.artLabel} title={t.law.title}>
              {t.law.p.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Sec>

            <Sec n={10} id="contact" artLabel={t.artLabel} title={t.contact.title}>
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
