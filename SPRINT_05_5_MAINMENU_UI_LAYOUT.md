# CrashTown — Sprint 5.5 (intermédiaire): Main Menu UI Layout + Wallet + Quêtes

## Statut sprint
- **État:** En cours (bloqué en attente validation physique)
- **Objectif:** réorganiser le menu principal sans changer les visuels globaux, uniquement disposition des box/boutons et popups wallet/quêtes.

---

## 1) Objectifs sprint

1. Adapter le layout principal pour écrans variés (scaling des box/boutons).
2. Ajouter le wallet fermé dans le menu + popup wallet détaillé.
3. Ajouter popup quêtes journalières cohérent (IMPACT + box dédiée).

---

## 2) Avancement itération 1

- [x] Daily missions card repositionnée dans la pile principale.
- [x] Wallet closed card ajouté dans le menu principal.
- [x] Popup wallet avec 2 modules currency (credits/emerald) + boutons add + bouton fermer.
- [x] Fermeture popup wallet via bouton close et via clic overlay.
- [x] Popup quêtes journalières ajouté (3 étapes crédits + complétion +5 emerald).
- [x] Wallet menu nettoyé: suppression du texte parasite sur le bouton fermé.
- [x] Bouton shop aligné à la largeur du bouton wallet.
- [x] Daily missions: ouverture popup + récompense journalière +50 crédits (1 fois / 24h) avec micro animation cadeau.
- [x] Wallet: échange implémenté 5 emeralds -> 500 crédits.
- [ ] Validation physique (toi) sur plusieurs tailles d'écran.

---

## 3) DoD Sprint 5.5

- [ ] Layout lisible sur écran petit/moyen/grand sans overlap.
- [ ] Wallet popup conforme au mockup de structure (positionnement des modules/actions).
- [ ] Popup quêtes journalières compréhensible et visuellement cohérent.
- [ ] Aucun bug P0/P1 introduit sur navigation menu.


## 4) Itération 2 — alignement mockup + correctif audio play

- [x] Ajustement du layout du wallet popup (taille, marges modules, lisibilité des valeurs, position des actions) pour se rapprocher du mockup.
- [x] Correctif audio Play: piste `OnRoad 4` corrigée (`.mp3`), suppression du faux chemin `.mp3.mp3`.
- [x] Correctif persistance radio Play: la piste choisie est relue au chargement et rejouée automatiquement dès que l’autoplay est autorisé, avec fallback sur première interaction utilisateur.
- [ ] Validation physique Android (à faire): vérifier le démarrage de la piste sélectionnée au lancement de run, puis après fermeture/réouverture de l’app.


## 5) Prochaines choses à faire (priorité)

- [ ] Déployer les animations de boutons sur tout le jeu (menu, garage, play, popups) avec states unifiés.
- [ ] Lancer la passe des vraies animations runtime en mode jeu (near-miss, takedown, crash, combo, pickup).
- [ ] Vérifier budget perf mobile pendant animations (pas de drop visible sur Android mid-tier).


## 6) Itération 3 — animations priorisées

- [x] Première passe animations boutons globales déployée (menu, garage, play, popups).
- [ ] Tuning final des courbes/offsets d'animation sur device Android réel.
- [ ] Démarrage de la passe "vraies animations gameplay" (near-miss, takedown, crash, combo, pickup).
