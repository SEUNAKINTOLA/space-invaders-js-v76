/**
 * @file ProjectileManager.ts
 * @description Manages the spawning, updating, and cleanup of enemy projectiles in the game.
 * Handles projectile pooling, collision detection, and lifecycle management.
 */

import { Vector2 } from '../types/Vector2';
import { GameObject } from '../core/GameObject';
import { ObjectPool } from '../utils/ObjectPool';
import { CollisionSystem } from './CollisionSystem';
import { EventEmitter } from '../core/EventEmitter';

/**
 * Configuration for projectile behavior and properties
 */
interface ProjectileConfig {
  speed: number;
  damage: number;
  lifetime: number;
  poolSize: number;
}

/**
 * Represents a single projectile instance
 */
class Projectile extends GameObject {
  private velocity: Vector2;
  private damage: number;
  private isActive: boolean;
  private lifetime: number;
  private elapsedTime: number;

  constructor() {
    super();
    this.velocity = { x: 0, y: 0 };
    this.damage = 0;
    this.isActive = false;
    this.lifetime = 0;
    this.elapsedTime = 0;
  }

  /**
   * Initializes the projectile with specific parameters
   */
  public init(position: Vector2, velocity: Vector2, damage: number, lifetime: number): void {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.damage = damage;
    this.lifetime = lifetime;
    this.elapsedTime = 0;
    this.isActive = true;
  }

  /**
   * Updates the projectile's position and lifetime
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    this.elapsedTime += deltaTime;
    if (this.elapsedTime >= this.lifetime) {
      this.deactivate();
    }
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public getDamage(): number {
    return this.damage;
  }

  public isActiveProjectile(): boolean {
    return this.isActive;
  }
}

/**
 * Manages the lifecycle and behavior of all enemy projectiles
 */
export class ProjectileManager {
  private static instance: ProjectileManager;
  private projectilePool: ObjectPool<Projectile>;
  private config: ProjectileConfig;
  private eventEmitter: EventEmitter;
  private collisionSystem: CollisionSystem;

  private constructor() {
    this.config = {
      speed: 200,
      damage: 10,
      lifetime: 3000,
      poolSize: 100
    };

    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(),
      this.config.poolSize
    );

    this.eventEmitter = EventEmitter.getInstance();
    this.collisionSystem = CollisionSystem.getInstance();

    this.setupEventListeners();
  }

  /**
   * Gets the singleton instance of ProjectileManager
   */
  public static getInstance(): ProjectileManager {
    if (!ProjectileManager.instance) {
      ProjectileManager.instance = new ProjectileManager();
    }
    return ProjectileManager.instance;
  }

  /**
   * Spawns a new projectile from the given position with the specified direction
   */
  public spawnProjectile(position: Vector2, direction: Vector2): void {
    try {
      const projectile = this.projectilePool.acquire();
      if (!projectile) {
        console.warn('ProjectileManager: Pool exhausted, cannot spawn new projectile');
        return;
      }

      const normalizedDirection = this.normalizeVector(direction);
      const velocity = {
        x: normalizedDirection.x * this.config.speed,
        y: normalizedDirection.y * this.config.speed
      };

      projectile.init(
        position,
        velocity,
        this.config.damage,
        this.config.lifetime
      );

      this.eventEmitter.emit('projectileSpawned', projectile);
    } catch (error) {
      console.error('Error spawning projectile:', error);
    }
  }

  /**
   * Updates all active projectiles
   */
  public update(deltaTime: number): void {
    this.projectilePool.getActiveObjects().forEach(projectile => {
      projectile.update(deltaTime);
      
      if (!projectile.isActiveProjectile()) {
        this.projectilePool.release(projectile);
      } else {
        this.checkCollisions(projectile);
      }
    });
  }

  /**
   * Checks for collisions between projectiles and other game objects
   */
  private checkCollisions(projectile: Projectile): void {
    const collisions = this.collisionSystem.checkProjectileCollisions(projectile);
    if (collisions.length > 0) {
      projectile.deactivate();
      this.projectilePool.release(projectile);
      this.eventEmitter.emit('projectileCollision', { projectile, collisions });
    }
  }

  /**
   * Normalizes a vector to have a magnitude of 1
   */
  private normalizeVector(vector: Vector2): Vector2 {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    return magnitude === 0 
      ? { x: 0, y: 0 }
      : { x: vector.x / magnitude, y: vector.y / magnitude };
  }

  /**
   * Sets up event listeners for game events
   */
  private setupEventListeners(): void {
    this.eventEmitter.on('gameReset', () => this.reset());
    this.eventEmitter.on('enemyDestroyed', () => this.cleanupProjectiles());
  }

  /**
   * Resets the projectile manager to its initial state
   */
  public reset(): void {
    this.projectilePool.reset();
  }

  /**
   * Cleans up all active projectiles
   */
  private cleanupProjectiles(): void {
    this.projectilePool.getActiveObjects().forEach(projectile => {
      projectile.deactivate();
      this.projectilePool.release(projectile);
    });
  }

  /**
   * Updates the projectile configuration
   */
  public updateConfig(newConfig: Partial<ProjectileConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}