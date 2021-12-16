export default class Gameboard {
    constructor() {
        this.settings = {};

        this.readUserSettings();
        this.buildBoard();
        this.placeSeeds();
    }

    readUserSettings() {
        this.settings.startTurn = document.getElementById('f-turn').checked;
        this.settings.numberOfHoles = document.getElementById('n-holes').innerHTML;
        this.settings.numberOfSeedsPerHole = parseInt(document.getElementById('n-seeds').innerHTML);
        Object.seal(this.settings);
    }

    buildBoard() {
        let gameboard = document.querySelector('#play .game .gameboard');
        gameboard.style.gridTemplateColumns = '1fr repeat(' + this.settings.numberOfHoles + ', 0.75fr) 1fr';

        let myHole = document.createElement('div'); myHole.className = 'my-hole';
        let otherHole = document.createElement('div'); otherHole.className = 'other-hole';
        let holeScore = document.createElement('div'); holeScore.className = 'hole-score';

        let myHoleStop = document.getElementsByClassName('my-deposit')[0];
        let otherHoleStop = document.getElementsByClassName('my-deposit-score')[0];
        let holeScoreStop = document.getElementsByClassName('other-deposit-score')[0];

        // FIXME - not generating the grid correctly
        for (let i = 5; i < this.settings.numberOfHoles; i++) {
            document.insertBefore(otherHole, otherHoleStop);
            document.insertBefore(myHole, myHoleStop);
            document.insertBefore(holeScore, holeScoreStop);
        }

        console.debug(gameboard);
    }

    placeSeeds() {
        const nseeds = this.settings.numberOfSeedsPerHole;
        const nholes = this.settings.numberOfHoles;
        this.seeds = new Array(2 * nholes + 2).fill(nseeds);

        // Hard to read but these are the seeds in the deposits.
        // Players' initial score is always 0.
        this.seeds[0] = 0;
        this.seeds[nholes + 1] = 0;

        // TODO - Place the seeds in the right holes at random positions
    }
}
