/**
 * @file PlayerShip.ts
 * @description Player ship entity class that handles movement and ship state management
 * @module entities/PlayerShip
 */

// Types and interfaces
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  dx: number;
  dy: number;
}

interface MovementBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Configuration constants for ship movement
 */
const MOVEMENT_CONFIG = {
  MAX_SPEED: 10,
  ACCELERATION: 0.5,
  DECELERATION: 0.2,
  ROTATION_SPEED: 0.1,
} as const;

/**
 * PlayerShip class representing the player-controlled spacecraft
 * Handles movement, position updates, and boundary checking
 */
export class PlayerShip {
  private position: Position;
  private velocity: Velocity;
  private rotation: number;
  private bounds: MovementBounds;
  private isMoving: boolean;

  /**
   * Creates a new PlayerShip instance
   * @param startX - Initial X position
   * @param startY - Initial Y position
   * @param bounds - Movement boundaries for the ship
   */
  constructor(
    startX: number,
    startY: number,
    bounds: MovementBounds
  ) {
    this.position = { x: startX, y: startY };
    this.velocity = { dx: 0, dy: 0 };
    this.rotation = 0;
    this.bounds = bounds;
    this.isMoving = false;
  }

  /**
   * Updates ship position based on current velocity and time delta
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    try {
      this.updatePosition(deltaTime);
      this.applyDeceleration();
      this.enforceBoundaries();
    } catch (error) {
      console.error('Error updating ship position:', error);
      // Reset to safe state if error occurs
      this.resetVelocity();
    }
  }

  /**
   * Applies thrust in the current rotation direction
   * @param thrust - Thrust amount (0 to 1)
   */
  public applyThrust(thrust: number): void {
    if (thrust < 0 || thrust > 1) {
      throw new Error('Thrust must be between 0 and 1');
    }

    this.isMoving = true;
    const thrustForce = MOVEMENT_CONFIG.ACCELERATION * thrust;

    this.velocity.dx += Math.cos(this.rotation) * thrustForce;
    this.velocity.dy += Math.sin(this.rotation) * thrustForce;

    this.clampVelocity();
  }

  /**
   * Rotates the ship
   * @param direction - Rotation direction (-1 for left, 1 for right)
   */
  public rotate(direction: number): void {
    this.rotation += MOVEMENT_CONFIG.ROTATION_SPEED * direction;
    // Normalize rotation to 0-2π
    this.rotation = this.rotation % (Math.PI * 2);
  }

  /**
   * Gets the current position of the ship
   * @returns Current position coordinates
   */
  public getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Gets the current rotation of the ship
   * @returns Current rotation in radians
   */
  public getRotation(): number {
    return this.rotation;
  }

  /**
   * Updates the movement boundaries
   * @param newBounds - New boundary values
   */
  public updateBounds(newBounds: MovementBounds): void {
    this.bounds = { ...newBounds };
  }

  /**
   * Resets the ship's velocity to zero
   */
  private resetVelocity(): void {
    this.velocity = { dx: 0, dy: 0 };
    this.isMoving = false;
  }

  /**
   * Updates the ship's position based on current velocity
   * @param deltaTime - Time elapsed since last update
   */
  private updatePosition(deltaTime: number): void {
    this.position.x += this.velocity.dx * (deltaTime / 1000);
    this.position.y += this.velocity.dy * (deltaTime / 1000);
  }

  /**
   * Applies deceleration when ship is not actively moving
   */
  private applyDeceleration(): void {
    if (!this.isMoving) {
      this.velocity.dx *= (1 - MOVEMENT_CONFIG.DECELERATION);
      this.velocity.dy *= (1 - MOVEMENT_CONFIG.DECELERATION);

      // Stop completely if moving very slowly
      if (Math.abs(this.velocity.dx) < 0.01) this.velocity.dx = 0;
      if (Math.abs(this.velocity.dy) < 0.01) this.velocity.dy = 0;
    }
    this.isMoving = false;
  }

  /**
   * Ensures ship stays within defined boundaries
   */
  private enforceBoundaries(): void {
    this.position.x = Math.max(this.bounds.minX, 
      Math.min(this.bounds.maxX, this.position.x));
    this.position.y = Math.max(this.bounds.minY, 
      Math.min(this.bounds.maxY, this.position.y));
  }

  /**
   * Clamps velocity to maximum speed
   */
  private clampVelocity(): void {
    const speed = Math.sqrt(
      this.velocity.dx * this.velocity.dx + 
      this.velocity.dy * this.velocity.dy
    );

    if (speed > MOVEMENT_CONFIG.MAX_SPEED) {
      const scale = MOVEMENT_CONFIG.MAX_SPEED / speed;
      this.velocity.dx *= scale;
      this.velocity.dy *= scale;
    }
  }
}