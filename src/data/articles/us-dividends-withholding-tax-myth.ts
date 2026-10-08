import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref } from "@/lib/routes";
import { getCountryById, treatyRateFor, recoveryGap } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * REVIEWS — "US dividends aren't worth it because of withholding tax": takes
 * a stance against this recurring claim with the full math (treaty rate +
 * French tax credit + recovery), per docs/content-calendar.md backlog item 6.
 * US-side figures (30% statutory / 15% treaty) come from @/data/countries.
 * French-side figures are general French tax mechanics not covered by that
 * file (which only models foreign-country data): PFU 2026 = 12.8% income tax
 * + 18.6% social levies, verified by web search against the LFSS 2026 (social
 * security financing act adopted 16 Dec. 2025, raising social levies on
 * capital income from 17.2% to 18.6% from income received in 2026) — see
 * https://www.quechoisir.org/actualite-hausse-de-la-csg-vos-revenus-sont-ils-concernes-n173786/.
 * The foreign tax credit for treaty dividends offsets only the income-tax
 * slice (12.8%), never the social levies, and is capped there with no
 * carryforward of any unused excess — confirmed by cross-checked web search
 * (multiple independent French tax-practice sources, consistent on this
 * point) rather than found in any single primary source retrieved. Distinct
 * from `pea-vs-cto-foreign-dividends` (same credit mechanism, but framed
 * around the PEA/CTO wrapper choice for EU-domiciled dividends) and from
 * `us-reit-firpta-trap` (a different, non-treaty-reducible US withholding
 * that this article does not touch) — both cited, neither modified.
 */

const us = getCountryById("US")!;
const usTreaty = treatyRateFor(us, "FR");

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/** French PFU 2026 split — general French tax mechanics, not a @/data/countries figure. */
const FR_PFU_INCOME_TAX_RATE = 0.128;
const FR_PFU_SOCIAL_LEVIES_RATE_2026 = 0.186;

const GROSS = 1_000;
const usWithheldNoW8ben = GROSS * us.statutoryRate;
const usWithheldTreaty = GROSS * usTreaty;
const usRecoverableGap = GROSS * recoveryGap(us, "FR");

const frIncomeTax = GROSS * FR_PFU_INCOME_TAX_RATE;
const frSocialLevies = GROSS * FR_PFU_SOCIAL_LEVIES_RATE_2026;
const creditUsed = Math.min(usWithheldTreaty, frIncomeTax);
const creditLost = usWithheldTreaty - creditUsed;
const totalTaxUsDividend = usWithheldTreaty + frSocialLevies;
const netUsDividend = GROSS - totalTaxUsDividend;
const totalTaxFrDividend = frIncomeTax + frSocialLevies;
const netFrDividend = GROSS - totalTaxFrDividend;

const CSG_SOURCE_URL =
  "https://www.quechoisir.org/actualite-hausse-de-la-csg-vos-revenus-sont-ils-concernes-n173786/";

const PEA_VS_CTO_SLUG = {
  fr: "pea-ou-compte-titres-dividendes-etrangers",
  en: "pea-vs-brokerage-account-foreign-dividends",
} as const;
const W8BEN_SLUG = { fr: "w-8ben-mode-demploi", en: "w-8ben-explained" } as const;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `« Les actions américaines, avec la retenue à la source, ça ne vaut pas le coup » — l'idée circule depuis des années sur les forums d'investisseurs, et elle revient en force depuis l'annonce de la hausse de la CSG sur les revenus du capital en 2026. Le raisonnement paraît de bon sens : une retenue à l'étranger, puis un impôt français par-dessus, ça sonne comme une double peine. Le calcul complet raconte une histoire différente — pas une bonne affaire non plus, mais pas la catastrophe qu'on décrit.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Ce que cet article n'est pas`,
    text: `Ceci n'est ni un conseil en investissement ni une recommandation d'acheter ou d'éviter les actions américaines : FiscalPlace ne fournit pas de conseil financier personnalisé. C'est un chiffrage d'un mécanisme fiscal souvent mal compris, pour remplacer une intuition par un calcul.`,
  },
  { type: "h2", text: `Le raisonnement qu'on vous sert sur les forums` },
  {
    type: "p",
    text: `La version courte de l'idée reçue additionne les taux sans regarder le mécanisme : « ${pct(us.statutoryRate, "fr")} retenus aux États-Unis, puis encore l'impôt français dessus — vous perdez près de la moitié ». Une version plus récente ajoute la hausse de la CSG de 2026 à l'équation, comme si elle aggravait spécifiquement le sort des dividendes américains. Les deux versions ignorent le même élément : le crédit d'impôt français, qui existe précisément pour éviter la double imposition — mais qui ne joue pas exactement comme on l'imagine.`,
  },
  { type: "h2", text: `Ce qui est vrai : la retenue tombe à ${pct(usTreaty, "fr")} avec un W-8BEN valide` },
  {
    type: "p",
    text: `Premier correctif : le taux de ${pct(us.statutoryRate, "fr")} n'est que le taux de droit commun, appliqué à un non-résident qui n'a rien signalé. Un [formulaire W-8BEN](${articleHref("fr", W8BEN_SLUG.fr)}) valide déposé chez votre courtier ramène la retenue à ${pct(usTreaty, "fr")} directement à la source (« relief at source ») : c'est le taux plafond que la convention fiscale franco-américaine autorise pour un résident de France, et il s'applique dès le versement, sans démarche de récupération à engager. Le vrai piège n'est pas la retenue elle-même, mais son absence de renouvellement : un W-8BEN expire à la fin de la 3e année civile suivant sa signature, et un renouvellement oublié fait rebasculer silencieusement au taux plein.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu aux États-Unis, W-8BEN absent ou expiré (${pct(us.statutoryRate, "fr")})`,
    withheldAmount: eur(usWithheldNoW8ben, "fr"),
    owedLabel: `Taux conventionnel résident FR (${pct(usTreaty, "fr")})`,
    owedAmount: eur(usWithheldTreaty, "fr"),
    treatyRef: `Convention France–États-Unis, art. 10`,
    recoverLabel: `Écart récupérable auprès de l'IRS (formulaire 1040-NR)`,
    recoverAmount: eur(usRecoverableGap, "fr"),
    footnote: `Sur ${eur(GROSS, "fr")} de dividendes américains bruts. Ce cas — celui où un dossier FiscalPlace s'applique réellement — ne se produit qu'en l'absence de W-8BEN valide au moment du versement. Une fois le formulaire en place, il n'y a plus rien à réclamer sur cette tranche. Montants indicatifs, données revues mi-2026.`,
  },
  { type: "h2", text: `Le vrai calcul, W-8BEN valide : où passe chaque euro` },
  {
    type: "p",
    text: `C'est ici que le raisonnement des forums se trompe. La retenue américaine de ${pct(usTreaty, "fr")} ouvre droit à un crédit d'impôt français — mais ce crédit ne s'impute que sur la part impôt sur le revenu du prélèvement forfaitaire unique (${pct(FR_PFU_INCOME_TAX_RATE, "fr")} en 2026), jamais sur les prélèvements sociaux (${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "fr")} en 2026, contre ${pct(0.172, "fr")} avant la hausse de la LFSS 2026). Sur ${eur(GROSS, "fr")} de dividendes bruts, le détail :`,
  },
  {
    type: "table",
    caption: `Dividende américain (W-8BEN valide) comparé à un dividende de source française équivalent, sur ${eur(GROSS, "fr")} bruts.`,
    headers: [``, `Dividende de source française`, `Dividende américain (W-8BEN valide)`],
    rows: [
      [
        `Retenue au pays source`,
        `— (pas de retenue sur soi-même)`,
        `${eur(usWithheldTreaty, "fr")} (taux conventionnel de ${pct(usTreaty, "fr")})`,
      ],
      [
        `Impôt sur le revenu français (${pct(FR_PFU_INCOME_TAX_RATE, "fr")})`,
        eur(frIncomeTax, "fr"),
        `${eur(frIncomeTax, "fr")} intégralement neutralisés par le crédit d'impôt`,
      ],
      [
        `Prélèvements sociaux français (${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "fr")})`,
        eur(frSocialLevies, "fr"),
        `${eur(frSocialLevies, "fr")} (le crédit d'impôt ne les couvre jamais)`,
      ],
      [`Total prélevé`, eur(totalTaxFrDividend, "fr"), eur(totalTaxUsDividend, "fr")],
      [`Reste net pour vous`, eur(netFrDividend, "fr"), eur(netUsDividend, "fr")],
    ],
  },
  {
    type: "p",
    text: `L'écart réel entre les deux colonnes est de ${eur(creditLost, "fr")} pour ${eur(GROSS, "fr")} de dividendes bruts — soit ${pct(creditLost / GROSS, "fr")} du montant brut, pas ${pct(us.statutoryRate, "fr")} et pas « la moitié qui disparaît ». Il s'explique intégralement par un seul mécanisme : le crédit d'impôt de ${eur(usWithheldTreaty, "fr")} ne peut s'imputer qu'à hauteur de l'impôt sur le revenu français dû sur ce même dividende (${eur(frIncomeTax, "fr")}) — l'excédent de ${eur(creditLost, "fr")} est définitivement perdu, sans report possible, et les prélèvements sociaux restent dus en totalité, comme sur n'importe quel dividende. Ce n'est ni un trop-perçu réclamable, ni une double imposition au sens strict : c'est un écart structurel, modeste, qui existe parce que le taux conventionnel (${pct(usTreaty, "fr")}) dépasse le taux d'impôt sur le revenu du PFU (${pct(FR_PFU_INCOME_TAX_RATE, "fr")}).`,
  },
  {
    type: "callout",
    tone: "info",
    title: `La hausse de CSG 2026 ne cible pas spécifiquement les dividendes étrangers`,
    text: `Le passage des prélèvements sociaux de ${pct(0.172, "fr")} à ${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "fr")} ([loi de financement de la Sécurité sociale pour 2026](${CSG_SOURCE_URL}), adoptée le 16 décembre 2025), alourdit la fiscalité de tous les dividendes, français comme étrangers, de la même façon (${pct(0.014, "fr")} de plus dans les deux colonnes du tableau ci-dessus). L'écart propre aux dividendes américains — les ${eur(creditLost, "fr")} de crédit perdu — existait avant cette réforme et n'en dépend pas : il vient uniquement du plafonnement du crédit d'impôt à l'impôt sur le revenu, pas aux prélèvements sociaux.`,
  },
  { type: "h2", text: `Notre avis, sans détour` },
  {
    type: "p",
    text: `L'idée reçue confond deux choses : un vrai trop-perçu récupérable (retenue à ${pct(us.statutoryRate, "fr")} faute de W-8BEN, cas que nous traitons) et un écart structurel minime (retenue à ${pct(usTreaty, "fr")} avec W-8BEN valide, non récupérable mais de l'ordre de ${pct(creditLost / GROSS, "fr")} du dividende brut). Le second n'a rien d'une raison d'éviter les actions américaines — un investisseur qui découvre cet écart après coup découvre surtout qu'il paie à peu près le même impôt total que sur un dividende français, à quelques points près. Le vrai geste utile n'est pas d'arbitrer entre pays, mais de vérifier que votre W-8BEN est bien en place et à jour : c'est le seul endroit où la différence entre « payer le juste taux » et « payer le double » se joue réellement.`,
  },
  { type: "h2", text: `Vos questions sur la retenue à la source américaine` },
  {
    type: "faq",
    items: [
      {
        question: `Le crédit d'impôt sur mes dividendes américains couvre-t-il aussi les prélèvements sociaux ?`,
        answer: `Non. Le crédit d'impôt conventionnel ne s'impute que sur la part impôt sur le revenu du prélèvement forfaitaire unique (${pct(FR_PFU_INCOME_TAX_RATE, "fr")}) ; les prélèvements sociaux (${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "fr")} en 2026) restent dus intégralement, que le dividende soit français ou étranger.`,
      },
      {
        question: `La hausse de la CSG en 2026 rend-elle les dividendes américains encore moins intéressants que les dividendes français ?`,
        answer: `Non : la hausse de ${pct(0.014, "fr")} des prélèvements sociaux s'applique à l'identique aux dividendes français et étrangers. Elle augmente la fiscalité globale sur les deux, mais ne creuse pas l'écart spécifique entre les deux, qui vient d'un mécanisme différent (le plafonnement du crédit d'impôt à l'impôt sur le revenu).`,
      },
      {
        question: `Dois-je éviter les actions américaines à cause de la retenue à la source ?`,
        answer: `Ce n'est pas ce que dit ce calcul, et FiscalPlace ne recommande ni ne déconseille un choix d'investissement. L'écart chiffré ici (${pct(creditLost / GROSS, "fr")} du dividende brut, avec W-8BEN valide) est réel mais modeste — sans commune mesure avec l'idée d'une « double imposition » qui effacerait la moitié du rendement.`,
      },
      {
        question: `Que se passe-t-il si mon W-8BEN a expiré sans que je m'en rende compte ?`,
        answer: `La retenue rebascule silencieusement à ${pct(us.statutoryRate, "fr")} au prochain versement. L'écart au-delà de ${pct(usTreaty, "fr")} est un vrai trop-perçu, récupérable auprès de l'IRS — c'est le cas concret où une démarche de récupération a un sens.`,
      },
      {
        question: `Ce calcul s'applique-t-il aussi si mes actions américaines sont logées en PEA ?`,
        answer: `Un PEA classique ne peut pas détenir d'actions américaines en direct (il est réservé aux titres de l'UE/EEE) — la question ne se pose donc que pour un compte-titres ordinaire, celui utilisé dans cet article. Pour une exposition américaine via un ETF PEA-éligible, la mécanique de retenue et de crédit d'impôt diffère : voir [notre comparatif PEA vs compte-titres](${articleHref("fr", PEA_VS_CTO_SLUG.fr)}).`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "w8benChecker",
    label: `Vérifier si mon W-8BEN est valide`,
    note: `Si votre W-8BEN est absent ou expiré, le simulateur chiffre l'écart réellement récupérable auprès de l'IRS.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `"US stocks aren't worth it once you factor in withholding tax" — the claim has circulated on investor forums for years, and it's resurfacing now that the 2026 hike in French social levies on capital income has made headlines. The logic sounds reasonable: tax withheld abroad, then French tax on top, reads like double punishment. The full math tells a different story — still not a free lunch, but nowhere near the disaster usually described.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What this article is not`,
    text: `This is not investment advice, nor a recommendation to buy or avoid US stocks: FiscalPlace does not provide personalized financial advice. It's a quantification of a commonly misunderstood tax mechanism, replacing a gut feeling with an actual calculation.`,
  },
  { type: "h2", text: `The reasoning you'll find on forums` },
  {
    type: "p",
    text: `The short version of the myth simply adds up rates without looking at the mechanism: "${pct(us.statutoryRate, "en")} withheld in the US, then French tax on top of that — you lose nearly half." A newer version throws the 2026 social-levy hike into the mix, as if it specifically worsened the fate of US dividends. Both versions skip the same piece: the French foreign tax credit, which exists precisely to prevent double taxation — but doesn't work quite the way people assume.`,
  },
  { type: "h2", text: `What's true: withholding drops to ${pct(usTreaty, "en")} with a valid W-8BEN` },
  {
    type: "p",
    text: `First correction: the ${pct(us.statutoryRate, "en")} rate is only the default rate applied to a non-resident who hasn't filed anything. A valid [W-8BEN form](${articleHref("en", W8BEN_SLUG.en)}) on file with your broker cuts withholding to ${pct(usTreaty, "en")} directly at the source ("relief at source") — the cap the France-US tax treaty allows for a French resident, applied the moment the dividend is paid, with no claim to file afterward. The real trap isn't the withholding itself, it's letting the form lapse: a W-8BEN expires at the end of the third calendar year after signature, and a missed renewal silently reverts you to the full rate.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld in the US, no valid W-8BEN (${pct(us.statutoryRate, "en")})`,
    withheldAmount: eur(usWithheldNoW8ben, "en"),
    owedLabel: `Treaty rate for an FR resident (${pct(usTreaty, "en")})`,
    owedAmount: eur(usWithheldTreaty, "en"),
    treatyRef: `France–US treaty, Art. 10`,
    recoverLabel: `Gap recoverable from the IRS (Form 1040-NR)`,
    recoverAmount: eur(usRecoverableGap, "en"),
    footnote: `On ${eur(GROSS, "en")} of gross US dividends. This is the case where a FiscalPlace claim genuinely applies — it only arises when no valid W-8BEN was on file at payment time. Once the form is in place, there's nothing left to claim on this slice. Indicative amounts, data reviewed mid-2026.`,
  },
  { type: "h2", text: `The real math, valid W-8BEN: where every euro goes` },
  {
    type: "p",
    text: `This is where the forum reasoning breaks down. The ${pct(usTreaty, "en")} US withholding generates a French tax credit — but that credit only offsets the income-tax slice of the flat tax (${pct(FR_PFU_INCOME_TAX_RATE, "en")} in 2026), never the social levies (${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "en")} in 2026, up from ${pct(0.172, "en")} before the 2026 hike). On ${eur(GROSS, "en")} of gross dividends, the breakdown:`,
  },
  {
    type: "table",
    caption: `A US dividend (valid W-8BEN) compared with an equivalent French-source dividend, on ${eur(GROSS, "en")} gross.`,
    headers: [``, `French-source dividend`, `US dividend (valid W-8BEN)`],
    rows: [
      [
        `Withholding at source`,
        `— (no withholding on your own residence)`,
        `${eur(usWithheldTreaty, "en")} (${pct(usTreaty, "en")} treaty rate)`,
      ],
      [
        `French income tax (${pct(FR_PFU_INCOME_TAX_RATE, "en")})`,
        eur(frIncomeTax, "en"),
        `${eur(frIncomeTax, "en")} fully offset by the tax credit`,
      ],
      [
        `French social levies (${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "en")})`,
        eur(frSocialLevies, "en"),
        `${eur(frSocialLevies, "en")} (never covered by the tax credit)`,
      ],
      [`Total tax`, eur(totalTaxFrDividend, "en"), eur(totalTaxUsDividend, "en")],
      [`Net to you`, eur(netFrDividend, "en"), eur(netUsDividend, "en")],
    ],
  },
  {
    type: "p",
    text: `The real gap between the two columns is ${eur(creditLost, "en")} per ${eur(GROSS, "en")} of gross dividends — that is ${pct(creditLost / GROSS, "en")} of the gross amount, not ${pct(us.statutoryRate, "en")} and not "half of it disappearing." It comes down to one single mechanism: the ${eur(usWithheldTreaty, "en")} tax credit can only be used up to the French income tax actually due on that same dividend (${eur(frIncomeTax, "en")}) — the ${eur(creditLost, "en")} excess is permanently lost, with no carryforward, and social levies remain fully due, exactly as on any other dividend. This isn't a claimable over-withholding, nor double taxation in the strict sense: it's a modest, structural gap that exists because the treaty rate (${pct(usTreaty, "en")}) exceeds the flat tax's income-tax rate (${pct(FR_PFU_INCOME_TAX_RATE, "en")}).`,
  },
  {
    type: "callout",
    tone: "info",
    title: `The 2026 social-levy hike doesn't specifically target foreign dividends`,
    text: `The rise in social levies from ${pct(0.172, "en")} to ${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "en")} ([2026 social security financing act](${CSG_SOURCE_URL}), adopted 16 December 2025), raises the tax burden on all dividends, French and foreign alike, in exactly the same way (${pct(0.014, "en")} more in both columns of the table above). The gap specific to US dividends — the ${eur(creditLost, "en")} of lost credit — predates this reform and doesn't depend on it: it comes solely from the tax credit being capped at income tax, not at social levies.`,
  },
  { type: "h2", text: `Our unfiltered take` },
  {
    type: "p",
    text: `The myth conflates two different things: a genuine, recoverable over-withholding (${pct(us.statutoryRate, "en")} withheld for lack of a W-8BEN, a case we handle) and a minor structural gap (${pct(usTreaty, "en")} withheld with a valid W-8BEN, not recoverable but on the order of ${pct(creditLost / GROSS, "en")} of the gross dividend). The second is no reason to avoid US stocks — an investor who discovers this gap after the fact mostly discovers that they're paying roughly the same total tax as on a French dividend, give or take a few points. The genuinely useful move isn't picking countries — it's checking that your W-8BEN is actually in place and current: that's the one spot where the difference between "paying the right rate" and "paying double" is actually decided.`,
  },
  { type: "h2", text: `Your questions on US withholding tax` },
  {
    type: "faq",
    items: [
      {
        question: `Does the tax credit on my US dividends also cover social levies?`,
        answer: `No. The treaty tax credit only offsets the income-tax slice of the flat tax (${pct(FR_PFU_INCOME_TAX_RATE, "en")}); social levies (${pct(FR_PFU_SOCIAL_LEVIES_RATE_2026, "en")} in 2026) remain fully due whether the dividend is French or foreign.`,
      },
      {
        question: `Does the 2026 CSG hike make US dividends even worse off compared with French dividends?`,
        answer: `No: the ${pct(0.014, "en")} rise in social levies applies identically to French and foreign dividends. It raises the overall tax burden on both, but doesn't widen the specific gap between them, which comes from a different mechanism (the tax credit being capped at income tax).`,
      },
      {
        question: `Should I avoid US stocks because of withholding tax?`,
        answer: `That's not what this math says, and FiscalPlace neither recommends nor discourages an investment choice. The gap quantified here (${pct(creditLost / GROSS, "en")} of the gross dividend, with a valid W-8BEN) is real but modest — nowhere near a "double taxation" that would wipe out half the return.`,
      },
      {
        question: `What happens if my W-8BEN expired without me noticing?`,
        answer: `Withholding silently reverts to ${pct(us.statutoryRate, "en")} on the next payment. The amount above ${pct(usTreaty, "en")} is a genuine over-withholding, recoverable from the IRS — this is the concrete case where filing a claim actually makes sense.`,
      },
      {
        question: `Does this math also apply if my US shares sit in a PEA?`,
        answer: `A standard PEA cannot directly hold US shares (it's restricted to EU/EEA securities), so the question only arises for a standard brokerage account, the one used throughout this article. For US exposure via a PEA-eligible ETF, the withholding and credit mechanics differ: see [our PEA vs. brokerage account comparison](${articleHref("en", PEA_VS_CTO_SLUG.en)}).`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "w8benChecker",
    label: `Check whether my W-8BEN is valid`,
    note: `If your W-8BEN is missing or expired, the simulator quantifies the gap actually recoverable from the IRS.`,
  },
];

export const usDividendsWithholdingTaxMyth: Article = {
  id: "us-dividends-withholding-tax-myth",
  slug: {
    fr: "mythe-retenue-source-dividendes-americains",
    en: "us-dividends-withholding-tax-myth",
  },
  category: "reviews",
  title: {
    fr: `Dividendes américains : la retenue à la source les rend-elle vraiment moins intéressants ? Le calcul complet`,
    en: `US dividends and withholding tax: are they really a worse deal? The full math`,
  },
  description: {
    fr: `« Les actions américaines ne valent pas le coup à cause de la retenue à la source » : l'idée reçue ignore le crédit d'impôt français. Calcul complet avec la hausse de CSG 2026 — l'écart réel n'a rien d'une double imposition.`,
    en: `"US stocks aren't worth it because of withholding tax": the common claim ignores the French tax credit. Full math including the 2026 social-levy hike — the real gap is nothing like double taxation.`,
  },
  updated: "2026-09-05",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US"],
};
