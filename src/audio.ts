// Web Audio API Birthday Melody Synthesizer

export const NOTES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

export const MELODY: [string, number][] = [
  ["G4", 0.35],
  ["G4", 0.35],
  ["A4", 0.70],
  ["G4", 0.70],
  ["C5", 0.70],
  ["B4", 1.20],

  ["G4", 0.35],
  ["G4", 0.35],
  ["A4", 0.70],
  ["G4", 0.70],
  ["D5", 0.70],
  ["C5", 1.20],

  ["G4", 0.35],
  ["G4", 0.35],
  ["G5", 0.70],
  ["E5", 0.70],
  ["C5", 0.70],
  ["B4", 0.70],
  ["A4", 1.20],

  ["F5", 0.35],
  ["F5", 0.35],
  ["E5", 0.70],
  ["C5", 0.70],
  ["D5", 0.70],
  ["C5", 1.50],
];

let audioContext: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let stopTimeoutId: number | null = null;

export function stopMelody(): void {
  if (stopTimeoutId !== null) {
    window.clearTimeout(stopTimeoutId);
    stopTimeoutId = null;
  }
  for (const osc of activeOscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // already stopped
    }
  }
  activeOscillators = [];
}

export async function playBirthdaySong(
  onEnded: () => void
): Promise<void> {
  stopMelody();

  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  let currentTime = audioContext.currentTime;

  MELODY.forEach(([note, duration]) => {
    if (!audioContext) return;
    const freq = NOTES[note];
    if (!freq) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(audioContext.destination);

    // Fade in
    gain.gain.setValueAtTime(0.0001, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, currentTime + 0.03);

    // Fade out
    gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + duration);

    osc.start(currentTime);
    osc.stop(currentTime + duration + 0.03);

    activeOscillators.push(osc);
    currentTime += duration;
  });

  const totalDuration = MELODY.reduce((sum, item) => sum + item[1], 0);
  stopTimeoutId = window.setTimeout(() => {
    activeOscillators = [];
    stopTimeoutId = null;
    onEnded();
  }, totalDuration * 1000 + 500);
}
