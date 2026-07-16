import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { COUNTRIES, getCountryById, recoveryGap, treatyRateFor } from "@/data/countries";
import type { Article, ArticleBlock } from "./types";

/**
 * BEST — "Which countries offer the best recovery potential for a French
 * resident?" Every rate, gap and deadline below is computed from
 * @/data/countries at module load; nothing is restated by hand. The ranking
 * table is generated from the data layer and scales automatically when the
 * country panel grows.
 */

const fi = getCountryById("FI")!;
const ie = getCountryById("IE")!;
const ch = getCountryById("CH")!;
const be = getCountryById("BE")!;
const se = getCountryById("SE")!;
const at = getCountryById("AT")!;
const dk = getCountryById("DK")!;
const de = getCountryById("DE")!;
const it = getCountryById("IT")!;
const ca = getCountryById("CA")!;
const no = getCountryById("NO")!;
const pt = getCountryById("PT")!;
const jp = getCountryById("JP")!;
const es = getCountryById("ES")!;
const au = getCountryById("AU")!;
const us = getCountryById("US")!;
const gb = getCountryById("GB")!;
const nl = getCountryById("NL")!;
const frSrc = getCountryById("FR")!;

const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

/** Recoverable gap for a French resident, in percentage points ("25", "11,375"…). */
const pts = (countryGap: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    maximumFractionDigits: 3,
  }).format(countryGap * 100);

const gapFR = (c: (typeof COUNTRIES)[number]) => recoveryGap(c, "FR");

/** Countries whose potential depends on the holder's situation — treated separately. */
const CONDITIONAL_IDS = new Set(["US", "AU"]);

/** Ranked list: unconditional recoverable gap for a French individual, descending. */
const ranked = COUNTRIES.filter((c) => !CONDITIONAL_IDS.has(c.id) && gapFR(c) > 0).sort(
  (a, b) => gapFR(b) - gapFR(a),
);

/* Worked Irish example: 4,000 € of gross Irish dividends. */
const IE_GROSS = 4_000;
const ieWithheld = IE_GROSS * ie.statutoryRate; // 1,000 €
const ieOwed = IE_GROSS * treatyRateFor(ie, "FR"); // 0 €
const ieRecoverable = ieWithheld - ieOwed; // 1,000 €

/** Recovered per 1,000 € of gross dividends, for the podium narrative. */
const per1000 = (c: (typeof COUNTRIES)[number], locale: Locale) => eur(1_000 * gapFR(c), locale);

/* Canonical slugs of sibling articles referenced below. */
const SOL_RANKING_SLUG = {
  fr: "classement-delais-prescription-par-pays",
  en: "statute-of-limitations-ranking-by-country",
} as const;
const DIY_SLUG = {
  fr: "faire-soi-meme-vs-deleguer-remboursement",
  en: "diy-vs-delegating-your-refund-claim",
} as const;

const yearsFr = (c: (typeof COUNTRIES)[number]) => `${c.sol.years} ans`;
const yearsEn = (c: (typeof COUNTRIES)[number]) =>
  `${c.sol.years} ${c.sol.years > 1 ? "years" : "year"}`;

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Tous les dividendes étrangers ne se valent pas. Sur certains marchés, près d'un tiers du dividende brut vous attend chez le fisc étranger ; sur d'autres, il n'y a strictement rien à récupérer — et un classement honnête doit le dire aussi. Voici les ${COUNTRIES.length} pays que nous couvrons, classés sur un critère simple : **l'écart entre le taux réellement retenu et le taux que la convention fiscale autorise** pour un particulier résident de France. Cet écart, en points de pourcentage du dividende brut, est ce que vous pouvez réclamer.`,
  },
  {
    type: "p",
    text: `Les chiffres ci-dessous sont indicatifs (données revues mi-2026) : les conventions et les pratiques administratives évoluent, et chaque dossier est vérifié avant dépôt. Les délais indiqués sont les délais de prescription — [leur classement détaillé fait l'objet d'un article dédié](${articleHref("fr", SOL_RANKING_SLUG.fr)}).`,
  },
  { type: "h2", text: `Le classement en un tableau` },
  {
    type: "table",
    caption: `Écart récupérable pour un particulier résident de France, en points de pourcentage du dividende brut. Données revues mi-2026 — chiffres indicatifs.`,
    headers: [`Rang`, `Pays`, `Retenu`, `Dû (résident FR)`, `Écart récupérable`, `Délai pour agir`],
    rows: ranked.map((c, i) => [
      `${i + 1}`,
      `${c.flag} [${c.name.fr}](${countryHref("fr", c.slug.fr)})`,
      pct(c.statutoryRate, "fr"),
      pct(treatyRateFor(c, "FR"), "fr"),
      `${pts(gapFR(c), "fr")} pts`,
      yearsFr(c),
    ]),
  },
  {
    type: "p",
    text: `Cinq pays manquent volontairement à ce tableau : les États-Unis et l'Australie, où le potentiel dépend entièrement de votre situation, et le Royaume-Uni, les Pays-Bas et la France, où il est nul pour un particulier dans le cas standard — chacun est traité plus bas.`,
  },
  { type: "h2", text: `Le podium et les poursuivants, pays par pays` },
  {
    type: "h3",
    text: `Finlande — ${pts(gapFR(fi), "fr")} points, l'anomalie la plus rentable d'Europe`,
  },
  {
    type: "p",
    text: `La [Finlande](${countryHref("fr", fi.slug.fr)}) retient ${pct(fi.statutoryRate, "fr")} sur chaque dividende… alors que la convention franco-finlandaise réserve l'imposition des dividendes au pays de résidence : un particulier résident de France ne doit **rien** au fisc finlandais. Tout ce qui a été retenu se récupère — ${per1000(fi, "fr")} par tranche de 1 000 € de dividendes bruts sur Nokia, Sampo, Fortum ou UPM. Le délai de ${yearsFr(fi)} à compter de la fin de l'année du versement impose un rythme : on dépose chaque année, sans laisser dormir l'historique. Peu d'investisseurs connaissent cette particularité conventionnelle ; c'est précisément pour cela qu'elle rapporte.`,
  },
  { type: "h3", text: `Irlande — ${pts(gapFR(ie), "fr")} points, l'autre exonération totale` },
  {
    type: "p",
    text: `L'[Irlande](${countryHref("fr", ie.slug.fr)}) retient ${pct(ie.statutoryRate, "fr")} alors qu'un résident d'un pays conventionné peut prétendre à une **exonération totale** : tout ce qui a été retenu se récupère, soit ${per1000(ie, "fr")} par tranche de 1 000 € de dividendes bruts. Le délai de ${yearsFr(ie)} laisse le temps de reconstituer l'historique, et une déclaration d'exemption bien déposée supprime la retenue sur les dividendes futurs. Le piège classique : croire que ses actions « américaines » ne sont pas concernées — Accenture, Medtronic ou CRH distribuent depuis l'Irlande.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenu à la source (${pct(ie.statutoryRate, "fr")})`,
    withheldAmount: eur(ieWithheld, "fr"),
    owedLabel: `Dû par un résident de France (${pct(treatyRateFor(ie, "FR"), "fr")})`,
    owedAmount: eur(ieOwed, "fr"),
    treatyRef: `Exonération non-résident`,
    recoverLabel: `Trop-perçu récupérable`,
    recoverAmount: eur(ieRecoverable, "fr"),
    footnote: `Exemple pour ${eur(IE_GROSS, "fr")} de dividendes irlandais bruts — montants indicatifs, données revues mi-2026.`,
  },
  { type: "h3", text: `Suisse — ${pts(gapFR(ch), "fr")} points, le plus gros gisement en volume` },
  {
    type: "p",
    text: `${pct(ch.statutoryRate, "fr")} retenus, ${pct(treatyRateFor(ch, "FR"), "fr")} dus : la [Suisse](${countryHref("fr", ch.slug.fr)}) est le gisement le plus important en pratique pour les portefeuilles français, tant les valeurs suisses y sont répandues. La procédure est moderne — dépôt en ligne obligatoire depuis 2025, formulaire 83 pour les résidents de France — mais le délai de ${yearsFr(ch)} à compter de la fin de l'année civile est plus court qu'il n'y paraît, et chaque demandeur est limité à trois demandes par an : on regroupe ses dividendes en une demande annuelle.`,
  },
  { type: "h3", text: `Belgique — ${pts(gapFR(be), "fr")} points, le voisin qu'on oublie` },
  {
    type: "p",
    text: `${pct(be.statutoryRate, "fr")} retenus, ${pct(treatyRateFor(be, "FR"), "fr")} dus : la [Belgique](${countryHref("fr", be.slug.fr)}) rend la moitié de son précompte aux résidents de France qui la sollicitent — formulaire 276 Div.-Aut., dépôt désormais possible en ligne. KBC, Ageas, Solvay, UCB : des valeurs très présentes dans les portefeuilles francophones, pour un dossier de difficulté moyenne. Subtilité de calendrier : le délai se décompte à partir du 1er janvier de l'année du prélèvement, pas de sa fin — les distraits y perdent un an.`,
  },
  { type: "h3", text: `Suède — ${pts(gapFR(se), "fr")} points, l'administration réactive` },
  {
    type: "p",
    text: `${pct(se.statutoryRate, "fr")} retenus contre ${pct(treatyRateFor(se, "FR"), "fr")} dus sur les grandes valeurs de dividende nordiques (Volvo, Investor AB, banques) : les montants montent vite. La [Suède](${countryHref("fr", se.slug.fr)}) combine un formulaire unique (SKV 3740), un délai confortable de ${yearsFr(se)} — à confirmer lors du diagnostic — et une administration réputée répondre plus vite que la moyenne du panel. Peu de pièges : c'est le dossier « rapport effort/gain » par excellence.`,
  },
  { type: "h3", text: `Autriche — ${pts(gapFR(at), "fr")} points, le délai le plus confortable` },
  {
    type: "p",
    text: `L'[Autriche](${countryHref("fr", at.slug.fr)}) retient ${pct(at.statutoryRate, "fr")} quand ${pct(treatyRateFor(at, "FR"), "fr")} suffisent, et laisse ${yearsFr(at)} pour réclamer — l'un des délais les plus longs d'Europe. La procédure a une particularité : une pré-déclaration électronique (ZS-RD1) suivie d'un envoi papier signé. Rien d'insurmontable, mais c'est le genre de double étape où une demande sur deux faite « à la main » s'égare.`,
  },
  { type: "h3", text: `Danemark — ${pts(gapFR(dk), "fr")} points, exigeant depuis les fraudes` },
  {
    type: "p",
    text: `${pct(dk.statutoryRate, "fr")} retenus contre ${pct(treatyRateFor(dk, "FR"), "fr")} dus sur Novo Nordisk, Ørsted ou Maersk : le [Danemark](${countryHref("fr", dk.slug.fr)}) offre un écart solide, mais l'administration — échaudée par des fraudes massives au remboursement — vérifie chaque pièce en profondeur. Dossier propre du premier coup obligatoire, délai de ${yearsFr(dk)} à compter du prélèvement, et une histoire conventionnelle mouvementée côté français : les années anciennes s'examinent au cas par cas.`,
  },
  { type: "h3", text: `Allemagne — ${pts(gapFR(de), "fr")} points, exigeante mais rentable` },
  {
    type: "p",
    text: `Le taux allemand de ${pct(de.statutoryRate, "fr")} (impôt plus contribution de solidarité) se réduit à ${pct(treatyRateFor(de, "FR"), "fr")} par convention. L'[Allemagne](${countryHref("fr", de.slug.fr)}) est le dossier le plus exigeant du panel sur la preuve : le BZSt demande la chaîne de détention complète, attestations de dépôt et tax vouchers originaux à l'appui, et son instruction dépasse souvent 12 mois. Le délai de ${yearsFr(de)} pardonne la lenteur de l'administration — pas celle du déposant.`,
  },
  { type: "h3", text: `Italie — ${pts(gapFR(it), "fr")} points, la patience récompensée` },
  {
    type: "p",
    text: `L'[Italie](${countryHref("fr", it.slug.fr)}) retient ${pct(it.statutoryRate, "fr")} quand ${pct(treatyRateFor(it, "FR"), "fr")} suffisent — un écart réel sur ENI, Enel, Intesa ou Generali, avec ${yearsFr(it)} pour agir, décomptés date par date. Mais il faut le savoir en entrant : l'instruction italienne est la plus lente du panel, plusieurs années d'attente ne sont pas rares (des intérêts moratoires s'ajoutent aux remboursements tardifs). C'est un dossier qu'on ouvre pour être payé plus tard — pas un gain rapide.`,
  },
  { type: "h3", text: `Canada — ${pts(gapFR(ca), "fr")} points, le contre-la-montre` },
  {
    type: "p",
    text: `${pct(ca.statutoryRate, "fr")} retenus, ${pct(treatyRateFor(ca, "FR"), "fr")} dus : le potentiel du [Canada](${countryHref("fr", ca.slug.fr)}) est solide, mais il se joue en ${yearsFr(ca)} seulement à compter de la fin de l'année civile — le délai le plus court du panel, sur une procédure encore entièrement papier (formulaire NR7-R). Beaucoup de trop-perçus canadiens se prescrivent avant même que leur détenteur ait su qu'ils existaient. Si vous avez des dividendes canadiens, c'est le dossier à traiter en premier.`,
  },
  {
    type: "h3",
    text: `Norvège et Portugal — ${pts(gapFR(no), "fr")} points chacun, deux tempos opposés`,
  },
  {
    type: "p",
    text: `Même écart, deux horloges. La [Norvège](${countryHref("fr", no.slug.fr)}) (${pct(no.statutoryRate, "fr")} retenus, ${pct(treatyRateFor(no, "FR"), "fr")} dus sur Equinor, DNB, Telenor…) laisse ${yearsFr(no)} pour agir et offre un vrai taux réduit à la source quand la chaîne de dépositaires est documentée à l'avance. Le [Portugal](${countryHref("fr", pt.slug.fr)}) (${pct(pt.statutoryRate, "fr")} retenus sur EDP, Galp, Jerónimo Martins…) ne laisse que ${yearsFr(pt)} — aussi court que le Canada — mais permet de prévenir : un formulaire 21-RFI remis à l'agent payeur avant le versement applique directement les ${pct(treatyRateFor(pt, "FR"), "fr")}.`,
  },
  { type: "h3", text: `Japon — ${pts(gapFR(jp), "fr")} points, modeste mais cumulatif` },
  {
    type: "p",
    text: `L'écart japonais est mince : ${pct(jp.statutoryRate, "fr")} retenus (surtaxe de reconstruction incluse) contre ${pct(treatyRateFor(jp, "FR"), "fr")} souvent dus pour un résident de France. Le [Japon](${countryHref("fr", jp.slug.fr)}) laisse ${yearsFr(jp)} pour agir, mais la procédure transite par l'agent payeur japonais et reste largement papier : à réserver aux positions qui distribuent régulièrement, où l'écart s'accumule d'année en année.`,
  },
  { type: "h3", text: `Espagne — ${pts(gapFR(es), "fr")} points, le seuil de rentabilité en question` },
  {
    type: "p",
    text: `${pct(es.statutoryRate, "fr")} retenus, ${pct(treatyRateFor(es, "FR"), "fr")} dus : l'écart espagnol est le plus mince des dossiers inconditionnels. Sur de petits dividendes (Santander, Iberdrola, Telefónica…), le jeu peut ne pas en valoir la chandelle une fois notre commission plancher appliquée — notre diagnostic le dit alors sans détour. La vraie friction de l'[Espagne](${countryHref("fr", es.slug.fr)}) est ailleurs : l'identifiant fiscal exigé pour déposer le Modelo 210, qui décourage la plupart des tentatives en solo.`,
  },
  { type: "h2", text: `Deux cas conditionnels : États-Unis et Australie` },
  {
    type: "table",
    caption: `Pays où le potentiel dépend de votre situation — données revues mi-2026.`,
    headers: [`Pays`, `Écart récupérable`, `Condition`],
    rows: [
      [
        `${us.flag} [${us.name.fr}](${countryHref("fr", us.slug.fr)})`,
        `0 ou ${pts(gapFR(us), "fr")} pts`,
        `Tout dépend du W-8BEN : valide, il ramène la retenue de ${pct(us.statutoryRate, "fr")} à ${pct(treatyRateFor(us, "FR"), "fr")} dès le versement et il n'y a rien à récupérer ; absent ou expiré, l'écart complet se réclame a posteriori.`,
      ],
      [
        `${au.flag} [${au.name.fr}](${countryHref("fr", au.slug.fr)})`,
        `0 à ${pts(gapFR(au), "fr")} pts`,
        `Selon le « franking » : les dividendes fully franked ne subissent aucune retenue (rien à récupérer), la part unfranked est retenue à ${pct(au.statutoryRate, "fr")} et se réduit à ${pct(treatyRateFor(au, "FR"), "fr")} — le diagnostic se fait ligne à ligne.`,
      ],
    ],
  },
  {
    type: "p",
    text: `Le cas américain mérite une phrase de plus : c'est le seul grand marché où le levier est avant tout **préventif**. Si votre W-8BEN est en place et valide, votre classement personnel affiche zéro — et c'est une bonne nouvelle, pas un manque à gagner. Attention aussi aux crédits d'imputation australiens (franking credits) : ils ne sont pas remboursables aux non-résidents, et quiconque promet de les « récupérer » se trompe.`,
  },
  { type: "h2", text: `Les zéros assumés : Royaume-Uni, Pays-Bas — et la France elle-même` },
  {
    type: "p",
    text: `Le [Royaume-Uni](${countryHref("fr", gb.slug.fr)}) ne prélève **aucune retenue** sur les dividendes ordinaires : ${pct(gb.statutoryRate, "fr")} retenus, rien à récupérer. L'exception concerne les distributions immobilières des REIT (Property Income Distributions), retenues à 20 % et souvent réductibles par convention. Si votre courtier a retenu quelque chose sur une action britannique classique, c'est une anomalie à examiner — pas un gisement.`,
  },
  {
    type: "p",
    text: `Les [Pays-Bas](${countryHref("fr", nl.slug.fr)}) retiennent ${pct(nl.statutoryRate, "fr")}… qui est précisément le taux conventionnel dû par un résident de France : l'écart est nul pour un particulier. Un potentiel existe pour certains profils (organismes exonérés, fonds, sur-prélèvements techniques), mais pour l'investisseur individuel type, notre diagnostic conclura le plus souvent « rien à déposer » — et vous le dira gratuitement plutôt que de vendre un espoir.`,
  },
  {
    type: "p",
    text: `La [France](${countryHref("fr", frSrc.slug.fr)}) elle-même figure dans notre base — vue depuis l'étranger. Contre-intuitif mais vrai : la retenue française pour un particulier non résident (${pct(frSrc.statutoryRate, "fr")}) est **inférieure** aux 15 % conventionnels usuels. Dans le cas standard, il n'y a rien à réclamer à la DGFiP ; ne restent que les erreurs de taux de l'établissement payeur — réelles, mais marginales, et traitées via les formulaires 5000/5001.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Le bon classement ne sert à rien hors délai`,
    text: `Le Canada et le Portugal illustrent le vrai enjeu : ${pts(gapFR(ca), "fr")} points de potentiel, mais ${yearsFr(ca)} seulement pour agir. Avant de prioriser par écart, vérifiez ce qui expire en premier avec le [calculateur de prescription](${href("fr", "solCalculator")}) — gratuit, sans compte.`,
  },
  { type: "h2", text: `Vos questions sur ce classement` },
  {
    type: "faq",
    items: [
      {
        question: `Un classement en « points » suffit-il à prioriser mes démarches ?`,
        answer: `Non : ce qui compte, c'est l'écart multiplié par vos dividendes bruts dans chaque pays — et le délai restant. Dix points sur un gros portefeuille canadien valent plus que trente points sur une ligne finlandaise isolée, surtout à deux ans de la prescription. Le simulateur croise les trois variables sur vos chiffres réels.`,
      },
      {
        question: `Ce classement vaut-il pour mes ETF ?`,
        answer: `En général non, et il faut le dire clairement : dans un fonds ou un ETF, c'est le fonds qui est juridiquement l'actionnaire — la retenue prélevée à son niveau ne vous appartient pas et ne peut pas être réclamée par vous. Ce classement vaut pour les titres détenus en direct sur votre compte-titres.`,
      },
      {
        question: `Pourquoi la Finlande et l'Irlande tombent-elles à 0 % quand la France impose mes dividendes ?`,
        answer: `Ce sont deux impôts distincts. L'exonération porte sur la retenue à la source étrangère, ouverte aux résidents de pays conventionnés ; elle ne change rien à l'imposition française de vos dividendes, qui suit son cours normal. Récupérer la retenue étrangère n'est pas de l'optimisation : c'est l'application du taux prévu par les textes.`,
      },
      {
        question: `Ces taux peuvent-ils changer ?`,
        answer: `Oui — conventions renégociées, législations internes modifiées, pratiques administratives durcies ou assouplies. C'est pourquoi chaque chiffre de cette page est présenté comme indicatif avec sa date de revue (mi-2026), et pourquoi chaque dossier est revérifié contre les règles en vigueur avant tout dépôt.`,
      },
      {
        question: `Puis-je traiter plusieurs pays en même temps ?`,
        answer: `Oui : chaque pays fait l'objet d'une demande distincte auprès de son administration, mais les pièces communes (attestation de résidence, relevés) se mutualisent, et un seul mandat couvre l'ensemble. C'est précisément sur les portefeuilles multi-pays que la délégation prend son sens — pour un pays unique et un petit montant, faire soi-même se défend très bien.`,
      },
    ],
  },
  {
    type: "p",
    text: `Dernière précision, dans la logique de tout ce site : si votre potentiel se concentre sur un seul petit dossier, la meilleure réponse est parfois de ne pas nous payer — [notre comparatif « faire soi-même ou déléguer »](${articleHref("fr", DIY_SLUG.fr)}) donne le seuil chiffré.`,
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
    text: `Not all foreign dividends are created equal. On some markets, nearly a third of the gross dividend is sitting with the foreign tax authority waiting for you; on others there is strictly nothing to recover — and an honest ranking has to say that too. Here are the ${COUNTRIES.length} countries we cover, ranked on one simple criterion: **the gap between the rate actually withheld and the rate the tax treaty allows** for an individual French resident. That gap, in percentage points of the gross dividend, is what you can claim back.`,
  },
  {
    type: "p",
    text: `The figures below are indicative (data reviewed in mid-2026): treaties and administrative practice evolve, and every file is re-checked before filing. The deadlines shown are statutes of limitations — [their detailed ranking has its own article](${articleHref("en", SOL_RANKING_SLUG.en)}).`,
  },
  { type: "h2", text: `The ranking in one table` },
  {
    type: "table",
    caption: `Recoverable gap for an individual French resident, in percentage points of the gross dividend. Data reviewed in mid-2026 — indicative figures.`,
    headers: [`Rank`, `Country`, `Withheld`, `Owed (FR resident)`, `Recoverable gap`, `Time to act`],
    rows: ranked.map((c, i) => [
      `${i + 1}`,
      `${c.flag} [${c.name.en}](${countryHref("en", c.slug.en)})`,
      pct(c.statutoryRate, "en"),
      pct(treatyRateFor(c, "FR"), "en"),
      `${pts(gapFR(c), "en")} pts`,
      yearsEn(c),
    ]),
  },
  {
    type: "p",
    text: `Five countries are deliberately missing from this table: the United States and Australia, where the potential depends entirely on your situation, and the United Kingdom, the Netherlands and France, where it is nil for an individual in the standard case — each is covered below.`,
  },
  { type: "h2", text: `The podium and the chasing pack, country by country` },
  {
    type: "h3",
    text: `Finland — ${pts(gapFR(fi), "en")} points, Europe's most profitable anomaly`,
  },
  {
    type: "p",
    text: `[Finland](${countryHref("en", fi.slug.en)}) withholds ${pct(fi.statutoryRate, "en")} on every dividend… while the France–Finland treaty reserves dividend taxation to the residence country: an individual French resident owes the Finnish tax authority **nothing**. Everything withheld is recoverable — ${per1000(fi, "en")} per €1,000 of gross dividends on Nokia, Sampo, Fortum or UPM. The ${yearsEn(fi)} window from the end of the payment year sets the pace: file every year, don't let the history sleep. Few investors know this treaty quirk; that is exactly why it pays.`,
  },
  { type: "h3", text: `Ireland — ${pts(gapFR(ie), "en")} points, the other full exemption` },
  {
    type: "p",
    text: `[Ireland](${countryHref("en", ie.slug.en)}) withholds ${pct(ie.statutoryRate, "en")} while a treaty-country resident can claim a **full exemption**: everything withheld is recoverable — ${per1000(ie, "en")} per €1,000 of gross dividends. The ${yearsEn(ie)} window leaves time to rebuild the history, and a properly filed exemption declaration removes withholding on future dividends altogether. The classic trap: assuming your "US" shares aren't concerned — Accenture, Medtronic and CRH all distribute from Ireland.`,
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld at source (${pct(ie.statutoryRate, "en")})`,
    withheldAmount: eur(ieWithheld, "en"),
    owedLabel: `Owed by a French resident (${pct(treatyRateFor(ie, "FR"), "en")})`,
    owedAmount: eur(ieOwed, "en"),
    treatyRef: `Non-resident exemption`,
    recoverLabel: `Recoverable over-withholding`,
    recoverAmount: eur(ieRecoverable, "en"),
    footnote: `Example for ${eur(IE_GROSS, "en")} of gross Irish dividends — indicative amounts, data reviewed in mid-2026.`,
  },
  { type: "h3", text: `Switzerland — ${pts(gapFR(ch), "en")} points, the biggest pool by volume` },
  {
    type: "p",
    text: `${pct(ch.statutoryRate, "en")} withheld, ${pct(treatyRateFor(ch, "FR"), "en")} owed: [Switzerland](${countryHref("en", ch.slug.en)}) is in practice the largest pool for French portfolios, given how widely Swiss blue chips are held. The procedure is modern — electronic filing mandatory since 2025, Form 83 for French residents — but the ${yearsEn(ch)} window from the end of the calendar year is shorter than it looks, and each claimant is capped at three claims a year: bundle your dividends into one annual claim.`,
  },
  { type: "h3", text: `Belgium — ${pts(gapFR(be), "en")} points, the neighbour everyone forgets` },
  {
    type: "p",
    text: `${pct(be.statutoryRate, "en")} withheld, ${pct(treatyRateFor(be, "FR"), "en")} owed: [Belgium](${countryHref("en", be.slug.en)}) gives half its withholding back to French residents who ask — form 276 Div.-Aut., now fileable online. KBC, Ageas, Solvay, UCB: names heavily present in francophone portfolios, for a file of average difficulty. A calendar subtlety: the clock runs from 1 January of the withholding year, not its end — the inattentive lose a year to it.`,
  },
  { type: "h3", text: `Sweden — ${pts(gapFR(se), "en")} points, the responsive administration` },
  {
    type: "p",
    text: `${pct(se.statutoryRate, "en")} withheld against ${pct(treatyRateFor(se, "FR"), "en")} owed on the big Nordic dividend payers (Volvo, Investor AB, the banks): amounts build up fast. [Sweden](${countryHref("en", se.slug.en)}) combines a single form (SKV 3740), a comfortable ${yearsEn(se)} window — to be confirmed at diagnostic stage — and an administration known to reply faster than the panel average. Few traps: the effort-to-gain file par excellence.`,
  },
  { type: "h3", text: `Austria — ${pts(gapFR(at), "en")} points, the most comfortable deadline` },
  {
    type: "p",
    text: `[Austria](${countryHref("en", at.slug.en)}) withholds ${pct(at.statutoryRate, "en")} where ${pct(treatyRateFor(at, "FR"), "en")} would do, and allows ${yearsEn(at)} to claim — among the longest windows in Europe. The procedure has one quirk: an electronic pre-filing (ZS-RD1) followed by a signed paper submission. Nothing insurmountable, but it is exactly the kind of two-step where hand-made claims go astray.`,
  },
  { type: "h3", text: `Denmark — ${pts(gapFR(dk), "en")} points, demanding since the frauds` },
  {
    type: "p",
    text: `${pct(dk.statutoryRate, "en")} withheld against ${pct(treatyRateFor(dk, "FR"), "en")} owed on Novo Nordisk, Ørsted or Maersk: [Denmark](${countryHref("en", dk.slug.en)}) offers a solid gap, but the administration — scalded by massive refund frauds — vets every document in depth. A clean first submission is mandatory, the window is ${yearsEn(dk)} from withholding, and the treaty history with France is eventful: older years are assessed case by case.`,
  },
  { type: "h3", text: `Germany — ${pts(gapFR(de), "en")} points, demanding but worth it` },
  {
    type: "p",
    text: `The German ${pct(de.statutoryRate, "en")} (tax plus solidarity surcharge) reduces to ${pct(treatyRateFor(de, "FR"), "en")} by treaty. [Germany](${countryHref("en", de.slug.en)}) is the panel's most demanding file on evidence: the BZSt wants the full chain of custody, backed by custody confirmations and original tax vouchers, and its processing often exceeds 12 months. The ${yearsEn(de)} window forgives the administration's slowness — not the filer's.`,
  },
  { type: "h3", text: `Italy — ${pts(gapFR(it), "en")} points, patience rewarded` },
  {
    type: "p",
    text: `[Italy](${countryHref("en", it.slug.en)}) withholds ${pct(it.statutoryRate, "en")} where ${pct(treatyRateFor(it, "FR"), "en")} would do — a real gap on ENI, Enel, Intesa or Generali, with ${yearsEn(it)} to act, counted date by date. But know it going in: Italian processing is the slowest in the panel, multi-year waits are not rare (late refunds accrue statutory interest). This is a file you open to be paid later — not a quick win.`,
  },
  { type: "h3", text: `Canada — ${pts(gapFR(ca), "en")} points, the race against the clock` },
  {
    type: "p",
    text: `${pct(ca.statutoryRate, "en")} withheld, ${pct(treatyRateFor(ca, "FR"), "en")} owed: [Canada](${countryHref("en", ca.slug.en)})'s potential is solid, but it plays out in only ${yearsEn(ca)} from the end of the calendar year — the shortest window in the panel, on a still fully paper-based procedure (form NR7-R). Many Canadian over-withholdings expire before their owner even knew they existed. If you hold Canadian dividend payers, this is the file to open first.`,
  },
  {
    type: "h3",
    text: `Norway and Portugal — ${pts(gapFR(no), "en")} points each, two opposite clocks`,
  },
  {
    type: "p",
    text: `Same gap, two clocks. [Norway](${countryHref("en", no.slug.en)}) (${pct(no.statutoryRate, "en")} withheld, ${pct(treatyRateFor(no, "FR"), "en")} owed on Equinor, DNB, Telenor…) allows ${yearsEn(no)} and offers genuine relief at source when the custody chain is documented in advance. [Portugal](${countryHref("en", pt.slug.en)}) (${pct(pt.statutoryRate, "en")} withheld on EDP, Galp, Jerónimo Martins…) allows only ${yearsEn(pt)} — as short as Canada — but lets you prevent: Form 21-RFI handed to the paying agent before payment applies the ${pct(treatyRateFor(pt, "FR"), "en")} directly.`,
  },
  { type: "h3", text: `Japan — ${pts(gapFR(jp), "en")} points, modest but compounding` },
  {
    type: "p",
    text: `The Japanese gap is thin: ${pct(jp.statutoryRate, "en")} withheld (reconstruction surtax included) against ${pct(treatyRateFor(jp, "FR"), "en")} typically owed by a French resident. [Japan](${countryHref("en", jp.slug.en)}) allows ${yearsEn(jp)} to act, but the procedure runs through the Japanese paying agent and remains largely paper-based: best reserved for regularly distributing positions, where the gap compounds year after year.`,
  },
  { type: "h3", text: `Spain — ${pts(gapFR(es), "en")} points, the break-even question` },
  {
    type: "p",
    text: `${pct(es.statutoryRate, "en")} withheld, ${pct(treatyRateFor(es, "FR"), "en")} owed: the Spanish gap is the thinnest of the unconditional files. On small dividends (Santander, Iberdrola, Telefónica…), the game may not be worth the candle once our floor fee applies — and our diagnostic will say so plainly. [Spain](${countryHref("en", es.slug.en)})'s real friction lies elsewhere: the tax identifier required to file the Modelo 210, which defeats most solo attempts.`,
  },
  { type: "h2", text: `Two conditional cases: the United States and Australia` },
  {
    type: "table",
    caption: `Countries where the potential depends on your situation — data reviewed in mid-2026.`,
    headers: [`Country`, `Recoverable gap`, `Condition`],
    rows: [
      [
        `${us.flag} [${us.name.en}](${countryHref("en", us.slug.en)})`,
        `0 or ${pts(gapFR(us), "en")} pts`,
        `It all hinges on the W-8BEN: valid, it cuts withholding from ${pct(us.statutoryRate, "en")} to ${pct(treatyRateFor(us, "FR"), "en")} at payment and there is nothing to recover; missing or expired, the full gap can be claimed after the fact.`,
      ],
      [
        `${au.flag} [${au.name.en}](${countryHref("en", au.slug.en)})`,
        `0 to ${pts(gapFR(au), "en")} pts`,
        `Depends on franking: fully franked dividends bear no withholding at all (nothing to recover), while the unfranked portion is withheld at ${pct(au.statutoryRate, "en")} and reduces to ${pct(treatyRateFor(au, "FR"), "en")} — the diagnosis is line by line.`,
      ],
    ],
  },
  {
    type: "p",
    text: `The US case deserves one more sentence: it is the one major market where the lever is above all **preventive**. If your W-8BEN is in place and valid, your personal ranking reads zero — which is good news, not a missed opportunity. And beware Australian franking credits: they are not refundable to non-residents, and anyone promising to "recover" them is wrong.`,
  },
  { type: "h2", text: `The honest zeros: the UK, the Netherlands — and France itself` },
  {
    type: "p",
    text: `The [United Kingdom](${countryHref("en", gb.slug.en)}) levies **no withholding** on ordinary dividends: ${pct(gb.statutoryRate, "en")} withheld, nothing to recover. The exception is REIT Property Income Distributions, withheld at 20% and often treaty-reducible. If your broker withheld something on a standard UK share, that is an anomaly worth examining — not a pool of money.`,
  },
  {
    type: "p",
    text: `The [Netherlands](${countryHref("en", nl.slug.en)}) withholds ${pct(nl.statutoryRate, "en")}… which is precisely the treaty rate a French resident owes: the gap is nil for an individual. Potential exists for specific profiles (exempt bodies, funds, technical over-withholding), but for the typical individual investor our diagnostic will most often conclude "nothing worth filing" — and will tell you so, free of charge, rather than selling hope.`,
  },
  {
    type: "p",
    text: `[France](${countryHref("en", frSrc.slug.en)}) itself sits in our database — seen from abroad. Counter-intuitive but true: the French withholding on a non-resident individual (${pct(frSrc.statutoryRate, "en")}) is **below** the usual 15% treaty rates. In the standard case there is nothing to claim from the DGFiP; what remains are paying-agent rate errors — real, but marginal, and handled through forms 5000/5001.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `The best ranking is worthless past the deadline`,
    text: `Canada and Portugal illustrate the real stake: ${pts(gapFR(ca), "en")} points of potential, but only ${yearsEn(ca)} to act. Before prioritising by gap, check what expires first with the [deadline calculator](${href("en", "solCalculator")}) — free, no account.`,
  },
  { type: "h2", text: `Your questions about this ranking` },
  {
    type: "faq",
    items: [
      {
        question: `Is a ranking in "points" enough to prioritise my claims?`,
        answer: `No: what matters is the gap multiplied by your gross dividends in each country — and the time remaining. Ten points on a large Canadian portfolio beat thirty points on one isolated Finnish line, especially with a two-year clock. The simulator crosses all three variables against your actual figures.`,
      },
      {
        question: `Does this ranking apply to my ETFs?`,
        answer: `Generally no, and it needs saying plainly: in a fund or ETF, the fund is legally the shareholder — withholding levied at its level does not belong to you and cannot be claimed by you. This ranking applies to securities held directly in your own account.`,
      },
      {
        question: `Why do Finland and Ireland drop to 0% when France still taxes my dividends?`,
        answer: `They are two separate taxes. The exemption concerns the foreign withholding at source, open to treaty-country residents; it changes nothing about the French taxation of your dividends, which runs its normal course. Recovering foreign withholding is not tax optimisation: it is the rate the rules already provide.`,
      },
      {
        question: `Can these rates change?`,
        answer: `Yes — treaties get renegotiated, domestic law moves, administrative practice tightens or loosens. That is why every figure on this page is flagged as indicative with its review date (mid-2026), and why every file is re-checked against the rules in force before anything is filed.`,
      },
      {
        question: `Can I run several countries at once?`,
        answer: `Yes: each country gets its own claim before its own administration, but the shared documents (residence certificate, statements) are pooled, and a single mandate covers the lot. Multi-country portfolios are precisely where delegating makes sense — for a single country and a small amount, doing it yourself holds up very well.`,
      },
    ],
  },
  {
    type: "p",
    text: `One last note, in keeping with everything on this site: if your potential sits in a single small file, the best answer is sometimes not to pay us at all — [our "DIY vs delegating" comparison](${articleHref("en", DIY_SLUG.en)}) gives the exact threshold.`,
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculate my refund`,
  },
];

export const bestCountriesFrenchResident: Article = {
  id: "best-countries-french-resident",
  slug: {
    fr: "meilleurs-pays-recuperation-resident-francais",
    en: "best-countries-for-recovery-french-resident",
  },
  category: "best",
  title: {
    fr: "Quels pays offrent le meilleur potentiel de récupération pour un résident français ?",
    en: "Which countries offer the best recovery potential for a French resident?",
  },
  description: {
    fr: `Finlande, Irlande, Suisse en tête — Royaume-Uni, Pays-Bas et France à zéro, et nous le disons. Le classement des ${COUNTRIES.length} pays par écart récupérable pour un particulier résident de France, avec les pièges de chacun.`,
    en: `Finland, Ireland and Switzerland on top — the UK, the Netherlands and France at zero, and we say so. All ${COUNTRIES.length} countries ranked by recoverable gap for an individual French resident, with each one's traps.`,
  },
  updated: "2026-02-10",
  readingMinutes: 12,
  content: { fr: frContent, en: enContent },
  relatedCountries: [
    "FI",
    "IE",
    "CH",
    "BE",
    "SE",
    "AT",
    "DK",
    "DE",
    "IT",
    "CA",
    "NO",
    "PT",
    "JP",
    "ES",
    "US",
    "AU",
    "GB",
    "NL",
    "FR",
  ],
};
