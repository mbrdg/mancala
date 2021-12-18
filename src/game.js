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
            this.changeState(stateEnum.player1Turn);
            return;
        }
        
        const className = this.gameState == stateEnum.player1Turn ? '.my-hole .hole' : '.enemy-hole .hole';
        const holes =  document.querySelectorAll(className);
        holes.forEach(hole=>{
            hole.classList.add('active');
        });
    }

    changeState(newState) {
        if(newState==stateEnum.giveUp || newState==stateEnum.botTurn) {

            const className = this.gameState == stateEnum.player1Turn ? '.my-hole .hole' : '.enemy-hole .hole';
            const holes =  document.querySelectorAll(className);

            this.removeClassNameFromList(holes, 'active');

            if(newState==stateEnum.botTurn) {
                console.log('bot play');
                this.changeState(stateEnum.player1Turn);
                return;
            }//Test: Bot Play
            
            if(newState==stateEnum.giveUp) //Handle give up
                console.log("someone gave up");

            this.gameState = newState;
            return;
        }
        
        this.gameState = newState;
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

    handleHoleClick(index) {
        //Index seen from: left my-hole -> my-deposit -> right enemy-hole -> enemy-deposit

        switch (this.gameState) {
            case stateEnum.player1Turn:
                if(index >= this.board.settings.numberOfHoles) return;
                //if(!this.playHole(index)) return;
                
                this.changeState(this.board.settings.pvp ? stateEnum.player2Turn : stateEnum.botTurn); 
                break;
            case stateEnum.player2Turn:
                if(index < this.board.settings.numberOfHoles) return;
                //if(!this.playHole(index)) return;

                this.changeState(stateEnum.player1Turn);
                break;
            default:
                break;
        }
    }

    playHole(index) {
        console.log("has seeds");
        return true;
        /* const holes1 = this.board.settings.playerTurn ? document.querySelectorAll('.my-hole') : document.querySelectorAll('.enemy-hole');

        if(!holes1[index].querySelector('.score').textContent) {
            return;
        }
        
        holes1[index].querySelector('.score').textContent = 0;
        //this.removeClickListener(holes1, '.hole');
        console.log(this.board.settings.playerTurn);
        this.board.settings.playerTurn = !this.board.settings.playerTurn;
        console.log(this.board.settings.playerTurn); */
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

}
