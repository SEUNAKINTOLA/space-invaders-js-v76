/**
 * @file Controls.ts
 * @description Keyboard control configuration and input handling system
 * @module Controls
 */

// =========================================================
// Types & Interfaces
// =========================================================

/**
 * Represents the state of keyboard controls
 */
export interface KeyboardState {
  left: boolean;
  right: boolean;
  shoot: boolean;
}

/**
 * Configuration for keyboard control mappings
 */
export interface KeyboardConfig {
  left: string[];
  right: string[];
  shoot: string[];
}

// =========================================================
// Constants
// =========================================================

/**
 * Default keyboard control configuration
 */
export const DEFAULT_KEYBOARD_CONFIG: KeyboardConfig = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  shoot: ['Space', 'KeyX']
} as const;

// =========================================================
// Control Handler Class
// =========================================================

/**
 * Handles keyboard input and maintains control state
 */
export class KeyboardControls {
  private state: KeyboardState;
  private config: KeyboardConfig;
  private boundHandleKeyDown: (event: KeyboardEvent) => void;
  private boundHandleKeyUp: (event: KeyboardEvent) => void;

  /**
   * Creates a new keyboard control handler
   * @param customConfig - Optional custom keyboard configuration
   */
  constructor(customConfig?: Partial<KeyboardConfig>) {
    this.state = {
      left: false,
      right: false,
      shoot: false
    };

    this.config = {
      ...DEFAULT_KEYBOARD_CONFIG,
      ...customConfig
    };

    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Initializes keyboard event listeners
   * @throws {Error} If event listeners cannot be attached
   */
  public initialize(): void {
    try {
      window.addEventListener('keydown', this.boundHandleKeyDown);
      window.addEventListener('keyup', this.boundHandleKeyUp);
    } catch (error) {
      throw new Error(`Failed to initialize keyboard controls: ${error.message}`);
    }
  }

  /**
   * Removes keyboard event listeners
   */
  public cleanup(): void {
    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);
  }

  /**
   * Gets the current state of keyboard controls
   * @returns Current keyboard state
   */
  public getState(): Readonly<KeyboardState> {
    return { ...this.state };
  }

  /**
   * Updates control state based on keydown events
   * @param event - Keyboard event
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const { code } = event;

    if (this.config.left.includes(code)) {
      this.state.left = true;
    }
    if (this.config.right.includes(code)) {
      this.state.right = true;
    }
    if (this.config.shoot.includes(code)) {
      this.state.shoot = true;
    }
  }

  /**
   * Updates control state based on keyup events
   * @param event - Keyboard event
   * @private
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const { code } = event;

    if (this.config.left.includes(code)) {
      this.state.left = false;
    }
    if (this.config.right.includes(code)) {
      this.state.right = false;
    }
    if (this.config.shoot.includes(code)) {
      this.state.shoot = false;
    }
  }

  /**
   * Updates keyboard configuration
   * @param newConfig - New keyboard configuration
   */
  public updateConfig(newConfig: Partial<KeyboardConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}

// =========================================================
// Default Export
// =========================================================

export default KeyboardControls;