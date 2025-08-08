/**
 * @file AudioTypes.ts
 * @description Type definitions and interfaces for the audio management system.
 * These types provide the foundation for handling sound effects and music in the application.
 * 
 * @module AudioTypes
 * @version 1.0.0
 */

/**
 * Supported audio file formats
 */
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'm4a';

/**
 * Audio asset categories
 */
export type AudioCategory = 'music' | 'sfx' | 'voice' | 'ambient';

/**
 * Represents the state of an audio instance
 */
export type AudioState = 'playing' | 'paused' | 'stopped' | 'loading' | 'error';

/**
 * Configuration options for audio playback
 */
export interface AudioConfig {
  volume: number;           // Range: 0-1
  loop: boolean;           // Whether the audio should loop
  autoplay?: boolean;      // Whether to play automatically when loaded
  preload?: boolean;       // Whether to preload the audio
  muted?: boolean;         // Whether the audio is muted
}

/**
 * Metadata for an audio asset
 */
export interface AudioMetadata {
  readonly id: string;
  readonly name: string;
  readonly format: AudioFormat;
  readonly duration: number;
  readonly category: AudioCategory;
  readonly size: number;      // File size in bytes
  readonly sampleRate?: number;
  readonly channels?: number;
}

/**
 * Represents an audio asset with its configuration
 */
export interface AudioAsset {
  metadata: AudioMetadata;
  config: AudioConfig;
  state: AudioState;
  path: string;
}

/**
 * Options for fading audio
 */
export interface FadeOptions {
  duration: number;        // Duration in milliseconds
  from: number;           // Starting volume (0-1)
  to: number;             // Ending volume (0-1)
  easing?: 'linear' | 'exponential' | 'logarithmic';
}

/**
 * Audio playback statistics
 */
export interface AudioStats {
  totalPlayed: number;
  currentlyPlaying: number;
  failedLoads: number;
  memoryUsage: number;    // Approximate memory usage in bytes
}

/**
 * Error codes specific to audio operations
 */
export enum AudioErrorCode {
  LOAD_FAILED = 'LOAD_FAILED',
  DECODE_ERROR = 'DECODE_ERROR',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  PLAYBACK_ERROR = 'PLAYBACK_ERROR',
  INVALID_STATE = 'INVALID_STATE',
  RESOURCE_BUSY = 'RESOURCE_BUSY'
}

/**
 * Custom error class for audio-related errors
 */
export class AudioError extends Error {
  constructor(
    public code: AudioErrorCode,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AudioError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AudioError);
    }
  }
}

/**
 * Events that can be emitted by the audio system
 */
export interface AudioEvents {
  onPlay: (assetId: string) => void;
  onPause: (assetId: string) => void;
  onStop: (assetId: string) => void;
  onEnd: (assetId: string) => void;
  onError: (error: AudioError) => void;
  onLoad: (asset: AudioAsset) => void;
  onVolumeChange: (assetId: string, volume: number) => void;
}

/**
 * Default configuration values for audio assets
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  volume: 1,
  loop: false,
  autoplay: false,
  preload: true,
  muted: false
};

/**
 * Validation functions for audio-related data
 */
export const AudioValidation = {
  isValidVolume: (volume: number): boolean => {
    return typeof volume === 'number' && volume >= 0 && volume <= 1;
  },
  
  isValidAudioFormat: (format: string): format is AudioFormat => {
    return ['mp3', 'wav', 'ogg', 'm4a'].includes(format);
  },
  
  isValidCategory: (category: string): category is AudioCategory => {
    return ['music', 'sfx', 'voice', 'ambient'].includes(category);
  }
};