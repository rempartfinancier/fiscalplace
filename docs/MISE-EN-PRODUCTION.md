# Mise en production réelle — checklist humaine avant lancement commercial

Le site est complet et fonctionnel en démonstration. Voici, en une page, ce qui relève d'une décision ou d'une validation humaine avant d'encaisser le premier euro client. Les placeholders correspondants sont posés dans le site au format `[… À COMPLÉTER]` (liste exhaustive dans CHANGELOG.md).

## Juridique & conformité (bloquant)

- [ ] Immatriculer la société (forme juridique, SIREN/RCS, siège) et compléter mentions légales, CGU, CGV, footer.
- [ ] Faire valider par un avocat : CGV/CGU (commission au succès, mandat, rétractation), statut d'activité (mandataire fiscal ou équivalent **dans chaque juridiction visée** — la Suisse, l'Allemagne et les États-Unis ont des règles de représentation différentes), et le dispositif marque blanche/apport d'affaires (statut réglementaire de l'apporteur).
- [ ] Souscrire une assurance RC professionnelle et reporter le numéro de police.
- [ ] Arbitrer le régime de TVA des commissions et forfaits (expert-comptable) — les pages tarifs/CGV affichent ce point comme à confirmer.
- [ ] Définir juridiquement le circuit des fonds clients (remboursement direct au client vs compte de cantonnement) — page « Comment nous sommes payés ».
- [ ] Désigner un DPO (ou référent RGPD), tenir le registre des traitements, valider la politique de confidentialité.

## Données fiscales (bloquant)

- [ ] Faire revalider par un fiscaliste **chaque entrée** de `src/data/countries.ts` (taux statutaires, taux conventionnels par résidence, délais de prescription, formulaires) et instaurer le processus de veille continue (le module est versionné : `DATA_VERSION`, champ `lastReviewed` par pays, drapeaux `verify` sur les données incertaines).
- [ ] Valider la grille tarifaire de `src/config/pricing.ts` contre une vraie comptabilité analytique (les chiffres actuels sont une recommandation issue de l'étude de marché).

## Prestataires à contracter (bloquant pour l'espace client réel)

- [ ] KYC/AML + filtrage sanctions/PEP (ex. Sumsub, Onfido, ComplyAdvantage) — brancher les points de contrôle humains décrits sur /comment-ca-marche.
- [ ] Signature électronique qualifiée (ex. DocuSign, Yousign) pour le mandat.
- [ ] Paiement/facturation (ex. Stripe Billing) : commission au succès + abonnements, multi-devises EUR/USD/CHF/GBP.
- [ ] OCR/extraction documentaire des relevés (pipeline IA) + journal d'audit persistant des décisions automatisées.
- [ ] Hébergement UE conforme RGPD (ex. Scaleway, OVHcloud, AWS eu-west-3) + chiffrement au repos de PostgreSQL.

## Marque & contenu (non bloquant mais avant la première campagne)

- [ ] Équipe réelle : photos, noms, bios sur /a-propos (aucun profil inventé n'a été publié).
- [ ] Premiers témoignages clients vérifiés sur /avis-clients (structure prête, zéro faux avis publié) + choix d'une plateforme d'avis tiers.
- [ ] Chiffres de traction réels (« X dossiers, Y € récupérés ») — emplacements prêts, rien d'inventé.
- [ ] Adresse email/téléphone de contact réels + boîte security@ pour les signalements.
- [ ] Ouvrir la création de comptes réels (le portail actuel est une démo assumée derrière une gate).

## Technique (recommandé)

- [ ] Domaine + DNS + certificats ; vérifier les redirections `/` → `/fr` et les hreflang en production.
- [ ] Remplacer le favicon par défaut par un favicon à la marque (double filet).
- [ ] Mesure d'audience respectueuse si souhaitée (le bandeau cookies est déjà prêt pour un consentement préalable, désactivé par défaut).
- [ ] Monitoring d'erreurs et sauvegarde de la base une fois le vrai backend en place.
