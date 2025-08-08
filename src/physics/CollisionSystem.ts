/**
 * @file CollisionSystem.ts
 * @description Provides collision detection functionality for game entities.
 * Implements basic AABB (Axis-Aligned Bounding Box) and circle collision detection.
 */

// Types and interfaces
interface Vector2D {
  x: number;
  y: number;
}

interface BoundingBox {
  position: Vector2D;
  width: number;
  height: number;
}

interface Circle {
  position: Vector2D;
  radius: number;
}

/**
 * Represents a collision result between two entities
 */
interface CollisionResult {
  hasCollision: boolean;
  intersectionDepth?: Vector2D;
  normal?: Vector2D;
}

/**
 * Main class handling collision detection between game entities
 */
export class CollisionSystem {
  /**
   * Checks collision between two axis-aligned bounding boxes
   * @param boxA First bounding box
   * @param boxB Second bounding box
   * @returns CollisionResult containing collision information
   * @throws Error if invalid input parameters are provided
   */
  public checkAABBCollision(boxA: BoundingBox, boxB: BoundingBox): CollisionResult {
    try {
      this.validateBoundingBox(boxA);
      this.validateBoundingBox(boxB);

      const collision = (
        boxA.position.x < boxB.position.x + boxB.width &&
        boxA.position.x + boxA.width > boxB.position.x &&
        boxA.position.y < boxB.position.y + boxB.height &&
        boxA.position.y + boxA.height > boxB.position.y
      );

      if (!collision) {
        return { hasCollision: false };
      }

      // Calculate intersection depth
      const intersectionDepth: Vector2D = {
        x: Math.min(
          boxA.position.x + boxA.width - boxB.position.x,
          boxB.position.x + boxB.width - boxA.position.x
        ),
        y: Math.min(
          boxA.position.y + boxA.height - boxB.position.y,
          boxB.position.y + boxB.height - boxA.position.y
        )
      };

      // Calculate collision normal
      const normal: Vector2D = {
        x: boxA.position.x < boxB.position.x ? -1 : 1,
        y: boxA.position.y < boxB.position.y ? -1 : 1
      };

      return {
        hasCollision: true,
        intersectionDepth,
        normal
      };
    } catch (error) {
      throw new Error(`AABB collision check failed: ${error.message}`);
    }
  }

  /**
   * Checks collision between two circles
   * @param circleA First circle
   * @param circleB Second circle
   * @returns CollisionResult containing collision information
   * @throws Error if invalid input parameters are provided
   */
  public checkCircleCollision(circleA: Circle, circleB: Circle): CollisionResult {
    try {
      this.validateCircle(circleA);
      this.validateCircle(circleB);

      const dx = circleB.position.x - circleA.position.x;
      const dy = circleB.position.y - circleA.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const sumRadii = circleA.radius + circleB.radius;

      if (distance >= sumRadii) {
        return { hasCollision: false };
      }

      // Calculate normal vector
      const normal: Vector2D = {
        x: dx / distance,
        y: dy / distance
      };

      return {
        hasCollision: true,
        intersectionDepth: {
          x: (sumRadii - distance) * normal.x,
          y: (sumRadii - distance) * normal.y
        },
        normal
      };
    } catch (error) {
      throw new Error(`Circle collision check failed: ${error.message}`);
    }
  }

  /**
   * Checks if a point is inside a bounding box
   * @param point Point coordinates
   * @param box Bounding box
   * @returns boolean indicating if point is inside box
   */
  public isPointInBox(point: Vector2D, box: BoundingBox): boolean {
    return (
      point.x >= box.position.x &&
      point.x <= box.position.x + box.width &&
      point.y >= box.position.y &&
      point.y <= box.position.y + box.height
    );
  }

  /**
   * Validates bounding box parameters
   * @param box Bounding box to validate
   * @throws Error if parameters are invalid
   */
  private validateBoundingBox(box: BoundingBox): void {
    if (!box || !box.position) {
      throw new Error('Invalid bounding box parameters');
    }
    if (box.width <= 0 || box.height <= 0) {
      throw new Error('Bounding box dimensions must be positive');
    }
  }

  /**
   * Validates circle parameters
   * @param circle Circle to validate
   * @throws Error if parameters are invalid
   */
  private validateCircle(circle: Circle): void {
    if (!circle || !circle.position) {
      throw new Error('Invalid circle parameters');
    }
    if (circle.radius <= 0) {
      throw new Error('Circle radius must be positive');
    }
  }
}

// Export types for external use
export type {
  Vector2D,
  BoundingBox,
  Circle,
  CollisionResult
};