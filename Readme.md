# Pourquoi ce projet
Si comme moi vous en avez assez de demander régulièrement à Google les horaires d'un même magasin voici un moyen de rassembler sur une page vos établissements préférés avec leurs horaires.

# Crédits
Ce service s'appuie sur [OpenStreetMap](https://www.openstreetmap.org) (contribuez en vous amusant avec [StreetComplete](https://streetcomplete.app/)), l'[API Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API) et la bibliothèque [opening_hours.js](https://github.com/opening-hours/opening_hours.js).

# Ce qu'il reste à faire
Beaucoup de choses car on n'en est encore qu'à une bêta.

## Fonctionnel
- Renforcer les contrôles
    - vérifier que JavaScript est activé
    - vérifier que le localStorage est disponible
    - vérifier les données entrées dans le champ
- Mettre plus en évidence les erreurs le cas échéant
- Permettre de rafraichir les données
- Ajouter un indicateur ouvert / fermé
- Limiter le stockage

## UI
- Rendre le service le plus accessible possible
- Mettre un peu de déco
- Permettre de trier le tableau
    - par ordre alpha
    - par horaire 
    - par distance géographique par rapport à sa position