import { Sound } from '../core/Sound';
import { Vector2 } from '../types/Vector2';
import { Projectile } from './Projectile';

/**
 * Represents a player entity in the game
 * @class Player
 */
export class Player {
    private position: Vector2;
    private velocity: Vector2;
    private readonly shootSound: Sound;
    private readonly shootCooldown: number = 250; // ms
    private lastShootTime: number = 0;

    /**
     * Creates a new Player instance
     * @param initialPosition - Starting position of the player
     */
    constructor(initialPosition: Vector2) {
        this.position = initialPosition;
        this.velocity = { x: 0, y: 0 };
        
        // Initialize shoot sound
        try {
            this.shootSound = new Sound('assets/sounds/shoot.wav');
        } catch (error) {
            console.error('Failed to load shoot sound:', error);
            // Provide a null sound object as fallback
            this.shootSound = {
                play: () => {},
                stop: () => {},
                isPlaying: false
            };
        }
    }

    /**
     * Handles player shooting action
     * @returns {Projectile | null} The created projectile or null if shooting is on cooldown
     */
    public shoot(): Projectile | null {
        const currentTime = Date.now();
        
        // Check if enough time has passed since last shot
        if (currentTime - this.lastShootTime < this.shootCooldown) {
            return null;
        }

        try {
            // Play shoot sound effect
            this.shootSound.play()
                .catch(error => console.warn('Failed to play shoot sound:', error));

            // Update last shoot time
            this.lastShootTime = currentTime;

            // Create and return new projectile
            return new Projectile({
                x: this.position.x,
                y: this.position.y
            });

        } catch (error) {
            console.error('Error during shoot action:', error);
            return null;
        }
    }

    /**
     * Updates the player's position based on current velocity
     * @param deltaTime - Time elapsed since last update
     */
    public update(deltaTime: number): void {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    /**
     * Gets the current position of the player
     * @returns {Vector2} Current position
     */
    public getPosition(): Vector2 {
        return { ...this.position };
    }

    /**
     * Sets the player's velocity
     * @param velocity - New velocity vector
     */
    public setVelocity(velocity: Vector2): void {
        this.velocity = { ...velocity };
    }
}