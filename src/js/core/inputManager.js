/**
 * @fileoverview Input Manager Module
 * Handles keyboard and touch input detection and management for the application.
 * Provides a unified interface for input handling across different devices.
 * 
 * @module core/inputManager
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * @typedef {Object} InputState
 * @property {boolean} pressed - Whether the input is currently pressed
 * @property {boolean} held - Whether the input is being held down
 * @property {boolean} released - Whether the input was just released
 * @property {number} timestamp - When the input state last changed
 */

/**
 * Manages keyboard and touch input states and events
 */
class InputManager {
    /**
     * Initialize the input manager
     */
    constructor() {
        /** @type {Map<string, InputState>} */
        this.keyStates = new Map();
        
        /** @type {Map<number, InputState>} */
        this.touchStates = new Map();
        
        /** @type {Set<Function>} */
        this.inputListeners = new Set();
        
        this.isEnabled = true;
        
        // Bind methods to maintain correct 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        this.initializeEventListeners();
    }

    /**
     * Set up event listeners for keyboard and touch events
     * @private
     */
    initializeEventListeners() {
        try {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
            window.addEventListener('touchstart', this.handleTouchStart);
            window.addEventListener('touchend', this.handleTouchEnd);
        } catch (error) {
            console.error('Failed to initialize input event listeners:', error);
        }
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keyboard event
     * @private
     */
    handleKeyDown(event) {
        if (!this.isEnabled) return;

        const key = event.key.toLowerCase();
        const currentTime = Date.now();

        this.keyStates.set(key, {
            pressed: true,
            held: true,
            released: false,
            timestamp: currentTime
        });

        this.notifyListeners('keydown', key);
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - The keyboard event
     * @private
     */
    handleKeyUp(event) {
        if (!this.isEnabled) return;

        const key = event.key.toLowerCase();
        const currentTime = Date.now();

        this.keyStates.set(key, {
            pressed: false,
            held: false,
            released: true,
            timestamp: currentTime
        });

        this.notifyListeners('keyup', key);
    }

    /**
     * Handle touch start events
     * @param {TouchEvent} event - The touch event
     * @private
     */
    handleTouchStart(event) {
        if (!this.isEnabled) return;

        const currentTime = Date.now();
        
        Array.from(event.changedTouches).forEach(touch => {
            this.touchStates.set(touch.identifier, {
                pressed: true,
                held: true,
                released: false,
                timestamp: currentTime
            });
        });

        this.notifyListeners('touchstart', event);
    }

    /**
     * Handle touch end events
     * @param {TouchEvent} event - The touch event
     * @private
     */
    handleTouchEnd(event) {
        if (!this.isEnabled) return;

        const currentTime = Date.now();
        
        Array.from(event.changedTouches).forEach(touch => {
            this.touchStates.set(touch.identifier, {
                pressed: false,
                held: false,
                released: true,
                timestamp: currentTime
            });
        });

        this.notifyListeners('touchend', event);
    }

    /**
     * Check if a key is currently pressed
     * @param {string} key - The key to check
     * @returns {boolean}
     */
    isKeyPressed(key) {
        const state = this.keyStates.get(key.toLowerCase());
        return state ? state.pressed : false;
    }

    /**
     * Check if a key is being held down
     * @param {string} key - The key to check
     * @returns {boolean}
     */
    isKeyHeld(key) {
        const state = this.keyStates.get(key.toLowerCase());
        return state ? state.held : false;
    }

    /**
     * Add an input event listener
     * @param {Function} listener - The listener callback function
     */
    addInputListener(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Input listener must be a function');
        }
        this.inputListeners.add(listener);
    }

    /**
     * Remove an input event listener
     * @param {Function} listener - The listener to remove
     */
    removeInputListener(listener) {
        this.inputListeners.delete(listener);
    }

    /**
     * Notify all listeners of an input event
     * @param {string} type - The event type
     * @param {*} data - The event data
     * @private
     */
    notifyListeners(type, data) {
        this.inputListeners.forEach(listener => {
            try {
                listener(type, data);
            } catch (error) {
                console.error('Error in input listener:', error);
            }
        });
    }

    /**
     * Enable input handling
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Disable input handling
     */
    disable() {
        this.isEnabled = false;
    }

    /**
     * Clean up event listeners and reset state
     */
    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchend', this.handleTouchEnd);
        
        this.keyStates.clear();
        this.touchStates.clear();
        this.inputListeners.clear();
    }
}

// Export a singleton instance
const inputManager = new InputManager();
Object.freeze(inputManager);

export default inputManager;