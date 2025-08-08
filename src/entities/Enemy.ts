/**
 * @file Enemy.ts
 * @description Implements basic enemy entity with movement patterns
 */

import { Vector2D } from '../types/Vector2D';

/**
 * Movement pattern types available for enemies
 */
export enum EnemyMovementPattern {
  SIDE_TO_SIDE = 'SIDE_TO_SIDE',
  DOWNWARD = 'DOWNWARD',
  STATIONARY = 'STATIONARY'
}

/**
 * Configuration interface for enemy movement
 */
interface EnemyMovementConfig {
  speed: number;
  pattern: EnemyMovementPattern;
  boundaryLeft: number;
  boundaryRight: number;
  boundaryBottom: number;
}

/**
 * Represents an enemy entity with basic movement capabilities
 */
export class Enemy {
  private position: Vector2D;
  private velocity: Vector2D;
  private readonly movementConfig: EnemyMovementConfig;
  private direction: number = 1; // 1 for right, -1 for left

  /**
   * Creates a new Enemy instance
   * @param startPosition Initial position of the enemy
   * @param config Movement configuration for the enemy
   */
  constructor(
    startPosition: Vector2D,
    config: EnemyMovementConfig = {
      speed: 2,
      pattern: EnemyMovementPattern.SIDE_TO_SIDE,
      boundaryLeft: 0,
      boundaryRight: 800,
      boundaryBottom: 600
    }
  ) {
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.movementConfig = { ...config };
    this.initializeMovement();
  }

  /**
   * Initializes enemy movement based on the configured pattern
   * @private
   */
  private initializeMovement(): void {
    switch (this.movementConfig.pattern) {
      case EnemyMovementPattern.SIDE_TO_SIDE:
        this.velocity.x = this.movementConfig.speed * this.direction;
        break;
      case EnemyMovementPattern.DOWNWARD:
        this.velocity.y = this.movementConfig.speed;
        break;
      case EnemyMovementPattern.STATIONARY:
        this.velocity = { x: 0, y: 0 };
        break;
    }
  }

  /**
   * Updates the enemy's position based on its movement pattern
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    if (!deltaTime || deltaTime < 0) {
      throw new Error('Invalid deltaTime provided');
    }

    const timeStep = deltaTime / 1000; // Convert to seconds

    switch (this.movementConfig.pattern) {
      case EnemyMovementPattern.SIDE_TO_SIDE:
        this.updateSideToSideMovement(timeStep);
        break;
      case EnemyMovementPattern.DOWNWARD:
        this.updateDownwardMovement(timeStep);
        break;
    }
  }

  /**
   * Updates position for side-to-side movement pattern
   * @param timeStep Time step in seconds
   * @private
   */
  private updateSideToSideMovement(timeStep: number): void {
    this.position.x += this.velocity.x * timeStep;

    // Check boundaries and reverse direction if needed
    if (this.position.x <= this.movementConfig.boundaryLeft) {
      this.position.x = this.movementConfig.boundaryLeft;
      this.direction = 1;
      this.velocity.x = Math.abs(this.velocity.x);
    } else if (this.position.x >= this.movementConfig.boundaryRight) {
      this.position.x = this.movementConfig.boundaryRight;
      this.direction = -1;
      this.velocity.x = -Math.abs(this.velocity.x);
    }
  }

  /**
   * Updates position for downward movement pattern
   * @param timeStep Time step in seconds
   * @private
   */
  private updateDownwardMovement(timeStep: number): void {
    this.position.y += this.velocity.y * timeStep;

    // Reset position if reached bottom boundary
    if (this.position.y >= this.movementConfig.boundaryBottom) {
      this.position.y = 0;
    }
  }

  /**
   * Gets the current position of the enemy
   * @returns Current position as Vector2D
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Gets the current velocity of the enemy
   * @returns Current velocity as Vector2D
   */
  public getVelocity(): Vector2D {
    return { ...this.velocity };
  }

  /**
   * Sets the enemy's position
   * @param position New position
   */
  public setPosition(position: Vector2D): void {
    this.position = { ...position };
  }
}