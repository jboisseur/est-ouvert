# Pourquoi ce projet
Si comme moi vous en avez assez de demander régulièrement à Google les horaires de la bibliothèque voici un moyen de rassembler sur une page vos établissements habituels avec leurs horaires.

# Crédits
Ce service s'appuie sur
- les données renseignées dans [OpenStreetMap](https://www.openstreetmap.org) (contribuez en vous amusant avec [StreetComplete](https://streetcomplete.app/))
- l'[API Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API)
- la bibliothèque [opening_hours.js](https://github.com/opening-hours/opening_hours.js)
- le framework [Vue.js](https://vuejs.org/)
- la bibliothèque d'interface [Kelp](https://kelpui.com/)

# Ce qu'il reste à faire
## Fonctionnel
- [ ] Permettre de rafraichir toutes les données
- [x] Ajouter un indicateur ouvert / fermé avec `oh.getState(date);`
- [ ] Indiquer le poids utilisé dans le stockage local
- [ ] Gestion d'erreur : jour férié (https://www.openstreetmap.org/node/3049211018#map=18/48.578632/7.759990), code pays manquant (https://www.openstreetmap.org/node/1255714662)
- [x] Désactiver le bouton Ajouter quand le fetch est en cours

## UI
- [x] Trouver un moyen de faire un saut de ligne entre les jours
- [x] Ajouter une espace après la virgules dans les heures pour améliorer l'affichage sur téléphone
- [ ] Trouver comment ne pas indiquer comme erroné le champ vidé une fois cliqué sur Ajouter
- [ ] Permettre de réorganiser les lignes du tableau par glisser / déposer