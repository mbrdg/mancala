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
        this.seeds = new Array(2 * this.settings.numberOfHoles + 2);
        this.seeds.fill(this.settings.numberOfSeedsPerHole);

        // Hard to read but these are the seeds in the deposits.
        // Players' initial score is always 0.
        this.seeds[0] = 0;
        this.seeds[this.seeds.length - 1] = 0;

        let holes = document.querySelector('.gameboard').children;
        for (const [i, nseeds] of this.seeds.entries()) {
            this.placeSeedsOnHole(holes[i].children[0], nseeds);
            holes[i].children[1].innerText = nseeds.toString(10);
        }
    }

    placeSeedsOnHole(parentHole, nseeds) {
        let newSeed = document.createElement('div');
        newSeed.className = 'seed';

        for (let i = 0; i < nseeds; i++) {
            let oldSeed = parentHole.querySelector('.seed');
            parentHole.insertBefore(newSeed, oldSeed);
        }
    }
}
