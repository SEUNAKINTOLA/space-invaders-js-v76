/**
 * @fileoverview Canvas initialization and management module
 * Handles canvas setup, context management, and responsive scaling
 * 
 * @module game
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * Configuration constants for canvas setup
 * @constant {Object}
 */
const CANVAS_CONFIG = {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    BACKGROUND_COLOR: '#000000',
    PIXEL_RATIO: window.devicePixelRatio || 1
};

/**
 * Represents the game canvas manager
 */
class CanvasManager {
    /**
     * Creates a new CanvasManager instance
     * @param {string} containerId - DOM container ID for the canvas
     * @throws {Error} If container element is not found
     */
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        if (!this.context) {
            throw new Error('Failed to get 2D context from canvas');
        }

        this.container.appendChild(this.canvas);
        this.setupCanvas();
        this.bindEvents();
    }

    /**
     * Sets up initial canvas properties and scaling
     * @private
     */
    setupCanvas() {
        this.canvas.width = CANVAS_CONFIG.DEFAULT_WIDTH * CANVAS_CONFIG.PIXEL_RATIO;
        this.canvas.height = CANVAS_CONFIG.DEFAULT_HEIGHT * CANVAS_CONFIG.PIXEL_RATIO;
        
        // Set display size
        this.canvas.style.width = `${CANVAS_CONFIG.DEFAULT_WIDTH}px`;
        this.canvas.style.height = `${CANVAS_CONFIG.DEFAULT_HEIGHT}px`;

        // Scale context to match pixel ratio
        this.context.scale(CANVAS_CONFIG.PIXEL_RATIO, CANVAS_CONFIG.PIXEL_RATIO);

        // Apply initial styles
        this.context.imageSmoothingEnabled = false;
        this.clear();
    }

    /**
     * Binds necessary event listeners
     * @private
     */
    bindEvents() {
        window.addEventListener('resize', this.handleResize.bind(this), false);
        window.addEventListener('orientationchange', this.handleResize.bind(this), false);
    }

    /**
     * Handles window resize events
     * @private
     */
    handleResize() {
        const rect = this.container.getBoundingClientRect();
        const scale = Math.min(
            rect.width / CANVAS_CONFIG.DEFAULT_WIDTH,
            rect.height / CANVAS_CONFIG.DEFAULT_HEIGHT
        );

        this.canvas.style.transform = `scale(${scale})`;
        this.canvas.style.transformOrigin = 'top left';
    }

    /**
     * Clears the entire canvas
     * @public
     */
    clear() {
        this.context.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Gets the canvas rendering context
     * @returns {CanvasRenderingContext2D} The 2D rendering context
     * @public
     */
    getContext() {
        return this.context;
    }

    /**
     * Gets the canvas element
     * @returns {HTMLCanvasElement} The canvas element
     * @public
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Gets the current canvas dimensions
     * @returns {{width: number, height: number}} Canvas dimensions
     * @public
     */
    getDimensions() {
        return {
            width: CANVAS_CONFIG.DEFAULT_WIDTH,
            height: CANVAS_CONFIG.DEFAULT_HEIGHT
        };
    }
}

/**
 * Creates and returns a new canvas manager instance
 * @param {string} containerId - DOM container ID for the canvas
 * @returns {CanvasManager} New canvas manager instance
 * @throws {Error} If initialization fails
 */
export function initializeCanvas(containerId) {
    try {
        return new CanvasManager(containerId);
    } catch (error) {
        console.error('Failed to initialize canvas:', error);
        throw error;
    }
}

/**
 * Checks if the browser supports required canvas features
 * @returns {boolean} True if canvas is supported
 */
export function isCanvasSupported() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
}

export default {
    initializeCanvas,
    isCanvasSupported
};