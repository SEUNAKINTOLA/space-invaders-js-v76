/**
 * @file Projectile.ts
 * @description Implements projectile entity and mechanics for shooting system
 * @module entities/Projectile
 */

import { Vector2 } from '../types/Vector2';

/**
 * Configuration constants for projectile behavior
 */
const PROJECTILE_CONFIG = {
  DEFAULT_SPEED: 500,
  DEFAULT_LIFETIME: 3000, // milliseconds
  DEFAULT_DAMAGE: 10,
  MIN_SPEED: 100,
  MAX_SPEED: 2000,
} as const;

/**
 * Interface defining projectile properties
 */
interface ProjectileOptions {
  position: Vector2;
  direction: Vector2;
  speed?: number;
  damage?: number;
  lifetime?: number;
  onHit?: (target: any) => void;
}

/**
 * Represents a projectile entity in the game
 * Handles movement, collision detection, and damage dealing
 */
export class Projectile {
  private position: Vector2;
  private direction: Vector2;
  private speed: number;
  private damage: number;
  private lifetime: number;
  private createdAt: number;
  private onHit?: (target: any) => void;
  private active: boolean = true;

  /**
   * Creates a new projectile instance
   * @param options - Configuration options for the projectile
   * @throws {Error} If invalid position or direction is provided
   */
  constructor(options: ProjectileOptions) {
    this.validateOptions(options);

    this.position = { ...options.position };
    this.direction = this.normalizeDirection(options.direction);
    this.speed = options.speed || PROJECTILE_CONFIG.DEFAULT_SPEED;
    this.damage = options.damage || PROJECTILE_CONFIG.DEFAULT_DAMAGE;
    this.lifetime = options.lifetime || PROJECTILE_CONFIG.DEFAULT_LIFETIME;
    this.createdAt = Date.now();
    this.onHit = options.onHit;
  }

  /**
   * Updates the projectile's position and checks lifetime
   * @param deltaTime - Time elapsed since last update in seconds
   * @returns boolean indicating if the projectile is still active
   */
  public update(deltaTime: number): boolean {
    if (!this.active) return false;

    // Check lifetime
    if (this.isExpired()) {
      this.deactivate();
      return false;
    }

    // Update position
    this.position.x += this.direction.x * this.speed * deltaTime;
    this.position.y += this.direction.y * this.speed * deltaTime;

    return true;
  }

  /**
   * Handles collision with a target
   * @param target - The entity the projectile collided with
   */
  public handleCollision(target: any): void {
    if (!this.active) return;

    if (this.onHit) {
      try {
        this.onHit(target);
      } catch (error) {
        console.error('Error in projectile onHit callback:', error);
      }
    }

    this.deactivate();
  }

  /**
   * Gets the current position of the projectile
   * @returns Current position vector
   */
  public getPosition(): Vector2 {
    return { ...this.position };
  }

  /**
   * Gets the damage value of the projectile
   * @returns Damage amount
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * Checks if the projectile is still active
   * @returns Active status
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Validates constructor options
   * @param options - Options to validate
   * @throws {Error} If options are invalid
   */
  private validateOptions(options: ProjectileOptions): void {
    if (!options.position || typeof options.position.x !== 'number' || typeof options.position.y !== 'number') {
      throw new Error('Invalid position provided to Projectile');
    }

    if (!options.direction || typeof options.direction.x !== 'number' || typeof options.direction.y !== 'number') {
      throw new Error('Invalid direction provided to Projectile');
    }

    if (options.speed && (options.speed < PROJECTILE_CONFIG.MIN_SPEED || options.speed > PROJECTILE_CONFIG.MAX_SPEED)) {
      throw new Error(`Speed must be between ${PROJECTILE_CONFIG.MIN_SPEED} and ${PROJECTILE_CONFIG.MAX_SPEED}`);
    }
  }

  /**
   * Normalizes the direction vector to have a magnitude of 1
   * @param direction - Direction vector to normalize
   * @returns Normalized direction vector
   */
  private normalizeDirection(direction: Vector2): Vector2 {
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude === 0) return { x: 1, y: 0 };
    
    return {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
  }

  /**
   * Checks if the projectile has exceeded its lifetime
   * @returns boolean indicating if the projectile has expired
   */
  private isExpired(): boolean {
    return Date.now() - this.createdAt >= this.lifetime;
  }

  /**
   * Deactivates the projectile
   */
  private deactivate(): void {
    this.active = false;
  }
}