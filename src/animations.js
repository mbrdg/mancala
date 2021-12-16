export function setUpAnimations() {

    hamburguerAnimation();
    navBarScrollAnimation();
    navBarButtonAnimation();
    welcomeMenuButtonsAnimation();
    setDifficultyAnimation();
    moreSettingsAnimations();
}

const hamburguerAnimation = ()=>{
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
}

const navBarButtonAnimation = ()=>{
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
}

const navBarScrollAnimation = ()=>{
    let lastScrollTop = 0;
    const header = document.querySelector('#header');
    const moreSettingsMenu = document.querySelector('#play .more-settings');

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

    //More Settings
    moreSettingsBtn.addEventListener('click',() => {
        play.scrollIntoView();
        welcomeMenu.classList.toggle('active');
        moreSettingsMenu.classList.toggle('active');
        document.body.style.overflow = 'hidden';
    });
    closeMoreSettingsBtn.addEventListener('click',() => {
        welcomeMenu.classList.toggle('active');
        moreSettingsMenu.classList.toggle('active');
        document.body.style.overflow = 'visible';
    });
}

const setDifficultyAnimation = ()=>{
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
}

const moreSettingsAnimations = ()=>{
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