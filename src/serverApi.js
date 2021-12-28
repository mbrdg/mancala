export default class ServerApi {
    constructor() {
        this.url = 'http://twserver.alunos.dcc.fc.up.pt:8008/';
    }

    register(nick, pass) {
        const data = {
            nick: nick,
            password: pass
        }
        
        return fetch(`${this.url}register`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-type": "application/json"}
        })
        .then((res) => {
            return res.json();
        })
        .then(json => { // handle response normally
            if(json.error) throw json.error;

            console.log("sign in successful");
            return nick;
        })
        .catch(err => { // handle errors
            return err;
        });
    }
}