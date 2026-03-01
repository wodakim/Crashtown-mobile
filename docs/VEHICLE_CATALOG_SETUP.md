# Vehicle catalog — fonctionnement

Le garage, le shop et la course utilisent un catalogue commun:

- `src/data/vehicles.js` (métadonnées gameplay/shop/couleurs/prix)
- `src/data/vehicles.generated.js` (variantes HD/Pixel/couleur détectées automatiquement)

## Convention de nommage (scan)

Le scan lit les PNG dans:

- `public/Assets/Vehicles/Player/HD/`
- `public/Assets/Vehicles/Player/Pixel/`

Pattern conseillé pour les couleurs:

- `Vehicles_<CARID>_<COLOR>_base_v01.png`

Exemple Lamborghini (ID: `LAMBORGHINI`):

- `Vehicles_LAMBORGHINI_white_base_v01.png`
- `Vehicles_LAMBORGHINI_yellow_base_v01.png`
- `Vehicles_LAMBORGHINI_blue_base_v01.png`
- `Vehicles_LAMBORGHINI_red_base_v01.png`
- `Vehicles_LAMBORGHINI_green_base_v01.png`

pour **HD et Pixel** (mêmes noms dans chaque dossier).

Couleurs reconnues (tokens):

- `white`, `yellow`, `blue`, `red`, `green`

Notes:

- Si tu utilises un nom legacy (ex: `Vehicles_BMW_HD_base_v01.png`), le scan le met dans `base`.
- Le jeu prend la couleur demandée, puis fallback sur la couleur de base, puis `base`.

## Où mettre le prix

Le **prix ne vient pas du nom de fichier**.
Il se configure dans `src/data/vehicles.js`, dans chaque entrée voiture:

- `shop.carPriceCredits` → prix de la voiture
- `shop.colorPricesCredits.<color>` → surcoût de couleur

Exemple:

```js
shop: {
  carPriceCredits: 4800,
  colorPricesCredits: {
    white: 0,
    yellow: 500,
    blue: 500,
    red: 700,
    green: 700,
  },
}
```

## Workflow pour ajouter une voiture

1. Ajouter les PNG HD + Pixel avec la convention de nommage.
2. Lancer `npm run vehicle:scan`.
3. Ajouter/compléter l’entrée dans `src/data/vehicles.js` (id, nom, son, couleurs, prix).
4. Vérifier la carte dans la boutique (prix voiture/couleur/total).


## Règle de départ gameplay

- Au premier lancement, seule `RX7` en `white` est débloquée gratuitement.
- Toutes les autres voitures/couleurs doivent être achetées dans la boutique avant sélection dans le garage.
