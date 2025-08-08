/**
 * @fileoverview Score Management System
 * Handles tracking, updating, and managing game scores with persistence
 * and event notification capabilities.
 * 
 * @module scoreManager
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants
const STORAGE_KEY = 'gameScores';
const DEFAULT_SCORE = 0;
const SCORE_EVENTS = {
  SCORE_UPDATED: 'scoreUpdated',
  HIGH_SCORE_REACHED: 'highScoreReached',
  SCORE_RESET: 'scoreReset'
};

/**
 * ScoreManager class handles all score-related operations
 * including tracking current score, high score, and managing score events
 */
class ScoreManager {
  /**
   * Initialize the score manager
   * @param {Object} options - Configuration options
   * @param {number} options.initialScore - Starting score (default: 0)
   * @param {boolean} options.persistScore - Whether to persist scores (default: true)
   */
  constructor(options = {}) {
    this.currentScore = options.initialScore || DEFAULT_SCORE;
    this.highScore = this.loadHighScore();
    this.persistScore = options.persistScore !== false;
    this.eventListeners = new Map();
    
    // Initialize if needed
    this.initialize();
  }

  /**
   * Initialize the score manager state
   * @private
   */
  initialize() {
    if (this.persistScore && !this.loadHighScore()) {
      this.saveHighScore(DEFAULT_SCORE);
    }
  }

  /**
   * Add points to the current score
   * @param {number} points - Points to add
   * @throws {Error} If points is not a valid number
   */
  addPoints(points) {
    if (typeof points !== 'number' || isNaN(points)) {
      throw new Error('Points must be a valid number');
    }

    this.currentScore += points;
    this.checkHighScore();
    this.emitEvent(SCORE_EVENTS.SCORE_UPDATED, { 
      currentScore: this.currentScore,
      points: points 
    });
  }

  /**
   * Subtract points from the current score
   * @param {number} points - Points to subtract
   * @throws {Error} If points is not a valid number
   */
  subtractPoints(points) {
    if (typeof points !== 'number' || isNaN(points)) {
      throw new Error('Points must be a valid number');
    }

    this.currentScore = Math.max(0, this.currentScore - points);
    this.emitEvent(SCORE_EVENTS.SCORE_UPDATED, { 
      currentScore: this.currentScore,
      points: -points 
    });
  }

  /**
   * Reset the current score to default
   */
  resetScore() {
    this.currentScore = DEFAULT_SCORE;
    this.emitEvent(SCORE_EVENTS.SCORE_RESET, { 
      currentScore: this.currentScore 
    });
  }

  /**
   * Get the current score
   * @returns {number} Current score
   */
  getCurrentScore() {
    return this.currentScore;
  }

  /**
   * Get the high score
   * @returns {number} High score
   */
  getHighScore() {
    return this.highScore;
  }

  /**
   * Check and update high score if necessary
   * @private
   */
  checkHighScore() {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      if (this.persistScore) {
        this.saveHighScore(this.highScore);
      }
      this.emitEvent(SCORE_EVENTS.HIGH_SCORE_REACHED, { 
        highScore: this.highScore 
      });
    }
  }

  /**
   * Save high score to local storage
   * @private
   * @param {number} score - Score to save
   */
  saveHighScore(score) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  }

  /**
   * Load high score from local storage
   * @private
   * @returns {number} Loaded high score or default score
   */
  loadHighScore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SCORE;
    } catch (error) {
      console.error('Failed to load high score:', error);
      return DEFAULT_SCORE;
    }
  }

  /**
   * Subscribe to score events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback function
   * @throws {Error} If event is not valid or callback is not a function
   */
  subscribe(event, callback) {
    if (!Object.values(SCORE_EVENTS).includes(event)) {
      throw new Error(`Invalid event: ${event}`);
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Unsubscribe from score events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback function
   */
  unsubscribe(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit score event to subscribers
   * @private
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export constants and class
export { SCORE_EVENTS, ScoreManager };