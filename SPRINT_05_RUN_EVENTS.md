# CrashTown — Sprint 5: Run events (trafic dense + nuit)

## Statut sprint
- **État:** Terminé
- **Objectif:** introduire deux variations de run qui modifient légèrement le gameplay sans casser la fairness.

---

## 1) Objectifs sprint

1. Ajouter l'event `dense_traffic` (trafic plus dense).
2. Ajouter l'event `night` (visuel nuit + tuning vitesse prudent).
3. Instrumenter le cycle event (`start`/`end`) en télémétrie.

---

## 2) Avancement itération 1

- [x] Configuration data-driven des run events dans `src/data/gameplay.js`.
- [x] Lifecycle runtime dans `play.js` (planning, activation, expiration).
- [x] Event `dense_traffic` branché sur le spawn director (intervalle réduit, cap bots augmenté).
- [x] Event `night` branché sur le runtime vitesse (cruise/speed cap) + classe visuelle dédiée.
- [x] Tracking télémétrie `run_event_start` et `run_event_end`.
- [x] Cadence run events allongée (>= 2 min) entre changements jour/nuit.
- [x] Éclairage nuit ajusté en bandes latérales progressives (sans halo localisé) jusqu'à la route, teinte jaune translucide.
- [x] Lecture radio on-road stabilisée (démarrage unique sur première interaction).
- [x] Playlist radio on-road enrichie avec `Onroad 4` (`Sound_music_onroad_song_fellas_sample_v01.mp3`).
- [x] Validation gameplay manuelle approfondie sur appareils réels (fairness/ressenti) (validée par toi).

---

## 3) DoD Sprint 5

- [x] Variantes de run perceptibles par le joueur en moins de 2 sessions.
- [x] Pas de spike injuste de collisions pendant `dense_traffic`.
- [x] Event `night` lisible visuellement sans perte majeure d'info gameplay.
- [x] Aucun bug P0/P1 introduit.


## 4) Clôture

- **Validation propriétaire (toi):** test physique Sprint 5 validé.
- **Décision:** approfondissements graphiques/animation/gameplay reportés à une itération dédiée ultérieure.
