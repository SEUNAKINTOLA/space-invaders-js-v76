/**
 * @file ScoreManager.ts
 * @description Manages game scoring system with support for different score types,
 * multipliers, and persistence. Implements the Singleton pattern to ensure a single
 * score management instance across the game.
 * 
 * @module ScoreManager
 * @version 1.0.0
 */

// Types and Interfaces
interface ScoreConfig {
    initialScore: number;
    multiplier: number;
    highScoreKey: string;
}

interface ScoreUpdateEvent {
    currentScore: number;
    change: number;
    multiplier: number;
}

type ScoreEventCallback = (event: ScoreUpdateEvent) => void;

/**
 * Default configuration for the scoring system
 */
const DEFAULT_SCORE_CONFIG: ScoreConfig = {
    initialScore: 0,
    multiplier: 1,
    highScoreKey: 'gameHighScore'
};

/**
 * Manages game scoring system with support for real-time score tracking,
 * high score persistence, and score multipliers.
 */
export class ScoreManager {
    private static instance: ScoreManager;
    private currentScore: number;
    private highScore: number;
    private multiplier: number;
    private config: ScoreConfig;
    private listeners: ScoreEventCallback[];

    private constructor(config: Partial<ScoreConfig> = {}) {
        this.config = { ...DEFAULT_SCORE_CONFIG, ...config };
        this.currentScore = this.config.initialScore;
        this.multiplier = this.config.multiplier;
        this.highScore = this.loadHighScore();
        this.listeners = [];
    }

    /**
     * Gets the singleton instance of ScoreManager
     * @param config Optional configuration to initialize the score manager
     * @returns ScoreManager instance
     */
    public static getInstance(config?: Partial<ScoreConfig>): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager(config);
        }
        return ScoreManager.instance;
    }

    /**
     * Adds points to the current score
     * @param points Number of points to add
     * @throws Error if points is negative
     */
    public addPoints(points: number): void {
        if (points < 0) {
            throw new Error('Points cannot be negative');
        }

        const adjustedPoints = points * this.multiplier;
        this.currentScore += adjustedPoints;

        this.notifyListeners({
            currentScore: this.currentScore,
            change: adjustedPoints,
            multiplier: this.multiplier
        });

        this.updateHighScore();
    }

    /**
     * Sets the score multiplier
     * @param multiplier New multiplier value
     * @throws Error if multiplier is less than or equal to 0
     */
    public setMultiplier(multiplier: number): void {
        if (multiplier <= 0) {
            throw new Error('Multiplier must be greater than 0');
        }
        this.multiplier = multiplier;
    }

    /**
     * Gets the current score
     * @returns Current score
     */
    public getCurrentScore(): number {
        return this.currentScore;
    }

    /**
     * Gets the high score
     * @returns High score
     */
    public getHighScore(): number {
        return this.highScore;
    }

    /**
     * Resets the current score to initial value
     */
    public resetScore(): void {
        this.currentScore = this.config.initialScore;
        this.multiplier = this.config.multiplier;
        
        this.notifyListeners({
            currentScore: this.currentScore,
            change: 0,
            multiplier: this.multiplier
        });
    }

    /**
     * Adds a listener for score updates
     * @param callback Callback function to be called on score updates
     */
    public addListener(callback: ScoreEventCallback): void {
        this.listeners.push(callback);
    }

    /**
     * Removes a listener
     * @param callback Callback function to remove
     */
    public removeListener(callback: ScoreEventCallback): void {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
     * Loads the high score from local storage
     * @returns Stored high score or 0 if not found
     */
    private loadHighScore(): number {
        try {
            const storedScore = localStorage.getItem(this.config.highScoreKey);
            return storedScore ? parseInt(storedScore, 10) : 0;
        } catch (error) {
            console.warn('Failed to load high score:', error);
            return 0;
        }
    }

    /**
     * Updates and persists the high score if current score is higher
     */
    private updateHighScore(): void {
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            try {
                localStorage.setItem(
                    this.config.highScoreKey, 
                    this.highScore.toString()
                );
            } catch (error) {
                console.warn('Failed to save high score:', error);
            }
        }
    }

    /**
     * Notifies all listeners of score updates
     * @param event Score update event details
     */
    private notifyListeners(event: ScoreUpdateEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in score listener:', error);
            }
        });
    }
}

// Export a default instance for convenience
export default ScoreManager.getInstance();