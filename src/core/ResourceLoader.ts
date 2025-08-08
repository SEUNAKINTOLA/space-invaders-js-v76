import { Asset } from '../types/Asset';

/**
 * ResourceLoader class responsible for loading and caching game assets
 * Implements singleton pattern to ensure single instance of cache across the application
 */
export class ResourceLoader {
    private static instance: ResourceLoader;
    private cache: Map<string, Asset>;
    private loadingAssets: Map<string, Promise<Asset>>;
    private readonly maxCacheSize: number;

    private constructor() {
        this.cache = new Map();
        this.loadingAssets = new Map();
        this.maxCacheSize = 100; // Configurable cache size limit
    }

    /**
     * Gets the singleton instance of ResourceLoader
     * @returns ResourceLoader instance
     */
    public static getInstance(): ResourceLoader {
        if (!ResourceLoader.instance) {
            ResourceLoader.instance = new ResourceLoader();
        }
        return ResourceLoader.instance;
    }

    /**
     * Loads an asset from URL with caching
     * @param url - The URL of the asset to load
     * @param forceReload - Force reload even if cached
     * @returns Promise resolving to the loaded asset
     * @throws Error if loading fails
     */
    public async loadAsset(url: string, forceReload: boolean = false): Promise<Asset> {
        try {
            // Return cached asset if available and not forced to reload
            if (!forceReload && this.cache.has(url)) {
                return this.cache.get(url)!;
            }

            // Check if asset is already being loaded
            if (this.loadingAssets.has(url)) {
                return this.loadingAssets.get(url)!;
            }

            // Start new load
            const loadPromise = this.fetchAndCacheAsset(url);
            this.loadingAssets.set(url, loadPromise);

            const asset = await loadPromise;
            this.loadingAssets.delete(url);
            return asset;

        } catch (error) {
            throw new Error(`Failed to load asset from ${url}: ${error.message}`);
        }
    }

    /**
     * Preloads multiple assets
     * @param urls - Array of asset URLs to preload
     * @returns Promise resolving when all assets are loaded
     */
    public async preloadAssets(urls: string[]): Promise<void> {
        try {
            await Promise.all(
                urls.map(url => this.loadAsset(url))
            );
        } catch (error) {
            throw new Error(`Failed to preload assets: ${error.message}`);
        }
    }

    /**
     * Fetches and caches an asset
     * @param url - The URL of the asset to fetch
     * @returns Promise resolving to the loaded asset
     * @private
     */
    private async fetchAndCacheAsset(url: string): Promise<Asset> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const asset: Asset = {
                url,
                data: blob,
                timestamp: Date.now()
            };

            this.addToCache(url, asset);
            return asset;

        } catch (error) {
            throw new Error(`Failed to fetch asset: ${error.message}`);
        }
    }

    /**
     * Adds an asset to the cache, managing cache size
     * @param url - The URL of the asset
     * @param asset - The asset to cache
     * @private
     */
    private addToCache(url: string, asset: Asset): void {
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldestAsset();
        }
        this.cache.set(url, asset);
    }

    /**
     * Evicts the oldest asset from cache
     * @private
     */
    private evictOldestAsset(): void {
        let oldestTimestamp = Date.now();
        let oldestUrl: string | null = null;

        for (const [url, asset] of this.cache.entries()) {
            if (asset.timestamp < oldestTimestamp) {
                oldestTimestamp = asset.timestamp;
                oldestUrl = url;
            }
        }

        if (oldestUrl) {
            this.cache.delete(oldestUrl);
        }
    }

    /**
     * Clears the entire cache
     */
    public clearCache(): void {
        this.cache.clear();
    }

    /**
     * Removes a specific asset from cache
     * @param url - The URL of the asset to remove
     */
    public removeFromCache(url: string): void {
        this.cache.delete(url);
    }

    /**
     * Gets the current cache size
     * @returns Number of cached assets
     */
    public getCacheSize(): number {
        return this.cache.size;
    }
}