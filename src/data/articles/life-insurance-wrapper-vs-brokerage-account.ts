import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "Luxembourg life insurance vs a direct brokerage account:
 * who actually absorbs the withholding tax on foreign dividends?" Same
 * underlying legal principle as `etf-domicile-ireland-vs-us` (the entity
 * legally recognized as beneficial owner by the tax treaty is the one who
 * can claim — never the end investor behind a wrapper), applied to a
 * different wrapper: a life insurance contract (French multisupport OR
 * Luxembourg FID/FAS) instead of a fund. The insurer/depositary bank, not
 * the policyholder, is the legal holder of the assets backing the policy —
 * a policyholder only ever holds a claim against the insurer, never direct
 * title to the underlying securities, even inside a "dedicated" internal
 * fund the policyholder helped select. Every rate below is computed from
 * @/data/countries; nothing is restated by hand.
 */

const de = getCountryById("DE")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

/* Worked example: 10,000 € of gross German dividends, held one year via each wrapper. */
const GROSS = 10_000;
const withheld = GROSS * de.statutoryRate; // 26,375% → 2 637,50 €
const owedFr = GROSS * treatyRateFor(de, "FR"); // 15% → 1 500 €
const recoverable = withheld - owedFr; // 1 137,50 €

/* Canonical slugs of sibling articles referenced below. */
const ETF_DOMICILE_SLUG = {
  fr: "etf-domicile-irlande-ou-etats-unis",
  en: "etf-domicile-ireland-or-united-states",
} as const;
const DIY_SLUG = {
  fr: "faire-soi-meme-vs-deleguer-remboursement",
  en: "diy-vs-delegating-your-refund-claim",
} as const;
const NOTHING_TO_RECOVER_SLUG = {
  fr: "pays-ou-rien-a-recuperer",
  en: "countries-with-nothing-to-recover",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Deux résidents fiscaux français détiennent chacun la même action allemande, pour le même montant. L'un via un compte-titres ordinaire, l'autre via une assurance-vie luxembourgeoise en unités de compte — y compris via un fonds interne dédié (FID) qu'il a lui-même contribué à composer. Sur le papier, la retenue à la source allemande frappe les deux de la même façon. En pratique, un seul des deux peut un jour en récupérer le trop-perçu. Voici pourquoi, et lequel.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ceci n'est ni un conseil en investissement ni une recommandation patrimoniale entre assurance-vie et compte-titres — ces deux enveloppes répondent à des objectifs différents (succession, fiscalité française après 8 ans, transmission) qui dépassent largement le sujet de cette page. FiscalPlace ne fournit pas de conseil fiscal ou financier personnalisé : ceci est une explication d'un mécanisme, limitée à un seul angle, celui de la retenue à la source étrangère.`,
  },
  { type: "h2", text: `Le principe juridique qui change tout : qui est propriétaire des titres ?` },
  {
    type: "p",
    text: `Sur un compte-titres ordinaire, vous êtes le titulaire du compte et l'actionnaire enregistré (directement ou via la chaîne de conservation de votre courtier) des titres qui s'y trouvent. C'est cette qualité qui fait de vous, aux yeux de l'administration fiscale étrangère, le **bénéficiaire effectif** reconnu par la convention fiscale — la personne qui a le droit de réclamer l'écart entre le taux retenu et le taux conventionnel.`,
  },
  {
    type: "p",
    text: `Un contrat d'assurance-vie, français ou luxembourgeois, obéit à une autre logique juridique, valable quelle que soit la sophistication du support : vous ne détenez pas directement les titres logés dans vos unités de compte, ni même dans un fonds interne dédié (FID) ou un fonds d'assurance spécialisé (FAS) construit sur mesure pour vous. Le contrat vous donne une **créance sur l'assureur** — le droit de percevoir plus tard la valeur de rachat ou le capital décès — et non un droit de propriété direct sur les actions ou obligations sous-jacentes. Juridiquement, ce sont l'assureur (ou la banque dépositaire du fonds pour son compte) qui détient les titres et perçoit les dividendes. Un FID vous laisse choisir l'allocation ; il ne fait pas de vous le propriétaire des lignes qu'il contient.`,
  },
  { type: "h2", text: `Compte-titres : la retenue vous appartient, et se réclame` },
  {
    type: "p",
    text: `Prenons une action allemande. L'[Allemagne](${countryHref("fr", de.slug.fr)}) retient ${pct(de.statutoryRate, "fr")} à la source (impôt sur les dividendes plus contribution de solidarité), quand la convention franco-allemande n'en autorise que ${pct(treatyRateFor(de, "FR"), "fr")} pour un résident de France. Sur un compte-titres, cet écart est **votre** trop-perçu : vous pouvez le documenter et le réclamer auprès du Bundeszentralamt für Steuern, comme pour n'importe lequel des ${`19`} pays que nous couvrons.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu à la source (${pct(de.statutoryRate, "fr")})`,
    withheldAmount: eur(withheld, "fr"),
    owedLabel: `Dû par un résident de France (${pct(treatyRateFor(de, "FR"), "fr")})`,
    owedAmount: eur(owedFr, "fr"),
    treatyRef: `CDI FR-DE`,
    recoverLabel: `Trop-perçu récupérable — sur un compte-titres`,
    recoverAmount: eur(recoverable, "fr"),
    footnote: `Exemple pour ${eur(GROSS, "fr")} de dividendes allemands bruts détenus en direct sur un compte-titres — montants indicatifs, données revues mi-2026.`,
  },
  { type: "h2", text: `Assurance-vie luxembourgeoise : la même retenue, mais absorbée sans vous` },
  {
    type: "p",
    text: `Détenez la même action allemande, pour le même montant, à l'intérieur d'un contrat d'assurance-vie luxembourgeois — que ce soit un support en unités de compte classique ou un FID sur mesure. Les ${eur(withheld, "fr")} de retenue allemande sont bien prélevés, mais au niveau de l'assureur ou de la banque dépositaire du fonds, avant que quoi que ce soit ne soit valorisé dans votre contrat. C'est ce même écart de ${eur(recoverable, "fr")} qui existe en théorie — mais **personne, à titre individuel, ne peut le réclamer en votre nom** : ni vous, qui n'êtes pas le bénéficiaire effectif reconnu par la convention ; ni FiscalPlace, pour la même raison ; et l'assureur n'y est tenu par aucune obligation contractuelle envers vous.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Pourquoi ce n'est pas un dossier FiscalPlace`,
    text: `Certains assureurs luxembourgeois annoncent négocier, à leur niveau et pour l'ensemble de leurs fonds, une récupération partielle de la retenue à la source sur dividendes étrangers auprès de leurs dépositaires — un avantage présenté comme rare dans le secteur, très variable d'un assureur à l'autre, et totalement invisible et non pilotable depuis votre contrat individuel : vous ne pouvez ni le demander, ni le vérifier ligne par ligne, ni le confier à un tiers. Ce n'est en aucun cas une démarche de réclamation au sens où ce site l'entend — c'est une politique de gestion interne de l'assureur, opaque par nature.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Pour un résident fiscal de France détenant la même valeur étrangère par les deux voies — données revues mi-2026.`,
    headers: [``, `Compte-titres ordinaire`, `Assurance-vie luxembourgeoise (UC classiques ou FID/FAS)`],
    rows: [
      [
        `Qui détient juridiquement les titres ?`,
        `Vous, directement (ou via la chaîne de conservation du courtier)`,
        `L'assureur ou la banque dépositaire du fonds, en représentation de ses engagements envers vous`,
      ],
      [
        `Bénéficiaire effectif reconnu par la convention fiscale`,
        `Vous`,
        `L'assureur ou le fonds, jamais le souscripteur`,
      ],
      [
        `Visible comme une ligne de retenue sur votre relevé personnel ?`,
        `Oui`,
        `Non — absorbée en amont de la valorisation du contrat`,
      ],
      [
        `Récupérable via FiscalPlace ou tout autre prestataire ?`,
        `Oui, selon le pays et votre situation`,
        `Non — aucune démarche individuelle possible, par construction`,
      ],
      [
        `Ce qui peut néanmoins réduire la perte`,
        `W-8BEN, déclarations d'exemption, réclamation a posteriori`,
        `Politique de récupération interne de l'assureur, opaque et hors de votre contrôle`,
      ],
    ],
  },
  { type: "h2", text: `Une logique déjà vue ailleurs, pour un support différent` },
  {
    type: "p",
    text: `Ce principe n'est pas propre à l'assurance-vie : c'est le même que celui qui rend la retenue subie par un [ETF UCITS irlandais non récupérable par son porteur](${articleHref("fr", ETF_DOMICILE_SLUG.fr)}) — dans les deux cas, une structure intermédiaire (fonds ou contrat d'assurance) est le bénéficiaire effectif reconnu, pas la personne physique en bout de chaîne. Un contrat d'assurance-vie qui investit lui-même dans des ETF ou des OPCVM cumule d'ailleurs les deux écrans : celui du fonds sous-jacent, puis celui du contrat.`,
  },
  {
    type: "p",
    text: `Cela ne rend pas l'assurance-vie luxembourgeoise désavantageuse en tant que telle — ses atouts se jouent ailleurs (allègement de la fiscalité française après 8 ans, transmission hors succession dans certaines limites, diversification via des FID). Le choix entre les deux enveloppes est une décision de gestion de patrimoine qui doit intégrer bien plus que la seule retenue à la source étrangère — un sujet pour un conseiller en gestion de patrimoine, pas pour un prestataire de récupération fiscale.`,
  },
  {
    type: "callout",
    tone: "example",
    title: `Le cas mixte, le plus fréquent en pratique`,
    text: `Beaucoup d'investisseurs détiennent les deux à la fois : un compte-titres pour leurs positions directes, une assurance-vie pour une autre partie du patrimoine. Dans ce cas de figure très courant, seule la moitié « compte-titres » relève d'un diagnostic de récupération — l'autre moitié n'a, par construction, aucun dossier à ouvrir sur ce point précis.`,
  },
  { type: "h2", text: `Vos questions sur ce comparatif` },
  {
    type: "faq",
    items: [
      {
        question: `Et une assurance-vie française « classique » plutôt que luxembourgeoise ?`,
        answer: `Exactement le même principe s'applique : que le contrat soit de droit français ou luxembourgeois, l'assureur (ou le fonds interne au contrat) reste juridiquement le détenteur des titres et le bénéficiaire effectif reconnu par les conventions fiscales, jamais le souscripteur. Le Luxembourg n'a ici aucune spécificité négative ou positive — ses avantages propres (triangle de sécurité, portabilité) sont sans lien avec cette question.`,
      },
      {
        question: `Un FID que j'ai composé moi-même ne change-t-il rien ?`,
        answer: `Rien sur ce point précis. Le FID vous donne un droit de regard, voire de décision, sur l'allocation — pas un droit de propriété directe sur les titres qui la composent. Juridiquement, les actifs du fonds interne dédié restent la propriété de l'assureur, en représentation de ses engagements envers vous : c'est ce statut, et non votre degré d'implication dans le choix des lignes, qui détermine qui est le bénéficiaire effectif reconnu par la convention fiscale.`,
      },
      {
        question: `Mon assureur affiche un rendement qui semble déjà tenir compte de retenues récupérées : dois-je faire une démarche en plus ?`,
        answer: `Non, et vous ne le pourriez de toute façon pas : si un assureur négocie une récupération partielle à son niveau, elle est déjà reflétée (ou non) dans la valorisation de vos unités de compte ou de votre FID, sans démarche possible de votre part. Poser la question directement à votre assureur ou à votre conseiller reste la seule façon de savoir si une telle politique existe pour votre contrat précis.`,
      },
      {
        question: `Si je transfère mes titres d'un compte-titres vers une assurance-vie, que devient un dossier de récupération en cours ?`,
        answer: `Un dossier déjà ouvert sur des dividendes perçus alors que vous déteniez les titres en direct reste votre trop-perçu, peu importe ce que vous faites ensuite du compte-titres. En revanche, à compter du transfert effectif des titres dans le contrat d'assurance-vie, tout nouveau dividende suit le régime décrit ici — sans démarche individuelle possible.`,
      },
    ],
  },
  {
    type: "p",
    text: `Pour approfondir la voie qui reste ouverte — le compte-titres — [notre comparatif faire soi-même ou déléguer](${articleHref("fr", DIY_SLUG.fr)}) chiffre les deux options, et [la liste des pays où il n'y a structurellement rien à récupérer](${articleHref("fr", NOTHING_TO_RECOVER_SLUG.fr)}) complète le tableau des zéros assumés.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier mes titres détenus en direct`,
    note: `Le simulateur s'applique aux actions et ETF détenus en direct sur un compte-titres — pas aux unités de compte d'un contrat d'assurance-vie.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Two French tax residents each hold the same German share, for the same amount. One through an ordinary brokerage account, the other through a Luxembourg life insurance policy — including through a dedicated internal fund (FID) they helped design themselves. On paper, German withholding tax hits both the same way. In practice, only one of the two can ever reclaim the over-withholding. Here's why, and which one.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is neither investment advice nor a wealth-planning recommendation between life insurance and a brokerage account — the two wrappers serve different purposes (estate planning, French tax treatment after 8 years, transmission) far beyond the scope of this page. FiscalPlace does not provide personalized tax or financial advice: this is an explanation of one mechanism, limited to a single angle — foreign withholding tax.`,
  },
  { type: "h2", text: `The legal principle that changes everything: who legally owns the securities?` },
  {
    type: "p",
    text: `In an ordinary brokerage account, you are the account holder and the registered shareholder (directly, or through your broker's custody chain) of the securities it holds. It is that status that makes you, in the eyes of the foreign tax authority, the **beneficial owner** recognized by the tax treaty — the person entitled to claim the gap between the rate withheld and the treaty rate.`,
  },
  {
    type: "p",
    text: `A life insurance policy, French or Luxembourg, follows a different legal logic, regardless of how sophisticated the underlying vehicle is: you do not directly own the securities held inside your unit-linked funds, nor even inside a dedicated internal fund (FID) or specialized insurance fund (FAS) built to your own specifications. The policy gives you a **claim against the insurer** — the right to later receive the surrender value or the death benefit — not direct title to the underlying shares or bonds. Legally, it is the insurer (or the bank that custodies the fund on its behalf) that holds the securities and receives the dividends. An FID lets you choose the allocation; it does not make you the owner of the lines it contains.`,
  },
  { type: "h2", text: `A brokerage account: the withholding is yours, and it can be reclaimed` },
  {
    type: "p",
    text: `Take a German share. [Germany](${countryHref("en", de.slug.en)}) withholds ${pct(de.statutoryRate, "en")} at source (dividend tax plus solidarity surcharge), while the France-Germany treaty allows only ${pct(treatyRateFor(de, "FR"), "en")} for a French resident. In a brokerage account, that gap is **your** over-withholding: you can document it and claim it back from the Bundeszentralamt für Steuern, exactly as for any of the 19 countries we cover.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld at source (${pct(de.statutoryRate, "en")})`,
    withheldAmount: eur(withheld, "en"),
    owedLabel: `Owed by a French resident (${pct(treatyRateFor(de, "FR"), "en")})`,
    owedAmount: eur(owedFr, "en"),
    treatyRef: `FR-DE tax treaty`,
    recoverLabel: `Recoverable over-withholding — via a brokerage account`,
    recoverAmount: eur(recoverable, "en"),
    footnote: `Example for ${eur(GROSS, "en")} of gross German dividends held directly in a brokerage account — indicative amounts, data reviewed mid-2026.`,
  },
  { type: "h2", text: `Luxembourg life insurance: the same withholding, absorbed without you` },
  {
    type: "p",
    text: `Hold that same German share, for the same amount, inside a Luxembourg life insurance policy — whether a standard unit-linked fund or a bespoke FID. The ${eur(withheld, "en")} of German withholding is indeed levied, but at the level of the insurer or the fund's custodian bank, before anything is even valued inside your policy. The same ${eur(recoverable, "en")} gap exists in theory — but **nobody, on an individual basis, can claim it on your behalf**: not you, since you are not the treaty-recognized beneficial owner; not FiscalPlace, for the same reason; and the insurer is under no contractual obligation to you to do so.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Why this is not a FiscalPlace claim`,
    text: `Some Luxembourg insurers advertise negotiating, at their own level and across the whole of their funds, a partial recovery of foreign withholding tax with their custodians — a feature presented as rare in the industry, highly variable from one insurer to another, and entirely invisible and unactionable from your individual policy: you cannot request it, verify it line by line, or hand it to a third party. This is in no way a claim in the sense this site uses the term — it is an internal management policy of the insurer, opaque by nature.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `For a French tax resident holding the same foreign security through both routes — data reviewed mid-2026.`,
    headers: [``, `Ordinary brokerage account`, `Luxembourg life insurance (standard unit-linked or FID/FAS)`],
    rows: [
      [
        `Who legally holds the securities?`,
        `You, directly (or through your broker's custody chain)`,
        `The insurer or the fund's custodian bank, backing its obligations to you`,
      ],
      [
        `Treaty-recognized beneficial owner`,
        `You`,
        `The insurer or the fund, never the policyholder`,
      ],
      [
        `Shows as a withholding line on your personal statement?`,
        `Yes`,
        `No — absorbed upstream of the policy's valuation`,
      ],
      [
        `Recoverable via FiscalPlace or any other provider?`,
        `Yes, depending on the country and your situation`,
        `No — no individual claim route exists, by construction`,
      ],
      [
        `What can still soften the loss`,
        `A W-8BEN, exemption declarations, after-the-fact claims`,
        `The insurer's own internal recovery policy, opaque and outside your control`,
      ],
    ],
  },
  { type: "h2", text: `A principle already seen elsewhere, for a different wrapper` },
  {
    type: "p",
    text: `This isn't specific to life insurance: it is the same logic that makes the withholding suffered by an [Ireland-domiciled UCITS ETF non-recoverable by its holder](${articleHref("en", ETF_DOMICILE_SLUG.en)}) — in both cases, an intermediate structure (fund or insurance policy) is the treaty-recognized beneficial owner, not the individual at the end of the chain. A life insurance policy that itself invests in ETFs or mutual funds stacks both screens: the underlying fund's, then the policy's.`,
  },
  {
    type: "p",
    text: `This does not make Luxembourg life insurance disadvantageous as such — its strengths lie elsewhere (French tax treatment improving after 8 years, transmission outside the estate within certain limits, diversification through FIDs). The choice between the two wrappers is a wealth-planning decision that has to weigh far more than foreign withholding tax alone — a question for a wealth advisor, not a withholding-tax recovery provider.`,
  },
  {
    type: "callout",
    tone: "example",
    title: `The mixed case, most common in practice`,
    text: `Many investors hold both at once: a brokerage account for their direct positions, a life insurance policy for another part of their wealth. In that very common setup, only the "brokerage account" half is worth a recovery diagnosis — the other half has, by construction, no claim to open on this specific point.`,
  },
  { type: "h2", text: `Your questions about this comparison` },
  {
    type: "faq",
    items: [
      {
        question: `What about a "standard" French life insurance policy rather than a Luxembourg one?`,
        answer: `Exactly the same principle applies: whether the policy is under French or Luxembourg law, the insurer (or the fund inside the policy) remains the legal holder of the securities and the treaty-recognized beneficial owner, never the policyholder. Luxembourg has no specific up- or downside here — its own advantages (the security triangle, portability) are unrelated to this question.`,
      },
      {
        question: `Doesn't an FID I designed myself change anything?`,
        answer: `Nothing on this specific point. An FID gives you input, even decision-making power, over the allocation — not direct ownership of the securities that make it up. Legally, the assets of a dedicated internal fund remain the property of the insurer, backing its obligations to you: it is that status, not how involved you were in picking the lines, that determines who the treaty-recognized beneficial owner is.`,
      },
      {
        question: `My insurer shows a return that seems to already account for recovered withholding — should I file a claim on top of that?`,
        answer: `No, and you couldn't anyway: if an insurer negotiates a partial recovery at its own level, it is already reflected (or not) in the valuation of your unit-linked funds or your FID, with no action possible on your part. Asking your insurer or advisor directly remains the only way to know whether such a policy exists for your specific contract.`,
      },
      {
        question: `If I transfer securities from a brokerage account into a life insurance policy, what happens to a recovery claim already in progress?`,
        answer: `A claim already opened on dividends received while you held the securities directly remains your over-withholding, whatever you do with the brokerage account afterwards. From the effective date the securities move into the insurance policy, however, any new dividend follows the regime described here — with no individual claim route possible.`,
      },
    ],
  },
  {
    type: "p",
    text: `To go further on the route that remains open — the brokerage account — [our DIY vs delegate comparison](${articleHref("en", DIY_SLUG.en)}) prices out both options, and [the list of countries with structurally nothing to recover](${articleHref("en", NOTHING_TO_RECOVER_SLUG.en)}) rounds out the honest zeros.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check my directly-held shares`,
    note: `The simulator applies to shares and ETFs held directly in a brokerage account — not to unit-linked funds inside a life insurance policy.`,
  },
];

export const lifeInsuranceWrapperVsBrokerageAccount: Article = {
  id: "life-insurance-wrapper-vs-brokerage-account",
  slug: {
    fr: "assurance-vie-luxembourgeoise-vs-compte-titres",
    en: "luxembourg-life-insurance-vs-brokerage-account",
  },
  category: "comparisons",
  title: {
    fr: "Assurance-vie luxembourgeoise ou compte-titres : qui récupère la retenue sur vos dividendes étrangers ?",
    en: "Luxembourg life insurance or a brokerage account: who reclaims the withholding tax on your foreign dividends?",
  },
  description: {
    fr: `Même action, même montant, même retenue étrangère — mais un seul des deux supports permet un jour de la récupérer. Le principe juridique du bénéficiaire effectif, appliqué à l'assurance-vie luxembourgeoise (unités de compte classiques ou FID) face au compte-titres.`,
    en: `Same share, same amount, same foreign withholding — but only one of the two wrappers can ever get it back. The beneficial-owner principle, applied to Luxembourg life insurance (standard unit-linked funds or an FID) versus a brokerage account.`,
  },
  updated: "2026-08-27",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["DE"],
};
