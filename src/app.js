const body = document.body;
const header = document.querySelector('#header');
const play = document.querySelector('#play');
const instructions = document.querySelector('#instructions');

const moreSettingsMenu = document.querySelector('#play .more-settings');
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');

const moreSettingsBtn = document.querySelector('#play .welcome-menu #more-settings-btn');
const playBtn = document.querySelector('#play .welcome-menu #play-btn');
const instructionsBtn = document.querySelector('#play .welcome-menu #instructions-btn');
const saveBtn = document.querySelector('#play .more-settings #save-btn');
const closeInstructions = document.querySelector('#instructions #closeInstructions');

//NavBar
const playButton = document.querySelector('#play-button');
const instructionsButton = document.querySelector('#instructions-button');

playButton.addEventListener('click', ()=>{
    play.classList.remove('active');
    instructions.classList.remove('active');
});
instructionsButton.addEventListener('click', ()=>{
    play.classList.add('active');
    instructions.classList.add('active');
});

let lastScrollTop = 0;
document.addEventListener('scroll', ()=>{
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if(scrollTop > lastScrollTop) {
        header.style.top="-12vh";
    } else {
        header.style.top="0";
    }
    lastScrollTop = scrollTop;
    
    if(moreSettingsMenu.classList.contains('active')) header.style.top="-12vh"; 
});



//Hamburguer & Menu Animation
const hamburguer=document.querySelector('header nav .nav-list .hamburguer');
const menu=document.querySelector('header nav .nav-list ul');
const menuItem=document.querySelectorAll('header nav .nav-list ul li a');

hamburguer.addEventListener('click',() => {
    hamburguer.classList.toggle('active');
    menu.classList.toggle('active');
});

menuItem.forEach((item) => {
    item.addEventListener('click',()=>{
        hamburguer.classList.toggle('active');
        menu.classList.remove('active');
    })
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

//Play

playBtn.addEventListener('click',()=>{
    play.scrollIntoView();
    welcomeMenu.style.display = "none";
    gameMenu.classList.toggle('active');
    /*Start game with specified settings*/
});

//Instructions
instructionsBtn.addEventListener('click', ()=>{
    play.classList.toggle('active');
    instructions.classList.toggle('active');
    instructions.scrollIntoView();

});

closeInstructions.addEventListener('click',()=>{
    play.classList.toggle('active');
    instructions.classList.toggle('active');
    play.scrollIntoView();
});

moreSettingsBtn.addEventListener('click',() => {
    play.scrollIntoView();
    welcomeMenu.classList.toggle('active');
    moreSettingsMenu.classList.toggle('active');
    body.style.overflow = 'hidden';
});
saveBtn.addEventListener('click',() => {
    welcomeMenu.classList.toggle('active');
    moreSettingsMenu.classList.toggle('active');
    body.style.overflow = 'visible';
});

//Difficulty
const difficultyLevel = document.getElementById('difficulty');
const pvpMode = document.getElementById('pvp');
const singleMode = document.getElementById('singleplayer');

difficultyLevel.onchange = ()=>{
    difficultyLevel.selectedIndex > 0 ? singleMode.checked=true  : pvpMode.checked=true;
};
pvpMode.addEventListener('click', ()=>{
    difficultyLevel.selectedIndex = 0;
});
singleMode.addEventListener('click', ()=>{
    difficultyLevel.selectedIndex = 1;
});

//Number Holes
const nHoles = document.getElementById('n-holes');

const sumHoles = document.querySelector('#number-holes .next');
sumHoles.addEventListener('click', ()=>{
    if(nHoles.textContent > 8) return;
    nHoles.textContent = (parseInt(nHoles.textContent)+1).toString();
});
const subHoles = document.querySelector('#number-holes .prev');
subHoles.addEventListener('click', ()=>{
    if(nHoles.textContent < 3) return;
    nHoles.textContent = (parseInt(nHoles.textContent)-1).toString();
});
//Number Seeds
const nSeeds = document.getElementById('n-seeds');

const sumSeeds = document.querySelector('#number-seeds .next');
sumSeeds.addEventListener('click', ()=>{
    if(nSeeds.textContent > 8) return;
    nSeeds.textContent = (parseInt(nSeeds.textContent)+1).toString();
});
const subSeeds = document.querySelector('#number-seeds .prev');
subSeeds.addEventListener('click', ()=>{
    if(nSeeds.textContent < 3) return;
    nSeeds.textContent = (parseInt(nSeeds.textContent)-1).toString();
});