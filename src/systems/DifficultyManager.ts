/**
 * @file DifficultyManager.ts
 * @description Manages game difficulty progression over time with configurable scaling
 * @module DifficultyManager
 */

// Types and interfaces
export interface DifficultyConfig {
  baseLevel: number;
  maxLevel: number;
  scalingFactor: number;
  timeInterval: number; // milliseconds
  difficultySteps: DifficultyStep[];
}

export interface DifficultyStep {
  level: number;
  enemySpeed: number;
  enemyHealth: number;
  spawnRate: number;
  scoreMultiplier: number;
}

export interface DifficultyState {
  currentLevel: number;
  currentStep: DifficultyStep;
  timePlayed: number;
  isMaxDifficulty: boolean;
}

// Default configuration
const DEFAULT_CONFIG: DifficultyConfig = {
  baseLevel: 1,
  maxLevel: 10,
  scalingFactor: 1.2,
  timeInterval: 60000, // 1 minute
  difficultySteps: [
    { level: 1, enemySpeed: 1, enemyHealth: 100, spawnRate: 1, scoreMultiplier: 1 },
    { level: 2, enemySpeed: 1.2, enemyHealth: 120, spawnRate: 1.2, scoreMultiplier: 1.2 },
    { level: 3, enemySpeed: 1.4, enemyHealth: 140, spawnRate: 1.4, scoreMultiplier: 1.4 },
    // Add more steps as needed
  ]
};

/**
 * Manages game difficulty progression and scaling
 */
export class DifficultyManager {
  private config: DifficultyConfig;
  private state: DifficultyState;
  private lastUpdateTime: number;
  private subscribers: ((state: DifficultyState) => void)[] = [];

  /**
   * Creates a new DifficultyManager instance
   * @param config Optional custom difficulty configuration
   */
  constructor(config: Partial<DifficultyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validateConfig();

    this.state = {
      currentLevel: this.config.baseLevel,
      currentStep: this.config.difficultySteps[0],
      timePlayed: 0,
      isMaxDifficulty: false
    };
    
    this.lastUpdateTime = Date.now();
  }

  /**
   * Updates difficulty based on elapsed time
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    try {
      this.state.timePlayed += deltaTime;
      const currentTime = Date.now();

      if (currentTime - this.lastUpdateTime >= this.config.timeInterval) {
        this.progressDifficulty();
        this.lastUpdateTime = currentTime;
      }

      this.notifySubscribers();
    } catch (error) {
      console.error('Error updating difficulty:', error);
      throw new Error('Failed to update difficulty');
    }
  }

  /**
   * Subscribes to difficulty state changes
   * @param callback Function to call when difficulty changes
   */
  public subscribe(callback: (state: DifficultyState) => void): void {
    this.subscribers.push(callback);
  }

  /**
   * Gets current difficulty state
   * @returns Current difficulty state
   */
  public getCurrentState(): DifficultyState {
    return { ...this.state };
  }

  /**
   * Resets difficulty to initial state
   */
  public reset(): void {
    this.state = {
      currentLevel: this.config.baseLevel,
      currentStep: this.config.difficultySteps[0],
      timePlayed: 0,
      isMaxDifficulty: false
    };
    this.lastUpdateTime = Date.now();
    this.notifySubscribers();
  }

  /**
   * Calculates difficulty multiplier based on current level
   * @returns Difficulty multiplier value
   */
  public getDifficultyMultiplier(): number {
    return Math.pow(this.config.scalingFactor, this.state.currentLevel - 1);
  }

  private progressDifficulty(): void {
    if (this.state.isMaxDifficulty) {
      return;
    }

    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel > this.config.maxLevel) {
      this.state.isMaxDifficulty = true;
      return;
    }

    const nextStep = this.findDifficultyStep(nextLevel);
    if (nextStep) {
      this.state.currentLevel = nextLevel;
      this.state.currentStep = nextStep;
    }
  }

  private findDifficultyStep(level: number): DifficultyStep | undefined {
    return this.config.difficultySteps.find(step => step.level === level);
  }

  private validateConfig(): void {
    if (this.config.baseLevel < 1) {
      throw new Error('Base level must be greater than 0');
    }
    if (this.config.maxLevel < this.config.baseLevel) {
      throw new Error('Max level must be greater than base level');
    }
    if (this.config.scalingFactor <= 0) {
      throw new Error('Scaling factor must be greater than 0');
    }
    if (this.config.difficultySteps.length === 0) {
      throw new Error('At least one difficulty step must be defined');
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// Export a singleton instance
export const difficultyManager = new DifficultyManager();