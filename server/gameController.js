const crypto = require('crypto');

module.exports = class GameController {
    /**
     * Constructor
     * @param rankings - game rankings
     */
    constructor(rankings) {
        this.rankings = rankings;
        this.games = [];
        this.waitList = [];
    }

    /**
     * Game join request
     * @param info - data
     * @returns object with game hash
     */
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

    /**
     * Pushes game to games array
     * @param index - waitlist game index
     * @param player2 - new player2
     */
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

    /**
     * Game update request
     * @param info - data
     * @param response - new sse response
     * @param callback - successful update callback
     */
    update(info, response, callback) {
        const {nick, game} = info;

        if (nick===undefined || game===undefined) {
            throw {message: {error: "Invalid body request."}, status: 400};
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

                callback([val[val.p1], response], {first: true , message: val.game});

                val.timeout = setTimeout(() => {
                    const index = this.games.findIndex((obj)=> obj.hash === game);
                    if (index !== -1) {
                        const value = this.games[index];
                        const res1 = value[value.p1];
                        const res2 = value[value.p2];

                        const result = this.findWinner(value.p1, value.p2, value.game.board.turn);
                        callback([res1, res2], {message: result});
                        this.endGame(index, result.winner);
                    }
                }, 120e3);
                return;
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }

    /**
     * Leave from a game request
     * @param info - data
     * @param callback - callback for successful update
     */
    leave(info, callback) {
        const {nick, game} = info;

        if (nick===undefined || game===undefined) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        for (const [i, val] of this.waitList.entries()) {
            if (nick === val.nick && game === val.hash){
                clearTimeout(val.timeout);
                callback([val.response], {first: true , message: {winner: null}});
                this.waitList.splice(i, 1);
                return;
            }
        }

        for (let [i, val] of this.games.entries()) {
            if (val.hash === game) {
                if (!(nick === val.p1 || nick === val.p2)) {
                    throw {message: {error: "Unrecognized nick for game reference."}, status: 400};
                }

                clearTimeout(val.timeout);
                const winner = this.findWinner(val.p1, val.p2, nick);
                callback([val[val.p1], val[val.p2]], {message: winner});
                this.endGame(i, winner.winner);
                return;
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }

    /**
     * Notify game of a new move
     * @param info - data
     * @param callback - callback for successful update
     */
    notify(info, callback) {
        let {nick, game, move} = info;
        
        if (game===undefined || move===undefined) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }
        
        for (let [i, val] of this.games.entries()) {
            if (val.hash === game && (nick === val.p1 || nick === val.p2)) {
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

                    if (val.game.winner !== undefined){
                        this.endGame(i, val.game.winner);
                        return;
                    }

                    val.timeout = setTimeout(() => {
                        const index = this.games.findIndex((obj)=> obj.hash === game);
                        if (index !== -1) {
                            const value = this.games[index];
                            const response1 = value[value.p1];
                            const response2 = value[value.p2];

                            const result = this.findWinner(value.p1, value.p2, value.game.board.turn);
                            callback([response1, response2], result);
                            this.endGame(index, result.winner);
                        }
                    }, 120e3);
                    return;
                } else {
                    throw {message: {error: "Not your turn to play."}, status: 400};
                }
            }
        }

        throw {message: {error: "Invalid game reference."}, status: 400};
    }

    /**
     * Checks if a move is valid or not
     * @param game - game object
     * @param move - move value
     * @param nick - player name
     * @returns true if move is valid false, otherwise
     */
    validMove(game, move, nick){
        const size = game.board.sides[nick].pits.length;
        return !(move < 0 || move >= size);
    }

    /**
     * Executes a move in game
     * @param game - game object
     * @param move - move index
     * @param currentPlayer - current player name  
     * @param p1 - player 1
     * @param p2 - player 2
     * @returns error or new board values
     */
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
            const result = this.collectAllRemainingSeeds(seeds1, seeds2, store1, store2);
            store1 = result.store1;
            store2 = result.store2;

            if (store1 > store2) game.winner = p1;
            else if (store1 < store2) game.winner = p2;
            else game.winner = "draw";
        }

        return {seeds1, seeds2, store1, store2, turn, move: initialMove};
    }

    /**
     * Executes a steal
     * @param board - current board
     * @param lastHole - last hole to be added a seed
     * @param isPlayer1Turn - boolean indicating it is player 1 turn
     * @param size - board size
     */
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

    /**
     * Checks if game is over or not
     * @param p1Seeds - player 1 seeds
     * @param p2Seeds - player 2 seeds
     * @param player1Turn - boolean indicating if it is player 1 turn
     * @returns true if game is over, false otherwise
     */
    isOver(p1Seeds, p2Seeds, player1Turn){
        const p1GotNoSeeds = p1Seeds.every(item => item === 0);
        const p2GotNoSeeds = p2Seeds.every(item => item === 0);

        return ( p1GotNoSeeds && player1Turn )  || ( p2GotNoSeeds && !player1Turn );
    }

    /**
     * Collects remainning seeds from player holes to the respective deposits
     * @param p1Seeds - player 1 seeds
     * @param p2Seeds - player 2 seeds
     * @param store1 - player 1 seeds
     * @param store2 - player 2 deposits
     * @returns new store1 and store2 values
     */
    collectAllRemainingSeeds(p1Seeds, p2Seeds, store1, store2) {
        store1 += p1Seeds.reduce((h , a) => h + a, 0);
        store2 += p2Seeds.reduce((h, a) => h + a, 0);
        p1Seeds.fill(0);
        p2Seeds.fill(0);

        return {store1, store2};
    }

    /**
     * Update game values
     * @param {*} game - game to update
     * @param {*} newValues - new values
     * @param {*} p1 - player 1 name
     * @param {*} p2 - player 2 name
     */
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

    /**
     * Returns the winner name
     * @param p1 - player 1 name
     * @param p2 - player 2 name
     * @param loser - loser player
     * @returns winner object 
     */
    findWinner(p1, p2, loser){
        const winner = loser === p1 ? p2 : p1;
        return {winner};
    }

    /**
     * Ends game by removing from games and updating scores
     * @param index - game index 
     * @param result - game result
     */
    endGame(index, result){
        console.log("Game ended");
        const val = this.games.splice(index, 1)[0];
        this.rankings.updateRankings(val.p1, val.p2, result);
    }
}