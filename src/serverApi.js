export default class ServerApi {
    constructor(url) {
        this.url = url;
    }

    async register(nick, password) {
        const data = {
            nick, password
        }

        const res = await fetch(`${this.url}register`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-type": "application/json" }
        });
        const json = await res.json();
        if (json.error)
            return json.error;

        console.debug("Register successful");

        this.credentials = data;
        return nick;
    }

    async join(settings) {
        const data = {
            group: 11,
            nick: this.credentials.nick,
            password: this.credentials.password,
            size: settings.numberOfHoles,
            initial: settings.seedsPerHole,
        }

        const res = await fetch(`${this.url}join`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-type": "application/json" }
        });
        const json = await res.json();
        if (json.error)
            return false;

        this.gameReference = json.game;
        console.log("Join successful");

        return true;
    }

    update(handler) {
        const data = {
            nick: this.credentials.nick,
            game: this.gameReference
        }

        const eventSource = new EventSource(`${this.url}update?`+ new URLSearchParams(data));
        
        eventSource.onopen = (e) => {
            document.querySelector('#play .wait-menu').classList.remove('active');
        }
        eventSource.onmessage = (event) => { handler(event, eventSource); }; 
        eventSource.onerror = (e) => {
            console.log("error", e);
            eventSource.close();
        }
    }

    async leave() {
        const data = {
            nick: this.credentials.nick,
            password: this.credentials.password,
            game: this.gameReference,
        }

        const res = await fetch(`${this.url}leave`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-type": "application/json" }
        });
        const json = await res.json();
        if (json.error)
            return false;

        console.debug("Leave successful");

        return true;
    }

    async notify(move) {
        const data = {
            nick: this.credentials.nick,
            password: this.credentials.password,
            game: this.gameReference,
            move
        }

        const res = await fetch(`${this.url}notify`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-type": "application/json" }
        });
        const json = await res.json();
        if (json.error)
            return false;

        console.debug("Notify successful");

        return true;
    }
}