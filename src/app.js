import { setUpAnimations } from './animations.js';
import Game from './game.js';

setUpAnimations();

//Create Game
let game = new Game();

//HTML Elements
const play = document.querySelector('#play');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');
const playButton = document.querySelector('#play .welcome-menu #play-btn');
const continueButton = document.getElementById('continue-btn');

playButton.addEventListener('click', () => {
    welcomeMenu.style.display = "none";
    gameMenu.classList.toggle('active');

    // Start game with current setting
    game.setupGameConfig();
    game.startGame();
    play.scrollIntoView();
});

continueButton.addEventListener('click', ()=>{
    game.resetGame();
    play.scrollIntoView();
});
