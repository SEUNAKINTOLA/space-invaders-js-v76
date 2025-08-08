/**
 * @file ProjectileSystem.ts
 * @description Manages projectile creation, lifecycle, and physics for shooting mechanics
 * @module weapons/ProjectileSystem
 */

// Types and interfaces
interface ProjectileConfig {
  speed: number;
  damage: number;
  range: number;
  lifetime: number;
}

interface Vector2D {
  x: number;
  y: number;
}

interface Projectile {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  config: ProjectileConfig;
  createdAt: number;
  isActive: boolean;
}

// Configuration constants
const DEFAULT_PROJECTILE_CONFIG: ProjectileConfig = {
  speed: 10,
  damage: 10,
  range: 1000,
  lifetime: 3000, // milliseconds
};

/**
 * Manages the lifecycle and behavior of projectiles in the game
 */
export class ProjectileSystem {
  private projectiles: Map<string, Projectile>;
  private lastUpdateTime: number;

  constructor() {
    this.projectiles = new Map();
    this.lastUpdateTime = Date.now();
  }

  /**
   * Creates a new projectile with the given parameters
   * @param position Initial position of the projectile
   * @param direction Normalized direction vector
   * @param config Optional configuration overrides
   * @returns The ID of the created projectile
   */
  public createProjectile(
    position: Vector2D,
    direction: Vector2D,
    config?: Partial<ProjectileConfig>
  ): string {
    try {
      const projectileConfig = {
        ...DEFAULT_PROJECTILE_CONFIG,
        ...config,
      };

      const normalizedDirection = this.normalizeVector(direction);
      const projectileId = this.generateProjectileId();

      const projectile: Projectile = {
        id: projectileId,
        position: { ...position },
        velocity: {
          x: normalizedDirection.x * projectileConfig.speed,
          y: normalizedDirection.y * projectileConfig.speed,
        },
        config: projectileConfig,
        createdAt: Date.now(),
        isActive: true,
      };

      this.projectiles.set(projectileId, projectile);
      return projectileId;
    } catch (error) {
      console.error('Error creating projectile:', error);
      throw new Error('Failed to create projectile');
    }
  }

  /**
   * Updates all active projectiles
   * @returns Array of expired projectile IDs
   */
  public update(): string[] {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    const expiredProjectiles: string[] = [];

    this.projectiles.forEach((projectile, id) => {
      if (!projectile.isActive) return;

      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Check lifetime
      if (currentTime - projectile.createdAt >= projectile.config.lifetime) {
        projectile.isActive = false;
        expiredProjectiles.push(id);
      }

      // Check range
      const distance = this.calculateDistance(projectile);
      if (distance >= projectile.config.range) {
        projectile.isActive = false;
        expiredProjectiles.push(id);
      }
    });

    this.lastUpdateTime = currentTime;
    return expiredProjectiles;
  }

  /**
   * Removes a projectile from the system
   * @param projectileId The ID of the projectile to remove
   */
  public removeProjectile(projectileId: string): void {
    if (!this.projectiles.has(projectileId)) {
      throw new Error(`Projectile with ID ${projectileId} not found`);
    }
    this.projectiles.delete(projectileId);
  }

  /**
   * Gets the current position of a projectile
   * @param projectileId The ID of the projectile
   * @returns The current position or null if not found
   */
  public getProjectilePosition(projectileId: string): Vector2D | null {
    const projectile = this.projectiles.get(projectileId);
    return projectile ? { ...projectile.position } : null;
  }

  /**
   * Gets all active projectiles
   * @returns Array of active projectiles
   */
  public getActiveProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values()).filter(
      (projectile) => projectile.isActive
    );
  }

  // Private helper methods
  private generateProjectileId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private normalizeVector(vector: Vector2D): Vector2D {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude,
    };
  }

  private calculateDistance(projectile: Projectile): number {
    const dx = projectile.position.x;
    const dy = projectile.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Export types for external use
export type { ProjectileConfig, Vector2D, Projectile };