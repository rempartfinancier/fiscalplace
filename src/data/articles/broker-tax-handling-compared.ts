import { formatPercent, type Locale } from "@/lib/i18n";
import { articleHref, countryHref, href } from "@/lib/routes";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { brokerWontTellYou } from "./broker-wont-tell-you";
import { frenchSharesForeignBroker } from "./french-shares-foreign-broker";
import type { Article, ArticleBlock } from "./types";

/**
 * COMPARISONS — "Broker tax handling compared". Names three brokers, each
 * for a specific, sourced, structural mechanism (not a quality judgement):
 *  - Interactive Brokers: French-share street-name custody (already
 *    verified this session, see french-shares-foreign-broker.ts).
 *  - DEGIRO: US relief-at-source exists but is conditioned on a
 *    residence/tax-residence/bank-account country match, confirmed on
 *    DEGIRO's own help centre (degiro.ie/helpdesk).
 *  - Trade Republic: automatic 15% US withholding via its own Qualified
 *    Intermediary status, confirmed on support.traderepublic.com.
 * Any broker not covered here is deliberately NOT characterized — the
 * article points to broker-wont-tell-you.ts's existing question checklist
 * instead of inventing unverified claims about untested brokers.
 */

const us = getCountryById("US")!;

const pct = (rate: number, locale: Locale) => formatPercent(rate, locale, 3);

const frContent: ArticleBlock[] = [
  {
    type: "p",
    text: `« Mon courtier gère ça très bien » et « mon courtier ne gère rien du tout » peuvent être vrais en même temps, pour deux courtiers différents, sur le même sujet. Le traitement fiscal de vos dividendes n'est pas une question de chance : c'est une conséquence directe de choix structurels que chaque courtier a faits — et documentés, parfois publiquement. Voici trois mécanismes vérifiés chez trois courtiers utilisés par des résidents français, et comment vérifier le vôtre s'il n'y figure pas.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Trois mécanismes structurels, pas un classement`,
    text: `Chaque courtier cité ci-dessous l'est pour un mécanisme précis, sourcé sur sa propre documentation officielle — pas pour un jugement de qualité globale. Un courtier peut bien gérer un sujet et mal en gérer un autre : c'est justement pourquoi il faut vérifier point par point, pas globalement.`,
  },
  { type: "h2", text: `Interactive Brokers : la détention « au porteur » de vos actions françaises` },
  {
    type: "p",
    text: `Interactive Brokers détient les titres de ses clients « au porteur » (street name) via son entité américaine, Interactive Brokers LLC — y compris pour des actions françaises. Conséquence documentée : sur un dividende **français** (LVMH, Total, Sanofi…), l'administration française applique la retenue due par un actionnaire non-résident personne morale, et non le régime d'un particulier résident de France. Nous avons vérifié ce mécanisme en détail, avec le taux réellement observé et la marche à suivre pour le récupérer : [le détail complet](${articleHref("fr", frenchSharesForeignBroker.slug.fr)}).`,
  },
  { type: "h2", text: `DEGIRO : la réduction à la source américaine existe, sous conditions` },
  {
    type: "p",
    text: `DEGIRO propose, dans les paramètres fiscaux du compte, une démarche de réduction à la source sur les dividendes américains — un W-8BEN/W-8BEN-E numérique. Mécanisme documenté par DEGIRO lui-même : cette démarche exige que le pays de résidence, le pays de résidence fiscale et le pays du compte bancaire de rattachement **coïncident tous les trois**. Un résident français avec un compte bancaire hors de France peut donc voir cette réduction refusée, alors qu'un W-8BEN classique auprès d'un autre courtier n'impose pas cette contrainte. Le renouvellement suit la même règle que partout ailleurs : tous les 3 ans, ou en cas de changement de situation.`,
  },
  { type: "h2", text: `Trade Republic : une réduction automatique par statut d'intermédiaire qualifié` },
  {
    type: "p",
    text: `Trade Republic (Trade Republic Bank GmbH, établie en Allemagne) documente que son propre statut de « Qualified Intermediary » auprès du fisc américain lui permet d'appliquer directement ${pct(0.15, "fr")} de retenue sur les dividendes américains de ses clients — contre ${pct(0.3, "fr")} de taux plein — sans démarche W-8BEN distincte à effectuer par le client. C'est un exemple concret de ce que ce site décrit ailleurs comme « l'exception qui mérite d'être dite » : certains courtiers appliquent correctement, et gratuitement, le bon taux dès le versement.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `Ce que ces trois mécanismes ne disent pas`,
    text: `Aucun des trois faits ci-dessus ne renseigne sur la manière dont ces courtiers traitent l'acompte français de 12,8 % (PFNL) sur des actions françaises. Trade Republic et DEGIRO, n'étant pas établis en France, ne sont en règle générale pas soumis à cette obligation, sauf cas particulier — voir le [mécanisme complet](${articleHref("fr", frenchSharesForeignBroker.slug.fr)}). Ce n'est pas un trop-perçu : c'est un impôt qui reste dû en totalité à la déclaration.`,
  },
  { type: "h2", text: `Tableau récapitulatif` },
  {
    type: "table",
    caption: `Trois mécanismes vérifiés, sourcés sur la documentation officielle de chaque courtier — pas un classement global.`,
    headers: [`Courtier`, `Retenue US : réduite automatiquement ?`, `Actions françaises : détention`, `Établi en France ?`],
    rows: [
      [
        `Interactive Brokers`,
        `Oui, via W-8BEN`,
        `« Au porteur » via une entité américaine — retenue française d'entité non-résidente possible`,
        `Non`,
      ],
      [
        `DEGIRO`,
        `Oui, si résidence/résidence fiscale/compte bancaire coïncident`,
        `Non vérifié dans cet article — à vérifier auprès du courtier`,
        `Non`,
      ],
      [
        `Trade Republic`,
        `Oui, automatiquement (statut Qualified Intermediary)`,
        `Non vérifié dans cet article — à vérifier auprès du courtier`,
        `Non`,
      ],
      [
        `Votre courtier`,
        `À vérifier`,
        `À vérifier`,
        `À vérifier`,
      ],
    ],
  },
  { type: "h2", text: `Votre courtier n'est pas dans ce tableau ?` },
  {
    type: "p",
    text: `Plutôt que d'inventer un mécanisme que nous n'avons pas vérifié pour votre courtier précis, nous préférons vous donner les questions exactes à lui poser — les mêmes que nous recommandons pour n'importe quel courtier, avec les réponses attendues et ce qu'elles signifient : [Retenue à la source : ce que votre courtier ne vous dira pas](${articleHref("fr", brokerWontTellYou.slug.fr)}).`,
  },
  { type: "h2", text: `Vos questions sur le traitement fiscal par courtier` },
  {
    type: "faq",
    items: [
      {
        question: `Interactive Brokers est-il un mauvais courtier à cause de la détention au porteur ?`,
        answer: `Non — c'est un choix structurel courant chez les courtiers adossés à une entité américaine, pas une malfaçon. La conséquence sur vos actions françaises est réelle et vérifiée, mais elle se corrige : c'est un vrai trop-perçu, récupérable via les formulaires 5000/5001.`,
      },
      {
        question: `Dois-je changer de courtier après avoir lu cet article ?`,
        answer: `Ce n'est pas ce que cet article recommande : chaque mécanisme cité a une contrepartie (Interactive Brokers applique correctement le W-8BEN américain, par exemple). Changer de courtier ne rattrape jamais le passé — seule une demande de remboursement le fait.`,
      },
      {
        question: `Comment vérifier le mécanisme exact de mon propre courtier ?`,
        answer: `Consultez la section fiscale de son centre d'aide (souvent sous « Tax », « Fiscalité » ou « Documents fiscaux »), et posez-lui directement les questions listées dans [notre article dédié](${articleHref("fr", brokerWontTellYou.slug.fr)}). Une réponse précise et documentée est le signe d'un courtier qui maîtrise le sujet.`,
      },
      {
        question: `FiscalPlace a-t-il un partenariat avec l'un de ces courtiers ?`,
        answer: `Non. Les faits cités ici proviennent exclusivement de la documentation publique de chaque courtier, sans lien commercial ni accès privilégié.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Vérifier mon propre relevé`,
    note: `Quel que soit votre courtier, le simulateur et le lecteur de relevé s'appliquent de la même façon.`,
  },
];

const enContent: ArticleBlock[] = [
  {
    type: "p",
    text: `"My broker handles this really well" and "my broker handles none of this" can both be true at once, for two different brokers, on the same topic. How your dividends are taxed isn't a matter of luck: it's a direct consequence of structural choices each broker made — sometimes publicly documented. Here are three verified mechanisms at three brokers used by French residents, and how to check your own if it isn't listed.`,
  },
  {
    type: "callout",
    tone: "info",
    title: `Three structural mechanisms, not a ranking`,
    text: `Each broker below is named for one precise mechanism, sourced from its own official documentation — not for an overall quality judgement. A broker can handle one topic well and another poorly: that's exactly why it's worth checking point by point, not broker by broker.`,
  },
  { type: "h2", text: `Interactive Brokers: "street name" custody on your French shares` },
  {
    type: "p",
    text: `Interactive Brokers holds client securities "in street name" through its US entity, Interactive Brokers LLC — including French shares. Documented consequence: on a **French** dividend (LVMH, Total, Sanofi…), the French administration applies the withholding owed by a non-resident corporate shareholder, not the regime of an individual French resident. We verified this mechanism in detail, with the actually observed rate and how to recover it: [the full breakdown](${articleHref("en", frenchSharesForeignBroker.slug.en)}).`,
  },
  { type: "h2", text: `DEGIRO: US relief at source exists, with conditions` },
  {
    type: "p",
    text: `DEGIRO offers, in the account's tax settings, a relief-at-source process for US dividends — a digital W-8BEN/W-8BEN-E. Mechanism documented by DEGIRO itself: this process requires that the country of residence, country of tax residence, and the bank account's country **all match**. A French resident with a bank account outside France could therefore see this relief denied, whereas a standard W-8BEN with another broker carries no such constraint. Renewal follows the same rule as everywhere else: every 3 years, or on a change of circumstances.`,
  },
  { type: "h2", text: `Trade Republic: an automatic reduction via qualified-intermediary status` },
  {
    type: "p",
    text: `Trade Republic (Trade Republic Bank GmbH, established in Germany) documents that its own "Qualified Intermediary" status with the US tax authorities lets it apply ${pct(0.15, "en")} withholding directly on clients' US dividends — instead of the full ${pct(0.3, "en")} rate — with no separate W-8BEN step required from the client. It's a concrete example of what this site elsewhere calls "the exception worth stating": some brokers correctly apply the right rate at source, for free.`,
  },
  {
    type: "callout",
    tone: "warning",
    title: `What these three mechanisms don't tell you`,
    text: `None of the three facts above says anything about how these brokers handle the French 12.8% advance payment (PFNL) on French shares. Trade Republic and DEGIRO, not being established in France, are generally not bound by that obligation, barring specific cases — see the [full mechanism](${articleHref("en", frenchSharesForeignBroker.slug.en)}). That's not an over-withholding: it's tax that remains fully due when you file.`,
  },
  { type: "h2", text: `Summary table` },
  {
    type: "table",
    caption: `Three verified mechanisms, sourced from each broker's own official documentation — not a general ranking.`,
    headers: [`Broker`, `US withholding reduced automatically?`, `French shares: custody`, `Established in France?`],
    rows: [
      [
        `Interactive Brokers`,
        `Yes, via W-8BEN`,
        `"Street name" through a US entity — French non-resident-entity withholding possible`,
        `No`,
      ],
      [
        `DEGIRO`,
        `Yes, if residence/tax residence/bank account all match`,
        `Not verified in this article — check with the broker`,
        `No`,
      ],
      [
        `Trade Republic`,
        `Yes, automatically (Qualified Intermediary status)`,
        `Not verified in this article — check with the broker`,
        `No`,
      ],
      [
        `Your broker`,
        `To check`,
        `To check`,
        `To check`,
      ],
    ],
  },
  { type: "h2", text: `Your broker isn't in this table?` },
  {
    type: "p",
    text: `Rather than inventing a mechanism we haven't verified for your specific broker, we'd rather give you the exact questions to ask them — the same ones we recommend for any broker, with the answers to expect and what they mean: [Withholding tax: what your broker won't tell you](${articleHref("en", brokerWontTellYou.slug.en)}).`,
  },
  { type: "h2", text: `Your questions about broker tax handling` },
  {
    type: "faq",
    items: [
      {
        question: `Is Interactive Brokers a bad broker because of street-name custody?`,
        answer: `No — it's a common structural choice for brokers backed by a US entity, not a defect. The consequence on your French shares is real and verified, but it's fixable: it's a genuine over-withholding, recoverable via forms 5000/5001.`,
      },
      {
        question: `Should I switch brokers after reading this?`,
        answer: `That's not what this article recommends: each mechanism listed has a counterpart (Interactive Brokers correctly applies the US W-8BEN, for instance). Switching brokers never catches up on the past — only a refund claim does.`,
      },
      {
        question: `How do I check the exact mechanism at my own broker?`,
        answer: `Check the tax section of their help centre (often under "Tax", "Tax documents", or similar), and ask them directly the questions listed in [our dedicated article](${articleHref("en", brokerWontTellYou.slug.en)}). A precise, documented answer is the sign of a broker that has this under control.`,
      },
      {
        question: `Does FiscalPlace have a partnership with any of these brokers?`,
        answer: `No. The facts cited here come exclusively from each broker's public documentation, with no commercial relationship or privileged access.`,
      },
    ],
  },
  {
    type: "cta",
    routeKey: "simulator",
    label: `Check my own statement`,
    note: `Whatever your broker, the simulator and the statement reader work the same way.`,
  },
];

export const brokerTaxHandlingCompared: Article = {
  id: "broker-tax-handling-compared",
  slug: {
    fr: "traitement-fiscal-par-courtier-compare",
    en: "broker-tax-handling-compared",
  },
  category: "comparisons",
  title: {
    fr: "Retenue à la source : ce que font vraiment Interactive Brokers, DEGIRO et Trade Republic",
    en: "Withholding tax: what Interactive Brokers, DEGIRO and Trade Republic actually do",
  },
  description: {
    fr: "Trois mécanismes fiscaux vérifiés, sourcés sur la documentation officielle de chaque courtier : la détention au porteur chez Interactive Brokers, la condition de résidence chez DEGIRO, le statut d'intermédiaire qualifié chez Trade Republic — et comment vérifier le vôtre.",
    en: "Three verified tax mechanisms, sourced from each broker's own official documentation: Interactive Brokers' street-name custody, DEGIRO's residency condition, Trade Republic's qualified-intermediary status — and how to check your own.",
  },
  updated: "2026-04-06",
  readingMinutes: 8,
  content: { fr: frContent, en: enContent },
  relatedCountries: ["US", "FR"],
};
