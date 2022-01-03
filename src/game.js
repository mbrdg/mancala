import Gameboard from './gameboard.js'
import Chat from "./chat.js";

/**
 * Enum for representing all the different game states.
 * @type {{PLAYER1: number, PLAYER2: number, DRAW: number, LOSE: number, GIVEUP: number, WIN: number}}
 */
const GameState = {
    'PLAYER1': 1,
    'PLAYER2': 2,
    'GIVEUP': 3,
    'WIN': 4,
    'LOSE': 5,
    'DRAW': 6
};
Object.freeze(GameState);
export { GameState };

/**
 * This is the Game class which purpose is to hold all the logic of
 * all the models aka board and chat.
 */
export default class Game {

    constructor() {
        this.chat = new Chat();
        console.debug('Game object created.');
    }

    /**
     * Sets all the necessary things to start a game
     */
    setup() {
        this.board = new Gameboard(this.loop.bind(this));
        this.state = this.getInitialGameState(this.board.settings);

        this.setupRequiredClickEvents();
    }

    // Helper functions
    isPlayer1Turn = () => this.state === GameState.PLAYER1;
    isPlayer2Turn = () => !this.isPlayer1Turn();

    /**
     * Gets the initial state of the game
     * @param settings An object retrieved from the settings read by Gameboard.readSettings()
     * @returns {number} The initial state of the game
     */
    getInitialGameState(settings) {
        // This is weird, but It's because in Gameboard.updateEventListeners the
        // active will be setup correctly for the first turn.
        return settings.player1Starts ? GameState.PLAYER2 : GameState.PLAYER1;
    }

    /**
     * This function adds an event listener that will end the game immediately
     * if someone gives up.
     */
    setupRequiredClickEvents() {
        const leaveButton = document.getElementById('leave-btn');

        leaveButton.addEventListener('click', () => {
            this.end(true);
            document.getElementById('play').scrollIntoView();
        });

        // This is the reason for the comment in getInitialGameState()
        this.board.updateEventListeners(this.state);
        this.board.updateClassNames(this.state);
    }

    /**
     * Game Loop
     * @returns {void}
     */
    loop(event) {
        if (this.isOver())
            return this.end(false);

        this.board.generateMove(event);

        let repeatTurn = this.executeMove(this.board.mySeeds, this.board.enemySeeds, this.board.move, true);
        this.updateState(repeatTurn);
        this.board.update(this.state, this.loop);
    }

    /**
     * Checks whether the game is over or not.
     * @returns {boolean} True if the game is over, false otherwise
     */
    isOver() {
        const p1GotNoSeeds = this.board.mySeeds.seeds.every(item => item === 0);
        const p2GotNoSeeds = this.board.enemySeeds.seeds.every(item => item === 0);

        console.debug('Result of Game.isOver(): ', p1GotNoSeeds || p2GotNoSeeds);
        return p1GotNoSeeds || p2GotNoSeeds;
    }

    /**
     * Determines the final state of the game.
     * @param giveUp true if the player gave up, false otherwise
     */
    end(giveUp = false) {
        if (giveUp) {
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
        }

        this.showEndMenu(this.state);
        console.debug('Game Ended');
    }

    /**
     * Changes the state after finished a turn
     */
    updateState(samePlayer) {
        if (samePlayer) {
            console.debug('Game.ChangeState() state remains the same');
            return;
        }

        this.state = this.isPlayer1Turn() ? GameState.PLAYER2 : GameState.PLAYER1;
        console.debug('Game.ChangeState() new state:', this.state);
    }

    /**
     * Executes a steal if that's the case
     * @param board Current status of the game board
     * @param lastHole Index of the hole where was placed the last remaining seed
     * @param isPlayer1Turn True if it's the player's 1 turn
     */
    executeSteal(board, lastHole, isPlayer1Turn) {
        let enemyHole = 2 * this.board.settings.numberOfHoles - lastHole;
        if (board[enemyHole] === 0)
            return;

        let deposit = isPlayer1Turn ? board.length - 1 : this.board.settings.numberOfHoles;

        let stolenSeeds = board[enemyHole] + board[lastHole]
        board[deposit] += stolenSeeds;
        board[enemyHole] = 0;
        board[lastHole] = 0;

        this.chat.message("WOW! " + stolenSeeds.toString() + " seed(s) stolen!", !isPlayer1Turn);
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
        if (repeatTurn)
            this.chat.message("I'm playing again!", sender);

        let myDifference = board[this.board.settings.numberOfHoles] - mySeeds.deposit;
        let enemyDifference = board[board.length - 1] - enemySeeds.deposit;
        if (myDifference > 0)
            this.chat.message(myDifference.toString() + " point(s) in the bag.", true);
        if (enemyDifference > 0)
            this.chat.message(enemyDifference.toString() + " point(s) in the bag.", false);
    }

    /**
     * Executes a move
     * @param mySeeds Object containing the information about the player 1 seeds
     * @param enemySeeds Object containing the information about the player 2 seeds
     * @param move Index referring to which hole triggered the move
     * @param verbose true if messages should be displayed
     * @return True if a player gets the turn again, false otherwise
     */
    executeMove(mySeeds, enemySeeds, move, verbose) {
        console.debug('Executing a move');
        let board = Array.prototype.concat(mySeeds.seeds, [mySeeds.deposit], enemySeeds.seeds, [enemySeeds.deposit]);

        if (!board[move])
            return true;

        let i = move;
        let lastHole = (move + board[move]) % board.length;
        let isLastHoleEmpty = board[lastHole] === 0;

        while (board[move] > 0) {
            i = (i + 1) % board.length;
            board[i]++;
            board[move]--;
        }

        let between = (min, target, max) => min <= target && target < max;
        let endedInItsOwnHoles = (this.isPlayer2Turn() && between(0, i, this.board.settings.numberOfHoles)) ||
            (this.isPlayer1Turn() && between(this.board.settings.numberOfHoles + 1, i, board.length - 1));

        if (endedInItsOwnHoles && isLastHoleEmpty)
            this.executeSteal(board, lastHole, this.isPlayer1Turn());

        if (verbose)
            this.messagesFromMove(endedInItsOwnHoles, board, mySeeds, enemySeeds, !this.isPlayer1Turn());

        mySeeds.seeds = board.slice(0, this.board.settings.numberOfHoles);
        mySeeds.deposit = board[this.board.settings.numberOfHoles]
        enemySeeds.seeds = board.slice(this.board.settings.numberOfHoles + 1, board.length - 1);
        enemySeeds.deposit = board[board.length - 1];
        return endedInItsOwnHoles;
    }


    reset() {
        this.chat.clear();
        this.board.reset();
        console.debug('Reset game');
    }

    // FIXME - I believe this is not responsibility of the game class because
    //         here we just control all the other components.
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
        names[0].textContent = this.playerName; //TODO: Change to name of user;
        names[1].textContent = this.board.settings.pvp ? 'Player 2' : 'Bot'; //TODO: Change to name of user;

        endMenu.classList.add('active');
    }
}
