import { setUpAnimations } from './animations.js';
import Game from './game.js';

setUpAnimations();

//Create Game
let game = new Game;

//HTML Elements
const play = document.querySelector('#play');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');
const playBtn = document.querySelector('#play .welcome-menu #play-btn');


playBtn.addEventListener('click',()=>{
    play.scrollIntoView();
    welcomeMenu.style.display = "none";
    gameMenu.classList.toggle('active');

    //Start game with current settings
    game.setupGameConfig();
    game.startGame();
});

//Header background-change
/* const headerV=document.querySelector('header')

document.addEventListener('scroll',()=>{
    var scroll_position = window.scrollY;
    if(scroll_position>230){
        headerV.style.backgroundColor = "#6F2232";
    }else {
        headerV.style.backgroundColor = "#6F2232";
    }
}); */

const addMsgToChat = (className, text) => {
    const newElem = document.createElement('p');
    newElem.classList.add(className);
    const node = document.createTextNode(text);
    newElem.append(node);
    const chat = document.getElementById('chat');
    chat.prepend(newElem);
    chat.scrollTop=chat.scrollHeight;
}
/* const testBtn = document.getElementById("theB");
testBtn.addEventListener('click',()=>addMsgToChat("player-msg", "Hello Mike G")); */