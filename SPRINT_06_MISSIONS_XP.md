# CrashTown — Sprint 6: Missions + XP/Levels (Phase 3 roadmap pro)

## Statut sprint
- **État:** En cours
- **Objectif:** livrer la couche meta minimale (missions daily/weekly + progression XP persistante) sans régression sur les flows existants.

---

## 1) Avancement actuel

- [x] Module de progression central créé (`src/game/state/progression.js`).
- [x] Profil enrichi (xp, level, rank, totalRuns, bestScore).
- [x] Calcul de progression branché en fin de run (`applyRunSummary`).
- [x] Missions journalières affichées dynamiquement dans le menu.
- [x] Claim rewards daily (crédits + bonus emerald complétion).
- [x] Mission hebdo affichée (lecture progression).

## 2) Reste à livrer pour clôture

- [x] Claim rewards weekly (et anti double-claim).
- [x] Feedback game over enrichi (xp gagné, niveau, progression missions).
- [x] Événements télémétrie dédiés missions (`mission_progress`, `mission_claim`).
- [x] Résumé game over enrichi (XP + état missions claimables).
- [ ] Validation Android device réelle (persistance inter-session + non-régression menu/garage/play).

## 3) DoD Sprint 6

- [ ] Daily et weekly mission loops jouables et compréhensibles.
- [ ] XP/level progression stable après redémarrage app.
- [ ] Aucun bug P0/P1 introduit dans les flows critiques.


## 4) Protocole de test physique (prochain passage)

- [ ] Lancer 3 runs complets et vérifier évolution XP/level après chaque game over.
- [ ] Vérifier progression daily/weekly visible dans popup quêtes.
- [ ] Vérifier claim daily + weekly: crédit wallet augmente une seule fois par mission.
- [ ] Fermer/réouvrir l’app et vérifier persistance profil + missions.
- [ ] Vérifier absence de régression menu/garage/play/retry/audio.

## 5) Pack pré-test physique ajouté

- [x] Choix de difficulté au lancement run (3 cartes animées).
- [x] Facile: trafic modéré, pas d’obstacle, bots stables, XP x0.25.
- [x] Normal: trafic normal, pas d’obstacle, bots changent rarement de voie, XP x1.0.
- [x] Difficile: trafic actuel/organique, obstacles actifs, XP x1.5.
- [x] Game over enrichi avec statut missions claimables (préparation validation physique).
