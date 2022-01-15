const crypto = require('crypto');

module.exports = class GameController {
    constructor() {
        this.games = [];
        this.waitList = [];
    }

    join(info) {
        let {group, nick, size, initial} = info;

        if (!group || !size || !initial) {
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
                this.waitList[index].response.end();
                this.waitList.splice(index, 1);
            }
        }, 120e3);

        this.waitList.push({nick, group, size, initial, hash: gameHash, timeout});
        return {game: gameHash};
    }

    createGame(index, player2) {
        const {nick, size, initial, hash, response} = this.waitList.splice(index, 1)[0];

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

        this.games.push({hash, game, [nick]: response, [player2]:null});
    }

    update(info, response, callback) {
        let {nick, game} = info;

        if (!nick || !game) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        const getResponse = (obj, props)=>{
            const objProps = Object.getOwnPropertyNames(obj);

            for (const property of objProps) {
                if (props.includes(property)) {
                    continue;
                }
                else {
                    return obj[p];
                }
            }
        }

        for (const val of this.waitList) {
            if (nick === val.nick && game === val.hash){
                val.response = response;
                console.log(this.waitList);
                return;
            }
        }

        for (const val of this.games) {
            if (val[nick] === null){
                val[nick] = response;
                
                const res1 = getResponse(val, ['game', 'hash', nick]);
                callback([res1, val[nick]], val.game);
                //TODO: set timeout for gameTurn
                return;
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }

    notify(info) {
        let {nick, game, move} = info;

        if (!game || !move) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        for (const game of this.games) {
            if (game.hash === game) {
                if(game.board.turn === nick) {
                    console.log("hello");
                } else {
                    console.log("hello");
                }
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }
}