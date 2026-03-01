# CrashTown — Sprint 3: Near-miss + Combo MVP (Phase 2)

## Statut sprint
- **État:** Terminé
- **Objectif:** livrer la première vraie feature gameplay V1 (near-miss + combo).

---

## 1) Objectifs sprint

1. Implémenter détection near-miss robuste et fair.
2. Implémenter système combo chain (avec décroissance temporelle).
3. Instrumenter les événements (`near_miss`, `combo_step`, `combo_break`).

---

## 2) Règles MVP

- Near-miss déclenché uniquement si dépassement latéral sans collision dans fenêtre de proximité stricte.
- Combo incrémenté par actions valides (near-miss, overtake, takedown).
- Combo reset sur timer expiré ou collision.
- Feedback visuel minimal (texte flottant combo).

---

## 3) DoD Sprint 3

- [x] Near-miss détecté en jeu sans faux positifs majeurs.
- [x] Combo visible en HUD/feedback et score impactant.
- [x] Tracking events branché.
- [x] Aucun bug P0/P1 introduit sur gameplay principal (validation manuelle gameplay validée).


## 4) Avancement itération 1

- [x] Near-miss détecté sur proximité latérale + dépassement.
- [x] Combo chain implémenté (step, multiplicateur, timeout, break sur collision).
- [x] Tracking events branché (`near_miss`, `combo_step`, `combo_break`).
- [x] Feedback HUD minimal combo (badge combo en jeu).
- [x] Validation gameplay manuelle approfondie (fairness/faux positifs).


## 5) Validation physique (historique)

- Exécutée via `SPRINT_03_TEST_PHYSIQUE_TUTORIEL.md`.
- Résultat: validation initiale reçue, sprint autorisé à clôturer.


## 6) Hotfix P0 avant test physique

- Problème identifié: crash au boot menu (intro) dû à un import manquant `preloadAsset` après refactor navigation.
- Correctif appliqué: réintégration de `preloadAsset` dans `mainmenu.js` et `garage.js`.
- Statut: **corrigé et revalidé** après relance utilisateur.


## 7) Clôture Sprint 3

- Validation smartphone reçue: démarrage fonctionnel, near-miss/combo testables.
- Sprint 3 clôturé, passage autorisé au Sprint 4.
