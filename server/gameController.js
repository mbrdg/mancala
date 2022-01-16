const crypto = require('crypto');

module.exports = class GameController {
    constructor() {
        this.games = [];
        this.waitList = [];
    }

    join(info) {
        let {group, nick, size, initial} = info;

        if (group===undefined || size===undefined || initial===undefined) {
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
                this.createGame(index, nick);
                return {game: val.hash};
            }
        }
        
        const gameHash = crypto
            .createHash('md5')
            .update(JSON.stringify({size, initial, time: Date.now()}))
            .digest('hex');

        this.waitList.push({nick, group, size, initial, hash: gameHash});
        return {game: gameHash};
    }

    createGame(index, player2) {
        const {nick, size, initial, hash, response} = this.waitList.splice(index, 1)[0];

        let game = {
            board: {
                sides: {
                    [nick]: { pits: Array(size).fill(parseInt(initial)), store: 0},
                    [player2]: { pits: Array(size).fill(parseInt(initial)), store: 0}
                },
                turn: nick,
            },
            stores: {[nick]:0, [player2]:0}
        }

        this.games.push({hash, game, [nick]: response, [player2]:null, p1: nick, p2: null});
    }

    update(info, response, callback) {
        const {nick, game} = info;

        if (nick===undefined || game===undefined) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        const getResponse = (obj, props)=>{
            const objProps = Object.getOwnPropertyNames(obj);

            for (const property of objProps) {
                if (props.includes(property)) {
                    continue;
                }
                else {
                    return obj[property];
                }
            }
        }

        for (const val of this.waitList) {
            if (nick === val.nick && game === val.hash){
                val.response = response;
                val.timeout = setTimeout(() => {
                    const index = this.waitList.findIndex((obj)=> obj.hash === game);
                    if (index !== -1) {
                        const res = this.waitList[index].response; 
                        callback([res], {first: true , message: {winner: null}});
                        this.waitList.splice(index, 1);
                    }
                }, 120e3);
                return;
            }
        }

        for (const val of this.games) {
            if (val[nick] === null && game === val.hash){
                clearTimeout(val.timeout);
                val[nick] = response;
                val.p2 = nick;

                const res1 = val[val.p1];
                const res2 = val[val.p2];
                callback([res1, res2], {first: true , message: val.game});

                val.timeout = setTimeout(() => {
                    const result = this.findWinner(val.p1, val.p2, val.game.board.turn);
                    callback([res1, res2], {message: result});
                    //Update rankings
                }, 120e3);
                return;
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }

    notify(info, callback) {
        let {nick, game, move} = info;
        
        if (game===undefined || move===undefined) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }
        
        for (let val of this.games) {
            if (val.hash === game) {
                if (!this.validMove(val.game, move, nick)){
                    throw {message: {error: "Invalid move."}, status: 400};
                }
                
                if(val.game.board.turn === nick) {
                    let result = this.playMove(val.game, move, nick, val.p1, val.p2);

                    if (result.error !== undefined){
                        throw {message: {error: result.error}, status: 400};
                    }

                    this.updateGame(val.game, result, val.p1, val.p2);
                    
                    clearTimeout(val.timeout);

                    const res1 = val[val.p1];
                    const res2 = val[val.p2];
                    callback([res1, res2], val.game);

                    if (result.winner !== undefined){
                        return;
                    }

                    val.timeout = setTimeout(() => {
                        const result = this.findWinner(val.p1, val.p2, val.game.board.turn);
                        callback([res1, res2], result);
                        //Update rankings
                    }, 120e3);
                    return;
                } else {
                    throw {message: {error: "Not your turn to play."}, status: 400};
                }
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }

    validMove(game, move, nick){
        const size = game.board.sides[nick].pits.length;
        return !(move < 0 || move >= size);
    }

    playMove(game, move, currentPlayer, p1, p2) {
        const size = game.board.sides[p1].pits.length;
        const initialMove = move;
        move = p1 === currentPlayer ? move : move + size + 1;

        let board = Array.prototype.concat(game.board.sides[p1].pits, [game.board.sides[p1].store], game.board.sides[p2].pits, [game.board.sides[p2].store]);

        if (!board[move]){
            return {error: 'Invalid empty pit.'};
        }

        let player1Turn = (currentPlayer === p1);
        let i = move;
        let seeds = board[move];
        board[move] = 0;

        const inEnemyDeposit = index =>
            (player1Turn && (index === (board.length - 1))) || 
            (!player1Turn && (index === size));
        
        const between = (min, target, max) => min <= target && target < max;

        while (seeds > 0) {
            i = (i + 1) % board.length;

            if (inEnemyDeposit(i))
                i = (i + 1) % board.length;

            board[i]++;
            seeds--;
        }

        const lastHole = i;
        const isLastHoleEmpty = (board[lastHole] === 1);

        const repeatTurn = 
            (player1Turn && (lastHole === size)) ||
            (!player1Turn && ( lastHole === board.length - 1));

        const endedInItsOwnHoles =
            (player1Turn && between(0, i, size)) ||
            (!player1Turn && between(size + 1, i, board.length - 1));
        
        if (endedInItsOwnHoles && isLastHoleEmpty)
            this.executeSteal(board, lastHole, player1Turn, size);
        
        let turn = currentPlayer;
        if (!repeatTurn){
            turn = player1Turn ? p2 : p1;
        }
        player1Turn = turn === p1;

        let seeds1 = board.slice(0, size);
        let seeds2 = board.slice(size + 1, board.length - 1);
        let store1 = board[size];
        let store2 = board[board.length - 1];

        if (this.isOver(seeds1, seeds2, player1Turn)) {
            this.collectAllRemainingSeeds(seeds1, seeds2, store1, store2);
            if (store1 > store2) game.winner = p1;
            else if (store1 < store2) game.winner = p2;
            else game.winner = "draw";
        }

        return {seeds1, seeds2, store1, store2, turn, move: initialMove};
    }

    executeSteal(board, lastHole, isPlayer1Turn, size) {
        let enemyHole = 2 * size - lastHole;
        if (board[enemyHole] === 0)
            return;     // There aren't seeds to be stolen, skip it.

        let deposit = isPlayer1Turn ? size : board.length - 1;

        let stolenSeeds = board[enemyHole] + board[lastHole];
        board[deposit] += stolenSeeds;
        board[enemyHole] = 0;
        board[lastHole] = 0;
    }

    isOver(p1Seeds, p2Seeds, player1Turn){
        const p1GotNoSeeds = p1Seeds.every(item => item === 0);
        const p2GotNoSeeds = p2Seeds.every(item => item === 0);

        return ( p1GotNoSeeds && player1Turn )  || ( p2GotNoSeeds && !player1Turn );
    }

    collectAllRemainingSeeds(p1Seeds, p2Seeds, store1, store2) {
        store1 += p1Seeds.reduce((h , a) => h + a, 0);
        store2 += p2Seeds.reduce((h, a) => h + a, 0);

        p1Seeds.fill(0);
        p2Seeds.fill(0);
    }

    updateGame(game, newValues, p1, p2){
        game.board.sides[p1].pits = newValues.seeds1;
        game.board.sides[p1].store = newValues.store1;
        game.board.sides[p2].pits = newValues.seeds2;
        game.board.sides[p2].store = newValues.store2;
        game.pit = newValues.move;
        game.stores[p1] = newValues.store1;
        game.stores[p2] = newValues.store2;
        game.board.turn = newValues.turn;
    }

    findWinner(p1, p2, loser){
        const winner = loser === p1 ? p2 : p1;
        return {winner};
    }
}