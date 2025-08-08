/**
 * @file ParticleSystem.ts
 * @description Manages particle effects system for visual effects rendering.
 * Handles particle creation, updating, and lifecycle management.
 * 
 * @module ParticleSystem
 * @author AI Assistant
 * @date 2024-01-10
 */

// Types and interfaces
interface Vector2D {
    x: number;
    y: number;
}

interface ParticleConfig {
    position: Vector2D;
    velocity: Vector2D;
    color: string;
    size: number;
    lifetime: number;
    alpha?: number;
}

interface ParticleSystemConfig {
    maxParticles: number;
    emissionRate: number;
    particleLifetime: number;
}

/**
 * Represents a single particle in the system
 */
class Particle {
    private position: Vector2D;
    private velocity: Vector2D;
    private color: string;
    private size: number;
    private lifetime: number;
    private alpha: number;
    private age: number;

    constructor(config: ParticleConfig) {
        this.position = { ...config.position };
        this.velocity = { ...config.velocity };
        this.color = config.color;
        this.size = config.size;
        this.lifetime = config.lifetime;
        this.alpha = config.alpha ?? 1.0;
        this.age = 0;
    }

    /**
     * Updates particle state based on delta time
     * @param deltaTime Time elapsed since last update in seconds
     * @returns boolean indicating if particle is still alive
     */
    public update(deltaTime: number): boolean {
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            return false;
        }

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update alpha based on lifetime
        this.alpha = 1 - (this.age / this.lifetime);

        return true;
    }

    /**
     * Renders the particle to the provided context
     */
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Manages particle system lifecycle and rendering
 */
export class ParticleSystem {
    private particles: Particle[];
    private config: ParticleSystemConfig;
    private lastEmissionTime: number;

    constructor(config: ParticleSystemConfig) {
        this.validateConfig(config);
        this.particles = [];
        this.config = { ...config };
        this.lastEmissionTime = 0;
    }

    /**
     * Validates particle system configuration
     * @throws Error if configuration is invalid
     */
    private validateConfig(config: ParticleSystemConfig): void {
        if (config.maxParticles <= 0) {
            throw new Error('maxParticles must be greater than 0');
        }
        if (config.emissionRate <= 0) {
            throw new Error('emissionRate must be greater than 0');
        }
        if (config.particleLifetime <= 0) {
            throw new Error('particleLifetime must be greater than 0');
        }
    }

    /**
     * Emits a new particle with the given configuration
     */
    public emit(config: ParticleConfig): void {
        if (this.particles.length >= this.config.maxParticles) {
            return;
        }

        try {
            const particle = new Particle(config);
            this.particles.push(particle);
        } catch (error) {
            console.error('Failed to create particle:', error);
        }
    }

    /**
     * Updates all particles in the system
     * @param deltaTime Time elapsed since last update in seconds
     */
    public update(deltaTime: number): void {
        if (deltaTime <= 0) return;

        // Update existing particles
        this.particles = this.particles.filter(particle => particle.update(deltaTime));

        // Update emission timing
        this.lastEmissionTime += deltaTime;
    }

    /**
     * Renders all particles to the provided context
     */
    public render(ctx: CanvasRenderingContext2D): void {
        if (!ctx) {
            console.error('Invalid rendering context');
            return;
        }

        try {
            this.particles.forEach(particle => particle.render(ctx));
        } catch (error) {
            console.error('Error rendering particles:', error);
        }
    }

    /**
     * Clears all particles from the system
     */
    public clear(): void {
        this.particles = [];
        this.lastEmissionTime = 0;
    }

    /**
     * Returns the current number of active particles
     */
    public getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * Returns whether the particle system is at capacity
     */
    public isAtCapacity(): boolean {
        return this.particles.length >= this.config.maxParticles;
    }
}

// Export additional types for external use
export type { Vector2D, ParticleConfig, ParticleSystemConfig };