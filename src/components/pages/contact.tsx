import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
import {
  Container,
  ButtonLink,
  Card,
  SectionHeading,
} from "@/components/ui/primitives";
import { ContactForm } from "@/components/site/ContactForm";

/**
 * CONTACT — honest reply promise (2 business days), mocked form, no invented
 * phone number or address (conventions §5), and Sheridan-style assignment
 * selling: three readings that make the conversation more useful.
 */

const CONTACT_EMAIL = "contact@fiscalplace.com";

interface ContactCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: string;
  channels: {
    email: { title: string; body: string };
    mail: { title: string; body: string; placeholder: string };
    phone: { title: string; body: string; placeholder: string };
  };
  scope: {
    title: string;
    body: string;
  };
  readings: {
    kicker: string;
    title: string;
    lede: string;
    cards: { key: RouteKey; title: string; body: string; linkLabel: string }[];
  };
  selfService: {
    title: string;
    body: string;
    cta: string;
  };
}

const copy: Localized<ContactCopy> = {
  fr: {
    metaTitle: "Contact — une vraie réponse sous 2 jours ouvrés",
    metaDescription:
      "Écrivez-nous : question sur un dossier, partenariat CGP, presse. Réponse utile sous 2 jours ouvrés, pas d'accusé de réception automatique — et pas de séquence commerciale derrière.",
    kicker: "Contact",
    h1: "Écrivez-nous : une vraie réponse sous 2 jours ouvrés",
    lede: "Votre message arrive à l'équipe qui traite les dossiers — pas dans un logiciel de relance commerciale. Nous répondons sous 2 jours ouvrés, avec une réponse utile ; et si votre question dépasse notre périmètre, nous vous le dirons aussi.",
    channels: {
      email: {
        title: "Par email",
        body: "Si vous préférez votre messagerie au formulaire — même adresse, même promesse de réponse sous 2 jours ouvrés.",
      },
      mail: {
        title: "Par courrier",
        body: "Pour les documents qui l'exigent uniquement : rien ne circule plus vite ni plus sûrement que l'espace client.",
        placeholder: "[ADRESSE DU SIÈGE À COMPLÉTER]",
      },
      phone: {
        title: "Par téléphone",
        body: "Pour un échange direct avec l'équipe qui traite les dossiers.",
        placeholder: "01 84 16 37 91",
      },
    },
    scope: {
      title: "Ce que ce formulaire ne fait pas",
      body: "Il n'ouvre pas de dossier (les comptes réels ouvrent à la mise en production) et ne doit pas transporter de documents sensibles : quand un dossier s'ouvre, tout passe par l'espace client chiffré.",
    },
    readings: {
      kicker: "Avant l'échange",
      title: "Trois lectures qui rendront la conversation plus utile",
      lede: "La plupart des premières questions trouvent déjà leur réponse dans ces pages. Les lire avant d'écrire, c'est souvent gagner un aller-retour — et arriver à l'échange avec les bonnes questions.",
      cards: [
        {
          key: "pricing",
          title: "Les tarifs, en entier",
          body: "Commission au succès tranche par tranche, plancher, plafond, forfaits fixes, exemples calculés : vous saurez au centime près comment nous sommes payés.",
          linkLabel: "Lire les tarifs",
        },
        {
          key: "howItWorks",
          title: "Le processus, étape par étape",
          body: "Ce que vous faites, ce que nous faisons, quels documents sont nécessaires et combien de temps chaque phase prend réellement.",
          linkLabel: "Lire le processus",
        },
        {
          key: "comparison",
          title: "Le comparatif honnête",
          body: "FiscalPlace face au faire soi-même, au courtier et à ne rien faire — y compris les cas où nous ne sommes pas la bonne option.",
          linkLabel: "Lire le comparatif",
        },
      ],
    },
    selfService: {
      title: "Et si votre question est « combien ? »",
      body: "Le simulateur y répond en deux minutes, sans email et sans engagement : taux conventionnels appliqués à vos dividendes, commission déduite, net affiché.",
      cta: "Calculer mon trop-perçu",
    },
  },
  en: {
    metaTitle: "Contact — a real answer within 2 business days",
    metaDescription:
      "Write to us: a claim question, a wealth-manager partnership, press. A useful reply within 2 business days, no automated acknowledgement — and no sales sequence behind it.",
    kicker: "Contact",
    h1: "Write to us: a real answer within 2 business days",
    lede: "Your message reaches the team that handles the claims — not a sales-automation tool. We reply within 2 business days with a useful answer; and if your question is outside our scope, we will say that too.",
    channels: {
      email: {
        title: "By email",
        body: "If you prefer your inbox to the form — same address, same 2-business-day reply promise.",
      },
      mail: {
        title: "By post",
        body: "Only for documents that require it: nothing travels faster or more safely than the client area.",
        placeholder: "[REGISTERED OFFICE ADDRESS TO BE COMPLETED]",
      },
      phone: {
        title: "By phone",
        body: "For a direct conversation with the team that handles the claims.",
        placeholder: "01 84 16 37 91",
      },
    },
    scope: {
      title: "What this form does not do",
      body: "It does not open a claim (real accounts open at go-live) and it should not carry sensitive documents: once a claim opens, everything goes through the encrypted client area.",
    },
    readings: {
      kicker: "Before we talk",
      title: "Three readings that will make the conversation more useful",
      lede: "Most first questions are already answered on these pages. Reading them before writing often saves a round-trip — and gets you to the conversation with the right questions.",
      cards: [
        {
          key: "pricing",
          title: "The pricing, in full",
          body: "Success fee slice by slice, floor, cap, fixed-fee services, worked examples: you will know to the cent how we get paid.",
          linkLabel: "Read the pricing",
        },
        {
          key: "howItWorks",
          title: "The process, step by step",
          body: "What you do, what we do, which documents are needed and how long each phase actually takes.",
          linkLabel: "Read the process",
        },
        {
          key: "comparison",
          title: "The honest comparison",
          body: "FiscalPlace against doing it yourself, going through your broker, and doing nothing — including the cases where we are not the right option.",
          linkLabel: "Read the comparison",
        },
      ],
    },
    selfService: {
      title: "And if your question is “how much?”",
      body: "The simulator answers in two minutes, no email and no commitment: treaty rates applied to your dividends, fee deducted, net displayed.",
      cta: "Calculate my refund",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* HERO                                                            */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.kicker}
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl">
            {t.h1}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.lede}</p>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* FORM + CHANNELS                                                 */}
      {/* -------------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
            <ContactForm locale={locale} />
            <div className="grid gap-4">
              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {t.channels.email.title}
                </h2>
                <p className="mt-1">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-mono text-[15px] text-brand underline underline-offset-4"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">
                  {t.channels.email.body}
                </p>
              </Card>
              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {t.channels.mail.title}
                </h2>
                <p className="mt-1 font-mono text-[13px] text-mine">
                  {t.channels.mail.placeholder}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">
                  {t.channels.mail.body}
                </p>
              </Card>
              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {t.channels.phone.title}
                </h2>
                <p className="mt-1">
                  <a
                    href="tel:+33184163791"
                    className="font-mono text-[15px] text-brand underline underline-offset-4"
                  >
                    {t.channels.phone.placeholder}
                  </a>
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">
                  {t.channels.phone.body}
                </p>
              </Card>
              <div className="rounded-[6px] border border-rule bg-paper p-5">
                <h2 className="font-display text-lg font-semibold text-ink">{t.scope.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.scope.body}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* ASSIGNMENT SELLING — three readings                             */}
      {/* -------------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.readings.kicker}
            title={t.readings.title}
            lede={t.readings.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.readings.cards.map((card, i) => (
              <Card key={card.key} className="flex flex-col p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">{card.body}</p>
                <div className="mt-3">
                  <ButtonLink variant="ghost" href={href(locale, card.key)}>
                    {card.linkLabel} →
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* SELF-SERVICE FIRST                                              */}
      {/* -------------------------------------------------------------- */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 text-center sm:py-14">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {t.selfService.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[62ch] text-[15px] leading-relaxed text-mine">
            {t.selfService.body}
          </p>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "simulator")}>
              {t.selfService.cta} →
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
