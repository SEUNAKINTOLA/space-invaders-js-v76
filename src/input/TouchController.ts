/**
 * @file TouchController.ts
 * @description Touch input handler for mobile device controls
 * @module input
 */

// Types for touch event handling
interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force?: number;
}

interface TouchEventConfig {
  element: HTMLElement;
  preventDefault?: boolean;
  maxTouchPoints?: number;
}

/**
 * Handles and manages touch input events for mobile devices
 * @class TouchController
 */
export class TouchController {
  private readonly element: HTMLElement;
  private readonly touchPoints: Map<number, TouchPoint>;
  private readonly config: Required<TouchEventConfig>;
  
  private isActive: boolean = false;
  private lastTouchTimestamp: number = 0;
  
  // Default configuration
  private static readonly DEFAULT_CONFIG: Required<TouchEventConfig> = {
    element: document.body,
    preventDefault: true,
    maxTouchPoints: 5
  };

  /**
   * Creates a new TouchController instance
   * @param {TouchEventConfig} config - Configuration options for touch handling
   * @throws {Error} If the target element is invalid
   */
  constructor(config: TouchEventConfig) {
    try {
      this.config = { ...TouchController.DEFAULT_CONFIG, ...config };
      this.element = this.config.element;
      this.touchPoints = new Map<number, TouchPoint>();
      
      this.validateConfig();
      this.initialize();
    } catch (error) {
      throw new Error(`TouchController initialization failed: ${error.message}`);
    }
  }

  /**
   * Validates the configuration parameters
   * @private
   * @throws {Error} If configuration is invalid
   */
  private validateConfig(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid target element');
    }
    
    if (this.config.maxTouchPoints < 1) {
      throw new Error('maxTouchPoints must be greater than 0');
    }
  }

  /**
   * Initializes touch event listeners
   * @private
   */
  private initialize(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: !this.config.preventDefault });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: !this.config.preventDefault });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: !this.config.preventDefault });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: !this.config.preventDefault });
    
    this.isActive = true;
  }

  /**
   * Handles touch start events
   * @private
   * @param {TouchEvent} event - The touch event object
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    this.lastTouchTimestamp = Date.now();

    Array.from(event.changedTouches).forEach(touch => {
      if (this.touchPoints.size >= this.config.maxTouchPoints) {
        return;
      }

      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force
      };

      this.touchPoints.set(touch.identifier, touchPoint);
      this.emitTouchEvent('touchstart', touchPoint);
    });
  }

  /**
   * Handles touch move events
   * @private
   * @param {TouchEvent} event - The touch event object
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    Array.from(event.changedTouches).forEach(touch => {
      if (!this.touchPoints.has(touch.identifier)) {
        return;
      }

      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force
      };

      this.touchPoints.set(touch.identifier, touchPoint);
      this.emitTouchEvent('touchmove', touchPoint);
    });
  }

  /**
   * Handles touch end events
   * @private
   * @param {TouchEvent} event - The touch event object
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = this.touchPoints.get(touch.identifier);
      if (touchPoint) {
        this.touchPoints.delete(touch.identifier);
        this.emitTouchEvent('touchend', touchPoint);
      }
    });
  }

  /**
   * Handles touch cancel events
   * @private
   * @param {TouchEvent} event - The touch event object
   */
  private handleTouchCancel(event: TouchEvent): void {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = this.touchPoints.get(touch.identifier);
      if (touchPoint) {
        this.touchPoints.delete(touch.identifier);
        this.emitTouchEvent('touchcancel', touchPoint);
      }
    });
  }

  /**
   * Emits custom touch events
   * @private
   * @param {string} type - The type of touch event
   * @param {TouchPoint} touchPoint - The touch point data
   */
  private emitTouchEvent(type: string, touchPoint: TouchPoint): void {
    const event = new CustomEvent(`touch:${type}`, {
      detail: {
        touchPoint,
        timestamp: Date.now(),
        delta: Date.now() - this.lastTouchTimestamp
      }
    });

    this.element.dispatchEvent(event);
  }

  /**
   * Gets all current active touch points
   * @returns {TouchPoint[]} Array of active touch points
   */
  public getActiveTouchPoints(): TouchPoint[] {
    return Array.from(this.touchPoints.values());
  }

  /**
   * Checks if the controller is currently active
   * @returns {boolean} True if the controller is active
   */
  public isControllerActive(): boolean {
    return this.isActive;
  }

  /**
   * Destroys the touch controller and removes all event listeners
   */
  public destroy(): void {
    if (!this.isActive) {
      return;
    }

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));

    this.touchPoints.clear();
    this.isActive = false;
  }
}