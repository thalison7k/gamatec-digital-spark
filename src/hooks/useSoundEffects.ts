import { useCallback, useRef, useEffect } from "react";

type SoundType = "click" | "hover" | "success" | "error" | "whoosh" | "ambient";

const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  detune = 0
) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.detune.setValueAtTime(detune, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playClick() {
  playTone(800, 0.08, "square", 0.06);
  playTone(1200, 0.05, "sine", 0.04);
}

function playHover() {
  playTone(600, 0.06, "sine", 0.03);
}

function playSuccess() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}

function playError() {
  playTone(200, 0.3, "sawtooth", 0.08, 50);
  setTimeout(() => playTone(150, 0.3, "sawtooth", 0.06, 30), 150);
}

function playWhoosh() {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.15);
  filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);
  filter.Q.setValueAtTime(2, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
  source.stop(ctx.currentTime + 0.3);
}

let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

function startAmbient() {
  if (ambientNodes.length > 0) return;

  const ctx = getAudioContext();
  const freqs = [65, 98, 131];

  freqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    ambientNodes.push({ osc, gain });
  });
}

function stopAmbient() {
  const ctx = getAudioContext();
  ambientNodes.forEach(({ osc, gain }) => {
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    osc.stop(ctx.currentTime + 1.1);
  });
  ambientNodes = [];
}

export function useSoundEffects() {
  const enabledRef = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;

    try {
      switch (sound) {
        case "click": playClick(); break;
        case "hover": playHover(); break;
        case "success": playSuccess(); break;
        case "error": playError(); break;
        case "whoosh": playWhoosh(); break;
        case "ambient": startAmbient(); break;
      }
    } catch (e) {
      console.warn("Sound effect failed:", e);
    }
  }, []);

  const stop = useCallback((sound: SoundType) => {
    if (sound === "ambient") stopAmbient();
  }, []);

  const toggle = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    if (!enabled) stopAmbient();
  }, []);

  return { play, stop, toggle };
}
