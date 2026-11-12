export type DemoEventType =
  | "kiosk_session_started"
  | "measurement_started"
  | "measurement_quality_accepted"
  | "measurement_quality_rejected"
  | "measurement_completed"
  | "doctor_handoff_simulated"
  | "emergency_request_simulated"
  | "emergency_acknowledgement_simulated"
  | "session_completed"
  | "maintenance_report_created"
  | "station_status_changed";

export interface DemoEvent {
  id: string;
  type: DemoEventType;
  stationId: string;
  stationCode?: string;
  timestamp: string;
  isSimulated: true;
  metadata?: Record<string, string | number | boolean>;
}

export interface DemoMetricsSummary {
  totalSessions: number;
  successfulMeasurements: number;
  rejectedRetries: number;
  simulatedDoctorCalls: number;
  simulatedEmergencyRequests: number;
  retryRatePercent: number;
  completionRatePercent: number;
  recentEvents: DemoEvent[];
}

const STORAGE_KEY = "opencare_demo_events_v2";
const CHANNEL_NAME = "opencare_demo_events_channel";

// Initial seeded demo events representing historical city telemetry (clearly marked as historical demo seed)
const SEEDED_EVENTS: DemoEvent[] = [
  {
    id: "evt-seed-1",
    type: "kiosk_session_started",
    stationId: "point-1",
    stationCode: "HP-01",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    isSimulated: true,
    metadata: { trigger: "touch_welcome" },
  },
  {
    id: "evt-seed-2",
    type: "measurement_quality_accepted",
    stationId: "point-1",
    stationCode: "HP-01",
    timestamp: new Date(Date.now() - 3600000 * 3.9).toISOString(),
    isSimulated: true,
    metadata: { bpm: 72, sqi: 98 },
  },
  {
    id: "evt-seed-3",
    type: "measurement_completed",
    stationId: "point-1",
    stationCode: "HP-01",
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    isSimulated: true,
  },
  {
    id: "evt-seed-4",
    type: "kiosk_session_started",
    stationId: "point-10",
    stationCode: "HP-10",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isSimulated: true,
    metadata: { trigger: "touch_welcome" },
  },
  {
    id: "evt-seed-5",
    type: "measurement_quality_rejected",
    stationId: "point-10",
    stationCode: "HP-10",
    timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    isSimulated: true,
    metadata: { sqi: 48, reason: "motion_artifact" },
  },
  {
    id: "evt-seed-6",
    type: "measurement_quality_accepted",
    stationId: "point-10",
    stationCode: "HP-10",
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    isSimulated: true,
    metadata: { bpm: 76, sqi: 96 },
  },
  {
    id: "evt-seed-7",
    type: "emergency_request_simulated",
    stationId: "point-4",
    stationCode: "HP-04",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    isSimulated: true,
    metadata: { requestId: "OCP-EMG-7821", simulatedStatus: "dispatched_ack" },
  },
];

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

export function getDemoEvents(): DemoEvent[] {
  if (typeof window === "undefined") return SEEDED_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEEDED_EVENTS));
      return SEEDED_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEEDED_EVENTS;
  } catch {
    return SEEDED_EVENTS;
  }
}

export function dispatchDemoEvent(
  type: DemoEventType,
  stationId: string,
  stationCode?: string,
  metadata?: Record<string, string | number | boolean>
): DemoEvent {
  const event: DemoEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    stationId,
    stationCode,
    timestamp: new Date().toISOString(),
    isSimulated: true,
    metadata,
  };

  if (typeof window !== "undefined") {
    try {
      const current = getDemoEvents();
      const updated = [event, ...current].slice(0, 100); // keep last 100
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Broadcast to other tabs
      broadcastChannel?.postMessage({ type: "DEMO_EVENT_DISPATCHED", event });

      // Trigger standard storage event for same-tab / cross-tab listeners
      window.dispatchEvent(new CustomEvent("opencare_demo_event", { detail: event }));
    } catch (e) {
      console.warn("Failed to persist demo event", e);
    }
  }

  return event;
}

export function subscribeDemoEvents(callback: (event: DemoEvent) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<DemoEvent>;
    if (custom.detail) callback(custom.detail);
  };

  const handleBroadcast = (msg: MessageEvent) => {
    if (msg.data?.type === "DEMO_EVENT_DISPATCHED" && msg.data.event) {
      callback(msg.data.event);
    }
  };

  window.addEventListener("opencare_demo_event", handleCustomEvent);
  broadcastChannel?.addEventListener("message", handleBroadcast);

  return () => {
    window.removeEventListener("opencare_demo_event", handleCustomEvent);
    broadcastChannel?.removeEventListener("message", handleBroadcast);
  };
}

export function clearDemoEvents(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEEDED_EVENTS));
      window.dispatchEvent(new CustomEvent("opencare_demo_event", { detail: null }));
      broadcastChannel?.postMessage({ type: "DEMO_EVENTS_RESET" });
    } catch {}
  }
}

export function calculateDemoMetrics(): DemoMetricsSummary {
  const events = getDemoEvents();
  let totalSessions = 0;
  let successfulMeasurements = 0;
  let rejectedRetries = 0;
  let simulatedDoctorCalls = 0;
  let simulatedEmergencyRequests = 0;

  for (const evt of events) {
    if (evt.type === "kiosk_session_started") totalSessions++;
    else if (evt.type === "measurement_quality_accepted") successfulMeasurements++;
    else if (evt.type === "measurement_quality_rejected") rejectedRetries++;
    else if (evt.type === "doctor_handoff_simulated") simulatedDoctorCalls++;
    else if (evt.type === "emergency_request_simulated") simulatedEmergencyRequests++;
  }

  const totalAttempts = successfulMeasurements + rejectedRetries;
  const retryRatePercent =
    totalAttempts > 0 ? Math.round((rejectedRetries / totalAttempts) * 100) : 0;
  const completionRatePercent =
    totalSessions > 0 ? Math.min(100, Math.round((successfulMeasurements / totalSessions) * 100)) : 100;

  return {
    totalSessions: Math.max(totalSessions, 1),
    successfulMeasurements,
    rejectedRetries,
    simulatedDoctorCalls,
    simulatedEmergencyRequests,
    retryRatePercent,
    completionRatePercent,
    recentEvents: events.slice(0, 15),
  };
}
