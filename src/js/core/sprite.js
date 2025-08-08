/**
 * @fileoverview Sprite management system for handling game sprites
 * Provides functionality for loading, managing and rendering sprite images
 * 
 * @module core/sprite
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * Configuration constants for sprite management
 * @constant {Object}
 */
const SPRITE_CONFIG = {
    DEFAULT_FRAME_DELAY: 100,  // Default delay between frames in ms
    ERROR_RETRY_ATTEMPTS: 3,   // Number of times to retry loading a sprite
    DEFAULT_SCALE: 1,          // Default sprite scale
};

/**
 * Represents a game sprite with animation capabilities
 */
class Sprite {
    /**
     * Creates a new Sprite instance
     * @param {Object} config - The sprite configuration
     * @param {string} config.imageUrl - URL of the sprite image
     * @param {number} [config.frameWidth] - Width of each frame
     * @param {number} [config.frameHeight] - Height of each frame
     * @param {number} [config.scale=1] - Scaling factor for the sprite
     * @param {number} [config.frameDelay=100] - Delay between animation frames
     * @throws {Error} If required parameters are missing or invalid
     */
    constructor(config) {
        this._validateConfig(config);
        
        // Initialize properties
        this.imageUrl = config.imageUrl;
        this.frameWidth = config.frameWidth;
        this.frameHeight = config.frameHeight;
        this.scale = config.scale || SPRITE_CONFIG.DEFAULT_SCALE;
        this.frameDelay = config.frameDelay || SPRITE_CONFIG.DEFAULT_FRAME_DELAY;
        
        // Animation state
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.isAnimating = false;
        this.lastFrameTime = 0;
        
        // Image loading state
        this.isLoaded = false;
        this.image = null;
        this.loadAttempts = 0;
        
        // Initialize the sprite
        this._initializeSprite();
    }

    /**
     * Validates the sprite configuration
     * @private
     * @param {Object} config - The configuration to validate
     * @throws {Error} If configuration is invalid
     */
    _validateConfig(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Sprite configuration must be an object');
        }
        if (!config.imageUrl) {
            throw new Error('Image URL is required');
        }
        if (config.frameWidth && (typeof config.frameWidth !== 'number' || config.frameWidth <= 0)) {
            throw new Error('Frame width must be a positive number');
        }
        if (config.frameHeight && (typeof config.frameHeight !== 'number' || config.frameHeight <= 0)) {
            throw new Error('Frame height must be a positive number');
        }
    }

    /**
     * Initializes the sprite by loading the image
     * @private
     */
    _initializeSprite() {
        this.image = new Image();
        this.image.onload = () => {
            this.isLoaded = true;
            this._calculateFrames();
        };
        this.image.onerror = () => this._handleLoadError();
        this.image.src = this.imageUrl;
    }

    /**
     * Handles image loading errors
     * @private
     */
    _handleLoadError() {
        this.loadAttempts++;
        if (this.loadAttempts < SPRITE_CONFIG.ERROR_RETRY_ATTEMPTS) {
            console.warn(`Retry loading sprite: attempt ${this.loadAttempts}`);
            this._initializeSprite();
        } else {
            console.error('Failed to load sprite after multiple attempts');
            throw new Error(`Failed to load sprite: ${this.imageUrl}`);
        }
    }

    /**
     * Calculates total frames based on image dimensions
     * @private
     */
    _calculateFrames() {
        if (!this.frameWidth) this.frameWidth = this.image.width;
        if (!this.frameHeight) this.frameHeight = this.image.height;
        this.totalFrames = Math.floor(this.image.width / this.frameWidth);
    }

    /**
     * Updates the sprite animation
     * @param {number} timestamp - Current game timestamp
     */
    update(timestamp) {
        if (!this.isAnimating || !this.isLoaded) return;

        if (timestamp - this.lastFrameTime >= this.frameDelay) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.lastFrameTime = timestamp;
        }
    }

    /**
     * Renders the sprite to the canvas context
     * @param {CanvasRenderingContext2D} context - The rendering context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    render(context, x, y) {
        if (!this.isLoaded) return;

        try {
            context.drawImage(
                this.image,
                this.currentFrame * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                x,
                y,
                this.frameWidth * this.scale,
                this.frameHeight * this.scale
            );
        } catch (error) {
            console.error('Error rendering sprite:', error);
        }
    }

    /**
     * Starts sprite animation
     */
    play() {
        this.isAnimating = true;
        this.lastFrameTime = performance.now();
    }

    /**
     * Stops sprite animation
     */
    stop() {
        this.isAnimating = false;
    }

    /**
     * Sets the current frame
     * @param {number} frameIndex - Index of the frame to set
     * @throws {Error} If frame index is invalid
     */
    setFrame(frameIndex) {
        if (frameIndex < 0 || frameIndex >= this.totalFrames) {
            throw new Error('Invalid frame index');
        }
        this.currentFrame = frameIndex;
    }
}

export default Sprite;