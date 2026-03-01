# CrashTown — Analyse globale approfondie (code texte, hors binaires)

> Portée: audit approfondi du dépôt **sur les fichiers texte uniquement** (JS/MJS/HTML/CSS/MD/config), avec exclusion explicite des binaires (images/audio/vidéo).
>
> Date: 2026-03-01.

## 1) Niveau de maturité réel du projet

CrashTown est déjà au stade **vertical slice jouable solide**:
- flow menu → garage → run stable,
- gameplay core enrichi (near-miss, combo, obstacles, run events),
- instrumentation perf/telemetry présente,
- pipeline Android Capacitor déjà branché.

Mais la V1 roadmap « pro/store-ready » n’est pas encore bouclée: les systèmes meta (missions complètes, XP/progression, upgrades, économie complète, robustesse storage avancée) restent partiels ou absents.

---

## 2) Cartographie profonde du code (lecture par couches)

## 2.1 Runtime actuel réellement utilisé (HTML/JS vanilla)

### Écran menu (`index.html` + `mainmenu.js`)
- Gère boot preload + intro vidéo sessionnelle, musique menu, popup stack (settings/profile/shop/wallet/daily), sélection radio en amont de la run, et navigation vers garage.
- Intègre déjà des briques produit: profile simple, wallet (credits/emerald), reward quotidien, shop de véhicules/couleurs.

### Écran garage (`garage.html` + `garage.js`)
- Sélection véhicule/qualité/couleur, contrôle lock/unlock ownership, audio garage, navigation play/menu, et fallback assets.
- `garage.js` exploite correctement `src/data/vehicles.js` + `src/data/vehicleOwnership.js` pour rendre les états d’achat.

### Écran run (`play.html` + `play.js`)
- Cœur gameplay et state machine run.
- Near-miss/combo/takedown, obstacles, run events (`dense_traffic`, `night`), radio on-road multi-stations/playlist queue/history, pause/background handling, retry.
- Instrumentation perf (`createFrameBudgetTracker`) et telemetry event bus active.

## 2.2 Couche core partagée
- `src/core/storage.js`: wrappers read/write JSON/number + prefix + versioning minimal.
- `src/core/telemetry.js`: buffer local borné + `trackEvent`.
- `src/core/navigation.js`: preload asset unifié + navigation préchargée.
- `src/core/audio.js`: helpers safe play/stop.
- `src/core/featureFlags.js`: flags centralisés (télémétrie/tutorial/combo/etc.).

## 2.3 Couche data/catalogues
- `src/data/gameplay.js`: tuning data-driven (spawn, bot, combo, obstacle, run events, etc.).
- `src/data/vehicles.js`: catalogue méta (prix, couleurs, sons) + fallback variants.
- `src/data/vehicles.generated.js`: mapping généré depuis assets.
- `src/data/radioStations.js`: stations + fallback legacy track builder.
- `src/data/vehicleOwnership.js`: ownership/couleurs persistés et normalisés.

## 2.4 Scripts d’automatisation déjà utiles (facilitation)
- `scripts/generate-vehicle-catalog.mjs`: scan PNG HD/Pixel et génération catalogue variantes.
- `scripts/generate-radio-playlists.mjs`: scan mp3 par station et génération `playlist.json`.

Ces deux scripts sont la bonne direction pour « faciliter ce qui est déjà actif » (skins/audio).

---

## 3) Vérification profonde: ce qui est bien construit

1. **Data-driven gameplay réel**: de nombreuses constantes gameplay sont déjà externalisées dans `src/data/gameplay.js`, réduisant le hardcode direct dans la boucle de jeu.
2. **Fallback pragmatique**: navigation preload, asset candidates obstacles, fallback radio legacy, normalization ownership.
3. **Lifecycle mobile pris en compte**: `visibilitychange`, `blur`, `pagehide` gèrent pause/audio en arrière-plan.
4. **Instrumentation continue**: perf par page + frame budget + events gameplay significatifs.
5. **Pipeline de scan déjà en place** pour assets dynamiques (voitures/radio), ce qui évite l’édition manuelle répétitive.

---

## 4) Points de friction détectés ligne à ligne (important)

## 4.1 Incohérences de clés storage (dette de cohérence)
- `play.js` utilise `PLAYER_WALLET_KEY = "wallet_credits_v1"`.
- `mainmenu.js` utilise `PLAYER_WALLET_KEY = "ct_wallet_credits_v1"`.

=> risque de divergence entre wallet menu et wallet run (migration partielle actuellement via `migrateLegacyStorageKeys`).

## 4.2 Catalogue/asset naming: plusieurs anomalies réelles
- Le catalogue généré contient un chemin avec suffixe double extension: `...Vehicles_bmw_blue_base_v01.png.png`.
- Plusieurs noms de fichiers mixent conventions (`_HD_`, `_PIXEL_`, `_base_`) de manière hétérogène.

=> le scan fonctionne, mais encode aussi les incohérences de naming au lieu de les signaler.

## 4.3 Préload menu potentiellement obsolète
- `mainmenu.js` précharge des noms « type ancien » (ex: `Vehicles_porshe_HD_base_v01.png`) qui ne correspondent pas clairement aux noms actuellement listés dans le catalogue généré.

=> le boot reste tolérant (erreurs absorbées), mais le preload peut charger inutilement / manquer certains assets exacts.

## 4.4 Radio: fallback présent mais encore semi-manuel
- `loadStationTracks()` lit `playlist.json`, puis fallback via `buildStationTracks()`.
- `buildStationTracks()` repose sur une liste codée (`TRACK_FILENAMES`) qui peut diverger du contenu réel des stations.

=> en cas d’oubli de `npm run radio:scan`, le comportement dépend de fallback legacy et n’est pas totalement déterministe.

## 4.5 README encodé UTF-16 LE
- Le `README.md` est en BOM UTF-16 LE (non standard dans la majorité des toolchains JS).

=> peut gêner certains outils CLI/CI/docs; convertir en UTF-8 serait plus robuste.

## 4.6 Architecture duale à clarifier
- Présence d’une base Phaser (`src/main.js`, `src/game/scenes/*`) alors que le runtime principal du jeu s’exécute actuellement via pages HTML/JS séparées (`mainmenu.js`, `garage.js`, `play.js`).

=> confusion potentielle d’onboarding/dev (quelle architecture est source-of-truth pour la prod Android actuelle?).

---

## 5) Ce qui manque encore versus roadmap pro (mise à jour fine)

## 5.1 MUST-HAVE non clos
1. Vehicle abilities + cooldown.
2. Mission system daily + weekly structuré (pas seulement reward quotidien).
3. XP/levels persistants + boucle de récompense.
4. Upgrades véhicules par stats.
5. Economy loop complète (sources/sinks/tuning central).
6. Save robustness avancée (migrations multi-version, anti-corruption renforcée, stratégie rollback).

## 5.2 SHOULD-HAVE non matérialisés en modules
- Streak rewards, achievements, season pass light, difficulty adaptative formelle, ghost best run, assist mode, replay seed debug.

## 5.3 Delivery/release
- Matrice de tests devices + smoke tests automatisés encore insuffisamment industrialisés.
- Dashboard KPI consolidé par sprint non livré en artefact unique.

---

## 6) Facilitation demandée (skins/audio/scans): plan concret

## 6.1 Skins / véhicules — simplification immédiate

### Déjà actif
- Scan auto via `npm run vehicle:scan` et génération de `vehicles.generated.js`.

### À ajouter pour vraiment simplifier
1. **Mode strict de validation naming** dans le script scan:
   - détecter `.png.png`,
   - détecter tokens couleur non reconnus,
   - détecter variants manquants HD/Pixel,
   - sortir un rapport d’erreurs bloquant (`exit 1` optionnel via flag `--strict`).
2. **Préload menu piloté par catalogue**:
   - arrêter les chemins hardcodés de `mainmenu.js`,
   - générer dynamiquement une shortlist des visuels critiques depuis `VEHICLE_CATALOG`.
3. **Normalisation convention unique**:
   - forcer `Vehicles_<CARID>_<color>_base_v01.png` pour HD et Pixel.

## 6.2 Audio / radio — simplification immédiate

### Déjà actif
- Scan auto playlists via `npm run radio:scan`.

### À ajouter pour fiabiliser
1. **Validation post-scan**:
   - refuser station vide si attendue non vide,
   - détecter doublons/format invalide.
2. **Supprimer dépendance forte à fallback legacy**:
   - en prod, playlist scan devient source unique.
3. **Hook de build**:
   - lancer `radio:scan` + `vehicle:scan` automatiquement avant build Android pour éviter l’oubli humain.

## 6.3 Storage — simplification/réduction bugs
1. Créer un `src/core/keys.js` (single source of truth des clés localStorage).
2. Migrer progressivement `mainmenu.js`, `garage.js`, `play.js` vers ces clés partagées.
3. Ajouter une migration versionnée explicite (v1→v2→v3) avec tests de migration.

---

## 7) Backlog recommandé (ordre d’exécution réaliste)

## Sprint A — « Cohérence & automation » (rapide, fort ROI)
- Unifier clés storage.
- Durcir scripts scans (validation stricte).
- Nettoyer assets naming détectés invalides.
- Brancher scans auto dans pipeline build.

## Sprint B — « Meta V1 pack 1 »
- Mission engine daily/weekly data-driven.
- XP/levels persistants + rewards.

## Sprint C — « Meta V1 pack 2 »
- Upgrades véhicules + balancing table économie.
- Boucle spend/sinks complète et lisible joueur.

## Sprint D — « Release hardening »
- Migrations storage robustes + smoke tests automatisés.
- Matrix Android réelle + rapport KPI consolidé.

---

## 8) Conclusion d’audit

Tu es proche d’un jeu **techniquement jouable et déjà riche sur le core run**.
Le gap final n’est pas “refaire la base”, mais:
1. industrialiser la cohérence (storage + naming + scans),
2. livrer la couche meta de rétention (missions/XP/upgrades/économie),
3. verrouiller fiabilité release Android (migrations + QA devices + KPI).

C’est exactement la zone où je peux t’aider sprint par sprint de façon très concrète.

---

## Annexe — Méthode de vérification appliquée

- Audit des roadmaps/sprints/docs existants.
- Relecture approfondie des modules runtime (`mainmenu.js`, `garage.js`, `play.js`) et des couches `src/core/*`, `src/data/*`, scripts `scripts/*`.
- Contrôles ciblés de cohérence (grep de clés/features, inspection du catalogue généré, vérification de l’encodage README).
- Exclusion stricte des contenus binaires conformément à ta consigne.
