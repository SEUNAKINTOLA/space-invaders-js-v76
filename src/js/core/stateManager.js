/**
 * @fileoverview Game State Management System
 * Implements a state machine pattern for managing different game states
 * and transitions between them.
 * 
 * @module core/stateManager
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * @typedef {Object} State
 * @property {function} enter - Called when entering the state
 * @property {function} exit - Called when exiting the state
 * @property {function} update - Called every frame while in this state
 */

/**
 * Represents a game state management system
 * @class StateManager
 */
class StateManager {
    /**
     * Creates a new StateManager instance
     * @constructor
     */
    constructor() {
        /** @private {Map<string, State>} */
        this._states = new Map();
        
        /** @private {State|null} */
        this._currentState = null;
        
        /** @private {string|null} */
        this._currentStateName = null;
        
        /** @private {boolean} */
        this._isTransitioning = false;
    }

    /**
     * Registers a new state with the manager
     * @param {string} stateName - Unique identifier for the state
     * @param {State} state - State object implementing the State interface
     * @throws {Error} If state name already exists or state object is invalid
     */
    registerState(stateName, state) {
        if (typeof stateName !== 'string' || !stateName) {
            throw new Error('Invalid state name provided');
        }

        if (!this._isValidState(state)) {
            throw new Error('Invalid state object provided');
        }

        if (this._states.has(stateName)) {
            throw new Error(`State '${stateName}' already registered`);
        }

        this._states.set(stateName, state);
    }

    /**
     * Transitions to a new state
     * @param {string} newStateName - Name of the state to transition to
     * @returns {Promise<void>}
     * @throws {Error} If state doesn't exist or transition is invalid
     */
    async changeState(newStateName) {
        if (this._isTransitioning) {
            throw new Error('State transition already in progress');
        }

        const newState = this._states.get(newStateName);
        if (!newState) {
            throw new Error(`State '${newStateName}' not found`);
        }

        try {
            this._isTransitioning = true;

            // Exit current state if it exists
            if (this._currentState) {
                await this._currentState.exit();
            }

            // Enter new state
            this._currentState = newState;
            this._currentStateName = newStateName;
            await this._currentState.enter();

        } catch (error) {
            console.error('State transition failed:', error);
            throw error;
        } finally {
            this._isTransitioning = false;
        }
    }

    /**
     * Updates the current state
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (this._currentState && !this._isTransitioning) {
            try {
                this._currentState.update(deltaTime);
            } catch (error) {
                console.error('State update failed:', error);
                throw error;
            }
        }
    }

    /**
     * Gets the name of the current state
     * @returns {string|null} Current state name or null if no state is active
     */
    getCurrentStateName() {
        return this._currentStateName;
    }

    /**
     * Checks if a state exists
     * @param {string} stateName - Name of the state to check
     * @returns {boolean} True if state exists, false otherwise
     */
    hasState(stateName) {
        return this._states.has(stateName);
    }

    /**
     * Validates a state object
     * @private
     * @param {State} state - State object to validate
     * @returns {boolean} True if state is valid, false otherwise
     */
    _isValidState(state) {
        return state &&
            typeof state.enter === 'function' &&
            typeof state.exit === 'function' &&
            typeof state.update === 'function';
    }

    /**
     * Clears all registered states
     */
    clear() {
        this._states.clear();
        this._currentState = null;
        this._currentStateName = null;
        this._isTransitioning = false;
    }
}

// Export as singleton to ensure single instance across the application
export default new StateManager();