export default class ServerApi {
    constructor() {
        this.url = 'http://twserver.alunos.dcc.fc.up.pt:8008/';
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

            console.debug("Sign in successful");
            return nick;
        } catch (err) {
            return err;
        }
    }

    join(data) {
        
        console.log(data);
    }
}