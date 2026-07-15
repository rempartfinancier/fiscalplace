import { formatCurrency, formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { COUNTRIES, getCountryById, recoveryGap, treatyRateFor } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { missedDeadline } from "./missed-deadline";
import { frenchSharesForeignBroker } from "./french-shares-foreign-broker";
import type { Article, ArticleBlock } from "./types";

/**
 * PROBLEMS — "Withholding tax: what your broker won't tell you".
 * No broker is named or disparaged: the point is structural, not personal.
 * Every rate, deadline and price below is computed from @/data/countries and
 * @/config/pricing at module load; nothing is restated by hand.
 */

const us = getCountryById("US")!;
const ch = getCountryById("CH")!;
const ca = getCountryById("CA")!;
const ie = getCountryById("IE")!;
const nl = getCountryById("NL")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);
const eur = (amount: number, locale: Locale) => formatCurrency(amount, locale);
/** Rate expressed in points ("20", "12.5") for "X points" phrasing. */
const pts = (rate: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 3 }).format(
    rate * 100,
  );

/** Illustrative statement line for the ledger example (scenario constant, not tax data). */
const LINE_GROSS = 200;
const lineWithheld = LINE_GROSS * ch.statutoryRate;
const lineOwed = LINE_GROSS * treatyRateFor(ch, "FR");
const lineRecoverable = LINE_GROSS * recoveryGap(ch, "FR");

function statementRows(locale: Locale): string[][] {
  return [...COUNTRIES]
    .sort(
      (a, b) => b.statutoryRate - a.statutoryRate || a.name[locale].localeCompare(b.name[locale]),
    )
    .map((c) => {
      const gap = recoveryGap(c, "FR");
      const fix =
        gap === 0
          ? locale === "fr"
            ? "Rien à corriger dans le cas général"
            : "Nothing to fix in the typical case"
          : c.reliefAtSource
            ? locale === "fr"
              ? "Oui, si le compte est bien paramétré — vérifiez"
              : "Yes, if the account is set up right — check"
            : locale === "fr"
              ? "Non : récupération a posteriori obligatoire"
              : "No: after-the-fact reclaim is the only route";
      return [
        `${c.flag} ${c.name[locale]}`,
        pct(c.statutoryRate, locale),
        pct(treatyRateFor(c, "FR"), locale),
        fix,
      ];
    });
}

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Disons-le sans détour — et sans procès d'intention : votre courtier n'a **ni l'incitation économique, ni souvent l'outillage technique** pour vous rendre la retenue à la source prélevée en trop sur vos dividendes étrangers. Ce n'est pas de la malveillance : ce n'est simplement pas son métier. Sur les titres américains, certains le font d'ailleurs très bien — et gratuitement : vérifiez avant de payer qui que ce soit. Cet article vous montre comment contrôler votre relevé en cinq minutes, quelles questions exactes poser à votre courtier, et dans quels cas il suffit largement.`,
  },
  {
    type: "p",
    text: `Chaque ligne de dividende étranger de votre relevé contient deux chiffres que presque personne ne compare : le montant brut et l'impôt retenu. Entre les deux, il peut y avoir jusqu'à ${pts(recoveryGap(ie, "FR"), "fr")} points d'écart avec ce que les conventions fiscales vous accordent réellement (le cas irlandais). Le courtier affiche le net, vous encaissez le net, et personne dans la chaîne n'est payé pour poser la question qui fâche : « était-ce le bon taux ? ». Voici comment la poser vous-même — et quoi faire de la réponse.`,
  },
  { type: "h2", text: `Pourquoi votre courtier ne s'occupe-t-il pas de votre retenue à la source ?` },
  {
    type: "p",
    text: `La réponse n'est pas un scandale, c'est de la structure. Trois raisons, valables pour à peu près tous les intermédiaires, sans exception notable :`,
  },
  {
    type: "ul",
    items: [
      `**Ce n'est pas son modèle économique.** Un courtier se rémunère sur les ordres, les encours ou le change — pas sur la paperasse fiscale internationale, qui est pour lui un centre de coût sans revenu. Personne ne facture ce qu'il ne fait pas ; personne ne fait spontanément ce qui ne rapporte rien.`,
      `**Il n'a souvent pas la main.** Le relief at source — obtenir le bon taux dès le versement — suppose que **toute la chaîne de dépositaires** (courtier, dépositaire, sous-dépositaire local) transmette votre statut fiscal jusqu'au pays source. En compte omnibus, vos titres sont fondus dans une masse anonyme : l'administration étrangère applique le taux plein par défaut, et votre courtier, en bout de chaîne, ne peut pas grand-chose.`,
      `**Le reclaim n'est pas son métier.** Récupérer l'excédent a posteriori exige de connaître les formulaires (${ca.refundForm.fr} canadien, formulaire 83 suisse…), les millésimes, les règles de preuve et les délais de ${COUNTRIES.length} administrations aux pratiques différentes. C'est un métier de spécialiste, avec un outillage dédié — pas une extension naturelle du courtage.`,
    ],
  },
  {
    type: "p",
    text: `**L'exception qui mérite d'être dite : les titres américains.** Beaucoup de courtiers tiennent correctement un W-8BEN à jour et appliquent ${pct(treatyRateFor(us, "FR"), "fr")} à la source au lieu de ${pct(us.statutoryRate, "fr")} sur les [dividendes américains](${countryHref("fr", us.slug.fr)}). Si c'est votre cas, ne payez personne — nous compris — pour ce qui est déjà fait gratuitement. La vérification prend une minute (voir les questions plus bas) ; et si votre courtier ne le propose pas, le [forfait W-8BEN](${href("fr", "serviceW8ben")}) existe à ${eur(PRICING.fixedServices.w8ben, "fr")}.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Et les actions françaises détenues via un courtier étranger ?`,
    text: `C'est presque le cas inverse de tout cet article — et il mérite d'être détaillé plutôt que résumé en une phrase. Le plus souvent, c'est l'acompte français de 12,8 % qu'un courtier établi en France prélève automatiquement qui manque chez un courtier étranger : plus à payer au solde, pas un trop-perçu à récupérer. Mais il existe un second cas, réel et distinct : certains courtiers (Interactive Brokers en tête) détiennent vos actions françaises « au porteur » via une entité américaine, ce qui déclenche une vraie retenue au taux normal de l'IS (25 % depuis 2022) — un authentique trop-perçu, récupérable via les formulaires 5000/5001. [Les deux mécanismes, vérifiés, et comment savoir dans lequel vous êtes](${articleHref("fr", frenchSharesForeignBroker.slug.fr)}).`,
  },
  { type: "h2", text: `Comment vérifier en 5 minutes si vous êtes sur-prélevé ?` },
  {
    type: "p",
    text: `Pas besoin d'être fiscaliste : il faut un relevé et une division. Le plus rapide : collez la ligne de dividende dans notre [lecteur de relevé](${href("fr", "statementReader")}), gratuit, qui fait la division et le diagnostic pour vous. À la main, prenez votre dernier relevé de compte-titres (ou le rapport fiscal annuel de votre courtier) et suivez ces cinq étapes :`,
  },
  {
    type: "ol",
    items: [
      `**Repérez une ligne de dividende étranger.** Cherchez les mentions « dividende », « coupon » ou « distribution » associées à une société non française — l'ISIN qui ne commence pas par FR est un bon indice.`,
      `**Notez deux chiffres : le brut et l'impôt étranger retenu.** Selon les courtiers, la colonne s'appelle « retenue à la source », « withholding tax » ou « impôt étranger ». Si seul le net apparaît, la retenue est la différence entre brut et net (hors frais de courtage).`,
      `**Divisez l'impôt par le brut.** Le résultat est votre taux de retenue réel sur cette ligne.`,
      `**Comparez-le au taux conventionnel du pays** (colonne « taux conventionnel » du tableau ci-dessous, ou la fiche pays correspondante).`,
      `**S'il est supérieur, vous êtes sur-prélevé sur cette ligne.** Reste une vérification avant de vous réjouir : que le délai de réclamation soit encore ouvert — le [calculateur de prescription](${href("fr", "solCalculator")}) vous le dit gratuitement.`,
    ],
  },
  {
    type: "ledger-example",
    withheldLabel: `Retenue prélevée par la Suisse (${pct(ch.statutoryRate, "fr")})`,
    withheldAmount: eur(lineWithheld, "fr"),
    owedLabel: `Maximum dû selon la convention (${pct(treatyRateFor(ch, "FR"), "fr")})`,
    owedAmount: eur(lineOwed, "fr"),
    treatyRef: `CDI FR-CH`,
    recoverLabel: `Trop-perçu récupérable sur cette seule ligne`,
    recoverAmount: eur(lineRecoverable, "fr"),
    footnote: `Ligne de relevé illustrative : dividende brut de ${eur(LINE_GROSS, "fr")} d'une action suisse, actionnaire résident fiscal de France. Taux indicatifs, revus en juin 2026.`,
  },
  {
    type: "p",
    text: `Répétez l'exercice sur les autres lignes, puis sur les années précédentes : le trop-perçu se multiplie par le nombre de lignes et d'années — c'est là que les « petits » écarts deviennent des montants sérieux. Pour faire ce calcul sur tout un portefeuille en une fois, le [simulateur](${href("fr", "simulator")}) s'en charge gratuitement.`,
  },
  { type: "h2", text: `Quel taux devriez-vous voir sur votre relevé, pays par pays ?` },
  {
    type: "table",
    caption: `Taux indicatifs pour un particulier résident fiscal de France — données revues en juin 2026. Australie : la retenue ne frappe que les dividendes « unfranked » ; Royaume-Uni : exception pour les distributions de REIT (PID).`,
    headers: [
      `Pays source`,
      `Retenue par défaut`,
      `Taux conventionnel (résident FR)`,
      `Le courtier peut-il appliquer le bon taux à la source ?`,
    ],
    rows: statementRows("fr"),
  },
  {
    type: "callout",
    tone: "info",
    title: `Trois cas où il n'y a rien (ou presque) à récupérer`,
    text: `Le Royaume-Uni ne prélève rien sur les dividendes ordinaires (seules les distributions de REIT, dites PID, supportent 20 % — chiffre indicatif) ; l'Australie ne retient rien sur les dividendes « fully franked » ; et les [Pays-Bas](${countryHref("fr", nl.slug.fr)}) retiennent ${pct(nl.statutoryRate, "fr")}, soit déjà le taux conventionnel pour un particulier français. Si votre portefeuille se limite à ces cas, personne n'a d'argent à vous récupérer — nous préférons vous le dire ici plutôt que de vous laisser espérer.`,
  },
  { type: "h2", text: `Quelles questions poser à votre courtier ?` },
  {
    type: "p",
    text: `Poser la question ne coûte rien — c'est même le premier réflexe que nous recommandons, avant tout mandat. Copiez-collez celles-ci dans un message à votre courtier :`,
  },
  {
    type: "ul",
    items: [
      `« **Un W-8BEN valide est-il en place sur mon compte, et quelle est sa date d'expiration ?** » — il expire à la fin de la 3ᵉ année civile suivant sa signature, et un renouvellement oublié fait rebasculer vos dividendes américains au taux plein sans que rien ne vous alerte.`,
      `« **Pour quels pays appliquez-vous le taux conventionnel dès le versement, et à quelles conditions ?** » — la réponse honnête cite en général les États-Unis, rarement beaucoup plus.`,
      `« **Mes titres étrangers sont-ils détenus en compte ségrégué ou en compte omnibus ?** » — l'omnibus n'est pas un défaut, mais il explique pourquoi le bon taux ne « descend » pas jusqu'à vous.`,
      `« **Pouvez-vous me fournir les tax vouchers et attestations de détention qu'exigent les administrations étrangères, et à quel prix ?** » — ces pièces conditionnent toute récupération a posteriori, quel que soit le prestataire.`,
      `« **Proposez-vous un service de récupération de la retenue à la source ? Pour quels pays, à quel tarif, avec quel suivi ?** » — certains en proposent un, souvent réservé aux gros comptes ou aux titres américains.`,
    ],
  },
  {
    type: "p",
    text: `Lisez les réponses sans hostilité : un courtier qui répond précisément (W-8BEN à jour, vouchers fournis, périmètre annoncé) est un bon courtier. Des réponses vagues ne signifient pas qu'il faut en changer — elles signifient que ce périmètre reste à votre charge, et que vous savez désormais lequel.`,
  },
  { type: "h2", text: `Quand votre courtier suffit — et quand il ne suffit plus` },
  {
    type: "p",
    text: `La réponse honnête n'est pas « passez par nous ». Votre courtier suffit largement dans ces situations :`,
  },
  {
    type: "ul",
    items: [
      `**Titres américains avec W-8BEN valide et renouvelé** : ${pct(treatyRateFor(us, "FR"), "fr")} sont appliqués dès le versement — il n'y a rien à récupérer pour l'avenir, et rien à payer à qui que ce soit.`,
      `**Dividendes britanniques ordinaires, australiens « fully franked », néerlandais** : il n'y a tout simplement rien à récupérer (voir l'encadré ci-dessus) — un prestataire qui vous facture quelque chose sur ces lignes facture du vent.`,
      `**Pays où le relief at source fonctionne et où votre courtier confirme l'appliquer** — au Canada par exemple, un compte bien paramétré peut recevoir ${pct(treatyRateFor(ca, "FR"), "fr")} dès le versement ; en [Irlande](${countryHref("fr", ie.slug.fr)}), une déclaration d'exemption correctement déposée supprime la retenue future.`,
    ],
  },
  {
    type: "p",
    text: `À l'inverse, un mandataire spécialisé devient nécessaire quand la mécanique dépasse structurellement le courtier :`,
  },
  {
    type: "ul",
    items: [
      `**Suisse, Allemagne, Autriche, Suède** : pas de relief at source praticable pour un particulier — la récupération a posteriori, formulaire par formulaire, est le seul chemin, quel que soit votre courtier.`,
      `**Le passé** : un W-8BEN signé aujourd'hui ne rend pas les ${pct(us.statutoryRate, "fr")} déjà prélevés hier. Seul le reclaim rattrape l'historique — et il court contre [des délais de prescription qui expirent année après année](${articleHref("fr", missedDeadline.slug.fr)}) : c'est la lecture logique après cet article.`,
      `**Les dossiers à preuve exigeante** : plusieurs courtiers successifs, chaînes de dépositaires omnibus, exigences allemandes de chaîne de détention — un territoire de spécialiste, où le coût réel est dans la collecte de justificatifs.`,
    ],
  },
  {
    type: "p",
    text: `Et parfois, la réponse honnête est « personne » : sous un certain trop-perçu, avec notre plancher de ${eur(PRICING.floorFee, "fr")} par dossier abouti, la récupération ne vaut pas le dépôt — le [simulateur](${href("fr", "simulator")}) vous le dira gratuitement plutôt que de vous laisser engager un dossier non rentable.`,
  },
  {
    type: "p",
    text: `Retenez l'essentiel : votre courtier n'est pas votre adversaire, mais personne dans la chaîne n'est payé pour comparer le taux prélevé au taux conventionnel — désormais, vous savez le faire vous-même en cinq minutes. Chaque année qui passe sans vérification, une année de trop-perçu se rapproche de la prescription. La suite logique prend deux minutes : passez votre relevé au simulateur. Et s'il y a effectivement quelque chose à récupérer, notre [grille au succès](${href("fr", "pricing")}) s'applique uniquement sur ce qui aboutit — rien en cas d'échec.`,
  },
  { type: "h2", text: `Vos questions sur le rôle du courtier` },
  {
    type: "faq",
    items: [
      {
        question: `Mon courtier m'a déjà fait remplir un W-8BEN : suis-je couvert ?`,
        answer: `Pour les dividendes américains de ce compte, oui — tant qu'il est valide : il expire à la fin de la 3ᵉ année civile suivant sa signature, et il ne vaut que pour le compte où il est déposé. Il ne change rien à la Suisse, à l'Allemagne ni aux autres pays, et ne rattrape jamais les montants déjà prélevés avant sa mise en place.`,
      },
      {
        question: `Changer de courtier réglerait-il le problème ?`,
        answer: `Partiellement, au mieux. Un courtier mieux paramétré peut améliorer le taux à la source sur certains pays (États-Unis, Canada, Irlande notamment). Mais il ne rattrapera jamais le passé, et pour la Suisse, l'Allemagne, l'Autriche ou la Suède, la récupération a posteriori reste le seul chemin — quel que soit l'intermédiaire.`,
      },
      {
        question: `Pourquoi mon courtier ne m'a-t-il jamais prévenu ?`,
        answer: `Parce que rien ne l'y oblige et que rien ne l'y incite : la convention fiscale entre votre pays de résidence et le pays source ne fait pas partie de son contrat. Ce n'est pas un scandale, c'est un angle mort structurel — que certains courtiers comblent d'ailleurs très bien sur les titres américains.`,
      },
      {
        question: `Mon courtier propose un service de récupération : est-ce une arnaque ?`,
        answer: `Pas du tout — certains le font sérieusement, en particulier sur les titres américains ou pour les comptes importants. Posez trois questions : quels pays sont couverts, à quel prix, et avec quel suivi. Puis comparez avec notre [grille publique](${href("fr", "pricing")}) : si son offre est meilleure pour votre cas, prenez-la. Comparer, c'est exactement ce que nous vous recommandons de faire — nous y compris.`,
      },
      {
        question: `Mon relevé n'indique pas la retenue à la source : comment vérifier ?`,
        answer: `Demandez le rapport fiscal annuel ou les tax vouchers à votre courtier — il doit pouvoir les fournir. À défaut, la différence entre dividende brut et net encaissé (hors frais de courtage) donne une première estimation. Et notre diagnostic accepte les relevés bruts : envoyer un PDF illisible pour vous ne l'est pas pour nous.`,
      },
      {
        question: `Vérifier tout cela est-il vraiment gratuit ?`,
        answer: `Oui : la vérification en cinq minutes ci-dessus, le simulateur et le calculateur de prescription sont gratuits et sans création de compte. Vous ne payez que si nous récupérons effectivement quelque chose — ou si vous choisissez un forfait ponctuel (W-8BEN à ${eur(PRICING.fixedServices.w8ben, "fr")}, par exemple), annoncé avant toute commande.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculer mon trop-perçu`,
    note: `Gratuit, sans création de compte — vos relevés suffisent.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `Let's say it plainly — and without insinuation: your broker has **neither the economic incentive nor, often, the technical tooling** to give you back the withholding tax over-deducted from your foreign dividends. It is not malice: it is simply not their trade. On US securities, some brokers actually handle it very well — for free: check before paying anyone. This article shows you how to audit your statement in five minutes, the exact questions to ask your broker, and the cases where they are entirely sufficient.`,
  },
  {
    type: "p",
    text: `Every foreign dividend line on your statement carries two figures almost nobody compares: the gross amount and the tax withheld. Between the two, there can be up to ${pts(recoveryGap(ie, "FR"), "en")} points of difference with what tax treaties actually grant you (the Irish case). The broker displays the net, you receive the net, and nobody along the chain is paid to ask the awkward question: "was that the right rate?". Here is how to ask it yourself — and what to do with the answer.`,
  },
  { type: "h2", text: `Why doesn't your broker handle your withholding tax?` },
  {
    type: "p",
    text: `The answer is not a scandal, it is structure. Three reasons, true of virtually every intermediary, with no notable exception:`,
  },
  {
    type: "ul",
    items: [
      `**It is not their business model.** A broker earns on orders, assets under custody or FX — not on international tax paperwork, which for them is a cost centre with no revenue attached. Nobody charges for what they don't do; nobody spontaneously does what earns nothing.`,
      `**They often don't hold the levers.** Relief at source — getting the right rate at payment time — requires **the entire custodian chain** (broker, custodian, local sub-custodian) to pass your tax status all the way to the source country. In an omnibus account, your securities are pooled into an anonymous mass: the foreign administration applies the full rate by default, and your broker, at the end of the chain, can do little about it.`,
      `**Reclaims are not their trade.** Recovering the excess after the fact means knowing the forms (Canada's ${ca.refundForm.en}, Switzerland's Form 83…), the form versions, the evidence rules and the deadlines of ${COUNTRIES.length} administrations with different practices. It is a specialist's trade with dedicated tooling — not a natural extension of brokerage.`,
    ],
  },
  {
    type: "p",
    text: `**The exception worth stating: US securities.** Many brokers correctly maintain a W-8BEN and apply ${pct(treatyRateFor(us, "FR"), "en")} at source instead of ${pct(us.statutoryRate, "en")} on [US dividends](${countryHref("en", us.slug.en)}). If that is your case, pay nobody — us included — for what is already done for free. Checking takes a minute (see the questions below); and if your broker doesn't offer it, the [W-8BEN fixed-fee service](${href("en", "serviceW8ben")}) exists at ${eur(PRICING.fixedServices.w8ben, "en")}.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `What about French shares held through a foreign broker?`,
    text: `This is close to the mirror case of everything else in this article — and it deserves detail rather than a one-line summary. Most often, it's the French 12.8% advance payment that a France-based broker withholds automatically that goes missing with a foreign broker: more to pay at settlement, not an over-withholding to recover. But there's a second, real and distinct case: some brokers (Interactive Brokers foremost) hold your French shares "in street name" through a US entity, which triggers a genuine withholding at the standard corporate tax rate (25% since 2022) — a real over-withholding, recoverable via forms 5000/5001. [Both mechanisms, verified, and how to tell which one you're in](${articleHref("en", frenchSharesForeignBroker.slug.en)}).`,
  },
  { type: "h2", text: `How do you check in 5 minutes whether you are over-withheld?` },
  {
    type: "p",
    text: `No tax degree required: you need a statement and one division. The fastest route: paste the dividend line into our free [statement reader](${href("en", "statementReader")}), which does the division and the diagnosis for you. By hand, take your latest securities-account statement (or your broker's annual tax report) and follow these five steps:`,
  },
  {
    type: "ol",
    items: [
      `**Find a foreign dividend line.** Look for "dividend", "coupon" or "distribution" against a non-domestic company — an ISIN that doesn't start with your home country code is a good tell.`,
      `**Write down two figures: the gross amount and the foreign tax withheld.** Depending on the broker, the column is called "withholding tax", "foreign tax" or similar. If only the net is shown, the withholding is the difference between gross and net (excluding brokerage fees).`,
      `**Divide the tax by the gross.** The result is your actual withholding rate on that line.`,
      `**Compare it with the country's treaty rate** (the "treaty rate" column in the table below, or the matching country page).`,
      `**If it is higher, you are over-withheld on that line.** One check remains before celebrating: that the claim window is still open — the [deadline calculator](${href("en", "solCalculator")}) tells you for free.`,
    ],
  },
  {
    type: "ledger-example",
    withheldLabel: `Withheld by Switzerland (${pct(ch.statutoryRate, "en")})`,
    withheldAmount: eur(lineWithheld, "en"),
    owedLabel: `Maximum owed under the treaty (${pct(treatyRateFor(ch, "FR"), "en")})`,
    owedAmount: eur(lineOwed, "en"),
    treatyRef: `FR-CH tax treaty`,
    recoverLabel: `Recoverable excess on this single line`,
    recoverAmount: eur(lineRecoverable, "en"),
    footnote: `Illustrative statement line: ${eur(LINE_GROSS, "en")} gross dividend from a Swiss share, shareholder resident in France for tax purposes. Indicative rates, reviewed in June 2026.`,
  },
  {
    type: "p",
    text: `Repeat the exercise on the other lines, then on previous years: the excess multiplies by the number of lines and years — that is where "small" gaps become serious money. To run the maths on a whole portfolio at once, the [simulator](${href("en", "simulator")}) does it for free.`,
  },
  { type: "h2", text: `Which rate should you see on your statement, country by country?` },
  {
    type: "table",
    caption: `Indicative rates for an individual French tax resident — data reviewed in June 2026. Australia: withholding only hits unfranked dividends; United Kingdom: exception for REIT distributions (PIDs).`,
    headers: [
      `Source country`,
      `Default withholding`,
      `Treaty rate (FR resident)`,
      `Can the broker apply the right rate at source?`,
    ],
    rows: statementRows("en"),
  },
  {
    type: "callout",
    tone: "info",
    title: `Three cases where there is (almost) nothing to recover`,
    text: `The United Kingdom withholds nothing on ordinary dividends (only REIT distributions, known as PIDs, bear 20% — indicative figure); Australia withholds nothing on fully franked dividends; and the [Netherlands](${countryHref("en", nl.slug.en)}) withholds ${pct(nl.statutoryRate, "en")}, which is already the treaty rate for a French individual. If your portfolio is limited to these cases, nobody has money to recover for you — we would rather tell you here than let you hope.`,
  },
  { type: "h2", text: `What questions should you ask your broker?` },
  {
    type: "p",
    text: `Asking costs nothing — it is the very first reflex we recommend, before any mandate. Copy-paste these into a message to your broker:`,
  },
  {
    type: "ul",
    items: [
      `"**Is a valid W-8BEN in place on my account, and when does it expire?**" — it expires at the end of the third calendar year after signature, and a missed renewal silently reverts your US dividends to the full rate.`,
      `"**For which countries do you apply the treaty rate at payment time, and under what conditions?**" — the honest answer usually names the United States, and rarely much more.`,
      `"**Are my foreign securities held in a segregated or an omnibus account?**" — omnibus is not a flaw, but it explains why the right rate doesn't "flow down" to you.`,
      `"**Can you provide the tax vouchers and custody confirmations foreign administrations require, and at what price?**" — these documents condition any after-the-fact recovery, whoever the provider is.`,
      `"**Do you offer a withholding-tax recovery service? For which countries, at what price, with what follow-through?**" — some do offer one, often limited to large accounts or US securities.`,
    ],
  },
  {
    type: "p",
    text: `Read the answers without hostility: a broker who answers precisely (up-to-date W-8BEN, vouchers available, scope stated) is a good broker. Vague answers don't mean you should switch — they mean this territory remains yours to handle, and you now know exactly which one.`,
  },
  { type: "h2", text: `When your broker is enough — and when they no longer are` },
  {
    type: "p",
    text: `The honest answer is not "come to us". Your broker is entirely sufficient in these situations:`,
  },
  {
    type: "ul",
    items: [
      `**US securities with a valid, renewed W-8BEN**: ${pct(treatyRateFor(us, "FR"), "en")} is applied at payment time — there is nothing to recover going forward, and nothing to pay anyone.`,
      `**Ordinary UK dividends, fully franked Australian dividends, Dutch dividends**: there is simply nothing to recover (see the box above) — a provider charging you anything on those lines is charging you for thin air.`,
      `**Countries where relief at source works and your broker confirms applying it** — in Canada, for instance, a well-configured account can receive ${pct(treatyRateFor(ca, "FR"), "en")} at payment time; in [Ireland](${countryHref("en", ie.slug.en)}), a properly filed exemption declaration removes future withholding.`,
    ],
  },
  {
    type: "p",
    text: `Conversely, a specialised agent becomes necessary where the mechanics structurally exceed the broker:`,
  },
  {
    type: "ul",
    items: [
      `**Switzerland, Germany, Austria, Sweden**: no workable relief at source for individuals — the after-the-fact reclaim, form by form, is the only route, whoever your broker is.`,
      `**The past**: a W-8BEN signed today does not give back the ${pct(us.statutoryRate, "en")} already withheld yesterday. Only a reclaim catches up on the history — and it runs against [statutes of limitations that expire year after year](${articleHref("en", missedDeadline.slug.en)}): the logical next read after this article.`,
      `**Evidence-heavy files**: several successive brokers, omnibus custodian chains, German chain-of-custody requirements — specialist territory, where the real cost sits in gathering the supporting documents.`,
    ],
  },
  {
    type: "p",
    text: `And sometimes the honest answer is "nobody": below a certain excess, with our ${eur(PRICING.floorFee, "en")} floor per successful claim, recovery is not worth filing — the [simulator](${href("en", "simulator")}) will tell you so for free rather than letting you commit to an uneconomic file.`,
  },
  {
    type: "p",
    text: `The takeaway: your broker is not your adversary, but nobody in the chain is paid to compare the withheld rate with the treaty rate — and you now know how to do it yourself in five minutes. Every year that passes unchecked, another year of over-withholding drifts towards its deadline. The logical next step takes two minutes: run your statement through the simulator. And if there really is something to recover, our [success-fee grid](${href("en", "pricing")}) applies only to what succeeds — nothing on failure.`,
  },
  { type: "h2", text: `Your questions about the broker's role` },
  {
    type: "faq",
    items: [
      {
        question: `My broker already had me fill in a W-8BEN: am I covered?`,
        answer: `For the US dividends of that account, yes — as long as it is valid: it expires at the end of the third calendar year after signature, and it only applies to the account where it is filed. It changes nothing for Switzerland, Germany or other countries, and it never recovers amounts withheld before it was put in place.`,
      },
      {
        question: `Would switching brokers solve the problem?`,
        answer: `Partially, at best. A better-configured broker can improve the at-source rate for some countries (the United States, Canada and Ireland in particular). But it will never catch up on the past, and for Switzerland, Germany, Austria or Sweden the after-the-fact reclaim remains the only route — whoever the intermediary.`,
      },
      {
        question: `Why did my broker never warn me?`,
        answer: `Because nothing obliges them to and nothing rewards it: the tax treaty between your country of residence and the source country is not part of their contract. It is not a scandal, it is a structural blind spot — one that some brokers actually cover very well on US securities.`,
      },
      {
        question: `My broker offers a recovery service: is it a scam?`,
        answer: `Not at all — some do it seriously, especially on US securities or for large accounts. Ask three questions: which countries are covered, at what price, with what follow-through. Then compare with our [public grid](${href("en", "pricing")}): if their offer is better for your case, take it. Comparing is exactly what we recommend you do — with us included.`,
      },
      {
        question: `My statement doesn't show the withholding: how do I check?`,
        answer: `Ask your broker for the annual tax report or the tax vouchers — they should be able to provide them. Failing that, the difference between the gross dividend and the net received (excluding brokerage fees) gives a first estimate. And our diagnostic accepts raw statements: a PDF that is unreadable to you isn't to us.`,
      },
      {
        question: `Is checking all of this really free?`,
        answer: `Yes: the five-minute check above, the simulator and the deadline calculator are free and require no account. You only pay if we actually recover something — or if you choose a one-off fixed-fee service (the W-8BEN at ${eur(PRICING.fixedServices.w8ben, "en")}, for instance), always announced before any order.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Calculate my refund`,
    note: `Free, no account needed — your statements are enough.`,
  },
];

export const brokerWontTellYou: Article = {
  id: "broker-wont-tell-you",
  slug: {
    fr: "retenue-a-la-source-ce-que-votre-courtier-ne-dit-pas",
    en: "withholding-tax-what-your-broker-wont-tell-you",
  },
  category: "problems",
  title: {
    fr: "Retenue à la source : ce que votre courtier ne vous dira pas",
    en: "Withholding tax: what your broker won't tell you",
  },
  description: {
    fr: "Ni incompétence ni complot : la récupération de retenue à la source n'est simplement pas le métier de votre courtier. Comment vérifier votre relevé en cinq minutes, les questions exactes à lui poser — et les cas, nombreux, où il suffit largement.",
    en: "Neither incompetence nor conspiracy: withholding-tax recovery is simply not your broker's trade. How to check your statement in five minutes, the exact questions to ask them — and the many cases where they are entirely sufficient.",
  },
  updated: "2026-07-08",
  readingMinutes: 10,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US", "CH", "IE", "FR"],
};
