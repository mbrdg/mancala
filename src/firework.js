import Particle from "./particle.js";

export default class Firework {
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

    calculateDistance( p1x, p1y, p2x, p2y ) {
        let xDistance = p1x - p2x,
                yDistance = p1y - p2y;
        return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
    }

    createParticles( x, y, hue ) {
        let particleCount = 30;
        while( particleCount-- ) {
            this.particlesList.push( new Particle( x, y, hue ) );
        }
    }
}