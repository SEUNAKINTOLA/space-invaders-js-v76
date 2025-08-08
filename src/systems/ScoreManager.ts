/**
 * @file ScoreManager.ts
 * @description Manages game scoring system with persistent high scores storage
 * @module ScoreManager
 */

// Types and interfaces
interface ScoreEntry {
  playerName: string;
  score: number;
  timestamp: number;
}

interface ScoreManagerConfig {
  maxHighScores: number;
  storageKey: string;
}

/**
 * Manages game scoring system including tracking current score,
 * maintaining high scores, and persistent storage
 */
export class ScoreManager {
  private currentScore: number = 0;
  private highScores: ScoreEntry[] = [];
  private readonly config: ScoreManagerConfig;

  /**
   * Creates a new ScoreManager instance
   * @param config Optional configuration options
   */
  constructor(config?: Partial<ScoreManagerConfig>) {
    this.config = {
      maxHighScores: 10,
      storageKey: 'gameHighScores',
      ...config
    };

    this.loadHighScores();
  }

  /**
   * Adds points to the current score
   * @param points Number of points to add
   * @throws {Error} If points is not a positive number
   */
  public addPoints(points: number): void {
    if (!Number.isFinite(points) || points < 0) {
      throw new Error('Points must be a positive number');
    }

    this.currentScore += points;
  }

  /**
   * Gets the current score
   * @returns Current score value
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Resets the current score to zero
   */
  public resetScore(): void {
    this.currentScore = 0;
  }

  /**
   * Submits current score as a high score entry
   * @param playerName Name of the player
   * @returns boolean indicating if score was high enough to be added
   * @throws {Error} If playerName is empty or invalid
   */
  public submitHighScore(playerName: string): boolean {
    if (!playerName?.trim()) {
      throw new Error('Player name is required');
    }

    const newEntry: ScoreEntry = {
      playerName: playerName.trim(),
      score: this.currentScore,
      timestamp: Date.now()
    };

    const isHighScore = this.addHighScore(newEntry);
    if (isHighScore) {
      this.saveHighScores();
    }

    return isHighScore;
  }

  /**
   * Gets the current high scores
   * @returns Array of high score entries
   */
  public getHighScores(): ReadonlyArray<ScoreEntry> {
    return [...this.highScores];
  }

  /**
   * Checks if current score is a high score
   * @returns boolean indicating if current score qualifies as high score
   */
  public isHighScore(): boolean {
    if (this.highScores.length < this.config.maxHighScores) {
      return true;
    }
    return this.currentScore > this.getLowestHighScore();
  }

  /**
   * Clears all high scores
   */
  public clearHighScores(): void {
    this.highScores = [];
    this.saveHighScores();
  }

  // Private helper methods

  /**
   * Adds a new high score entry if it qualifies
   * @param entry Score entry to add
   * @returns boolean indicating if score was added
   */
  private addHighScore(entry: ScoreEntry): boolean {
    if (this.highScores.length < this.config.maxHighScores) {
      this.highScores.push(entry);
      this.sortHighScores();
      return true;
    }

    if (entry.score > this.getLowestHighScore()) {
      this.highScores.pop();
      this.highScores.push(entry);
      this.sortHighScores();
      return true;
    }

    return false;
  }

  /**
   * Sorts high scores in descending order
   */
  private sortHighScores(): void {
    this.highScores.sort((a, b) => b.score - a.score);
  }

  /**
   * Gets the lowest high score value
   * @returns Lowest high score or 0 if no high scores exist
   */
  private getLowestHighScore(): number {
    return this.highScores.length > 0
      ? this.highScores[this.highScores.length - 1].score
      : 0;
  }

  /**
   * Loads high scores from persistent storage
   */
  private loadHighScores(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ScoreEntry[];
        this.highScores = Array.isArray(parsed) ? parsed : [];
        this.sortHighScores();
      }
    } catch (error) {
      console.error('Failed to load high scores:', error);
      this.highScores = [];
    }
  }

  /**
   * Saves high scores to persistent storage
   */
  private saveHighScores(): void {
    try {
      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(this.highScores)
      );
    } catch (error) {
      console.error('Failed to save high scores:', error);
    }
  }
}