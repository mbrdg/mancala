//Hamburguer & Menu Animation
const hamburguer=document.querySelector('header nav .nav-list .hamburguer');
const menu=document.querySelector('header nav .nav-list ul');
const menu_item=document.querySelectorAll('header nav .nav-list ul li a');

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

menu_item.forEach((item) => {
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
        header.style.backgroundColor = "#6F2232"
    }else {
        header.style.backgroundColor = "transparent"
    }
});