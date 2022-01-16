import { setUpAnimations, signInAnimation } from './animations.js';
import { setUpCanvas } from './canvas.js';
import Api from "./api.js";
import HighScores from "./highscores.js";
import Game from './game.js';

setUpAnimations();
setUpCanvas();

// HTML Elements
const play = document.querySelector('#play');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');

let api = new Api('http://twserver.alunos.dcc.fc.up.pt:8976/');
let highScores = new HighScores(api);
let game = new Game(api, highScores);

const playButton = document.querySelector('#play .welcome-menu #play-btn');
playButton.addEventListener('click', async () => {
    game.setup();

    if (game.board.settings.online) {
        if (api.credentials === undefined) {
            alert("User not registered");
            game.reset();
            return;
        }

        const response = await api.join(game.board.settings);
        if (response === undefined) {
            alert("Server issue");
            game.reset();
            return;
        }

        document.querySelector('#play .wait-menu').classList.add('active');
        api.update(game.joinHandler.bind(game));
    }
    welcomeMenu.style.display = "none";
    gameMenu.classList.add('active');
    play.scrollIntoView();
});

// Reset buttons
const waitButton = document.getElementById('wait-btn');
const continueButton = document.getElementById('continue-btn');

waitButton.addEventListener('click', async (e)=>{
    if (e.isTrusted){
        await api.leave();
    }
    game.reset();
    play.scrollIntoView();
});

continueButton.addEventListener('click', () => {
    game.reset();
    play.scrollIntoView();
});

// Sign-in form
const signInForm = document.getElementById('sign-form');
signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nick = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (!nick || !pass) {
        console.error('Invalid nickname or password.');
        return;
    }

    const response = await api.register(nick, pass);

    if (response !== nick) {
        alert(response);
        return;
    }

    signInAnimation(nick);
})
