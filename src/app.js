import { setUpAnimations, signInAnimation } from './animations.js';
import Game from './game.js';
import ServerApi from "./serverApi.js";

setUpAnimations();

// HTML Elements
const play = document.querySelector('#play');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');

let api = new ServerApi();
let game = new Game();

const playButton = document.querySelector('#play .welcome-menu #play-btn');
playButton.addEventListener('click', () => {
    game.setup();
    welcomeMenu.style.display = "none";
    gameMenu.classList.toggle('active');
    play.scrollIntoView();
});

const continueButton = document.getElementById('continue-btn');
continueButton.addEventListener('click', () => {
    game.reset();
    play.scrollIntoView();
});

const signInForm = document.getElementById('sign-form');
signInForm.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const nick = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(!nick || !pass) return;
    const res = await api.register(nick, pass);
    
    if (res!=nick) {
        alert(res);
        return;
    }
    
    game.setPlayerInfo({nick, pass});
    signInAnimation(nick);
})
