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
        this.readHoles();
        this.placeSeeds();
    }

    readUserSettings() {
        this.settings.playerTurn = document.getElementById('f-turn').checked;
        this.settings.numberOfHoles = parseInt(document.getElementById('n-holes').innerHTML);
        this.settings.numberOfSeedsPerHole = parseInt(document.getElementById('n-seeds').innerHTML);
        this.settings.pvp = document.getElementById('pvp').checked;
        this.settings.difficulty = document.getElementById('difficulty').value;
        this.settings.online = this.settings.difficulty == 'multi_player' ? true : false;
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

        if(typeOfHole=='enemy-hole'){
            const oldHole = document.querySelector('.enemy-deposit');
            const h = oldHole.nextSibling;
            oldHole.parentNode.insertBefore(newHole, oldHole.nextSibling);
            return;
        }

        const oldHole = document.querySelector('.my-deposit');
        document.querySelector('.gameboard').insertBefore(newHole, oldHole);
        return;
    }

    buildBoard() {
        let gameboard = document.querySelector('.gameboard');
        gameboard.style.gridTemplateColumns = '1fr repeat(' + this.settings.numberOfHoles + ', 1fr) 1fr';

        for (let i = 0; i < this.settings.numberOfHoles; i++) {
            this.buildHole('enemy-hole');
            this.buildHole('my-hole');
        }
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

    placeSeeds() {
        const numberOfHoles = this.settings.numberOfHoles;
        this.seeds = new Array(2 * numberOfHoles + 2);
        this.seeds.fill(this.settings.numberOfSeedsPerHole);

        // These are the seeds in the deposits.
        // Players' initial score is always 0.
        this.seeds[numberOfHoles] = 0;
        this.seeds[this.seeds.length - 1] = 0;

        for (const [i, nseeds] of this.seeds.entries()) {
            this.placeSeedsOnHole(this.holes[i].children[0], nseeds);
            this.holes[i].children[1].innerText = nseeds.toString(10);
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

    setupEventListeners(handleHoleClick) {
        const holes1 = document.querySelectorAll('.my-hole .hole');
        holes1.forEach((hole,i) => {
            hole.addEventListener('click', ()=>{
                handleHoleClick(i);
            });
        });

        const holes2 = document.querySelectorAll('.enemy-hole .hole');
        holes2.forEach((hole,i) => {
            hole.addEventListener('click', ()=>{
                //New index is counted starting from player1 holes
                handleHoleClick(2*this.settings.numberOfHoles-i);
            });
        });
    }

    /* Logic */
    async removeSeedsFromHole(index) {
        this.updateHoleScore(index, 0);
        this.resetSeedPosition(this.holes[index]);
        await this.sleep(300);
    }
    
    resetSeedPosition(hole) {
        const seeds = hole.querySelectorAll('.hole .seed');
        seeds.forEach(seed=>{
            seed.style.left = '40%';
            seed.style.top = '45%';
        });
    }

    updateHoleScore(index, newScore) {
        this.holes[index].querySelector('.score').textContent = newScore;
    }

    async tranferSeed(from, to, n=1){
        const holeFrom = this.holes[from].querySelector('.hole');
        const holeTo = this.holes[to].querySelector('.hole');

        while(n>0){
            const seed = holeFrom.removeChild(holeFrom.querySelector('.seed'));
            seed.style.left = (40 + ((Math.random() * 30)-10)) + '%';
            seed.style.top = (45 + ((Math.random() * 40)-20)) + '%';
            
            holeTo.appendChild(seed);
            n--;
        }
        await this.sleep(200);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

