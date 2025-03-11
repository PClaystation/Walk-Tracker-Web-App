export class LocalStorageHandler {
    constructor() {}

    saveWalkToLocalStorage(walk) {
        let send = JSON.parse(localStorage.getItem('walks')) || [];
        send.push(walk);
        localStorage.setItem('walks', JSON.stringify(send));
    }

    removeWalkFromLocalStorage(walk) {
        let walks = JSON.parse(localStorage.getItem('walks')) || [];
        walks = walks.filter(obj => obj.id !== walk.id);
        localStorage.setItem('walks', JSON.stringify(walks));
    }

    retrieveWalksFromLocalStorage() {
        const walks = JSON.parse(localStorage.getItem('walks'));

        if (JSON.parse(localStorage.getItem('walks')) !== null) {
            return walks;
        }
        else {
            return [];
        }
    }

    clearLocalStorage() {
        localStorage.setItem('walks', JSON.stringify([]));
    }
}