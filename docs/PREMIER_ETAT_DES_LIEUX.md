# Premier état des lieux du repository Crashtown

## Ce que j'ai pris en compte
- Le projet est un jeu web **HTML/CSS/JS** avec 3 écrans principaux:
  - `index.html` + `mainmenu.js` + `mainmenu.css` (menu principal).
  - `garage.html` + `garage.js` + `garage.css` (sélection véhicule / options garage).
  - `play.html` + `play.js` + `play.css` (session de run).
- Le dépôt inclut aussi une couche mobile Capacitor (`android/`, `ios/`) et un volume important de dépendances JavaScript via `node_modules`.
- Les assets sont très structurés dans `public/Assets/` (UI, véhicules HD/pixel, sons, routes, branding, vidéo d’intro).
- La doc de cadrage est répartie dans plusieurs fichiers sprint (`SPRINT_*.md`) et roadmap (`docs/ROADMAP_CRASHTOWN.md`, `ROADMAP_PROFESSIONNELLE.md`).

## Compréhension fonctionnelle rapide
- **Main menu**: intro vidéo, preload d'assets, musique, popups (profil/settings/wallet/daily/shop), transition vers garage.
- **Garage**: navigation entre véhicules, variantes HD/pixel, réglages audio garage, lancement de la course.
- **Play**: run avec trafic, score/vitesse, pause, settings en course, game over, événements de run, gestion wallet/stockage local.

## Vérification pratique effectuée
- Lancement local via serveur statique Python.
- Parcours visuel de l'expérience: menu -> popup settings -> garage -> play -> pause.
- Captures d'écran générées pour matérialiser la compréhension de ce premier passage.

## Limite assumée
- Le dépôt contient des milliers de fichiers (dont dépendances et binaires). Je les ai pris en compte **par structure et rôle** sur ce premier passage, mais je n'ai pas fait une lecture ligne-à-ligne de tous les fichiers binaires/vendor (ce qui serait peu utile pour une première synthèse).
