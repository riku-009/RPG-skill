/**
 * Retro Chiptune Web Audio Synthesizer for RPG Music and Sound Effects
 * 100% self-contained procedurally generated tracks.
 */

type TrackType = 'town' | 'dungeon' | 'battle' | 'boss' | 'none';
type SFXType = 'hit' | 'heal' | 'levelUp' | 'click' | 'flee' | 'defeat' | 'victory' | 'reincarnate';

class RetroAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: TrackType = 'none';
  private isMuted: boolean = true;
  private sequencerTimer: any = null;
  private currentBeat: number = 0;
  private tempo: number = 120; // BPM

  // Notes schedules: list of [melodyNote, bassNote, typeOfPercussion]
  // Note pitch specified in frequency or semi-tone offset from base chord.
  // Frequencies corresponding to notes
  private frequencies: Record<string, number> = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'E6': 1318.51, 'G6': 1567.98, 'B6': 1975.53,
    '-': 0 // Rest
  };

  constructor() {
    // Lazy initialisation to prevent audio playing blockages on load.
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, this.ctx.currentTime);
    } catch (e) {
      console.warn('Web Audio API not supported in this browser', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.initContext();
    if (this.masterGain && this.ctx) {
      const targetVolume = this.isMuted ? 0 : 0.2;
      this.masterGain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.1);
    }
    // Auto-resume if context was suspended by browser security
    if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
      this.ctx.resume();
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  public getCurrentTrack(): TrackType {
    return this.currentTrack;
  }

  // Composed chiptune sheets (16 steps repeating)
  private getTrackNotes(track: TrackType): { melody: string[]; bass: string[]; drum: ('kick' | 'snare' | 'hihat' | '-')[] } {
    switch (track) {
      case 'town': // Warm, cheerful town theme (A Major, 3/4 feel or bouncing Major)
        return {
          melody: ['C#4', 'E4', 'A4', 'C#5', 'B4', 'A4', 'G#4', 'E4', 'F#4', 'A4', 'E4', 'C#4', 'D4', 'B3', 'C#4', '-'],
          bass:   ['A2',  'A2', 'C3', 'E3',  'E2', 'E2', 'G#2', 'B2',  'F#2', 'F#2', 'A2', 'E3',  'D2', 'D2', 'E2',  'E2'],
          drum:   ['kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', '-']
        };
      case 'dungeon': // Tense, spooky dungeon theme (D minor / chromatic)
        return {
          melody: ['D4', 'F4', 'G#4', 'A4', 'D5', 'C#5', 'A4', 'F4', 'G#4', '-', 'G4', 'F4', 'C#4', 'E4', 'D4', '-'],
          bass:   ['D2', 'D2', 'D3',  'D2', 'A2', 'A2',  'G2', 'F2', 'Bb2', 'Bb2', 'G2', 'E2', 'A2',  'A2', 'D2', '-'],
          drum:   ['kick', '-', 'hihat', '-', 'snare', '-', 'hihat', '-', 'kick', 'hihat', 'snare', '-', 'kick', '-', '-', '-']
        };
      case 'battle': // High tension, energetic battler (E minor, rapid heavy bass)
        return {
          melody: ['E4', 'G4', 'B4', 'C5', 'A4', 'C5', 'B4', 'G4', 'F#4', 'A4', 'G4', 'E4', 'D#4', 'F#4', 'E4', 'B4'],
          bass:   ['E2', 'E3', 'G2', 'E3', 'A2', 'E3', 'G2', 'E3', 'B2',  'F#3', 'G2', 'E3', 'B2',  'B2',  'E2', 'B2'],
          drum:   ['kick', 'hihat', 'kick', 'snare', 'kick', 'hihat', 'kick', 'snare', 'kick', 'hihat', 'kick', 'snare', 'kick', 'hihat', 'snare', 'hihat']
        };
      case 'boss': // Extremely epic dramatic evil march (C# minor, chaotic)
        return {
          melody: ['C#4', 'C#5', 'B4', 'G#4', 'F#4', 'G#4', 'A4', 'F#4', 'C#4', 'G3', 'C#4', 'G#3', 'A3', 'F3', 'C#4', '-'],
          bass:   ['C#2', 'C#2', 'G#2', 'G#2', 'F#2', 'F#2', 'A2', 'A2', 'C#2', 'C#2', 'G2', 'G2', 'D#2', 'D#2', 'C#2', '-'],
          drum:   ['kick', 'snare', 'kick', 'snare', 'kick', 'kick', 'snare', 'hihat', 'kick', 'snare', 'kick', 'snare', 'kick', 'kick', 'snare', 'kick']
        };
      default:
        return { melody: [], bass: [], drum: [] };
    }
  }

  public playTrack(track: TrackType) {
    this.initContext();
    if (this.currentTrack === track) return;
    
    // Stop editing old sequencer loop
    this.stopSequencer();
    
    this.currentTrack = track;
    if (track === 'none' || !this.ctx) return;

    this.tempo = track === 'battle' ? 140 : track === 'boss' ? 150 : track === 'dungeon' ? 100 : 115;
    this.currentBeat = 0;
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const stepDuration = 60 / this.tempo / 2; // eighth notes
    const playSequencerStep = () => {
      const sheet = this.getTrackNotes(this.currentTrack);
      if (!sheet || sheet.melody.length === 0) return;

      const idx = this.currentBeat % sheet.melody.length;
      const melodyNote = sheet.melody[idx];
      const bassNote = sheet.bass[idx];
      const drumSound = sheet.drum[idx];

      if (this.ctx && !this.isMuted) {
        const time = this.ctx.currentTime;
        
        // 1. Play melody (Square wave)
        if (melodyNote !== '-' && this.frequencies[melodyNote]) {
          this.triggerPulseNote(this.frequencies[melodyNote], 0.05, stepDuration * 0.9, 'square', time);
        }
        
        // 2. Play bass line (Triangle wave, warmer & rounder)
        if (bassNote !== '-' && this.frequencies[bassNote]) {
          this.triggerPulseNote(this.frequencies[bassNote], 0.08, stepDuration, 'triangle', time);
        }

        // 3. Play Percussion (White noise or brief sine drops)
        if (drumSound === 'kick') {
          this.triggerKick(time);
        } else if (drumSound === 'snare') {
          this.triggerSnare(time);
        } else if (drumSound === 'hihat') {
          this.triggerHihat(time);
        }
      }

      this.currentBeat++;
      this.sequencerTimer = setTimeout(playSequencerStep, stepDuration * 1000);
    };

    playSequencerStep();
  }

  private stopSequencer() {
    if (this.sequencerTimer) {
      clearTimeout(this.sequencerTimer);
      this.sequencerTimer = null;
    }
  }

  // Synthesize custom retro note parameters
  private triggerPulseNote(freq: number, gainVal: number, duration: number, type: OscillatorType, time: number) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    oscGain.gain.setValueAtTime(gainVal, time);
    // Envelope: quick decay
    oscGain.gain.linearRampToValueAtTime(gainVal * 0.5, time + duration * 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  // Procedural 8-bit Kick drum sound
  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15); // descending frequency chirp
    
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  // Procedural 8-bit chiptune Snare drum sound (white noise generator + high pass filtration)
  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    
    // Create random buffer representing white noise
    const bufferSize = this.ctx.sampleRate * 0.15; // 150ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noiseSource.start(time);
    noiseSource.stop(time + 0.15);
  }

  // High pitch hihat tinks
  private triggerHihat(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, time);
    
    gain.gain.setValueAtTime(0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.04);
  }

  // SOUND EFFECTS (SFX) triggering
  public playSFX(sfx: SFXType) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const time = this.ctx.currentTime;

    switch (sfx) {
      case 'click':
        // A single short blip
        this.triggerPulseNote(1000, 0.04, 0.06, 'triangle', time);
        break;
      case 'hit':
        // White noise slash and low sine sweep combo
        this.triggerSnare(time);
        this.triggerPulseNote(110, 0.15, 0.15, 'sawtooth', time);
        break;
      case 'heal':
        // A fast arpeggio in sine
        this.triggerPulseNote(523.25, 0.06, 0.08, 'sine', time); // C5
        this.triggerPulseNote(659.25, 0.06, 0.08, 'sine', time + 0.05); // E5
        this.triggerPulseNote(783.99, 0.06, 0.08, 'sine', time + 0.10); // G5
        this.triggerPulseNote(1046.5, 0.08, 0.15, 'sine', time + 0.15); // C6
        break;
      case 'levelUp':
        // Golden sound: C5, E5, G5, C6 (louder with square + vibrant gain)
        this.triggerPulseNote(523.25, 0.1, 0.12, 'square', time);
        this.triggerPulseNote(659.25, 0.1, 0.12, 'square', time + 0.1);
        this.triggerPulseNote(783.99, 0.1, 0.12, 'square', time + 0.2);
        this.triggerPulseNote(1046.5, 0.12, 0.35, 'square', time + 0.3);
        break;
      case 'flee':
        // Sliding frequencies downwards
        for (let idx = 0; idx < 4; idx++) {
          this.triggerPulseNote(300 - idx * 50, 0.08, 0.07, 'triangle', time + idx * 0.06);
        }
        break;
      case 'defeat':
        // Gutteral low drone notes dropping down
        this.triggerPulseNote(220.00, 0.12, 0.2, 'sawtooth', time);
        this.triggerPulseNote(174.61, 0.12, 0.2, 'sawtooth', time + 0.18);
        this.triggerPulseNote(146.83, 0.15, 0.5, 'sawtooth', time + 0.36);
        break;
      case 'victory':
        // Triumphant RPG music fanfare snippet: C4 -> G4 -> C5 -> E5 -> G5 -> C6
        this.triggerPulseNote(261.63, 0.08, 0.10, 'square', time);
        this.triggerPulseNote(392.00, 0.08, 0.10, 'square', time + 0.08);
        this.triggerPulseNote(523.25, 0.08, 0.10, 'square', time + 0.16);
        this.triggerPulseNote(659.25, 0.08, 0.10, 'square', time + 0.24);
        this.triggerPulseNote(783.99, 0.08, 0.10, 'square', time + 0.32);
        this.triggerPulseNote(1046.5, 0.12, 0.50, 'square', time + 0.40);
        break;
      case 'reincarnate':
        // A dazzling space age synth rise
        for (let i = 0; i < 12; i++) {
          const f = 200 * Math.pow(1.15, i);
          this.triggerPulseNote(f, 0.05, 0.08, 'triangle', time + i * 0.04);
        }
        this.triggerPulseNote(1567.98, 0.10, 0.5, 'sine', time + 0.5);
        break;
    }
  }
}

export const retroAudio = new RetroAudioManager();
