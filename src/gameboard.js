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

    /**
     * Constructor for Gameboard class
     * @param gameLoop function in which the game loop happens.
     * This approach is necessary because js doesn't stop execution
     * meaning that we need to react to events instead of being proactive.
     */
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
        console.debug('Board object created.');
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
        score.textContent = this.settings.seedsPerHole.toString();
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

    /**
     * Function that places the seed on the desired holes while
     * in board construction.
     * @param parentHole HTML element in which an element seed will be added as a child.
     * @param numberOfSeeds Number of seed elements to add.
     */
    placeSeedsOnHole(parentHole, numberOfSeeds) {
        const seed = document.createElement('div');
        seed.classList.add('seed');

        for (let i = 0; i < numberOfSeeds; i++) {
            let cloneSeed = seed.cloneNode();
            parentHole.appendChild(cloneSeed);
            this.generateStyle(cloneSeed);
        }
    }

    /**
     * Generates a style for a seed element
     * @param seed HTML element
     */
    generateStyle(seed) {
        let colors = ['firebrick', 'limegreen', 'navy', 'goldenrod'];
        seed.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        seed.style.transform = 'rotate(' + Math.random() * 180 + 'deg)';
        seed.style.left = (40 + ((Math.random() * 30)-10)) + '%';
        seed.style.top = (45 + ((Math.random() * 40)-20)) + '%';
    }

    /**
     * Function that changes the holes for the event listeners according with the current game state.
     * @param gameState
     */
    updateEventListeners(gameState) {
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

        for (let [i, pit] of myHoles.entries())
            pit.querySelector('.score').textContent = this.mySeeds.seeds[i].toString();
        document.querySelector('.my-deposit .score').textContent = this.mySeeds.deposit.toString();

        for (let [i, pit] of Array.from(enemyHoles).reverse().entries())
            pit.querySelector('.score').textContent = this.enemySeeds.seeds[i].toString();
        document.querySelector('.enemy-deposit .score').textContent = this.enemySeeds.deposit.toString();

        console.debug('Scores Updated');
    }


    updateSeedsOnHole(parentHole, newNumberOfSeeds) {
        const seed = document.createElement('div');
        seed.classList.add('seed');

        while (parentHole.children.length < newNumberOfSeeds) {
            let cloneSeed = seed.cloneNode();
            parentHole.appendChild(cloneSeed);
            this.generateStyle(cloneSeed);
        }
        while (parentHole.children.length > newNumberOfSeeds)
            parentHole.removeChild(parentHole.lastChild);
    }

    updateSeeds() {
        const myHoles = document.querySelectorAll('.my-hole');
        const enemyHoles = document.querySelectorAll('.enemy-hole');

        for (let [i, pit] of myHoles.entries())
            this.updateSeedsOnHole(pit.querySelector('.hole'), this.mySeeds.seeds[i]);

        const myDepositHole = document.querySelector('.my-deposit .hole');
        this.updateSeedsOnHole(myDepositHole, this.mySeeds.deposit);

        for (let [i, pit] of Array.from(enemyHoles).reverse().entries())
            this.updateSeedsOnHole(pit.querySelector('.hole'), this.enemySeeds.seeds[i]);

        const enemyDepositHole = document.querySelector('.enemy-deposit .hole');
        this.updateSeedsOnHole(enemyDepositHole, this.enemySeeds.deposit);
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

        if (clickedHole.classList.contains('my-hole'))
            this.move = holePosition - (this.settings.numberOfHoles + 2);
        else if (clickedHole.classList.contains('enemy-hole'))
            this.move = (this.settings.numberOfHoles + 1) + ((this.settings.numberOfHoles + 1) - holePosition)

        console.debug('Move Generated');
    }

    reset() {
        this.mySeeds = {
            'seeds' : Array(this.settings.numberOfHoles).fill(this.settings.seedsPerHole),
            'deposit' : 0,
        };
        this.enemySeeds = {
            'seeds': Array(this.settings.numberOfHoles).fill(this.settings.seedsPerHole),
            'deposit' : 0,
        };
        this.move = {};

        document.querySelector('.enemy-deposit .hole').textContent = '';
        document.querySelector('.my-deposit .hole').textContent = '';

        for (const hole of document.querySelectorAll('.my-hole'))
            hole.remove();
        for (const hole of document.querySelectorAll('.enemy-hole'))
            hole.remove();

        this.updateScores();
    }

    // Helpers
    addEventListenerToNodeList(list, type, listener) {
        list.forEach(node => node.addEventListener(type, listener));
    }
    removeEventListenerFromNodeList(list, type, listener) {
        list.forEach(node => node.removeEventListener(type, listener));
    }

    addClassNameToNodeList(list, className) {
        list.forEach(node => node.classList.add(className));
    }
    removeClassNameFromNodeList(list, className) {
        list.forEach(node => node.classList.remove(className));
    }
}
