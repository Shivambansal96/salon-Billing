// Mock storage system for local development
class StorageMock {
    constructor() {
        this.data = {};
        this.loadFromLocalStorage();
    }


    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('salon_data');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }


    saveToLocalStorage() {
        try {
            localStorage.setItem('salon_data', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }


    async get(key, shared = false) {
        const fullKey = shared ? `shared_${key}` : key;
        if (this.data[fullKey]) {
            return { key: fullKey, value: this.data[fullKey], shared };
        }
        throw new Error('Key not found');
    }


    async set(key, value, shared = false) {
        const fullKey = shared ? `shared_${key}` : key;
        this.data[fullKey] = value;
        this.saveToLocalStorage();
        return { key: fullKey, value, shared };
    }


    async delete(key, shared = false) {
        const fullKey = shared ? `shared_${key}` : key;
        delete this.data[fullKey];
        this.saveToLocalStorage();
        return { key: fullKey, deleted: true, shared };
    }


    async list(prefix = '', shared = false) {
        const prefixToUse = shared ? `shared_${prefix}` : prefix;
        const keys = Object.keys(this.data).filter(k => k.startsWith(prefixToUse));
        return { keys, prefix, shared };
    }
}


// Initialize and attach to window
if (typeof window !== 'undefined') {
    window.storage = new StorageMock();
}


export default StorageMock;