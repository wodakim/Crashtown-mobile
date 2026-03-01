# Radio stations — comment ça marche

La radio in-game lit les fichiers listés dans `playlist.json` de chaque dossier station:

- `public/Assets/Sounds/Onroad/radio/radio_happyness/playlist.json`
- `public/Assets/Sounds/Onroad/radio/radio_internationnal/playlist.json`
- `public/Assets/Sounds/Onroad/radio/radio_phonk/playlist.json`
- `public/Assets/Sounds/Onroad/radio/radio_random/playlist.json`
- `public/Assets/Sounds/Onroad/radio/radio_rap/playlist.json`
- `public/Assets/Sounds/Onroad/radio/radio_rock/playlist.json`

## Pourquoi la musique peut ne pas se lancer
Si `tracks` est vide dans `playlist.json`, la station est considérée vide.
Le jeu tente un fallback legacy, mais si les fichiers fallback ne sont pas présents sur ton build, tu n'auras pas de son.

## Procédure correcte après ajout/suppression de mp3
1. Déposer tes `.mp3` dans le dossier station voulu (`radio_rap`, `radio_rock`, etc.).
2. Lancer: `npm run radio:scan`
3. Vérifier que `playlist.json` contient bien les noms de tes fichiers (`tracks` non vide).
4. Rebuild APK après la génération des playlists.

## Important
Chaque modification de contenu audio (ajout/retrait/renommage) doit être suivie d'un `npm run radio:scan` avant le build.
