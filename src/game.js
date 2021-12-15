export default class Game {
    constructor() {
        this.settings = {}
    };

    setupGameConfig() {
        this.settings.startTurn = document.getElementById('f-turn').checked;
        this.settings.numberOfHoles = parseInt(document.getElementById('n-holes').innerHTML);
        this.settings.numberOfSeedsPerHole = parseInt(document.getElementById('n-seeds').innerHTML);

        console.log(this.settings);
        this.buildBoard();
        console.debug("Game Configured");
    }

    buildBoard() {
        let gameboard = document.querySelector('#play .game .gameboard');
        console.log(gameboard);

        console.debug('Board built');
    }

    startGame() {
        console.debug("Game Starting");
    }
}
