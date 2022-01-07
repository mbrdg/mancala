export default class ServerApi {
    constructor(url) {
        this.url = url;
    }

    async register(nick, password) {
        const data = {
            nick, password
        }
        
        try {
            const res = await fetch(`${this.url}register`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-type": "application/json" }
            });
            const json = await res.json();
            if (json.error)
                throw json.error;

            console.debug("Register successful");

            this.credentials = data;
            return nick;
        } catch (err) {
            return err;
        }
    }

    async join(settings) {
        const data = {
            group: 11,
            nick: this.credentials.nick,
            password: this.credentials.password,
            size: settings.numberOfHoles,
            initial: settings.seedsPerHole,
        }
        
        try {
            const res = await fetch(`${this.url}join`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-type": "application/json" }
            });
            const json = await res.json();
            if (json.error)
                throw json.error;

            console.debug("Join successful ", json.game);

            this.gameReference = json.game;

            this.update();
            return;
        } catch (err) {
            return;
        }
    }

    async update() {
        const data = {
            nick: this.credentials.nick,
            game: this.gameReference
        }

        const eventSource = new EventSource(`${this.url}update?`+ new URLSearchParams(data));
        
        eventSource.onopen = (e) => {
            document.querySelector('#play .wait-menu').classList.remove('active');
        }
        eventSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("message",JSON.parse(e.data));

            if (data.winner !== undefined){
                console.debug("Closed event source");
                eventSource.close();
            }
        }
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
        
        try {
            const res = await fetch(`${this.url}leave`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-type": "application/json" }
            });
            const json = await res.json();
            if (json.error)
                throw json.error;

            console.debug("Leave successful ");

            return true;
        } catch (err) {
            return false;
        }
    }
}