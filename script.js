/* Todo: 
    - une fois le pb résolu sur l'identification de l'élément à mettre à jour (ou supprimer), passer à un affichage lifté des horaires avec la bibliothèque qui va bien
*/
const lsn = 'estouvert'; // lsn = local storage name

const app = Vue.createApp({
    data() {
        return {
            fetchInfo: "",
            fetchFailed: false,
            fetchQuery: "",

            itemList: localStorage.getItem(lsn) ? JSON.parse(localStorage.getItem(lsn)) : [],
            itemUrl: null
        }
    },
    methods: {
        addItem() {
            const itemUrl = this.itemUrl.trim();
            const id = itemUrl.substring(itemUrl.lastIndexOf("/") + 1);        
            const type = itemUrl.includes('way') ? 'way' : 'node';
            const item = { id, type };
            this.itemList.push(item);
            this.saveItemList();
            this.fetchQuery = 
                `[out:json][timeout:50];
                ${ item.type }(id:${ item.id });
                out;`;
            this.fetchData(this.fetchQuery);
        },
        updateItem(id, tags) {
            const index = this.findIndex(id.toString());
            this.itemList[index].name = tags.name;
            this.itemList[index].oh = this.liftOh(tags.opening_hours);
            this.saveItemList();
        },
        deleteItem(id) {
            const index = this.findIndex(id);
            this.itemList.splice(index, 1); // remove this item
            this.saveItemList();
        },
        saveItemList() {
            let parsed = JSON.stringify(this.itemList);
            localStorage.setItem(lsn, parsed);
        },
        findIndex(itemId) {            
            return this.itemList.findIndex(itemObject => itemObject.id === itemId);
        },
        fetchData(query) {
            this.fetchInfo = "Recherche d'informations en cours...";
            this.fetchFailed = false;
            fetch('https://overpass-api.de/api/interpreter',{method: "POST",body: "data=" + encodeURIComponent(query),})
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`${response.status}`);
                    }
                    return response.json()
                })
                .then(data => {
                    this.fetchInfo = "";
                    const elem = data.elements[0];
                    const id = elem.id;
                    const tags = elem.tags;
                    this.updateItem(id, tags);
                })
                .catch(error => {
                    this.fetchFailed = true;
                    this.fetchInfo = `Aïe quelque chose s'est mal passé (${error})`;
                });
        },
        liftOh(str) {
            let locale = navigator.language;
            let oh = new opening_hours(str, {}, { locale: locale });
            return oh.prettifyValue({ conf: { locale: locale } });
        }
    }
})

app.mount('#app');