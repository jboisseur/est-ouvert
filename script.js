const lsn = 'estouvert'; // lsn = local storage name

const lang = "fr-FR";
const options = { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric"};
const locale = navigator.language;

function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
        );
    }
}

const app = Vue.createApp({
    data() {
        return {
            info: "",
            localStorageAvailable: storageAvailable("localStorage"),     
            fetchOngoing: false,       
            fetchFailed: false,
            fetchQuery: "",
            item: {},
            itemList: localStorage.getItem(lsn) ? JSON.parse(localStorage.getItem(lsn)) : [],
            itemUrl: null,
            now: new Intl.DateTimeFormat(lang, options).format(Temporal.Now.plainDateTimeISO()),
            intervalId: null
        }
    },
    mounted() {
        // Update now every second (1000ms)
        this.intervalId = setInterval(() => {
            this.now = new Intl.DateTimeFormat(lang, options).format(Temporal.Now.plainDateTimeISO());
            for (let i = 0; i < this.itemList.length; i++) {
                let currentItem = this.itemList[i];
                currentItem.state = this.getOhState(currentItem.rawOh);
            }
            this.saveItemList();
        }, 1000);
    },
    beforeUnmount() {
        // Critical: Clear the interval to prevent memory leaks
        clearInterval(this.intervalId);
    },
    methods: {
        addItem() {
            // From text input
            if (this.verifyInput(this.itemUrl)) {
                const itemUrl = this.itemUrl;
                const id = itemUrl.substring(itemUrl.lastIndexOf("/") + 1);        
                const type = itemUrl.includes('way') ? 'way' : 'node';
                
                this.item = { id, type };

                this.fetchQuery = 
                    `[out:json][timeout:30];
                    ${ this.item.type }(id:${ this.item.id });
                    out;`;
                this.fetchData(this.fetchQuery);

                this.itemUrl = "";
            }
            else {
                this.info = "L'URL ne respecte pas le format attendu."
            }
        },
        updateItem(tags) {
            this.item.name = tags.name;
            this.item.rawOh = tags.opening_hours;
            this.item.oh = this.liftOh(this.item.rawOh);
            this.item.state = this.getOhState(this.item.rawOh);
            this.itemList.push(this.item);
            this.saveItemList();
        },
        deleteItem(id) {
            const index = this.findIndex(id);
            this.itemList.splice(index, 1); // Remove this item
            this.saveItemList();
        },
        saveItemList() {
            let parsed = JSON.stringify(this.itemList);
            localStorage.setItem(lsn, parsed);
        },
        fetchData(query) {
            this.info = "Recherche d'informations en cours...";
            this.fetchOngoing = true;
            this.fetchFailed = false;
            
            fetch('https://overpass-api.de/api/interpreter',{method: "POST",body: "data=" + encodeURIComponent(query),})
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`${response.status} ${response.statusText}`);
                    }
                    return response.json()
                })
                .then(data => {
                    this.info = "";
                    this.fetchOngoing = false;
                    const tags = data.elements[0].tags;
                    tags.opening_hours ? this.updateItem(tags) : this.info = "Cet établissement n'a pas d'horaires, la requête ne peut pas aboutir.";                    
                })
                .catch(error => {
                    this.fetchFailed = true;
                    this.info = `Aïe quelque chose s'est mal passé. ${error}`;
                });
        },
        // utils
        verifyInput(input) {
            let str = input.toString().trim();
            let regex = /^https:\/\/www.openstreetmap.org\/(node|way)\/\d+$/;
            return regex.test(str);
        },
        findIndex(itemId) {            
            return this.itemList.findIndex(itemObject => itemObject.id === itemId);
        },
        createOh(str) {            
            return new opening_hours(str, {}, { locale: locale });
        },
        liftOh(str) {   
            return this.createOh(str).prettifyValue({ conf: { locale: locale } });
        },
        getOhState(str) { 
            return this.createOh(str).getState();
        },
        createNewLine(str) {
            return str.split("; ").join("<br>").split(",").join(", ");
        }
    }
})

app.mount('#app');