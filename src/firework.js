import Particle from "./particle.js";

export default class Firework {
    /**
     * Constructor
     * @param sx - starting x position
     * @param sy - starting y position
     * @param tx - final x position
     * @param ty - final y position
     * @param particlesList - list of existing particles
     */
    constructor(sx, sy, tx, ty, particlesList) {
        // current coords / start coords / target coords
        this.coords = {
            currX: sx, 
            currY: sy, 
            startX: sx, 
            startY: sy, 
            endX: tx, 
            endY: ty
        };
        
        this.distanceToTarget = this.calculateDistance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        
        // past firework coordinates (trail effect)
        this.coordinates = [];

        const populateCoordinateCollection = (coordinateCount) => {
            while (coordinateCount--) {
                this.coordinates.push([this.coords.currX, this.coords.currY]);
            }
        }
        populateCoordinateCollection(4);

        const random = ( min, max ) => {
            return Math.random() * ( max - min ) + min;
        }
        
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        
        this.targetRadius = 1;

        this.particlesList = particlesList;
    }

    /**
     * Function which updates firework position
     * @param hue - particle base hue value
     * @returns true if firework reached the desired position, false otherwise
     */
    update(hue) {
        this.coordinates.pop();
        this.coordinates.unshift( [ this.coords.currX, this.coords.currY ] );
        
        if( this.targetRadius < 8 ) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }
        
        this.speed *= this.acceleration;
        
        const vx = Math.cos( this.angle ) * this.speed;
        const vy = Math.sin( this.angle ) * this.speed;
        
        this.distanceTraveled = this.calculateDistance( this.coords.startX, this.coords.startY, this.coords.currX + vx, this.coords.currY + vy );
        
        if( this.distanceTraveled >= this.distanceToTarget ) {
            this.createParticles( this.coords.endX, this.coords.endY, hue );
            
            return true;
        } else {
            this.coords.currX += vx;
            this.coords.currY += vy;
        }

        return false;
    }

    /**
     * Draws firework
     * @param ctx - canvas context
     * @param hue - current applied hue
     */
    draw(ctx, hue) {
        ctx.beginPath();
        
        ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
        ctx.lineTo( this.coords.currX, this.coords.currY );
        ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();
        
        ctx.beginPath();
        // draw the target for this firework with a pulsing circle
        ctx.arc( this.coords.endX, this.coords.endY, this.targetRadius, 0, Math.PI * 2 );
        ctx.stroke();
    }

    /**
     * Calculates the distance between two points
     * @param p1x - p1 x position
     * @param p1y - p1 y position
     * @param p2x - p2 x position 
     * @param p2y - p2 y position 
     * @returns distance between p1 and p2
     */
    calculateDistance( p1x, p1y, p2x, p2y ) {
        let xDistance = p1x - p2x,
                yDistance = p1y - p2y;
        return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
    }

    /**
     * Creates 30 new particles relative the the firework
     * @param x - particle initial x position
     * @param y - particle initial y position
     * @param hue - particle base hue value
     */
    createParticles( x, y, hue ) {
        let particleCount = 30;
        while( particleCount-- ) {
            this.particlesList.push( new Particle( x, y, hue ) );
        }
    }
}