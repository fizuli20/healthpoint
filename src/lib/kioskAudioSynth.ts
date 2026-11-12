let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioClass) {
      audioCtx = new AudioClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function playKioskTone(
  freq: number,
  type: OscillatorType = "sine",
  duration = 0.1,
  gainLevel = 0.08
): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playHeartbeatSound(): void {
  playKioskTone(75, "sine", 0.12, 0.2);
  setTimeout(() => playKioskTone(60, "sine", 0.14, 0.16), 150);
}

export function playNfcSuccessChime(): void {
  playKioskTone(523.25, "triangle", 0.08, 0.1);
  setTimeout(() => playKioskTone(659.25, "triangle", 0.08, 0.1), 80);
  setTimeout(() => playKioskTone(783.99, "triangle", 0.18, 0.12), 160);
}

export function playEcgBeep(): void {
  playKioskTone(880, "sine", 0.06, 0.08);
}

export function playEmergencyAlertSound(): void {
  playKioskTone(660, "sawtooth", 0.15, 0.1);
  setTimeout(() => playKioskTone(880, "sawtooth", 0.2, 0.1), 160);
}

export function playTapSound(): void {
  playKioskTone(400, "sine", 0.03, 0.05);
}

export function speakVoiceGuidance(text: string, lang = "az"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US";
    window.speechSynthesis.speak(utterance);
  } catch {}
}

export function stopVoiceGuidance(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
