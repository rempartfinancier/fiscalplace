import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { brokerTaxHandlingCompared } from "./broker-tax-handling-compared";
import { bestCountriesFrenchResident } from "./best-countries-french-resident";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "French broker (IFU) vs foreign broker: who really makes
 * declaring foreign dividends easier?" Distinct from broker-tax-handling-
 * compared.ts, which covers withholding-at-source mechanics (W-8BEN relief,
 * French PFNL, custody) — this article covers the declaration paperwork
 * itself: who transmits an IFU to the DGFiP, who leaves the investor to
 * self-calculate via form 2047. Mechanism verified this session by web
 * search (multiple corroborating sources: rotek.fr, fiafter40.com,
 * dim-mathinnov.fr, investisseurs-heureux.fr forum): French-regulated
 * brokers transmit an IFU pre-filling box 2AB of form 2042; foreign brokers
 * (Interactive Brokers, DEGIRO, Trade Republic) do not, leaving the investor
 * to self-declare via form 2047 (new box 8PL for 2026) then box 8VL. Trade
 * Republic's French IBAN (since January 2025) exempts only the account-
 * existence declaration (form 3916), not the dividend declaration itself —
 * confirmed nuance, not present in most consumer-facing guides found. The
 * foreign tax credit is capped at the treaty rate regardless of route
 * (confirmed by web search): the excess above that rate is never settled by
 * either the IFU or the 2047/8VL route — it requires a direct claim with the
 * foreign tax authority, which is the site's actual business, kept distinct
 * from the declaration topic covered here.
 */

const de = getCountryById("DE")!;

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/* Worked German example: 1,000 € of gross German dividends via any broker. */
const DE_GROSS = 1_000;
const deWithheld = DE_GROSS * de.statutoryRate;
const deOwed = DE_GROSS * treatyRateFor(de, "FR");
const deExcess = deWithheld - deOwed;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `« Avec mon courtier français, je n'ai rien à faire. » C'est vrai — mais seulement pour une partie du sujet. Le fait qu'un courtier vous simplifie (ou non) la **déclaration** de vos dividendes étrangers ne dit rien de la manière dont il gère la **retenue** elle-même à la source : ce sont deux questions distinctes, [déjà traitée séparément ici](${articleHref("fr", brokerTaxHandlingCompared.slug.fr)}). Celle-ci porte uniquement sur la paperasse : qui informe le fisc français à votre place, et qui vous laisse le faire vous-même.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Deux sujets, pas un seul`,
    text: `« Simplifier la déclaration » et « récupérer un trop-perçu » sont deux choses différentes. Un courtier peut très bien remplir votre déclaration et vous laisser malgré tout de l'argent sur la table à l'étranger — la fin de cet article explique pourquoi.`,
  },
  { type: "h2", text: `Le courtier français : l'IFU fait le travail à votre place` },
  {
    type: "p",
    text: `Un courtier ou une banque agréé(e) en France (Bourse Direct, Boursorama, Fortuneo, BNP…) est tenu de vous adresser chaque année un Imprimé Fiscal Unique (IFU, formulaire 2561), transmis à l'administration fiscale avant la mi-février. Cet IFU recense vos dividendes bruts, la retenue étrangère supportée et le crédit d'impôt conventionnel calculé pour vous — reporté automatiquement en case 2AB de votre déclaration 2042. Concrètement : vous n'ouvrez ni le formulaire 2047, ni les cases dédiées aux revenus étrangers ; vous vérifiez seulement que le montant pré-rempli correspond bien à votre IFU.`,
  },
  { type: "h2", text: `Le courtier étranger : aucun IFU transmis au fisc français` },
  {
    type: "p",
    text: `Interactive Brokers, DEGIRO ou Trade Republic ne transmettent aucun IFU à la DGFiP — ce n'est pas un oubli, c'est une conséquence de leur statut d'établissement non agréé en France. Chacun fournit un document, mais à usage interne uniquement : Interactive Brokers propose un « Activity Statement » annuel téléchargeable depuis l'espace client, DEGIRO un relevé annuel émis par son entité dépositaire (flatexDEGIRO Bank AG), Trade Republic un rapport fiscal annuel. Aucun de ces documents ne remplace l'IFU : c'est à vous de reconstituer, ligne par ligne et pays par pays, les dividendes bruts perçus et l'impôt retenu à l'étranger.`,
  },
  {
    type: "p",
    text: `Cette reconstitution passe par le formulaire 2047 (revenus de source étrangère), section dividendes. La déclaration 2026 introduit une nouvelle case, 8PL, qui centralise le montant net des revenus étrangers ouvrant droit à crédit d'impôt et permet à l'administration d'en calculer le plafond ; le crédit lui-même se reporte ensuite en case 8VL du formulaire 2042 — l'équivalent, pour un courtier étranger, de ce que la case 2AB fait automatiquement pour un courtier français. **À vérifier chaque année sur impots.gouv.fr** : la numérotation exacte des cases peut évoluer d'un millésime à l'autre.`,
  },
  { type: "h3", text: `Trade Republic et l'IBAN français : ce que l'exemption ne couvre pas` },
  {
    type: "callout",
    tone: "warning",
    title: `Une exemption réelle, mais partielle`,
    text: `Depuis janvier 2025, Trade Republic attribue un IBAN français à ses nouveaux clients, ce qui dispense de déclarer le compte lui-même via le formulaire 3916 (les anciens clients avec un IBAN allemand y restent soumis, sous peine d'une amende forfaitaire de 1 500 € par compte non déclaré). Mais cet IBAN français ne change rien à la nature de l'établissement : Trade Republic Bank GmbH reste une banque agréée en Allemagne, qui ne transmet toujours pas d'IFU au fisc français. L'IBAN français simplifie une obligation (l'existence du compte) et laisse entière l'autre (la déclaration des dividendes eux-mêmes, via le 2047).`,
  },
  { type: "h2", text: `Le vrai risque du DIY : l'oubli plus que le calcul` },
  {
    type: "p",
    text: `Le calcul en lui-même n'a rien de complexe une fois qu'on a le relevé sous les yeux. Le risque, chez les investisseurs multi-courtiers ou multi-pays, c'est d'oublier une ligne : un dividende suisse perçu chez un courtier étranger, encaissé mentalement comme « déjà géré » parce que le même portefeuille contient aussi des titres logés chez un courtier français avec IFU. Les deux flux ne suivent pas le même circuit, et seul l'un des deux est pré-rempli.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Ce que chaque configuration transmet au fisc français — comparaison de la charge déclarative, pas de la qualité d'exécution du courtier.`,
    headers: [`Configuration`, `IFU transmis à la DGFiP`, `Compte à déclarer (3916)`, `Dividendes à saisir vous-même (2047 / 8PL / 8VL)`],
    rows: [
      [`Courtier français agréé`, `Oui, avant mi-février`, `Non`, `Non — pré-rempli en case 2AB`],
      [`Interactive Brokers`, `Non`, `Oui`, `Oui, à partir de l'Activity Statement`],
      [`DEGIRO`, `Non`, `Oui`, `Oui, à partir du relevé annuel`],
      [`Trade Republic (IBAN allemand)`, `Non`, `Oui`, `Oui, à partir du rapport fiscal`],
      [`Trade Republic (IBAN français, depuis 2025)`, `Non`, `Non`, `Oui, à partir du rapport fiscal`],
    ],
  },
  { type: "h2", text: `Ce que ni l'IFU ni le formulaire 2047 ne récupèrent jamais` },
  {
    type: "p",
    text: `Que le crédit d'impôt soit pré-rempli par un courtier français ou saisi à la main via le 2047, il est plafonné dans les deux cas au **taux conventionnel** — celui que la convention fiscale bilatérale autorise le pays source à retenir sur un résident de France. Si le taux réellement appliqué dépasse ce plafond, ce qui arrive régulièrement (Allemagne, Suisse, Canada…), l'excédent n'apparaît dans aucune des deux cases : ni 2AB, ni 8VL. Il n'est tout simplement pas traité par la déclaration de revenus française, quel que soit le courtier.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu en Allemagne (${pct(de.statutoryRate, "fr")})`,
    withheldAmount: eur(deWithheld, "fr"),
    owedLabel: `Crédit d'impôt plafonné au taux conventionnel (${pct(treatyRateFor(de, "FR"), "fr")})`,
    owedAmount: eur(deOwed, "fr"),
    treatyRef: `Convention franco-allemande`,
    recoverLabel: `Excédent absent de toute déclaration française`,
    recoverAmount: eur(deExcess, "fr"),
    footnote: `Exemple pour ${eur(DE_GROSS, "fr")} de dividendes allemands bruts, chez n'importe quel courtier — montants indicatifs, données revues mi-2026. Cet excédent se réclame uniquement auprès de l'administration fiscale allemande, jamais via l'IFU ni le 2047.`,
  },
  {
    type: "p",
    text: `C'est là que la comparaison de cet article rejoint [le classement des pays par écart récupérable](${articleHref("fr", bestCountriesFrenchResident.slug.fr)}) : la facilité de déclaration et le montant récupérable sont deux axes indépendants. Un courtier français à l'IFU impeccable ne vous dit jamais que vous avez un trop-perçu allemand ou suisse qui dort — ce n'est simplement pas son rôle.`,
  },
  { type: "h2", text: `Vos questions sur l'IFU et la déclaration des dividendes étrangers` },
  {
    type: "faq",
    items: [
      {
        question: `Mon courtier français a bien rempli mon IFU : dois-je quand même ouvrir le formulaire 2047 ?`,
        answer: `Non, dans le cas standard. Si tous vos dividendes étrangers transitent par un courtier agréé en France, l'IFU couvre l'ensemble et le 2047 n'a pas d'utilité pour ces revenus. Le 2047 redevient nécessaire dès qu'une seule ligne provient d'un courtier qui n'émet pas d'IFU.`,
      },
      {
        question: `L'IBAN français de Trade Republic me dispense-t-il de toute déclaration ?`,
        answer: `Non — il dispense uniquement du formulaire 3916 (déclaration de l'existence du compte). La déclaration des dividendes eux-mêmes via le 2047 reste due, Trade Republic Bank GmbH restant un établissement allemand qui ne transmet pas d'IFU à la DGFiP.`,
      },
      {
        question: `Que risque-t-on à oublier une ligne de dividende étranger sur le 2047 ?`,
        answer: `Un revenu non déclaré reste un revenu non déclaré, avec les conséquences fiscales habituelles en cas de contrôle (majoration, intérêts de retard) — indépendamment de la question du trop-perçu traitée par ce site. Ce n'est jamais un motif pour renoncer à réclamer un excédent : ce sont deux démarches distinctes.`,
      },
      {
        question: `Un courtier français protège-t-il aussi contre la retenue excédentaire à l'étranger ?`,
        answer: `Non. L'IFU calcule un crédit d'impôt plafonné au taux conventionnel ; il ne renseigne jamais sur un éventuel excédent au-delà de ce taux, qui reste à réclamer directement auprès de l'administration fiscale du pays source.`,
      },
      {
        question: `Comment vérifier que mon courtier a bien calculé la case 2AB ?`,
        answer: `Comparez le montant pré-rempli au détail ligne par ligne fourni en annexe de l'IFU (dividende brut, pays, retenue supportée) : le crédit doit correspondre au taux conventionnel du pays concerné, pas au taux statutaire plein. Un écart n'est pas nécessairement une erreur du courtier — c'est souvent le signe d'un excédent qui, précisément, échappe à la déclaration française.`,
      },
    ],
  },
  {
    type: "p",
    text: `Rien dans cet article ne remplace le service d'un professionnel pour votre déclaration de revenus : il n'a d'autre objectif que d'expliquer qui fait quoi entre votre courtier et vous. Pour la partie que ni l'IFU ni le 2047 ne couvrent — l'excédent retenu au-delà du taux conventionnel — [le simulateur](${href("fr", "simulator")}) évalue gratuitement ce qui reste à réclamer, courtier français ou non.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculer mon trop-perçu`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `"With my French broker, I don't have to do anything." True — but only for part of the story. Whether a broker makes **declaring** your foreign dividends easier says nothing about how it handles the **withholding** itself: those are two separate questions, [already covered separately here](${articleHref("en", brokerTaxHandlingCompared.slug.en)}). This one is only about the paperwork: who tells the French tax authority on your behalf, and who leaves you to do it yourself.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Two topics, not one`,
    text: `"Making the declaration easier" and "recovering an over-withholding" are two different things. A broker can fill in your tax return perfectly and still leave money sitting abroad — the end of this article explains why.`,
  },
  { type: "h2", text: `The French broker: the IFU does the work for you` },
  {
    type: "p",
    text: `A broker or bank regulated in France (Bourse Direct, Boursorama, Fortuneo, BNP…) must send you an annual tax summary (IFU, form 2561), transmitted to the tax authority before mid-February. This IFU lists your gross dividends, the foreign withholding you bore, and the treaty tax credit calculated for you — carried automatically into box 2AB of your form 2042. In practice: you never open form 2047, nor the boxes dedicated to foreign income; you just check that the pre-filled amount matches your IFU.`,
  },
  { type: "h2", text: `The foreign broker: no IFU reaches the French tax authority` },
  {
    type: "p",
    text: `Interactive Brokers, DEGIRO and Trade Republic transmit no IFU to the DGFiP — not an oversight, but a consequence of not being regulated in France. Each provides a document, but for internal reference only: Interactive Brokers offers an annual Activity Statement downloadable from the client area, DEGIRO an annual statement issued by its custodian entity (flatexDEGIRO Bank AG), Trade Republic an annual tax report. None of these replaces an IFU: it is up to you to rebuild, line by line and country by country, the gross dividends received and the foreign tax withheld.`,
  },
  {
    type: "p",
    text: `That rebuild goes through form 2047 (foreign-source income), dividends section. The 2026 filing season introduces a new box, 8PL, which centralizes the net amount of foreign income eligible for a tax credit and lets the authority compute its ceiling; the credit itself then carries over to box 8VL of form 2042 — the manual equivalent, for a foreign broker, of what box 2AB does automatically for a French one. **Check the exact box numbers on impots.gouv.fr each year**: they can change from one filing season to the next.`,
  },
  { type: "h3", text: `Trade Republic and the French IBAN: what the exemption doesn't cover` },
  {
    type: "callout",
    tone: "warning",
    title: `A real exemption, but a partial one`,
    text: `Since January 2025, Trade Republic issues a French IBAN to new customers, which exempts them from declaring the account itself via form 3916 (customers still on a German IBAN remain subject to it, under a flat €1,500 fine per undeclared account). But the French IBAN changes nothing about the entity behind it: Trade Republic Bank GmbH remains a bank regulated in Germany, and still transmits no IFU to the French tax authority. The French IBAN simplifies one obligation (the account's existence) and leaves the other one — declaring the dividends themselves, via form 2047 — entirely untouched.`,
  },
  { type: "h2", text: `The real DIY risk: forgetting, not calculating` },
  {
    type: "p",
    text: `The calculation itself isn't complex once you have the statement in front of you. For investors spread across several brokers or countries, the risk is forgetting a line: a Swiss dividend received through a foreign broker, mentally filed as "already handled" because the same portfolio also holds shares at a French broker with a proper IFU. The two income streams don't follow the same path, and only one of them comes pre-filled.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `What each setup transmits to the French tax authority — a comparison of declarative burden, not of broker execution quality.`,
    headers: [`Setup`, `IFU sent to the DGFiP`, `Account to declare (form 3916)`, `Dividends to self-report (2047 / 8PL / 8VL)`],
    rows: [
      [`French-regulated broker`, `Yes, before mid-February`, `No`, `No — pre-filled in box 2AB`],
      [`Interactive Brokers`, `No`, `Yes`, `Yes, from the Activity Statement`],
      [`DEGIRO`, `No`, `Yes`, `Yes, from the annual statement`],
      [`Trade Republic (German IBAN)`, `No`, `Yes`, `Yes, from the tax report`],
      [`Trade Republic (French IBAN, since 2025)`, `No`, `No`, `Yes, from the tax report`],
    ],
  },
  { type: "h2", text: `What neither the IFU nor form 2047 ever recovers` },
  {
    type: "p",
    text: `Whether the tax credit is pre-filled by a French broker or entered by hand via form 2047, it is capped in both cases at the **treaty rate** — the rate the bilateral tax treaty allows the source country to withhold from a French resident. When the rate actually applied exceeds that cap, which happens regularly (Germany, Switzerland, Canada…), the excess shows up in neither box: not 2AB, not 8VL. It simply isn't handled by the French income tax return, whichever broker you use.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld in Germany (${pct(de.statutoryRate, "en")})`,
    withheldAmount: eur(deWithheld, "en"),
    owedLabel: `Tax credit capped at the treaty rate (${pct(treatyRateFor(de, "FR"), "en")})`,
    owedAmount: eur(deOwed, "en"),
    treatyRef: `France–Germany treaty`,
    recoverLabel: `Excess absent from any French tax return`,
    recoverAmount: eur(deExcess, "en"),
    footnote: `Example for ${eur(DE_GROSS, "en")} of gross German dividends, at any broker — indicative amounts, data reviewed in mid-2026. This excess can only be claimed from the German tax authority, never via the IFU or form 2047.`,
  },
  {
    type: "p",
    text: `This is where this article's comparison meets [the ranking of countries by recoverable gap](${articleHref("en", bestCountriesFrenchResident.slug.en)}): how easy a broker makes declaring, and how much you have left to recover abroad, are two independent axes. A French broker with a flawless IFU never tells you that you have a dormant German or Swiss over-withholding — that's simply not its job.`,
  },
  { type: "h2", text: `Your questions about the IFU and declaring foreign dividends` },
  {
    type: "faq",
    items: [
      {
        question: `My French broker filled in my IFU correctly: do I still need to open form 2047?`,
        answer: `No, in the standard case. If all your foreign dividends flow through a France-regulated broker, the IFU covers all of it and form 2047 serves no purpose for that income. Form 2047 becomes necessary again as soon as a single line comes from a broker that doesn't issue an IFU.`,
      },
      {
        question: `Does Trade Republic's French IBAN exempt me from every declaration?`,
        answer: `No — it only exempts you from form 3916 (declaring that the account exists). Declaring the dividends themselves via form 2047 remains required, since Trade Republic Bank GmbH is still a German entity that transmits no IFU to the DGFiP.`,
      },
      {
        question: `What's the risk of forgetting a foreign dividend line on form 2047?`,
        answer: `Undeclared income is undeclared income, with the usual tax consequences if audited (surcharge, late-payment interest) — separate from the over-withholding question this site addresses. It's never a reason to give up on claiming an excess: they're two distinct processes.`,
      },
      {
        question: `Does a French broker also protect against excess withholding abroad?`,
        answer: `No. The IFU calculates a tax credit capped at the treaty rate; it never flags any excess above that rate, which still has to be claimed directly from the source country's tax authority.`,
      },
      {
        question: `How do I check my broker calculated box 2AB correctly?`,
        answer: `Compare the pre-filled amount against the line-by-line detail attached to your IFU (gross dividend, country, withholding borne): the credit should match the treaty rate for that country, not the full statutory rate. A gap isn't necessarily a broker error — it's often the sign of an excess that, precisely, the French return doesn't cover.`,
      },
    ],
  },
  {
    type: "p",
    text: `Nothing here replaces a professional for your actual tax return: this article's only goal is to explain who does what between you and your broker. For the part neither the IFU nor form 2047 covers — the excess withheld above the treaty rate — [the simulator](${href("en", "simulator")}) estimates, free of charge, what's left to claim, French broker or not.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculate my refund`,
  },
];

export const ifuVsForeignBrokerDeclaration: Article = {
  id: "ifu-vs-foreign-broker-declaration",
  slug: {
    fr: "ifu-courtier-francais-vs-courtier-etranger-declaration",
    en: "ifu-vs-foreign-broker-dividend-declaration",
  },
  category: "comparisons",
  title: {
    fr: `Courtier français avec IFU ou courtier étranger : qui simplifie vraiment la déclaration de vos dividendes étrangers ?`,
    en: `French broker with an IFU or foreign broker: who really makes declaring your foreign dividends easier?`,
  },
  description: {
    fr: `IFU automatique en case 2AB d'un côté, formulaire 2047 et case 8VL à remplir soi-même de l'autre — et un plafond au taux conventionnel que ni l'un ni l'autre ne dépasse jamais. Ce que Interactive Brokers, DEGIRO et Trade Republic transmettent vraiment au fisc français, et ce qu'ils ne transmettent pas.`,
    en: `An automatic IFU in box 2AB on one side, form 2047 and a self-filled box 8VL on the other — and a treaty-rate cap that neither route ever crosses. What Interactive Brokers, DEGIRO and Trade Republic actually send the French tax authority, and what they don't.`,
  },
  updated: "2026-08-28",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["DE"],
};
