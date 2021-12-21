import Gameboard from './gameboard.js'

const stateEnum = {'player1Turn': 1, 'player2Turn': 2,'botTurn': 3, 'giveUp': 4, 'win': 5, 'lose': 6};
Object.freeze(stateEnum)

export default class Game {
    // The purpose of this class is to be a controller for a gameboard
    constructor() {

        //Gameboard
        this.board = null;

        //State
        this.gameState = null;
    }

    setupGameConfig() {
        //Config board
        this.board = new Gameboard();

        //Set state
        if(this.board.settings.pvp)
            this.gameState = this.board.settings.playerTurn ? stateEnum.player1Turn : stateEnum.player2Turn;
        else
            this.gameState = this.board.settings.playerTurn ? stateEnum.player1Turn : stateEnum.botTurn;
        
        //Set eventListenners
        this.setupEventListeners();
        console.debug("Game Configured");
    }

    setupEventListeners() {
        const holes1 = document.querySelectorAll('.my-hole .hole');
        holes1.forEach((hole,i) => {
            hole.addEventListener('click', ()=>{
                this.handleHoleClick(i);
            });
        });

        const holes2 = document.querySelectorAll('.enemy-hole .hole');
        holes2.forEach((hole,i) => {
            hole.addEventListener('click', ()=>{
                //New index is counted starting from player1 holes
                this.handleHoleClick(2*this.board.settings.numberOfHoles-i);
            });
        });

        const giveUpBtn = document.getElementById('leave-btn');
        giveUpBtn.addEventListener('click', ()=>{
            this.changeState(stateEnum.giveUp);
            const game = document.querySelector('#play .game');
            game.classList.toggle('disable');
        })
    }

    startGame() {
        console.debug('Game Starting');

        if(this.gameState == stateEnum.botTurn) {
            //Bot Play
            this.addMsgToChat("GRRR I start!");
            this.changeState(stateEnum.player1Turn);
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

    changeState(newState) {
        if(newState==stateEnum.win || newState==stateEnum.lose){
            let holes =  document.querySelectorAll('.my-hole .hole');
            this.removeClassNameFromList(holes, 'active');
            holes = document.querySelectorAll('.enemy-hole .hole');
            this.removeClassNameFromList(holes, 'active');
            console.debug("Game ended");
            this.gameState = newState;
            return;
        }

        if(newState==stateEnum.giveUp || newState==stateEnum.botTurn) {

            const className = this.gameState == stateEnum.player1Turn ? '.my-hole .hole' : '.enemy-hole .hole';
            const holes =  document.querySelectorAll(className);

            this.removeClassNameFromList(holes, 'active');

            if(newState==stateEnum.botTurn) { //Test: Bot Play
                console.log('bot play');
                this.gameState = newState;
                this.addMsgToChat("It's my time to shine!");
                this.changeState(stateEnum.player1Turn);
                return;
            }
            
            console.log("someone gave up");
            this.addMsgToChat("I give up :(");
            this.gameState = newState;
            return;
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

    async handleHoleClick(index) {
        switch (this.gameState) {
            case stateEnum.player1Turn:{
                if(index >= this.board.settings.numberOfHoles) return;
                const res = await (this.playHoleP1(index));
                if(!res) return;
                this.changeState(this.board.settings.pvp ? stateEnum.player2Turn : stateEnum.botTurn);
                break;
            }
            case stateEnum.player2Turn:{
                if(index < this.board.settings.numberOfHoles) return;
                const res = await (this.playHoleP2(index));
                if(!res) return;
                this.changeState(stateEnum.player1Turn);
                break;
            }
            default:
                break;
        }
    }

    /* Returns true in case of switching turns, false otherwise */
    async playHoleP1(index) {
        const holes = this.board.holes;
        const numberOfHoles = this.board.settings.numberOfHoles;

        let nSeeds = parseInt(holes[index].querySelector('.score').textContent);
        if(nSeeds==0) {
            console.debug('No seeds to withdraw');
            return false;
        }

        console.debug('Withdraw', nSeeds, 'seeds');
        holes[index].querySelector('.score').textContent = 0;

        this.resetSeedPos(holes[index]);
        await this.sleep(300);

        let currIndex = index+1;
        let scoredPoints = 0;

        while (nSeeds>1) {
            const currSeeds = parseInt(holes[currIndex].querySelector('.score').textContent);
            holes[currIndex].querySelector('.score').textContent = currSeeds+1;

            //SEED Animation
            this.tranferSeed(holes[index], holes[currIndex]);
            await this.sleep(200);

            scoredPoints = currIndex == numberOfHoles ? scoredPoints+1 : scoredPoints;
            currIndex = (currIndex+1)!= holes.length-1 ? (currIndex+1) % holes.length : 0;
            nSeeds--;
        }
        
        const currSeeds = parseInt(holes[currIndex].querySelector('.score').textContent);
        holes[currIndex].querySelector('.score').textContent = currSeeds+1;
        this.tranferSeed(holes[index], holes[currIndex]);
        await this.sleep(200);

        if(currIndex > numberOfHoles) { //Seed in the enemy side
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
            return true;
        }

        if(currIndex==numberOfHoles){ //Seed in player deposit
            scoredPoints++;
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");

            //Check if game can still be played: player1
            if(this.checkPossiblePlay(holes.slice(0, numberOfHoles)))
                return false;
            
            //Change state to according: win or lose
            this.removeRemainingSeeds(holes.slice(numberOfHoles+1, -1), holes[holes.length-1]);
            await this.sleep(300);

            this.changeState(stateEnum.win);
            return false;
        }

        if(currSeeds==0) { //Steal from player side
            const oppositeIndex = 2*numberOfHoles-currIndex;
            const oppositeSeeds = parseInt(holes[oppositeIndex].querySelector('.score').textContent);

            if(oppositeSeeds > 0){
                //TODO: Wait for seed anim
                this.resetSeedPos(holes[oppositeIndex]);
                await this.sleep(300);
                this.tranferSeed(holes[currIndex], holes[numberOfHoles]);
                await this.sleep(200);
                this.tranferSeed(holes[oppositeIndex], holes[numberOfHoles], oppositeSeeds);
                await this.sleep(200);

                holes[currIndex].querySelector('.score').textContent = 0;
                holes[oppositeIndex].querySelector('.score').textContent = 0;

                const depositeSeeds = parseInt(holes[numberOfHoles].querySelector('.score').textContent);
                holes[numberOfHoles].querySelector('.score').textContent = depositeSeeds + oppositeSeeds + 1;
                scoredPoints+=oppositeSeeds+1;
            } 
        }

        if(scoredPoints>0)
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
        else if(Math.random() > 0.7){
            this.addMsgToChat("Better luck next time");
        }

        //Check if game can still be played: player2
        if(this.checkPossiblePlay(holes.slice(numberOfHoles+1, 2*numberOfHoles+1)))
            return true;

        //Change state to according
        this.removeRemainingSeeds(holes.slice(0, numberOfHoles), holes[numberOfHoles]);
        await this.sleep(300);

        this.changeState(stateEnum.win);
        return false;
    }

    async playHoleP2(index) {
        const holes = this.board.holes;
        const numberOfHoles = this.board.settings.numberOfHoles;

        let nSeeds = parseInt(holes[index].querySelector('.score').textContent);
        if(nSeeds==0) {
            console.debug('No seeds to withdraw');
            return false;
        }

        console.debug('Withdraw', nSeeds, 'seeds');
        holes[index].querySelector('.score').textContent = 0;

        this.resetSeedPos(holes[index]);
        await this.sleep(300);

        let currIndex = index+1;
        let scoredPoints = 0;

        while (nSeeds>1) {
            const currSeeds = parseInt(holes[currIndex].querySelector('.score').textContent);
            holes[currIndex].querySelector('.score').textContent = currSeeds+1;

            //SEED Animation
            this.tranferSeed(holes[index], holes[currIndex]);
            await this.sleep(200);
            
            scoredPoints = currIndex==(holes.length-1) ? scoredPoints+1 : scoredPoints;
            currIndex = (currIndex+1)!=numberOfHoles ? (currIndex+1) % holes.length : numberOfHoles+1;            
            nSeeds--;
        }

        const currSeeds = parseInt(holes[currIndex].querySelector('.score').textContent);
        holes[currIndex].querySelector('.score').textContent = currSeeds+1;
        this.tranferSeed(holes[index], holes[currIndex]);
        await this.sleep(200);

        if(currIndex < numberOfHoles) { //Seed in the enemy side
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
            return true;
        }

        if(currIndex==(holes.length-1)){ //Seed in player deposit
            scoredPoints++;
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");

            //Check if game can still be played: player2
            if(this.checkPossiblePlay(holes.slice(numberOfHoles+1, 2*numberOfHoles+1)))
                return false;

            //Change state to according: Win or lose;
            this.removeRemainingSeeds(holes.slice(0, numberOfHoles), holes[numberOfHoles]);
            await this.sleep(300);

            this.changeState(stateEnum.win);
            return false;
        }

        if(currSeeds==0) { //Steal from player side
            const oppositeIndex = 2*numberOfHoles-currIndex;
            const oppositeSeeds = parseInt(holes[oppositeIndex].querySelector('.score').textContent);

            if(oppositeSeeds > 0){
                const myDeposit = holes.length-1;
                //TODO: Wait for seed anim
                this.resetSeedPos(holes[oppositeIndex]);
                await this.sleep(300);
                this.tranferSeed(holes[currIndex], holes[myDeposit]);
                await this.sleep(200);
                this.tranferSeed(holes[oppositeIndex], holes[myDeposit], oppositeSeeds);
                await this.sleep(200);

                holes[currIndex].querySelector('.score').textContent = 0;
                holes[oppositeIndex].querySelector('.score').textContent = 0;
                
                const depositeSeeds = parseInt(holes[myDeposit].querySelector('.score').textContent);
                holes[myDeposit].querySelector('.score').textContent = depositeSeeds + oppositeSeeds + 1;
                scoredPoints+=oppositeSeeds+1;
            } 
        }

        if(scoredPoints>0)
            this.addMsgToChat(scoredPoints>1 ? scoredPoints + " points in the bag!" : "1 point in the bag!");
        else if(Math.random() > 0.7){
            this.addMsgToChat("Better luck next time");
        }

        //Check if game can still be played: player1
        if(this.checkPossiblePlay(holes.slice(0, numberOfHoles)))
            return true;

        //Change state to according: Win or lose;
        this.removeRemainingSeeds(holes.slice(numberOfHoles+1, -1), holes[holes.length-1]);
        await this.sleep(300);

        this.changeState(stateEnum.win);
        return false;
    }

    checkPossiblePlay(holes) {
        for (const hole of holes) {
            if(hole.querySelector('.score').textContent!="0") return true;
        }
        return false;
    }

    resetSeedPos(hole) {
        const seeds = hole.querySelectorAll('.hole .seed');
        seeds.forEach(seed=>{
            seed.style.left = '40%';
            seed.style.top = '45%';
        });
    }

    tranferSeed(from, to, n=1){
        const hole = from.querySelector('.hole');

        while(n>0){
            const seed = hole.removeChild(from.querySelector('.hole .seed'));
            seed.style.left = (40 + ((Math.random() * 30)-10)) + '%';
            seed.style.top = (45 + ((Math.random() * 40)-20)) + '%';
            
            const holeTo = to.querySelector('.hole');
            holeTo.appendChild(seed);
            n--;
        }
    }

    removeRemainingSeeds(holes, to){
        for (const hole of holes) {
            const nSeeds = hole.querySelectorAll('.hole .seed').length;
            if(nSeeds == 0) continue;
            
            //TODO: Wait for seed anim
            hole.querySelector('.score').textContent = 0;
            this.resetSeedPos(hole); 
            this.tranferSeed(hole, to, nSeeds);

            const currSeeds = parseInt(to.querySelector('.score').textContent);
            to.querySelector('.score').textContent = currSeeds + nSeeds;
        }
    }

    addMsgToChat = (text) => {
        const className = (this.gameState == stateEnum.player1Turn ) ? 'player-msg' : 'opponent-msg';
        const newElem = document.createElement('p');
        newElem.classList.add(className);
        const node = document.createTextNode(text);
        newElem.append(node);
        const chat = document.getElementById('chat');
        chat.prepend(newElem);
        chat.scrollTop = chat.scrollHeight;
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
