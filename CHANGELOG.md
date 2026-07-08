# CHANGELOG — décisions prises en autonomie

Site construit en une passe le 8 juillet 2026, en application du cahier des charges « fiscalplace.com ». Méthode : cadrage (architecture d'information + panel de 3 directions artistiques jugées par un agent indépendant), fondations centralisées (données, i18n, design system), construction parallélisée des pages par 20 chantiers, audit QA multi-agents (6 auditeurs : liens, cohérence tarifaire, i18n, garde-fous, checklist, voix éditoriale — 22 constats, tous traités ou arbitrés ci-dessous), build de production vérifié (131 pages statiques).

## 1. Décisions d'architecture

- **Stack** : Next.js 16 (App Router) + TypeScript + Tailwind v4, 100 % statique (SSG). Le backend (workflow, OCR, KYC, paiement) est simulé côté client pour la démonstration, comme l'autorise la checklist du cahier des charges. Les briques réelles à contracter sont listées dans `docs/MISE-EN-PRODUCTION.md`.
- **i18n FR/EN à slugs localisés** (`/fr/tarifs` ↔ `/en/pricing`) via un registre de routes central (`src/lib/routes.ts`) et un dispatcher unique (`src/app/[locale]/[...slug]/page.tsx`). Les deux locales sont préfixées (`/` redirige vers `/fr`) — c'est la norme des références citées (stripe.com/fr, deel.com/fr) et le choix le plus simple à étendre à d'autres langues. Aucune chaîne visible n'est codée en dur : pattern `copy: Localized<T>` par page + dictionnaires communs.
- **Sources de vérité uniques** :
  - `src/config/pricing.ts` — grille tarifaire paramétrable. Aucun prix n'est recopié dans les pages : tout est importé et calculé (`computeCommission`).
  - `src/data/countries.ts` — base taux/prescriptions versionnée (`DATA_VERSION`, `lastReviewed` par pays, drapeau `verify` sur les données incertaines). Idem : aucun taux recopié dans le code des pages.
  - `src/data/demo-portal.ts` — données fictives de l'espace client, affichées sous bandeau « données de démonstration ».
- **Interprétation du barème dégressif** : les tranches s'appliquent de façon **marginale** (comme un barème d'impôt), interprétation la plus favorable au client et la plus défendable commercialement ; expliquée telle quelle sur /tarifs, dans les CGV et dans le simulateur (décomposition tranche par tranche affichée).
- **Espace client** : démo assumée derrière une « gate » explicite (aucune fausse promesse de compte réel), état client persisté en localStorage (signature de mandat, notifications lues, entité active). La gate est rendue côté serveur (jamais de HTML vide).
- Le pré-remplissage du simulateur (`?country=XX`) est lu après montage plutôt que via `useSearchParams`/Suspense : contournement d'un bug de révélation de Suspense en streaming constaté en dev, comportement identique en production.

## 2. Décisions produit et tarification

- **Hypothèse de lancement documentée (imposée par le cahier des charges)** : cible prioritaire = investisseurs francophones/européens détenant des titres étrangers ; résidences couvertes par le simulateur : France, Belgique, Luxembourg, Suisse + profil générique « autre pays conventionné » ; 11 pays sources couverts.
- **Grille appliquée** : 25 % / 18 % / 12 % / 8 % (marginal), plancher 39 €, plafond 5 000 €, sur devis au-delà de 75 000 € ; forfaits 49/129/79/149 € ; traitement prioritaire 89 € (fixé en config, le cahier des charges laissait le choix) ; abonnement 19 €/mois ou 149 €/an. Tout est modifiable dans `src/config/pricing.ts` sans toucher aux pages.
- **Débours** : tout est au succès, débours compris — facturés uniquement si le dossier aboutit, à prix coûtant, ligne à ligne, annoncés avant d'être engagés. En cas d'échec : facture à zéro. C'est la lecture la plus lisible du « no win, no fee » ; à confirmer en comptabilité réelle.
- **Rétrocession partenaire CGP : 20 % de la commission effectivement encaissée** sur les dossiers apportés (paramètre `partnerRevShare`). Le cahier des charges ne fixait pas ce chiffre ; il est affiché publiquement avec la mention explicite que la rétrocession sort de notre marge, jamais d'une majoration client.
- **Seuil « petit dossier »** : sous ~60 € récupérables (`SMALL_CLAIM_ADVICE_THRESHOLD`), le site conseille honnêtement de grouper plusieurs années ou de faire soi-même — cohérent entre simulateur, tarifs et comparatif.
- **Pays sans gisement (Royaume-Uni, Pays-Bas)** : pages « réponse honnête : rien à récupérer dans le cas général », avec réorientation — application directe du pilier « problèmes » d'Endless Customers.
- **Avis clients** : zéro faux avis. La page présente la politique de collecte (après versement uniquement, jamais rémunérés, négatifs publiés) et des emplacements maquettés avec placeholders explicites.

## 3. Direction artistique — « Le grand livre réconcilié »

Choisie par panel (3 directions concurrentes + juge indépendant, scores 9 / 8,5 / 7) puis synthétisée :
- **Concept** : chaque dividende sur-prélevé est une écriture non soldée ; FiscalPlace réconcilie les deux lignes. Élément signature unique : **l'Écriture soldée** (3 lignes + double filet comptable), déclinée en micro-jauge (hachuré or = potentiel, vert plein = réalisé) et en jauge de progression dans le portail. Le double filet ne se trace que quand l'argent est encaissé.
- **Palette sémantique** (contrastes AA vérifiés) : papier registre #F4F7F3, encre #152119, gris mine #54625B, vert conventionnel #0A5C3E (marque/actions/recouvré), rouge débit #9E2B1F (réservé au « prélevé à tort »), or trop-perçu #C9A227/#F5E7B2.
- **Typographies** : Besley (titres), IBM Plex Sans (texte), IBM Plex Mono (tous les chiffres, tabulaire).
- Le hero de l'accueil **est** le simulateur (pays + montant recomposent l'écriture en direct) — pilier self-service au premier écran.
- **Références conventionnelles sans numéro d'article** (« CDI FR-CH · 15 % ») : les numéros d'articles varient réellement selon les conventions (les dividendes sont à l'art. 11 de la CDI FR-CH de 1966, pas 10) — aucun numéro n'est affiché tant qu'un fiscaliste ne les a pas validés pays par pays.

## 4. Arbitrages issus de l'audit QA (22 constats)

Corrigés notamment : montant de notification démo incohérent avec la facture (823,85 €), champ `refundForm` et noms d'entités démo non localisés (visibles en anglais), copyright du footer hors dictionnaire, grammaire des H1 pays (« Suisse : récupérez… » au lieu de « Dividendes Suisse »), headline du hero ambiguë (« Seuls 1 500 étaient dus »), suffixe de marque dupliqué dans 14 titres de pages, unification du CTA simulateur (« Calculer mon trop-perçu ») dans les articles, « referral kickback » (connotation frauduleuse) reformulé, affirmations sur WTax/GlobeTax nuancées, réserve juridique ajoutée sur l'effet du dépôt dans les temps, libellé de l'étape 6 aligné sur le cahier des charges (« Réponse / requête complémentaire »), listes de pays et compteurs dérivés des données au lieu d'être recopiés.

Arbitrages assumés (non corrigés, en connaissance de cause) :
- **« No win, no fee » conservé en anglais dans la ligne de confiance FR** : terme de métier du secteur, utilisé par le cahier des charges lui-même ; sa constance visuelle (mono, sous chaque CTA) fait partie de la signature.
- **Espaces insécables françaises avant `: ; ! ?`** non insérées globalement (~1 350 occurrences) : le risque de régression d'un remplacement de masse dépasse le gain typographique ; amélioration recommandée via un helper de rendu, listée comme dette.

## 5. Placeholders restants (garde-fous anti-hallucination)

Aucune donnée réelle n'a été inventée. 78 placeholders `[EN CROCHETS]` (FR + EN) restent à compléter par un humain, regroupés par thème :
- **Identité légale** : dénomination, forme juridique, capital, SIREN/RCS, TVA, siège, directeur de la publication, hébergeur (mentions légales, CGU/CGV, confidentialité, footer).
- **Statuts réglementaires** : statut/agrément éventuel de mandataire fiscal par juridiction, droit applicable, statut de l'apport d'affaires, conditions de marque blanche, cantonnement des fonds clients, régime de TVA des honoraires.
- **Prestataires** : KYC/sanctions, signature électronique, hébergement UE, plateforme d'avis tiers, adresse sécurité, ligne téléphonique.
- **Humain & preuve** : noms/bios/photos de l'équipe, témoignages clients réels, chiffres de traction, taux de succès (« à publier une fois mesurable et auditable — aucun chiffre inventé »), date d'ouverture des comptes réels.
La liste exhaustive s'obtient avec : `grep -rhoE "\[[A-ZÀÉÈ][^]]{8,}\]" src/ | sort -u`.

## 6. Données fiscales — statut

Les taux statutaires/conventionnels et délais de prescription de `src/data/countries.ts` reflètent des valeurs couramment documentées (revue juin 2026), affichées partout comme indicatives avec date de revue. **Ils doivent être revalidés par un fiscaliste avant tout usage commercial** — c'est le premier point bloquant de `docs/MISE-EN-PRODUCTION.md`. Les entrées à incertitude connue portent `verify: true` (Royaume-Uni, Pays-Bas, Australie, Suède) et le site les signale (« donnée à confirmer »).

## 7. Dettes techniques connues

- Espaces fines insécables FR (voir §4).
- `getMeta` des modules portail non consommé (les titres viennent de `portalTitle()` — doublon inoffensif).
- Les articles (`src/data/articles/*.ts`) citent des chiffres dans du texte statique ; ils sont dérivés des données via template literals partout où c'était possible, mais une évolution de `countries.ts` impose une relecture des articles (les dates « données revues » l'encadrent).
- Dark mode non implémenté (choix DA : light, un seul thème soigné) ; `prefers-reduced-motion` respecté.
