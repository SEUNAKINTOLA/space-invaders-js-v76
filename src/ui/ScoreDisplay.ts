/**
 * @file ScoreDisplay.ts
 * @description Score display and management component for handling game scores and high scores
 * @module ScoreDisplay
 */

// =========================================================
// Types and Interfaces
// =========================================================

interface Score {
  points: number;
  playerName: string;
  date: Date;
}

interface ScoreDisplayConfig {
  maxHighScores: number;
  animationDuration: number;
  storageKey: string;
}

// =========================================================
// Constants
// =========================================================

const DEFAULT_CONFIG: ScoreDisplayConfig = {
  maxHighScores: 10,
  animationDuration: 500,
  storageKey: 'gameHighScores'
};

// =========================================================
// Main Class
// =========================================================

export class ScoreDisplay {
  private currentScore: number;
  private highScores: Score[];
  private readonly config: ScoreDisplayConfig;
  private element: HTMLElement | null;
  private animationFrame: number | null;

  /**
   * Creates a new ScoreDisplay instance
   * @param containerId - ID of the container element
   * @param config - Optional configuration options
   */
  constructor(
    private readonly containerId: string,
    config: Partial<ScoreDisplayConfig> = {}
  ) {
    this.currentScore = 0;
    this.highScores = [];
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.element = null;
    this.animationFrame = null;
    
    this.initialize();
  }

  /**
   * Initializes the score display
   * @private
   */
  private initialize(): void {
    try {
      this.element = document.getElementById(this.containerId);
      if (!this.element) {
        throw new Error(`Container element with ID '${this.containerId}' not found`);
      }

      this.loadHighScores();
      this.render();
    } catch (error) {
      console.error('Failed to initialize ScoreDisplay:', error);
    }
  }

  /**
   * Updates the current score
   * @param points - Points to add to current score
   */
  public updateScore(points: number): void {
    try {
      this.currentScore += points;
      this.animateScoreChange(points);
      this.render();
    } catch (error) {
      console.error('Error updating score:', error);
    }
  }

  /**
   * Adds a new high score
   * @param playerName - Name of the player
   * @returns boolean indicating if it's a new high score
   */
  public submitScore(playerName: string): boolean {
    try {
      const newScore: Score = {
        points: this.currentScore,
        playerName,
        date: new Date()
      };

      const isHighScore = this.isNewHighScore(this.currentScore);
      if (isHighScore) {
        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.points - a.points);
        this.highScores = this.highScores.slice(0, this.config.maxHighScores);
        this.saveHighScores();
      }

      return isHighScore;
    } catch (error) {
      console.error('Error submitting score:', error);
      return false;
    }
  }

  /**
   * Checks if the given score qualifies as a high score
   * @param score - Score to check
   * @private
   */
  private isNewHighScore(score: number): boolean {
    return (
      this.highScores.length < this.config.maxHighScores ||
      score > this.highScores[this.highScores.length - 1].points
    );
  }

  /**
   * Animates score changes
   * @param change - Point change to animate
   * @private
   */
  private animateScoreChange(change: number): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.animationDuration, 1);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }

      this.renderScoreChange(change, progress);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Renders the score display
   * @private
   */
  private render(): void {
    if (!this.element) return;

    this.element.innerHTML = `
      <div class="score-container">
        <div class="current-score">Score: ${this.currentScore}</div>
        <div class="high-scores">
          <h3>High Scores</h3>
          ${this.renderHighScores()}
        </div>
      </div>
    `;
  }

  /**
   * Renders high scores list
   * @private
   */
  private renderHighScores(): string {
    return this.highScores
      .map((score, index) => `
        <div class="high-score-entry">
          ${index + 1}. ${score.playerName}: ${score.points}
          <span class="date">${score.date.toLocaleDateString()}</span>
        </div>
      `)
      .join('');
  }

  /**
   * Renders score change animation
   * @private
   */
  private renderScoreChange(change: number, progress: number): void {
    const scoreChange = document.createElement('div');
    scoreChange.className = 'score-change';
    scoreChange.textContent = change > 0 ? `+${change}` : `${change}`;
    scoreChange.style.opacity = (1 - progress).toString();
    
    this.element?.appendChild(scoreChange);
  }

  /**
   * Loads high scores from local storage
   * @private
   */
  private loadHighScores(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.highScores = JSON.parse(stored).map((score: any) => ({
          ...score,
          date: new Date(score.date)
        }));
      }
    } catch (error) {
      console.error('Error loading high scores:', error);
      this.highScores = [];
    }
  }

  /**
   * Saves high scores to local storage
   * @private
   */
  private saveHighScores(): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.highScores));
    } catch (error) {
      console.error('Error saving high scores:', error);
    }
  }

  /**
   * Resets the current score to zero
   */
  public reset(): void {
    this.currentScore = 0;
    this.render();
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.element) {
      this.element.innerHTML = '';
    }
  }
}