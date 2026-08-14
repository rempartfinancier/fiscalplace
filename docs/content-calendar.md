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

Répartition au 2026-08-14 : cost (4), problems (8), comparisons (5),
reviews (1), best (3) — 21 articles au total. La catégorie **reviews**
(1 seul article, `pea-vs-cto-foreign-dividends`) reste le déséquilibre le
plus net à corriger en priorité dans les prochains runs — deux idées
`reviews` ont été ajoutées au backlog ci-dessous pour ça.

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

1. **[problems]** REIT américains : le piège du taux à 30 % sur les
   distributions immobilières (nuance FIRPTA sur la part liée à la vente
   d'un bien immobilier US, non réductible par convention même pour un
   petit porteur) — vérifier les seuils de détention (10 %) qui changent le
   traitement.
2. **[comparisons]** Assurance-vie luxembourgeoise vs compte-titres direct :
   qui absorbe la retenue à la source sur les unités de compte étrangères —
   vérifier le mécanisme réel de récupération par l'assureur avant d'écrire.
3. **[best]** Meilleurs courtiers pour la retenue à la source sur dividendes
   étrangers en 2026 — rester factuel et neutre (grilles tarifaires
   publiques uniquement), ne jamais dénigrer un courtier nommé sans source
   publique vérifiable.
4. **[cost]** Succession et dividendes étrangers non réclamés : que
   deviennent les trop-perçus d'un défunt actionnaire — sujet sensible,
   vérifier les règles de transmission du droit à réclamation avant
   rédaction, ton sobre.
5. **[comparisons]** Courtier français (avec IFU) vs courtier étranger
   (Interactive Brokers, DEGIRO, Trade Republic) : qui simplifie vraiment
   la déclaration de vos dividendes étrangers — angle IFU/absence d'IFU,
   distinct de `broker-tax-handling-compared` qui traite des pratiques de
   retenue, pas de la déclaration.
6. **[best]** Dividendes trimestriels vs annuels par pays : où le suivi
   manuel devient intenable — angle multi-versements/multi-échéances,
   complémentaire à `sol-ranking-by-country`.
7. **[reviews]** Idée reçue « les actions américaines ne valent pas le coup
   à cause de la retenue à la source » : démonter le raisonnement avec le
   calcul complet (taux conventionnel + récupération), sans jamais
   recommander un choix d'allocation — vérifier qu'aucune formulation ne
   puisse se lire comme un conseil en investissement avant publication.
8. **[reviews]** Le « service de récupération automatique » que certains
   courtiers annoncent : ce qu'il couvre vraiment (relief-at-source, c'est-
   à-dire éviter la sur-retenue dès le départ) et ce qu'il ne couvre jamais
   (un trop-perçu déjà prélevé par le passé) — prise de position contre
   l'idée que ce service rendrait une démarche de réclamation superflue,
   distinct de `fiscalplace-vs-broker` et `broker-tax-handling-compared`
   qui restent factuels/comparatifs plutôt que pris de position.
9. **[problems]** Changement de courtier ou transfert de titres en cours
   d'année : ce qui arrive à un dossier de retenue à la source pas encore
   réclamé — vérifier si un transfert de titres affecte la preuve de
   détention exigée par l'administration étrangère avant rédaction.

## Historique des runs

- **2026-08-14 — run automatique, sujet du backlog.**
  Veille sur l'actualité fiscale/réglementaire (retenue à la source,
  conventions, W-8BEN, formulaires 5000/5001) : la seule actualité
  significative trouvée (nouvelle retenue systématique française sur les
  dividendes de source française versés à des non-résidents de certains
  pays sous CGI art. 119 bis A, II, applicable depuis le 1er janvier 2026)
  concerne le sens inverse du métier de FiscalPlace — des non-résidents sur
  des dividendes français, pas des résidents français sur des dividendes
  étrangers — donc écartée comme non pertinente pour l'audience du site.
  Sujet retenu dans le backlog (ancien item 7) : ETF à réplication
  synthétique vs physique. Recherches de vérification (justETF, Invesco, Amundi ETF, Bogleheads) :
  mécanisme confirmé — un ETF synthétique (swap adossé à un indice large et
  liquide) peut éviter la retenue américaine sur dividendes grâce à
  l'exemption de la section 871(m) de l'Internal Revenue Code (HIRE Act
  2010), alors qu'un ETF physique la subit au niveau du fonds. Angle
  **problems** : le décalage de performance de ~0,20-0,25 point/an que ni
  le TER ni le relevé personnel n'expliquent, avec le vrai coût de la
  contrepartie (commission de swap, risque de contrepartie encadré UCITS)
  et un rappel explicite qu'aucun des deux cas n'est un dossier
  récupérable pour un particulier. Distinct de `etf-domicile-ireland-vs-us`
  (qui traite du domicile, pas du mode de réplication) — cité en renfort
  sans être modifié. Article créé : `etf-synthetic-vs-physical-replication`
  (catégorie `problems`). Backlog : item traité retiré ; deux nouvelles
  idées `reviews` ajoutées pour continuer à réduire le déséquilibre de
  cette catégorie (toujours 1 seul article publié) ; total à 9 entrées.
  Vérifications : dépôt confirmé à jour avec `origin/main` (`git fetch`
  initialement en échec réseau transitoire, réussi au second essai ;
  aucun retard une fois reconnecté), branche créée depuis
  `content/faster-directive-2026-08-08` (PR #2 encore ouverte, elle-même
  construite sur PR #1 encore ouverte) pour disposer du calendrier et du
  registre d'articles à jour et éviter tout doublon — ni PR #1 ni PR #2
  modifiées. `npx tsc --noEmit` propre, `eslint` scopé propre (1 import
  inutilisé corrigé), rendu vérifié en navigateur (FR + EN, page article +
  hub `/ressources`, article bien classé en tête de la section
  « Problèmes & risques »), aucune erreur console, chiffres (15 %, 30 %)
  lus dynamiquement depuis `@/data/countries` (`US.statutoryRate`), pas de
  valeur nouvelle ajoutée à la base de données.
- **2026-08-08 — run automatique, sujet d'actualité (hors backlog).**
  Veille sur l'actualité fiscale/réglementaire (retenue à la source,
  conventions, W-8BEN, formulaires 5000/5001) : sujet retenu, la directive
  européenne FASTER (UE 2025/50, adoptée le 10 décembre 2024, application au
  1er janvier 2030) — vérifiée par recherche web croisée (EUR-Lex, Conseil de
  l'UE, alertes EY/Deloitte/PwC/BDO) avant rédaction. Angle **problems** :
  démonter l'idée reçue qu'une réforme à quatre ans changerait quoi que ce
  soit aux délais de prescription en cours — pas de doublon avec
  `missed-deadline` (que faire une fois prescrit) ni `sol-ranking-by-country`
  (classement des délais), les deux étant cités en renfort. Article créé :
  `faster-directive-eu-withholding-tax`. Backlog inchangé (le sujet traité ne
  venait pas de la liste, qui reste donc à 8 entrées, seuil minimum
  respecté). Vérifications : dépôt confirmé à jour avec `origin/main`
  (fast-forward automatique, `4cee563` → `a51d23f`), branche créée depuis
  `content/seo-batch-1-2026-08-02` (PR #1 encore ouverte au moment de ce run)
  pour disposer de ce calendrier et du registre d'articles à jour et éviter
  tout doublon — PR #1 non modifiée, ce fichier de calendrier a servi de base
  puis a été mis à jour ici avec la nouvelle entrée. `npx tsc --noEmit`
  propre, `eslint` scopé propre (1 import inutilisé corrigé), rendu vérifié
  en navigateur (FR + EN, page article + hub `/ressources`), aucune erreur
  console, chiffres de l'exemple chiffré (Allemagne, 4 000 € bruts)
  recalculés dynamiquement depuis `@/data/countries`.
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
