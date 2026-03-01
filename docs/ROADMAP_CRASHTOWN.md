# CrashTown — Roadmap définitive (stratégique et évolutive)

> Objectif: rendre CrashTown **professionnel, fluide et buildable APK** sans casser l'existant.
>
> Cette version est la feuille de route unique.
> Les anciennes notes de “mise de côté” et le plan séparé sont fusionnés ici.

---

## 1) Principes de pilotage

- ✅ On protège l'existant fonctionnel (menu/garage/course) pendant toute l'exécution.
- ✅ On avance par lots courts, mesurés, réversibles.
- ✅ On choisit les technologies **au moment opportun** selon:
  1. compatibilité Android/WebView réelle,
  2. stabilité perf (frame pacing),
  3. coût de build/maintenance,
  4. valeur produit (rétention, qualité perçue).

### Règle de décision (importante)
Pour les sujets sensibles (moteur, rendu, persistance, architecture), la décision n'est pas figée à l'avance:
- on benchmark,
- on compare 2 options max,
- on choisit celle qui sert le mieux l'APK final.

---

## 2) État actuel (audit synthétique)

### Déjà solide
- Boucle gameplay lane-racer fonctionnelle.
- Navigation menu → garage → play fonctionnelle.
- Préchargement d'assets déjà présent.
- Contrôles tactiles déjà en place côté course.
- Base Capacitor déjà présente.

### À professionnaliser prioritairement
- instrumentation perf continue,
- homogénéité UX mobile (zones tactiles, hiérarchie UI),
- transitions/navigation sans jank,
- stabilité frame-time en montée de difficulté,
- game feel audio/haptique cohérent.

---


## 2.b) Suivi des boucles (mise à jour continue)

- ✅ **Boucle 1 terminée**: instrumentation perf de base + checklist non-régression documentée.
- ✅ **Boucle 1.1 terminée**: correctif mineur retry audio (conservation de la piste radio choisie).
- ✅ **Boucle 2 terminée**: normalisation tactile des actions critiques (48x48 + spacing).
- ✅ **Boucle 2.1 terminée**: restauration DA Garage (ergonomie conservée sans dénaturer la carte visuelle).
- ✅ **Boucle 3 terminée**: transitions de sortie sous feature flag (fallback CSS, sans casser la navigation).
- ✅ **Boucle 3.1 terminée**: intro vidéo jouée une seule fois par session + loading inter-pages adouci (pas systématique).
- 📱 **À tester physiquement (toi)**: intro vidéo seulement au lancement app (pas à chaque retour menu), transitions menu/garage/play sans écran de chargement forcé, rendu Garage DA, persistance radio retry, speed box bas, pause audio/gameplay arrière-plan.

---

## 3) Roadmap d'exécution (ordre recommandé)

## Vague A — Mesure & sécurisation

### A1. Instrumentation runtime ✅
- Mesurer: cold start, temps de navigation inter-écrans, FPS moyen, 1% low, frame max. 📱

### A2. Filets de sécurité ✅
- Checklists non-régression par écran. 📱
- Rollback simple par lots.

**Sortie attendue**: base de décision factuelle avant modifications lourdes.

---

## Vague B — UX mobile robuste

### B1. Ergonomie tactile
- Cibles 48x48dp min + spacing 8dp.
- Actions critiques dans zone pouce.

### B2. Navigation fluide
- Option prioritaire robuste: transitions classes CSS (`transform` + `opacity`).
- Option avancée: activer View Transitions API uniquement si support confirmé.

### B3. Perception de chargement
- Skeleton screens sur points d'attente visibles.
- Préchargement critique-first.

**Sortie attendue**: ressenti pro immédiat, sans dépendance fragile.

---

## Vague C — Performance & gameplay

### C1. Frame pacing
- Tenir le budget 16ms/frame (puis 8ms sur devices ciblés 120Hz).
- Réduction reflow/repaint UI.

### C2. Trafic et fairness
- Tuning data-driven de la densité.
- Bag randomization pour éviter les séries injustes.

### C3. Trajectoires IA lisibles
- LERP + Smoothstep pour déports organiques et légers CPU.

**Sortie attendue**: fluidité stable + difficulté perçue mieux contrôlée.

---

## Vague D — Game feel

### D1. Micro-interactions
- Retour visuel < 100ms.
- Squash/stretch et easing cohérents.

### D2. Haptique
- Presets sémantiques Capacitor (Light/Medium/Heavy) comme base.
- Raffinement progressif par contexte (near-miss, crash, validation).

### D3. Audio
- Web Audio API pragmatique: variations pitch/volume UI.
- Moteur dynamique: boucles idle/mid/high + playbackRate + crossfade.

### D4. Animations boutons (global jeu)
- Standardiser les états `idle/hover/press/release/disabled` sur tous les boutons (menu, garage, play, popups).
- Ajouter micro-feedback press (<100ms) + rebond léger cohérent DA sur tout le jeu.
- Garantir des hitboxes tactiles stables pendant l’animation (pas de mauvais tap).

### D5. Vraies animations mode jeu (runtime)
- Passer des feedbacks statiques à des animations gameplay visibles: near-miss, takedown, crash, combo, pickup.
- Introduire timeline d’animation en course (entrée/sortie, intensité selon vitesse, enchaînement non bloquant).
- Ajouter un budget perf animation (60 FPS cible Android mid-tier, fallback simplifié si charge trop élevée).

**Sortie attendue**: sensation premium perceptible sans dette technique excessive.

---

## Vague E — Rétention & extensions

### E1. Rétention progressive
- Étape 1: inbox in-game + signaux visuels (pastille bonus).
- Étape 2: notifications locales OS quand politique produit validée.

### E2. Persistance
- Coexistence localStorage + IndexedDB.
- Migration progressive selon besoins.

### E3. Garage “3D perçue”
- Priorité pratique: sprite sheets 2.5D.
- WebGPU/WASM seulement si ROI + compatibilité + stabilité validés.

**Sortie attendue**: engagement renforcé sans fragmentation technique.

---

## 4) Cadre de décision technique (demandé)

Tu m'as demandé de choisir au bon moment ce qui est le mieux pour une app mobile pro/APK:

### 4.1 Architecture UI/engine
- Le choix entre maintenir le flow HTML actuel, hybrider, ou migrer progressivement sera fait **au moment opportun**, après benchmarks de coût/perf/risque.

### 4.2 Rendu avancé (WebGPU/WASM)
- Décision différée jusqu'à preuve de compatibilité et de gain réel sur devices cibles.

### 4.3 Persistance
- La stratégie finale (localStorage + IndexedDB + éventuelle normalisation) sera décidée selon besoins réels de progression et migration sûre.

### 4.4 Stratégie de livraison
- Petits lots si c'est optimal.
- Lot plus large possible si les mesures prouvent que le risque reste contrôlé.

---

## 5) Prochain coup (lot de départ recommandé)

### Lot 1 (mise à jour)
1. ✅ instrumentation perf minimale (livré),
2. ✅ checklist non-régression (livré),
3. ✅ normalisation tactile actions critiques (48x48) 📱,
4. ✅ transition CSS sous feature flag 📱,
5. ✅ speed box alignée bas écran avec safe-area 📱,
6. ✅ pause gameplay + audio sur app en arrière-plan 📱,
7. ✅ restauration DA Garage sans casser ergonomie 📱,
8. ✅ transitions de sortie sous feature flag (CSS fallback) 📱,
9. ✅ intro une fois/session + loading inter-pages adouci 📱,
10. 🔜 rapport avant/après 📱.
11. ✅ correctif retry audio: conserver la piste sélectionnée. 📱
12. 🟡 pack animations boutons globales (menu/garage/play/popups) avec states unifiés + feedback press (première passe livrée, tuning en cours).
13. 🔜 première passe des vraies animations gameplay en run (near-miss/takedown/crash/combo/pickup) sous budget perf Android.

C'est le meilleur point de départ pour avancer vite **et** protéger ton jeu.
