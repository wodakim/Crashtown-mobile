# CrashTown — Sprint 2: Foundation technique (Phase 1)

## Statut sprint
- **État:** Terminé
- **Objectif:** poser la base technique pour accélérer les features S3+ sans dette explosive.

---

## 1) Objectifs sprint (ordre strict roadmap)

1. Refactoriser modules partagés: `storage`, `audio`, `navigation`, `telemetry`.
2. Mettre en place un système de feature flags.
3. Poser une structure data-driven minimale pour le balancing/paramètres.

---

## 2) Travail réalisé dans ce sprint (itération 2)

### ✅ Foundation ajoutée
- `src/core/storage.js`
  - lecture/écriture sécurisée JSON/number
  - préfixage centralisé
  - version de storage
- `src/core/featureFlags.js`
  - flags centralisés + valeurs par défaut
  - lecture/mise à jour des flags
- `src/core/telemetry.js`
  - tracking d'événements avec buffer local
  - fonctions de lecture/clear
- `src/core/audio.js`
  - helpers audio safe play / stop reset

### ✅ Intégration initiale
- `play.js` utilise les modules core pour:
  - storage versioning (`ensureStorageVersion`)
  - wallet/radio via storage centralisé + migration legacy
  - flags (`tutorialEnabled`)
  - télémétrie (`play_session_start`, `takedown`, `collision`)
  - helpers audio safe (`safePlay`, `stopAndReset`)
- `mainmenu.js` et `garage.js` utilisent désormais un module navigation commun (`src/core/navigation.js`).
- `src/data/gameplay.js` centralise un premier lot de paramètres gameplay data-driven.

---

## 3) Points restants Sprint 2

- [x] Extraire un module `navigation` commun sans casser les flux existants.
- [x] Introduire un fichier data-driven pour paramètres gameplay (premier lot).
- [x] Uniformiser progressivement les clés storage historiques vers la couche core.

---

## 4) DoD Sprint 2

Sprint 2 est terminé si:
1. Les modules partagés sont créés et utilisés dans au moins un flux critique en prod (`play`).
2. Aucun bug de régression majeur gameplay/audio/navigation introduit.
3. Build passe et syntaxe des fichiers touchés est valide.
4. Les éléments non terminés sont explicitement tracés pour la prochaine itération Sprint 2.


## 5) Clôture Sprint 2

- Tous les objectifs Sprint 2 sont cochés (modules partagés, feature flags, structure data-driven initiale).
- Sprint 2 clôturé, passage autorisé au Sprint 3 (Near-miss + Combo MVP).
