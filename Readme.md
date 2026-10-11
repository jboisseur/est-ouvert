Démo : [https://estouvert.jboisseur.xyz](https://estouvert.jboisseur.xyz)

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
- [x] Gestion d'erreur : jour férié, code pays manquant -- nécessite de passer un objet "nominatim" en paramètre lors de la création d'un objet opening hour. Construit grâce au [Reverse Geocoding](https://nominatim.org/release-docs/develop/api/Reverse/) à partir de la latitude et de la longitude, uniquement disponibles sur les type Node. Donc pour les type Way il faut récupérer les informations sur le premier Node lié, d'où une cascade de Fetch.
- [x] Désactiver le bouton Ajouter quand le fetch est en cours
- [ ] Donner la possibilité d'abandonner une requête si elle n'aboutit pas

## UI
- [x] Trouver un moyen de faire un saut de ligne entre les jours
- [x] Ajouter une espace après la virgules dans les heures pour améliorer l'affichage sur téléphone
- [ ] Trouver comment ne pas indiquer comme erroné le champ vidé une fois cliqué sur Ajouter
- [ ] Permettre de réorganiser les lignes du tableau par glisser / déposer
- [ ] Ajouter une Foire aux questions