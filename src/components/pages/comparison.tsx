import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { articleHref, href } from "@/lib/routes";
import { getCommon } from "@/content/common";
import { computeCommission, PRICING } from "@/config/pricing";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { diyVsDelegate } from "@/data/articles/diy-vs-delegate";
import { fiscalplaceVsBroker } from "@/data/articles/fiscalplace-vs-broker";
import { DoubleRule, LedgerLine } from "@/components/ui/ledger";
import {
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Data-derived figures — nothing below is hardcoded copy.             */
/* ------------------------------------------------------------------ */

const tiers = PRICING.successFeeTiers;
const topRate = tiers[0].rate; // first-tranche (highest) marginal rate
const bottomRate = tiers[tiers.length - 1].rate; // top-of-grid (lowest) marginal rate
const floor = PRICING.floorFee;
const cap = PRICING.capFee;

/** The honest small-claim example: at €60 recovered, the floor fee eats the gain. */
const smallRecovered = 60;
const small = computeCommission(smallRecovered);

const us = getCountryById("US")!;
const ch = getCountryById("CH")!;
const ca = getCountryById("CA")!;
const at = getCountryById("AT")!;
const usTreaty = treatyRateFor(us, "FR");

interface CompareRow {
  criterion: string;
  diy: string;
  broker: string;
  fp: string;
}

interface Copy {
  metaTitle: string;
  metaDescription: string;
  hero: { kicker: string; h1: string; lede: string };
  table: {
    kicker: string;
    title: string;
    lede: string;
    caption: string;
    colCriterion: string;
    colDiy: string;
    colBroker: string;
    colFp: string;
    rows: CompareRow[];
    footnote: string;
    reportCta: string;
  };
  diy: {
    kicker: string;
    title: string;
    lede: string;
    bullets: string[];
    ledgerTitle: string;
    ledgerRecover: string;
    ledgerFee: string;
    ledgerNet: string;
    ledgerFootnote: string;
    articleCta: string;
    countriesCta: string;
  };
  broker: {
    kicker: string;
    title: string;
    lede: string;
    bullets: string[];
    articleCta: string;
    rasCta: string;
  };
  fp: {
    kicker: string;
    title: string;
    lede: string;
    bullets: string[];
  };
  further: {
    kicker: string;
    title: string;
    cards: { label: string; description: string }[];
  };
  final: { title: string; lede: string };
}

const copy: Localized<Copy> = {
  fr: {
    metaTitle: "Faire seul, votre courtier ou FiscalPlace : le comparatif honnête",
    metaDescription:
      "Coût, temps passé, prescription, relances, taux de succès : la comparaison franche entre le DIY, votre courtier et FiscalPlace — y compris les cas où vous n'avez pas besoin de nous.",
    hero: {
      kicker: "Comparatif",
      h1: "Faire seul, passer par votre courtier, ou FiscalPlace : le comparatif honnête",
      lede: "Nous vendons l'une des trois colonnes de ce comparatif — la méfiance est donc légitime. C'est pourquoi cette page commence par les critères, continue par les deux cas où vous n'avez pas besoin de nous, et ne finit que par le nôtre.",
    },
    table: {
      kicker: "Les critères qui comptent",
      title: "Trois options, sept critères, zéro langue de bois",
      lede: "Chaque case est notre lecture du marché, assumée et vérifiable. Aucune colonne ne gagne partout — c'est bien le signe qu'un comparatif est honnête.",
      caption:
        "Comparaison du DIY, du courtier/dépositaire et de FiscalPlace selon sept critères",
      colCriterion: "Critère",
      colDiy: "Vous-même (DIY)",
      colBroker: "Votre courtier / dépositaire",
      colFp: "FiscalPlace",
      rows: [
        {
          criterion: "Coût",
          diy: `${formatCurrency(0, "fr")} de frais de service — plus les certificats, les envois recommandés et vos heures.`,
          broker:
            "Variable selon l'établissement : parfois inclus, souvent facturé par dossier ou réservé aux comptes importants. Demandez la grille écrite.",
          fp: `Commission au succès uniquement : de ${formatPercent(bottomRate, "fr")} à ${formatPercent(topRate, "fr")} par tranche marginale, plancher ${formatCurrency(floor, "fr")}, plafond ${formatCurrency(cap, "fr")}. Pas de récupération = ${formatCurrency(0, "fr")}.`,
        },
        {
          criterion: "Temps passé",
          diy: "Plusieurs heures par pays et par année fiscale : formulaires locaux, passage au centre des impôts, envois, suivi, relances.",
          broker:
            "Faible — quand le service existe. Vérifier qu'il a réellement été rendu reste à votre charge.",
          fp: "Import de vos relevés, signature électronique du mandat : le reste se fait sans vous.",
        },
        {
          criterion: "Langues et formulaires",
          diy: "Formulaire 83 suisse, ZS-RD1 autrichien, NR7-R canadien… en langue locale, notices comprises.",
          broker:
            "Limité aux marchés couverts en standard — le plus souvent les États-Unis via le W-8BEN.",
          fp: "Générés et pré-remplis automatiquement pour chaque pays de notre panel, contrôlés avant dépôt.",
        },
        {
          criterion: "Suivi des délais de prescription",
          diy: `À tenir vous-même — et chaque pays compte différemment : ${ca.sol.years} ans au Canada, ${ch.sol.years} en Suisse, ${at.sol.years} en Autriche.`,
          broker:
            "Généralement inexistant : la prescription de vos trop-perçus n'entre pas dans son mandat.",
          fp: "Échéance calculée pour chaque ligne dès l'import ; les dossiers proches de la limite sont priorisés automatiquement.",
        },
        {
          criterion: "Relances de l'administration",
          diy: "C'est vous qui écrivez, dans la langue de l'administration — puis qui attendez.",
          broker: "Rarement incluses.",
          fp: "Relances documentées à intervalles réguliers, archivées dans le journal de votre dossier.",
        },
        {
          criterion: "Taux de succès",
          diy: "Correct sur un dossier simple et complet ; les pièces manquantes ou non conformes restent la première cause de rejet.",
          broker:
            "Très bon en préventif (taux réduit appliqué à la source) quand le paramétrage est correct ; faible sur la récupération du passé.",
          fp: "Chaque dossier est vérifié avant dépôt et nous refusons ceux perdus d'avance. [TAUX DE SUCCÈS RÉEL À PUBLIER UNE FOIS MESURABLE ET AUDITABLE — AUCUN CHIFFRE INVENTÉ]",
        },
        {
          criterion: "Quand c'est le bon choix",
          diy: "Un seul pays, un petit montant, du temps disponible et une vraie patience pour la paperasse étrangère.",
          broker:
            "Des titres surtout américains avec un W-8BEN valide en place : vérifiez d'abord, c'est gratuit.",
          fp: "Plusieurs pays, plusieurs années d'historique, des montants significatifs — et zéro envie de relancer des administrations.",
        },
      ],
      footnote:
        "Un point de ce tableau vous semble injuste pour le DIY ou pour les courtiers ? Dites-le-nous : nous corrigeons ce qui doit l'être.",
      reportCta: "Signaler une inexactitude",
    },
    diy: {
      kicker: "Premier cas",
      title: "Quand le faire vous-même est le bon choix",
      lede: "Sincèrement : si vous cochez ces trois cases, ne nous payez pas.",
      bullets: [
        "Vous n'avez qu'un seul pays source — par exemple uniquement des actions suisses, dont la procédure de remboursement se fait désormais en ligne.",
        "Les formulaires en langue étrangère ne vous font pas peur, et vous avez quelques heures devant vous chaque année pour le dossier et son suivi.",
        `Le montant en jeu est petit : autour de ${formatCurrency(smallRecovered, "fr")} récupérables, notre plancher de ${formatCurrency(floor, "fr")} mange l'essentiel du gain.`,
      ],
      ledgerTitle: "Le calcul qui nous fait dire « faites-le vous-même »",
      ledgerRecover: "Trop-perçu récupérable",
      ledgerFee: "Commission plancher FiscalPlace",
      ledgerNet: "Ce qui vous resterait",
      ledgerFootnote:
        "Sous ce niveau, le jeu n'en vaut pas la chandelle. Nos guides expliquent chaque procédure pays par pays, gratuitement — et le simulateur vous dira sans détour si votre dossier est dans ce cas.",
      articleCta: "Lire : DIY ou délégation, le comparatif chiffré",
      countriesCta: "Voir les procédures par pays",
    },
    broker: {
      kicker: "Deuxième cas",
      title: "Quand votre courtier ou dépositaire suffit",
      lede: "Le deuxième cas où nous sommes inutiles — fréquent chez les investisseurs 100 % actions américaines.",
      bullets: [
        `Sur les titres américains, un W-8BEN valide auprès de votre courtier ramène la retenue de ${formatPercent(us.statutoryRate, "fr")} à ${formatPercent(usTreaty, "fr")} dès le versement : c'est le « relief at source ».`,
        "Beaucoup de courtiers et dépositaires l'appliquent correctement. Dans ce cas, il n'y a rien à récupérer sur vos dividendes américains — et personne ne devrait vous facturer quoi que ce soit pour ça.",
        `La vérification est gratuite : ouvrez votre dernier relevé et regardez la retenue sur un dividende US. ${formatPercent(usTreaty, "fr")} : votre courtier fait le travail. ${formatPercent(us.statutoryRate, "fr")} : il y a un sujet — le W-8BEN expire d'ailleurs à la fin de la 3e année civile suivant sa signature, et l'oubli est fréquent.`,
        "Les limites : le relief at source ne fonctionne ni en Suisse, ni en Allemagne, ni en Autriche pour un particulier. Sur ces pays, votre dépositaire ne récupérera généralement rien a posteriori — demandez-lui par écrit ce qu'il couvre.",
      ],
      articleCta: "Lire : FiscalPlace vs votre courtier",
      rasCta: "Comprendre le relief at source",
    },
    fp: {
      kicker: "Troisième cas",
      title: "Quand déléguer à FiscalPlace a du sens",
      lede: "Notre colonne, maintenant. Voici les situations où la délégation se justifie économiquement — pas par confort marketing.",
      bullets: [
        "Plusieurs pays sources : chaque administration a sa langue, ses formulaires et ses délais ; la coordination devient un travail à part entière.",
        `Plusieurs années d'historique : les prescriptions courent déjà — ${ca.sol.years} ans seulement au Canada — et chaque mois d'attente en efface une partie.`,
        `Des montants significatifs : la grille est marginale et dégressive, de ${formatPercent(topRate, "fr")} sur les premiers euros à ${formatPercent(bottomRate, "fr")} au sommet, plafonnée à ${formatCurrency(cap, "fr")} par dossier. Au-delà de ${formatCurrency(PRICING.institutionalThreshold, "fr")} récupérés : devis institutionnel.`,
        "Zéro envie de gérer les relances : dépôts, suivis et courriers sont tracés dans votre espace, et un humain intervient là où ça compte.",
      ],
    },
    further: {
      kicker: "Pour aller plus loin",
      title: "Les comparatifs détaillés",
      cards: [
        {
          label: "DIY ou délégation : le comparatif chiffré",
          description:
            "Année par année, les vrais coûts des deux options — y compris ceux qu'on oublie : certificats, recommandés, heures passées.",
        },
        {
          label: "FiscalPlace vs votre courtier",
          description:
            "Qui fait quoi, qui ne fait rien, et les questions précises à poser à votre dépositaire avant de signer quoi que ce soit.",
        },
        {
          label: "Nos tarifs, en clair",
          description:
            "La grille complète, des exemples calculés tranche par tranche, et ce que nous ne facturons jamais.",
        },
      ],
    },
    final: {
      title: "Encore indécis ? Demandez le chiffre.",
      lede: "Le simulateur est le juge de paix de ce comparatif : il calcule ce qu'il y a à récupérer et vous dit donc laquelle des trois colonnes est la vôtre — y compris quand la réponse est « aucune ».",
    },
  },
  en: {
    metaTitle: "DIY, your broker, or FiscalPlace: the honest comparison",
    metaDescription:
      "Cost, time spent, filing deadlines, follow-ups, success rates: a candid comparison of doing it yourself, relying on your broker, and FiscalPlace — including when you don't need us.",
    hero: {
      kicker: "Comparison",
      h1: "Doing it yourself, your broker, or FiscalPlace: the honest comparison",
      lede: "We sell one of this comparison's three columns — so scepticism is fair. That's why this page starts with the criteria, moves on to the two cases where you don't need us, and only ends with ours.",
    },
    table: {
      kicker: "The criteria that matter",
      title: "Three options, seven criteria, zero spin",
      lede: "Every cell is our reading of the market, stated plainly and checkable. No column wins everywhere — which is exactly what an honest comparison looks like.",
      caption:
        "Comparison of DIY, your broker/custodian and FiscalPlace across seven criteria",
      colCriterion: "Criterion",
      colDiy: "Yourself (DIY)",
      colBroker: "Your broker / custodian",
      colFp: "FiscalPlace",
      rows: [
        {
          criterion: "Cost",
          diy: `${formatCurrency(0, "en")} in service fees — plus certificates, registered mail and your own hours.`,
          broker:
            "Varies by institution: sometimes included, often billed per claim or reserved for large accounts. Ask for the written fee schedule.",
          fp: `Success fee only: ${formatPercent(bottomRate, "en")} to ${formatPercent(topRate, "en")} per marginal tranche, ${formatCurrency(floor, "en")} floor, ${formatCurrency(cap, "en")} cap. No recovery = ${formatCurrency(0, "en")}.`,
        },
        {
          criterion: "Time spent",
          diy: "Several hours per country and per tax year: local forms, a trip to your tax office, mailings, tracking, follow-ups.",
          broker:
            "Low — where the service exists. Checking that it was actually performed is still on you.",
          fp: "Import your statements, e-sign the mandate: the rest happens without you.",
        },
        {
          criterion: "Languages and forms",
          diy: "Swiss Form 83, Austrian ZS-RD1, Canadian NR7-R… in the local language, guidance notes included.",
          broker: "Limited to the markets covered as standard — most often the US via the W-8BEN.",
          fp: "Generated and pre-filled automatically for every country in our panel, checked before filing.",
        },
        {
          criterion: "Statute-of-limitations tracking",
          diy: `Yours to track — and every country counts differently: ${ca.sol.years} years in Canada, ${ch.sol.years} in Switzerland, ${at.sol.years} in Austria.`,
          broker: "Generally none: your expiring refunds are not part of its mandate.",
          fp: "A deadline computed for every line at import; claims close to the limit are prioritised automatically.",
        },
        {
          criterion: "Chasing the administration",
          diy: "You write the follow-ups, in the administration's language — then you wait.",
          broker: "Rarely included.",
          fp: "Documented follow-ups at regular intervals, archived in your claim's log.",
        },
        {
          criterion: "Success rate",
          diy: "Decent on a simple, complete file; missing or non-compliant documents remain the top cause of rejection.",
          broker:
            "Very good preventively (reduced rate applied at source) when set up correctly; weak at recovering the past.",
          fp: "Every claim is verified before filing and we decline the ones lost in advance. [ACTUAL SUCCESS RATE TO BE PUBLISHED ONCE MEASURABLE AND AUDITABLE — NO INVENTED FIGURE]",
        },
        {
          criterion: "When it's the right choice",
          diy: "One country, a small amount, spare time and genuine patience for foreign paperwork.",
          broker:
            "Mostly US securities with a valid W-8BEN in place: check first, it's free.",
          fp: "Several countries, several years of history, meaningful amounts — and zero appetite for chasing administrations.",
        },
      ],
      footnote:
        "Does a cell in this table strike you as unfair to DIY or to brokers? Tell us: we fix what needs fixing.",
      reportCta: "Report an inaccuracy",
    },
    diy: {
      kicker: "First case",
      title: "When doing it yourself is the right choice",
      lede: "Honestly: if you tick these three boxes, don't pay us.",
      bullets: [
        "You have a single source country — for instance only Swiss shares, whose refund procedure is now handled online.",
        "Foreign-language forms don't scare you, and you have a few hours available each year for the file and its follow-up.",
        `The amount at stake is small: at around ${formatCurrency(smallRecovered, "en")} recoverable, our ${formatCurrency(floor, "en")} floor fee eats most of the gain.`,
      ],
      ledgerTitle: "The calculation that makes us say 'do it yourself'",
      ledgerRecover: "Recoverable over-withholding",
      ledgerFee: "FiscalPlace floor fee",
      ledgerNet: "What you would keep",
      ledgerFootnote:
        "Below this level, it isn't worth it. Our guides explain each country's procedure step by step, for free — and the simulator will tell you bluntly whether your claim falls in this bucket.",
      articleCta: "Read: DIY vs delegating, with the numbers",
      countriesCta: "See country-by-country procedures",
    },
    broker: {
      kicker: "Second case",
      title: "When your broker or custodian is enough",
      lede: "The second case where we're unnecessary — common among investors holding only US equities.",
      bullets: [
        `On US securities, a valid W-8BEN with your broker cuts withholding from ${formatPercent(us.statutoryRate, "en")} to ${formatPercent(usTreaty, "en")} at payment time: that's relief at source.`,
        "Many brokers and custodians apply it correctly. In that case there is nothing to recover on your US dividends — and nobody should charge you anything for that.",
        `Checking is free: open your latest statement and look at the withholding on a US dividend. ${formatPercent(usTreaty, "en")}: your broker is doing the job. ${formatPercent(us.statutoryRate, "en")}: there's an issue — and note that a W-8BEN expires at the end of the third calendar year after signature, a renewal that's often missed.`,
        "The limits: relief at source doesn't work in Switzerland, Germany or Austria for individual investors. For those countries, your custodian will generally recover nothing after the fact — ask in writing what yours actually covers.",
      ],
      articleCta: "Read: FiscalPlace vs your broker",
      rasCta: "Understand relief at source",
    },
    fp: {
      kicker: "Third case",
      title: "When delegating to FiscalPlace makes sense",
      lede: "Our column, at last. These are the situations where delegating pays for itself — economically, not as a marketing comfort.",
      bullets: [
        "Several source countries: each administration has its own language, forms and timelines; coordinating them becomes a job in itself.",
        `Several years of history: the clocks are already running — only ${ca.sol.years} years in Canada — and every month of waiting erases part of it.`,
        `Meaningful amounts: the grid is marginal and degressive, from ${formatPercent(topRate, "en")} on the first euros down to ${formatPercent(bottomRate, "en")} at the top, capped at ${formatCurrency(cap, "en")} per claim. Above ${formatCurrency(PRICING.institutionalThreshold, "en")} recovered: institutional quote.`,
        "Zero appetite for chasing administrations: filings, follow-ups and letters are all logged in your client area, and a human steps in where it matters.",
      ],
    },
    further: {
      kicker: "Go deeper",
      title: "The detailed comparisons",
      cards: [
        {
          label: "DIY vs delegating, with the numbers",
          description:
            "Year by year, the true costs of both options — including the ones people forget: certificates, registered mail, hours spent.",
        },
        {
          label: "FiscalPlace vs your broker",
          description:
            "Who does what, who does nothing, and the exact questions to ask your custodian before signing anything.",
        },
        {
          label: "Our pricing, in plain terms",
          description:
            "The full grid, worked examples tranche by tranche, and what we never charge for.",
        },
      ],
    },
    final: {
      title: "Still undecided? Ask for the number.",
      lede: "The simulator is this comparison's referee: it computes what there is to recover, and therefore tells you which of the three columns is yours — including when the answer is 'none'.",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const furtherHrefs = [
    articleHref(locale, diyVsDelegate.slug[locale]),
    articleHref(locale, fiscalplaceVsBroker.slug[locale]),
    href(locale, "pricing"),
  ];

  return (
    <div className="pb-20">
      {/* ------------------------------------------------ Hero */}
      <section className="border-b border-rule bg-white">
        <Container className="py-14 sm:py-20">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[30ch] font-display text-4xl font-semibold text-ink text-balance sm:text-5xl">
            {t.hero.h1}
          </h1>
          <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-mine">{t.hero.lede}</p>
        </Container>
      </section>

      <Container>
        {/* ------------------------------------------------ Comparison table */}
        <section className="py-14 sm:py-20">
          <SectionHeading kicker={t.table.kicker} title={t.table.title} lede={t.table.lede} />
          <Card className="mt-10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <caption className="sr-only">{t.table.caption}</caption>
                <thead>
                  <tr className="border-b border-rule">
                    <th
                      scope="col"
                      className="w-[16%] px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-mine"
                    >
                      {t.table.colCriterion}
                    </th>
                    <th
                      scope="col"
                      className="w-[28%] px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-mine"
                    >
                      {t.table.colDiy}
                    </th>
                    <th
                      scope="col"
                      className="w-[28%] px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-mine"
                    >
                      {t.table.colBroker}
                    </th>
                    <th
                      scope="col"
                      className="w-[28%] px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-brand"
                    >
                      {t.table.colFp}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.table.rows.map((row) => (
                    <tr key={row.criterion} className="border-b border-rule align-top last:border-b-0">
                      <th scope="row" className="px-5 py-4 text-[15px] font-medium text-ink">
                        {row.criterion}
                      </th>
                      <td className="px-5 py-4 leading-relaxed text-mine">{row.diy}</td>
                      <td className="px-5 py-4 leading-relaxed text-mine">{row.broker}</td>
                      <td className="px-5 py-4 leading-relaxed text-ink">{row.fp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-[13px] leading-relaxed text-mine">{t.table.footnote}</p>
            <ButtonLink variant="ghost" href={href(locale, "contact")} className="px-0">
              {t.table.reportCta}
            </ButtonLink>
          </div>
        </section>

        {/* ------------------------------------------------ Case 1: DIY */}
        <section className="grid gap-10 border-t border-rule py-14 sm:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <SectionHeading kicker={t.diy.kicker} title={t.diy.title} lede={t.diy.lede} />
            <ul className="mt-6 space-y-3">
              {t.diy.bullets.map((b) => (
                <li key={b} className="flex items-baseline gap-2 text-[15px] leading-relaxed text-mine">
                  <span aria-hidden="true" className="font-mono text-brand">
                    ·
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                variant="secondary"
                href={articleHref(locale, diyVsDelegate.slug[locale])}
              >
                {t.diy.articleCta}
              </ButtonLink>
              <ButtonLink variant="ghost" href={href(locale, "countries")}>
                {t.diy.countriesCta}
              </ButtonLink>
            </div>
          </div>
          <Card className="self-start p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-ink">{t.diy.ledgerTitle}</h3>
            <div className="mt-4">
              <LedgerLine
                label={t.diy.ledgerRecover}
                amount={formatCurrency(smallRecovered, locale)}
                tone="ink"
              />
              <LedgerLine
                label={t.diy.ledgerFee}
                amount={`− ${formatCurrency(small.fee, locale)}`}
                tone="debit"
              />
              <div className="my-2 border-t border-rule" aria-hidden="true" />
              <LedgerLine
                label={t.diy.ledgerNet}
                amount={formatCurrency(small.net, locale)}
                tone="ink"
                highlight
                bold
              />
              <DoubleRule className="mt-3" />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-mine">{t.diy.ledgerFootnote}</p>
          </Card>
        </section>

        {/* ------------------------------------------------ Case 2: broker */}
        <section className="border-t border-rule py-14 sm:py-20">
          <SectionHeading kicker={t.broker.kicker} title={t.broker.title} lede={t.broker.lede} />
          <ul className="mt-6 max-w-[80ch] space-y-3">
            {t.broker.bullets.map((b) => (
              <li key={b} className="flex items-baseline gap-2 text-[15px] leading-relaxed text-mine">
                <span aria-hidden="true" className="font-mono text-brand">
                  ·
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink
              variant="secondary"
              href={articleHref(locale, fiscalplaceVsBroker.slug[locale])}
            >
              {t.broker.articleCta}
            </ButtonLink>
            <ButtonLink variant="ghost" href={href(locale, "serviceReliefAtSource")}>
              {t.broker.rasCta}
            </ButtonLink>
          </div>
        </section>

        {/* ------------------------------------------------ Case 3: FiscalPlace */}
        <section className="border-t border-rule py-14 sm:py-20">
          <SectionHeading kicker={t.fp.kicker} title={t.fp.title} lede={t.fp.lede} />
          <ul className="mt-6 max-w-[80ch] space-y-3">
            {t.fp.bullets.map((b) => (
              <li key={b} className="flex items-baseline gap-2 text-[15px] leading-relaxed text-mine">
                <span aria-hidden="true" className="font-mono text-brand">
                  ·
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <ButtonLink variant="secondary" href={href(locale, "pricing")}>
              {common.cta.seePricing}
            </ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-3" />
        </section>

        {/* ------------------------------------------------ Further reading */}
        <section className="border-t border-rule py-14 sm:py-20">
          <SectionHeading kicker={t.further.kicker} title={t.further.title} />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {t.further.cards.map((card, i) => (
              <Card as="li" key={card.label} className="flex flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{card.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-mine">{card.description}</p>
                <div className="mt-4">
                  <ButtonLink variant="ghost" href={furtherHrefs[i]} className="px-0">
                    {common.cta.readMore}
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ Final CTA */}
        <section className="border-t border-rule py-14 text-center sm:py-20">
          <SectionHeading center title={t.final.title} lede={t.final.lede} />
          <div className="mt-8 flex justify-center">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
          </div>
          <TrustLine text={common.trustLine} className="mt-3" />
        </section>
      </Container>
    </div>
  );
}
