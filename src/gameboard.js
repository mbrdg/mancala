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

        // These are the seeds in the deposits.
        // Players' initial score is always 0.
        this.seeds[0] = 0;
        this.seeds[this.seeds.length - 1] = 0;

        let holes = document.querySelector('.gameboard').children;
        for (const [i, nseeds] of this.seeds.entries()) {
            // Weird i+1, right? It's because of the pause button...
            this.placeSeedsOnHole(holes[i+1].children[0], nseeds);
            holes[i+1].children[1].innerText = nseeds.toString(10);
        }
    }

    placeSeedsOnHole(parentHole, nseeds) {
        const seed = document.createElement('div');
        seed.className = 'seed';

        for (let i = 0; i < nseeds; i++) {
            let newSeed = seed.cloneNode();
            parentHole.appendChild(newSeed);
            this.generateRandomPosition(newSeed);
        }
    }

    generateRandomPosition(seed) {
        const randomColor = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
        seed.style.backgroundColor = randomColor;
        const randomAngle = Math.random() * 180;
        seed.style.transform = 'rotate(' + randomAngle + 'deg)';

        seed.style.left = Math.random() * 2.5 + 0.5 + 'em';
        seed.style.top = Math.random() * 4.5 + 1 + 'em';
    }
}

