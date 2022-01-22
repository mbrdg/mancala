/**
 * Animation setter for app flow
 */
export function setUpAnimations() {
    hamburguerAnimation();
    navBarScrollAnimation();
    navBarButtonAnimation();
    welcomeMenuButtonsAnimation();
    gameBoardButtonsAnimation();
    setDifficultyAnimation();
    moreSettingsAnimations();
    waitMenuAnimations();
    endMenuAnimations();
    sliderAnimations();
}

const hamburguerAnimation = () => {
    const hamburguer = document.querySelector('header nav .nav-list .hamburguer');
    const menu = document.querySelector('header nav .nav-list ul');
    const menuItem = document.querySelectorAll('header nav .nav-list ul li a');

    hamburguer.addEventListener('click',() => {
        hamburguer.classList.toggle('active');
        menu.classList.toggle('active');
    });

    menuItem.forEach((item) => {
        item.addEventListener('click',() =>{
            hamburguer.classList.toggle('active');
            menu.classList.remove('active');
        })
    });
}

const navBarButtonAnimation = () => {
    const play = document.querySelector('#play');
    const instructions = document.querySelector('#instructions');

    const playButton = document.querySelector('#play-button');
    const instructionsButton = document.querySelector('#instructions-button');

    playButton.addEventListener('click', () => {
        play.classList.remove('active');
        instructions.classList.remove('active');
    });

    instructionsButton.addEventListener('click', () => {
        play.classList.add('active');
        instructions.classList.add('active');
    });
}

const navBarScrollAnimation = () => {
    let lastScrollTop = 0;
    const header = document.querySelector('#header');
    const menu=document.querySelector('header nav .nav-list ul');

    const instructions = document.querySelector('#instructions');
    const moreSettingsMenu = document.querySelector('#play .more-settings');
    const pauseMenu = document.querySelector('#play .pause-menu');


    document.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            menu.classList.remove('active');
            header.style.top="-12vh";
        } else {
            header.style.top="0";
        }
        lastScrollTop = scrollTop;
        
        if (moreSettingsMenu.classList.contains('active') || pauseMenu.classList.contains('active') || instructions.classList.contains('active')) {
            menu.classList.remove('active');
            header.style.top="-12vh";
        }   
    });
}

const welcomeMenuButtonsAnimation = ()=>{
    const play = document.querySelector('#play');
    const instructions = document.querySelector('#instructions');

    const welcomeMenu = document.querySelector('#play .welcome-menu');
    const moreSettingsMenu = document.querySelector('#play .more-settings');

    const instructionsBtn = document.querySelector('#play .welcome-menu #instructions-btn');
    const moreSettingsBtn = document.querySelector('#play .welcome-menu #more-settings-btn');
    const closeInstructions = document.querySelector('#instructions #closeInstructions');
    const closeMoreSettingsBtn = document.querySelector('#play .more-settings #save-btn');


    //Instructions
    instructionsBtn.addEventListener('click', () => {
        play.classList.toggle('active');
        instructions.classList.toggle('active');
        instructions.scrollIntoView();
    });
    closeInstructions.addEventListener('click',() => {
        play.classList.toggle('active');
        instructions.classList.toggle('active');
        play.scrollIntoView();
    });

    //More Settings
    moreSettingsBtn.addEventListener('click',() => {
        play.scrollIntoView();
        welcomeMenu.classList.toggle('active');
        moreSettingsMenu.classList.toggle('active');
    });
    closeMoreSettingsBtn.addEventListener('click',() => {
        welcomeMenu.classList.toggle('active');
        moreSettingsMenu.classList.toggle('active');
    });
}

const gameBoardButtonsAnimation = ()=>{
    const play = document.querySelector('#play');

    const game = document.querySelector('#play .game');
    const pauseMenu = document.querySelector('#play .pause-menu');

    const pauseMenuBtn = document.querySelector('#play .gameboard #pause-btn');
    const continuePlaying = document.querySelector('#play .pause-menu #resume-btn');
    const giveUp = document.querySelector('#play .pause-menu #leave-btn');

    pauseMenuBtn.addEventListener('click',() => {
        play.scrollIntoView();
        game.classList.toggle('disable');
        pauseMenu.classList.toggle('active');
    });
    continuePlaying.addEventListener('click',() => {
        play.scrollIntoView();
        pauseMenu.classList.toggle('active');
        game.classList.toggle('disable');
    });
    giveUp.addEventListener('click',() => {
        pauseMenu.classList.toggle('active');
        game.classList.toggle('disable');
    });
}

const setDifficultyAnimation = ()=>{
    const difficultyLevel = document.getElementById('difficulty');
    const pvpMode = document.getElementById('pvp');
    const singleMode = document.getElementById('single');

    difficultyLevel.onchange = () => {
        difficultyLevel.selectedIndex > 1 ? singleMode.checked=true  : pvpMode.checked=true;
    };
    pvpMode.addEventListener('click', () => {
        difficultyLevel.selectedIndex = difficultyLevel.selectedIndex > 1 ? 0 : difficultyLevel.selectedIndex;
    });
    singleMode.addEventListener('click', () => {
        difficultyLevel.selectedIndex = difficultyLevel.selectedIndex > 1 ? difficultyLevel.selectedIndex : 2;
    });
}

const moreSettingsAnimations = () => {
    //Number Holes
    const nHoles = document.getElementById('n-holes');
    const sumHoles = document.querySelector('#number-holes .next');
    const subHoles = document.querySelector('#number-holes .prev');

    sumHoles.addEventListener('click', ()=>{
        if(nHoles.textContent > 8) return;
        nHoles.textContent = (parseInt(nHoles.textContent)+1).toString();
    });
    subHoles.addEventListener('click', ()=>{
        if(nHoles.textContent < 3) return;
        nHoles.textContent = (parseInt(nHoles.textContent)-1).toString();
    });

    //Number Seeds
    const nSeeds = document.getElementById('n-seeds');
    const sumSeeds = document.querySelector('#number-seeds .next');
    const subSeeds = document.querySelector('#number-seeds .prev');

    sumSeeds.addEventListener('click', ()=>{
        if(nSeeds.textContent > 8) return;
        nSeeds.textContent = (parseInt(nSeeds.textContent)+1).toString();
    });
    subSeeds.addEventListener('click', ()=>{
        if(nSeeds.textContent < 3) return;
        nSeeds.textContent = (parseInt(nSeeds.textContent)-1).toString();
    });
}

const waitMenuAnimations = ()=>{
    const waitBtn = document.getElementById('wait-btn');
    const gameMenu = document.querySelector('#play .game');
    const waitMenu = document.querySelector('#play .wait-menu');
    const welcomeMenu = document.querySelector('#play .welcome-menu');

    waitBtn.addEventListener('click', ()=>{
        gameMenu.classList.remove('active');
        waitMenu.classList.remove('active');
        welcomeMenu.style.display = "flex";
    });
}

const endMenuAnimations = () => {
    const continueButton = document.getElementById('continue-btn');
    const endMenu = document.querySelector('#play .end-menu');
    const gameMenu = document.querySelector('#play .game');
    const welcomeMenu = document.querySelector('#play .welcome-menu');

    continueButton.addEventListener('click', () => {
        gameMenu.classList.remove('active');
        const images = endMenu.querySelectorAll('.banner img');
        for (const image of images) {
            image.style.visibility = 'hidden';
        }
        welcomeMenu.style.display = "flex";
        endMenu.classList.remove('active');
    });
}

const sliderAnimations = () => {
    const prevButtons  = document.querySelectorAll('#highscores .slide_prev');
    const nextButtons  = document.querySelectorAll('#highscores .slide_next');
    const sliderLinks = document.querySelectorAll('#highscores .slider_navlink')

    prevButtons.forEach(button => {
        button.addEventListener('click', ()=>{
            sliderLinks.forEach((link)=>{
                link.classList.toggle('active');
            });
        });
    })
    nextButtons.forEach(button => {
        button.addEventListener('click', ()=>{
            sliderLinks.forEach((link)=>{
                link.classList.toggle('active');
            });
        });
    })

    sliderLinks.forEach((link,index) => {
        link.addEventListener('click', ()=>{
            if (link.classList.contains('active')) return;

            link.classList.toggle('active');
            const otherIndex = index === 0 ? 1 : 0;
            sliderLinks[otherIndex].classList.toggle('active');
        })
    })
}

export function signInAnimation(name) {
    const signInForm = document.getElementById('sign-form');
    const playerName = document.getElementById('player-name');
    signInForm.classList.add('disable');
    playerName.textContent = name;
    playerName.classList.add('active');
}