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

Répartition au 2026-10-08 (branche de ce run, empilée sur PR #10 ; hors PR #8
et #9 encore ouvertes, qui ajoutent chacune un article **comparisons**) :
cost (4), problems (9), comparisons (6), reviews (2), best (3) — 24 articles
au total. La catégorie **reviews** (2 articles) reste le déséquilibre le plus
net à corriger en priorité dans les prochains runs — une idée `reviews` reste
au backlog ci-dessous pour continuer à la combler.

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
3. **[best]** Dividendes trimestriels vs annuels par pays : où le suivi
   manuel devient intenable — angle multi-versements/multi-échéances,
   complémentaire à `sol-ranking-by-country`.
4. **[reviews]** Le « service de récupération automatique » que certains
   courtiers annoncent : ce qu'il couvre vraiment (relief-at-source, c'est-
   à-dire éviter la sur-retenue dès le départ) et ce qu'il ne couvre jamais
   (un trop-perçu déjà prélevé par le passé) — prise de position contre
   l'idée que ce service rendrait une démarche de réclamation superflue,
   distinct de `fiscalplace-vs-broker` et `broker-tax-handling-compared`
   qui restent factuels/comparatifs plutôt que pris de position.
5. **[problems]** Changement de courtier ou transfert de titres en cours
   d'année : ce qui arrive à un dossier de retenue à la source pas encore
   réclamé — vérifier si un transfert de titres affecte la preuve de
   détention exigée par l'administration étrangère avant rédaction.
6. **[problems]** Dividendes américains « qualified » vs « non qualified » :
   une distinction de fiscalité domestique US qui ne change rien à la
   retenue d'un non-résident — confusion fréquente chez les investisseurs
   français qui lisent des ressources orientées contribuables américains ;
   vérifier via IRS.gov que la qualification n'a aucun effet sur le taux
   FDAP applicable via W-8BEN avant d'écrire.
7. **[cost]** Le coût d'opportunité du délai de traitement : combien coûte,
   en valeur actuelle, le fait d'attendre 12 à 24 mois un remboursement déjà
   acquis (par opposition à `true-cost-of-doing-nothing`, qui traite du
   trop-perçu jamais réclamé) — vérifier des délais de traitement réalistes
   par pays avant de chiffrer, rester prudent sur toute hypothèse de taux
   d'actualisation.
8. **[problems]** Remboursement étranger obtenu après coup : faut-il
   rectifier la déclaration française ? — cas où le crédit d'impôt a été
   déclaré au taux réellement retenu plutôt qu'au taux conventionnel, puis
   où le pays source rembourse l'écart ; vérifier sur BOFiP / impots.gouv.fr
   la procédure de régularisation avant d'écrire, ton prudent.
9. **[best]** Les pays où le PFU fait perdre une partie du crédit
   d'impôt conventionnel (taux conventionnel supérieur à 12,8 %) —
   classement généré depuis `@/data/countries` (`treatyRateFor`), le taux du
   PFU restant une constante française sourcée comme dans
   `us-dividends-withholding-tax-myth` ; complémentaire de
   `pfu-vs-progressive-scale-foreign-dividends`, sans recommander d'option.

## Historique des runs

- **2026-10-08 — run automatique, sujet d'actualité (hors backlog).**
  Reprise préalable : le run du 2026-09-05 avait laissé son commit
  (`us-dividends-withholding-tax-myth`) en local sur
  `content/us-withholding-myth-2026-09-01`, sans push ni PR. Branche poussée
  telle quelle et PR #10 ouverte, sans modifier le contenu. Branche de ce run
  empilée sur PR #10 pour conserver le calendrier et le registre à jour.
  Veille (retenue à la source, conventions, W-8BEN, 5000/5001, PLF 2027) :
  W-8BEN toujours en révision d'octobre 2021 ; retenue française
  « conservatoire » sur les non-résidents (CGI art. 119 bis A) toujours hors
  sujet (sens inverse du métier) ; le PLF 2027, présenté le 1er octobre 2026,
  ne contient aucune mesure sur le PFU ou les dividendes dans le texte du
  gouvernement (seul un amendement LFI non adopté, écarté comme non
  vérifiable à ce stade). Actualité retenue : l'article 126 de la loi de
  finances pour 2026 (modifiant CGI art. 200 A, 2) rend **révocable**
  l'option pour le barème progressif (case 2OP) à partir des revenus 2026
  (déclaration 2027), dans le délai de réclamation ; l'option reste annuelle
  et globale, et l'irrévocabilité est maintenue pour les revenus 2025.
  Sources recoupées : Vademecum Patrimoine, Louvre Banque Privée, Meilleurtaux
  Placement, Socic. Mécanismes français vérifiés par recherche web : abattement
  de 40 % sous barème (CGI art. 158, 3-2°), CSG déductible de 6,8 % sous
  barème seulement, prélèvements sociaux à 18,6 % (LFSS 2026), crédit d'impôt
  conventionnel plafonné à l'impôt français « correspondant ». D'après le
  BOFiP, sous barème, ce plafond se calcule au taux moyen du foyer, alors que
  plusieurs sources de pratique utilisent à tort la TMI. L'article ne calcule
  donc pas ce plafond par tranche : il présente **trois hypothèses
  explicitement étiquetées** (0 €, 90 €, 200 € d'impôt attribuable). Angle
  **comparisons** : l'option déplace le plafond du crédit, mais aucune option
  ne récupère le trop-perçu au-delà du taux conventionnel (exemple suisse,
  35 % / 15 % lus depuis `@/data/countries`). L'article insiste aussi sur la
  séparation entre délai de réclamation français et prescription étrangère.
  Aucune recommandation d'option (le choix est renvoyé au simulateur officiel
  ou à un professionnel). Article créé :
  `pfu-vs-progressive-scale-foreign-dividends` (catégorie `comparisons`). Il
  est distinct de `pea-vs-cto-foreign-dividends` (choix d'enveloppe) et de
  `us-dividends-withholding-tax-myth` (calcul sous PFU uniquement), cités
  sans être modifiés. Backlog : retrait des anciens items 1 (assurance-vie
  luxembourgeoise vs compte-titres) et 4 (IFU vs courtier étranger), déjà
  traités dans les PR #8 et #9 encore ouvertes et absents de cette branche.
  Deux idées ajoutées, soit 9 entrées. Vérifications : `main` à jour avec
  `origin/main` (`f79931b`, aucun retard). `npx tsc --noEmit` et `eslint`
  scopé propres. Le serveur de dev ne peut pas être lancé en session
  planifiée non surveillée, d'où une vérification par `npm run build` réussi
  et une relecture du HTML généré (FR + EN : aucun `undefined`/`NaN`,
  article présent dans le hub `/ressources`). Constat au passage : le
  composant FAQ retire les liens Markdown des réponses (`stripInline`), donc
  les liens internes ont été placés dans le corps du texte. Point à garder
  en tête pour les prochains articles. PR : [lien à ajouter après ouverture].
- **2026-09-05 — run automatique, sujet du backlog enrichi d'une actualité vérifiée.**
  Veille sur l'actualité fiscale/réglementaire (retenue à la source,
  conventions, W-8BEN, formulaires 5000/5001) : la seule actualité française
  2026 identifiée reste la retenue à la source « conservatoire » sur les
  dividendes de source française versés à des non-résidents (CGI art. 119
  bis A II, applicable depuis le 1er janvier 2026), déjà écartée aux runs du
  2026-08-14 et du 2026-08-21 pour la même raison (sens inverse du métier de
  FiscalPlace). En revanche, une actualité fiscale française pertinente pour
  l'audience du site a été identifiée et vérifiée par recherche croisée
  (Banque Transatlantique, Que Choisir, TGS France, DLA Piper) : la loi de
  financement de la Sécurité sociale pour 2026, adoptée le 16 décembre 2025,
  relève les prélèvements sociaux sur les revenus du capital — dont les
  dividendes — de 17,2 % à 18,6 %. Sujet retenu (backlog, ancien item 6) :
  l'idée reçue « les actions américaines ne valent pas le coup à cause de la
  retenue à la source », enrichie de cette actualité pour la rendre à la
  fois vérifiée et datée. Recherches de vérification complémentaires
  (mécanique du crédit d'impôt conventionnel pour les dividendes américains
  d'un résident de France, plusieurs sources de pratique fiscale
  recoupées) : confirmé — le crédit d'impôt généré par la retenue
  américaine à 15 % (taux conventionnel avec W-8BEN valide, art. 10 de la
  convention France-États-Unis) ne s'impute que sur la part impôt sur le
  revenu du PFU (12,8 %), jamais sur les prélèvements sociaux, et l'excédent
  (2,2 points) est perdu sans report. Angle **reviews** retenu : démonter le
  raisonnement additif (« 30 % retenus + impôt français = la moitié
  perdue ») avec le calcul complet, en distinguant clairement le vrai
  trop-perçu récupérable (absence de W-8BEN, 15 points au-delà du taux
  conventionnel, dossier FiscalPlace réel) de l'écart structurel minime et
  non récupérable (2,2 % du brut, lié au seul plafonnement du crédit
  d'impôt) — et en montrant que la hausse de CSG 2026 alourdit également les
  dividendes français et étrangers, sans creuser cet écart spécifique.
  Aucune formulation ne recommande un choix d'allocation (garde-fou
  explicite en tête d'article). Article créé :
  `us-dividends-withholding-tax-myth` (catégorie `reviews`, désormais 2
  articles dans cette catégorie encore déséquilibrée) — distinct de
  `pea-vs-cto-foreign-dividends` (même mécanisme de crédit d'impôt, mais
  centré sur l'arbitrage d'enveloppe PEA/CTO plutôt que sur le mythe
  retenue-à-la-source) et de `us-reit-firpta-trap` (retenue américaine non
  réductible par convention, non abordée ici), tous deux cités sans être
  modifiés. Backlog : item traité retiré, 7 entrées restantes, deux
  nouvelles idées ajoutées pour rester au-dessus du seuil minimum (9
  entrées au total). Vérifications : dépôt confirmé à jour avec
  `origin/main` (aucun retard, `f79931b`), branche créée directement depuis
  `main` à jour (pas de PR parente ouverte à empiler au moment de ce run).
  `npx tsc --noEmit` propre, `eslint` scopé aux fichiers touchés propre (1
  warning corrigé : constante d'URL source non utilisée, intégrée en
  citation dans le callout CSG). Rendu vérifié en navigateur (serveur de
  dev local) : FR et EN, page article et hub `/ressources` (article bien
  classé en tête de la section « Avis & retours », désormais 2 articles),
  aucune erreur console. Chiffres américains (30 %, 15 %) lus dynamiquement
  depuis `@/data/countries` (`US.statutoryRate`, `treatyRateFor`,
  `recoveryGap`) ; les taux du PFU français 2026 (12,8 % impôt sur le
  revenu, 18,6 % prélèvements sociaux) sont des faits de fiscalité
  domestique française vérifiés par recherche web (non couverts par
  `countries.ts`, qui ne modélise que les données des pays étrangers) —
  même traitement que les constantes FIRPTA de l'article du 2026-08-21. PR :
  https://github.com/rempartfinancier/fiscalplace/pull/10 (commit resté local
  et jamais poussé lors de ce run ; poussé et PR ouverte au run du 2026-10-08).
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
