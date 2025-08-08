import { Howl, Howler } from 'howler';

/**
 * Interface for music track configuration
 */
interface MusicTrack {
    id: string;
    path: string;
    volume?: number;
}

/**
 * Manages background music and audio functionality with cross-fading capability
 */
export class AudioManager {
    private static instance: AudioManager;
    private currentMusic: Howl | null = null;
    private nextMusic: Howl | null = null;
    private musicTracks: Map<string, Howl> = new Map();
    private currentVolume: number = 1.0;
    private isFading: boolean = false;
    
    private readonly DEFAULT_FADE_DURATION: number = 2000; // ms
    private readonly MIN_VOLUME: number = 0;
    private readonly MAX_VOLUME: number = 1;

    private constructor() {
        // Private constructor for singleton pattern
    }

    /**
     * Gets the singleton instance of AudioManager
     */
    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * Loads a music track into memory
     * @param track Music track configuration
     * @throws Error if track loading fails
     */
    public async loadMusic(track: MusicTrack): Promise<void> {
        try {
            const music = new Howl({
                src: [track.path],
                loop: true,
                volume: track.volume ?? this.currentVolume,
                preload: true,
            });

            return new Promise((resolve, reject) => {
                music.once('load', () => {
                    this.musicTracks.set(track.id, music);
                    resolve();
                });

                music.once('loaderror', (id, error) => {
                    reject(new Error(`Failed to load music track: ${error}`));
                });
            });
        } catch (error) {
            throw new Error(`Error loading music track: ${error.message}`);
        }
    }

    /**
     * Plays a music track with optional cross-fade
     * @param trackId ID of the track to play
     * @param fadeTime Duration of the fade in milliseconds
     * @throws Error if track is not found
     */
    public async playMusic(trackId: string, fadeTime: number = this.DEFAULT_FADE_DURATION): Promise<void> {
        const newTrack = this.musicTracks.get(trackId);
        if (!newTrack) {
            throw new Error(`Music track '${trackId}' not found`);
        }

        if (this.isFading) {
            return;
        }

        // If there's currently playing music, cross-fade
        if (this.currentMusic && this.currentMusic.playing()) {
            this.nextMusic = newTrack;
            await this.crossFade(fadeTime);
        } else {
            // No current music, just play the new track
            newTrack.volume(this.currentVolume);
            newTrack.play();
            this.currentMusic = newTrack;
        }
    }

    /**
     * Stops the current music with optional fade out
     * @param fadeTime Duration of the fade in milliseconds
     */
    public async stopMusic(fadeTime: number = this.DEFAULT_FADE_DURATION): Promise<void> {
        if (!this.currentMusic || this.isFading) {
            return;
        }

        await this.fadeOut(this.currentMusic, fadeTime);
        this.currentMusic.stop();
        this.currentMusic = null;
    }

    /**
     * Sets the global music volume
     * @param volume Volume level (0.0 to 1.0)
     */
    public setVolume(volume: number): void {
        this.currentVolume = Math.max(this.MIN_VOLUME, Math.min(this.MAX_VOLUME, volume));
        if (this.currentMusic) {
            this.currentMusic.volume(this.currentVolume);
        }
    }

    /**
     * Performs cross-fade between current and next music tracks
     * @param duration Duration of the cross-fade in milliseconds
     */
    private async crossFade(duration: number): Promise<void> {
        if (!this.currentMusic || !this.nextMusic || this.isFading) {
            return;
        }

        this.isFading = true;
        const steps = 60;
        const stepDuration = duration / steps;
        const volumeStep = this.currentVolume / steps;

        this.nextMusic.volume(0);
        this.nextMusic.play();

        return new Promise<void>((resolve) => {
            const fadeInterval = setInterval(() => {
                const currentVol = this.currentMusic!.volume();
                const nextVol = this.nextMusic!.volume();

                if (currentVol <= this.MIN_VOLUME) {
                    clearInterval(fadeInterval);
                    this.currentMusic!.stop();
                    this.currentMusic = this.nextMusic;
                    this.nextMusic = null;
                    this.isFading = false;
                    resolve();
                    return;
                }

                this.currentMusic!.volume(currentVol - volumeStep);
                this.nextMusic!.volume(nextVol + volumeStep);
            }, stepDuration);
        });
    }

    /**
     * Fades out a music track
     * @param track Track to fade out
     * @param duration Duration of the fade in milliseconds
     */
    private async fadeOut(track: Howl, duration: number): Promise<void> {
        const steps = 60;
        const stepDuration = duration / steps;
        const volumeStep = this.currentVolume / steps;

        return new Promise<void>((resolve) => {
            const fadeInterval = setInterval(() => {
                const currentVol = track.volume();

                if (currentVol <= this.MIN_VOLUME) {
                    clearInterval(fadeInterval);
                    resolve();
                    return;
                }

                track.volume(currentVol - volumeStep);
            }, stepDuration);
        });
    }

    /**
     * Cleans up and unloads all music tracks
     */
    public dispose(): void {
        this.musicTracks.forEach(track => track.unload());
        this.musicTracks.clear();
        this.currentMusic = null;
        this.nextMusic = null;
    }
}