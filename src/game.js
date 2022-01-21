import Gameboard from './gameboard.js'
import Chat from "./chat.js";
import AI from "./minimax.js";

/**
 * Enum for representing all the different game states.
 * @type {{PLAYER1: number, PLAYER2: number, DRAW: number, LOSE: number, GIVEUP: number, WIN: number}}
 */
const GameState = {
    'PLAYER1':  0,
    'PLAYER2':  1,
    'BOT':      2,
    'GIVEUP':   3,
    'WIN':      4,
    'LOSE':     5,
    'DRAW':     6
};
Object.freeze(GameState);
export { GameState };

/**
 * This is the Game class which purpose is to hold all the logic of
 * all the models aka board and chat.
 */
export default class Game {
    /**
     * Constructor
     * @param api - server api reference
     * @param highScores - game highscores reference
     */
    constructor(api, highScores) {
        this.chat = new Chat();
        this.api = api;
        this.highScores = highScores;

        const leaveButton = document.getElementById('leave-btn');
        leaveButton.addEventListener('click', ()=>{
            if (this.board.settings.online) {
                this.api.leave().then();
                return;
            }

            this.end(true).then();
            document.getElementById('play').scrollIntoView();
        });
    }

    /**
     * Sets all the necessary things to start a game
     */
    setup() {
        this.board = new Gameboard(this.loop.bind(this));
        this.state = this.getInitialGameState(this.board.settings);

        this.setupRequiredClickEvents();

        if (!this.board.settings.pvp) {
            let depth = this.board.settings.difficulty === 'easy' ? 2 : 6;
            this.ai = new AI(this, depth);

            if (this.isPlayer2Turn())
                this.bot().then(() => {});
        }
    }

    // Helper functions
    isPlayer1Turn = () => this.state === GameState.PLAYER1;
    isPlayer2Turn = () => !this.isPlayer1Turn();
    between = (min, target, max) => min <= target && target < max;

    /**
     * Gets the initial state of the game
     * @param settings An object retrieved from the settings read by Gameboard.readSettings()
     * @returns {number} The initial state of the game
     */
    getInitialGameState(settings) {
        return (settings.player1Starts || settings.online) ? GameState.PLAYER1 : GameState.PLAYER2;
    }

    /**
     * This function adds an event listener that will end the game immediately
     * if someone gives up.
     */
    setupRequiredClickEvents() {
        this.board.updateEventListeners(this.state);
        this.board.updateClassNames(this.state);
    }

    /**
     * Game Loop
     * @returns {void}
     */
    async loop(event) {
        this.board.generateMove(event);

        if (this.board.settings.online) {
            this.api.notify(this.board.move);
            return;
        }

        const repeatTurn = this.executeMove(this.board.mySeeds, this.board.enemySeeds, this.board.move, this.isPlayer1Turn(),true);
        this.updateState(repeatTurn);
        this.board.update(this.state);

        if (!repeatTurn && this.ai !== undefined)
            await this.bot();

        if (this.isOver(this.board.mySeeds, this.board.enemySeeds, this.isPlayer1Turn())) {
            this.collectAllRemainingSeeds(this.board.mySeeds, this.board.enemySeeds);
            return this.end(false);
        }
    }

    /**
     * Executes bot move
     */
    async bot() {
        let aiRepeatTurn;
        do {
            let aiMove = this.ai.findMove(this.board.enemySeeds, this.board.mySeeds);
            if (aiMove === -1) break;
            await this.sleep(500);
            aiRepeatTurn = this.executeMove(this.board.mySeeds, this.board.enemySeeds, aiMove, this.isPlayer1Turn(),true);
            this.updateState(aiRepeatTurn);
            this.board.update(this.state);
        } while (aiRepeatTurn);
    }

    /**
     * Collects all the seeds remaining in player's holes when the game is over
     * @param mySeeds Object containing the information about the player 1 seeds
     * @param enemySeeds Object containing the information about the player 2 seeds
     */
    collectAllRemainingSeeds(mySeeds, enemySeeds) {
        mySeeds.deposit += mySeeds.seeds.reduce((h , a) => h + a, 0);
        enemySeeds.deposit += enemySeeds.seeds.reduce((h, a) => h + a, 0);

        mySeeds.seeds.fill(0);
        enemySeeds.seeds.fill(0);
        this.board.updateElements();
    }

    /**
     * Checks whether the game is over or not.
     * @param mySeeds Object containing the information about the player 1 seeds
     * @param enemySeeds Object containing the information about the player 2 seeds
     * @param player1Turn Boolean indicating if it is player1 turn or not
     * @returns {boolean} True if the game is over, false otherwise
     */
    isOver(mySeeds, enemySeeds, player1Turn) {
        const p1GotNoSeeds = mySeeds.seeds.every(item => item === 0);
        const p2GotNoSeeds = enemySeeds.seeds.every(item => item === 0);

        return ( p1GotNoSeeds && player1Turn )  || ( p2GotNoSeeds && !player1Turn );
    }

    /**
     * Determines the final state of the game.
     * @param giveUp true if the player gave up, false otherwise
     */
    async end(giveUp = false) {
        if (giveUp) {
            this.chat.message("I give up :(", this.isPlayer1Turn());
            await this.sleep(1000);
            this.state = this.isPlayer1Turn() ? GameState.LOSE : GameState.WIN;
        } else {
            const p1Score = this.board.mySeeds.deposit;
            const p2Score = this.board.enemySeeds.deposit;

            if (p1Score === p2Score)
                this.state = GameState.DRAW;
            else if (p1Score > p2Score)
                this.state = GameState.WIN;
            else
                this.state = GameState.LOSE;
            
            if (this.state===GameState.WIN && !this.board.settings.online) {
                const score = {
                    nick: this.api.credentials ? this.api.credentials.nick : 'Player 1',
                    points: this.board.mySeeds.deposit,
                    opponent: this.board.settings.pvp ? 'Player 2' : 'Bot'
                }

                this.highScores.insertScore(score);
            }
        }

        console.log('Game End');
        if (this.board.settings.online) 
            this.highScores.updateOnline();
        this.showEndMenu(this.state);
    }

    /**
     * Changes the state after finished a turn
     */
    updateState(samePlayer) {
        if (samePlayer) {
            console.info('The same players takes the turn again.');
            return;
        }

        this.state = this.isPlayer1Turn() ? GameState.PLAYER2 : GameState.PLAYER1;
    }

    /**
     * Executes a steal if that's the case
     * @param board Current status of the game board
     * @param lastHole Index of the hole where was placed the last remaining seed
     * @param isPlayer1Turn True if it's the player's 1 turn
     * @param verbose True if messages should be displayed
     */
    executeSteal(board, lastHole, isPlayer1Turn, verbose) {
        let enemyHole = 2 * this.board.settings.numberOfHoles - lastHole;
        if (board[enemyHole] === 0)
            return;     // There aren't seeds to be stolen, skip it.

        let deposit = isPlayer1Turn ? this.board.settings.numberOfHoles : board.length - 1;

        let stolenSeeds = board[enemyHole] + board[lastHole];
        board[deposit] += stolenSeeds;
        board[enemyHole] = 0;
        board[lastHole] = 0;

        if (verbose){
            const text = stolenSeeds === 1 ? "WOW! " + stolenSeeds.toString() + " seed stolen!" : "WOW! " + stolenSeeds.toString() + " seeds stolen!";
            this.chat.message(text, isPlayer1Turn);
        }
    }

    /**
     * Logs all the events in a move to the chat
     * @param repeatTurn True whether the same player will play again or not
     * @param board current board array
     * @param mySeeds Object containing the information about the player 1 seeds
     * @param enemySeeds Object containing the information about the player 2 seeds
     * @param sender True if Player 1 is sending the message, false otherwise
     */
    messagesFromMove(repeatTurn, board, mySeeds, enemySeeds, sender) {

        let myDifference = board[this.board.settings.numberOfHoles] - mySeeds.deposit;
        let enemyDifference = board[board.length - 1] - enemySeeds.deposit;
        const text = myDifference === 1 ? myDifference.toString() + " point in the bag." : myDifference.toString() + " points in the bag.";
        if (myDifference > 0){
            const text = myDifference === 1 ? myDifference.toString() + " point in the bag." : myDifference.toString() + " points in the bag.";
            this.chat.message(text, true);
        }
        if (enemyDifference > 0){
            const text = enemyDifference === 1 ? enemyDifference.toString() + " point in the bag." : enemyDifference.toString() + " points in the bag.";
            this.chat.message(text, false);
        }

        if (repeatTurn)
            this.chat.message("I'm playing again!", sender);
    }

    /**
     * Executes a move
     * @param mySeeds Object containing the information about the player 1 seeds
     * @param enemySeeds Object containing the information about the player 2 seeds
     * @param move Index referring to which hole triggered the move
     * @param player1Turn Boolean referring if it is player 1 turn
     * @param verbose true if messages should be displayed
     * @return True if a player gets the turn again, false otherwise
     */
    executeMove(mySeeds, enemySeeds, move, player1Turn, verbose = false) {
        let board = Array.prototype.concat(mySeeds.seeds, [mySeeds.deposit], enemySeeds.seeds, [enemySeeds.deposit]);
        if (!board[move])
            return true; // There aren't seeds in the clicked hole, skip it.

        let i = move;
        let seeds = board[move];
        board[move] = 0;

        const inEnemyDeposit = index =>
            (player1Turn && (index === board.length - 1)) || 
            (!player1Turn && (index === this.board.settings.numberOfHoles));

        while (seeds > 0) {
            i = (i + 1) % board.length;

            if (inEnemyDeposit(i))
                i = (i + 1) % board.length;

            board[i]++;
            seeds--;
        }

        const lastHole = i;
        const isLastHoleEmpty = board[lastHole] === 1;

        const repeatTurn = 
            (player1Turn && (lastHole === this.board.settings.numberOfHoles)) ||
            (!player1Turn && ( lastHole === board.length - 1));

        const endedInItsOwnHoles =
            (player1Turn && this.between(0, i, this.board.settings.numberOfHoles)) ||
            (!player1Turn && this.between(this.board.settings.numberOfHoles + 1, i, board.length - 1));

        if (endedInItsOwnHoles && isLastHoleEmpty)
            this.executeSteal(board, lastHole, player1Turn, verbose);

        if (verbose)
            this.messagesFromMove(repeatTurn, board, mySeeds, enemySeeds, player1Turn);

        mySeeds.seeds = board.slice(0, this.board.settings.numberOfHoles);
        mySeeds.deposit = board[this.board.settings.numberOfHoles]
        enemySeeds.seeds = board.slice(this.board.settings.numberOfHoles + 1, board.length - 1);
        enemySeeds.deposit = board[board.length - 1];

        return repeatTurn;
    }

    /**
     * Resets the board and chat elements, called whenever
     * the game is ended.
     */
    reset() {
        this.chat.clear();
        this.board.reset();
        this.ai = undefined;
        if(this.countdown)
            clearInterval(this.countdown);
        document.getElementById('timer').classList.remove('active');

        console.log('Game Reset');
    }

    /**
     * Displays the final menu according to game result
     * @param newState - final game state before reset 
     */
    showEndMenu(newState) {
        const endMenu = document.querySelector('#play .end-menu');

        switch (newState) {
            case GameState.WIN:{
                endMenu.querySelector('.banner h1').textContent = 'VICTORY';
                const leftImg = document.getElementById('leftEndIcon');
                leftImg.style.visibility = 'visible';
                const rightImg = document.getElementById('rightEndIcon');
                rightImg.style.visibility = 'hidden';

                const firstDiv = endMenu.querySelector(".information .final-scores div:first-of-type");
                firstDiv.style.width = '55%';
                const sndDiv = endMenu.querySelector(".information .final-scores div:nth-of-type(2)");
                sndDiv.style.width = '45%';

                break;
            }
            case GameState.LOSE:{
                endMenu.querySelector('.banner h1').textContent = 'DEFEAT';
                const leftImg = document.getElementById('leftEndIcon');
                leftImg.style.visibility = 'hidden';
                const rightImg = document.getElementById('rightEndIcon');
                rightImg.style.visibility = 'visible';

                const firstDiv = endMenu.querySelector(".information .final-scores div:first-of-type");
                firstDiv.style.width = '45%';
                const sndDiv = endMenu.querySelector(".information .final-scores div:nth-of-type(2)");
                sndDiv.style.width = '55%';

                break;
            }
            case GameState.DRAW:{
                endMenu.querySelector('.banner h1').textContent = 'DRAW';
                const imgs = endMenu.querySelectorAll('.banner img');
                for (const img of imgs) {
                    img.style.visibility = 'visible';
                }

                const firstDiv = endMenu.querySelector(".information .final-scores div:first-of-type");
                firstDiv.style.width = '50%';
                const sndDiv = endMenu.querySelector(".information .final-scores div:nth-of-type(2)");
                sndDiv.style.width = '50%';
                break;
            }
            default :
                break;
        }

        const scores = endMenu.querySelectorAll('.information .final-scores .player-score');
        scores[0].textContent = document.querySelector('#play .game .my-deposit .score').textContent;
        scores[1].textContent = document.querySelector('#play .game .enemy-deposit .score').textContent;

        const names = endMenu.querySelectorAll('.information .final-scores .player-name');
        names[0].textContent = this.board.settings.online ? this.api.credentials.nick : 'Player 1';
        const opponentName = this.board.settings.online ? this.api.opponent : 'Player 2';
        names[1].textContent = this.board.settings.pvp ? opponentName : 'Bot';

        endMenu.classList.add('active');
    }

    /**
     * Handler for join between 2 players in multiplayer mode
     * @param event - occured event
     * @param eventSource - eventSource which receives the events
     */
    joinHandler(event, eventSource) {
        const data = JSON.parse(event.data);

        if (data.winner !== undefined) {
            console.debug("Left wait menu");
            document.getElementById('wait-btn').click();
            eventSource.close();
            return;
        }

        for (let playerName in data.stores) {
            if (playerName !== this.api.credentials.nick) this.api.opponent = playerName;
        }

        if (data.board.turn === this.api.opponent) { 
            this.state = GameState.PLAYER2;
            this.board.update(this.state);
        }

        this.startTimer();
        eventSource.onmessage = (event) => { this.updateHandler(event, eventSource); };
    }

    /**
     * Handler for game events sent from the server api
     * @param event - occured event
     * @param eventSource - eventSource which receives the events
     */
    updateHandler(event, eventSource) {
        const data = JSON.parse(event.data);

        if (data.winner !== undefined && !data.board) { // Someone gave up
            this.state =  data.winner === this.api.credentials.nick ? GameState.PLAYER2 : GameState.PLAYER1;
            this.end(true).then();
            eventSource.close();
            return;
        }

        const move = this.isPlayer1Turn() ? data.pit : data.pit + this.board.settings.numberOfHoles + 1;
        this.playMove(move, eventSource);
    }

    /**
     * Executes move from multiplayer mode
     * @param move - hole index to play
     * @param eventSource - eventSource which receives the events
     */
    playMove(move, eventSource) {
        this.resetTimer();

        const repeatTurn = this.executeMove(this.board.mySeeds, this.board.enemySeeds, move, this.isPlayer1Turn(), true);
        this.updateState(repeatTurn);
        this.board.update(this.state);

        if (this.isOver(this.board.mySeeds, this.board.enemySeeds, this.isPlayer1Turn())) {
            this.collectAllRemainingSeeds(this.board.mySeeds, this.board.enemySeeds);
            eventSource.close();
            return this.end(false);
        }
    }

    /**
     * Starts countdown timer for multiplayer game mode
     */
    startTimer(){
        document.getElementById('time').textContent='1:59';
        document.getElementById('timer').classList.add('active');
        this.countdown = setInterval(() => {
            const time = document.getElementById('time').textContent;
            let minutes = parseInt(time.slice(0,1));
            let seconds = parseInt(time.slice(2,4));

            const totalSeconds = minutes*60 + seconds-1;
            if(totalSeconds < 0) {
                clearInterval(this.countdown);
                return;
            }
            minutes = Math.floor(totalSeconds/60);
            seconds = totalSeconds-minutes*60 < 10 ? '0'+ (totalSeconds-minutes*60) : totalSeconds-minutes*60;
            
            document.getElementById('time').textContent= `${minutes}:${seconds}`;
        }, 1000);
    }

    /**
     * Resets timer value
     */
    resetTimer() {
        document.getElementById('time').textContent = '1:59';
    }

    /**
     * Function which returns a promise so that the game stops for the number of miliseconds specified
     * @param ms - number of miliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
