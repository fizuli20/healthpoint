import type {
  AccessPoint,
  SessionPassType,
  SignalQualityStatus,
  VitalReadingRecord,
} from "../types/healthpoint";
import { getKioskCode } from "./localizePoint";

export interface PassOptionSpec {
  id: SessionPassType;
  priceAzn: number;
  isFree: boolean;
  includesBloodPressure: boolean;
  includesDoctorReview: boolean;
}

export const SESSION_PASS_CATALOG: Record<SessionPassType, PassOptionSpec> = {
  free_basic: {
    id: "free_basic",
    priceAzn: 0,
    isFree: true,
    includesBloodPressure: false,
    includesDoctorReview: false,
  },
  one_time_full: {
    id: "one_time_full",
    priceAzn: 1.0,
    isFree: false,
    includesBloodPressure: true,
    includesDoctorReview: false,
  },
  tele_consult: {
    id: "tele_consult",
    priceAzn: 5.0,
    isFree: false,
    includesBloodPressure: true,
    includesDoctorReview: true,
  },
};

/**
 * Generates a compact 48-sample normalized optical PPG waveform (0..1) representing either
 * clean arterial systolic/dicrotic rhythm or noisy motion-artifact contact.
 */
export function generatePpgWaveform(mode: "good" | "poor", seed = 1): number[] {
  const samples: number[] = [];
  const count = 48;
  for (let i = 0; i < count; i++) {
    const phase = ((i + seed * 3) % 24) / 24;
    const systolic = Math.exp(-Math.pow((phase - 0.25) / 0.14, 2)) * 0.72;
    const dicrotic = Math.exp(-Math.pow((phase - 0.54) / 0.16, 2)) * 0.28;
    if (mode === "good") {
      const microRipple = Math.sin(i * 0.7 + seed) * 0.01;
      samples.push(Math.min(1, Math.max(0.05, 0.15 + systolic + dicrotic + microRipple)));
    } else {
      // Simulate unstable finger/ring contact and baseline motion spikes
      const baselineDrift = Math.sin(i * 0.28 + seed) * 0.22;
      const artifact = Math.sin(i * 3.9 + seed * 2) * 0.34;
      const raw = 0.45 + systolic * 0.25 + baselineDrift + artifact;
      samples.push(Math.min(1, Math.max(0.02, raw)));
    }
  }
  return samples;
}

/**
 * Lightweight deterministic Signal Quality Index (SQI) classifier (~0.2ms on-device)
 * estimating periodic pulse prominence vs high-frequency motion jitter.
 */
export function evaluateSignalQuality(samples: number[]): {
  score: number;
  status: SignalQualityStatus;
  snrDb: number;
} {
  if (samples.length < 8) {
    return { score: 0, status: "poor", snrDb: 0 };
  }

  let mean = 0;
  for (const s of samples) mean += s;
  mean /= samples.length;

  let signalEnergy = 0;
  let highFreqDiffEnergy = 0;
  let suddenSpikes = 0;

  for (let i = 0; i < samples.length; i++) {
    const centered = samples[i] - mean;
    signalEnergy += centered * centered;
    if (i > 0) {
      const diff = samples[i] - samples[i - 1];
      highFreqDiffEnergy += diff * diff;
    }
    if (i > 1) {
      const secondDiff = Math.abs(samples[i] - 2 * samples[i - 1] + samples[i - 2]);
      if (secondDiff > 0.36) suddenSpikes += 1;
    }
  }

  const rmsSignal = Math.sqrt(signalEnergy / samples.length);
  const rmsDiff = Math.sqrt(highFreqDiffEnergy / (samples.length - 1));
  // Smooth PPG has lower high-frequency jitter relative to amplitude envelope
  const smoothnessRatio = rmsDiff > 0 ? rmsSignal / (rmsDiff + 0.01) : 1;
  const snrDb = Math.max(1, Math.min(26, Math.round((smoothnessRatio * 8.5 - suddenSpikes * 1.4) * 10) / 10));

  const rawScore = Math.round(
    Math.max(18, Math.min(97, smoothnessRatio * 42 - suddenSpikes * 6.5))
  );
  const status: SignalQualityStatus = rawScore >= 70 ? "good" : "poor";
  return { score: rawScore, status, snrDb };
}

export function runVitalCheckSimulation(
  mode: "good" | "poor",
  passType: SessionPassType,
  point: AccessPoint,
  seed = Date.now() % 17
): VitalReadingRecord {
  const waveform = generatePpgWaveform(mode, seed);
  const evaluation = evaluateSignalQuality(waveform);
  const spec = SESSION_PASS_CATALOG[passType];

  if (evaluation.status === "poor") {
    return {
      id: `vr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      accessPointId: point.id,
      accessPointName: point.name,
      kioskCode: getKioskCode(point.id),
      passType,
      priceAzn: spec.priceAzn,
      heartRateBpm: null,
      spo2Percent: null,
      bloodPressure: null,
      signalQualityScore: evaluation.score,
      signalStatus: "poor",
      snrDb: evaluation.snrDb,
      aiRecommendationKey: "signalPoorRetry",
      waveform,
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
  }

  const bpm = 68 + (seed % 19);
  const spo2 = 97 + (seed % 3);
  const systolic = 114 + (seed % 14);
  const diastolic = 74 + (seed % 9);

  return {
    id: `vr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    accessPointId: point.id,
    accessPointName: point.name,
    kioskCode: getKioskCode(point.id),
    passType,
    priceAzn: spec.priceAzn,
    heartRateBpm: bpm,
    spo2Percent: spo2,
    bloodPressure: spec.includesBloodPressure ? `${systolic}/${diastolic} mmHg` : null,
    signalQualityScore: evaluation.score,
    signalStatus: "good",
    snrDb: evaluation.snrDb,
    aiRecommendationKey: bpm > 98 ? "elevatedFollowUp" : "signalOk",
    waveform,
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
}
