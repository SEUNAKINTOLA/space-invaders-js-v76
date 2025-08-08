/**
 * @fileoverview Asset Loader Module
 * Handles loading and management of sprite assets and other game resources.
 * Provides utilities for loading, caching, and retrieving assets.
 * 
 * @module core/assetLoader
 */

// Constants for asset management
const ASSET_TYPES = {
    IMAGE: 'image',
    SPRITE: 'sprite',
    AUDIO: 'audio'
};

const CACHE_SETTINGS = {
    MAX_RETRIES: 3,
    TIMEOUT: 5000 // milliseconds
};

/**
 * Represents the result of an asset loading operation
 * @typedef {Object} LoadResult
 * @property {boolean} success - Whether the load was successful
 * @property {string} [error] - Error message if load failed
 * @property {*} [asset] - The loaded asset if successful
 */

/**
 * Asset loader class responsible for managing game assets
 */
class AssetLoader {
    constructor() {
        /** @private */
        this._cache = new Map();
        /** @private */
        this._loadingPromises = new Map();
        /** @private */
        this._errorHandlers = new Set();
    }

    /**
     * Loads a single asset and caches it
     * @param {string} url - The URL of the asset to load
     * @param {string} type - The type of asset (from ASSET_TYPES)
     * @param {string} [id] - Optional identifier for the asset
     * @returns {Promise<LoadResult>}
     */
    async loadAsset(url, type, id = url) {
        try {
            // Check cache first
            if (this._cache.has(id)) {
                return {
                    success: true,
                    asset: this._cache.get(id)
                };
            }

            // Check if already loading
            if (this._loadingPromises.has(url)) {
                return this._loadingPromises.get(url);
            }

            const loadPromise = this._loadAssetByType(url, type, id);
            this._loadingPromises.set(url, loadPromise);

            const result = await loadPromise;
            this._loadingPromises.delete(url);

            return result;
        } catch (error) {
            this._notifyErrorHandlers(error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Loads multiple assets in parallel
     * @param {Array<{url: string, type: string, id?: string}>} assetConfigs
     * @returns {Promise<Map<string, LoadResult>>}
     */
    async loadMultipleAssets(assetConfigs) {
        const results = new Map();
        const loadPromises = assetConfigs.map(async config => {
            const result = await this.loadAsset(config.url, config.type, config.id);
            results.set(config.id || config.url, result);
        });

        await Promise.all(loadPromises);
        return results;
    }

    /**
     * Retrieves an asset from cache
     * @param {string} id - Asset identifier
     * @returns {*|null} The cached asset or null if not found
     */
    getAsset(id) {
        return this._cache.get(id) || null;
    }

    /**
     * Adds an error handler callback
     * @param {Function} handler - Error handler function
     */
    addErrorHandler(handler) {
        this._errorHandlers.add(handler);
    }

    /**
     * @private
     */
    _notifyErrorHandlers(error) {
        this._errorHandlers.forEach(handler => handler(error));
    }

    /**
     * @private
     */
    async _loadAssetByType(url, type, id) {
        let asset = null;
        let attempts = 0;

        while (attempts < CACHE_SETTINGS.MAX_RETRIES) {
            try {
                switch (type) {
                    case ASSET_TYPES.IMAGE:
                    case ASSET_TYPES.SPRITE:
                        asset = await this._loadImage(url);
                        break;
                    case ASSET_TYPES.AUDIO:
                        asset = await this._loadAudio(url);
                        break;
                    default:
                        throw new Error(`Unsupported asset type: ${type}`);
                }

                this._cache.set(id, asset);
                return {
                    success: true,
                    asset
                };
            } catch (error) {
                attempts++;
                if (attempts >= CACHE_SETTINGS.MAX_RETRIES) {
                    throw new Error(`Failed to load asset ${url}: ${error.message}`);
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    /**
     * @private
     */
    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'));
            }, CACHE_SETTINGS.TIMEOUT);

            image.onload = () => {
                clearTimeout(timeout);
                resolve(image);
            };

            image.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Image load failed'));
            };

            image.src = url;
        });
    }

    /**
     * @private
     */
    _loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            const timeout = setTimeout(() => {
                reject(new Error('Audio load timeout'));
            }, CACHE_SETTINGS.TIMEOUT);

            audio.oncanplaythrough = () => {
                clearTimeout(timeout);
                resolve(audio);
            };

            audio.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Audio load failed'));
            };

            audio.src = url;
        });
    }

    /**
     * Clears all cached assets
     */
    clearCache() {
        this._cache.clear();
    }

    /**
     * Removes a specific asset from cache
     * @param {string} id - Asset identifier
     */
    removeFromCache(id) {
        this._cache.delete(id);
    }
}

// Export a singleton instance
export const assetLoader = new AssetLoader();

// Export types and constants
export { ASSET_TYPES };