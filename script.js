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
            localStorageSize: 0,    
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

            // Verify state
            for (let i = 0; i < this.itemList.length; i++) {
                let currentItem = this.itemList[i];
                const oh = this.createOh(currentItem.rawOh, currentItem.nominatim);
                currentItem.state = this.getOhState(oh);
            }
            this.saveItemList();
        }, 1000);

        // Calculate localStorageSize        
        const encoder = new TextEncoder(); // Initialize TextEncoder for byte measurement
        const keySize = encoder.encode(lsn).byteLength; // Bytes used by the key
        const valueSize = encoder.encode(localStorage.getItem(lsn)).byteLength; // Bytes used by the value
        const entrySize = keySize + valueSize; // Total bytes for this entry
        const totalKB = entrySize / 1024; // 1 KB = 1024 bytes
        this.localStorageSize = totalKB.toFixed(2);
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
            }
            else {
                this.info = "L'URL ne respecte pas le format attendu."
            }
        },
        updateItem(result) { // result = { tags, coordinates, address }
            const index = this.findIndex(this.item.id);
            
            const item = index > -1 ? this.itemList[index] : this.item;
            
            item.name = result.tags.name;
            item.rawOh = result.tags.opening_hours;
            item.nominatim = {
                lat: result.coordinates.lat,
                lon: result.coordinates.lon,
                address: {
                    country_code: result.address.country_code,
                    state: result.address.state
                }
            };
            
            const oh = this.createOh(item.rawOh, item.nominatim);

            item.oh = this.liftOh(oh);
            item.state = this.getOhState(oh);

            index > -1 ? null : this.itemList.push(item); // update or create item

            this.saveItemList();
        },
        refreshItem(type, id) {
            this.item = { id, type };
            this.fetchQuery = 
                    `[out:json][timeout:30];
                    ${ type }(id:${ id });
                    out;`;
            this.fetchData(this.fetchQuery);
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

            const result = {};

            fetch('https://overpass-api.de/api/interpreter',{method: "POST",body: "data=" + encodeURIComponent(query),})
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`${response.status} ${response.statusText}`);
                    }
                    return response.json()
                })
                .then(data => {
                    const res = data.elements[0];

                    result.tags = res.tags; // Object having name and opening_hours
                    
                    return res.type === 'node' ?
                        result.coordinates = { lat: res.lat, lon: res.lon} :
                        
                        fetch('https://overpass-api.de/api/interpreter',{method: "POST",body: "data=" + encodeURIComponent(`[out:json][timeout:30];node(id:${res.nodes[0]});out;`),})
                        .then(response2 => {
                            if (!response2.ok) {
                                throw new Error(`${response2.status} ${response2.statusText}`);
                            }
                            return response2.json()
                        })
                        .then(data2 => { 
                            const res2 = data2.elements[0];
                            return result.coordinates = { lat: res2.lat, lon: res2.lon}                            
                        }) // coordinates are used to build the nominatim object (parameter to create a "oh" object)
                })
                .then(() => {                           
                    return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${result.coordinates.lat}&lon=${result.coordinates.lon}&format=json&accept-language=${locale}`)
                    .then(response3 => {
                        if (!response3.ok) {
                            throw new Error(`${response3.status} ${response3.statusText}`);
                        }                    
                        return response3.json()
                        })
                        .then(data3 => {
                            this.info = "";
                            this.fetchOngoing = false;
                            this.$refs.form.reset();
                            this.itemUrl = null;

                            result.address = {
                                country_code: data3.address.country_code,
                                state: data3.address.state
                            }
                                
                            result.tags.opening_hours ? this.updateItem(result) : this.info = "Cet établissement n'a pas d'horaires, la requête ne peut pas aboutir.";
                        })
                })
                .catch(error => {
                    this.fetchFailed = true;
                    this.info = `Aïe quelque chose s'est mal passé. ${error}`;
                });
        },
        abandonFetching() {
            this.fetchOngoing = false;       
            this.fetchFailed = false;
            this.fetchQuery = "";
            this.info = "";
            this.itemUrl = null,
            this.$refs.form.reset();
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
        createOh(str, nominatim) {
            return new opening_hours(str, nominatim, { locale: locale });
        },
        liftOh(oh) {
            return oh.prettifyValue({ conf: { locale: locale } });
        },
        getOhState(oh) {            
            return oh.getState();
        },
        createNewLine(str) {
            return str.split("; ").join("<br>").split(",").join(", ");
        }
    }
})

app.mount('#app');