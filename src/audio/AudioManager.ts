/**
 * @file AudioManager.ts
 * @description Audio management system for handling sound effects and background music.
 * Implements the Singleton pattern to ensure a single point of audio control.
 */

// Types and interfaces
interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}

interface AudioTrack {
  audio: HTMLAudioElement;
  volume: number;
  category: 'music' | 'sfx';
  loop: boolean;
}

/**
 * Manages all audio operations including background music and sound effects.
 * Implements the Singleton pattern to ensure only one audio controller exists.
 */
export class AudioManager {
  private static instance: AudioManager;
  
  private readonly audioMap: Map<string, AudioTrack>;
  private config: AudioConfig;
  private currentMusic?: string;
  
  private constructor() {
    this.audioMap = new Map();
    this.config = {
      masterVolume: 1,
      musicVolume: 0.7,
      sfxVolume: 1,
      isMuted: false
    };
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
   * Loads an audio file and stores it in the audio map
   * @param id Unique identifier for the audio
   * @param url URL of the audio file
   * @param category Type of audio (music or sfx)
   * @param loop Whether the audio should loop
   * @throws Error if audio loading fails
   */
  public async loadAudio(
    id: string,
    url: string,
    category: 'music' | 'sfx',
    loop: boolean = false
  ): Promise<void> {
    try {
      const audio = new Audio(url);
      const track: AudioTrack = {
        audio,
        volume: category === 'music' ? this.config.musicVolume : this.config.sfxVolume,
        category,
        loop
      };

      audio.loop = loop;
      this.audioMap.set(id, track);

      // Ensure audio is loaded before proceeding
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });
    } catch (error) {
      throw new Error(`Failed to load audio ${id}: ${error.message}`);
    }
  }

  /**
   * Plays the specified audio track
   * @param id Identifier of the audio to play
   * @throws Error if audio is not found
   */
  public play(id: string): void {
    const track = this.audioMap.get(id);
    if (!track) {
      throw new Error(`Audio track ${id} not found`);
    }

    if (track.category === 'music') {
      this.stopCurrentMusic();
      this.currentMusic = id;
    }

    track.audio.currentTime = 0;
    track.audio.volume = this.calculateVolume(track);
    track.audio.play().catch(error => {
      console.error(`Failed to play audio ${id}:`, error);
    });
  }

  /**
   * Stops the specified audio track
   * @param id Identifier of the audio to stop
   */
  public stop(id: string): void {
    const track = this.audioMap.get(id);
    if (track) {
      track.audio.pause();
      track.audio.currentTime = 0;
      if (id === this.currentMusic) {
        this.currentMusic = undefined;
      }
    }
  }

  /**
   * Sets the master volume level
   * @param volume Volume level (0-1)
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = this.clampVolume(volume);
    this.updateAllVolumes();
  }

  /**
   * Sets the music volume level
   * @param volume Volume level (0-1)
   */
  public setMusicVolume(volume: number): void {
    this.config.musicVolume = this.clampVolume(volume);
    this.updateCategoryVolumes('music');
  }

  /**
   * Sets the sound effects volume level
   * @param volume Volume level (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.config.sfxVolume = this.clampVolume(volume);
    this.updateCategoryVolumes('sfx');
  }

  /**
   * Mutes/unmutes all audio
   * @param muted Mute state
   */
  public setMuted(muted: boolean): void {
    this.config.isMuted = muted;
    this.updateAllVolumes();
  }

  /**
   * Cleans up and removes all audio tracks
   */
  public dispose(): void {
    this.audioMap.forEach(track => {
      track.audio.pause();
      track.audio.src = '';
    });
    this.audioMap.clear();
    this.currentMusic = undefined;
  }

  // Private helper methods
  private stopCurrentMusic(): void {
    if (this.currentMusic) {
      this.stop(this.currentMusic);
    }
  }

  private calculateVolume(track: AudioTrack): number {
    if (this.config.isMuted) return 0;
    const categoryVolume = track.category === 'music' 
      ? this.config.musicVolume 
      : this.config.sfxVolume;
    return this.clampVolume(this.config.masterVolume * categoryVolume);
  }

  private clampVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
  }

  private updateAllVolumes(): void {
    this.audioMap.forEach((track) => {
      track.audio.volume = this.calculateVolume(track);
    });
  }

  private updateCategoryVolumes(category: 'music' | 'sfx'): void {
    this.audioMap.forEach((track) => {
      if (track.category === category) {
        track.audio.volume = this.calculateVolume(track);
      }
    });
  }
}

// Export a default instance
export default AudioManager.getInstance();