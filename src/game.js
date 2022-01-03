import Gameboard from './gameboard.js'
import ServerApi from './serverApi.js';

const GameState = {
    'PLAYER1': 1,
    'PLAYER2': 2,
    'GIVEUP': 3,
    'WIN': 4,
    'LOSE': 5,
    'DRAW': 6
};
Object.freeze(GameState);
export { GameState };

export default class Game {

    constructor() {
        this.board = new Gameboard(this.loop.bind(this));
        this.state = this.getInitialGameState(this.board.settings);

        this.setupRequiredClickEvents();
        console.debug('Game object created.');
    }

    // Helper functions
    isPLayer1Turn = () => this.state === GameState.PLAYER1;

    timeout = async ms => new Promise(res => setTimeout(res, ms));
    async waitUserInput() {
        while (this.board.gotInputFromUser === false) {
            await this.timeout(50);
        }
        this.board.gotInputFromUser = false;
    }

    /**
     * Gets the initial state of the game
     * @param settings An object retrieved from the settings read by Gameboard.readSettings()
     * @returns {number} The initial state of the game
     */
    getInitialGameState(settings) {
        // This is weird, but It's because in Gameboard.updateEventListeners the
        // active will be setup correctly for the first turn.
        return settings.player1Starts ? GameState.PLAYER2 : GameState.PLAYER1;
    }

    /**
     * This function adds an event listener that will end the game immediately
     * if someone gives up.
     */
    setupRequiredClickEvents() {
        const leaveButton = document.getElementById('leave-btn');

        leaveButton.addEventListener('click', () => {
            this.end(true);
            document.getElementById('play').scrollIntoView();
        });

        // This is the reason for the comment in getInitialGameState()
        this.board.updateEventListeners(this.state);
        this.board.updateClassNames(this.state);
    }

    /**
     * Game Loop
     * @returns {void}
     */
    loop(event) {
        if (this.isOver())
            return this.end(false);

        this.board.generateMove(event);

        let samePlayer = this.executeMove(this.board.mySeeds, this.board.enemySeeds, this.board.move);
        let previousState = this.state;
        this.updateState(samePlayer);
        this.board.update(previousState, this.loop);
    }

    /**
     * Checks whether the game is over or not.
     * @returns {boolean} True if the game is over, false otherwise
     */
    isOver() {
        const p1GotNoSeeds = this.board.mySeeds.seeds.every(item => item === 0);
        const p2GotNoSeeds = this.board.enemySeeds.seeds.every(item => item === 0);

        console.debug('Result of Game.isOver(): ', p1GotNoSeeds || p2GotNoSeeds);
        return p1GotNoSeeds || p2GotNoSeeds;
    }

    /**
     * Determines the final state of the game.
     * @param giveUp true if the player gave up, false otherwise
     */
    end(giveUp = false) {
        if (giveUp) {
            this.state = this.isPLayer1Turn() ? GameState.LOSE : GameState.WIN;
        } else {
            const p1Score = this.board.mySeeds.deposit;
            const p2Score = this.board.enemySeeds.deposit;

            if (p1Score === p2Score)
                this.state = GameState.DRAW;
            else
                this.state = p1Score > p2Score ? GameState.WIN : GameState.LOSE;
        }

        console.debug('Game Ended');
    }

    /**
     * Changes the state after finished a turn
     */
    updateState(samePlayer) {
        if (samePlayer) {
            console.debug('Game.ChangeState() state remains the same');
            return;
        }

        this.state = this.isPLayer1Turn() ? GameState.PLAYER2 : GameState.PLAYER1;
        console.debug('Game.ChangeState() new state:', this.state);
    }

    /**
     * Executes a move
     * @param mySeeds
     * @param enemySeeds
     * @param move
     * @return True if a player gets the turn again, false otherwise
     */
    executeMove(mySeeds, enemySeeds, move) {
        console.debug('Executing a move');
        console.log(this.board);
        console.debug(mySeeds, enemySeeds, move);
        return false;
    }

    async startGame() {
        console.debug('Game Starting');

        if (this.board.settings.online) {
            if (this.playerName == 'Player 1' && this.playerPass == '')
                return false; //Not registered

            const data = {
                group:99, //default value
                nick: this.playerName,
                password: this.playerPass,
                size: this.board.settings.numberOfHoles,
                initial: this.board.settings.numberOfSeeds
            }
            this.api.join(data);
            return true;
        }

        if (this.state == GameState.BOT) { //Bot Play
            this.addMsgToChat("GRRR I start!");
            await this.playBot();
            await this.changeState(GameState.PLAYER1);
            return true;
        }

        let className, text;
        if (this.state == GameState.PLAYER1){
            text= "Let's beggin!";
            className =  '.my-hole .hole';
        }else {
            className = '.enemy-hole .hole';
            text = "My turn!";
        }
        
        const holes =  document.querySelectorAll(className);
        this.addClassNameToList(holes, 'active');
        this.addMsgToChat(text);
        return true;
    }

    async changeState(newState) {
        let myHoles = document.querySelectorAll('.my-hole .hole');
        let enemyHoles = document.querySelectorAll('.enemy-hole .hole');

        if (newState === GameState.WIN || newState === GameState.LOSE || newState === GameState.DRAW) {
            this.removeClassNameFromList(myholes, 'active');
            this.removeClassNameFromList(enemyHoles, 'active');
            console.debug("Game ended");

            this.showEndMenu(newState);
            this.state = newState;
            return;
        }

        if (newState === GameState.GIVEUP || newState === GameState.BOT) {

            const holes = this.state === GameState.PLAYER1 ? myHoles : enemyHoles;
            this.removeClassNameFromList(holes, 'active');

            if (newState==GameState.BOT) { //Bot Play
                this.state = newState;
                this.addMsgToChat("It's my time to shine!");
                await this.playBot();
                this.changeState(GameState.PLAYER1);
                return;
            }
            
            this.addMsgToChat("I give up :(");

            const deposit = (this.state == GameState.PLAYER1 ) ? 'my-deposit' : 'enemy-deposit';
            document.querySelector(`#play .game .${deposit} .score`).textContent = 0;

            const oldState = this.state;
            this.state = newState;
            return oldState;
        }
        
        this.state = newState;
        this.addMsgToChat(Math.random() < 0.5 ? "I'm going to do my best!" : "It's my turn.");

        if(newState==GameState.PLAYER1) {
            const holes =  document.querySelectorAll('.my-hole .hole');
            this.addClassNameToList(holes, 'active');
            if(this.board.settings.pvp) {
                const holes_ =  document.querySelectorAll('.enemy-hole .hole');
                this.removeClassNameFromList(holes_, 'active');
            }
            return;
        }
        if(newState==GameState.PLAYER2) {
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
        if(this.state == GameState.PLAYER1){
            if(index >= this.board.settings.numberOfHoles) return;
            const res = await (this.executeMove(index, depositP1, depositP2));
            if(!res) return;
            this.changeState(this.board.settings.pvp ? GameState.PLAYER2 : GameState.BOT);
            return;
        }

        if(this.state == GameState.PLAYER2){
            if(index < this.board.settings.numberOfHoles) return;
            const res = await (this.executeMove(index, depositP2, depositP1));
            if(!res) return;
            this.changeState(GameState.PLAYER1);
            return;
        }
    }

    /* Returns true in case of switching turns, false otherwise
    async executeMove(index, myDepositIndex, enemyDepositIndex) {
        let seedsPerHole = this.board.seeds;

        let nSeeds = seedsPerHole[index];
        if(nSeeds == 0) {
            console.debug('No seeds to withdraw');
            return false;
        }

        seedsPerHole[index]=0;
        await this.board.removeSeedsFromHole(index);

        let currIndex = index+1;
        let scoredPoints = 0;

        while (nSeeds>1) {
            //SEED Animation
            await this.board.transferSeed(index, currIndex);

            seedsPerHole[currIndex]+=1;
            this.board.updateHoleScore(currIndex, seedsPerHole[currIndex]);

            scoredPoints = currIndex == myDepositIndex ? scoredPoints+1 : scoredPoints;
            currIndex = (currIndex+1) != enemyDepositIndex ? (currIndex+1) % seedsPerHole.length : (enemyDepositIndex+1) % seedsPerHole.length;
            nSeeds--;
        }

        await this.board.tranferSeed(index, currIndex);
        seedsPerHole[currIndex]+=1;
        this.board.updateHoleScore(currIndex, seedsPerHole[currIndex]);

        if(this.state==GameState.PLAYER1 ? currIndex > myDepositIndex : currIndex < enemyDepositIndex) { //Seed in the enemy side
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
            return true;
        }

        if(currIndex==myDepositIndex){ //Seed in player deposit
            scoredPoints++;
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");

            //Check if game can still be played: current player
            if(!this.gameOver(this.state, seedsPerHole))
                return false;
            
            await this.removeRemainingSeeds(this.state, enemyDepositIndex);

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
        const enemyState = this.state==GameState.PLAYER1 ? GameState.PLAYER2 : GameState.PLAYER1;
        if(!this.gameOver(enemyState, seedsPerHole))
            return true;

        await this.removeRemainingSeeds(enemyState, myDepositIndex);

        this.endGame();
        return false;
    } */

    async playBot(){
        console.log("MIKE");
        await this.sleep(1000);
    }

    gameOver(nextState, seeds) {
        const numberOfHoles = this.board.settings.numberOfHoles;
        const arr = nextState == GameState.PLAYER1 ? seeds.slice(0, numberOfHoles) : seeds.slice(numberOfHoles+1, seeds.length-1);

        for (const seeds of arr) {
            if(seeds) return false;
        }
        return true;
    }

    async removeRemainingSeeds(nextState, depositIndex) {
        const numberOfHoles = this.board.settings.numberOfHoles;

        let index = 0;
        let arr = this.board.seeds.slice(index, numberOfHoles);
        
        if(nextState == GameState.PLAYER1){
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
        const className = (this.state == GameState.PLAYER1 ) ? 'player-msg' : 'opponent-msg';
        const newElem = document.createElement('p');
        newElem.classList.add(className);
        const node = document.createTextNode(text);
        newElem.append(node);
        const chat = document.getElementById('chat');
        chat.prepend(newElem);
        chat.scrollTop = chat.scrollHeight;
    }

    showEndMenu(newState) {
        const endMenu = document.querySelector('#play .end-menu');

        switch (newState) {
            case GameState.WIN:{
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
            case GameState.LOSE:{
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
            case GameState.DRAW:{
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

    reset(){
        const chat = document.getElementById('chat');
        chat.textContent = '';

        const enemyDeposit = document.querySelector('#play .game .enemy-deposit .hole');
        const myDeposit = document.querySelector('#play .game .my-deposit .hole');
        enemyDeposit.textContent = '';
        myDeposit.textContent = '';

        for (const hole of document.querySelectorAll('.my-hole'))
            hole.remove();
        for (const hole of document.querySelectorAll('.enemy-hole'))
            hole.remove();
        console.debug('Reset game');
    }

    //UTILS

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
