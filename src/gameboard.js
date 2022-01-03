import {GameState} from "./game.js";

/**
 * Enum containing the name of the DOM classes for the pits/holes creation
 * @type {{MINE: string, OPPONENT: string}}
 */
const TypeOfHole = {
    'MINE':     'my-hole',
    'OPPONENT': 'enemy-hole',
};
Object.freeze(TypeOfHole);

/**
 * `Gameboard` is the viewer component of the game, this class
 * is responsible for interact with the HTML and then making the
 * connection with the controller component.
 */
export default class Gameboard {

    constructor(gameLoop) {
        this.readSettings();

        this.mySeeds = {
            'seeds' : Array(this.settings.numberOfHoles).fill(this.settings.seedsPerHole),
            'deposit' : 0,
        };
        this.enemySeeds = {
            'seeds': Array(this.settings.numberOfHoles).fill(this.settings.seedsPerHole),
            'deposit' : 0,
        };
        this.move = {};
        this.gameLoopCallBack = gameLoop;

        this.buildBoard();
        console.debug('Gameboard object created.');
    }

    /**
     * Reads the configuration before starting the game.
     * This configuration is read from a form in HTML.
     */
    readSettings() {
        this.settings = {
            player1Starts: document.getElementById('f-turn').checked,
            numberOfHoles: parseInt(document.getElementById('n-holes').innerHTML),
            seedsPerHole: parseInt(document.getElementById('n-seeds').innerHTML),
            pvp: document.getElementById('pvp').checked,
        }
        // this.settings.difficulty = document.getElementById('difficulty').value;
        // this.settings.online = this.settings.difficulty === 'multi_player';;
    }

    /**
     * Builds a hole according to the typeOfHole
     * @param typeOfHole it can have the values defined in TypeOfHole
     */
    buildHole(typeOfHole) {
        let pit = document.createElement('div');
        pit.classList.add(typeOfHole);

        let hole = document.createElement('div');
        hole.classList.add('hole');
        let score = document.createElement('div');
        score.classList.add('score');

        pit.append(hole);
        pit.append(score);

        let oldPit;
        if (typeOfHole === TypeOfHole.OPPONENT) {
            oldPit = document.querySelector('.enemy-deposit');
            oldPit.parentNode.insertBefore(pit, oldPit.nextSibling);
        }

        if (typeOfHole === TypeOfHole.MINE) {
            oldPit = document.querySelector('.my-deposit');
            document.querySelector('.gameboard').insertBefore(pit, oldPit);
        }

        this.placeSeedsOnHole(pit.querySelector('.hole'), this.settings.seedsPerHole);
    }

    /**
     * Builds the board inserting the desired number of holes/pits
     * in each of the sides.
     */
    buildBoard() {
        let board = document.querySelector('.gameboard');
        board.style.gridTemplateColumns = '1fr repeat(' + this.settings.numberOfHoles + ', 1fr) 1fr';

        for (let i = 0; i < this.settings.numberOfHoles; i++) {
            this.buildHole(TypeOfHole.OPPONENT);
            this.buildHole(TypeOfHole.MINE);
        }
    }

    placeSeedsOnHole(parentHole, numberOfSeeds) {
        const seed = document.createElement('div');
        seed.classList.add('seed');

        for (let i = 0; i < numberOfSeeds; i++) {
            let cloneSeed = seed.cloneNode();
            parentHole.appendChild(cloneSeed);
            this.generateRandomPosition(cloneSeed);
        }
    }

    generateRandomPosition(seed) {
        seed.style.backgroundColor = "hsl(" + 360 * Math.random() + ',' +
                                         (75 + 30 * Math.random()) + '%,' +
                                         (45 + 10 * Math.random()) + '%)';

        seed.style.transform = 'rotate(' + Math.random() * 180 + 'deg)';

        seed.style.left = (40 + ((Math.random() * 30)-10)) + '%';
        seed.style.top = (45 + ((Math.random() * 40)-20)) + '%';
    }

    updateEventListeners(gameState) {
        console.debug(gameState);
        const myHoles = document.querySelectorAll('.my-hole .hole');
        const enemyHoles = document.querySelectorAll('.enemy-hole .hole');

        switch (gameState) {
            case GameState.PLAYER1:
                this.removeEventListenerFromNodeList(myHoles, 'click', this.gameLoopCallBack);
                this.addEventListenerToNodeList(enemyHoles, 'click', this.gameLoopCallBack);
                break;
            case GameState.PLAYER2:
                this.addEventListenerToNodeList(myHoles, 'click', this.gameLoopCallBack);
                this.removeEventListenerFromNodeList(enemyHoles, 'click', this.gameLoopCallBack);
                break;
            default:
                this.removeEventListenerFromNodeList(myHoles, 'click', this.gameLoopCallBack);
                this.removeEventListenerFromNodeList(enemyHoles, 'click', this.gameLoopCallBack);
        }
        console.debug('Event Listeners updated');
    }

    updateClassNames(gameState) {
        console.debug(gameState);
        const myHoles = document.querySelectorAll('.my-hole .hole');
        const enemyHoles = document.querySelectorAll('.enemy-hole .hole');

        switch (gameState) {
            case GameState.PLAYER1:
                this.removeClassNameFromNodeList(myHoles, 'active');
                this.addClassNameToNodeList(enemyHoles, 'active');
                break;
            case GameState.PLAYER2:
                this.addClassNameToNodeList(myHoles, 'active');
                this.removeClassNameFromNodeList(enemyHoles, 'active');
                break;
            default:
                this.removeClassNameFromNodeList(myHoles, 'active');
                this.removeClassNameFromNodeList(enemyHoles, 'active');
        }
        console.debug('Class Names updated');
    }

    updateScores() {
        let myHoles = document.querySelectorAll('.my-hole');
        let enemyHoles = document.querySelectorAll('.enemy-hole');

        for (let [i, hole] in myHoles.entries())
            hole.querySelector('.hole .score').textContent = this.mySeeds.seeds[i];
        document.querySelector('.my-deposit .score').textContent = this.mySeeds.deposit;

        for (let [i, hole] in Array.from(enemyHoles).reverse().entries())
            hole.querySelector('.hole .score').textContent = this.enemySeeds.seeds[i];
        document.querySelector('.enemy-deposit .score').textContent = this.enemySeeds.deposit;

        console.debug('Scores Updated');
    }

    updateSeeds() {
        const myHoles = document.querySelectorAll('.my-hole');
        const enemyHoles = document.querySelectorAll('.enemy-hole');

        myHoles.forEach(hole => hole.querySelector('.hole').textContent = '');
        enemyHoles.forEach(hole => hole.querySelector('.hole').textContent = '');

        for (let [i, hole] in myHoles.entries())
            this.placeSeedsOnHole(hole.querySelector('.hole'), this.mySeeds.seeds[i]);

        const myDepositHole = document.querySelector('.my-deposit .hole');
        myDepositHole.textContent = '';
        this.placeSeedsOnHole(myDepositHole, this.mySeeds.deposit);

        for (let [i, hole] in Array.from(enemyHoles).reverse().entries())
            this.placeSeedsOnHole(hole.querySelector('.hole'), this.enemySeeds.seeds[i]);

        const enemyDepositHole = document.querySelector('.enemy-deposit .hole');
        enemyDepositHole.textContent = '';
        this.placeSeedsOnHole(enemyDepositHole, this.mySeeds.deposit);

        console.debug('Seeds Updated');
    }

    update(gameState) {
        this.updateEventListeners(gameState);
        this.updateClassNames(gameState);
        this.updateScores();
        this.updateSeeds();
    }

    generateMove(event) {
        let clickedHole = event.target.classList.contains('seed') ? event.target.parentElement.parentElement :
                                                                    event.target.parentElement;
        let holePosition = Array.from(clickedHole.parentNode.children).indexOf(clickedHole);
        console.debug(clickedHole, holePosition);

        this.move = {};
        console.debug('Move Generated');
    }

    /* Logic */
    async removeSeedsFromHole(i) {
        this.updateHoleScore(i, 0);
        this.resetSeedPosition(this.holes[i]);
        await this.sleep(300);
    }

    resetSeedPosition(hole) {
        const seeds = hole.querySelectorAll('.hole .seed');
        seeds.forEach(seed => {
            seed.style.left = '40%';
            seed.style.top = '45%';
        });
    }

    async transferSeed(from, to, n= 1) {
        const holeFrom = this.holes[from].querySelector('.hole');
        const holeTo = this.holes[to].querySelector('.hole');

        while (n > 0) {
            const seed = holeFrom.removeChild(holeFrom.querySelector('.seed'));
            seed.style.left = (40 + ((Math.random() * 30)-10)) + '%';
            seed.style.top = (45 + ((Math.random() * 40)-20)) + '%';

            holeTo.appendChild(seed);
            n--;
        }
        await this.sleep(200);
    }


    addEventListenerToNodeList(list, type, listener) {
        list.forEach(node => {
            node.addEventListener(type, listener);
            console.debug('Event listener added');
        });
    }

    removeEventListenerFromNodeList(list, type, listener) {
        list.forEach(node => {
            node.removeEventListener(type, listener);
            console.debug('Event listener removed');
        });
    }

    addClassNameToNodeList(list, className) {
        list.forEach(node => {
            node.classList.add(className);
        });
    }

    removeClassNameFromNodeList(list, className) {
        list.forEach(node => {
            node.classList.remove(className);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


