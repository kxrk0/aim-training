import { useRef, useCallback } from 'react'

// Aim Labs style sound effects
export class AudioSystem {
  private hitSounds: { [key: string]: HTMLAudioElement[] } = {}
  private missSounds: HTMLAudioElement[] = []
  private uiSounds: { [key: string]: HTMLAudioElement[] } = {}
  private masterVolume = 0.7
  private hitVolume = 0.8
  private missVolume = 0.6
  private uiVolume = 0.5

  constructor() {
    this.initializeSounds()
  }

  private initializeSounds() {
    // Hit sounds for different accuracy levels
    this.hitSounds.perfect = this.createAudioPool(this.generateHitTone(800, 0.15, 'sine'), 5)
    this.hitSounds.good = this.createAudioPool(this.generateHitTone(600, 0.12, 'sine'), 5)
    this.hitSounds.normal = this.createAudioPool(this.generateHitTone(400, 0.1, 'sine'), 5)
    
    // Miss sound
    this.missSounds = this.createAudioPool(this.generateMissTone(), 3)
    
    // UI sounds
    this.uiSounds.levelUp = this.createAudioPool(this.generateLevelUpTone(), 2)
    this.uiSounds.xpGain = this.createAudioPool(this.generateXPTone(), 3)
    this.uiSounds.menuClick = this.createAudioPool(this.generateClickTone(), 2)
  }

  private createAudioPool(audioBuffer: string, poolSize: number): HTMLAudioElement[] {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(audioBuffer)
      audio.volume = 0
      pool.push(audio)
    }
    return pool
  }

  private generateHitTone(frequency: number, duration: number, waveType: OscillatorType = 'sine'): string {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    // Create a buffer for the tone
    const sampleRate = audioContext.sampleRate
    const numSamples = Math.floor(sampleRate * duration)
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate the tone with envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 8) // Exponential decay
      const sample = Math.sin(2 * Math.PI * frequency * t) * envelope
      data[i] = sample * 0.3 // Volume control
    }
    
    // Convert buffer to data URL
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = numSamples
    canvas.height = 1
    
    // Create a simple data URL for the audio
    // This is a simplified approach - in production, you'd use proper audio encoding
    return `data:audio/wav;base64,${this.encodeWAV(buffer)}`
  }

  private generateMissTone(): string {
    return this.generateComplexTone([200, 150], 0.2, 'sawtooth')
  }

  private generateLevelUpTone(): string {
    return this.generateComplexTone([523, 659, 784, 1047], 0.8, 'sine')
  }

  private generateXPTone(): string {
    return this.generateComplexTone([400, 500], 0.3, 'triangle')
  }

  private generateClickTone(): string {
    return this.generateComplexTone([800], 0.1, 'square')
  }

  private generateComplexTone(frequencies: number[], duration: number, waveType: OscillatorType): string {
    // Simplified tone generation - using the first frequency
    return this.generateHitTone(frequencies[0], duration, waveType)
  }

  private encodeWAV(buffer: AudioBuffer): string {
    // Simplified WAV encoding - in production use a proper library
    const length = buffer.length * buffer.numberOfChannels * 2
    const arrayBuffer = new ArrayBuffer(44 + length)
    const view = new DataView(arrayBuffer)
    const channels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * channels * 2, true)
    view.setUint16(32, channels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length, true)
    
    // Convert buffer to PCM
    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < channels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
      }
    }
    
    // Convert to base64
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private getAvailableAudio(pool: HTMLAudioElement[]): HTMLAudioElement | null {
    return pool.find(audio => audio.paused) || null
  }

  playHitSound(accuracy: number = 80, distance: number = 1) {
    let soundType = 'normal'
    if (accuracy >= 95) soundType = 'perfect'
    else if (accuracy >= 85) soundType = 'good'
    
    const audio = this.getAvailableAudio(this.hitSounds[soundType])
    if (audio) {
      // Adjust volume based on distance and accuracy
      const volumeMultiplier = Math.max(0.3, 1 - distance * 0.1)
      const accuracyBonus = accuracy > 90 ? 1.2 : 1.0
      
      audio.volume = this.masterVolume * this.hitVolume * volumeMultiplier * accuracyBonus
      audio.currentTime = 0
      audio.play().catch(() => {}) // Ignore autoplay policy errors
    }
  }

  playMissSound() {
    const audio = this.getAvailableAudio(this.missSounds)
    if (audio) {
      audio.volume = this.masterVolume * this.missVolume
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }

  playLevelUpSound() {
    const audio = this.getAvailableAudio(this.uiSounds.levelUp)
    if (audio) {
      audio.volume = this.masterVolume * this.uiVolume * 1.5
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }

  playXPGainSound(xpAmount: number) {
    const audio = this.getAvailableAudio(this.uiSounds.xpGain)
    if (audio) {
      // Scale volume based on XP amount
      const volumeMultiplier = Math.min(1.5, 1 + (xpAmount / 100))
      audio.volume = this.masterVolume * this.uiVolume * volumeMultiplier
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }

  playMenuClickSound() {
    const audio = this.getAvailableAudio(this.uiSounds.menuClick)
    if (audio) {
      audio.volume = this.masterVolume * this.uiVolume
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }
}

// Hook for using the audio system
export function useAudioSystem() {
  const audioSystemRef = useRef<AudioSystem | null>(null)

  if (!audioSystemRef.current) {
    audioSystemRef.current = new AudioSystem()
  }

  const playHitSound = useCallback((accuracy: number, distance: number = 1) => {
    audioSystemRef.current?.playHitSound(accuracy, distance)
  }, [])

  const playMissSound = useCallback(() => {
    audioSystemRef.current?.playMissSound()
  }, [])

  const playLevelUpSound = useCallback(() => {
    audioSystemRef.current?.playLevelUpSound()
  }, [])

  const playXPGainSound = useCallback((xpAmount: number) => {
    audioSystemRef.current?.playXPGainSound(xpAmount)
  }, [])

  const playMenuClickSound = useCallback(() => {
    audioSystemRef.current?.playMenuClickSound()
  }, [])

  const setMasterVolume = useCallback((volume: number) => {
    audioSystemRef.current?.setMasterVolume(volume)
  }, [])

  return {
    playHitSound,
    playMissSound,
    playLevelUpSound,
    playXPGainSound,
    playMenuClickSound,
    setMasterVolume
  }
}