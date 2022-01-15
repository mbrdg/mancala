const crypto = require('crypto');

module.exports = class GameController {
    constructor() {
        this.games = [];
        this.waitList = [];
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

        for (const [index, val] of this.waitList.entries()) {
            if (val.nick === nick){
                throw {message: {error: "User waiting for another game to start."}, status: 400};
            }
            if (val.group === group && val.size === size && val.initial === initial) { //Found game with equal settings
                clearTimeout(val.timeout);
                this.createGame(index, nick);
                return {game: val.hash};
            }
        }
        
        const gameHash = crypto
            .createHash('md5')
            .update(JSON.stringify({size, initial, time: Date.now()}))
            .digest('hex');

        const timeout = setTimeout(() => {
            const index = this.waitList.findIndex((obj)=> obj.hash === gameHash);
            if (index !== -1) {
                this.waitList.splice(index, 1);
            }
        }, 120e3);

        this.waitList.push({nick, group, size, initial, hash: gameHash, timeout});
        return {game: gameHash};
    }

    createGame(index, player2) {
        const {nick, size, initial, hash} = this.waitList.splice(index, 1)[0];

        const playerHoles = { pits: Array(size).fill(parseInt(initial)), store: 0};
        const game = {
            board: {
                sides: {
                    [nick]: playerHoles,
                    [player2]: playerHoles
                },
                turn: nick,
            },
            stores: {[nick]:0, [player2]:0}
        }

        this.games.push({hash, game, [nick]: null, [player2]:null});
    }

    update(info) {
        let {nick, game} = info;

        if (!nick || !game) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }


    }
}