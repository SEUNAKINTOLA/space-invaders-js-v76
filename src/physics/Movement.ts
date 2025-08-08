/**
 * @file Movement.ts
 * @description Handles physics-based movement calculations for player ships
 * @module physics/Movement
 */

// Types and interfaces
interface Vector2D {
  x: number;
  y: number;
}

interface MovementConfig {
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  rotationSpeed: number;
}

/**
 * Class responsible for handling ship movement physics
 */
export class MovementController {
  private velocity: Vector2D;
  private position: Vector2D;
  private rotation: number;
  private readonly config: MovementConfig;

  /**
   * Creates a new MovementController instance
   * @param initialPosition - Starting position vector
   * @param config - Movement configuration parameters
   */
  constructor(
    initialPosition: Vector2D = { x: 0, y: 0 },
    config: Partial<MovementConfig> = {}
  ) {
    this.position = { ...initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;

    // Default configuration with optional overrides
    this.config = {
      maxSpeed: 10,
      acceleration: 0.5,
      deceleration: 0.98,
      rotationSpeed: 0.1,
      ...config
    };
  }

  /**
   * Updates the movement state based on input and delta time
   * @param input - Movement input vector
   * @param deltaTime - Time elapsed since last update
   */
  public update(input: Vector2D, deltaTime: number): void {
    try {
      this.updateRotation(input, deltaTime);
      this.updateVelocity(input, deltaTime);
      this.updatePosition(deltaTime);
      this.applyFriction();
    } catch (error) {
      console.error('Error updating movement:', error);
      // Reset to safe state if error occurs
      this.velocity = { x: 0, y: 0 };
    }
  }

  /**
   * Gets the current position
   * @returns Current position vector
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Gets the current rotation in radians
   * @returns Current rotation
   */
  public getRotation(): number {
    return this.rotation;
  }

  /**
   * Updates the rotation based on input
   * @param input - Movement input vector
   * @param deltaTime - Time elapsed since last update
   */
  private updateRotation(input: Vector2D, deltaTime: number): void {
    if (input.x !== 0) {
      this.rotation += input.x * this.config.rotationSpeed * deltaTime;
      // Normalize rotation to 0-2π
      this.rotation = this.rotation % (Math.PI * 2);
    }
  }

  /**
   * Updates velocity based on input and current rotation
   * @param input - Movement input vector
   * @param deltaTime - Time elapsed since last update
   */
  private updateVelocity(input: Vector2D, deltaTime: number): void {
    if (input.y !== 0) {
      // Calculate direction vector based on current rotation
      const direction = {
        x: Math.cos(this.rotation),
        y: Math.sin(this.rotation)
      };

      // Apply acceleration in the facing direction
      this.velocity.x += direction.x * input.y * this.config.acceleration * deltaTime;
      this.velocity.y += direction.y * input.y * this.config.acceleration * deltaTime;

      // Limit speed to maxSpeed
      this.clampVelocity();
    }
  }

  /**
   * Updates position based on current velocity
   * @param deltaTime - Time elapsed since last update
   */
  private updatePosition(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Applies friction/deceleration to velocity
   */
  private applyFriction(): void {
    this.velocity.x *= this.config.deceleration;
    this.velocity.y *= this.config.deceleration;

    // Stop completely if moving very slowly
    if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
  }

  /**
   * Clamps velocity to maximum speed
   */
  private clampVelocity(): void {
    const currentSpeed = Math.sqrt(
      this.velocity.x * this.velocity.x + 
      this.velocity.y * this.velocity.y
    );

    if (currentSpeed > this.config.maxSpeed) {
      const scale = this.config.maxSpeed / currentSpeed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }
  }

  /**
   * Resets movement state to initial values
   * @param position - Optional new position to reset to
   */
  public reset(position?: Vector2D): void {
    this.velocity = { x: 0, y: 0 };
    if (position) {
      this.position = { ...position };
    }
    this.rotation = 0;
  }
}

// Export types for external use
export type { Vector2D, MovementConfig };