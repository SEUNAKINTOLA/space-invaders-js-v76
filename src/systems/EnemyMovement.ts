/**
 * @file EnemyMovement.ts
 * @description Implements core enemy movement patterns and behaviors for the game.
 * Handles different movement strategies including side-to-side and downward movement.
 * 
 * @module EnemyMovement
 * @version 1.0.0
 */

// =========== Type Definitions ===========

/**
 * Represents a 2D position vector
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Defines available movement patterns for enemies
 */
export enum MovementPattern {
  SIDE_TO_SIDE = 'SIDE_TO_SIDE',
  DOWNWARD = 'DOWNWARD',
  ZIGZAG = 'ZIGZAG',
  STATIONARY = 'STATIONARY'
}

/**
 * Configuration options for enemy movement
 */
interface MovementConfig {
  pattern: MovementPattern;
  speed: number;
  amplitude?: number;  // For side-to-side movement
  frequency?: number;  // For oscillating movements
  bounds?: {
    min: Vector2D;
    max: Vector2D;
  };
}

// =========== Constants ===========

const DEFAULT_CONFIG: MovementConfig = {
  pattern: MovementPattern.SIDE_TO_SIDE,
  speed: 2,
  amplitude: 100,
  frequency: 0.02,
  bounds: {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
  }
};

// =========== Main Class ===========

/**
 * Manages enemy movement patterns and updates positions
 */
export class EnemyMovementSystem {
  private config: MovementConfig;
  private time: number = 0;

  /**
   * Creates a new enemy movement system
   * @param config - Movement configuration options
   */
  constructor(config: Partial<MovementConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validateConfig();
  }

  /**
   * Validates the movement configuration
   * @throws Error if configuration is invalid
   */
  private validateConfig(): void {
    if (this.config.speed <= 0) {
      throw new Error('Movement speed must be greater than 0');
    }

    if (this.config.pattern === MovementPattern.SIDE_TO_SIDE) {
      if (!this.config.amplitude || !this.config.frequency) {
        throw new Error('Side-to-side movement requires amplitude and frequency');
      }
    }
  }

  /**
   * Updates the position of an enemy based on its movement pattern
   * @param currentPosition - Current position of the enemy
   * @param deltaTime - Time elapsed since last update
   * @returns New position vector
   */
  public updatePosition(currentPosition: Vector2D, deltaTime: number): Vector2D {
    this.time += deltaTime;

    switch (this.config.pattern) {
      case MovementPattern.SIDE_TO_SIDE:
        return this.calculateSideToSidePosition(currentPosition);
      case MovementPattern.DOWNWARD:
        return this.calculateDownwardPosition(currentPosition);
      case MovementPattern.ZIGZAG:
        return this.calculateZigZagPosition(currentPosition);
      case MovementPattern.STATIONARY:
        return { ...currentPosition };
      default:
        throw new Error(`Unsupported movement pattern: ${this.config.pattern}`);
    }
  }

  /**
   * Calculates new position for side-to-side movement
   */
  private calculateSideToSidePosition(currentPosition: Vector2D): Vector2D {
    const { amplitude, frequency } = this.config;
    return {
      x: currentPosition.x + Math.sin(this.time * frequency!) * amplitude!,
      y: currentPosition.y
    };
  }

  /**
   * Calculates new position for downward movement
   */
  private calculateDownwardPosition(currentPosition: Vector2D): Vector2D {
    return {
      x: currentPosition.x,
      y: currentPosition.y + this.config.speed
    };
  }

  /**
   * Calculates new position for zigzag movement
   */
  private calculateZigZagPosition(currentPosition: Vector2D): Vector2D {
    const horizontalOffset = Math.sin(this.time * this.config.frequency!) * this.config.amplitude!;
    return {
      x: currentPosition.x + horizontalOffset,
      y: currentPosition.y + this.config.speed
    };
  }

  /**
   * Checks if the position is within the defined bounds
   * @param position - Position to check
   * @returns True if position is within bounds
   */
  public isWithinBounds(position: Vector2D): boolean {
    const { bounds } = this.config;
    if (!bounds) return true;

    return position.x >= bounds.min.x &&
           position.x <= bounds.max.x &&
           position.y >= bounds.min.y &&
           position.y <= bounds.max.y;
  }

  /**
   * Updates the movement configuration
   * @param newConfig - New configuration options
   */
  public updateConfig(newConfig: Partial<MovementConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
  }

  /**
   * Resets the internal time counter
   */
  public reset(): void {
    this.time = 0;
  }
}

// =========== Helper Functions ===========

/**
 * Creates a movement configuration with validated values
 * @param pattern - Movement pattern to use
 * @param options - Additional configuration options
 * @returns Validated movement configuration
 */
export function createMovementConfig(
  pattern: MovementPattern,
  options: Partial<MovementConfig> = {}
): MovementConfig {
  const config = { ...DEFAULT_CONFIG, ...options, pattern };
  const system = new EnemyMovementSystem(config);
  return config;
}