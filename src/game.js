import Gameboard from './gameboard.js'

export default class Game {
    // The purpose of this class is to be a controller for a gameboard
    constructor() {}

    setupGameConfig() {
        this.board = new Gameboard();
        console.debug("Game Configured");
    }

    startGame() {
        console.debug('Game Starting');
    }
}
