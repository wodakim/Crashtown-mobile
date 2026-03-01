# CrashTown — Sprint 3: Tutoriel de test physique (Near-miss + Combo MVP)

## 0) Objectif
Valider sur appareils réels Android (low/mid/high) que:
1. le **near-miss** déclenche quand il faut,
2. le **combo** est lisible et cohérent,
3. aucune régression bloquante n'apparaît (crash, freeze, scoring incohérent).

---

## 1) Préparation (une seule fois)

1. Installer l'APK de test sur 3 appareils:
   - **Low-end** (entrée de gamme),
   - **Mid-range**,
   - **High-end**.
2. Fermer les applis lourdes en arrière-plan.
3. Désactiver économiseur batterie pendant le test.
4. Vérifier que la luminosité et le volume sont suffisants pour voir/entendre les feedbacks.

---

## 2) Scénarios de test obligatoires

## Scénario A — Near-miss déclenchement
- Lancer 5 runs.
- Chercher des dépassements latéraux "très proches" sans collision.
- Vérifier:
  - le feedback near-miss apparaît,
  - le score augmente,
  - un step combo est visible.

**Attendu:** near-miss visible régulièrement sans faux positifs massifs.

## Scénario B — Combo progression
- Lancer 5 runs.
- Enchaîner au moins 3 actions (overtake / near-miss / takedown).
- Vérifier:
  - le badge combo affiche une valeur croissante,
  - le multiplicateur augmente,
  - le bonus score est perceptible.

**Attendu:** montée combo cohérente, lisible et motivante.

## Scénario C — Combo timeout
- Construire un combo puis rester passif quelques secondes.
- Vérifier:
  - reset combo automatique,
  - pas de blocage UI,
  - reprise combo possible ensuite.

**Attendu:** expiration stable, comportement prévisible.

## Scénario D — Combo collision break
- Construire un combo puis provoquer une collision.
- Vérifier:
  - combo reset immédiat,
  - game over normal,
  - pas de score incohérent.

**Attendu:** break sur collision systématique.

## Scénario E — Stabilité run long
- 2 runs de 5 minutes (si possible) par appareil.
- Vérifier:
  - pas de freeze,
  - pas de chute FPS majeure durable,
  - contrôles toujours réactifs.

**Attendu:** stabilité acceptable sur les 3 classes d'appareils.

---

## 3) Tableau de résultat à me renvoyer

Copier-coller ce bloc et remplir:

```txt
[DEVICE] Nom modèle / Android version / classe (low-mid-high)
- Scénario A Near-miss: PASS/FAIL (+ notes)
- Scénario B Combo progression: PASS/FAIL (+ notes)
- Scénario C Combo timeout: PASS/FAIL (+ notes)
- Scénario D Combo collision break: PASS/FAIL (+ notes)
- Scénario E Run long: PASS/FAIL (+ notes)
- Bugs observés: (liste)
- Gravité: P0/P1/P2
- Repro 100% ? oui/non
```

---

## 4) Critères de validation Sprint 3 (go/no-go)

Sprint 3 est validé si:
1. A/B/C/D passent sur au moins 2 appareils sur 3 sans bug P0/P1.
2. Aucun crash bloquant reproductible.
3. Le combo reste lisible visuellement (pas de feedback fantôme).

Sinon:
- on reste en Sprint 3,
- je corrige en priorité P0/P1,
- puis on refait un mini-cycle de validation physique.

---

## 5) Ce que je ferai dès ton retour

1. Tri des bugs par gravité.
2. Patch prioritaire Sprint 3.1 (stabilité/fairness).
3. Mise à jour du document Sprint 3 (DoD coché ou non).
4. Si validé: passage strict Sprint 4 (Obstacle system + Spawn director v2).
