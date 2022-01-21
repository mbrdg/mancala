export default class Particle {
    /**
     * Constructor
     * @param x - Initial x position
     * @param y - Initial y position
     * @param hue - Base hue value
     */
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;

        // past particle coordinates (trail effect)
        this.coordinates = [];

        const populateCoordinateCollection = (coordinateCount) => {
            while (coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
        }
        populateCoordinateCollection(5);

        const random = ( min, max ) => {
            return Math.random() * ( max - min ) + min;
        }

        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        this.friction = 0.95;
        this.gravity = 1;
        
        this.hue = random(hue - 50, hue + 50);
        this.brightness = random(50, 80);
        this.alpha = 1;
        
        this.decay = random(0.015, 0.03);
    }

    /**
     * Updates particle position and opacity
     * @returns true if current opacity is bellow the decay value, false otherwise
     */
    update() {
        this.coordinates.pop();
        this.coordinates.unshift( [ this.x, this.y ] );
        
        this.speed *= this.friction;
       
        this.x += Math.cos( this.angle ) * this.speed;
        this.y += Math.sin( this.angle ) * this.speed + this.gravity;
        
        this.alpha -= this.decay;
        
        return this.alpha <= this.decay;
    }

    /**
     * Draws particle
     * @param {CanvasRenderingContext2D} ctx - canvas context
     */
    draw(ctx) {
        ctx.beginPath();
        
        ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
        ctx.lineTo( this.x, this.y );
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }
}