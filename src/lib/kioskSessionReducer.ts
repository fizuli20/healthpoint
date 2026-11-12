import type {
  KioskDoctorHandoffState,
  KioskEmergencyRequest,
  KioskEmergencyState,
  KioskPulseResult,
  KioskSessionContext,
  KioskSessionState,
} from "../types/kiosk";
import type { AccessPoint } from "../types/healthpoint";

export type KioskAction =
  | { type: "START_SESSION" }
  | { type: "GO_TO_STEP"; step: KioskSessionState }
  | { type: "SET_PROGRESS"; progressPercent: number; countdownSeconds: number }
  | { type: "MEASUREMENT_SUCCESS"; result: KioskPulseResult }
  | { type: "MEASUREMENT_REJECTED"; errorMessage: string }
  | { type: "RETRY_MEASUREMENT" }
  | { type: "COMPLETE_SESSION" }
  | { type: "RESET_SESSION" }
  | { type: "START_EMERGENCY_REQUEST" }
  | { type: "UPDATE_EMERGENCY_STATE"; state: KioskEmergencyState; request?: KioskEmergencyRequest }
  | { type: "CANCEL_EMERGENCY" }
  | { type: "START_DOCTOR_HANDOFF" }
  | { type: "SIMULATE_NFC_TAP" }
  | { type: "UPDATE_DOCTOR_STATE"; state: KioskDoctorHandoffState }
  | { type: "TICK_DOCTOR_CALL" }
  | { type: "TOGGLE_DOCTOR_MUTE" }
  | { type: "END_DOCTOR_CALL" }
  | { type: "TOGGLE_HIGH_CONTRAST" }
  | { type: "TOGGLE_LARGE_TEXT" }
  | { type: "TOGGLE_VOICE_GUIDANCE" }
  | { type: "SET_PRESENTER_SCENARIO"; scenario: "clean" | "poor" }
  | { type: "TICK_INACTIVITY" }
  | { type: "EXTEND_SESSION" };

export const INACTIVITY_TIMEOUT_SECONDS = 45;
export const INACTIVITY_WARNING_SECONDS = 15;

export function createInitialKioskState(station: AccessPoint): KioskSessionContext {
  return {
    station,
    state: "idle",
    progressPercent: 0,
    countdownSeconds: 15,
    result: null,
    errorMessage: null,
    accessibility: {
      highContrast: false,
      largeText: false,
      voiceGuidance: false,
    },
    presenter: {
      signalScenario: "clean",
      autoProgress: true,
    },
    emergency: {
      state: "idle",
      request: null,
    },
    doctorHandoff: {
      state: "idle",
      callDurationSeconds: 0,
      isMuted: false,
    },
    inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
    isExtendingSession: false,
  };
}

export function kioskSessionReducer(
  state: KioskSessionContext,
  action: KioskAction
): KioskSessionContext {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...state,
        state: "instructions",
        progressPercent: 0,
        countdownSeconds: 15,
        result: null,
        errorMessage: null,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
        isExtendingSession: false,
      };

    case "GO_TO_STEP":
      return {
        ...state,
        state: action.step,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
      };

    case "SET_PROGRESS":
      return {
        ...state,
        progressPercent: action.progressPercent,
        countdownSeconds: action.countdownSeconds,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
      };

    case "MEASUREMENT_SUCCESS":
      return {
        ...state,
        state: "result",
        result: action.result,
        errorMessage: null,
        progressPercent: 100,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
      };

    case "MEASUREMENT_REJECTED":
      return {
        ...state,
        state: "poor_signal",
        result: null, // Zero vitals returned for rejected readings
        errorMessage: action.errorMessage,
        progressPercent: 0,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
      };

    case "RETRY_MEASUREMENT":
      return {
        ...state,
        state: "device_preparation",
        result: null,
        errorMessage: null,
        progressPercent: 0,
        countdownSeconds: 15,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
      };

    case "COMPLETE_SESSION":
      return {
        ...state,
        state: "completed",
        inactivityRemainingSeconds: 20, // 20s to return device before reset
      };

    case "RESET_SESSION":
      // Ephemeral reset: wipes all readings and returns to clean idle welcome
      return {
        ...createInitialKioskState(state.station),
        accessibility: state.accessibility, // preserve accessibility preferences
        presenter: state.presenter, // preserve presenter scenario
      };

    case "START_EMERGENCY_REQUEST": {
      const reqId = `OCP-EMG-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        ...state,
        emergency: {
          state: "starting",
          request: {
            requestId: reqId,
            stationId: state.station.id,
            stationCode: state.station.code || "HP-01",
            stationName: state.station.name,
            stationAddress: state.station.address,
            latitude: state.station.latitude,
            longitude: state.station.longitude,
            timestamp: new Date().toLocaleTimeString("az-AZ", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            status: "started",
            isSimulated: true,
            simulatedNotice: "Bu simulyasiyadır — real 103 zəngi etmir.",
          },
        },
        inactivityRemainingSeconds: 120, // generous time for emergency info
      };
    }

    case "UPDATE_EMERGENCY_STATE":
      return {
        ...state,
        emergency: {
          state: action.state,
          request: action.request || state.emergency.request,
        },
      };

    case "CANCEL_EMERGENCY":
      return {
        ...state,
        emergency: {
          state: "idle",
          request: null,
        },
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
      };

    case "START_DOCTOR_HANDOFF":
      return {
        ...state,
        doctorHandoff: {
          state: "waiting_tap",
          callDurationSeconds: 0,
          isMuted: false,
        },
        inactivityRemainingSeconds: 60,
      };

    case "SIMULATE_NFC_TAP":
      return {
        ...state,
        doctorHandoff: {
          ...state.doctorHandoff,
          state: "connecting",
        },
      };

    case "UPDATE_DOCTOR_STATE":
      return {
        ...state,
        doctorHandoff: {
          ...state.doctorHandoff,
          state: action.state,
        },
      };

    case "TICK_DOCTOR_CALL":
      return {
        ...state,
        doctorHandoff: {
          ...state.doctorHandoff,
          callDurationSeconds: state.doctorHandoff.callDurationSeconds + 1,
        },
      };

    case "TOGGLE_DOCTOR_MUTE":
      return {
        ...state,
        doctorHandoff: {
          ...state.doctorHandoff,
          isMuted: !state.doctorHandoff.isMuted,
        },
      };

    case "END_DOCTOR_CALL":
      return {
        ...state,
        doctorHandoff: {
          state: "ended",
          callDurationSeconds: 0,
          isMuted: false,
        },
      };

    case "TOGGLE_HIGH_CONTRAST":
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          highContrast: !state.accessibility.highContrast,
        },
      };

    case "TOGGLE_LARGE_TEXT":
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          largeText: !state.accessibility.largeText,
        },
      };

    case "TOGGLE_VOICE_GUIDANCE":
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          voiceGuidance: !state.accessibility.voiceGuidance,
        },
      };

    case "SET_PRESENTER_SCENARIO":
      return {
        ...state,
        presenter: {
          ...state.presenter,
          signalScenario: action.scenario,
        },
      };

    case "TICK_INACTIVITY":
      if (state.state === "idle") return state;
      if (state.inactivityRemainingSeconds <= 1) {
        // Auto-reset when timer expires
        return createInitialKioskState(state.station);
      }
      return {
        ...state,
        inactivityRemainingSeconds: state.inactivityRemainingSeconds - 1,
        isExtendingSession: state.inactivityRemainingSeconds - 1 <= INACTIVITY_WARNING_SECONDS,
      };

    case "EXTEND_SESSION":
      return {
        ...state,
        inactivityRemainingSeconds: INACTIVITY_TIMEOUT_SECONDS,
        isExtendingSession: false,
      };

    default:
      return state;
  }
}
