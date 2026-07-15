import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { COUNTRIES, getCountryById, recoveryGap, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "French shares through a foreign broker: the two real
 * mechanisms". Two genuinely different things get lumped together under
 * "my foreign broker withholds tax on my French shares":
 *  1. The missing 12.8% PFNL advance payment (CGI art. 117 quater) — a
 *     domestic cash-flow issue, NOT an over-withholding, out of scope for
 *     FiscalPlace's service.
 *  2. Custody "in street name" through a US-registered entity (the
 *     Interactive Brokers LLC case, confirmed via IBKR's own partner LYNX)
 *     — a genuine, recoverable over-withholding via forms 5000/5001, and
 *     squarely IN scope.
 * Domestic mechanics are not part of the country database (not a treaty
 * rate); figures here are written directly, verified against BOFiP,
 * Légifrance and cross-checked broker/practitioner sources, flagged as
 * indicative like everywhere else on the site.
 */

const frCountry = getCountryById("FR")!;
const us = getCountryById("US")!;
const ch = getCountryById("CH")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);

/* Worked example: a street-name over-withholding case (LVMH-style, 500 € gross). */
const EXAMPLE_GROSS = 500;
const STREET_NAME_RATE = 0.28;
const exampleWithheld = EXAMPLE_GROSS * STREET_NAME_RATE;
const exampleOwed = EXAMPLE_GROSS * treatyRateFor(frCountry, "FR");
const exampleRecoverable = EXAMPLE_GROSS * (STREET_NAME_RATE - treatyRateFor(frCountry, "FR"));

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Une croyance revient souvent : « mon courtier est à l'étranger, il retient forcément quelque chose en plus sur mes actions françaises ». Ce n'est ni tout à fait vrai ni tout à fait faux — et la réponse dépend entièrement de la manière dont votre courtier détient vos titres. Deux mécanismes bien distincts se cachent derrière cette impression, et un seul des deux constitue un vrai trop-perçu récupérable. Voici les deux, vérifiés, avec comment savoir dans lequel vous êtes.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Mise à jour du 15 juillet 2026`,
    text: `Une première version de cet article affirmait qu'aucun courtier étranger n'appliquait de retenue réelle sur des actions françaises. C'était incomplet : le second mécanisme ci-dessous — la détention « au porteur » via une entité américaine chez certains courtiers, Interactive Brokers en tête — provoque bien une retenue réelle, confirmée par une documentation de courtier officielle. Nous corrigeons publiquement plutôt que de discrètement éditer : voir le détail vérifié plus bas.`,
  },
  { type: "h2", text: `Mécanisme n°1 — l'acompte de 12,8 % qui manque (pas un trop-perçu)` },
  {
    type: "p",
    text: `Depuis 2018, vos dividendes — français comme étrangers — sont soumis par défaut au prélèvement forfaitaire unique (PFU, la « flat tax ») : 12,8 % au titre de l'impôt sur le revenu, plus 17,2 % de prélèvements sociaux, soit 30 % au total (chiffres généraux, à confirmer selon votre situation lors de votre déclaration). L'article 117 quater du Code général des impôts oblige l'établissement payeur **établi en France** à prélever automatiquement la composante de 12,8 % dès le versement, sous forme d'acompte non libératoire (le « PFNL ») — un prépaiement, imputé ensuite sur votre impôt réellement dû.`,
  },
  {
    type: "p",
    text: `Un courtier établi hors de France n'est en règle générale pas soumis à cette obligation (sauf cas particuliers : établissement dans l'UE/EEE lié à la France par un accord d'assistance administrative, au-delà de certains seuils de revenu fiscal de référence). Conséquence : vous encaissez le dividende brut sans que rien ne soit mis de côté, et vous devrez la totalité de l'impôt d'un coup au solde de votre déclaration, généralement l'été suivant.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `C'est l'inverse d'un trop-perçu`,
    text: `Rien n'a été prélevé en trop ici — c'est le contraire : rien n'a été mis de côté pour un impôt qui reste dû en totalité. Un piège de trésorerie à anticiper (mettez de côté environ 30 % de chaque dividende français brut), pas un trop-perçu à réclamer. Ce mécanisme se déclare en formulaire 2047 (revenus de source française encaissés à l'étranger) puis case 2DC du formulaire 2042 — et case 2CK si un acompte a malgré tout été prélevé. Vérifiez le millésime exact des cases sur impots.gouv.fr, elles peuvent changer d'une année sur l'autre.`,
  },
  { type: "h2", text: `Mécanisme n°2 — la détention « au porteur » chez un courtier américain (un vrai trop-perçu)` },
  {
    type: "p",
    text: `C'est très probablement ce que vous observez si votre relevé montre une ligne « withholding tax » explicite sur un dividende **français** — LVMH, Total, Sanofi… Certains courtiers, Interactive Brokers en tête, détiennent les titres de leurs clients « au porteur » (**street name**) : c'est une entité américaine du groupe (Interactive Brokers LLC) qui est l'actionnaire enregistré auprès du dépositaire français, pas vous. Vu depuis la France, le versement part vers un actionnaire américain — pas vers un résident fiscal français — et c'est la retenue de droit commun applicable à une **personne morale non résidente** qui s'applique : ${pct(0.3, "fr")} de base, ramenée par la pratique observée à environ ${pct(STREET_NAME_RATE, "fr")} (chiffre couramment cité depuis 2020, à vérifier sur votre relevé annuel — il peut varier selon les arrangements propres à chaque courtier).`,
  },
  {
    type: "p",
    text: `Le point clé : ce taux ne reflète en rien votre statut réel de résident fiscal français. Il reflète uniquement la nationalité de l'entité enregistrée comme détenteur dans la chaîne de dépositaires — exactement le même problème de chaîne de compte omnibus que ${(() => "cet article")()} décrit pour les dividendes étrangers, mais appliqué ici à vos propres actions françaises.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenue observée chez un courtier « au porteur » (${pct(STREET_NAME_RATE, "fr")})`,
    withheldAmount: eur(-exampleWithheld, "fr"),
    owedLabel: `Retenue due par un résident fiscal français (${pct(treatyRateFor(frCountry, "FR"), "fr")})`,
    owedAmount: eur(-exampleOwed, "fr"),
    treatyRef: `Formulaires 5000 + 5001`,
    recoverLabel: `Trop-perçu récupérable`,
    recoverAmount: eur(exampleRecoverable, "fr"),
    footnote: `Exemple illustratif pour ${eur(EXAMPLE_GROSS, "fr")} de dividende français brut détenu « au porteur » — taux observé indicatif, à vérifier sur votre propre relevé.`,
  },
  {
    type: "p",
    text: `**Ceci est un vrai trop-perçu, et il se récupère** — via les mêmes formulaires 5000 et 5001 qu'un non-résident étranger utiliserait normalement, puisque c'est administrativement ainsi que la France voit la situation. Certains courtiers proposent de faciliter la démarche moyennant des frais par ligne ; à défaut, le dépôt se fait directement auprès de l'administration française, attestation de résidence fiscale à l'appui.`,
  },
  { type: "h2", text: `Comment savoir dans lequel vous êtes` },
  {
    type: "ul",
    items: [
      `**Regardez votre relevé annuel ou votre Activity Statement.** S'il existe une section « Withholding Tax » ou « Retenue à la source » qui mentionne explicitement une ligne française (LVMH, TotalEnergies, Sanofi…) avec un montant prélevé, vous êtes dans le mécanisme n°2 — un vrai trop-perçu.`,
      `**Si le dividende français apparaît en brut, sans aucune ligne de retenue associée**, vous êtes dans le mécanisme n°1 — rien à récupérer, mais l'impôt reste dû à la déclaration.`,
      `**Le mode de détention dépend du courtier, pas de vous.** Certains courtiers européens détiennent les titres français directement ou via une chaîne qui préserve votre statut de résident ; d'autres, notamment ceux adossés à une entité américaine, détiennent « au porteur ». Le [lecteur de relevé](${href("fr", "statementReader")}) aide à relire une ligne ambiguë : collez-la, il retrouve brut et retenue.`,
    ],
  },
  { type: "h2", text: `L'autre obligation qu'on oublie : le formulaire 3916` },
  {
    type: "p",
    text: `Distinct de la question des dividendes : tout résident fiscal français qui détient un compte auprès d'un établissement dont le siège est hors de France doit le déclarer chaque année via le **formulaire 3916 / 3916-bis** (article 1649 A du CGI) — dès l'ouverture du compte, même vide ou inactif. L'absence de déclaration expose en règle générale à une amende de **1 500 € par compte non déclaré et par année**, portée à **10 000 €** pour un compte situé dans un État non coopératif, avec un délai de reprise étendu à 10 ans.`,
  },
  { type: "h2", text: `Et vos actions étrangères, dans tout ça ?` },
  {
    type: "p",
    text: `Indépendant des deux mécanismes ci-dessus : si vous détenez, via ce même courtier, des actions [américaines](${countryHref("fr", us.slug.fr)}), [suisses](${countryHref("fr", ch.slug.fr)}) ou d'un des ${COUNTRIES.length - 1} autres pays sources couverts par ce site, la retenue de ces pays s'applique selon leurs propres règles — c'est le cœur du reste de ce site, et le [simulateur](${href("fr", "simulator")}) chiffre ce trop-perçu-là gratuitement.`,
  },
  { type: "h2", text: `Vos questions sur les actions françaises via un courtier étranger` },
  {
    type: "faq",
    items: [
      {
        question: `FiscalPlace peut-il m'aider à récupérer cette retenue « au porteur » ?`,
        answer: `Oui, pour le mécanisme n°2 (détention au porteur, retenue réelle observée sur le relevé) : c'est exactement le type de trop-perçu que nous traitons, avec les formulaires 5000/5001 déjà dans notre base pour la France. Chiffrez-le sur le [simulateur](${href("fr", "simulator")}?country=FR) en indiquant la France comme pays source. Pour le mécanisme n°1 (acompte manquant, rien à récupérer), ce n'est en revanche pas notre service : c'est une question de déclaration, du ressort de votre expert-comptable.`,
      },
      {
        question: `Pourquoi Interactive Brokers détient-il mes actions françaises « au porteur » ?`,
        answer: `C'est un choix structurel du courtier : détenir les titres via son entité américaine (Interactive Brokers LLC) plutôt que de les enregistrer nominativement au nom de chaque client final auprès du dépositaire local. Ce n'est pas propre à la France — c'est le même fonctionnement qui explique, à l'inverse, pourquoi certains dividendes étrangers sont sur-retenus faute de transmission du bon statut fiscal jusqu'à la source.`,
      },
      {
        question: `Comment être sûr du taux exact que j'ai subi ?`,
        answer: `Le taux cité ici (environ 28 %) est celui couramment rapporté depuis 2020, mais il peut évoluer et dépend des arrangements propres à votre courtier. La seule source fiable est votre propre relevé annuel : divisez le montant retenu par le dividende brut sur une ligne française, et comparez.`,
      },
      {
        question: `Mon courtier étranger a prélevé un acompte de 12,8 % en plus : je paie deux fois ?`,
        answer: `Non si vous déclarez correctement : cet acompte se reporte en case 2CK pour être imputé sur votre impôt final. C'est un mécanisme distinct de la retenue « au porteur » du mécanisme n°2 — les deux ne se cumulent pas de la même ligne de dividende dans la plupart des cas, mais vérifiez votre document annuel ligne par ligne.`,
      },
      {
        question: `Pourquoi votre base de données pays ne listait-elle pas ce cas avant ?`,
        answer: `Notre fiche [France](${countryHref("fr", frCountry.slug.fr)}) couvrait déjà le cas classique du non-résident étranger détenant des actions françaises — les mêmes formulaires 5000/5001. Ce que nous avons ajouté ici, c'est la reconnaissance explicite qu'un résident fiscal français peut se retrouver dans la même situation administrative, purement à cause du mode de détention choisi par son courtier — un angle mort que ce site ne couvrait pas avant votre remontée.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Chiffrer mon trop-perçu sur mes actions françaises`,
    note: `Si votre relevé montre une vraie ligne de retenue sur un dividende français — c'est gratuit à vérifier.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `A belief keeps resurfacing: "my broker is abroad, so they must withhold something extra on my French shares." That's neither quite true nor quite false — the answer depends entirely on how your broker holds your shares. Two genuinely different mechanisms hide behind that impression, and only one of them is a real, recoverable over-withholding. Here are both, verified, with how to tell which one you're in.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Update — 15 July 2026`,
    text: `An earlier version of this article stated that no foreign broker applied any real withholding on French shares. That was incomplete: the second mechanism below — "street name" custody through a US entity at some brokers, Interactive Brokers foremost — does trigger a real withholding, confirmed by official broker documentation. We're correcting this publicly rather than quietly editing it: full verified detail below.`,
  },
  { type: "h2", text: `Mechanism #1 — the missing 12.8% advance payment (not an over-withholding)` },
  {
    type: "p",
    text: `Since 2018, your dividends — French or foreign — default to the single flat-rate levy (PFU, the "flat tax"): 12.8% income tax plus 17.2% social contributions, 30% in total (general figures, to be confirmed when you file). Article 117 quater of the French tax code (CGI) requires a paying institution **established in France** to withhold the 12.8% component automatically at payment time, as a non-final advance payment (the "PFNL") — a prepayment, later credited against the tax you actually owe.`,
  },
  {
    type: "p",
    text: `A broker established outside France is, as a general rule, not bound by this (barring specific cases: an EU/EEA-established institution linked to France by an administrative assistance agreement, above certain reference-income thresholds). Result: you receive the gross dividend with nothing set aside, and you owe the full tax in one go at settlement, typically the following summer.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `This is the opposite of an over-withholding`,
    text: `Nothing was over-withheld here — it's the reverse: nothing was set aside for a tax that remains fully due. A cash-flow trap to anticipate (set aside roughly 30% of each gross French dividend), not an over-withholding to claim. This is declared via form 2047 (French-source income collected abroad), then box 2DC of form 2042 — and box 2CK if an advance was withheld anyway. Check the exact box numbers on impots.gouv.fr, as they can change from year to year.`,
  },
  { type: "h2", text: `Mechanism #2 — "street name" custody at a US-linked broker (a real over-withholding)` },
  {
    type: "p",
    text: `This is very likely what you're seeing if your statement shows an explicit "withholding tax" line on a **French** dividend — LVMH, Total, Sanofi… Some brokers, Interactive Brokers foremost, hold client securities "in street name": a US entity of the group (Interactive Brokers LLC) is the registered shareholder with the French depositary, not you. Seen from France, the payment goes out to a US shareholder — not a French tax resident — and the standard withholding for a **non-resident legal entity** applies: ${pct(0.3, "en")} as the base rate, brought down in observed practice to roughly ${pct(STREET_NAME_RATE, "en")} (a figure commonly cited since 2020, to be checked against your own annual statement — it can vary by broker-specific arrangements).`,
  },
  {
    type: "p",
    text: `The key point: this rate has nothing to do with your actual French tax-resident status. It reflects only the nationality of the entity registered as holder in the custody chain — the same omnibus-account problem this whole site describes for foreign dividends, applied here to your own French shares.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withholding observed at a "street name" broker (${pct(STREET_NAME_RATE, "en")})`,
    withheldAmount: eur(-exampleWithheld, "en"),
    owedLabel: `Owed by a French tax resident (${pct(treatyRateFor(frCountry, "FR"), "en")})`,
    owedAmount: eur(-exampleOwed, "en"),
    treatyRef: `Forms 5000 + 5001`,
    recoverLabel: `Recoverable over-withholding`,
    recoverAmount: eur(exampleRecoverable, "en"),
    footnote: `Illustrative example for ${eur(EXAMPLE_GROSS, "en")} of gross French dividend held in street name — indicative observed rate, check your own statement.`,
  },
  {
    type: "p",
    text: `**This is a genuine over-withholding, and it is recoverable** — through the same forms 5000 and 5001 a foreign non-resident would normally use, since that is administratively how France sees the situation. Some brokers offer to facilitate the process for a per-line fee; otherwise, filing goes directly to the French administration, backed by a certificate of tax residence.`,
  },
  { type: "h2", text: `How to tell which one you're in` },
  {
    type: "ul",
    items: [
      `**Check your annual statement or Activity Statement.** If there's a "Withholding Tax" section explicitly listing a French line (LVMH, TotalEnergies, Sanofi…) with an amount withheld, you're in mechanism #2 — a real over-withholding.`,
      `**If the French dividend shows up gross, with no associated withholding line**, you're in mechanism #1 — nothing to recover, but the tax remains due when you file.`,
      `**How you're held depends on the broker, not on you.** Some European brokers hold French shares directly, or through a chain that preserves your resident status; others, especially those backed by a US entity, hold in street name. The [statement reader](${href("en", "statementReader")}) helps read an ambiguous line: paste it, it retrieves the gross and the withholding.`,
    ],
  },
  { type: "h2", text: `The other obligation people forget: form 3916` },
  {
    type: "p",
    text: `Separate from the dividend question: any French tax resident holding an account with an institution established outside France must declare it every year via **form 3916 / 3916-bis** (Article 1649 A of the CGI) — from the moment the account is opened, even if empty or inactive. Failing to declare generally exposes you to a fine of **€1,500 per undeclared account per year**, raised to **€10,000** for an account in a non-cooperative state, with the statute of limitations extended to 10 years.`,
  },
  { type: "h2", text: `What about your foreign shares in all this?` },
  {
    type: "p",
    text: `Independent of both mechanisms above: if you also hold, through that same broker, [US](${countryHref("en", us.slug.en)}), [Swiss](${countryHref("en", ch.slug.en)}) or ${COUNTRIES.length - 1} other covered-country shares, that country's withholding applies under its own rules — that's the core of the rest of this site, and the [simulator](${href("en", "simulator")}) quantifies that over-withholding for free.`,
  },
  { type: "h2", text: `Your questions about French shares through a foreign broker` },
  {
    type: "faq",
    items: [
      {
        question: `Can FiscalPlace help me recover this "street name" withholding?`,
        answer: `Yes, for mechanism #2 (street-name custody, real withholding observed on your statement): this is exactly the kind of over-withholding we handle, with forms 5000/5001 already in our database for France. Quantify it on the [simulator](${href("en", "simulator")}?country=FR) selecting France as the source country. For mechanism #1 (missing advance payment, nothing to recover), that's not our service — it's a filing question for your accountant.`,
      },
      {
        question: `Why does Interactive Brokers hold my French shares in street name?`,
        answer: `It's a structural choice by the broker: holding securities through its US entity (Interactive Brokers LLC) rather than registering each end client individually with the local depositary. This isn't specific to France — it's the same setup that, in reverse, explains why some foreign dividends get over-withheld because the right tax status never made it all the way to the source.`,
      },
      {
        question: `How can I be sure of the exact rate I was charged?`,
        answer: `The rate cited here (around 28%) is the one commonly reported since 2020, but it can change and depends on your specific broker's arrangements. The only reliable source is your own annual statement: divide the amount withheld by the gross dividend on a French line, and compare.`,
      },
      {
        question: `My foreign broker also withheld a 12.8% advance payment — am I paying twice?`,
        answer: `Not if you declare correctly: that advance is reported in box 2CK to be credited against your final tax. It's a separate mechanism from the mechanism #2 street-name withholding — the two don't usually stack on the same dividend line, but check your annual document line by line.`,
      },
      {
        question: `Why didn't your country database mention this before?`,
        answer: `Our [France](${countryHref("en", frCountry.slug.en)}) country page already covered the classic case of a foreign non-resident holding French shares — the same forms 5000/5001. What we've added here is the explicit recognition that a French tax resident can end up in the same administrative situation, purely because of the custody model their broker chose — a blind spot this site didn't cover before you flagged it.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Quantify my over-withholding on French shares`,
    note: `If your statement shows a real withholding line on a French dividend — free to check.`,
  },
];

export const frenchSharesForeignBroker: Article = {
  id: "french-shares-foreign-broker",
  slug: {
    fr: "actions-francaises-courtier-etranger-retenue",
    en: "french-shares-foreign-broker-withholding",
  },
  category: "problems",
  title: {
    fr: "Actions françaises via un courtier étranger : les deux vrais mécanismes (et un seul se récupère)",
    en: "French shares through a foreign broker: the two real mechanisms (and only one is recoverable)",
  },
  description: {
    fr: "Un acompte de 12,8 % qui manque (rien à récupérer) ou une détention « au porteur » chez un courtier américain (un vrai trop-perçu, ~28 %, récupérable via 5000/5001) : deux mécanismes vérifiés, et comment savoir dans lequel vous êtes.",
    en: "A missing 12.8% advance payment (nothing to recover) or 'street name' custody at a US-linked broker (a real ~28% over-withholding, recoverable via forms 5000/5001): two verified mechanisms, and how to tell which one you're in.",
  },
  updated: "2026-07-15",
  readingMinutes: 9,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["FR"],
};
