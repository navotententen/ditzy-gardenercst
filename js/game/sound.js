// sound.js - sound effects made with the browser's Web Audio API.
// No sound files are needed: each effect is a few short musical tones.

export class SoundManager {
  constructor() {
    this.context = null; // created on the first click (browsers require this)
    this.muted = false;
  }

  /** Must be called from a click/key press so the browser allows sound. */
  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    }
    if (this.context && this.context.state === "suspended") {
      this.context.resume();
    }
  }

  /** Switches sound on/off. Returns true if now muted. */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Plays one tone.
   * @param {number} frequency - pitch in Hz
   * @param {number} duration - length in seconds
   * @param {string} type - "sine", "square", "triangle" or "sawtooth"
   * @param {number} delay - seconds to wait before playing
   * @param {number} [slideTo] - optional pitch to slide to
   */
  playTone(frequency, duration, type, delay, slideTo) {
    if (this.muted || !this.context) {
      return;
    }
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const volume = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slideTo) {
      oscillator.frequency.linearRampToValueAtTime(slideTo, start + duration);
    }

    // Fade out so the tone doesn't click
    volume.gain.setValueAtTime(0.16, start);
    volume.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.connect(volume);
    volume.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  /** Picking a flower: a short happy blip. */
  pick() {
    this.playTone(660, 0.09, "sine", 0, 880);
  }

  /** Bee sting: a low buzzy drop. */
  sting() {
    this.playTone(240, 0.35, "sawtooth", 0, 90);
  }

  /** Sting blocked by the ladybug shield. */
  shield() {
    this.playTone(520, 0.08, "square", 0);
    this.playTone(780, 0.12, "square", 0.08);
  }

  /** Bouquet delivered: a happy three-note jingle. */
  deliver() {
    this.playTone(523, 0.14, "triangle", 0);
    this.playTone(659, 0.14, "triangle", 0.12);
    this.playTone(784, 0.25, "triangle", 0.24);
  }

  /** Power-up collected: a sparkly rise. */
  powerUp() {
    this.playTone(600, 0.1, "sine", 0);
    this.playTone(900, 0.1, "sine", 0.09);
    this.playTone(1300, 0.2, "sine", 0.18);
  }

  /** Customer left unhappy. */
  expire() {
    this.playTone(330, 0.2, "triangle", 0);
    this.playTone(247, 0.3, "triangle", 0.18);
  }

  /** Level complete or game won: a longer fanfare. */
  win() {
    [523, 659, 784, 1047].forEach((note, index) => {
      this.playTone(note, 0.22, "triangle", index * 0.15);
    });
  }

  /** Game over: a sad falling tune. */
  gameOver() {
    [392, 330, 262].forEach((note, index) => {
      this.playTone(note, 0.3, "sine", index * 0.25);
    });
  }
}
