import type { AccessPoint } from "./healthpoint";

export type KioskSessionState =
  | "idle"
  | "instructions"
  | "device_preparation"
  | "connecting"
  | "ready"
  | "measuring"
  | "checking_signal"
  | "poor_signal"
  | "result"
  | "unavailable"
  | "completed";

export type KioskEmergencyState =
  | "idle"
  | "starting"
  | "locating"
  | "awaiting_ack"
  | "acknowledged"
  | "failed";

export type KioskDoctorHandoffState =
  | "idle"
  | "waiting_tap"
  | "tapped"
  | "connecting"
  | "connected"
  | "ended";

export interface KioskPulseResult {
  bpm: number;
  unit: "döyüntü/dəqiqə" | "BPM";
  sqi: number; // 0-100 deterministic signal quality index
  timestamp: string;
  sampleNotice: string;
  simulatedQuality: "good" | "poor";
}

export interface KioskEmergencyRequest {
  requestId: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  stationAddress: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: "started" | "locating" | "awaiting_ack" | "acknowledged" | "failed";
  isSimulated: true;
  simulatedNotice: string;
}

export interface KioskAccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  voiceGuidance: boolean;
}

export interface KioskPresenterOptions {
  signalScenario: "clean" | "poor";
  autoProgress: boolean;
}

export interface KioskSessionContext {
  station: AccessPoint;
  state: KioskSessionState;
  progressPercent: number;
  countdownSeconds: number;
  result: KioskPulseResult | null;
  errorMessage: string | null;
  accessibility: KioskAccessibilitySettings;
  presenter: KioskPresenterOptions;
  emergency: {
    state: KioskEmergencyState;
    request: KioskEmergencyRequest | null;
  };
  doctorHandoff: {
    state: KioskDoctorHandoffState;
    callDurationSeconds: number;
    isMuted: boolean;
  };
  inactivityRemainingSeconds: number;
  isExtendingSession: boolean;
}
