import type { Locale, Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import { href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import { ButtonLink, Card, Container, SectionHeading, TrustLine } from "@/components/ui/primitives";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { W8benCheckerTool } from "@/components/site/W8benCheckerTool";

/* ---------------------------------------------------- data-derived figures */

const US = getCountryById("US")!;
const STATUTORY = {
  fr: formatPercent(US.statutoryRate, "fr"),
  en: formatPercent(US.statutoryRate, "en"),
} as const;
const TREATY = {
  fr: formatPercent(treatyRateFor(US, "FR"), "fr"),
  en: formatPercent(treatyRateFor(US, "FR"), "en"),
} as const;
const W8_PRICE = {
  fr: formatCurrency(PRICING.fixedServices.w8ben, "fr"),
  en: formatCurrency(PRICING.fixedServices.w8ben, "en"),
} as const;

/* ----------------------------------------------------------------- copy */

interface PageCopy {
  metaTitle: string;
  metaDescription: string;
  hero: { kicker: string; title: string; lede: string };
  toolFallback: string;
  rules: {
    kicker: string;
    title: string;
    lede: string;
    items: { title: string; body: string }[];
  };
  faq: { kicker: string; title: string; items: { question: string; answer: string }[] };
  final: { title: string; body: string; cta: string };
}

const copy: Localized<PageCopy> = {
  fr: {
    metaTitle: "Vérificateur W-8BEN : votre formulaire est-il encore valide ?",
    metaDescription: `Un W-8BEN expiré rebascule vos dividendes américains au taux plein de ${STATUTORY.fr} au lieu de ${TREATY.fr} — sans que personne ne vous prévienne. Entrez la date de signature : ce vérificateur vous donne la date d'expiration exacte et quoi faire. Gratuit, sans compte.`,
    hero: {
      kicker: "Outil self-service · Gratuit · Sans compte",
      title: "Votre W-8BEN est-il encore valide ?",
      lede: `Le W-8BEN est le formulaire qui ramène la retenue américaine sur vos dividendes de ${STATUTORY.fr} à ${TREATY.fr} pour un résident français. Son défaut : il expire — au 31 décembre de la 3e année civile suivant la signature — et aucun courtier n'est tenu de vous prévenir. Entrez la date de signature : ce vérificateur vous dit où vous en êtes, et quoi faire si le taux plein est déjà revenu.`,
    },
    toolFallback: "Chargement du vérificateur…",
    rules: {
      kicker: "Les règles de validité",
      title: "Trois règles suffisent à comprendre le W-8BEN",
      lede: "Le formulaire est simple ; ce qui coûte cher, c'est d'oublier l'une de ces trois règles.",
      items: [
        {
          title: "Trois années civiles, pas trois ans",
          body: "La validité court jusqu'au 31 décembre de la 3e année suivant la signature — pas trois ans jour pour jour. Signé en janvier 2026, le formulaire vit presque quatre ans ; signé en décembre 2026, à peine plus de trois. Même règle, jusqu'à un an d'écart.",
        },
        {
          title: "Un changement de situation l'annule immédiatement",
          body: "Déménagement, changement de résidence fiscale, changement de statut : le formulaire devient caduc avant sa date d'expiration théorique, et un nouveau doit être remis sous 30 jours. C'est la règle que ce vérificateur ne peut pas voir — elle dépend de votre vie, pas du calendrier.",
        },
        {
          title: "Un formulaire par établissement",
          body: "Le W-8BEN se remet à chaque courtier ou dépositaire teneur de votre compte — pas à l'IRS. Deux courtiers, deux formulaires, deux dates d'expiration à suivre. Vérifiez chacune ici, l'une après l'autre.",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur la validité du W-8BEN",
      items: [
        {
          question: "Où retrouver la date de signature de mon W-8BEN ?",
          answer:
            "Dans les documents fiscaux de votre espace client courtier (souvent sous « documents », « fiscalité » ou « formulaires »), ou en partie III du formulaire si vous en avez conservé une copie. Si vous ne trouvez rien, le test le plus fiable reste votre relevé : le taux réellement appliqué à votre dernier dividende américain dit tout.",
        },
        {
          question: "Mon courtier me préviendra-t-il avant l'expiration ?",
          answer:
            "Rien ne l'y oblige, et la plupart ne le font pas. Le premier symptôme est une retenue au taux plein sur un dividende — parfois découverte des mois plus tard. C'est exactement le genre d'échéance que notre abonnement Suivi & Alertes surveille, mais un rappel dans votre agenda fait aussi l'affaire.",
        },
        {
          question: "Que se passe-t-il pendant la période où le formulaire était expiré ?",
          answer: `Chaque dividende versé pendant cette période a été retenu à ${STATUTORY.fr} au lieu de ${TREATY.fr}. Ce trop-prélevé ne revient pas tout seul : il se récupère par une demande de remboursement auprès de l'administration américaine, dans la limite du délai de prescription — en règle générale ${US.sol.years} ans par prélèvement. Notre service de récupération s'en charge, payé uniquement au succès.`,
        },
        {
          question: "Le renouvellement est-il différent du premier dépôt ?",
          answer:
            "Non : c'est le même formulaire, rempli à neuf, qui remplace l'ancien dès sa remise. Signé avant l'expiration, il n'y a aucune interruption — vos dividendes ne passent jamais par le taux plein. C'est tout l'intérêt de vérifier la date maintenant plutôt qu'au premier relevé anormal.",
        },
        {
          question: "Ce vérificateur couvre-t-il aussi le W-8BEN-E des sociétés ?",
          answer:
            "La règle des trois années civiles est la même pour le W-8BEN-E, la version des sociétés et entités : la date d'expiration calculée ici vaut donc aussi. En revanche, remplir un W-8BEN-E est un exercice nettement plus lourd (classification de l'entité, chapitre 4) — c'est un forfait distinct chez nous.",
        },
      ],
    },
    final: {
      title: "Le formulaire n'est qu'une pièce du dossier",
      body: `Le W-8BEN protège vos dividendes américains futurs. Pour le reste — les retenues déjà subies aux États-Unis et ailleurs — le simulateur chiffre votre trop-perçu en deux minutes, pays par pays, sans créer de compte. Et si vous préférez déléguer le formulaire : forfait ${W8_PRICE.fr}, grille publiée.`,
      cta: "Le service W-8BEN, en détail",
    },
  },
  en: {
    metaTitle: "W-8BEN checker: is your form still valid?",
    metaDescription: `An expired W-8BEN silently reverts your US dividends to the full ${STATUTORY.en} rate instead of ${TREATY.en} — and nobody warns you. Enter the signature date: this checker gives you the exact expiry date and what to do next. Free, no account.`,
    hero: {
      kicker: "Self-service tool · Free · No account",
      title: "Is your W-8BEN still valid?",
      lede: `The W-8BEN is the form that cuts US withholding on your dividends from ${STATUTORY.en} to ${TREATY.en} for a French resident. Its flaw: it expires — on 31 December of the 3rd calendar year after signature — and no broker is obliged to warn you. Enter the signature date: this checker tells you where you stand, and what to do if the full rate is already back.`,
    },
    toolFallback: "Loading the checker…",
    rules: {
      kicker: "The validity rules",
      title: "Three rules are all it takes to understand the W-8BEN",
      lede: "The form is simple; what costs money is forgetting one of these three rules.",
      items: [
        {
          title: "Three calendar years, not three years",
          body: "Validity runs until 31 December of the 3rd year after signature — not three years to the day. Signed in January 2026, the form lives almost four years; signed in December 2026, barely over three. Same rule, up to a year's difference.",
        },
        {
          title: "A change in circumstances voids it immediately",
          body: "Moving abroad, a new tax residence, a change of status: the form lapses before its theoretical expiry date, and a new one must be provided within 30 days. That is the rule this checker cannot see — it depends on your life, not the calendar.",
        },
        {
          title: "One form per institution",
          body: "The W-8BEN goes to each broker or custodian holding your account — not to the IRS. Two brokers, two forms, two expiry dates to track. Check each one here, one after the other.",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your questions about W-8BEN validity",
      items: [
        {
          question: "Where do I find my W-8BEN's signature date?",
          answer:
            "In the tax documents of your broker's client area (often under 'documents', 'tax' or 'forms'), or in Part III of the form if you kept a copy. If you find nothing, the most reliable test is your statement: the rate actually applied to your last US dividend tells the whole story.",
        },
        {
          question: "Will my broker warn me before it expires?",
          answer:
            "Nothing obliges them to, and most don't. The first symptom is a dividend withheld at the full rate — sometimes discovered months later. This is exactly the kind of deadline our Monitoring & Alerts subscription tracks, though a calendar reminder works too.",
        },
        {
          question: "What about the period when the form was expired?",
          answer: `Every dividend paid during that period was withheld at ${STATUTORY.en} instead of ${TREATY.en}. That over-withholding does not come back on its own: it is recovered through a refund claim with the US administration, within the statute of limitations — as a general rule ${US.sol.years} years per withholding. Our recovery service handles it, paid only on success.`,
        },
        {
          question: "Is renewing different from the first filing?",
          answer:
            "No: it is the same form, completed afresh, which replaces the old one upon delivery. Signed before the expiry, there is no interruption — your dividends never pass through the full rate. That is the whole point of checking the date now rather than at the first abnormal statement.",
        },
        {
          question: "Does this checker also cover the corporate W-8BEN-E?",
          answer:
            "The three-calendar-year rule is the same for the W-8BEN-E, the version for companies and entities: the expiry date computed here holds too. Completing a W-8BEN-E, however, is a much heavier exercise (entity classification, chapter 4) — a separate fixed-fee service with us.",
        },
      ],
    },
    final: {
      title: "The form is only one piece of the file",
      body: `The W-8BEN protects your future US dividends. For the rest — the tax already withheld in the US and elsewhere — the simulator puts a figure on your over-withholding in two minutes, country by country, no account needed. And if you would rather delegate the form: ${W8_PRICE.en} fixed fee, published grid.`,
      cta: "The W-8BEN service, in detail",
    },
  },
};

/* ------------------------------------------------------------------- page */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[24ch] font-display text-4xl font-semibold text-ink sm:text-5xl text-balance">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.hero.lede}</p>
        </Container>
      </section>

      {/* Tool — rendered directly: the component never suspends, and dev-mode
          Suspense reveal is unreliable in this setup (see CHANGELOG §1). */}
      <section>
        <Container className="py-10 sm:py-12">
          <W8benCheckerTool locale={locale} />
        </Container>
      </section>

      {/* Validity rules */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <SectionHeading kicker={t.rules.kicker} title={t.rules.title} lede={t.rules.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {t.rules.items.map((item) => (
              <Card key={item.title} className="p-5 sm:p-6">
                <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-12 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={t.faq.items} className="mt-8" />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-white">
        <Container className="py-12 sm:py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl text-balance">
            {t.final.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-[17px] leading-relaxed text-mine">
            {t.final.body}
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <ButtonLink variant="ghost" href={href(locale, "serviceW8ben")}>
              {t.final.cta}
            </ButtonLink>
            <TrustLine text={common.trustLine} />
          </div>
        </Container>
      </section>
    </>
  );
}
