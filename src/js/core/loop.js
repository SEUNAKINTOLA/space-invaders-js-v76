/**
 * @fileoverview Game Loop implementation providing update and render cycle management
 * with fixed timestep and frame timing calculations.
 * 
 * @module core/loop
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * Default configuration for the game loop
 * @constant {Object}
 */
const DEFAULT_CONFIG = {
    fps: 60,                     // Target frames per second
    maxDeltaTime: 1000/30,      // Maximum allowed delta time (ms)
    updateInterval: 1000/60,     // Fixed update interval (ms)
    maxFrameSkip: 5             // Maximum number of update frames to skip
};

/**
 * Represents a game loop that manages update and render cycles
 */
class GameLoop {
    /**
     * Creates a new GameLoop instance
     * @param {Object} config - Loop configuration options
     * @param {number} [config.fps=60] - Target frames per second
     * @param {number} [config.maxDeltaTime=33.33] - Maximum allowed delta time in ms
     * @param {number} [config.updateInterval=16.67] - Fixed update interval in ms
     * @param {number} [config.maxFrameSkip=5] - Maximum number of update frames to skip
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // Internal state
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.currentFps = 0;
        
        // Bound methods to maintain context
        this.tick = this.tick.bind(this);
        
        // Callbacks
        this.updateCallback = null;
        this.renderCallback = null;
    }

    /**
     * Sets the update callback function
     * @param {Function} callback - Function to call during update phase
     * @throws {TypeError} If callback is not a function
     */
    setUpdateCallback(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Update callback must be a function');
        }
        this.updateCallback = callback;
    }

    /**
     * Sets the render callback function
     * @param {Function} callback - Function to call during render phase
     * @throws {TypeError} If callback is not a function
     */
    setRenderCallback(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Render callback must be a function');
        }
        this.renderCallback = callback;
    }

    /**
     * Starts the game loop
     * @throws {Error} If callbacks are not set
     */
    start() {
        if (!this.updateCallback || !this.renderCallback) {
            throw new Error('Update and render callbacks must be set before starting the loop');
        }

        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.accumulator = 0;
            requestAnimationFrame(this.tick);
        }
    }

    /**
     * Stops the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main loop tick function
     * @private
     * @param {number} currentTime - Current timestamp
     */
    tick(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // FPS calculation
        this.frameCount++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime -= 1000;
        }

        // Clamp delta time to prevent spiral of death
        deltaTime = Math.min(deltaTime, this.config.maxDeltaTime);

        // Accumulate time for fixed update steps
        this.accumulator += deltaTime;

        // Update loop with fixed timestep
        let updateCount = 0;
        while (this.accumulator >= this.config.updateInterval && 
               updateCount < this.config.maxFrameSkip) {
            try {
                this.updateCallback(this.config.updateInterval);
                this.accumulator -= this.config.updateInterval;
                updateCount++;
            } catch (error) {
                console.error('Error in update callback:', error);
                this.stop();
                return;
            }
        }

        // Calculate interpolation alpha for smooth rendering
        const alpha = this.accumulator / this.config.updateInterval;

        // Render frame
        try {
            this.renderCallback(alpha);
        } catch (error) {
            console.error('Error in render callback:', error);
            this.stop();
            return;
        }

        // Queue next frame
        requestAnimationFrame(this.tick);
    }

    /**
     * Gets the current FPS
     * @returns {number} Current frames per second
     */
    getFps() {
        return this.currentFps;
    }

    /**
     * Checks if the loop is currently running
     * @returns {boolean} True if the loop is running
     */
    isActive() {
        return this.isRunning;
    }
}

export default GameLoop;