/**
 * @file Projectile.ts
 * @description Implements the projectile system for enemy attacks
 * @module entities/Projectile
 */

import { Vector2 } from '../types/Vector2';
import { GameObject } from '../core/GameObject';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ProjectileConfig } from '../types/ProjectileConfig';

/**
 * Represents the state of a projectile
 */
export enum ProjectileState {
  ACTIVE = 'active',
  DESTROYED = 'destroyed',
  EXPIRED = 'expired'
}

/**
 * Configuration constants for projectiles
 */
const PROJECTILE_DEFAULTS = {
  MAX_LIFETIME: 5000, // milliseconds
  DEFAULT_SPEED: 200,
  DEFAULT_DAMAGE: 10
};

/**
 * Represents a projectile entity in the game
 * Handles movement, collision, and lifecycle of projectiles
 */
export class Projectile extends GameObject {
  private velocity: Vector2;
  private damage: number;
  private creationTime: number;
  private lifetime: number;
  private state: ProjectileState;

  /**
   * Creates a new Projectile instance
   * @param config - Configuration options for the projectile
   */
  constructor(config: ProjectileConfig) {
    super({
      position: config.position,
      dimensions: config.dimensions
    });

    this.velocity = config.velocity || { x: 0, y: PROJECTILE_DEFAULTS.DEFAULT_SPEED };
    this.damage = config.damage || PROJECTILE_DEFAULTS.DEFAULT_DAMAGE;
    this.lifetime = config.lifetime || PROJECTILE_DEFAULTS.MAX_LIFETIME;
    this.creationTime = Date.now();
    this.state = ProjectileState.ACTIVE;
  }

  /**
   * Updates the projectile's position and checks for lifetime expiration
   * @param deltaTime - Time elapsed since last update in seconds
   */
  public update(deltaTime: number): void {
    try {
      if (this.state !== ProjectileState.ACTIVE) {
        return;
      }

      // Update position
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;

      // Check lifetime
      if (this.hasExpired()) {
        this.state = ProjectileState.EXPIRED;
        this.destroy();
      }
    } catch (error) {
      console.error('Error updating projectile:', error);
      this.destroy();
    }
  }

  /**
   * Handles collision with other game objects
   * @param other - The object this projectile collided with
   */
  public onCollision(other: GameObject): void {
    try {
      if (this.state !== ProjectileState.ACTIVE) {
        return;
      }

      // Handle damage application to the other object if it has health
      if ('takeDamage' in other) {
        (other as any).takeDamage(this.damage);
      }

      this.destroy();
    } catch (error) {
      console.error('Error handling projectile collision:', error);
      this.destroy();
    }
  }

  /**
   * Checks if the projectile has exceeded its lifetime
   * @returns boolean indicating if the projectile has expired
   */
  private hasExpired(): boolean {
    return Date.now() - this.creationTime >= this.lifetime;
  }

  /**
   * Destroys the projectile and marks it for removal
   */
  public destroy(): void {
    this.state = ProjectileState.DESTROYED;
    this.emit('destroyed');
  }

  /**
   * Gets the current state of the projectile
   * @returns The current ProjectileState
   */
  public getState(): ProjectileState {
    return this.state;
  }

  /**
   * Gets the damage value of the projectile
   * @returns The damage amount
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * Checks if the projectile is still active
   * @returns boolean indicating if the projectile is active
   */
  public isActive(): boolean {
    return this.state === ProjectileState.ACTIVE;
  }
}