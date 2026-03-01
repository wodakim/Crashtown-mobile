# CrashTown — Checklist non-régression (Boucle 1)

> Exécuter après chaque lot sur téléphone réel.

## Navigation & écrans
- 📱 Vérifier que l'intro vidéo se joue au premier lancement de session seulement, puis ne se relance pas après retour au menu.
- 📱 Vérifier les transitions de sortie (menu→garage, garage→play, play→menu) : pas de flash blanc, animation brève fluide.
- 📱 Vérifier que les transitions inter-pages restent fluides sans écran de chargement systématique sur navigation rapide.
- 📱 Ouvrir `index.html` et vérifier que l'intro/menu apparaissent sans blocage.
- 📱 Passer de `index -> garage -> play` puis retour menu.
- 📱 Vérifier qu'aucun écran ne reste figé sur le loader de navigation.

## Gameplay
- 📱 Lancer une course 60+ secondes.
- 📱 Vérifier changement de voie (tap/swipe), pause, reprise, retry.
- 📱 Vérifier que le score et la vitesse continuent de s'actualiser.
- 📱 Vérifier que la speed box reste collée au bas utile de l'écran (au-dessus de la barre système).
- 📱 Mettre l'app en arrière-plan puis revenir: le jeu doit être en pause (pas d'écoulement caché).

## Ergonomie tactile
- 📱 Vérifier que le garage respecte la DA cible (panneau central lisible, flèches/variantes/couleurs bien visibles, bouton PLAY NOW cohérent visuellement).
- 📱 Vérifier que les boutons principaux sont faciles à toucher (menu, garage, pause, settings).
- 📱 Vérifier qu'il y a assez d'espace entre les actions proches (pas de mauvais tap).

## Audio
- 📱 Vérifier musique menu, musique garage, radio en course.
- 📱 Vérifier qu'aucune piste ne continue en arrière-plan après changement de page.
- 📱 En course, choisir Radio 2 ou 3, faire `Retry`, vérifier que la radio reste sur le même choix.

## Performance (console)
- 📱 Ouvrir la console distante et vérifier la présence des logs:
  - `[CT PERF] <page> cold-start: ...ms`
  - `[CT PERF] nav index.html->garage.html: ...ms`
  - `[CT PERF] play.frame: avg=... fps~... max=...`

## Meta progression (Sprint 6)
- 📱 Finir un run et vérifier l’affichage game over: XP gagné + niveau + statut missions.
- 📱 Ouvrir popup quêtes et vérifier progression daily + weekly.
- 📱 Réclamer quêtes complétées et vérifier incrément wallet (pas de double claim).
- 📱 Redémarrer l’app et confirmer persistance XP/level/missions/wallet.

## Difficulté run (pré-test physique)
- 📱 Depuis le garage, appuyer Play et vérifier l’apparition des 3 cartes difficulté animées.
- 📱 Facile: confirmer absence obstacles + trafic plus modéré + bots sans changements de voie.
- 📱 Normal: confirmer absence obstacles + bots changent rarement de voie.
- 📱 Difficile: confirmer comportement actuel (obstacles + navigation organique bots).
- 📱 Vérifier que le game over affiche XP/niveau cohérents selon la difficulté choisie (x0.25 / x1 / x1.5).
