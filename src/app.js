import { setUpAnimations, signInAnimation } from './animations.js';
import Game from './game.js';

setUpAnimations();

//Create Game
let game = new Game();

//HTML Elements
const play = document.querySelector('#play');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');
const playButton = document.querySelector('#play .welcome-menu #play-btn');

playButton.addEventListener('click', async () => {

    // Start game with current configuration
    game.setupGameConfig();
    const res = await game.startGame();
    
    if(!res) { //Case of error
        alert("User not registered");
        game.resetGame();
        return;
    }

    welcomeMenu.style.display = "none";
    gameMenu.classList.add('active');
    play.scrollIntoView();
});

// Reset buttons
const waitBtn = document.getElementById('wait-btn');
const continueButton = document.getElementById('continue-btn');

waitBtn.addEventListener('click', ()=>{
    game.resetGame();
    play.scrollIntoView();
});

continueButton.addEventListener('click', ()=>{
    game.resetGame();
    play.scrollIntoView();
});

// Sign-in form
const signInForm = document.getElementById('sign-form');
signInForm.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const nick = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(!nick || !pass) return;
    const res = await game.api.register(nick, pass);
    
    if(res!=nick) {
        alert(res);
        return;
    }
    
    game.setPlayerInfo({nick, pass});
    signInAnimation(nick);
})
