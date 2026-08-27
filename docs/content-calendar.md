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

Répartition au 2026-08-27 : cost (4), problems (9), comparisons (6),
reviews (1), best (3) — 23 articles au total. La catégorie **reviews**
(1 seul article, `pea-vs-cto-foreign-dividends`) reste le déséquilibre le
plus net à corriger en priorité dans les prochains runs — deux idées
`reviews` restent dans le backlog ci-dessous pour ça.

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

1. **[best]** Meilleurs courtiers pour la retenue à la source sur dividendes
   étrangers en 2026 — rester factuel et neutre (grilles tarifaires
   publiques uniquement), ne jamais dénigrer un courtier nommé sans source
   publique vérifiable.
2. **[cost]** Succession et dividendes étrangers non réclamés : que
   deviennent les trop-perçus d'un défunt actionnaire — sujet sensible,
   vérifier les règles de transmission du droit à réclamation avant
   rédaction, ton sobre.
3. **[comparisons]** Courtier français (avec IFU) vs courtier étranger
   (Interactive Brokers, DEGIRO, Trade Republic) : qui simplifie vraiment
   la déclaration de vos dividendes étrangers — angle IFU/absence d'IFU,
   distinct de `broker-tax-handling-compared` qui traite des pratiques de
   retenue, pas de la déclaration.
4. **[best]** Dividendes trimestriels vs annuels par pays : où le suivi
   manuel devient intenable — angle multi-versements/multi-échéances,
   complémentaire à `sol-ranking-by-country`.
5. **[reviews]** Idée reçue « les actions américaines ne valent pas le coup
   à cause de la retenue à la source » : démonter le raisonnement avec le
   calcul complet (taux conventionnel + récupération), sans jamais
   recommander un choix d'allocation — vérifier qu'aucune formulation ne
   puisse se lire comme un conseil en investissement avant publication.
6. **[reviews]** Le « service de récupération automatique » que certains
   courtiers annoncent : ce qu'il couvre vraiment (relief-at-source, c'est-
   à-dire éviter la sur-retenue dès le départ) et ce qu'il ne couvre jamais
   (un trop-perçu déjà prélevé par le passé) — prise de position contre
   l'idée que ce service rendrait une démarche de réclamation superflue,
   distinct de `fiscalplace-vs-broker` et `broker-tax-handling-compared`
   qui restent factuels/comparatifs plutôt que pris de position.
7. **[problems]** Changement de courtier ou transfert de titres en cours
   d'année : ce qui arrive à un dossier de retenue à la source pas encore
   réclamé — vérifier si un transfert de titres affecte la preuve de
   détention exigée par l'administration étrangère avant rédaction.
8. **[cost]** Foncières cotées européennes (SIIC françaises, REIT
   britanniques/allemands hors REIT américains) : le vrai coût de la
   retenue à la source sur les distributions immobilières cotées en
   Europe — distinct de `us-reit-firpta-trap` (mécanisme américain
   FIRPTA/§897, sans rapport) ; vérifier le régime propre à chaque pays
   avant rédaction, ne pas généraliser un mécanisme national aux autres.
9. **[problems]** Actions à double cotation (dual-listed) ou ADR : les cas
   où la retenue affichée sur le relevé ne correspond à aucun des deux
   pays attendus (ex. structures historiques Unilever, Shell, Rio Tinto)
   — vérifier des cas concrets avant rédaction ; distinct de
   `broker-wont-tell-you` et `nothing-to-recover`, qui mentionnent le
   sujet en une phrase sans le traiter en profondeur.

## Historique des runs

- **2026-08-27 — run automatique, sujet du backlog.**
  Veille sur l'actualité fiscale/réglementaire (retenue à la source,
  conventions, W-8BEN, formulaires 5000/5001, assurance-vie luxembourgeoise) :
  aucune actualité 2026 suffisamment forte et spécifique à l'audience
  (investisseur résident français détenant des actions/ETF étrangers) n'a
  été trouvée. Écarté : la réforme CGI art. 119 bis A II (retenue
  « conservatoire » sur dividendes français versés à des non-résidents,
  1er janvier 2026) — sens inverse du métier, déjà écartée aux runs du
  2026-08-14 et du 2026-08-21 pour la même raison. Écarté également : la
  consultation HMRC du 13 juillet 2026 sur l'allègement à la source de la
  retenue britannique sur les **intérêts** versés à l'étranger — sujet
  distinct (intérêts, pas dividendes) et encore au stade de consultation
  (clôture le 7 septembre 2026), rien d'applicable à vérifier ni à publier
  aujourd'hui. Vérifications complémentaires sans suite : aucune réforme
  2026 confirmée du régime suisse de retenue à la source (Verrechnungssteuer,
  toujours par remboursement, jamais à la source pour un non-résident) ;
  l'assouplissement irlandais 2026 sur les DWT (exemption des « EEA
  investment limited partnerships ») est un sujet institutionnel/B2B sans
  pertinence pour un particulier. Sujet retenu dans le backlog (ancien
  item 1) : assurance-vie luxembourgeoise vs compte-titres direct, sur qui
  absorbe réellement la retenue à la source sur les dividendes étrangers.
  Recherches de vérification (fiches produits d'assureurs luxembourgeois
  sur les fonds internes dédiés/FID, principes du droit des assurances sur
  la propriété des actifs représentatifs, mécanique du bénéficiaire effectif
  pour les véhicules intermédiés) : mécanisme confirmé — dans un contrat
  d'assurance-vie (français ou luxembourgeois, unités de compte classiques
  ou FID/FAS sur mesure), le souscripteur détient une créance sur l'assureur,
  jamais la propriété directe des titres logés dans le contrat ; c'est donc
  l'assureur (ou la banque dépositaire du fonds) qui est le bénéficiaire
  effectif reconnu par les conventions fiscales, y compris quand le
  souscripteur a lui-même composé l'allocation d'un FID. Angle
  **comparisons** retenu : même retenue étrangère, même montant, mais un
  seul des deux supports (compte-titres) permet une récupération
  individuelle — l'assurance-vie n'en permet aucune, par construction,
  quelle que soit la sophistication du support ; certains assureurs
  annoncent négocier une récupération partielle à leur niveau, mais de façon
  opaque et non pilotable par le souscripteur (fait noté avec prudence,
  source : documentation commerciale d'assureurs, pas un texte réglementaire).
  Article explicitement cadré comme non-conseil patrimonial (le choix entre
  les deux enveloppes dépend d'objectifs bien plus larges que la seule
  retenue à la source). Article créé :
  `life-insurance-wrapper-vs-brokerage-account` (catégorie `comparisons`) —
  applique le même principe de bénéficiaire effectif que
  `etf-domicile-ireland-vs-us` (citée en renfort, non modifiée) à un
  véhicule différent (contrat d'assurance-vie plutôt que fonds). Backlog :
  item traité retiré, 2 nouvelles idées ajoutées (foncières cotées
  européennes hors FIRPTA ; actions à double cotation/ADR) pour rester
  au-dessus du seuil minimum — 9 entrées restantes. Vérifications : dépôt
  confirmé à jour avec `origin/main` (déjà à jour, aucun retard, branche
  créée directement depuis `main`), un fichier non suivi
  (`.backlink-outreach-log.md`, hors périmètre de cette routine) laissé
  intact. `npx tsc --noEmit` propre, `eslint` scopé aux fichiers touchés
  propre (1 import inutilisé corrigé). Rendu vérifié en navigateur (serveur
  de dev local) : FR et EN, page article et hub `/ressources` (article bien
  classé en tête de la section « Comparaisons », désormais 6 articles),
  aucune erreur console. Chiffres (26,375 %, 15 %) lus dynamiquement depuis
  `@/data/countries` (`DE.statutoryRate`, `treatyRateFor`) ; le principe de
  droit des assurances (créance sur l'assureur, non-propriété directe des
  actifs représentatifs) est un fait de droit vérifié par recherche web, non
  présent dans `countries.ts` qui ne couvre que les paramètres pays — même
  traitement que le mécanisme FIRPTA dans l'article REIT du 2026-08-21.
- **2026-08-21 — run automatique, sujet du backlog.**
  Veille sur l'actualité fiscale/réglementaire (retenue à la source,
  conventions, W-8BEN, formulaires 5000/5001) : la seule actualité 2026
  identifiée (retenue à la source « conservatoire » sur les dividendes de
  source française versés à des non-résidents, CGI art. 119 bis A II,
  applicable depuis le 1er janvier 2026) concerne à nouveau le sens inverse
  du métier de FiscalPlace, comme déjà noté au run du 2026-08-14 — écartée
  pour la même raison. Recherche ciblée sur d'éventuelles nouvelles versions
  des formulaires W-8BEN/5000/5001 : rien de daté 2026 (révision IRS
  toujours celle d'octobre 2021 pour le W-8BEN individuel). Sujet retenu
  dans le backlog (ancien item 1) : REIT américains et le piège FIRPTA.
  Recherches de vérification (IRS FIRPTA withholding, 26 U.S. Code §897(h)
  et §897(k) sur Cornell LII, résumé PATH Act 2015) : mécanisme confirmé —
  les dividendes ordinaires d'un REIT sont un revenu FDAP classique (30 %
  statutaire / 15 % conventionnel via W-8BEN), mais une distribution de
  plus-value liée à la vente d'un bien immobilier sous-jacent est requalifiée
  en gain FIRPTA (§897), retenue à 21 % (§1445(e)(6)) et non réductible par
  convention — **sauf** exception pour les REIT cotés (§897(k)) : si
  l'actionnaire n'a détenu à aucun moment plus de 10 % d'une catégorie
  d'actions durant les 12 mois précédant le versement (seuil relevé de 5 %
  à 10 % par le PATH Act 2015, confirmé toujours en vigueur), la distribution
  redevient un dividende ordinaire traité normalement. Angle **problems**
  retenu : contrairement au backlog initial qui présentait ce piège comme
  non réductible « même pour un petit porteur », la vérification montre que
  l'exception des 10 % protège en pratique la quasi-totalité des
  particuliers détenant un REIT coté via un courtier — le vrai risque
  concerne les REIT non cotés ou une position exceptionnellement concentrée,
  distinction absente de la plupart des articles trouvés en recherche et
  donc angle mort méconnu pertinent. Article explicitement cadré comme hors
  périmètre du service FiscalPlace dans le cas FIRPTA réel (déclaration de
  revenus américaine réelle, pas une réclamation de trop-perçu). Article
  créé : `us-reit-firpta-trap` (catégorie `problems`) — distinct des
  mentions de REIT britanniques (PID) dans `broker-wont-tell-you`,
  `nothing-to-recover` et `best-countries-french-resident` (pays et
  mécanisme différents, citées en renfort sans être modifiées). Backlog :
  item traité retiré, 8 entrées restantes (seuil minimum respecté, comme au
  run du 2026-08-08). Vérifications : dépôt confirmé à jour avec
  `origin/main` (fast-forward automatique, `a51d23f` → `7899b87`, 11
  commits), branche créée directement depuis `main` à jour (pas de PR
  parente ouverte à empiler au moment de ce run). `npx tsc --noEmit` propre,
  `eslint` scopé aux fichiers touchés propre (1 warning corrigé : constante
  de slug inutilisée). Rendu vérifié en navigateur (serveur de dev local) :
  FR et EN, page article et hub `/ressources` (article bien classé en tête
  de la section « Problèmes & risques », désormais 9 articles), aucune
  erreur console. Chiffres (30 %, 15 %, 21 %, 10 %) lus dynamiquement depuis
  `@/data/countries` (`US.statutoryRate`, `treatyRateFor`) pour les deux
  premiers ; les constantes FIRPTA (21 % de retenue légale, seuil de
  détention de 10 %) sont des faits de droit fiscal américain vérifiés par
  recherche web (non présents dans `countries.ts`, qui ne couvre que les
  paramètres propres à chaque pays pour un résident français) — même
  traitement que la section 871(m) dans l'article ETF synthétique du
  2026-08-14. PR : https://github.com/rempartfinancier/fiscalplace/pull/7.
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
  valeur nouvelle ajoutée à la base de données. PR :
  https://github.com/rempartfinancier/fiscalplace/pull/3 (empilée sur PR #2).
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
