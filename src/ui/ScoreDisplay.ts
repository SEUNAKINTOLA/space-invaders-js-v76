/**
 * @file ScoreDisplay.ts
 * @description A reusable component for displaying and managing game scores
 * @module ScoreDisplay
 */

// =========================================================
// Types and Interfaces
// =========================================================

/**
 * Configuration options for the ScoreDisplay component
 */
interface ScoreDisplayConfig {
  initialScore?: number;
  maxScore?: number;
  minScore?: number;
  animationDuration?: number;
}

/**
 * Score update event data structure
 */
interface ScoreUpdateEvent {
  previousScore: number;
  newScore: number;
  timestamp: number;
}

// =========================================================
// Constants
// =========================================================

const DEFAULT_CONFIG: ScoreDisplayConfig = {
  initialScore: 0,
  maxScore: Number.MAX_SAFE_INTEGER,
  minScore: 0,
  animationDuration: 500,
};

// =========================================================
// Main Class
// =========================================================

/**
 * ScoreDisplay class handles the display and management of game scores
 */
export class ScoreDisplay {
  private currentScore: number;
  private readonly config: Required<ScoreDisplayConfig>;
  private element: HTMLElement | null;
  private observers: ((event: ScoreUpdateEvent) => void)[];

  /**
   * Creates a new ScoreDisplay instance
   * @param config - Configuration options for the score display
   */
  constructor(config: ScoreDisplayConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore;
    this.element = null;
    this.observers = [];
    
    this.validateConfig();
  }

  /**
   * Initializes the score display element
   * @param container - The container element to mount the score display
   * @throws Error if container is not a valid HTML element
   */
  public initialize(container: HTMLElement): void {
    try {
      this.element = document.createElement('div');
      this.element.className = 'score-display';
      this.updateDisplay();
      container.appendChild(this.element);
    } catch (error) {
      throw new Error(`Failed to initialize score display: ${error.message}`);
    }
  }

  /**
   * Updates the score value
   * @param newScore - The new score value
   * @returns boolean indicating success of the operation
   */
  public updateScore(newScore: number): boolean {
    if (!this.isValidScore(newScore)) {
      console.warn(`Invalid score value: ${newScore}`);
      return false;
    }

    const previousScore = this.currentScore;
    this.currentScore = newScore;
    
    this.notifyObservers({
      previousScore,
      newScore,
      timestamp: Date.now(),
    });

    this.updateDisplay();
    return true;
  }

  /**
   * Increments the current score by the specified amount
   * @param amount - Amount to increment (defaults to 1)
   * @returns boolean indicating success of the operation
   */
  public increment(amount: number = 1): boolean {
    return this.updateScore(this.currentScore + amount);
  }

  /**
   * Decrements the current score by the specified amount
   * @param amount - Amount to decrement (defaults to 1)
   * @returns boolean indicating success of the operation
   */
  public decrement(amount: number = 1): boolean {
    return this.updateScore(this.currentScore - amount);
  }

  /**
   * Registers an observer for score updates
   * @param observer - Callback function to be called on score updates
   */
  public addObserver(observer: (event: ScoreUpdateEvent) => void): void {
    this.observers.push(observer);
  }

  /**
   * Returns the current score value
   * @returns current score
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Destroys the score display component and cleans up resources
   */
  public destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.observers = [];
  }

  // =========================================================
  // Private Methods
  // =========================================================

  /**
   * Validates the configuration options
   * @throws Error if configuration is invalid
   */
  private validateConfig(): void {
    if (this.config.maxScore < this.config.minScore) {
      throw new Error('maxScore cannot be less than minScore');
    }

    if (this.config.initialScore < this.config.minScore || 
        this.config.initialScore > this.config.maxScore) {
      throw new Error('initialScore must be between minScore and maxScore');
    }
  }

  /**
   * Checks if a score value is valid according to configuration
   * @param score - Score value to validate
   * @returns boolean indicating if score is valid
   */
  private isValidScore(score: number): boolean {
    return (
      !isNaN(score) &&
      score >= this.config.minScore &&
      score <= this.config.maxScore
    );
  }

  /**
   * Updates the display element with the current score
   */
  private updateDisplay(): void {
    if (this.element) {
      this.element.textContent = this.currentScore.toString();
      this.animateUpdate();
    }
  }

  /**
   * Animates the score update
   */
  private animateUpdate(): void {
    if (this.element) {
      this.element.classList.add('score-updated');
      setTimeout(() => {
        this.element?.classList.remove('score-updated');
      }, this.config.animationDuration);
    }
  }

  /**
   * Notifies all observers of a score update
   * @param event - Score update event data
   */
  private notifyObservers(event: ScoreUpdateEvent): void {
    this.observers.forEach(observer => {
      try {
        observer(event);
      } catch (error) {
        console.error('Error in score observer:', error);
      }
    });
  }
}

export default ScoreDisplay;