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


playButton.addEventListener('click', () => {
    play.scrollIntoView();
    welcomeMenu.style.display = "none";
    gameMenu.classList.toggle('active');

    // Start game with current setting
    game.setupGameConfig();
    game.startGame();
});

const addMsgToChat = (className, text) => {
    const newElem = document.createElement('p');
    newElem.classList.add(className);
    const node = document.createTextNode(text);
    newElem.append(node);
    const chat = document.getElementById('chat');
    chat.prepend(newElem);
    chat.scrollTop = chat.scrollHeight;
}
