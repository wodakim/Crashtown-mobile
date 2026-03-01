# CrashTown — Roadmap d’exécution active (à suivre strictement)

> Cette roadmap devient le plan opérationnel immédiat.
> Objectif: terminer V1 Android store-ready sans dérive de scope.

## Règles de pilotage (non négociables)

1. **Un seul lot actif à la fois** (pas de multi-chantiers).
2. **Chaque lot doit livrer**: code + vérification + notes de non-régression.
3. **Aucune feature nouvelle** tant que le lot en cours n’est pas validé.
4. **Priorité**: cohérence technique > nouvelles options cosmétiques.
5. **Sprints courts**: 2 à 4 jours max par lot.

---

## Phase 0 — Clean technique immédiat (en cours)

### 0.1 Déjà fait
- Centralisation des clés localStorage dans `src/core/keys.js`.
- Remplacement des clés en dur dans `mainmenu.js`, `garage.js`, `play.js` pour réduire la dette de cohérence.

### 0.2 À finir maintenant
- Vérifier qu’aucune clé legacy critique ne reste utilisée hors migration.
- Confirmer la cohérence wallet/menu/play sur device Android.
- Lister les anomalies naming assets à corriger (`.png.png`, conventions mixtes).

**Definition of done phase 0**
- Plus de drift de clés critiques (wallet/vehicule/radio).
- Aucun bug de persistance entre menu/garage/play/retry.

---

## Phase 1 — Automation skins/audio (ROI immédiat)

### 1.1 Vehicle scan
- ✅ Mode strict ajouté sur `vehicle:scan` (`npm run vehicle:scan:strict`) avec:
  - erreurs sur double extension,
  - alertes sur couleurs non standard,
  - check HD/Pixel incomplets.

### 1.2 Radio scan
- ✅ Validation stricte ajoutée sur `radio:scan` (`npm run radio:scan:strict`) avec:
  - doublons,
  - format invalide,
  - stations vides en avertissement.
- ✅ Mode strict complet ajouté (`npm run radio:scan:strict:full`) pour faire échouer aussi les stations vides.

### 1.3 Pipeline
- ✅ Script de validation global ajouté: `npm run assets:validate` (strict sans blocage sur station vide) + `npm run assets:validate:full` (strict complet).
- 🔜 Brancher ce script automatiquement dans la commande de build Android.

**DoD phase 1**
- Build impossible si catalogues/playlist invalides.
- Plus d’édition manuelle fragile des fichiers générés.

---

## Phase 2 — Meta V1 Pack A (rétention) (en cours)

### 2.1 Déjà fait
- ✅ Base mission engine daily + weekly data-driven livrée (`src/game/state/progression.js`).
- ✅ XP/level/rank persistants branchés sur fin de run (`play.js` -> `applyRunSummary`).
- ✅ UI daily progression branchée dans le menu + claim rewards.
- ✅ Première visibilité weekly ajoutée dans popup quêtes.

### 2.2 Reste à faire
- ✅ Claim/récompenses weekly ajouté (anti double-claim).
- ✅ Feedback UI progression ajouté en fin de run (résumé XP/niveau dans game over).
- Ajouter équilibrage XP/missions data-driven (fichier balance dédié).
- Préparer protocole test physique Sprint 6 (checklist appareil réelle).

**DoD phase 2**
- Missions daily + weekly actives, visibles, claimables.
- Progression XP conservée après redémarrage.
- ✅ Telemetry mission/progression branchée.

---

## Phase 3 — Meta V1 Pack B (économie/progression) (en cours)

1. Upgrades véhicules par stats.
2. Table d’économie centralisée (earn/spend/sinks).
3. Balancing initial avec KPI cible.
4. ✅ Choix de difficulté au lancement run (Facile/Normal/Difficile) avec impact trafic/obstacles/navigation et multiplicateur XP.

**DoD phase 3**
- Première upgrade obtenable rapidement.
- Pas de blocage progression injustifié.

---

## Phase 4 — Hardening release Android

1. Migrations storage versionnées robustes.
2. Smoke tests des flux critiques.
3. Matrice de tests Android (low/mid/high) + rapport KPI.

**DoD phase 4**
- Aucun P0/P1 ouvert sur flow principal.
- Candidate build prête pour track internal testing.

---

## Backlog gelé (ce qui n’entre pas avant V1)

- Leaderboard online.
- Events temporaires avancés.
- Personnalisation cosmétique large.

---

## Cadence d’exécution avec toi

À chaque lot:
1. Je propose plan précis (tâches + fichiers + risques).
2. J’implémente en patch court.
3. Je fournis checks exécutés + impact.
4. On valide puis on passe au lot suivant.

Cette roadmap est celle que je suivrai strictement dès maintenant.
