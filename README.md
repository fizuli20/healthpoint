# OpenCare Point 2.0

> **Sağlamlığa daha yaxın şəhər.**  
> **Human-Centered Cities Hackathon, Azerbaijan • Team CiviCore**

OpenCare Point is an urban public healthcare infrastructure platform designed around accessible physical touchscreen kiosks. It provides citizens in public spaces with immediate, free, and anonymous pulse measurement, accessible emergency assistance, and optional NFC-based doctor voice-call handoff — **without requiring a smartphone or payment**.

- **Live Production URL**: [https://healthpoint-tawny.vercel.app](https://healthpoint-tawny.vercel.app)
- **Repository**: [https://github.com/fizuli20/healthpoint](https://github.com/fizuli20/healthpoint)
- **Android APK**: [OpenCarePoint.apk](https://healthpoint-tawny.vercel.app/downloads/OpenCarePoint.apk) (Signed Release APK)

---

## 1. Product Ecosystem (Three Connected Products)

### 1. OpenCare Kiosk (`/kiosk`, `/kiosk/:stationId`)
A standalone landscape touchscreen application (1920×1080 / 1280×800) designed for public kiosks:
- **Core User Sequence**: *"Cihazı götür → Nəbzini ölç → Nəticəni gör → Lazım olduqda yardım istə"*
- **Full State Machine**: `idle`, `instructions`, `device_preparation`, `connecting`, `ready`, `measuring`, `checking_signal`, `poor_signal`, `result`, `completed`.
- **Deterministic Signal Quality Check**: Synthetic PPG waveform evaluated via morphology and peak regularity. Zero vitals returned if motion artifacts or loose contact are detected (`poor_signal`).
- **Result Transparency**: Large BPM display, explicit `"Nümunə nəticə — real tibbi ölçmə deyil"` badge, signal quality index (SQI 97%), and **strictly no green "you are healthy" verdict**.
- **Independent Kiosk Emergency SOS**: Direct simulated emergency dispatch attaching kiosk GPS and code (`HP-10`) with request ID and dispatcher acknowledgement. Real 103 phone instructions provided.
- **NFC Doctor Voice-Call Simulation**: Smartphone tap simulation initiating a private tele-consultation audio interface.
- **Privacy by Default**: Anonymous, ephemeral sessions with automated inactivity countdown and complete session memory wipe.

### 2. OpenCare Connect (`/map`, `/nearby`, `/points/:id`, `/navigation/:id`)
A mobile-first citizen discovery application:
- 15 Baku stations across Metro, parks, transit hubs, universities, and shopping centers.
- Filters for wheelchair accessibility, voice guidance, equipment, and placement zones.
- Safe location handling with manual Baku center fallback (no automatic geolocation prompts).
- Integrated Android APK download and turn-by-turn walking route navigation.

### 3. OpenCare City (`/admin`, `/admin/points`, `/admin/reports`, `/admin/analytics`)
A municipal infrastructure command center for city operators and 103 dispatchers:
- **Real-Time Telemetry Event Bus**: Connected via `BroadcastChannel` and `localStorage` to receive live kiosk events (`kiosk_session_started`, `measurement_quality_accepted`, `measurement_quality_rejected`, `emergency_request_simulated`).
- **Real-Time Operational KPIs**: Total stations, active kiosks, session volume, retry rate, and simulated emergency calls.
- **Pilot Planning & Validation Criteria**: SOS discovery time (<5s), unassisted completion rate (>92%), and retry rate (<15%).
- **Maintenance Ticket Triage**: `open` → `in_progress` → `resolved`.

---

## 2. Dedicated Judge Demonstration Mode (`/demo`)

A guided presentation console for hackathon evaluators featuring 4 reproducible scenarios:
- **Scenario A (Citizen without a smartphone)**: 67-year-old retired teacher Tofiq dayı at Narimanov Park measures pulse and requests emergency help directly from HP-10.
- **Scenario B (Signal quality failure & retry)**: Noisy PPG signal rejected (54% SQI, zero false vitals), device re-adjusted, second measurement succeeds (74 BPM, 97% SQI).
- **Scenario C (NFC doctor handoff)**: Master's student Nigar taps personal phone at HP-11 (Elmlər) to initiate simulated voice call with Dr. Samirə Vəliyeva.
- **Scenario D (Municipal operator)**: Live telemetry monitor updates in real-time, displays retry metrics, and triages maintenance tickets.

---

## 3. Technology Architecture & Waveforms (`/technology`)

- **System Data Flow**: Sensor → BLE (proposed) → Kiosk Edge → SQI Deterministic Filter → Result Screen → User Support.
- **Live Interactive PPG Comparison**: Real-time canvas comparing clean arterial pulse waveform vs motion-corrupted wave.
- **Capability Registry**: Full transparent matrix distinguishing implemented software, simulated prototypes, and planned hardware/partner integrations.

---

## 4. Municipal Pilot & Business Model (`/partners`)

- **B2G Infrastructure Packages**: Kiosk installation, routine maintenance, and software updates.
- **B2B Transit Deployments**: Metro stations, rail hubs, shopping malls.
- **Citizen Access Guarantee**: Core pulse measurement and emergency help are **100% free**.
- **4-Phase Pilot Roadmap**: Laboratory validation → Narimanov Park pilot (3 kiosks) → TƏBİB 103 integration → Baku 15-station expansion.

---

## 5. Tech Stack & Engineering Standards

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v7, TanStack Query, React Leaflet, Lucide Icons, Framer Motion
- **Sound Design**: Procedural Web Audio API synthesizer (heartbeat `lub-dub`, NFC chime, ECG beep, emergency alert)
- **Mobile Packaging**: Capacitor Android with Docker-based signed release builds (`healthpoint-sdk:36`)
- **Event Bus**: Cross-tab `BroadcastChannel` with persistent fallback
- **Testing**: Vitest, Testing Library, jsdom (36 unit & integration tests)
- **Accessibility**: Targeted WCAG 2.2 AA (high contrast mode, large text mode, voice guidance fallback, 56–72px touch targets)
- **Localization**: Azerbaijani (`az`, default), English (`en`), and Russian (`ru`)

---

## 6. Verification & Build Commands

```bash
# Install dependencies
npm install

# TypeScript type checking (0 errors)
npm run typecheck

# Execute Vitest test suite (36/36 tests passing)
npm test

# Build production web bundle
npm run build
```

---

## 7. Disclaimer & Prototype Status

OpenCare Point is a smart-city technology prototype created for the Human-Centered Cities Hackathon, Azerbaijan. Simulated pulse measurements, emergency dispatch requests, and doctor calls are local demonstration adapters designed to showcase urban healthcare infrastructure. They do not place real emergency calls, replace certified medical diagnosis, or substitute professional clinicians.
