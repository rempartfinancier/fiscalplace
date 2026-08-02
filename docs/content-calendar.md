# Calendrier éditorial — fiscalplace.com

Mémoire de la routine de publication automatique (mardi et vendredi, 8h). Ce
fichier est la seule source de contexte dont dispose chaque exécution : il n'a
pas accès aux conversations précédentes. Avant d'écrire quoi que ce soit,
toute exécution doit relire ce fichier en entier, ainsi que
`docs/CONVENTIONS.md`.

## Où vit le contenu

- Schéma : `src/data/articles/types.ts` (`Article`, `ArticleBlock`,
  `ArticleCategory`).
- Un fichier par article : `src/data/articles/<id>.ts`.
- Registre central (ordre + lookup) : `src/data/articles/index.ts` — **lire
  ce fichier en premier** pour connaître tous les sujets déjà publiés
  (slugs, titres) et éviter tout doublon.
- Route hub : `/ressources` (FR) / `/resources` (EN), via `articleHref()`
  dans `src/lib/routes.ts`.

## Méthodologie — Big 5 (They Ask You Answer, Marcus Sheridan)

Chaque article répond à une vraie question à forte intention commerciale
posée par un investisseur français détenant des actions ou ETF étrangers.
Les 5 axes prioritaires correspondent exactement aux valeurs de
`ArticleCategory` :

1. **cost** (Coût & prix) — combien coûte réellement une récupération, une
   prestation, ou l'inaction.
2. **problems** (Problèmes & risques) — ce qui peut mal tourner : rejets,
   pièges administratifs, délais dépassés, angles morts méconnus.
3. **comparisons** (Comparaisons) — X vs Y, chiffré à partir des données du
   site, sans favoriser artificiellement une option.
4. **reviews** (Avis & retours) — prise de position assumée, y compris
   contre une pratique répandue (PEA, courtier, produit financier), sans
   jamais inventer de témoignage ou d'avis client.
5. **best** (Classements) — meilleure option par profil ou situation,
   toujours généré depuis `@/data/countries` ou `@/config/pricing`, jamais
   recopié à la main.

Répartition au 2026-08-02 : cost (4), problems (6), comparisons (5),
reviews (1), best (3). La catégorie **reviews** était vide avant cette
session — c'est le déséquilibre le plus net à corriger en priorité dans les
prochains runs.

## Garde-fous anti-fabrication (rappel — détail complet dans CONVENTIONS.md §5)

- **Aucun taux, délai ou tarif recopié à la main.** Toujours importer
  `@/data/countries` (taux, délais de prescription, formulaires) et
  `@/config/pricing` (commission, frais fixes). Utiliser les fonctions
  exposées (`treatyRateFor`, `recoveryGap`, `solDeadline`,
  `computeCommission`) plutôt que des constantes littérales.
- **Toute règle fiscale/légale non couverte par ces deux fichiers** (mécanique
  d'un dispositif français, procédure administrative, jurisprudence, actualité
  réglementaire) doit être vérifiée par recherche web au moment de la
  rédaction — les seuils et pratiques changent. Ne jamais présenter une
  information non vérifiée comme un fait établi ; utiliser une formulation
  prudente (« en règle générale », « à confirmer selon votre cas ») quand la
  source est incertaine, à l'image des champs `verify` de `countries.ts`.
- **Jamais inventer** : raison sociale, forme juridique, agrément ORIAS/RCS,
  IBAN, nom ou bio de membre d'équipe réel, témoignage client, logo
  partenaire, certification (ISO, SOC 2), chiffre de traction (« X clients »,
  « Y € récupérés »). Utiliser le placeholder `[… À COMPLÉTER]` si une
  information manque — jamais une valeur plausible inventée.
- **Identité légale verrouillée** (vérifiée dans `legalNotice.tsx` — ne pas
  se fier à `about.tsx` ni au footer commun, non synchronisés au
  2026-08-02) : société éditrice **EXP Capital**, SASU au capital de
  1 000 €, RCS Versailles n° 987 986 247, ORIAS n° 25005915, siège 25 bis
  rue de la Côte, 78220 Viroflay, directeur de publication Alexandre
  Pollet. Ne jamais réutiliser l'identité d'un autre site du groupe.
- **Mode de rémunération réel** : commission au succès uniquement (no win,
  no fee), barème dégressif marginal par tranche (`PRICING.successFeeTiers`),
  plancher et plafond définis dans `@/config/pricing`. Jamais de frais
  d'ouverture de dossier. Ne jamais présenter le service comme du conseil
  fiscal personnalisé réglementé (disclaimer AMF déjà en place sur le site).
- **FiscalPlace = démarches administratives et fiscales, pas de conseil en
  investissement.** Aucune phrase ne doit pouvoir être lue comme une
  recommandation d'investissement (choix d'actions, de courtier au sens
  commercial, de pays où investir pour rendement).
- Avant de rendre la main : `npx tsc --noEmit`, puis `eslint` scopé aux
  fichiers touchés. Ne pas lancer `npm run build` sauf vérification manuelle
  ponctuelle (coûteux) — le typecheck + lint scopé suffit en routine.
  Vérifier visuellement au moins une des pages nouvellement créées via le
  serveur de dev si le Browser pane le permet dans la session.

## Backlog priorisé (prochains runs — à retirer une fois traité, sauf actualité plus pertinente)

1. **[reviews]** ETF américains à distribution vs capitalisation : la
   retenue à la source que le TER ne montre jamais — vérifier le mécanisme
   RIC/withholding interne aux fonds US avant rédaction.
2. **[problems]** REIT américains : le piège du taux à 30 % sur les
   distributions immobilières (nuance FIRPTA sur la part liée à la vente
   d'un bien immobilier US, non réductible par convention même pour un
   petit porteur) — vérifier les seuils de détention (10 %) qui changent le
   traitement.
3. **[comparisons]** Assurance-vie luxembourgeoise vs compte-titres direct :
   qui absorbe la retenue à la source sur les unités de compte étrangères —
   vérifier le mécanisme réel de récupération par l'assureur avant d'écrire.
4. **[best]** Meilleurs courtiers pour la retenue à la source sur dividendes
   étrangers en 2026 — rester factuel et neutre (grilles tarifaires
   publiques uniquement), ne jamais dénigrer un courtier nommé sans source
   publique vérifiable.
5. **[cost]** Succession et dividendes étrangers non réclamés : que
   deviennent les trop-perçus d'un défunt actionnaire — sujet sensible,
   vérifier les règles de transmission du droit à réclamation avant
   rédaction, ton sobre.
6. **[comparisons]** Courtier français (avec IFU) vs courtier étranger
   (Interactive Brokers, DEGIRO, Trade Republic) : qui simplifie vraiment
   la déclaration de vos dividendes étrangers — angle IFU/absence d'IFU,
   distinct de `broker-tax-handling-compared` qui traite des pratiques de
   retenue, pas de la déclaration.
7. **[problems]** ETF à réplication synthétique vs physique : la retenue à
   la source invisible sur votre relevé — distinct de
   `etf-domicile-ireland-vs-us` (qui traite du domicile, pas du mode de
   réplication).
8. **[best]** Dividendes trimestriels vs annuels par pays : où le suivi
   manuel devient intenable — angle multi-versements/multi-échéances,
   complémentaire à `sol-ranking-by-country`.

## Historique des runs

- **2026-08-02 — session initiale (rédaction manuelle, hors routine).**
  Exploration de l'architecture, verrouillage du contexte légal, analyse de
  gaps (8 angles identifiés), rédaction de 3 articles :
  `pea-vs-cto-foreign-dividends` (reviews), `residence-certificate-form-5000`
  (problems), `true-cost-of-doing-nothing` (cost). Vérifications : Node.js
  installé sur cette machine (absent au départ), `npm install`,
  `npx tsc --noEmit` propre, `eslint` propre (1 import inutilisé corrigé),
  `npm run build` réussi (177 pages statiques), contenu HTML généré vérifié
  ligne à ligne pour les 6 pages (FR/EN) créées. Vérification visuelle en
  navigateur non aboutie dans cette session (blocage du Browser pane sur un
  contrôle de policy, indépendant du contenu — build statique vérifié
  directement à la place). PR ouverte, tâche planifiée bihebdomadaire créée.
