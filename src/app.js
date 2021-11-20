const body = document.body;
const play = document.querySelector('#play');
const instructions = document.querySelector('#instructions');

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


//Hamburguer & Menu Animation
const hamburguer=document.querySelector('header nav .nav-list .hamburguer');
const menu=document.querySelector('header nav .nav-list ul');
const menuItem=document.querySelectorAll('header nav .nav-list ul li a');

hamburguer.addEventListener('click',() => {
    hamburguer.classList.toggle('active');
    if(menu.classList.contains('active')){
        menu.classList.remove('active');
        menu.classList.toggle('inactive');
    } 
    else {
        menu.classList.remove('inactive');
        menu.classList.toggle('active');
    }
});

menuItem.forEach((item) => {
    item.addEventListener('click',()=>{
        hamburguer.classList.toggle('active');
        menu.classList.remove('active');
        menu.classList.toggle('inactive');
    })
});

//Header background-change
const header=document.querySelector('header')

document.addEventListener('scroll',()=>{
    var scroll_position = window.scrollY;
    if(scroll_position>230){
        header.style.backgroundColor = "transparent";//"#6F2232"
    }else {
        header.style.backgroundColor = "transparent";
    }
});

//Play
const welcomeMenu = document.querySelector('#play .welcome-menu');
const gameMenu = document.querySelector('#play .game');
const moreSettingsMenu = document.querySelector('#play .more-settings');

const moreSettingsBtn = document.querySelector('#play .welcome-menu #more-settings-btn');
const playBtn = document.querySelector('#play .welcome-menu #play-btn');
const instructionsBtn = document.querySelector('#play .welcome-menu #instructions-btn');
const closeBtn = document.querySelector('#play .more-settings .close-settings');

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

moreSettingsBtn.addEventListener('click',() => {
    play.scrollIntoView();
    welcomeMenu.classList.toggle('active');
    moreSettingsMenu.classList.toggle('active');
    body.style.overflow = 'hidden';
});
closeBtn.addEventListener('click',() => {
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