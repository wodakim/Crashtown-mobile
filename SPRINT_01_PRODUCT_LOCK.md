# CrashTown — Sprint 1: Product Lock (Phase 0)

## Statut sprint
- **État:** Terminé
- **Objectif:** verrouiller le périmètre V1 avant toute implémentation feature.
- **Règle:** aucun démarrage Sprint 2 tant que ce document n'est pas validé.

---

## 1) Scope V1 verrouillé

## MUST-HAVE (à livrer avant soft launch)
1. Near-miss system
2. Combo chain
3. Vehicle abilities (cooldown)
4. Run events (au moins 2 variants)
5. Obstacle system
6. Missions daily/weekly
7. Progression joueur XP/levels
8. Vehicle progression (upgrades)
9. Economy loop complète
10. Save robustness (versioning + anti-corruption)

## SHOULD-HAVE (si capacité restante)
1. Streak rewards
2. Mini-achievements
3. Season pass light
4. Difficulty adaptative
5. Ghost best run
6. Assist mode conduite (accessibilité)

## COULD-HAVE (post V1 par défaut)
1. Leaderboard online
2. Events temporaires week-end
3. Personnalisation visuelle avancée

---

## 2) KPI cibles Sprint 1 (baseline de référence)

## KPI techniques
- FPS moyen en jeu (device mid): **>= 50**
- Pic frame time: **<= 40ms** la majorité du run
- Temps chargement vers play: **< 3s**
- Crash-free sessions: **> 99.5%**

## KPI produit
- Retry rate après game over: **> 45%**
- Runs/session moyenne: **>= 2.2**
- Session length moyenne: **>= 4 min** (soft-launch target)

## KPI design/features
- Taux d'utilisation near-miss: **>= 25% des runs**
- Taux d'engagement missions (claim/progression): **>= 40% utilisateurs actifs**

---

## 3) DoD verrouillées (règles d'acceptation)

Une feature est "Done" seulement si:
1. Testable en jeu dans un flux réel.
2. Instrumentée (event ou mesure KPI associée).
3. Aucun bug P0/P1 lié ouvert.
4. Sauvegarde/reload stables.
5. Budget perf respecté (pas de régression majeure).

---

## 4) Backlog ordonné pour prochains sprints (strict)

## Sprint 2 (autorisé après validation Sprint 1)
- Refactor `storage`, `audio`, `navigation`, `telemetry`
- Feature flags
- Structure data-driven pour balancing

## Sprint 3
- Near-miss MVP
- Combo chain MVP
- Tracking télémétrie associé

## Sprint 4
- Obstacle system
- Spawn director v2 (fairness)

---

## 5) Actions MANUELLES (toi) requises pour valider Sprint 1

1. Valider le scope V1 MUST/SHOULD/COULD (oui/non, puis ajustements max 48h).
2. Confirmer les cibles KPI proposées (ou fournir tes valeurs cibles).
3. Confirmer la liste appareils Android de test (au moins low/mid/high).

---

## 6) Suivi d'avancement Sprint 1

- [x] Scope structuré
- [x] KPI proposés
- [x] DoD fixées
- [x] Validation manuelle propriétaire

Quand la dernière case est validée, Sprint 1 passe en **Terminé**.


## 7) Clôture Sprint 1

- Validation utilisateur reçue sur les 3 points: scope, KPI, device classes (low/mid/high).
- Sprint 1 clôturé, passage autorisé au Sprint 2.
