export default class Gameboard {
    constructor() {
        // Settings
        this.settings = {
            playerTurn: '',
            numberOfHoles: '',
            numberOfSeedsPerHole: '',
            pvp: '',
            online: '',
            difficulty: ''
        };
        // Seeds
        this.seeds = [];
        //Holes
        this.holes = [];

        this.readUserSettings();
        this.buildBoard();
        this.placeSeeds();
        this.readHoles();
    }

    readUserSettings() {
        this.settings.playerTurn = document.getElementById('f-turn').checked;
        this.settings.numberOfHoles = parseInt(document.getElementById('n-holes').innerHTML);
        this.settings.numberOfSeedsPerHole = parseInt(document.getElementById('n-seeds').innerHTML);
        this.settings.pvp = document.getElementById('pvp').checked;
        this.settings.difficulty = document.getElementById('difficulty').value;
    }

    buildHole(typeOfHole) {
        let newHole = document.createElement('div');
        newHole.classList.add(typeOfHole);

        let hole = document.createElement('div');
        hole.classList.add('hole');
        let score = document.createElement('div');
        score.classList.add('score');

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
        seed.classList.add('seed');

        for (let i = 0; i < nseeds; i++) {
            let newSeed = seed.cloneNode();
            parentHole.appendChild(newSeed);
            this.generateRandomPosition(newSeed);
        }
    }

    generateRandomPosition(seed) {
        seed.style.backgroundColor = "hsl(" + 360 * Math.random() + ',' +
                                        (75 + 30 * Math.random()) + '%,' + 
                                        (45 + 10 * Math.random()) + '%)';
        const randomAngle = Math.random() * 180;
        seed.style.transform = 'rotate(' + randomAngle + 'deg)';

        seed.style.left = (40 + ((Math.random() * 30)-10)) + '%';
        seed.style.top = (45 + ((Math.random() * 40)-20)) + '%';
    }

    readHoles() {
        document.querySelectorAll('.my-hole').forEach(element=>this.holes.push(element));
        this.holes.push(document.querySelector('.my-deposit'));
        const reverseHoles = document.querySelectorAll('.enemy-hole');
        for (let index = reverseHoles.length-1; index >= 0; index--) {
            const element = reverseHoles[index];
            this.holes.push(element);
        }
        this.holes.push(document.querySelector('.enemy-deposit'));
    }
}

