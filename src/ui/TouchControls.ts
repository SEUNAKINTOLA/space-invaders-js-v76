/**
 * @file TouchControls.ts
 * @description Touch input handler for mobile device controls
 * @module TouchControls
 */

// Types and interfaces
interface TouchPoint {
  identifier: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
}

interface TouchControlOptions {
  element: HTMLElement;
  threshold?: number;
  preventScroll?: boolean;
  onSwipe?: (direction: SwipeDirection, distance: number) => void;
  onTap?: (x: number, y: number) => void;
}

enum SwipeDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

/**
 * TouchControls class handles touch input events and gestures
 * for mobile device interaction.
 */
export class TouchControls {
  private readonly element: HTMLElement;
  private readonly threshold: number;
  private readonly preventScroll: boolean;
  private readonly onSwipe?: (direction: SwipeDirection, distance: number) => void;
  private readonly onTap?: (x: number, y: number) => void;

  private activePoints: Map<number, TouchPoint>;
  private isEnabled: boolean;

  private static readonly DEFAULT_THRESHOLD = 30; // pixels

  /**
   * Creates a new TouchControls instance
   * @param options Configuration options for touch controls
   */
  constructor(options: TouchControlOptions) {
    this.element = options.element;
    this.threshold = options.threshold ?? TouchControls.DEFAULT_THRESHOLD;
    this.preventScroll = options.preventScroll ?? true;
    this.onSwipe = options.onSwipe;
    this.onTap = options.onTap;

    this.activePoints = new Map();
    this.isEnabled = false;

    this.bindEvents();
  }

  /**
   * Enables touch controls
   */
  public enable(): void {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.addEventListeners();
    }
  }

  /**
   * Disables touch controls
   */
  public disable(): void {
    if (this.isEnabled) {
      this.isEnabled = false;
      this.removeEventListeners();
      this.activePoints.clear();
    }
  }

  /**
   * Binds event handlers to class instance
   */
  private bindEvents(): void {
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  /**
   * Adds touch event listeners
   */
  private addEventListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: !this.preventScroll });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: !this.preventScroll });
    this.element.addEventListener('touchend', this.handleTouchEnd);
    this.element.addEventListener('touchcancel', this.handleTouchEnd);
  }

  /**
   * Removes touch event listeners
   */
  private removeEventListeners(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchEnd);
  }

  /**
   * Handles touch start event
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this.preventScroll) {
      event.preventDefault();
    }

    Array.from(event.changedTouches).forEach(touch => {
      const point: TouchPoint = {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
      };
      this.activePoints.set(touch.identifier, point);
    });
  }

  /**
   * Handles touch move event
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.preventScroll) {
      event.preventDefault();
    }

    Array.from(event.changedTouches).forEach(touch => {
      const point = this.activePoints.get(touch.identifier);
      if (point) {
        point.x = touch.clientX;
        point.y = touch.clientY;
      }
    });
  }

  /**
   * Handles touch end event
   */
  private handleTouchEnd(event: TouchEvent): void {
    Array.from(event.changedTouches).forEach(touch => {
      const point = this.activePoints.get(touch.identifier);
      if (point) {
        this.processTouch(point);
        this.activePoints.delete(touch.identifier);
      }
    });
  }

  /**
   * Processes completed touch interaction
   */
  private processTouch(point: TouchPoint): void {
    const deltaX = point.x - point.startX;
    const deltaY = point.y - point.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.threshold) {
      this.onTap?.(point.x, point.y);
      return;
    }

    if (this.onSwipe) {
      const direction = this.determineSwipeDirection(deltaX, deltaY);
      this.onSwipe(direction, distance);
    }
  }

  /**
   * Determines swipe direction based on touch delta
   */
  private determineSwipeDirection(deltaX: number, deltaY: number): SwipeDirection {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
    } else {
      return deltaY > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
    }
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    this.disable();
  }
}