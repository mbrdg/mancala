export default class Game {
    constructor(){
        this.name="Default Game"
    }

    setupGameConfig(){
        console.log("Configuring game");
        this.name="Configured game";
    }

    startGame(){
        console.log("Starting game");
        console.log(this.name);
    }
}