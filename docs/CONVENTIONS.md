# FiscalPlace — Conventions de construction (contrat pour tous les contributeurs)

Ce document est le contrat commun. Toute page doit pouvoir passer pour l'œuvre d'une seule équipe.

## 1. Concept de marque : « Le grand livre réconcilié »

Chaque dividende étranger sur-prélevé est une **écriture non soldée** : le fisc étranger a débité 35 %, la convention n'en autorise que 15 % — FiscalPlace réconcilie les deux lignes et solde le trop-perçu. Le site vend **l'argent qui revient au client**, jamais « notre plateforme » (perceuse → trou).

**Grammaire chromatique sémantique** (apprise au premier écran, respectée partout) :
- `debit` (#9E2B1F) = prélevé à tort. INTERDIT sur la marque, les CTA, le décoratif.
- `brand` (#0A5C3E) = taux conventionnel / recouvré / actions. Aplat plein uniquement.
- `gold` hachuré 45° (`.hatch-gold`) = potentiel récupérable ; `gold-wash` (#F5E7B2) = surlignage de LA ligne trop-perçu ; vert plein = réalisé. Toute l'UX raconte le passage du hachuré au plein.
- Fond page `paper`, surfaces blanches délimitées par filet 1px `rule`, ombres quasi absentes.

**Typo** : Besley (font-display) pour H1–H3 uniquement. IBM Plex Sans (font-sans) pour tout le reste. IBM Plex Mono (`font-mono`) pour TOUS les taux, montants, dates, références (« ART. 10 CDI FR-CH ») — jamais en texte courant.

**Un seul élément expressif** : l'Écriture soldée (`LedgerEntry`) et ses déclinaisons (`MicroGauge`, `ProgressGauge`, `DoubleRule`). Nav, cartes, formulaires restent silencieux. Radius 6px max, jamais de pill, jamais de dégradé, jamais d'emoji décoratif (drapeaux pays OK).

## 2. Méthode Endless Customers (obligatoire, pas décorative)

- **Prix** : toujours chiffrés, toujours issus de `@/config/pricing` (jamais recopiés en dur). Exemples calculés avec `computeCommission()`.
- **Problèmes** : dire ce qui peut mal tourner (rejets, prescriptions, délais de 12 mois, documents refusés). Un cas défavorable traité honnêtement > une promesse.
- **Comparaisons honnêtes** : reconnaître quand le DIY est viable (petit dossier, un seul pays, temps disponible) et quand les Pays-Bas/UK n'offrent rien à récupérer.
- **Self-service d'abord** : orienter vers simulateur/calculateur avant tout contact humain.
- Ligne de confiance sous chaque CTA primaire : composant `TrustLine` avec `t.trustLine`.
- Voix : active, côté utilisateur (« vous récupérez », pas « le système traite »), une action garde le même nom du bouton à la confirmation. États vides et erreurs orientent vers une action.

## 3. i18n — règles absolues

- AUCUNE chaîne visible en dur dans le JSX. Chaque module de page définit en tête un objet `copy: Localized<...>` (type de `@/lib/i18n`) puis `const t = copy[locale]`. Chaînes communes : `getCommon(locale)` de `@/content/common` ; portail : `getPortalStrings(locale)`.
- FR et EN de qualité égale (l'EN n'est pas une traduction mot à mot : idiomatique, même précision).
- Tous les liens internes via `href(locale, key)` / `countryHref` / `articleHref` / `claimHref` de `@/lib/routes` — jamais d'URL littérale.
- Formatage : `formatCurrency`, `formatPercent`, `formatDate` de `@/lib/i18n` — jamais de concaténation manuelle.

## 4. Données — sources uniques de vérité

- Taux, délais, spécificités pays : `@/data/countries` (COUNTRIES, treatyRateFor, recoveryGap, solDeadline). INTERDIT de citer un taux/délai en dur dans une page : lire la donnée. Afficher les taux avec la mention indicative (`t.labels.illustrative` ou équivalent contextuel) là où un visiteur pourrait les prendre pour un engagement.
- Tarifs : `@/config/pricing` (PRICING, computeCommission). La grille est MARGINALE par tranche : l'expliquer ainsi.
- Simulation : `simulate()` de `@/lib/simulator`.
- Démo portail : `@/data/demo-portal` + contexte `usePortal()`/`filterByEntity` de `@/components/portal/PortalContext`.

## 5. Garde-fous anti-hallucination (responsabilité légale)

JAMAIS inventer : immatriculation/forme juridique/siège, agréments, n° d'assurance RC pro, IBAN, noms/bios de membres d'équipe réels, témoignages clients, logos partenaires, certifications (ISO, SOC 2), chiffres de performance (« X clients », « Y M€ récupérés »).
Format placeholder obligatoire, visuellement propre : `[SIREN À COMPLÉTER]`, `[À REMPLACER PAR UN VRAI TÉMOIGNAGE CLIENT]`, `[NOM DU PRESTATAIRE KYC RÉEL]`. La page doit rester crédible et finie malgré le placeholder (le placeholder s'insère dans une maquette complète, pas dans un trou).
La page Avis clients présente la STRUCTURE (grille d'avis, critères de vérifiabilité, process de collecte) avec des emplacements explicitement marqués — zéro faux avis.
FiscalPlace = service de démarches administratives et fiscales spécialisé, PAS de conseil fiscal personnalisé réglementé. Ne jamais écrire de phrase qui constituerait une recommandation d'investissement.

## 6. Contrat technique des modules de page

- Marketing/légal : `src/components/pages/<key>.tsx`, composant serveur.
  ```tsx
  import type { Locale, Localized } from "@/lib/i18n";
  import type { PageMeta } from "@/lib/page-registry";
  const copy: Localized<{...}> = { fr: {...}, en: {...} };
  export function getMeta(locale: Locale): PageMeta { const t = copy[locale]; return { title: t.metaTitle, description: t.metaDescription }; }
  export default function Page({ locale }: { locale: Locale }) { const t = copy[locale]; return (...); }
  ```
- Portail : `src/components/portal/pages/<key>.tsx`, commence par `"use client"`, même contrat (getMeta existe mais n'est pas appelé côté serveur). Le chrome (sidebar, bandeau démo, switcher d'entités) est déjà fourni — la page ne rend QUE son contenu.
- Sous-composants interactifs d'une page marketing : fichier séparé `"use client"` dans `src/components/site/` importé par le module serveur.
- Les fichiers de fondation (lib/, config/, data/countries, data/demo-portal, content/common, content/portal, ui/, site/Header, site/Footer, PortalChrome, dispatcher, layout, globals.css) sont EN LECTURE SEULE. Besoin d'un helper ? Le définir dans son propre fichier.
- Composants UI disponibles : `Container, ButtonLink, Button, Card, Badge, StatTile, SectionHeading, TrustLine, TreatyRef` (`@/components/ui/primitives`) ; `LedgerEntry, LedgerLine, DoubleRule, MicroGauge, ProgressGauge` (`@/components/ui/ledger`) ; `TimelineCompact, TimelineVertical` (`@/components/ui/ClaimTimeline`) ; `FAQAccordion` (`@/components/ui/FAQAccordion`).
- Classes Tailwind avec les tokens : `text-ink text-mine text-brand text-debit text-gold-ink bg-paper bg-white bg-tint-green bg-tint-gold bg-tint-red bg-gold-wash border-rule bg-brand hover:bg-brand-deep font-display font-mono shadow-float .hatch-gold .leaders .double-rule .animate-settle .animate-stamp`.
- Accessibilité : HTML sémantique (une seule h1 par page), labels de formulaire explicites, `aria-*` sur l'interactif, contrastes déjà garantis par la palette — ne pas créer de nouvelles combinaisons de couleurs.
- Responsive mobile-first ; tables larges dans `overflow-x-auto` ; `prefers-reduced-motion` déjà géré globalement.

## 7. Vérification avant de rendre la main

```bash
cd "/Users/alexmacmini/Documents/Sites Github Desktop/fiscalplace.com"
export PATH="/opt/homebrew/bin:$PATH"
npx tsc --noEmit   # doit sortir sans erreur
```
Ne PAS lancer `npm run build` ni `npm run dev` (conflits avec les autres chantiers en parallèle). Ne pas ajouter de dépendance npm.
