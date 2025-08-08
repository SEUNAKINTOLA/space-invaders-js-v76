/**
 * @file Collider.ts
 * @description Implements basic collision detection system for game entities
 * @module physics/Collider
 */

// Types and interfaces
interface Vector2D {
  x: number;
  y: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents different types of collider shapes
 */
export enum ColliderType {
  BOX = 'box',
  CIRCLE = 'circle',
}

/**
 * Configuration options for the Collider component
 */
interface ColliderConfig {
  type: ColliderType;
  offset?: Vector2D;
  isTrigger?: boolean;
  radius?: number;
  width?: number;
  height?: number;
}

/**
 * Collider component class for handling collision detection between game entities
 */
export class Collider {
  private type: ColliderType;
  private offset: Vector2D;
  private isTrigger: boolean;
  private radius: number;
  private boundingBox: BoundingBox;

  /**
   * Creates a new Collider instance
   * @param config - Configuration options for the collider
   * @throws Error if invalid configuration is provided
   */
  constructor(config: ColliderConfig) {
    this.validateConfig(config);
    
    this.type = config.type;
    this.offset = config.offset || { x: 0, y: 0 };
    this.isTrigger = config.isTrigger || false;
    this.radius = config.radius || 0;
    this.boundingBox = {
      x: 0,
      y: 0,
      width: config.width || 0,
      height: config.height || 0
    };
  }

  /**
   * Validates the collider configuration
   * @param config - Configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: ColliderConfig): void {
    if (!config.type) {
      throw new Error('Collider type must be specified');
    }

    if (config.type === ColliderType.CIRCLE && !config.radius) {
      throw new Error('Radius must be specified for circle collider');
    }

    if (config.type === ColliderType.BOX && (!config.width || !config.height)) {
      throw new Error('Width and height must be specified for box collider');
    }
  }

  /**
   * Updates the collider's position
   * @param position - New position vector
   */
  public updatePosition(position: Vector2D): void {
    this.boundingBox.x = position.x + this.offset.x;
    this.boundingBox.y = position.y + this.offset.y;
  }

  /**
   * Checks for collision with another collider
   * @param other - Other collider to check collision with
   * @returns boolean indicating if collision occurred
   */
  public checkCollision(other: Collider): boolean {
    if (this.type === ColliderType.BOX && other.type === ColliderType.BOX) {
      return this.checkBoxCollision(other);
    }

    if (this.type === ColliderType.CIRCLE && other.type === ColliderType.CIRCLE) {
      return this.checkCircleCollision(other);
    }

    // For mixed collider types, use box-circle collision
    return this.checkBoxCircleCollision(other);
  }

  /**
   * Checks collision between two box colliders
   * @param other - Other box collider
   * @returns boolean indicating if collision occurred
   */
  private checkBoxCollision(other: Collider): boolean {
    return (
      this.boundingBox.x < other.boundingBox.x + other.boundingBox.width &&
      this.boundingBox.x + this.boundingBox.width > other.boundingBox.x &&
      this.boundingBox.y < other.boundingBox.y + other.boundingBox.height &&
      this.boundingBox.y + this.boundingBox.height > other.boundingBox.y
    );
  }

  /**
   * Checks collision between two circle colliders
   * @param other - Other circle collider
   * @returns boolean indicating if collision occurred
   */
  private checkCircleCollision(other: Collider): boolean {
    const dx = (this.boundingBox.x + this.radius) - (other.boundingBox.x + other.radius);
    const dy = (this.boundingBox.y + this.radius) - (other.boundingBox.y + other.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (this.radius + other.radius);
  }

  /**
   * Checks collision between a box and circle collider
   * @param other - Other collider
   * @returns boolean indicating if collision occurred
   */
  private checkBoxCircleCollision(other: Collider): boolean {
    // Implementation depends on which collider is box/circle
    const box = this.type === ColliderType.BOX ? this : other;
    const circle = this.type === ColliderType.CIRCLE ? this : other;

    // Find closest point on box to circle center
    const closestX = Math.max(box.boundingBox.x, 
      Math.min(circle.boundingBox.x + circle.radius, 
        box.boundingBox.x + box.boundingBox.width));
    const closestY = Math.max(box.boundingBox.y, 
      Math.min(circle.boundingBox.y + circle.radius, 
        box.boundingBox.y + box.boundingBox.height));

    // Calculate distance between closest point and circle center
    const dx = (circle.boundingBox.x + circle.radius) - closestX;
    const dy = (circle.boundingBox.y + circle.radius) - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circle.radius;
  }

  /**
   * Gets the bounding box of the collider
   * @returns Current bounding box
   */
  public getBoundingBox(): BoundingBox {
    return { ...this.boundingBox };
  }

  /**
   * Checks if this is a trigger collider
   * @returns boolean indicating if this is a trigger
   */
  public isTriggerCollider(): boolean {
    return this.isTrigger;
  }
}