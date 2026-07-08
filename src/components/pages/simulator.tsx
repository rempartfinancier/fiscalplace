import { formatCurrency, type Locale, type Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { PRICING } from "@/config/pricing";
import { Card, Container, SectionHeading } from "@/components/ui/primitives";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SimulatorTool } from "@/components/site/SimulatorTool";

/**
 * Public refund simulator — self-service tool #1.
 * Server shell: intro, the client tool (Suspense: useSearchParams pre-fill),
 * a "how to read this" pedagogy section, and a short FAQ.
 */

type Swatch = "debit" | "brand" | "gold";

const copy: Localized<{
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  lede: string;
  loading: string;
  howToRead: {
    kicker: string;
    title: string;
    lede: string;
    points: { swatch: Swatch; title: string; body: string }[];
  };
  faq: {
    kicker: string;
    title: string;
    items: { q: string; a: string }[];
  };
}> = {
  fr: {
    metaTitle: "Simulateur : combien récupérer sur vos dividendes étrangers ?",
    metaDescription:
      "Estimez en 30 secondes le trop-perçu de retenue à la source récupérable sur vos dividendes étrangers, commission incluse. Gratuit, sans email, sans compte.",
    kicker: "Outil gratuit · 30 secondes · Sans compte",
    h1: "Combien pouvez-vous récupérer sur vos dividendes étrangers ?",
    lede: "Choisissez le pays source, indiquez vos dividendes bruts : le simulateur réconcilie la retenue réellement prélevée et la retenue que la convention autorise, puis affiche votre trop-perçu, notre commission tranche par tranche et le net qui vous revient. Sans email, sans compte, sans engagement.",
    loading: "Chargement du simulateur…",
    howToRead: {
      kicker: "Pédagogie",
      title: "Comment lire ce résultat",
      lede: "Le simulateur reprend la grammaire de tout le site : trois lignes, comme dans un grand livre comptable.",
      points: [
        {
          swatch: "debit",
          title: "La ligne rouge : ce qui a été prélevé",
          body: "Le taux statutaire du pays source, appliqué à votre montant brut. C'est la ligne du débit : ce qui est réellement sorti de vos dividendes avant qu'ils n'arrivent sur votre compte.",
        },
        {
          swatch: "brand",
          title: "La ligne verte : ce que la convention autorise",
          body: "Le taux prévu par la convention fiscale entre votre pays de résidence et le pays source, avec sa référence. Tout ce qui a été prélevé au-delà de cette ligne l'a été à tort.",
        },
        {
          swatch: "gold",
          title: "La ligne surlignée : votre trop-perçu",
          body: "La différence entre les deux lignes. Hachurée or tant qu'elle reste un potentiel, verte une fois récupérée. C'est la seule base de notre commission — facturée au succès, jamais avant.",
        },
      ],
    },
    faq: {
      kicker: "Questions fréquentes",
      title: "Ce que ce simulateur peut — et ne peut pas — vous dire",
      items: [
        {
          q: "D'où viennent les taux utilisés ?",
          a: "De notre base pays interne : pour chaque pays, le taux statutaire appliqué aux non-résidents, le taux conventionnel usuel pour un investisseur particulier et le délai de prescription, avec une date de dernière revue affichée sous chaque résultat. Ces données sont ensuite revérifiées dossier par dossier, sur vos relevés réels, avant tout dépôt.",
        },
        {
          q: "Ce résultat est-il un engagement ?",
          a: "Non. C'est une estimation indicative fondée sur le cas général. L'engagement chiffré vient après le diagnostic gratuit de vos relevés — et si ce diagnostic conclut que le dossier ne vaut pas la peine d'être déposé, nous vous le disons au lieu de le déposer.",
        },
        {
          q: "Pourquoi le montant réel peut-il différer ?",
          a: "Parce que le simulateur applique le cas général : il ne voit ni vos dates exactes de versement (certaines années peuvent être prescrites), ni le taux réellement appliqué par votre courtier, ni les cas particuliers — dividendes australiens « franked », distributions de REIT britanniques, W-8BEN déjà en place côté américain. Traitez le chiffre comme un ordre de grandeur fiable, pas comme un montant au centime.",
        },
        {
          q: "Que se passe-t-il ensuite ?",
          a: "Vous ouvrez un dossier et importez vos relevés. Nous réalisons un diagnostic ligne à ligne, gratuit. Vous validez ce qui mérite d'être déposé, nous préparons et déposons les demandes, puis nous relançons chaque administration jusqu'au versement. Vous ne payez qu'au succès : commission dégressive par tranches, plancher {floor}, plafond {cap} par dossier.",
        },
      ],
    },
  },
  en: {
    metaTitle: "Simulator: how much can you recover on foreign dividends?",
    metaDescription:
      "Estimate in 30 seconds the over-withheld tax you can recover on your foreign dividends, fee included. Free, no email, no account.",
    kicker: "Free tool · 30 seconds · No account",
    h1: "How much can you recover on your foreign dividends?",
    lede: "Pick the source country and enter your gross dividends: the simulator reconciles the tax actually withheld with the tax the treaty allows, then shows your over-withholding, our fee bracket by bracket and the net that comes back to you. No email, no account, no commitment.",
    loading: "Loading the simulator…",
    howToRead: {
      kicker: "How to read it",
      title: "How to read this result",
      lede: "The simulator uses the same grammar as the whole site: three lines, like a ledger.",
      points: [
        {
          swatch: "debit",
          title: "The red line: what was withheld",
          body: "The source country's statutory rate applied to your gross amount. This is the debit line: what actually left your dividends before they reached your account.",
        },
        {
          swatch: "brand",
          title: "The green line: what the treaty allows",
          body: "The rate set by the tax treaty between your residence country and the source country, with its reference. Everything withheld beyond this line was withheld wrongly.",
        },
        {
          swatch: "gold",
          title: "The highlighted line: your over-withholding",
          body: "The difference between the two. Gold-hatched while it remains potential, green once recovered. It is the only base for our fee — charged on success, never before.",
        },
      ],
    },
    faq: {
      kicker: "Frequently asked",
      title: "What this simulator can — and cannot — tell you",
      items: [
        {
          q: "Where do the rates come from?",
          a: "From our internal country database: for each country, the statutory rate applied to non-residents, the usual treaty rate for an individual portfolio investor and the claim deadline, with a last-review date displayed under every result. Those figures are then re-verified claim by claim, against your real statements, before anything is filed.",
        },
        {
          q: "Is this result a commitment?",
          a: "No. It is an indicative estimate based on the general case. The committed figure comes after the free diagnostic of your statements — and if that diagnostic concludes the claim is not worth filing, we tell you so instead of filing it.",
        },
        {
          q: "Why can the real amount differ?",
          a: "Because the simulator applies the general case: it cannot see your exact payment dates (some years may already be time-barred), the rate your broker actually applied, or the special cases — Australian franked dividends, UK REIT distributions, a W-8BEN already in place on the US side. Treat the figure as a reliable order of magnitude, not an amount to the cent.",
        },
        {
          q: "What happens next?",
          a: "You open a claim and import your statements. We run a line-by-line diagnostic, free of charge. You approve what is worth filing, we prepare and file the claims, then chase each administration until the money is paid. You only pay on success: a degressive bracket fee, {floor} floor, {cap} cap per claim.",
        },
      ],
    },
  },
};

const SWATCH_CLASS: Record<Swatch, string> = {
  debit: "bg-debit",
  brand: "bg-brand",
  gold: "hatch-gold border border-rule bg-white",
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const floorFmt = formatCurrency(PRICING.floorFee, locale);
  const capFmt = formatCurrency(PRICING.capFee, locale);
  const faqItems = t.faq.items.map(({ q, a }) => ({
    question: q,
    answer: a.replace("{floor}", floorFmt).replace("{cap}", capFmt),
  }));

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <header className="max-w-3xl">
          <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.kicker}
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl text-balance">
            {t.h1}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.lede}</p>
        </header>

        <div className="mt-10">
          <SimulatorTool locale={locale} />
        </div>
      </Container>

      <Container className="mt-16 sm:mt-20">
        <SectionHeading
          kicker={t.howToRead.kicker}
          title={t.howToRead.title}
          lede={t.howToRead.lede}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {t.howToRead.points.map((point) => (
            <Card key={point.title} className="p-5">
              <span
                aria-hidden="true"
                className={`inline-block h-3 w-8 rounded-[2px] ${SWATCH_CLASS[point.swatch]}`}
              />
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{point.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">{point.body}</p>
            </Card>
          ))}
        </div>
      </Container>

      <Container className="mt-16 sm:mt-20">
        <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
        <FAQAccordion items={faqItems} className="mt-8" />
      </Container>
    </div>
  );
}
