import Firework from "./firework.js";

/**
 * Function that sets up the canvas for the end game,
 * associates the loop event according to the animation frame
 */
export function setUpCanvas() {
    window.requestAnimFrame = ( function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function( callback ) {
                window.setTimeout( callback, 1000 / 60 );
            };
    })();

    const canvas = document.getElementById( 'canvas' );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext( '2d' );

    const fireworks = [];
    const particles = [];
    let hue = 120;

    const timerTotal = 60;
    let timerTick = 0;
    

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })
    
    const loop = () => {
        requestAnimFrame( loop );
        
        const endMenu = document.querySelector('#play .end-menu');
        if (!endMenu.classList.contains('active')) 
            return;

        const random = ( min, max ) => {
            return Math.random() * ( max - min ) + min;
        }
        hue = random(0, 360);
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect( 0, 0, canvas.width, canvas.height );
        ctx.globalCompositeOperation = 'lighter';
        
        let index = fireworks.length;
        while( index-- ) {
            fireworks[index].draw(ctx, hue);
            if (fireworks[index].update(hue)) {
                fireworks.splice( index, 1);
            };
        }
        
        index = particles.length;
        while( index-- ) {
            particles[index].draw(ctx);
            if (particles[index].update()) {
                particles.splice( index, 1 );
            };
        }
        
        if( timerTick >= timerTotal ) {	
            fireworks.push( new Firework( random(canvas.width / 4, (3 * canvas.width) / 4) , canvas.height, random( 0, canvas.width ), random( 0, canvas.height / 2 ), particles ) );
            timerTick = 0;
        } else {
            timerTick++;
        }
        
    }

    window.onload = loop;
}