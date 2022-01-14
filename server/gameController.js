const crypto = require('crypto');

module.exports = class GameController {
    constructor() {
        this.games = [];
        this.waitList = new Map();
    }

    join(info) {
        let {group, nick, password, size, initial} = info;

        if (!group || !nick || !password || !size || !initial) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        const isBetween = (n, a, b) => {
            return (n - a) * (n - b) <= 0
         }
        if (!isBetween(size, 2, 9) ||!isBetween(initial, 2, 9)) {
            throw {message: {error: "Invalid size/initial values."}, status: 400};
        }

        const gameIdentifier = crypto
            .createHash('md5')
            .update(JSON.stringify({group, size, initial}))
            .digest('hex');
        console.log(gameIdentifier);
        console.log(this.waitList.get(nick));

        //this.waitList.set(nick, gameIdentifier);
        //set timeout to remove from waitlist
        return "top";
    }
}