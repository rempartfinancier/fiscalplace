import { formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { GB_REIT_PID_RATE, getCountryById, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "The countries where there is nothing to recover (and why we
 * tell you)". The anti-sales article: a success-fee business explaining
 * where NOT to expect money. Every rate below is computed from
 * @/data/countries; nothing is restated by hand.
 */

const gb = getCountryById("GB")!;
const nl = getCountryById("NL")!;
const frSrc = getCountryById("FR")!;
const us = getCountryById("US")!;
const au = getCountryById("AU")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/** Canonical slugs of sibling articles referenced below. */
const BEST_COUNTRIES_SLUG = {
  fr: "meilleurs-pays-recuperation-resident-francais",
  en: "best-countries-for-recovery-french-resident",
} as const;
const BROKER_SLUG = {
  fr: "retenue-a-la-source-ce-que-votre-courtier-ne-dit-pas",
  en: "withholding-tax-what-your-broker-wont-tell-you",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Un prestataire payé au succès a toutes les raisons de vous laisser croire qu'il y a de l'argent à récupérer partout. Il n'y en a pas. Sur plusieurs des marchés les plus détenus par les investisseurs français, le trop-perçu est **nul par construction** — et le savoir vous évite deux erreurs : payer quelqu'un pour rien, et soupçonner à tort votre courtier. Voici la liste honnête des zéros, les cas conditionnels, et le plus grand faux espoir du métier : les ETF.`,
  },
  {
    type: "table",
    caption: `Les « zéros structurels » pour un particulier résident de France — taux indicatifs, données revues mi-2026.`,
    headers: [`Pays`, `Retenu`, `Dû par convention`, `Pourquoi il n'y a rien à récupérer`],
    rows: [
      [
        `${gb.flag} [${gb.name.fr}](${countryHref("fr", gb.slug.fr)})`,
        pct(gb.statutoryRate, "fr"),
        pct(treatyRateFor(gb, "FR"), "fr"),
        `Aucune retenue sur les dividendes ordinaires : rien n'est prélevé, rien n'est à rendre.`,
      ],
      [
        `${nl.flag} [${nl.name.fr}](${countryHref("fr", nl.slug.fr)})`,
        pct(nl.statutoryRate, "fr"),
        pct(treatyRateFor(nl, "FR"), "fr"),
        `Le taux retenu est déjà le taux conventionnel : l'écart est nul.`,
      ],
      [
        `${frSrc.flag} [${frSrc.name.fr}](${countryHref("fr", frSrc.slug.fr)})`,
        pct(frSrc.statutoryRate, "fr"),
        `15 %`,
        `Vu de l'étranger : la retenue française sur un particulier non résident est inférieure au taux conventionnel usuel.`,
      ],
    ],
  },
  { type: "h2", text: `Royaume-Uni : le zéro le plus mal compris` },
  {
    type: "p",
    text: `Le [Royaume-Uni](${countryHref("fr", gb.slug.fr)}) ne prélève aucune retenue à la source sur les dividendes ordinaires — Shell, HSBC, Unilever ou AstraZeneca vous versent le brut. Si un montant a malgré tout disparu sur une ligne britannique, trois explications dominent, et aucune n'est une retenue récupérable par convention : des frais de courtage ou de change, une distribution de REIT (les « Property Income Distributions » supportent bien ${pct(GB_REIT_PID_RATE, "fr")}, souvent réductibles à 15 %), ou un titre à double cotation qui distribue en réalité depuis une autre juridiction. Le réflexe utile n'est pas « récupérer » mais **identifier** — c'est exactement ce que fait [la lecture de relevé décrite ici](${articleHref("fr", BROKER_SLUG.fr)}).`,
  },
  { type: "h2", text: `Pays-Bas : le taux retenu est déjà le bon` },
  {
    type: "p",
    text: `Les [Pays-Bas](${countryHref("fr", nl.slug.fr)}) retiennent ${pct(nl.statutoryRate, "fr")} — et la convention franco-néerlandaise autorise… ${pct(treatyRateFor(nl, "FR"), "fr")}. Pour un particulier, l'écriture est soldée d'avance : ASML, Shell (part NL) ou ING ne cachent aucun trop-perçu. Les exceptions existent (organismes exonérés, fonds, erreurs techniques de sur-prélèvement) mais elles ne concernent pas l'investisseur individuel type. Quiconque vous facture un « dossier Pays-Bas » sans avoir vérifié votre statut au préalable vous vend du vent.`,
  },
  { type: "h2", text: `La France vue de l'étranger : moins que le taux conventionnel` },
  {
    type: "p",
    text: `Cas miroir, utile si vous connaissez des non-résidents détenant des actions françaises : la retenue française sur les dividendes versés à un particulier non résident est de ${pct(frSrc.statutoryRate, "fr")} — **en dessous** des 15 % que les conventions autorisent généralement. Il n'y a donc rien à réclamer à la DGFiP dans le cas standard. Le trop-perçu français existe seulement quand l'établissement payeur a appliqué un taux erroné (taux de 25 % réservé à certaines entités, taux majoré) — réel, mais marginal.`,
  },
  { type: "h2", text: `Les zéros conditionnels : États-Unis et Australie` },
  {
    type: "p",
    text: `Deux grands marchés affichent zéro **quand tout va bien**. Aux [États-Unis](${countryHref("fr", us.slug.fr)}), un W-8BEN valide chez votre courtier ramène la retenue de ${pct(us.statutoryRate, "fr")} à ${pct(treatyRateFor(us, "FR"), "fr")} dès le versement : si c'est votre cas, votre zéro américain est une bonne nouvelle, pas un manque à gagner — [vérifiez la date d'expiration ici](${href("fr", "w8benChecker")}), c'est gratuit. En [Australie](${countryHref("fr", au.slug.fr)}), les dividendes « fully franked » (adossés à l'impôt sur les sociétés déjà payé) ne subissent aucune retenue : le zéro est alors structurel, ligne par ligne. Et les fameux crédits d'imputation (franking credits) ne sont **pas** remboursables aux non-résidents — promesse contraire = signal d'alarme.`,
  },
  { type: "h2", text: `Le plus grand faux espoir : les ETF et les fonds` },
  {
    type: "p",
    text: `C'est la question qui revient le plus, et la réponse déplaît : dans un ETF ou un fonds, c'est **le fonds** qui est juridiquement l'actionnaire des titres. La retenue à la source prélevée sur les dividendes que le fonds encaisse est son affaire, traitée (ou non) à son niveau selon sa domiciliation — elle ne vous appartient pas et ne peut pas être réclamée par vous. Ce que vous recevez du fonds est une distribution d'OPC, un autre objet fiscal. Un portefeuille 100 % ETF n'a, en règle générale, **aucun dossier de récupération à ouvrir** — et nous préférons vous le dire avant le diagnostic plutôt qu'après un mandat.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Le test anti-vendeur de rêve`,
    text: `Demandez à n'importe quel prestataire : « que se passe-t-il si mon dossier ne contient que du Royaume-Uni, des Pays-Bas et des ETF ? ». La bonne réponse est « rien à déposer, donc rien à facturer ». Toute autre réponse vous renseigne sur le modèle d'affaires. Le nôtre est public : commission au succès uniquement — un dossier vide ne nous rapporte rien, et notre [simulateur](${href("fr", "simulator")}) vous le dit gratuitement, avant tout engagement.`,
  },
  { type: "h2", text: `Ce qu'il faut faire de vos « zéros »` },
  {
    type: "ul",
    items: [
      `**Vérifier plutôt que supposer.** Un zéro théorique peut cacher une anomalie réelle (mauvais taux appliqué, REIT britannique, part unfranked australienne) : cinq minutes de lecture de relevé suffisent à trancher.`,
      `**Réallouer votre attention.** L'énergie économisée sur les zéros se place sur les vrais gisements — [le classement complet est ici](${articleHref("fr", BEST_COUNTRIES_SLUG.fr)}) : Finlande, Irlande, Suisse et consorts.`,
      `**Garder la prévention en tête.** Le zéro américain ne tient que tant que le W-8BEN est valide : une expiration silencieuse le transforme en trop-perçu de ${pct(us.statutoryRate, "fr")} contre ${pct(treatyRateFor(us, "FR"), "fr")}.`,
    ],
  },
  { type: "h2", text: `Vos questions sur les « zéros »` },
  {
    type: "faq",
    items: [
      {
        question: `Mon courtier a retenu quelque chose sur une action britannique : que faire ?`,
        answer: `Identifier avant d'agir : regardez si la ligne est une distribution de REIT (retenue de 20 % réelle, souvent réductible), un titre à double cotation qui distribue depuis une autre juridiction, ou de simples frais. Si c'est une vraie retenue mal appliquée, elle se conteste — mais auprès du bon interlocuteur, qui n'est pas toujours une administration fiscale.`,
      },
      {
        question: `Pourquoi dites-vous publiquement où il n'y a rien à gagner ?`,
        answer: `Parce que notre modèle ne fonctionne que sur la confiance : nous sommes payés uniquement au succès, un dossier vide nous coûte du temps sans rien rapporter, et un client qui découvre l'inutilité d'un dossier après coup ne revient jamais. Dire « zéro » quand c'est zéro est notre meilleur argument commercial pour les cas où il y a vraiment de l'argent.`,
      },
      {
        question: `Un ETF de distribution ne me donne-t-il vraiment aucun droit ?`,
        answer: `Aucun droit sur la retenue prélevée à l'intérieur du fonds, non — elle appartient juridiquement au fonds. Votre distribution d'OPC suit son propre régime fiscal dans votre pays de résidence. La seule exception pratique : les titres détenus en direct à côté de vos ETF, qui eux relèvent bien de la récupération classique.`,
      },
      {
        question: `Les Pays-Bas peuvent-ils redevenir un pays « à récupération » ?`,
        answer: `Les taux évoluent : une hausse du taux néerlandais ou une renégociation de la convention changerait la donne. C'est pourquoi notre base pays est versionnée et revue régulièrement — le simulateur applique toujours les écarts en vigueur au moment où vous l'utilisez, et chaque dossier est revérifié avant dépôt.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier ce que mon portefeuille contient vraiment`,
    note: `Gratuit, sans compte — et si le résultat est zéro, il affiche zéro.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `A provider paid on success has every incentive to let you believe there is money to recover everywhere. There isn't. On several of the markets French investors hold most, the over-withholding is **nil by construction** — and knowing it spares you two mistakes: paying someone for nothing, and wrongly suspecting your broker. Here is the honest list of the zeros, the conditional cases, and the trade's greatest false hope: ETFs.`,
  },
  {
    type: "table",
    caption: `The "structural zeros" for an individual French resident — indicative rates, data reviewed in mid-2026.`,
    headers: [`Country`, `Withheld`, `Owed by treaty`, `Why there is nothing to recover`],
    rows: [
      [
        `${gb.flag} [${gb.name.en}](${countryHref("en", gb.slug.en)})`,
        pct(gb.statutoryRate, "en"),
        pct(treatyRateFor(gb, "FR"), "en"),
        `No withholding on ordinary dividends: nothing is taken, nothing is owed back.`,
      ],
      [
        `${nl.flag} [${nl.name.en}](${countryHref("en", nl.slug.en)})`,
        pct(nl.statutoryRate, "en"),
        pct(treatyRateFor(nl, "FR"), "en"),
        `The rate withheld is already the treaty rate: the gap is nil.`,
      ],
      [
        `${frSrc.flag} [${frSrc.name.en}](${countryHref("en", frSrc.slug.en)})`,
        pct(frSrc.statutoryRate, "en"),
        `15%`,
        `Seen from abroad: the French withholding on a non-resident individual sits below the usual treaty rate.`,
      ],
    ],
  },
  { type: "h2", text: `The United Kingdom: the most misunderstood zero` },
  {
    type: "p",
    text: `The [United Kingdom](${countryHref("en", gb.slug.en)}) levies no withholding at source on ordinary dividends — Shell, HSBC, Unilever or AstraZeneca pay you gross. If an amount nonetheless vanished on a UK line, three explanations dominate, and none is a treaty-recoverable withholding: brokerage or FX fees, a REIT distribution (Property Income Distributions do bear ${pct(GB_REIT_PID_RATE, "en")}, often reducible to 15%), or a dual-listed security actually distributing from another jurisdiction. The useful reflex is not "recover" but **identify** — exactly what [the statement-reading walkthrough here](${articleHref("en", BROKER_SLUG.en)}) does.`,
  },
  { type: "h2", text: `The Netherlands: the rate withheld is already the right one` },
  {
    type: "p",
    text: `The [Netherlands](${countryHref("en", nl.slug.en)}) withholds ${pct(nl.statutoryRate, "en")} — and the French-Dutch treaty allows… ${pct(treatyRateFor(nl, "FR"), "en")}. For an individual, the entry is settled in advance: ASML, Shell (NL line) or ING hide no over-withholding. Exceptions exist (exempt bodies, funds, technical over-withholding errors) but they do not concern the typical individual investor. Anyone billing you for a "Netherlands file" without first checking your status is selling you air.`,
  },
  { type: "h2", text: `France seen from abroad: below the treaty rate` },
  {
    type: "p",
    text: `The mirror case, useful if you know non-residents holding French shares: the French withholding on dividends paid to a non-resident individual is ${pct(frSrc.statutoryRate, "en")} — **below** the 15% treaties generally allow. So there is nothing to claim from the DGFiP in the standard case. French over-withholding only exists where the paying agent applied a wrong rate (the 25% reserved for certain entities, or a punitive rate) — real, but marginal.`,
  },
  { type: "h2", text: `The conditional zeros: the United States and Australia` },
  {
    type: "p",
    text: `Two major markets read zero **when everything is in order**. In the [United States](${countryHref("en", us.slug.en)}), a valid W-8BEN with your broker cuts withholding from ${pct(us.statutoryRate, "en")} to ${pct(treatyRateFor(us, "FR"), "en")} at payment: if that is your case, your US zero is good news, not a missed opportunity — [check the expiry date here](${href("en", "w8benChecker")}), it's free. In [Australia](${countryHref("en", au.slug.en)}), fully franked dividends (backed by corporate tax already paid) bear no withholding: that zero is structural, line by line. And the famous franking credits are **not** refundable to non-residents — any promise to the contrary is a red flag.`,
  },
  { type: "h2", text: `The greatest false hope: ETFs and funds` },
  {
    type: "p",
    text: `It is the most frequent question, and the answer disappoints: in an ETF or fund, **the fund** is legally the shareholder of the securities. The withholding levied on the dividends the fund collects is its business, handled (or not) at its level according to its domicile — it does not belong to you and cannot be claimed by you. What you receive from the fund is a fund distribution, a different tax object. A 100% ETF portfolio has, as a general rule, **no recovery file to open** — and we would rather tell you before the diagnostic than after a mandate.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `The dream-seller test`,
    text: `Ask any provider: "what happens if my file only contains the UK, the Netherlands and ETFs?". The right answer is "nothing to file, so nothing to bill". Any other answer tells you about the business model. Ours is public: success fee only — an empty file earns us nothing, and our [simulator](${href("en", "simulator")}) tells you for free, before any commitment.`,
  },
  { type: "h2", text: `What to do with your "zeros"` },
  {
    type: "ul",
    items: [
      `**Verify rather than assume.** A theoretical zero can hide a real anomaly (a wrong rate applied, a UK REIT, an Australian unfranked portion): five minutes of statement reading settles it.`,
      `**Reallocate your attention.** The energy saved on the zeros goes to the real pools — [the full ranking is here](${articleHref("en", BEST_COUNTRIES_SLUG.en)}): Finland, Ireland, Switzerland and company.`,
      `**Keep prevention in mind.** The US zero only holds while the W-8BEN is valid: a silent expiry turns it into an over-withholding of ${pct(us.statutoryRate, "en")} against ${pct(treatyRateFor(us, "FR"), "en")}.`,
    ],
  },
  { type: "h2", text: `Your questions about the "zeros"` },
  {
    type: "faq",
    items: [
      {
        question: `My broker withheld something on a UK share: what should I do?`,
        answer: `Identify before acting: check whether the line is a REIT distribution (a genuine 20% withholding, often reducible), a dual-listed security distributing from another jurisdiction, or simply fees. If it is a genuinely misapplied withholding, it can be challenged — but with the right counterpart, which is not always a tax administration.`,
      },
      {
        question: `Why do you say publicly where there is nothing to gain?`,
        answer: `Because our model only works on trust: we are paid on success only, an empty file costs us time and earns nothing, and a client who discovers a pointless file after the fact never comes back. Saying "zero" when it is zero is our best sales argument for the cases where there genuinely is money.`,
      },
      {
        question: `Does a distributing ETF really give me no claim at all?`,
        answer: `No claim on the withholding levied inside the fund — it legally belongs to the fund. Your fund distribution follows its own tax regime in your residence country. The one practical exception: the securities you hold directly alongside your ETFs, which do fall under classic recovery.`,
      },
      {
        question: `Could the Netherlands become a "recovery country" again?`,
        answer: `Rates move: a rise in the Dutch rate or a renegotiated treaty would change the picture. That is why our country database is versioned and reviewed regularly — the simulator always applies the gaps in force when you use it, and every file is re-checked before filing.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check what my portfolio really contains`,
    note: `Free, no account — and if the result is zero, it shows zero.`,
  },
];

export const nothingToRecover: Article = {
  id: "nothing-to-recover",
  slug: {
    fr: "pays-ou-rien-a-recuperer",
    en: "countries-with-nothing-to-recover",
  },
  category: "problems",
  title: {
    fr: "Les pays où il n'y a rien à récupérer (et pourquoi nous vous le disons)",
    en: "The countries where there is nothing to recover (and why we tell you)",
  },
  description: {
    fr: `Royaume-Uni, Pays-Bas, France vue de l'étranger, dividendes américains sous W-8BEN valide, ETF : la liste honnête des zéros — par un prestataire payé uniquement au succès, qui n'a donc aucun intérêt à vous les cacher.`,
    en: `The UK, the Netherlands, France seen from abroad, US dividends under a valid W-8BEN, ETFs: the honest list of the zeros — from a provider paid on success only, with no interest in hiding them.`,
  },
  updated: "2025-10-21",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["GB", "NL", "FR", "US", "AU"],
};
