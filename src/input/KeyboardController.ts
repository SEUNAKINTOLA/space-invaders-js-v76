/**
 * @file KeyboardController.ts
 * @description Handles keyboard input events for game controls including movement and shooting.
 * Implements a robust event handling system with support for multiple key states.
 */

// Types and interfaces
interface KeyState {
  isPressed: boolean;
  timestamp: number;
}

interface KeyboardState {
  [key: string]: KeyState;
}

type KeyboardEventCallback = (event: KeyboardEvent) => void;

/**
 * Configuration for keyboard controls
 */
const KEYBOARD_CONFIG = {
  LEFT_KEYS: ['ArrowLeft', 'a', 'A'],
  RIGHT_KEYS: ['ArrowRight', 'd', 'D'],
  SHOOT_KEYS: ['Space', ' '],
  DEBOUNCE_TIME: 50, // ms
} as const;

/**
 * Manages keyboard input for game controls.
 * Handles key events, maintains key states, and provides methods to query input status.
 */
export class KeyboardController {
  private keyStates: KeyboardState = {};
  private isEnabled: boolean = false;
  private boundKeyDown: KeyboardEventCallback;
  private boundKeyUp: KeyboardEventCallback;

  constructor() {
    // Bind event handlers to maintain correct 'this' context
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Initializes the keyboard controller and starts listening for events
   * @throws Error if controller is already enabled
   */
  public enable(): void {
    if (this.isEnabled) {
      throw new Error('KeyboardController is already enabled');
    }

    try {
      window.addEventListener('keydown', this.boundKeyDown);
      window.addEventListener('keyup', this.boundKeyUp);
      this.isEnabled = true;
    } catch (error) {
      console.error('Failed to initialize KeyboardController:', error);
      throw new Error('KeyboardController initialization failed');
    }
  }

  /**
   * Stops listening for keyboard events and cleans up resources
   */
  public disable(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.keyStates = {};
    this.isEnabled = false;
  }

  /**
   * Checks if left movement is active
   * @returns boolean indicating if left movement should be applied
   */
  public isMovingLeft(): boolean {
    return KEYBOARD_CONFIG.LEFT_KEYS.some(key => this.isKeyActive(key));
  }

  /**
   * Checks if right movement is active
   * @returns boolean indicating if right movement should be applied
   */
  public isMovingRight(): boolean {
    return KEYBOARD_CONFIG.RIGHT_KEYS.some(key => this.isKeyActive(key));
  }

  /**
   * Checks if shoot action is active
   * @returns boolean indicating if shooting should be triggered
   */
  public isShooting(): boolean {
    return KEYBOARD_CONFIG.SHOOT_KEYS.some(key => this.isKeyActive(key));
  }

  /**
   * Resets all key states
   */
  public reset(): void {
    this.keyStates = {};
  }

  /**
   * Handles keydown events
   * @param event Keyboard event
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.shouldIgnoreKey(event.key)) {
      return;
    }

    const currentTime = Date.now();
    const existingState = this.keyStates[event.key];

    // Debounce rapid key presses
    if (existingState && 
        currentTime - existingState.timestamp < KEYBOARD_CONFIG.DEBOUNCE_TIME) {
      return;
    }

    this.keyStates[event.key] = {
      isPressed: true,
      timestamp: currentTime
    };
  }

  /**
   * Handles keyup events
   * @param event Keyboard event
   * @private
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (this.shouldIgnoreKey(event.key)) {
      return;
    }

    delete this.keyStates[event.key];
  }

  /**
   * Checks if a specific key is currently active
   * @param key Key to check
   * @returns boolean indicating if key is active
   * @private
   */
  private isKeyActive(key: string): boolean {
    return this.keyStates[key]?.isPressed ?? false;
  }

  /**
   * Determines if a key should be ignored by the controller
   * @param key Key to check
   * @returns boolean indicating if key should be ignored
   * @private
   */
  private shouldIgnoreKey(key: string): boolean {
    const validKeys = [
      ...KEYBOARD_CONFIG.LEFT_KEYS,
      ...KEYBOARD_CONFIG.RIGHT_KEYS,
      ...KEYBOARD_CONFIG.SHOOT_KEYS
    ];
    return !validKeys.includes(key);
  }
}

// Export a singleton instance
export const keyboardController = new KeyboardController();