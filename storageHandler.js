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
        return JSON.parse(localStorage.getItem('walks'));
    }

    clearLocalStorage() {
        localStorage.setItem('walks', JSON.stringify([]));
    }
}