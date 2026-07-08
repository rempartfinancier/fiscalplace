import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { getCountryById } from "@/data/countries";
import { PRICING, computeCommission } from "@/config/pricing";
import type { Article, ArticleBlock } from "./types";

/**
 * COST — "Why some providers never publish their pricing (and why we do)".
 * Radical-transparency piece: every figure is computed from @/config/pricing,
 * including the comparisons that do NOT flatter our own grid.
 */

const ca = getCountryById("CA")!;
const ch = getCountryById("CH")!;

const eur = (n: number, locale: Locale) =>
  formatCurrency(n, locale, "EUR", Number.isInteger(n) ? 0 : 2);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

const [tier1, tier2, tier3, tier4] = PRICING.successFeeTiers;
void tier3;

/** Hypothetical flat market rate used for the honest head-to-head (equals our tier-2 rate). */
const flatRate = tier2.rate;

/**
 * Recovered amount at which our marginal grid becomes cheaper than a flat
 * `flatRate` fee — found numerically so it always tracks the config.
 */
const crossoverAmount = (() => {
  let lo: number = PRICING.floorFee;
  let hi: number = PRICING.institutionalThreshold;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (computeCommission(mid).fee > flatRate * mid) lo = mid;
    else hi = mid;
  }
  return Math.round(hi / 100) * 100;
})();

const EXAMPLE_AMOUNTS = [1_115, 2_840, 30_000, 100_000];

function flatComparisonRows(locale: Locale): string[][] {
  return EXAMPLE_AMOUNTS.map((recovered) => {
    const c = computeCommission(recovered);
    const ours = Math.round(c.fee * 100) / 100;
    const flat = Math.round(recovered * flatRate * 100) / 100;
    const ourLabel = c.capApplied
      ? `${eur(ours, locale)}${locale === "fr" ? " (plafond)" : " (cap)"}`
      : eur(ours, locale);
    const winner =
      ours <= flat
        ? locale === "fr"
          ? "Notre grille"
          : "Our grid"
        : locale === "fr"
          ? `Le taux plat`
          : `The flat rate`;
    return [eur(recovered, locale), ourLabel, eur(flat, locale), winner];
  });
}

/** Recovered amount below which our floor fee pushes the effective rate above tier 1. */
const floorBreakEven = Math.round(PRICING.floorFee / tier1.rate);

/** Canonical slug of the sibling cost article (same content batch). */
const COST_SLUG = {
  fr: "combien-coute-recuperation-withholding-tax",
  en: "cost-of-withholding-tax-recovery",
} as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Cherchez le prix d'un service de récupération de retenue à la source : vous trouverez, dans l'immense majorité des cas, un formulaire de contact et la promesse d'un devis. Ce silence a des raisons précises — tarification négociée au volume, peur de la comparaison, habitudes d'un marché construit pour les institutionnels — et il a un coût pour vous. Nous faisons le pari inverse : grille intégralement publiée, du barème marginal (${pct(tier1.rate, "fr")} à ${pct(tier4.rate, "fr")} selon la tranche) jusqu'à la rétrocession versée à nos partenaires (${pct(PRICING.partnerRevShare, "fr")} de la commission encaissée). Y compris ce qui ne nous flatte pas : il existe des cas où nous ne sommes pas les moins chers, et cet article vous montre lesquels.`,
  },
  {
    type: "p",
    text: `Marcus Sheridan appelle cela l'« ostrich marketing » : la politique de l'autruche. Le prix est la première question de tout acheteur — la retirer de son site ne la fait pas disparaître, elle envoie simplement le visiteur la poser ailleurs. Si vous lisez ces lignes après avoir écumé trois sites de prestataires sans trouver un seul chiffre, vous savez exactement de quoi nous parlons. Voyons pourquoi ce secteur se tait, ce que cette opacité vous coûte, et comment comparer des offres ligne à ligne — la nôtre comprise.`,
  },
  { type: "h2", text: `Pourquoi les prestataires de récupération ne publient-ils pas leurs prix ?` },
  {
    type: "p",
    text: `Trois raisons reviennent, de la plus défendable à la moins avouable.`,
  },
  { type: "h3", text: `Raison n° 1 : des prix réellement négociés au volume` },
  {
    type: "p",
    text: `Le gros du marché de la récupération s'est construit pour les institutionnels : fonds, banques dépositaires, family offices. À cette échelle, chaque mandat se négocie — volumes, pays couverts, chaîne de conservation, exclusivité — et publier un prix unique contredirait chaque contrat signé. C'est une vraie raison… qui ne concerne en rien un particulier avec quelques milliers d'euros à récupérer : lui n'aura jamais accès à ces conditions négociées, mais hérite du même écran de fumée.`,
  },
  { type: "h3", text: `Raison n° 2 : la peur de la comparaison` },
  {
    type: "p",
    text: `Un prix publié est un prix comparable. Tant que chaque acteur tarife en chambre, aucun tableau comparatif n'est possible et chacun peut se dire « compétitif » sans jamais le prouver. La transparence transforme un service opaque en offre comparable — c'est précisément ce que redoutent les acteurs les moins compétitifs.`,
  },
  { type: "h3", text: `Raison n° 3 : facturer ce que chaque client peut supporter` },
  {
    type: "p",
    text: `L'appel découverte obligatoire n'est pas qu'un rituel commercial : c'est un audit de votre capacité à payer. Taille du portefeuille, urgence de la prescription, méconnaissance des alternatives — chaque information donnée avant le devis peut ajuster le devis. Quand le prix arrive après la qualification, ce n'est plus un prix : c'est une estimation de votre consentement.`,
  },
  { type: "h2", text: `Ce que l'opacité tarifaire coûte à l'acheteur` },
  {
    type: "ul",
    items: [
      `**Du temps :** plusieurs appels, relances et échanges pour obtenir des chiffres que deux pages web suffiraient à donner.`,
      `**Un ancrage sans référence :** le premier devis reçu devient votre point de comparaison — alors qu'il a précisément été construit sans concurrence.`,
      `**Une prime d'asymétrie :** celui qui connaît les prix du marché quand vous ne les connaissez pas facture cette différence d'information.`,
      `**Une pression du calendrier :** pendant que vous collectionnez les devis, la prescription court — [${ca.sol.years} ans seulement au Canada](${countryHref("fr", ca.slug.fr)}) à compter de la fin de l'année civile du prélèvement.`,
      `**Aucun calcul de rentabilité possible :** sans prix, impossible de savoir si un [dossier suisse](${countryHref("fr", ch.slug.fr)}) de quelques centaines d'euros vaut la peine d'être confié — ou pas.`,
    ],
  },
  { type: "h2", text: `Notre pari inverse : tout publier, même ce qui nous dessert` },
  {
    type: "p",
    text: `Notre grille complète est en ligne : barème marginal par tranche, plancher de ${eur(PRICING.floorFee, "fr")}, plafond de ${eur(PRICING.capFee, "fr")}, forfaits fixes, abonnement, débours à prix coûtant — et jusqu'à la rétrocession de ${pct(PRICING.partnerRevShare, "fr")} versée aux conseillers qui nous recommandent, une ligne que presque personne ne révèle. Le détail chiffré vit sur [la page tarifs](${href("fr", "pricing")}) et le raisonnement complet dans [comment nous sommes payés](${href("fr", "howWeGetPaid")}).`,
  },
  {
    type: "table",
    caption: `Ce que vous savez avant de signer — comparaison de principe, données revues en juin 2026.`,
    headers: [`La question qui compte`, `Chez FiscalPlace`, `Chez un prestataire sans grille publique`],
    rows: [
      [
        `Le taux exact appliqué à votre dossier`,
        `Publié : barème marginal de ${pct(tier1.rate, "fr")} à ${pct(tier4.rate, "fr")}`,
        `Communiqué après appel, parfois après signature d'un mandat`,
      ],
      [`Le minimum par dossier`, `${eur(PRICING.floorFee, "fr")} — publié`, `À demander expressément`],
      [`Le plafond de commission`, `${eur(PRICING.capFee, "fr")} — publié`, `Rarement prévu`],
      [`Le coût en cas d'échec`, `Zéro (hors débours tiers à prix coûtant)`, `Variable — à vérifier par écrit`],
      [`Les débours (attestations, visas…)`, `Refacturés à prix coûtant, justificatifs fournis`, `Parfois margés`],
      [
        `La rétrocession à un apporteur`,
        `Publiée : ${pct(PRICING.partnerRevShare, "fr")} de la commission encaissée`,
        `Presque jamais révélée`,
      ],
    ],
  },
  { type: "h2", text: `Les limites honnêtes de notre modèle (oui, parfois nous sommes plus chers)` },
  {
    type: "p",
    text: `Une grille publiée est la même pour tous : c'est sa force, et sa limite. Un family office qui négocie un mandat institutionnel au volume obtiendra parfois de meilleures conditions que notre barème — c'est vrai, et nous préférons l'écrire ici plutôt que vous le laissiez découvrir ailleurs. Au-delà de ${eur(PRICING.institutionalThreshold, "fr")} récupérés, nous passons d'ailleurs nous-mêmes sur devis : à cette échelle, le sur-mesure est légitime, et nous affichons simplement à partir d'où il commence.`,
  },
  {
    type: "p",
    text: `Deuxième limite, chiffrée : face à un hypothétique concurrent qui pratiquerait un taux plat de ${pct(flatRate, "fr")} sans minimum ni frais annexes, notre barème marginal est plus cher jusqu'à environ ${eur(crossoverAmount, "fr")} récupérés. Au-delà, il reprend l'avantage — et le plafond de ${eur(PRICING.capFee, "fr")} creuse l'écart. La démonstration :`,
  },
  {
    type: "table",
    caption: `Comparaison illustrative avec un taux plat hypothétique de ${pct(flatRate, "fr")}, sans minimum ni frais annexes. Point d'équilibre vers ${eur(crossoverAmount, "fr")} récupérés. Données revues en juin 2026.`,
    headers: [`Montant récupéré`, `Notre grille (marginale)`, `Taux plat ${pct(flatRate, "fr")}`, `Le moins cher`],
    rows: flatComparisonRows("fr"),
  },
  {
    type: "p",
    text: `Troisième limite, assumée aussi : notre plancher de ${eur(PRICING.floorFee, "fr")} rend les très petits dossiers proportionnellement chers — sous environ ${eur(floorBreakEven, "fr")} récupérés, le taux effectif dépasse ${pct(tier1.rate, "fr")}. Le [simulateur](${href("fr", "simulator")}) vous le montre avant d'ouvrir quoi que ce soit, et conclut parfois : « n'ouvrez pas ce dossier ».`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Notre règle de comparaison`,
    text: `Si un concurrent vous propose, par écrit, un taux inférieur sans minimum, sans frais de dossier, avec débours à prix coûtant et zéro facturation en cas d'échec : prenez-le. Nous préférons perdre un dossier que de le gagner sur un malentendu.`,
  },
  { type: "h2", text: `Comment comparer deux offres ligne à ligne ?` },
  {
    type: "ol",
    items: [
      `**Le taux est-il plat ou marginal ?** Un pourcentage plat et un barème marginal ne donnent pas du tout la même facture selon le montant — le tableau ci-dessus le prouve dans les deux sens.`,
      `**Quel est le minimum par dossier**, et s'applique-t-il aux dossiers qui échouent ?`,
      `**Existe-t-il un plafond de commission ?** Sans plafond, un gros dossier peut coûter très cher pour le même travail.`,
      `**Des frais sont-ils dus d'avance ou en cas d'échec ?** « Au succès » doit vouloir dire : rien sinon.`,
      `**Les débours** (attestations de dépositaires, visas de formulaires, traductions) **sont-ils refacturés à prix coûtant**, justificatifs à l'appui ?`,
      `**Un intermédiaire touche-t-il une rétrocession** sur votre dossier, et de combien ?`,
    ],
  },
  {
    type: "p",
    text: `Pour chiffrer le premier poste, [notre article sur le coût complet de la récupération](${articleHref("fr", COST_SLUG.fr)}) détaille la grille et quatre exemples calculés — c'est la suite logique de cette lecture. Et la [page comparatif](${href("fr", "comparison")}) met les approches côte à côte, la nôtre comprise.`,
  },
  { type: "h2", text: `Vos questions sur la transparence tarifaire` },
  {
    type: "faq",
    items: [
      {
        question: `Votre grille est-elle négociable ?`,
        answer: `Non, jusqu'à ${eur(PRICING.institutionalThreshold, "fr")} récupérés : le prix est le même pour tous, c'est le principe même d'une grille publiée. Au-delà, un devis s'impose — les volumes changent réellement la structure de coûts, et nous l'affichons plutôt que de prétendre le contraire.`,
      },
      {
        question: `Pourquoi tant de prestataires exigent-ils un appel avant de donner un chiffre ?`,
        answer: `Parce que le devis y est construit après qualification : taille du portefeuille, urgence, alternatives que vous connaissez ou non. Ce n'est pas illégitime en soi — c'est simplement défavorable à l'acheteur, qui ne peut ni comparer ni vérifier qu'un autre client paie le même prix.`,
      },
      {
        question: `Publier vos prix n'aide-t-il pas vos concurrents ?`,
        answer: `Si, probablement. Mais le client que nous cherchons est celui qui compare avant de signer — et celui-là a besoin de chiffres publics. Si notre grille pousse le secteur à publier les siennes, tout le monde y gagne, nous compris.`,
      },
      {
        question: `Êtes-vous toujours les moins chers ?`,
        answer: `Non, et le tableau ci-dessus le montre : un taux plat de ${pct(flatRate, "fr")} sans minimum serait moins cher que nous sous environ ${eur(crossoverAmount, "fr")} récupérés, et un mandat institutionnel négocié peut battre notre barème sur de gros volumes. Ce que nous garantissons, c'est que le prix affiché est le prix payé — et zéro en cas d'échec.`,
      },
      {
        question: `Où trouver l'intégralité de vos tarifs ?`,
        answer: `Sur la page tarifs : barème marginal, forfaits fixes, abonnement Suivi & Alertes (${eur(PRICING.subscription.monthly, "fr")} par mois ou ${eur(PRICING.subscription.yearly, "fr")} par an et par portefeuille) — et dans « comment nous sommes payés », qui explique aussi la rétrocession partenaire de ${pct(PRICING.partnerRevShare, "fr")}.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "pricing",
    label: `Comparer notre grille ligne à ligne`,
    note: `Barème complet, forfaits et exemples calculés — aucun chiffre ne manque.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Try to find the price of a withholding tax recovery service: in the vast majority of cases you will find a contact form and the promise of a quote. That silence has precise causes — volume-negotiated pricing, fear of comparison, the habits of a market built for institutions — and it has a cost for you. We make the opposite bet: our grid is published in full, from the marginal scale (${pct(tier1.rate, "en")} down to ${pct(tier4.rate, "en")} by tranche) all the way to the revenue share paid to our partners (${pct(PRICING.partnerRevShare, "en")} of the fee we collect). Including what does not flatter us: there are cases where we are not the cheapest, and this article shows you which ones.`,
  },
  {
    type: "p",
    text: `Marcus Sheridan calls it "ostrich marketing": head firmly in the sand. Price is every buyer's first question — removing it from your website does not make it disappear, it merely sends the visitor off to ask it somewhere else. If you are reading this after combing through three providers' sites without finding a single figure, you know exactly what we mean. Let's look at why this industry stays silent, what that opacity costs you, and how to compare offers line by line — ours included.`,
  },
  { type: "h2", text: `Why don't recovery providers publish their prices?` },
  {
    type: "p",
    text: `Three reasons come up, from the most defensible to the least avowable.`,
  },
  { type: "h3", text: `Reason 1: prices genuinely negotiated on volume` },
  {
    type: "p",
    text: `The bulk of the recovery market was built for institutions: funds, custodian banks, family offices. At that scale every mandate is negotiated — volumes, countries covered, custody chain, exclusivity — and publishing a single price would contradict every signed contract. It is a real reason… which has nothing to do with an individual holding a few thousand euros of over-withheld tax: they will never access those negotiated terms, yet inherit the same smokescreen.`,
  },
  { type: "h3", text: `Reason 2: fear of comparison` },
  {
    type: "p",
    text: `A published price is a comparable price. As long as everyone prices behind closed doors, no comparison table is possible and every firm can call itself "competitive" without ever proving it. Transparency turns an opaque service into a comparable offer — which is precisely what the least competitive players dread.`,
  },
  { type: "h3", text: `Reason 3: charging what each client will bear` },
  {
    type: "p",
    text: `The mandatory discovery call is not just a sales ritual: it is an audit of your ability to pay. Portfolio size, deadline pressure, ignorance of the alternatives — every piece of information given before the quote can adjust the quote. When the price arrives after qualification, it is no longer a price: it is an estimate of your consent.`,
  },
  { type: "h2", text: `What pricing opacity costs the buyer` },
  {
    type: "ul",
    items: [
      `**Time:** several calls, chasers and exchanges to obtain figures two web pages could have provided.`,
      `**Anchoring without a reference:** the first quote you receive becomes your benchmark — even though it was built precisely without competition.`,
      `**An asymmetry premium:** the party who knows the market's prices when you don't will charge you that information gap.`,
      `**Calendar pressure:** while you collect quotes, the clock runs — [only ${ca.sol.years} years in Canada](${countryHref("en", ca.slug.en)}) from the end of the calendar year of withholding.`,
      `**No profitability check possible:** without a price, there is no way to know whether a [Swiss claim](${countryHref("en", ch.slug.en)}) worth a few hundred euros deserves to be outsourced — or not.`,
    ],
  },
  { type: "h2", text: `Our reverse bet: publish everything, even what works against us` },
  {
    type: "p",
    text: `Our complete grid is online: the marginal scale by tranche, the ${eur(PRICING.floorFee, "en")} floor, the ${eur(PRICING.capFee, "en")} cap, fixed-fee services, the subscription, disbursements at cost — down to the ${pct(PRICING.partnerRevShare, "en")} revenue share paid to the advisers who refer us, a line almost nobody discloses. The full figures live on [the pricing page](${href("en", "pricing")}) and the full reasoning in [how we get paid](${href("en", "howWeGetPaid")}).`,
  },
  {
    type: "table",
    caption: `What you know before signing — a comparison of principle. Data reviewed in June 2026.`,
    headers: [`The question that matters`, `At FiscalPlace`, `At a provider with no public grid`],
    rows: [
      [
        `The exact rate applied to your claim`,
        `Published: marginal scale from ${pct(tier1.rate, "en")} to ${pct(tier4.rate, "en")}`,
        `Disclosed after a call, sometimes after a signed mandate`,
      ],
      [`The minimum per claim`, `${eur(PRICING.floorFee, "en")} — published`, `Must be asked for explicitly`],
      [`The fee cap`, `${eur(PRICING.capFee, "en")} — published`, `Rarely offered`],
      [`The cost on failure`, `Zero (excluding third-party disbursements at cost)`, `Variable — get it in writing`],
      [`Disbursements (confirmations, stamps…)`, `Passed on at cost, receipts provided`, `Sometimes marked up`],
      [
        `The referral fee (revenue share)`,
        `Published: ${pct(PRICING.partnerRevShare, "en")} of the fee collected`,
        `Almost never revealed`,
      ],
    ],
  },
  { type: "h2", text: `The honest limits of our model (yes, sometimes we cost more)` },
  {
    type: "p",
    text: `A published grid is the same for everyone: that is its strength, and its limit. A family office negotiating an institutional mandate on volume will sometimes get better terms than our scale — that is true, and we would rather write it here than let you discover it elsewhere. Above ${eur(PRICING.institutionalThreshold, "en")} recovered we ourselves switch to bespoke quotes: at that scale, tailoring is legitimate, and we simply display where it starts.`,
  },
  {
    type: "p",
    text: `Second limit, with numbers: against a hypothetical competitor charging a flat ${pct(flatRate, "en")} with no minimum and no side fees, our marginal scale is more expensive up to roughly ${eur(crossoverAmount, "en")} recovered. Beyond that it regains the advantage — and the ${eur(PRICING.capFee, "en")} cap widens the gap. The proof:`,
  },
  {
    type: "table",
    caption: `Illustrative comparison with a hypothetical flat ${pct(flatRate, "en")} fee, no minimum, no side fees. Break-even around ${eur(crossoverAmount, "en")} recovered. Data reviewed in June 2026.`,
    headers: [`Amount recovered`, `Our grid (marginal)`, `Flat ${pct(flatRate, "en")}`, `Cheaper option`],
    rows: flatComparisonRows("en"),
  },
  {
    type: "p",
    text: `Third limit, owned as well: our ${eur(PRICING.floorFee, "en")} floor makes very small claims proportionally expensive — under roughly ${eur(floorBreakEven, "en")} recovered, the effective rate exceeds ${pct(tier1.rate, "en")}. The [simulator](${href("en", "simulator")}) shows you this before anything is opened, and sometimes concludes: "don't open this claim".`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Our comparison rule`,
    text: `If a competitor offers you, in writing, a lower rate with no minimum, no file fees, disbursements at cost and zero billing on failure: take it. We would rather lose a claim than win it on a misunderstanding.`,
  },
  { type: "h2", text: `How do you compare two offers line by line?` },
  {
    type: "ol",
    items: [
      `**Is the rate flat or marginal?** A flat percentage and a marginal scale produce very different invoices depending on the amount — the table above proves it in both directions.`,
      `**What is the minimum per claim**, and does it apply to claims that fail?`,
      `**Is there a fee cap?** Without one, a large claim can cost a great deal for the same work.`,
      `**Are any fees due upfront or on failure?** "Success-based" must mean: nothing otherwise.`,
      `**Are disbursements** (custodian confirmations, form certifications, translations) **passed on at cost**, receipts attached?`,
      `**Does an intermediary earn a referral fee** on your claim, and how much?`,
    ],
  },
  {
    type: "p",
    text: `To put numbers on the first item, [our article on the full cost of recovery](${articleHref("en", COST_SLUG.en)}) details the grid with four worked examples — the natural next read after this one. And the [comparison page](${href("en", "comparison")}) puts the approaches side by side, ours included.`,
  },
  { type: "h2", text: `Your questions about pricing transparency` },
  {
    type: "faq",
    items: [
      {
        question: `Is your grid negotiable?`,
        answer: `No, up to ${eur(PRICING.institutionalThreshold, "en")} recovered: the price is the same for everyone — that is the whole point of a published grid. Above that, a quote is warranted: volumes genuinely change the cost structure, and we display it rather than pretend otherwise.`,
      },
      {
        question: `Why do so many providers require a call before giving any figure?`,
        answer: `Because the quote there is built after qualification: portfolio size, urgency, which alternatives you know about. It is not illegitimate as such — it is simply unfavourable to the buyer, who can neither compare nor verify that another client pays the same price.`,
      },
      {
        question: `Doesn't publishing your prices help your competitors?`,
        answer: `Probably, yes. But the client we want is the one who compares before signing — and that client needs public figures. If our grid pushes the industry to publish theirs, everyone wins, us included.`,
      },
      {
        question: `Are you always the cheapest?`,
        answer: `No, and the table above shows it: a flat ${pct(flatRate, "en")} with no minimum would undercut us below roughly ${eur(crossoverAmount, "en")} recovered, and a negotiated institutional mandate can beat our scale on large volumes. What we do guarantee is that the displayed price is the paid price — and zero on failure.`,
      },
      {
        question: `Where can I find all of your prices?`,
        answer: `On the pricing page: the marginal scale, fixed-fee services, the Monitoring & Alerts subscription (${eur(PRICING.subscription.monthly, "en")} per month or ${eur(PRICING.subscription.yearly, "en")} per year, per portfolio) — and in "how we get paid", which also explains the ${pct(PRICING.partnerRevShare, "en")} partner revenue share.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "pricing",
    label: `Compare our grid line by line`,
    note: `Full scale, fixed fees and worked examples — no figure is missing.`,
  },
];

export const whyNoPublicPricing: Article = {
  id: "why-no-public-pricing",
  slug: {
    fr: "pourquoi-les-prestataires-cachent-leurs-tarifs",
    en: "why-providers-hide-their-pricing",
  },
  category: "cost",
  title: {
    fr: "Pourquoi certains prestataires ne publient jamais leurs tarifs (et pourquoi nous, si)",
    en: "Why some providers never publish their pricing (and why we do)",
  },
  description: {
    fr: "L'« ostrich marketing » appliqué à la récupération de retenue à la source : les vraies raisons de l'opacité tarifaire, ce qu'elle coûte à l'acheteur, notre pari de la grille publiée — et ses limites assumées, chiffres à l'appui.",
    en: "Ostrich marketing applied to withholding tax recovery: the real reasons behind pricing opacity, what it costs the buyer, our published-grid bet — and its openly owned limits, numbers included.",
  },
  updated: "2026-06-28",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["CH", "CA"],
};
