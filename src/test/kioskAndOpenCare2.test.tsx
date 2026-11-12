import { describe, expect, it } from "vitest";
import {
  createInitialKioskState,
  kioskSessionReducer,
} from "../lib/kioskSessionReducer";
import {
  calculateDemoMetrics,
  clearDemoEvents,
  dispatchDemoEvent,
  getDemoEvents,
  subscribeDemoEvents,
} from "../services/demoEventStore";
import { CAPABILITY_REGISTRY, getCapability } from "../lib/capabilityRegistry";
import { DEMO_ACCESS_POINTS } from "../data/bakuDemoPoints";
import type { AccessPoint } from "../types/healthpoint";

describe("OpenCare Point 2.0 Kiosk State Machine, Privacy & Safety", () => {
  const dummyStation: AccessPoint = DEMO_ACCESS_POINTS[0];

  it("initializes in clean idle state with zero vitals and anonymous ephemeral context", () => {
    const state = createInitialKioskState(dummyStation);

    expect(state.state).toBe("idle");
    expect(state.result).toBeNull();
    expect(state.errorMessage).toBeNull();
    expect(state.emergency.state).toBe("idle");
    expect(state.emergency.request).toBeNull();
    expect(state.doctorHandoff.state).toBe("idle");
  });

  it("transitions through core measurement steps without requiring authentication or payment", () => {
    let state = createInitialKioskState(dummyStation);

    // Step 1: Start
    state = kioskSessionReducer(state, { type: "START_SESSION" });
    expect(state.state).toBe("instructions");

    // Step 2: Device preparation
    state = kioskSessionReducer(state, {
      type: "GO_TO_STEP",
      step: "device_preparation",
    });
    expect(state.state).toBe("device_preparation");

    // Step 3: Ready
    state = kioskSessionReducer(state, { type: "GO_TO_STEP", step: "ready" });
    expect(state.state).toBe("ready");

    // Step 4: Measuring
    state = kioskSessionReducer(state, {
      type: "GO_TO_STEP",
      step: "measuring",
    });
    expect(state.state).toBe("measuring");

    // Step 5: Success result
    state = kioskSessionReducer(state, {
      type: "MEASUREMENT_SUCCESS",
      result: {
        bpm: 74,
        unit: "döyüntü/dəqiqə",
        sqi: 97,
        timestamp: "12:00:00",
        sampleNotice: "Nümunə nəticə — real tibbi ölçmə deyil",
        simulatedQuality: "good",
      },
    });
    expect(state.state).toBe("result");
    expect(state.result?.bpm).toBe(74);
    expect(state.result?.sampleNotice).toContain("Nümunə nəticə");
  });

  it("STRICT SAFETY: rejects poor signal and returns ZERO vital readings", () => {
    let state = createInitialKioskState(dummyStation);
    state = kioskSessionReducer(state, { type: "START_SESSION" });
    state = kioskSessionReducer(state, {
      type: "GO_TO_STEP",
      step: "measuring",
    });

    // Simulate motion artifact rejection
    state = kioskSessionReducer(state, {
      type: "MEASUREMENT_REJECTED",
      errorMessage: "Siqnal küyü aşkar edildi.",
    });

    expect(state.state).toBe("poor_signal");
    expect(state.result).toBeNull(); // Strictly zero vitals on rejected reading
    expect(state.errorMessage).toContain("Siqnal küyü");

    // Can transition to retry cleanly
    state = kioskSessionReducer(state, { type: "RETRY_MEASUREMENT" });
    expect(state.state).toBe("device_preparation");
    expect(state.result).toBeNull();
  });

  it("resets anonymously and clears all ephemeral measurements and requests", () => {
    let state = createInitialKioskState(dummyStation);
    state = kioskSessionReducer(state, {
      type: "MEASUREMENT_SUCCESS",
      result: {
        bpm: 78,
        unit: "döyüntü/dəqiqə",
        sqi: 98,
        timestamp: "12:05:00",
        sampleNotice: "Nümunə",
        simulatedQuality: "good",
      },
    });
    expect(state.result).not.toBeNull();

    // Trigger complete and reset
    state = kioskSessionReducer(state, { type: "RESET_SESSION" });
    expect(state.state).toBe("idle");
    expect(state.result).toBeNull();
    expect(state.errorMessage).toBeNull();
    expect(state.emergency.request).toBeNull();
  });

  it("handles independent emergency simulation without initiating external calls", () => {
    let state = createInitialKioskState(dummyStation);

    state = kioskSessionReducer(state, { type: "START_EMERGENCY_REQUEST" });
    expect(state.emergency.state).toBe("starting");
    expect(state.emergency.request).not.toBeNull();
    expect(state.emergency.request?.isSimulated).toBe(true);
    expect(state.emergency.request?.stationId).toBe(dummyStation.id);

    // Sequence states
    state = kioskSessionReducer(state, {
      type: "UPDATE_EMERGENCY_STATE",
      state: "acknowledged",
    });
    expect(state.emergency.state).toBe("acknowledged");

    // Cancel emergency returns to idle
    state = kioskSessionReducer(state, { type: "CANCEL_EMERGENCY" });
    expect(state.emergency.state).toBe("idle");
    expect(state.emergency.request).toBeNull();
  });

  it("simulates NFC doctor handoff with audio state and timer", () => {
    let state = createInitialKioskState(dummyStation);

    state = kioskSessionReducer(state, { type: "START_DOCTOR_HANDOFF" });
    expect(state.doctorHandoff.state).toBe("waiting_tap");

    state = kioskSessionReducer(state, { type: "SIMULATE_NFC_TAP" });
    expect(state.doctorHandoff.state).toBe("connecting");

    state = kioskSessionReducer(state, {
      type: "UPDATE_DOCTOR_STATE",
      state: "connected",
    });
    expect(state.doctorHandoff.state).toBe("connected");

    state = kioskSessionReducer(state, { type: "TICK_DOCTOR_CALL" });
    expect(state.doctorHandoff.callDurationSeconds).toBe(1);

    state = kioskSessionReducer(state, { type: "TOGGLE_DOCTOR_MUTE" });
    expect(state.doctorHandoff.isMuted).toBe(true);

    state = kioskSessionReducer(state, { type: "END_DOCTOR_CALL" });
    expect(state.doctorHandoff.state).toBe("ended");
  });
});

describe("OpenCare Demo Event Store & City Operator Telemetry", () => {
  it("dispatches demo events and notifies subscribers in real-time", () => {
    clearDemoEvents();
    let notifiedEvent: any = null;

    const unsubscribe = subscribeDemoEvents((evt) => {
      notifiedEvent = evt;
    });

    const dispatched = dispatchDemoEvent("kiosk_session_started", "point-10", "HP-10");
    expect(dispatched.id).toBeDefined();
    expect(dispatched.isSimulated).toBe(true);
    expect(notifiedEvent?.type).toBe("kiosk_session_started");

    const events = getDemoEvents();
    expect(events.length).toBeGreaterThan(0);

    const metrics = calculateDemoMetrics();
    expect(metrics.totalSessions).toBeGreaterThanOrEqual(1);

    unsubscribe();
  });

  it("calculates accurate retry rate and completion rate from demo events", () => {
    clearDemoEvents();
    dispatchDemoEvent("kiosk_session_started", "point-10", "HP-10");
    dispatchDemoEvent("measurement_quality_rejected", "point-10", "HP-10");
    dispatchDemoEvent("measurement_quality_accepted", "point-10", "HP-10");
    dispatchDemoEvent("emergency_request_simulated", "point-10", "HP-10");

    const metrics = calculateDemoMetrics();
    expect(metrics.rejectedRetries).toBeGreaterThanOrEqual(1);
    expect(metrics.successfulMeasurements).toBeGreaterThanOrEqual(1);
    expect(metrics.simulatedEmergencyRequests).toBeGreaterThanOrEqual(1);
    expect(metrics.retryRatePercent).toBeGreaterThan(0);
  });
});

describe("Capability Registry & Transparency", () => {
  it("explicitly distinguishes implemented software from simulated and planned prototypes", () => {
    const kioskTouch = getCapability("kiosk_touch_workflow");
    expect(kioskTouch?.status).toBe("implemented_software");

    const pulseSim = getCapability("kiosk_pulse_measurement");
    expect(pulseSim?.status).toBe("simulated_prototype");

    const bleHardware = getCapability("ble_hardware_dock");
    expect(bleHardware?.status).toBe("planned_hardware_integration");

    const cert103 = getCapability("certified_103_integration");
    expect(cert103?.status).toBe("planned_partner_integration");

    // Zero unvalidated features are falsely labeled "validated_live"
    const validatedLive = Object.values(CAPABILITY_REGISTRY).filter(
      (c) => c.status === "validated_live"
    );
    expect(validatedLive.length).toBe(0);
  });
});
