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

    buildHole(typeOfHole) {
        let newHole = document.createElement('div');
        newHole.className = typeOfHole;

        let hole = document.createElement('div');
        hole.className = 'hole';
        let score = document.createElement('div');
        score.className = 'score';

        newHole.append(hole);
        newHole.append(score);

        let oldHole = document.querySelector('.' + typeOfHole);
        document.querySelector('.gameboard').insertBefore(newHole, oldHole);
    }

    buildBoard() {
        let gameboard = document.querySelector('.gameboard');
        gameboard.style.gridTemplateColumns = '1fr repeat(' + this.settings.numberOfHoles + ', 0.75fr) 1fr';

        const minNumberOfHoles = 2;
        for (let i = minNumberOfHoles; i < this.settings.numberOfHoles; i++) {
            this.buildHole('enemy-hole');
            this.buildHole('my-hole');
        }
    }

    placeSeeds() {
        let seed = document.createElement('div');
        seed.className = 'seed';

        const nseeds = this.settings.numberOfSeedsPerHole;
        const nholes = this.settings.numberOfHoles;
        this.seeds = new Array(2 * nholes + 2).fill(nseeds);

        // Hard to read but these are the seeds in the deposits.
        // Players' initial score is always 0.
        this.seeds[0] = 0;
        this.seeds[nholes + 1] = 0;


    }
}
