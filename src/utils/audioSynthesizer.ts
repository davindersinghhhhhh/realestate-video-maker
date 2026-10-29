import { MusicTheme } from '../types/property';

class AudioSynthesizerManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private isPlaying = false;
  private loopInterval: number | null = null;
  private currentTheme: MusicTheme = 'luxury_ambient';
  private currentStep = 0;
  private isMuted = false;
  private musicVolume = 0.35;
  private voiceVolume = 1.0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.musicGain.gain.value = this.musicVolume;

      this.destinationNode = this.ctx.createMediaStreamDestination();

      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.destinationNode);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioStream(): MediaStreamTrack | null {
    this.initContext();
    return this.destinationNode?.stream.getAudioTracks()[0] || null;
  }

  public setMusicTheme(theme: MusicTheme) {
    this.currentTheme = theme;
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setVoiceVolume(volume: number) {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  /**
   * Synthesizes a chord and bass progression based on theme.
   */
  private playChordProgression() {
    if (!this.ctx || !this.musicGain || this.currentTheme === 'none') return;

    const t = this.ctx.currentTime;

    // Chords defined by frequencies (in Hz)
    // Key of Db major / Eb minor for modern luxury real estate vibes
    const themes: Record<Exclude<MusicTheme, 'none'>, { bass: number[]; chords: number[][] }> = {
      luxury_ambient: {
        bass: [130.81, 146.83, 174.61, 196.0], // C3, D3, F3, G3
        chords: [
          [261.63, 329.63, 392.0, 523.25], // Cmaj7 / Cadd9
          [293.66, 349.23, 440.0, 587.33], // Dmin7
          [349.23, 440.0, 523.25, 659.25], // Fmaj7
          [392.0, 493.88, 587.33, 783.99], // Gsus4 / G
        ],
      },
      cinematic_elegance: {
        bass: [110.0, 130.81, 146.83, 164.81], // A2, C3, D3, E3
        chords: [
          [220.0, 261.63, 329.63, 440.0],
          [261.63, 329.63, 392.0, 523.25],
          [293.66, 369.99, 440.0, 587.33],
          [329.63, 392.0, 493.88, 659.25],
        ],
      },
      modern_acoustic: {
        bass: [146.83, 174.61, 196.0, 220.0],
        chords: [
          [293.66, 369.99, 440.0, 587.33],
          [349.23, 440.0, 523.25, 698.46],
          [392.0, 493.88, 587.33, 783.99],
          [440.0, 554.37, 659.25, 880.0],
        ],
      },
      upbeat_urban: {
        bass: [98.0, 123.47, 130.81, 146.83],
        chords: [
          [196.0, 246.94, 293.66, 392.0],
          [246.94, 311.13, 369.99, 493.88],
          [261.63, 329.63, 392.0, 523.25],
          [293.66, 369.99, 440.0, 587.33],
        ],
      },
    };

    const currentProg = themes[this.currentTheme] || themes.luxury_ambient;
    const chordIndex = this.currentStep % currentProg.chords.length;
    const bassFreq = currentProg.bass[chordIndex];
    const notes = currentProg.chords[chordIndex];

    // Bass note: Warm sine wave
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq, t);

    bassGain.gain.setValueAtTime(0.001, t);
    bassGain.gain.linearRampToValueAtTime(0.18, t + 0.15);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);

    bassOsc.connect(bassGain);
    bassGain.connect(this.musicGain);

    bassOsc.start(t);
    bassOsc.stop(t + 2.85);

    // Warm chord pad: detuned oscillators with low pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.connect(this.musicGain);

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const delay = i * 0.08;
      noteGain.gain.setValueAtTime(0.0001, t + delay);
      noteGain.gain.linearRampToValueAtTime(0.04, t + delay + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 2.6);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(t + delay);
      osc.stop(t + delay + 2.7);
    });

    // Subtle gentle chime / sparkle
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(notes[2] * 2, t + 0.4);

    bellGain.gain.setValueAtTime(0.0001, t + 0.4);
    bellGain.gain.linearRampToValueAtTime(0.02, t + 0.45);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    bellOsc.connect(bellGain);
    bellGain.connect(this.musicGain);

    bellOsc.start(t + 0.4);
    bellOsc.stop(t + 1.65);

    this.currentStep++;
  }

  public startMusic() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    this.playChordProgression();
    this.loopInterval = window.setInterval(() => {
      if (this.isPlaying) {
        this.playChordProgression();
      }
    }, 2800);
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  /**
   * Reads voiceover script using Web Speech API, with rate and pitch tuned for real estate presentation.
   */
  public speakNarration(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    if (!text || text.trim().length === 0 || this.voiceVolume === 0) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96; // Slightly poised, clear delivery
    utterance.pitch = 1.0;
    utterance.volume = this.isMuted ? 0 : this.voiceVolume;

    // Pick best English voice available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public stopAll() {
    this.stopMusic();
    this.stopNarration();
  }
}

export const audioSynthesizer = new AudioSynthesizerManager();
