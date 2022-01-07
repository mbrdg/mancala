import { setUpAnimations, signInAnimation } from './animations.js';
import Game from './game.js';
import ServerApi from "./serverApi.js";

setUpAnimations();

// HTML Elements
const play = document.querySelector('#play');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');

let api = new ServerApi('http://twserver.alunos.dcc.fc.up.pt:8008/');
let game = new Game();

const playButton = document.querySelector('#play .welcome-menu #play-btn');
playButton.addEventListener('click', () => {
    game.setup();
    if (game.board.settings.online) {
        if (api.credentials === undefined) {
            alert("User not registered");
            game.reset();
            return;
        }
        api.join(game.board.settings);
        document.querySelector('#play .wait-menu').classList.add('active');
    }
    welcomeMenu.style.display = "none";
    gameMenu.classList.add('active');
    play.scrollIntoView();
});

// Reset buttons
const waitBtn = document.getElementById('wait-btn');
const continueButton = document.getElementById('continue-btn');

waitBtn.addEventListener('click', async ()=>{
    await api.leave();
    game.reset();
    play.scrollIntoView();
});

continueButton.addEventListener('click', () => {
    game.reset();
    play.scrollIntoView();
});

// Sign-in form
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
    
    signInAnimation(nick);
})
