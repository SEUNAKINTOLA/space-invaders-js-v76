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
  scoreChangeAnimation: {
    duration: number;
    easing: 'linear' | 'easeOut' | 'bounce';
    fadeDistance: string;
  };
}

// =========================================================
// Constants
// =========================================================

const DEFAULT_CONFIG: ScoreDisplayConfig = {
  maxHighScores: 10,
  animationDuration: 500,
  storageKey: 'gameHighScores',
  scoreChangeAnimation: {
    duration: 1000,
    easing: 'easeOut',
    fadeDistance: '50px'
  }
};

// =========================================================
// Animation Utilities
// =========================================================

const easingFunctions = {
  linear: (t: number): number => t,
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  bounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

// =========================================================
// Main Class
// =========================================================

export class ScoreDisplay {
  // ... [Previous class properties remain the same]

  /**
   * Animates score changes with enhanced visual effects
   * @param change - Point change to animate
   * @private
   */
  private animateScoreChange(change: number): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const startTime = performance.now();
    const startScore = this.currentScore - change;
    const { duration, easing, fadeDistance } = this.config.scoreChangeAnimation;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);

      // Animate the main score counter
      if (this.element) {
        const interpolatedScore = Math.round(
          startScore + change * easedProgress
        );
        const scoreElement = this.element.querySelector('.current-score');
        if (scoreElement) {
          scoreElement.textContent = `Score: ${interpolatedScore}`;
        }
      }

      // Animate the floating score change indicator
      this.renderScoreChange(change, progress, easedProgress);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Renders enhanced score change animation
   * @param change - Point change value
   * @param progress - Animation progress (0-1)
   * @param easedProgress - Eased animation progress (0-1)
   * @private
   */
  private renderScoreChange(
    change: number,
    progress: number,
    easedProgress: number
  ): void {
    if (!this.element) return;

    const scoreChange = document.createElement('div');
    scoreChange.className = `score-change ${change > 0 ? 'positive' : 'negative'}`;
    scoreChange.textContent = change > 0 ? `+${change}` : `${change}`;

    // Apply dynamic styles for animation
    const { fadeDistance } = this.config.scoreChangeAnimation;
    Object.assign(scoreChange.style, {
      position: 'absolute',
      opacity: (1 - easedProgress).toString(),
      transform: `translateY(${-parseFloat(fadeDistance) * easedProgress}px)`,
      transition: 'transform 0.2s ease-out',
      color: change > 0 ? '#4CAF50' : '#F44336',
      fontWeight: 'bold',
      fontSize: '1.2em',
      textShadow: '0 0 5px rgba(0,0,0,0.2)',
      pointerEvents: 'none'
    });

    // Position the element relative to the score display
    const scoreDisplay = this.element.querySelector('.current-score');
    if (scoreDisplay) {
      const rect = scoreDisplay.getBoundingClientRect();
      scoreChange.style.left = `${rect.right + 10}px`;
      scoreChange.style.top = `${rect.top}px`;
    }

    this.element.appendChild(scoreChange);

    // Cleanup after animation
    setTimeout(() => {
      if (scoreChange.parentNode === this.element) {
        this.element.removeChild(scoreChange);
      }
    }, this.config.scoreChangeAnimation.duration);
  }

  // ... [Rest of the class implementation remains the same]
}

// Add this CSS to your stylesheet
const styles = `
  .score-change {
    animation: fadeOut 1s ease-out;
  }

  .score-change.positive {
    color: #4CAF50;
  }

  .score-change.negative {
    color: #F44336;
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-50px);
    }
  }
`;