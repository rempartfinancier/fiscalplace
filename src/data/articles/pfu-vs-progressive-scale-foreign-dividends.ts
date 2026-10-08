import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref } from "@/lib/routes";
import { getCountryById, treatyRateFor, recoveryGap } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — flat tax (PFU) vs. progressive scale (box 2OP) for foreign
 * dividends, prompted by a verified 2026 news item: article 126 of the 2026
 * finance act (amending CGI art. 200 A, 2) removes the irrevocable nature of
 * the 2OP option from 2026 income onward (2027 filing), so it can now be
 * revisited a posteriori within the ordinary claim period — see
 * https://www.vademecum-patrimoine.com/2026/04/23/loi-de-finances-pour-2026-loption-pour-le-bareme-progressif-nest-plus-irrevocable/
 * and https://www.louvrebanqueprivee.fr/banque-privee/public/web/pa_27677/bareme-progressif-vs-pfu-l-option-pour-le-bareme-case-2-op-devient-revocable
 * (the option remains annual and global, for all PFU-scope income).
 * Swiss figures (35% statutory / 15% treaty) come from @/data/countries.
 * French-side figures are general French tax mechanics not covered by that
 * file: PFU 2026 = 12.8% income tax + 18.6% social levies (LFSS 2026, same
 * constants and sourcing as `us-dividends-withholding-tax-myth`), 40%
 * allowance under the progressive scale (CGI art. 158, 3-2°), 6.8% deductible
 * CSG under the scale only — all cross-checked by web search on 2026-10-08.
 * The treaty tax credit is capped at the French income tax "corresponding" to
 * the dividend; under the progressive scale that amount depends on the whole
 * household's tax position (BOFiP: average-rate proration), so this article
 * deliberately uses labelled hypotheses rather than computing it per bracket.
 * Distinct from `pea-vs-cto-foreign-dividends` (wrapper choice, not the
 * filing option) and `us-dividends-withholding-tax-myth` (PFU-only math) —
 * both cited, neither modified.
 */

const ch = getCountryById("CH")!;
const chTreaty = treatyRateFor(ch, "FR");

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/** French PFU 2026 split — general French tax mechanics, not a @/data/countries figure. */
const FR_PFU_INCOME_TAX_RATE = 0.128;
const FR_PFU_SOCIAL_LEVIES_RATE_2026 = 0.186;
/** Progressive-scale specifics — general French tax mechanics. */
const FR_SCALE_DIVIDEND_ALLOWANCE = 0.4;
const FR_DEDUCTIBLE_CSG_RATE = 0.068;

const GROSS = 1_000;
const chWithheld = GROSS * ch.statutoryRate;
const chTreatyAmount = GROSS * chTreaty;
const chRecoverable = GROSS * recoveryGap(ch, "FR");

const pfuIncomeTax = GROSS * FR_PFU_INCOME_TAX_RATE;
const pfuCreditUsed = Math.min(chTreatyAmount, pfuIncomeTax);
const pfuCreditLost = chTreatyAmount - pfuCreditUsed;

/**
 * Hypothetical French income tax "corresponding" to the dividend under the
 * progressive scale. Labelled as hypotheses in the copy: the real figure
 * depends on the whole household (income, family quotient), not on this
 * dividend alone.
 */
const SCALE_HYPOTHESES = [0, 90, 200] as const;
const scaleRows = SCALE_HYPOTHESES.map((frTax) => {
  const used = Math.min(chTreatyAmount, frTax);
  return { frTax, used, lost: chTreatyAmount - used };
});

const RELATED = {
  peaVsCto: { fr: "pea-ou-compte-titres-dividendes-etrangers", en: "pea-vs-brokerage-account-foreign-dividends" },
  usMyth: { fr: "mythe-retenue-source-dividendes-americains", en: "us-dividends-withholding-tax-myth" },
  forms: { fr: "formulaires-remboursement-par-pays", en: "refund-forms-by-country" },
  missedDeadline: { fr: "delai-de-prescription-depasse-que-faire", en: "missed-the-statute-of-limitations-what-now" },
} as const;

const LF2026_SOURCE_URL =
  "https://www.vademecum-patrimoine.com/2026/04/23/loi-de-finances-pour-2026-loption-pour-le-bareme-progressif-nest-plus-irrevocable/";

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Chaque printemps, la même case revient dans la déclaration de revenus : **2OP**, l'option pour le barème progressif à la place du prélèvement forfaitaire unique (PFU). Pour qui perçoit des dividendes étrangers, la question est plus subtile qu'ailleurs, parce que l'option change aussi le sort du crédit d'impôt lié à la retenue à la source. Et depuis la loi de finances pour 2026, l'enjeu a changé de nature : l'option n'est plus irrévocable. Ce qui n'a pas changé, en revanche, c'est ce que ni le PFU ni le barème ne savent faire — et c'est précisément là que se cache l'argent qui vous revient.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ce n'est ni un conseil fiscal personnalisé ni une recommandation d'investissement : FiscalPlace ne vous dit pas quelle case cocher. Le bon choix dépend de l'ensemble des revenus de votre foyer — le simulateur officiel d'impots.gouv.fr ou un professionnel du conseil fiscal restent les bons outils pour le trancher. Cet article explique le mécanisme, en particulier sur les dividendes étrangers.`,
  },
  { type: "h2", text: `Ce qui change en 2026 : l'option 2OP devient révocable` },
  {
    type: "p",
    text: `Jusqu'aux revenus 2025, cocher la case 2OP était définitif : une fois la déclaration validée, impossible de revenir au PFU, même par réclamation ou lors d'un contrôle. L'article 126 de la loi de finances pour 2026, qui modifie l'article 200 A du Code général des impôts, supprime ce caractère irrévocable ([analyse détaillée](${LF2026_SOURCE_URL})). Concrètement, à partir des revenus perçus en 2026 (déclarés au printemps 2027), vous pouvez revenir sur votre choix a posteriori, dans le délai de réclamation de droit commun — en règle générale jusqu'au 31 décembre de la deuxième année suivant la mise en recouvrement, à confirmer selon votre situation. L'irrévocabilité est maintenue pour les revenus 2025.`,
  },
  {
    type: "p",
    text: `Deux règles demeurent : l'option est **annuelle** (elle se reconsidère chaque année) et **globale** — elle s'applique à l'ensemble des revenus entrant dans le champ du PFU (dividendes français et étrangers, intérêts, plus-values de cession de titres). Impossible de soumettre vos seuls dividendes étrangers au barème et de garder le PFU pour le reste.`,
  },
  { type: "h2", text: `PFU ou barème : ce qui change pour un dividende étranger` },
  {
    type: "table",
    caption: `Les deux régimes appliqués à un dividende étranger (revenus 2026). Mécanismes généraux de la fiscalité française, hors cas particuliers.`,
    headers: [``, `PFU (par défaut)`, `Barème progressif (case 2OP)`],
    rows: [
      [
        `Impôt sur le revenu`,
        `${pct(FR_PFU_INCOME_TAX_RATE, "fr")} du dividende brut`,
        `Barème du foyer, après abattement de ${pct(FR_SCALE_DIVIDEND_ALLOWANCE, "fr")} (sociétés de l'UE ou d'un État lié à la France par une convention fiscale)`,
      ],
      [
        `Prélèvements sociaux`,
        `${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "fr")}`,
        `${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "fr")}, dont ${pct(FR_DEDUCTIBLE_CSG_RATE, "fr")} de CSG déductible l'année suivante`,
      ],
      [
        `Plafond du crédit d'impôt conventionnel`,
        `${pct(FR_PFU_INCOME_TAX_RATE, "fr")} du brut — fixe`,
        `L'impôt français correspondant au dividende — variable selon le foyer`,
      ],
      [
        `Trop-perçu au-delà du taux conventionnel`,
        `Non traité`,
        `Non traité`,
      ],
    ],
  },
  { type: "h2", text: `Le crédit d'impôt : un plafond qui se déplace, jamais au-delà du taux conventionnel` },
  {
    type: "p",
    text: `La retenue étrangère ouvre droit, en France, à un crédit d'impôt égal à l'impôt étranger **au taux conventionnel** — ${pct(chTreaty, "fr")} pour un dividende suisse versé à un résident de France — mais plafonné à l'impôt sur le revenu français correspondant à ce même dividende. Il ne s'impute jamais sur les prélèvements sociaux, et l'excédent non imputé est perdu, sans report ni remboursement.`,
  },
  {
    type: "p",
    text: `Sous le PFU, ce plafond est simple : ${pct(FR_PFU_INCOME_TAX_RATE, "fr")} du brut. Sur ${eur(GROSS, "fr")} de dividendes suisses, le crédit s'impute à hauteur de ${eur(pfuCreditUsed, "fr")} et ${eur(pfuCreditLost, "fr")} sont perdus. Sous le barème, le plafond devient l'impôt français effectivement attribuable au dividende, calculé à partir de la situation de tout le foyer : il peut être nul (foyer non imposable), inférieur ou supérieur au plafond du PFU. Le tableau ci-dessous l'illustre avec trois **hypothèses** de montant, pas des calculs par tranche :`,
  },
  {
    type: "table",
    caption: `${eur(GROSS, "fr")} de dividendes suisses bruts, retenue au taux conventionnel (${eur(chTreatyAmount, "fr")}). Les montants d'impôt français sous barème sont des hypothèses illustratives.`,
    headers: [`Régime`, `Impôt français correspondant au dividende`, `Crédit d'impôt imputé`, `Crédit perdu`],
    rows: [
      [`PFU`, eur(pfuIncomeTax, "fr"), eur(pfuCreditUsed, "fr"), eur(pfuCreditLost, "fr")],
      ...scaleRows.map((r, i) => [
        `Barème — hypothèse ${i + 1}`,
        eur(r.frTax, "fr"),
        eur(r.used, "fr"),
        eur(r.lost, "fr"),
      ]),
    ],
  },
  {
    type: "p",
    text: `La lecture est double. D'un côté, l'option 2OP peut effectivement « sauver » une partie du crédit perdu sous le PFU — quand l'impôt français attribuable au dividende dépasse ${eur(pfuIncomeTax, "fr")}. De l'autre, un foyer peu ou pas imposé perd davantage de crédit sous le barème, ce qui ne signifie pas qu'il paie plus au total : le crédit perdu reflète simplement un impôt français plus faible. Dans aucun des cas le crédit ne dépasse ${eur(chTreatyAmount, "fr")} — le taux conventionnel est un plafond absolu, quelle que soit la case cochée.`,
  },
  {
    type: "p",
    text: `Le même mécanisme vaut pour tous les pays : seuls les taux changent. Le calcul complet sous PFU pour un dividende américain est détaillé dans [notre article sur la retenue américaine](${articleHref("fr", RELATED.usMyth.fr)}) ; pour des titres logés en PEA, où la retenue étrangère n'ouvre droit à aucun crédit d'impôt, voir [notre comparatif PEA vs compte-titres](${articleHref("fr", RELATED.peaVsCto.fr)}).`,
  },
  { type: "h2", text: `Ce qu'aucune des deux options ne récupère : le trop-perçu à la source` },
  {
    type: "p",
    text: `La Suisse ne retient pas ${pct(chTreaty, "fr")} mais ${pct(ch.statutoryRate, "fr")} sur les dividendes versés à un non-résident, sans réduction à la source possible pour un particulier. Les ${pct(recoveryGap(ch, "FR"), "fr")} d'écart ne figurent dans aucune case de votre déclaration française : ni le PFU, ni le barème, ni l'option désormais révocable ne les prennent en compte. Ils ne reviennent que par une demande de remboursement adressée à l'administration fiscale suisse, dans son propre délai de prescription.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu en Suisse (${pct(ch.statutoryRate, "fr")})`,
    withheldAmount: eur(chWithheld, "fr"),
    owedLabel: `Taux conventionnel résident FR (${pct(chTreaty, "fr")})`,
    owedAmount: eur(chTreatyAmount, "fr"),
    treatyRef: `Convention France–Suisse`,
    recoverLabel: `À réclamer auprès de l'${ch.authority.fr} — ${ch.refundForm.fr}`,
    recoverAmount: eur(chRecoverable, "fr"),
    footnote: `Sur ${eur(GROSS, "fr")} de dividendes suisses bruts. Ce montant est identique sous PFU et sous barème : la case 2OP n'y change rien. Délai : ${ch.sol.notes.fr} Montants indicatifs, données revues mi-2026.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Deux délais qui ne se confondent pas`,
    text: `La révocabilité de l'option 2OP joue dans le délai de réclamation **français**. La récupération du trop-perçu suisse obéit au délai de prescription **suisse**, qui court indépendamment. Rouvrir votre déclaration française pour changer d'option ne prolonge ni ne suspend le délai étranger — si celui-ci est dépassé, [voici ce qui reste possible](${articleHref("fr", RELATED.missedDeadline.fr)}).`,
  },
  { type: "h2", text: `En pratique : l'ordre des opérations` },
  {
    type: "ol",
    items: [
      `**Identifier le trop-perçu à la source**, ligne par ligne : tout taux retenu supérieur au taux conventionnel (Suisse, Allemagne, Danemark, États-Unis sans W-8BEN…) est une écriture à solder auprès du pays source, pas dans votre déclaration française. [Les formulaires par pays sont recensés ici](${articleHref("fr", RELATED.forms.fr)}).`,
      `**Déclarer le crédit d'impôt au taux conventionnel**, jamais au taux réellement retenu — c'est vrai sous PFU comme sous barème.`,
      `**Comparer PFU et barème pour l'ensemble du foyer**, avec le simulateur officiel, en sachant que le choix peut désormais être revu pour les revenus 2026 et suivants.`,
    ],
  },
  { type: "h2", text: `Vos questions sur l'option 2OP et les dividendes étrangers` },
  {
    type: "faq",
    items: [
      {
        question: `L'option pour le barème est-elle vraiment révocable pour ma déclaration de 2026 ?`,
        answer: `Non : la déclaration déposée au printemps 2026 porte sur les revenus 2025, pour lesquels l'irrévocabilité est maintenue. La révocabilité s'applique à partir des revenus perçus en 2026, déclarés en 2027.`,
      },
      {
        question: `Puis-je choisir le barème uniquement pour mes dividendes étrangers ?`,
        answer: `Non. L'option est globale : elle s'applique à tous vos revenus et plus-values entrant dans le champ du PFU pour l'année concernée.`,
      },
      {
        question: `Le barème me permet-il de récupérer la totalité de la retenue étrangère ?`,
        answer: `Non. Au mieux, il permet d'imputer l'intégralité du crédit d'impôt au taux conventionnel (${pct(chTreaty, "fr")} pour la Suisse). La part retenue au-delà de ce taux — ${pct(recoveryGap(ch, "FR"), "fr")} pour un dividende suisse — ne se récupère qu'auprès de l'administration du pays source.`,
      },
      {
        question: `L'abattement de ${pct(FR_SCALE_DIVIDEND_ALLOWANCE, "fr")} s'applique-t-il aux dividendes étrangers ?`,
        answer: `Oui, sous le barème, pour les dividendes de sociétés établies dans l'UE ou dans un État ayant conclu avec la France une convention fiscale d'assistance administrative, distribués dans des conditions régulières. Il ne joue que sur l'impôt sur le revenu, pas sur les prélèvements sociaux.`,
      },
      {
        question: `Et si mes dividendes étrangers sont dans un PEA ?`,
        answer: `L'option 2OP ne concerne pas les dividendes perçus et conservés dans un PEA, et la retenue étrangère n'y ouvre droit à aucun crédit d'impôt. Le sujet est détaillé dans notre comparatif PEA vs compte-titres.`,
      },
      {
        question: `Pour mes dividendes américains, l'analyse est-elle la même ?`,
        answer: `Le mécanisme du crédit d'impôt est identique ; seuls les taux changent. Le calcul complet sous PFU est détaillé dans notre article sur la retenue américaine, cité plus haut.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Estimer mon trop-perçu à la source`,
    note: `Le simulateur chiffre ce que ni le PFU ni le barème ne récupèrent : l'écart entre le taux retenu et le taux conventionnel, pays par pays.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Every spring, the same box shows up on the French tax return: **2OP**, the option to be taxed at the progressive income-tax scale instead of the flat tax (PFU). For anyone receiving foreign dividends, the choice is subtler than usual, because it also changes what happens to the tax credit generated by foreign withholding. And since the 2026 finance act, the stakes have shifted: the option is no longer irrevocable. What hasn't changed is what neither the flat tax nor the scale can do — and that's exactly where the money owed back to you sits.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is neither personalized tax advice nor an investment recommendation: FiscalPlace won't tell you which box to tick. The right choice depends on your whole household's income — the official impots.gouv.fr simulator or a tax professional are the right tools to decide. This article explains the mechanism, specifically for foreign dividends.`,
  },
  { type: "h2", text: `What changes in 2026: the 2OP option becomes revocable` },
  {
    type: "p",
    text: `Up to 2025 income, ticking box 2OP was final: once the return was filed, there was no going back to the flat tax, not even through a claim or during an audit. Article 126 of the 2026 finance act, amending Article 200 A of the French tax code, removes that irrevocability ([detailed analysis, in French](${LF2026_SOURCE_URL})). In practice, from income received in 2026 (filed in spring 2027), you can reverse your choice after the fact, within the ordinary claim period — generally until 31 December of the second year following assessment, to be confirmed for your own situation. Irrevocability still applies to 2025 income.`,
  },
  {
    type: "p",
    text: `Two rules remain: the option is **annual** (reconsidered every year) and **global** — it covers all income within the flat tax's scope (French and foreign dividends, interest, capital gains on securities). You can't put only your foreign dividends on the scale and keep the flat tax for everything else.`,
  },
  { type: "h2", text: `Flat tax vs. progressive scale: what changes for a foreign dividend` },
  {
    type: "table",
    caption: `Both regimes applied to a foreign dividend (2026 income). General French tax mechanics, special cases aside.`,
    headers: [``, `Flat tax (default)`, `Progressive scale (box 2OP)`],
    rows: [
      [
        `Income tax`,
        `${pct(FR_PFU_INCOME_TAX_RATE, "en")} of the gross dividend`,
        `Household scale, after a ${pct(FR_SCALE_DIVIDEND_ALLOWANCE, "en")} allowance (companies in the EU or a country with a tax treaty with France)`,
      ],
      [
        `Social levies`,
        `${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "en")}`,
        `${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "en")}, of which ${pct(FR_DEDUCTIBLE_CSG_RATE, "en")} CSG is deductible the following year`,
      ],
      [
        `Treaty tax credit cap`,
        `${pct(FR_PFU_INCOME_TAX_RATE, "en")} of gross — fixed`,
        `French tax attributable to the dividend — varies by household`,
      ],
      [
        `Over-withholding above the treaty rate`,
        `Not handled`,
        `Not handled`,
      ],
    ],
  },
  { type: "h2", text: `The tax credit: a cap that moves, but never past the treaty rate` },
  {
    type: "p",
    text: `Foreign withholding gives you a French tax credit equal to the foreign tax **at the treaty rate** — ${pct(chTreaty, "en")} for a Swiss dividend paid to a French resident — capped at the French income tax attributable to that same dividend. It never offsets social levies, and any unused excess is lost, with no carryforward or refund.`,
  },
  {
    type: "p",
    text: `Under the flat tax, the cap is simple: ${pct(FR_PFU_INCOME_TAX_RATE, "en")} of gross. On ${eur(GROSS, "en")} of Swiss dividends, ${eur(pfuCreditUsed, "en")} of credit is used and ${eur(pfuCreditLost, "en")} is lost. Under the scale, the cap becomes the French tax actually attributable to the dividend, computed from the whole household's position: it can be zero (non-taxable household), lower or higher than the flat-tax cap. The table below illustrates this with three **hypothetical** amounts, not bracket-by-bracket calculations:`,
  },
  {
    type: "table",
    caption: `${eur(GROSS, "en")} of gross Swiss dividends, withholding at the treaty rate (${eur(chTreatyAmount, "en")}). French tax amounts under the scale are illustrative hypotheses.`,
    headers: [`Regime`, `French tax attributable to the dividend`, `Credit used`, `Credit lost`],
    rows: [
      [`Flat tax`, eur(pfuIncomeTax, "en"), eur(pfuCreditUsed, "en"), eur(pfuCreditLost, "en")],
      ...scaleRows.map((r, i) => [
        `Scale — hypothesis ${i + 1}`,
        eur(r.frTax, "en"),
        eur(r.used, "en"),
        eur(r.lost, "en"),
      ]),
    ],
  },
  {
    type: "p",
    text: `Two takeaways. On one hand, opting for the scale can indeed "save" part of the credit lost under the flat tax — when the French tax attributable to the dividend exceeds ${eur(pfuIncomeTax, "en")}. On the other, a lightly taxed or non-taxable household loses more credit under the scale, which doesn't mean it pays more overall: the lost credit simply mirrors a lower French tax. In no case does the credit exceed ${eur(chTreatyAmount, "en")} — the treaty rate is a hard ceiling, whichever box you tick.`,
  },
  {
    type: "p",
    text: `The same mechanism applies to every country; only the rates change. The full flat-tax math for a US dividend is laid out in [our article on US withholding](${articleHref("en", RELATED.usMyth.en)}); for securities held in a PEA, where foreign withholding generates no tax credit at all, see [our PEA vs. brokerage account comparison](${articleHref("en", RELATED.peaVsCto.en)}).`,
  },
  { type: "h2", text: `What neither option recovers: over-withholding at source` },
  {
    type: "p",
    text: `Switzerland doesn't withhold ${pct(chTreaty, "en")} but ${pct(ch.statutoryRate, "en")} on dividends paid to non-residents, with no relief at source available to individuals. The ${pct(recoveryGap(ch, "FR"), "en")} gap appears in no box of your French return: neither the flat tax, nor the scale, nor the now-revocable option takes it into account. It only comes back through a refund claim filed with the Swiss tax authority, within its own statute of limitations.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld in Switzerland (${pct(ch.statutoryRate, "en")})`,
    withheldAmount: eur(chWithheld, "en"),
    owedLabel: `Treaty rate for an FR resident (${pct(chTreaty, "en")})`,
    owedAmount: eur(chTreatyAmount, "en"),
    treatyRef: `France–Switzerland treaty`,
    recoverLabel: `To claim from the ${ch.authority.en} — ${ch.refundForm.en}`,
    recoverAmount: eur(chRecoverable, "en"),
    footnote: `On ${eur(GROSS, "en")} of gross Swiss dividends. This amount is identical under the flat tax and the scale: box 2OP changes nothing here. Deadline: ${ch.sol.notes.en} Indicative amounts, data reviewed mid-2026.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Two deadlines that don't overlap`,
    text: `The 2OP option's revocability runs within the **French** claim period. Recovering the Swiss over-withholding follows the **Swiss** statute of limitations, which runs independently. Reopening your French return to switch options neither extends nor pauses the foreign deadline — if it has passed, [here's what's still possible](${articleHref("en", RELATED.missedDeadline.en)}).`,
  },
  { type: "h2", text: `In practice: the order of operations` },
  {
    type: "ol",
    items: [
      `**Identify over-withholding at source**, line by line: any rate withheld above the treaty rate (Switzerland, Germany, Denmark, the US without a W-8BEN…) is an entry to settle with the source country, not on your French return. [Refund forms by country are listed here](${articleHref("en", RELATED.forms.en)}).`,
      `**Claim the tax credit at the treaty rate**, never at the rate actually withheld — under the flat tax and the scale alike.`,
      `**Compare flat tax and scale for the whole household**, with the official simulator, knowing the choice can now be revisited for 2026 income onward.`,
    ],
  },
  { type: "h2", text: `Your questions on box 2OP and foreign dividends` },
  {
    type: "faq",
    items: [
      {
        question: `Is the progressive-scale option really revocable for the return I filed in 2026?`,
        answer: `No: the return filed in spring 2026 covers 2025 income, for which irrevocability still applies. Revocability applies from income received in 2026, filed in 2027.`,
      },
      {
        question: `Can I choose the scale for my foreign dividends only?`,
        answer: `No. The option is global: it applies to all your income and gains within the flat tax's scope for the year concerned.`,
      },
      {
        question: `Does the scale let me recover all of the foreign withholding?`,
        answer: `No. At best, it lets you use the full tax credit at the treaty rate (${pct(chTreaty, "en")} for Switzerland). Whatever was withheld above that rate — ${pct(recoveryGap(ch, "FR"), "en")} on a Swiss dividend — can only be recovered from the source country's tax authority.`,
      },
      {
        question: `Does the ${pct(FR_SCALE_DIVIDEND_ALLOWANCE, "en")} allowance apply to foreign dividends?`,
        answer: `Yes, under the scale, for dividends from companies established in the EU or in a country that has signed a tax treaty with France providing for administrative assistance, distributed under regular conditions. It only reduces income tax, not social levies.`,
      },
      {
        question: `What if my foreign dividends sit in a PEA?`,
        answer: `Box 2OP doesn't cover dividends received and kept within a PEA, and foreign withholding there gives rise to no tax credit at all. The topic is covered in our PEA vs. brokerage account comparison.`,
      },
      {
        question: `Is the analysis the same for my US dividends?`,
        answer: `The tax credit mechanism is identical; only the rates differ. The full flat-tax math is laid out in our article on US withholding, linked above.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Estimate my over-withholding`,
    note: `The simulator quantifies what neither the flat tax nor the scale recovers: the gap between the rate withheld and the treaty rate, country by country.`,
  },
];

export const pfuVsProgressiveScaleForeignDividends: Article = {
  id: "pfu-vs-progressive-scale-foreign-dividends",
  slug: {
    fr: "pfu-ou-bareme-case-2op-dividendes-etrangers",
    en: "flat-tax-vs-progressive-scale-foreign-dividends",
  },
  category: "comparisons",
  title: {
    fr: `PFU ou barème (case 2OP) pour vos dividendes étrangers : ce que l'option, désormais révocable, change vraiment`,
    en: `Flat tax or progressive scale (box 2OP) for foreign dividends: what the now-revocable option really changes`,
  },
  description: {
    fr: `Depuis la loi de finances 2026, l'option pour le barème n'est plus irrévocable. Ce qu'elle change au crédit d'impôt sur vos dividendes étrangers — et le trop-perçu à la source qu'elle ne récupère jamais.`,
    en: `Since the 2026 finance act, opting for the progressive scale is no longer irrevocable. What it changes to the tax credit on your foreign dividends — and the over-withholding at source it never recovers.`,
  },
  updated: "2026-10-08",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["CH", "US"],
};
