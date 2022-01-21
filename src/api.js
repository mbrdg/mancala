export default class Api {
    /**
     * Constructor
     * @param url - server url 
     */
    constructor(url) {
        this.url = url;
    }

    /**
     * Makes a request to a given server
     * @param data Request parameters as an object
     * @param endpoint Request endpoint
     * @returns {Promise<any>}
     */
    async makeRequest(data, endpoint) {
        const request = await fetch(this.url + endpoint, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-type": "application/json" }
        });

        const json = await request.json();
        if (json.error)
            throw json.error;

        return json;
    }

    /**
     * Api register request
     * @param nick - player nick
     * @param password - player password
     * @returns error or nick on success
     */
    async register(nick, password) {
        const data = {
            nick,
            password
        }

        try {
            await this.makeRequest(data, 'register');
            this.credentials = data;
        } catch (e) {
            console.error('Register unsuccessful', e)
            return e;
        }

        console.log('Register successful');
        return nick;
    }

    /**
     * Api join request
     * @param settings - game settings 
     * @returns true on success, false otherwise
     */
    async join(settings) {
        const data = {
            group:      76,
            nick:       this.credentials.nick,
            password:   this.credentials.password,
            size:       settings.numberOfHoles,
            initial:    settings.seedsPerHole,
        }

        try {
            const response = await this.makeRequest(data, 'join');
            this.gameReference = response.game;
        } catch (e) {
            console.error('Join unsuccessful', e);
            return false;
        }

        console.log('Join successful');
        return true;
    }

    /**
     * Api update request
     * @param handler - eventSource handler in case of message received
     */
    update(handler) {
        const data = {
            nick: this.credentials.nick,
            game: this.gameReference
        }

        const eventSource = new EventSource(`${this.url}update?`+ new URLSearchParams(data));
        
        eventSource.onopen = (_) => {
            document.querySelector('#play .wait-menu').classList.remove('active');
        };

        eventSource.onmessage = (e) => {
            handler(e, eventSource);
        };

        eventSource.onerror = (e) => {
            console.error(e);
            eventSource.close();
        };
    }

    /**
     * Api leave request
     * @returns true on success, false otherwise
     */
    async leave() {
        const data = {
            nick: this.credentials.nick,
            password: this.credentials.password,
            game: this.gameReference,
        }

        try {
            await this.makeRequest(data, 'leave');
        } catch (e) {
            console.error('Leave unsuccessful', e);
            return false;
        }

        console.log('Leave successful');
        return true;
    }

    /**
     * Api notify request
     * @param move - pit index to be notified
     * @returns true on success, false otherwise
     */
    async notify(move) {
        const data = {
            nick: this.credentials.nick,
            password: this.credentials.password,
            game: this.gameReference,
            move
        }

        try {
            await this.makeRequest(data, 'notify');
        } catch (e) {
            console.error('Notify unsuccessful', e);
            return false;
        }

        console.log('Notify successful');
        return true;
    }

    /**
     * Api ranking request
     * @returns rankings on success, nothing on error
     */
    async ranking() {
        let response;
        try {
            response = await this.makeRequest({}, 'ranking');
        } catch (e) {
            console.error('Ranking unsuccessful', e);
            return;
        }

        console.log('Ranking successful');
        return response.ranking;
    }
}