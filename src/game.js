import Gameboard from './gameboard.js'
import ServerApi from './serverApi.js';

const stateEnum = {'player1Turn': 1, 'player2Turn': 2,'botTurn': 3, 'giveUp': 4, 'win': 5, 'lose': 6, 'draw': 7};
Object.freeze(stateEnum)

export default class Game {
    // The purpose of this class is to be a controller for a gameboard
    constructor() {

        //Gameboard
        this.board = null;

        //State
        this.gameState = null;

        this.api = new ServerApi();
        this.playerName = 'Player 1';

        //ClickEvents
        const giveUpBtn = document.getElementById('leave-btn');
        giveUpBtn.addEventListener('click', async ()=> {            
            const oldState = await this.changeState(stateEnum.giveUp);
            this.endGame(oldState);
            document.getElementById('play').scrollIntoView();
        })
    }

    setPlayerName(newName) {
        this.playerName = newName;
    }

    setupGameConfig() {
        //Config board
        this.board = new Gameboard();

        //Set state
        if(this.board.settings.playerTurn) this.gameState = stateEnum.player1Turn;
        else this.gameState = this.board.settings.pvp ? stateEnum.player2Turn : stateEnum.botTurn;
        
        //Set eventListenners
        this.board.setupEventListeners(this.handleHoleClick);
        console.debug("Game Configured");
    }

    async startGame() {
        console.debug('Game Starting');

        if(this.gameState == stateEnum.botTurn) { //Bot Play
            this.addMsgToChat("GRRR I start!");
            await this.playBot();
            await this.changeState(stateEnum.player1Turn);
            return;
        }

        let className, text;
        if(this.gameState == stateEnum.player1Turn){
            text= "Let's beggin!";
            className =  '.my-hole .hole';
        }else {
            className = '.enemy-hole .hole';
            text = "My turn!";
        }
        
        const holes =  document.querySelectorAll(className);
        this.addClassNameToList(holes, 'active');
        this.addMsgToChat(text);
    }

    async changeState(newState) {
        if(newState==stateEnum.win || newState==stateEnum.lose || newState==stateEnum.draw){
            let holes =  document.querySelectorAll('.my-hole .hole');
            this.removeClassNameFromList(holes, 'active');
            holes = document.querySelectorAll('.enemy-hole .hole');
            this.removeClassNameFromList(holes, 'active');
            console.debug("Game ended");

            this.showEndMenu(newState);
            this.gameState = newState;
            return;
        }

        if(newState==stateEnum.giveUp || newState==stateEnum.botTurn) {

            const className = this.gameState == stateEnum.player1Turn ? '.my-hole .hole' : '.enemy-hole .hole';
            const holes =  document.querySelectorAll(className);

            this.removeClassNameFromList(holes, 'active');

            if(newState==stateEnum.botTurn) { //Bot Play
                this.gameState = newState;
                this.addMsgToChat("It's my time to shine!");
                await this.playBot();
                this.changeState(stateEnum.player1Turn);
                return;
            }
            
            this.addMsgToChat("I give up :(");

            const deposit = (this.gameState == stateEnum.player1Turn ) ? 'my-deposit' : 'enemy-deposit';
            document.querySelector(`#play .game .${deposit} .score`).textContent = 0;

            const oldState = this.gameState;
            this.gameState = newState;
            return oldState;
        }
        
        this.gameState = newState;
        this.addMsgToChat(Math.random() < 0.5 ? "I'm going to do my best!" : "It's my turn.");

        if(newState==stateEnum.player1Turn) {
            const holes =  document.querySelectorAll('.my-hole .hole');
            this.addClassNameToList(holes, 'active');
            if(this.board.settings.pvp) {
                const holes_ =  document.querySelectorAll('.enemy-hole .hole');
                this.removeClassNameFromList(holes_, 'active');
            }
            return;
        }
        if(newState==stateEnum.player2Turn) {
            let holes =  document.querySelectorAll('.my-hole .hole');
            this.removeClassNameFromList(holes, 'active');
            holes = document.querySelectorAll('.enemy-hole .hole');
            this.addClassNameToList(holes, 'active');
            return;
        }
    }

    handleHoleClick = async (index) => {
        const depositP1 = this.board.settings.numberOfHoles;
        const depositP2 = this.board.seeds.length-1;
        if(this.gameState == stateEnum.player1Turn){
            if(index >= this.board.settings.numberOfHoles) return;
            const res = await (this.executeMove(index, depositP1, depositP2));
            if(!res) return;
            this.changeState(this.board.settings.pvp ? stateEnum.player2Turn : stateEnum.botTurn);
            return;
        }

        if(this.gameState == stateEnum.player2Turn){
            if(index < this.board.settings.numberOfHoles) return;
            const res = await (this.executeMove(index, depositP2, depositP1));
            if(!res) return;
            this.changeState(stateEnum.player1Turn);
            return;
        }
    }

    /* Returns true in case of switching turns, false otherwise */
    async executeMove(index, myDepositIndex, enemyDepositIndex) {
        let seedsPerHole = this.board.seeds;

        let nSeeds = seedsPerHole[index];
        if(nSeeds==0) {
            console.debug('No seeds to withdraw');
            return false;
        }

        console.debug('Withdraw', nSeeds, 'seeds');

        seedsPerHole[index]=0;
        await this.board.removeSeedsFromHole(index);

        let currIndex = index+1;
        let scoredPoints = 0;

        while (nSeeds>1) {
            //SEED Animation
            await this.board.tranferSeed(index, currIndex);

            seedsPerHole[currIndex]+=1;
            this.board.updateHoleScore(currIndex, seedsPerHole[currIndex]);

            scoredPoints = currIndex == myDepositIndex ? scoredPoints+1 : scoredPoints;
            currIndex = (currIndex+1) != enemyDepositIndex ? (currIndex+1) % seedsPerHole.length : (enemyDepositIndex+1) % seedsPerHole.length;
            nSeeds--;
        }

        await this.board.tranferSeed(index, currIndex);
        seedsPerHole[currIndex]+=1;
        this.board.updateHoleScore(currIndex, seedsPerHole[currIndex]);

        if(this.gameState==stateEnum.player1Turn ? currIndex > myDepositIndex : currIndex < enemyDepositIndex) { //Seed in the enemy side
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
            return true;
        }

        if(currIndex==myDepositIndex){ //Seed in player deposit
            scoredPoints++;
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");

            //Check if game can still be played: current player
            if(!this.gameOver(this.gameState, seedsPerHole))
                return false;
            
            await this.removeRemainingSeeds(this.gameState, enemyDepositIndex);

            this.endGame();
            return false;
        }

        if(seedsPerHole[currIndex]==1) { //Steal from enemy side
            const numberOfHoles = this.board.settings.numberOfHoles;
            const oppositeIndex = 2*numberOfHoles-currIndex;
            const oppositeSeeds = seedsPerHole[oppositeIndex];

            if(oppositeSeeds > 0){
                //TODO: Wait for seed anim

                //Remove from oposite side
                seedsPerHole[oppositeIndex]=0;
                await this.board.removeSeedsFromHole(oppositeIndex);
                await this.board.tranferSeed(oppositeIndex, myDepositIndex, oppositeSeeds);
                seedsPerHole[myDepositIndex]+=oppositeSeeds;
                this.board.updateHoleScore(myDepositIndex, seedsPerHole[myDepositIndex]);
                
                //Remove from final seed hole
                seedsPerHole[currIndex]=0;
                await this.board.removeSeedsFromHole(currIndex);
                await this.board.tranferSeed(currIndex, myDepositIndex);
                seedsPerHole[myDepositIndex]+=1;
                this.board.updateHoleScore(myDepositIndex, seedsPerHole[myDepositIndex]);
                
                scoredPoints+=oppositeSeeds+1;
            } 
        }

        if(scoredPoints>0)
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
        else if(Math.random() > 0.7){
            this.addMsgToChat("Better luck next time");
        }

        //Check if game can still be played: oposite player
        const enemyState = this.gameState==stateEnum.player1Turn ? stateEnum.player2Turn : stateEnum.player1Turn;
        if(!this.gameOver(enemyState, seedsPerHole))
            return true;

        await this.removeRemainingSeeds(enemyState, myDepositIndex);

        this.endGame();
        return false;
    }

    async playBot(){
        console.log("MIKE");
        await this.sleep(1000);
    }

    gameOver(nextState, seeds) {
        const numberOfHoles = this.board.settings.numberOfHoles;
        const arr = nextState == stateEnum.player1Turn ? seeds.slice(0, numberOfHoles) : seeds.slice(numberOfHoles+1, seeds.length-1);

        for (const seeds of arr) {
            if(seeds) return false;
        }
        return true;
    }

    async removeRemainingSeeds(nextState, depositIndex) {
        const numberOfHoles = this.board.settings.numberOfHoles;

        let index = 0;
        let arr = this.board.seeds.slice(index, numberOfHoles);
        
        if(nextState == stateEnum.player1Turn){
            index = numberOfHoles+1; 
            arr = this.board.seeds.slice(index, this.board.seeds.length-1);
        }

        let i=-1;
        for (let seeds of arr) {
            i++;
            if(seeds == 0) continue;
            
            this.board.seeds[index+i]=0;
            await this.board.removeSeedsFromHole(index+i);

            await this.board.tranferSeed(index+i, depositIndex, seeds);
            this.board.updateHoleScore(depositIndex, this.board.seeds[depositIndex]+seeds);
        }
    }

    addMsgToChat(text) {
        const className = (this.gameState == stateEnum.player1Turn ) ? 'player-msg' : 'opponent-msg';
        const newElem = document.createElement('p');
        newElem.classList.add(className);
        const node = document.createTextNode(text);
        newElem.append(node);
        const chat = document.getElementById('chat');
        chat.prepend(newElem);
        chat.scrollTop = chat.scrollHeight;
    }

    endGame(giveUp=0){
        if(giveUp){
            giveUp == stateEnum.player1Turn ? this.changeState(stateEnum.lose) : this.changeState(stateEnum.win);
            return;
        }
        const p1Score = parseInt(document.querySelector('#play .game .my-deposit .score').textContent);
        const p2Score = parseInt(document.querySelector('#play .game .enemy-deposit .score').textContent);

        if(p1Score == p2Score) {
            this.changeState(stateEnum.draw);
            return;
        }

        p1Score>p2Score ? this.changeState(stateEnum.win) : this.changeState(stateEnum.lose);
    }

    showEndMenu(newState){
        const endMenu = document.querySelector('#play .end-menu');

        switch (newState) {
            case stateEnum.win:{
                endMenu.querySelector('.banner h1').textContent = 'VICTORY';
                const leftImg = document.getElementById('leftEndIcon');
                leftImg.style.visibility = 'visible';
                const rightImg = document.getElementById('rightEndIcon');
                rightImg.style.visibility = 'hidden';

                const firstDiv = endMenu.querySelector(".information .final-scores div:first-of-type");
                firstDiv.style.width = '55%';
                const sndDiv = endMenu.querySelector(".information .final-scores div:nth-of-type(2)");
                sndDiv.style.width = '45%';

                break;
            }
            case stateEnum.lose:{
                endMenu.querySelector('.banner h1').textContent = 'DEFEAT';
                const leftImg = document.getElementById('leftEndIcon');
                leftImg.style.visibility = 'hidden';
                const rightImg = document.getElementById('rightEndIcon');
                rightImg.style.visibility = 'visible';

                const firstDiv = endMenu.querySelector(".information .final-scores div:first-of-type");
                firstDiv.style.width = '45%';
                const sndDiv = endMenu.querySelector(".information .final-scores div:nth-of-type(2)");
                sndDiv.style.width = '55%';

                break;
            }
            case stateEnum.draw:{
                endMenu.querySelector('.banner h1').textContent = 'DRAW';
                const imgs = endMenu.querySelectorAll('.banner img');
                for (const img of imgs) {
                    img.style.visibility = 'visible';
                }

                const firstDiv = endMenu.querySelector(".information .final-scores div:first-of-type");
                firstDiv.style.width = '50%';
                const sndDiv = endMenu.querySelector(".information .final-scores div:nth-of-type(2)");
                sndDiv.style.width = '50%';
                break;
            }
            default :
                break;
        }

        const scores = endMenu.querySelectorAll('.information .final-scores .player-score');
        scores[0].textContent = document.querySelector('#play .game .my-deposit .score').textContent;
        scores[1].textContent = document.querySelector('#play .game .enemy-deposit .score').textContent;

        const names = endMenu.querySelectorAll('.information .final-scores .player-name');
        names[0].textContent = this.playerName; //TODO: Change to name of user;
        names[1].textContent = this.board.settings.pvp ? 'Player 2' : 'Bot'; //TODO: Change to name of user;

        endMenu.classList.add('active');
    }

    resetGame(){
        const chat = document.getElementById('chat');
        chat.textContent = '';

        const enemyDeposit = document.querySelector('#play .game .enemy-deposit .hole');
        const myDeposit = document.querySelector('#play .game .my-deposit .hole');
        enemyDeposit.textContent = '';
        myDeposit.textContent = '';

        for (const hole of document.querySelectorAll('.my-hole')) {
            hole.remove();
        }
        for (const hole of document.querySelectorAll('.enemy-hole')) {
            hole.remove();
        }
    }

    //UTILS
    removeClassNameFromList(list, className){
        list.forEach(element=>{
            element.classList.remove(className);
        });
    }
    addClassNameToList(list, className){
        list.forEach(element=>{
            element.classList.add(className);
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
