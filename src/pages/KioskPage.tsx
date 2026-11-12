import { useEffect, useReducer, useRef, useState, useTransition } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  Maximize2,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  RefreshCw,
  RotateCcw,
  Shield,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEMO_ACCESS_POINTS } from "../data/bakuDemoPoints";
import { getKioskCode } from "../lib/localizePoint";
import {
  createInitialKioskState,
  kioskSessionReducer,
} from "../lib/kioskSessionReducer";
import {
  playEcgBeep,
  playEmergencyAlertSound,
  playHeartbeatSound,
  playNfcSuccessChime,
  playTapSound,
  speakVoiceGuidance,
  stopVoiceGuidance,
} from "../lib/kioskAudioSynth";
import { dispatchDemoEvent } from "../services/demoEventStore";
import type { AccessPoint } from "../types/healthpoint";

export function KioskPage() {
  const { t, i18n } = useTranslation();
  const { stationId } = useParams<{ stationId?: string }>();
  const [, startTransition] = useTransition();

  // Find targeted station or default to HP-10 (Nərimanov Parkı)
  const station: AccessPoint =
    DEMO_ACCESS_POINTS.find((p) => p.id === stationId || getKioskCode(p.id) === stationId) ||
    DEMO_ACCESS_POINTS.find((p) => getKioskCode(p.id) === "HP-10") ||
    DEMO_ACCESS_POINTS[0];

  const stationCode = getKioskCode(station.id);

  const [state, dispatch] = useReducer(
    kioskSessionReducer,
    station,
    createInitialKioskState
  );

  const [currentTime, setCurrentTime] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live wall clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("az-AZ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Inactivity countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: "TICK_INACTIVITY" });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Call duration ticker during NFC call
  useEffect(() => {
    if (state.doctorHandoff.state === "connected") {
      const callTimer = setInterval(() => {
        dispatch({ type: "TICK_DOCTOR_CALL" });
      }, 1000);
      return () => clearInterval(callTimer);
    }
  }, [state.doctorHandoff.state]);

  // Voice guidance announcement on state change
  useEffect(() => {
    if (!state.accessibility.voiceGuidance) {
      stopVoiceGuidance();
      return;
    }
    const lang = i18n.language || "az";
    if (state.state === "idle") {
      speakVoiceGuidance(
        lang === "az"
          ? "OpenCare Point sağlamlıq köşkünə xoş gəlmisiniz. Nəbz ölçmək üçün ekrana toxunun."
          : "Welcome to OpenCare Point health kiosk. Touch the screen to measure pulse.",
        lang
      );
    } else if (state.state === "instructions") {
      speakVoiceGuidance(
        lang === "az"
          ? "Addım bir. Köşkdəki steril cihazı yuvasından götürün."
          : "Step one. Take the measuring device from the kiosk dock.",
        lang
      );
    } else if (state.state === "device_preparation") {
      speakVoiceGuidance(
        lang === "az"
          ? "Addım iki. Cihazı göstərici barmağınıza taxın."
          : "Step two. Place the device onto your finger.",
        lang
      );
    } else if (state.state === "measuring") {
      speakVoiceGuidance(
        lang === "az"
          ? "Nəbziniz ölçülür. Əlinizi tərpətməyin."
          : "Measuring pulse. Please keep your hand still.",
        lang
      );
    } else if (state.state === "result" && state.result) {
      speakVoiceGuidance(
        lang === "az"
          ? `Nəbz nümunəsi dəqiqədə ${state.result.bpm} döyüntü. Siqnal keyfiyyəti əladır.`
          : `Sample pulse: ${state.result.bpm} beats per minute. Signal quality is good.`,
        lang
      );
    } else if (state.state === "poor_signal") {
      speakVoiceGuidance(
        lang === "az"
          ? "Ölçmə tamamlanmadı. Cihazı yenidən taxıb əlinizi sabit saxlayın."
          : "Measurement incomplete. Re-adjust the device and keep your hand still.",
        lang
      );
    }
  }, [state.state, state.result, state.accessibility.voiceGuidance, i18n.language]);

  // Animated synthetic PPG waveform during measurement
  useEffect(() => {
    if (state.state !== "measuring") return;

    let animId: number;
    let t = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Trigger heartbeat sound periodically
    const soundInterval = setInterval(() => {
      playHeartbeatSound();
    }, 850);

    const renderWave = () => {
      t += 0.05;
      ctx.fillStyle = state.accessibility.highContrast ? "#000000" : "#0A0E1A";
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = state.accessibility.highContrast ? "#333333" : "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw mathematical arterial PPG wave
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle =
        state.presenter.signalScenario === "poor"
          ? "#F59E0B"
          : state.accessibility.highContrast
          ? "#00FF66"
          : "#EF4444";

      const cy = h / 2;
      for (let x = 0; x < w; x++) {
        const phi = (x * 0.035 - t * 4) % (Math.PI * 2);
        // Clean PPG: systolic spike + dicrotic notch
        let wave =
          Math.exp(-Math.pow(phi - 1.5, 2) / 0.15) * 45 +
          Math.exp(-Math.pow(phi - 2.8, 2) / 0.3) * 18 -
          10;

        // If presenter set scenario to "poor", inject motion noise & baseline wander
        if (state.presenter.signalScenario === "poor") {
          wave += Math.sin(x * 0.08 + t * 5) * 22 + Math.cos(x * 0.2 + t * 8) * 15;
        }

        const y = cy - wave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(soundInterval);
    };
  }, [state.state, state.presenter.signalScenario, state.accessibility.highContrast]);

  // Measurement progression simulation
  useEffect(() => {
    if (state.state !== "measuring") return;

    let secondsLeft = 6; // Quick 6-second responsive demo
    const totalSec = 6;

    const interval = setInterval(() => {
      secondsLeft -= 1;
      const progress = Math.round(((totalSec - secondsLeft) / totalSec) * 100);
      dispatch({
        type: "SET_PROGRESS",
        progressPercent: progress,
        countdownSeconds: Math.max(0, secondsLeft),
      });

      if (secondsLeft <= 0) {
        clearInterval(interval);
        // Evaluate deterministic scenario
        if (state.presenter.signalScenario === "poor") {
          dispatchDemoEvent(
            "measurement_quality_rejected",
            station.id,
            stationCode,
            { sqi: 54, reason: "motion_artifact" }
          );
          dispatch({
            type: "MEASUREMENT_REJECTED",
            errorMessage:
              "Siqnal küyü və ya hərəkət aşkar edildi. Cihazı yenidən yerləşdirib əlinizi sabit saxlayın.",
          });
        } else {
          dispatchDemoEvent(
            "measurement_quality_accepted",
            station.id,
            stationCode,
            { bpm: 74, sqi: 97 }
          );
          dispatchDemoEvent(
            "measurement_completed",
            station.id,
            stationCode
          );
          playEcgBeep();
          dispatch({
            type: "MEASUREMENT_SUCCESS",
            result: {
              bpm: 74,
              unit: "döyüntü/dəqiqə",
              sqi: 97,
              timestamp: new Date().toLocaleTimeString("az-AZ", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              sampleNotice: "Nümunə nəticə — real tibbi ölçmə deyil",
              simulatedQuality: "good",
            },
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.state, state.presenter.signalScenario, station.id, stationCode]);

  // Handle Fullscreen request
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  // Language switch handler
  const handleLangChange = (newLang: string) => {
    startTransition(() => {
      void i18n.changeLanguage(newLang);
    });
  };

  // Kiosk Emergency Simulation sequence
  const handleTriggerEmergency = () => {
    playEmergencyAlertSound();
    dispatch({ type: "START_EMERGENCY_REQUEST" });
    dispatchDemoEvent(
      "emergency_request_simulated",
      station.id,
      stationCode,
      { simulatedStatus: "locating_station" }
    );

    // Sequence through states
    setTimeout(() => {
      dispatch({ type: "UPDATE_EMERGENCY_STATE", state: "locating" });
    }, 1200);

    setTimeout(() => {
      dispatch({ type: "UPDATE_EMERGENCY_STATE", state: "awaiting_ack" });
    }, 2800);

    setTimeout(() => {
      dispatchDemoEvent(
        "emergency_acknowledgement_simulated",
        station.id,
        stationCode,
        { ackStatus: "dispatcher_103_received" }
      );
      dispatch({ type: "UPDATE_EMERGENCY_STATE", state: "acknowledged" });
    }, 4500);
  };

  // NFC Doctor Call Simulation sequence
  const handleSimulateNfcTap = () => {
    playNfcSuccessChime();
    dispatch({ type: "SIMULATE_NFC_TAP" });
    dispatchDemoEvent(
      "doctor_handoff_simulated",
      station.id,
      stationCode,
      { doctor: "Dr. Samirə Vəliyeva", mode: "voice_webrtc_sim" }
    );

    setTimeout(() => {
      dispatch({ type: "UPDATE_DOCTOR_STATE", state: "connected" });
    }, 1500);
  };

  // Contrast & text sizing classes
  const isHighContrast = state.accessibility.highContrast;
  const isLargeText = state.accessibility.largeText;

  const bgTheme = isHighContrast ? "bg-black text-white" : "bg-[#FAF7F2] text-[#171717]";
  const cardTheme = isHighContrast
    ? "bg-zinc-900 border-2 border-white text-white"
    : "bg-white border border-[#E8E3DE] text-[#171717] shadow-sm";
  const primaryBtnTheme = isHighContrast
    ? "bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-white font-black"
    : "bg-[#C8102E] text-white hover:bg-[#8B1028] shadow-md font-bold";

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full flex flex-col justify-between select-none font-sans overflow-x-hidden ${bgTheme}`}
    >
      {/* Kiosk Dedicated Top Header */}
      <header
        className={`w-full px-4 sm:px-8 py-3.5 border-b flex items-center justify-between gap-4 z-30 ${
          isHighContrast ? "bg-black border-zinc-700" : "bg-white border-[#E8E3DE]"
        }`}
      >
        {/* Left: Station Identity & Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            title="Əsas səhifəyə qayıt"
            className="w-11 h-11 rounded-2xl bg-[#C8102E] flex items-center justify-center text-white shadow-md focus:outline-none focus:ring-4 focus:ring-red-400"
          >
            <Heart className="w-6 h-6 fill-white" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black tracking-tight ${isLargeText ? "text-xl" : "text-base"}`}>
                OpenCare <span className="text-[#C8102E]">Point</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-red-100 text-[#8B1028] border border-red-200">
                {stationCode}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                {t("kiosk.demoModeBadge", "Demo Rejimi")}
              </span>
            </div>
            <p className="text-xs text-[#61666D] font-medium flex items-center gap-1.5">
              <span>📍 {station.name}</span>
              <span className="text-gray-300">•</span>
              <span>{station.neighborhood}</span>
            </p>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100/80 border border-gray-200 font-mono text-sm font-bold text-[#171717]">
          <Clock className="w-4 h-4 text-[#C8102E]" />
          <span>{currentTime}</span>
        </div>

        {/* Right: Accessibility & Emergency SOS */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="inline-flex rounded-xl bg-gray-100 p-0.5 border border-gray-200 text-xs font-bold">
            {(["az", "en", "ru"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  i18n.language === lang
                    ? "bg-[#C8102E] text-white shadow-sm"
                    : "text-[#61666D] hover:text-[#171717]"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Accessibility Controls */}
          <button
            type="button"
            onClick={() => {
              playTapSound();
              dispatch({ type: "TOGGLE_HIGH_CONTRAST" });
            }}
            title="Yüksək Kontrast"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs transition ${
              isHighContrast
                ? "bg-yellow-400 text-black border-white"
                : "bg-white border-gray-200 text-[#171717] hover:border-gray-400"
            }`}
          >
            A+
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              dispatch({ type: "TOGGLE_LARGE_TEXT" });
            }}
            title="Böyük Mətn"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs transition ${
              isLargeText
                ? "bg-[#C8102E] text-white border-red-700"
                : "bg-white border-gray-200 text-[#171717] hover:border-gray-400"
            }`}
          >
            T+
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              dispatch({ type: "TOGGLE_VOICE_GUIDANCE" });
            }}
            title="Səsli Bələdçi"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
              state.accessibility.voiceGuidance
                ? "bg-[#177245] text-white border-emerald-700"
                : "bg-white border-gray-200 text-[#171717] hover:border-gray-400"
            }`}
          >
            {state.accessibility.voiceGuidance ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="hidden md:flex w-10 h-10 rounded-xl border border-gray-200 bg-white items-center justify-center text-[#171717] hover:border-gray-400"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Reset Session */}
          {state.state !== "idle" && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                dispatch({ type: "RESET_SESSION" });
              }}
              className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-bold text-[#171717] flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("kiosk.reset", "Sıfırla")}</span>
            </button>
          )}

          {/* ALWAYS VISIBLE EMERGENCY SOS BUTTON */}
          <button
            type="button"
            onClick={handleTriggerEmergency}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#8B1028] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-900/30 transition animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t("kiosk.sosButton", "SOS 103 Təcili")}</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Touchscreen Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {/* ================= STATE 1: IDLE / WELCOME ================= */}
        {state.state === "idle" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-[#8B1028] border border-red-200">
                <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>İctimai Ağıllı Sağlamlıq Məntəqəsi</span>
              </span>
              <h1
                className={`font-black text-[#171717] tracking-tight leading-tight ${
                  isLargeText ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
                } ${isHighContrast ? "text-white" : ""}`}
              >
                Salam! Sizə necə kömək edə bilərik?
              </h1>
              <p
                className={`text-[#61666D] ${
                  isLargeText ? "text-lg" : "text-base"
                } ${isHighContrast ? "text-gray-300" : ""}`}
              >
                {t(
                  "kiosk.welcomeSubtitle",
                  "İctimai məkanlarda nəbzinizi ölçə, nəticəni ekranda görə və tibbi yardım istəyə biləcəyiniz məntəqə."
                )}
              </p>
            </div>

            {/* 3 Prominent Touch Actions (56-72px touch targets) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Nəbzimi ölç */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatchDemoEvent("kiosk_session_started", station.id, stationCode);
                  dispatch({ type: "START_SESSION" });
                }}
                className={`p-6 sm:p-8 rounded-3xl text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-400 min-h-[220px] ${
                  isHighContrast
                    ? "bg-zinc-900 border-4 border-yellow-400 text-white"
                    : "bg-white border-2 border-red-200 shadow-md hover:border-[#C8102E]"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E]">
                    <Heart className="w-8 h-8 fill-[#C8102E]" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
                      01 • Əsas Xidmət
                    </span>
                    <h2
                      className={`font-extrabold text-[#171717] ${
                        isLargeText ? "text-2xl" : "text-xl"
                      } ${isHighContrast ? "text-white" : ""}`}
                    >
                      Nəbzimi ölç
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#61666D]">
                    Köşkdəki cihazla 15 saniyəyə nəbzinizi yoxlayın. Telefon tələb olunmur.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#C8102E]">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black">
                    Ödənişsiz
                  </span>
                  <span className="flex items-center gap-1 font-extrabold">
                    Başla <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>

              {/* Card 2: Həkimlə əlaqə (NFC) */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "START_DOCTOR_HANDOFF" });
                }}
                className={`p-6 sm:p-8 rounded-3xl text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 min-h-[220px] ${
                  isHighContrast
                    ? "bg-zinc-900 border-4 border-blue-400 text-white"
                    : "bg-white border-2 border-blue-100 shadow-md hover:border-blue-500"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                      02 • NFC Handoff
                    </span>
                    <h2
                      className={`font-extrabold text-[#171717] ${
                        isLargeText ? "text-2xl" : "text-xl"
                      } ${isHighContrast ? "text-white" : ""}`}
                    >
                      Həkimlə əlaqə
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#61666D]">
                    Smartfonunuzu NFC sahəsinə toxunduraraq həkimlə tele-məsləhətə keçin.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-bold text-blue-700">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-black">
                    NFC Simulyasiyası
                  </span>
                  <span className="flex items-center gap-1 font-extrabold">
                    Toxun <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>

              {/* Card 3: Təcili tibbi yardım çağır */}
              <button
                type="button"
                onClick={handleTriggerEmergency}
                className={`p-6 sm:p-8 rounded-3xl text-left flex flex-col justify-between transition-all transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-500 min-h-[220px] ${
                  isHighContrast
                    ? "bg-zinc-900 border-4 border-red-500 text-white"
                    : "bg-white border-2 border-red-300 shadow-md hover:border-red-600"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E]">
                    <PhoneCall className="w-8 h-8 text-[#C8102E]" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
                      03 • Təcili Kömək
                    </span>
                    <h2
                      className={`font-extrabold text-[#171717] ${
                        isLargeText ? "text-2xl" : "text-xl"
                      } ${isHighContrast ? "text-white" : ""}`}
                    >
                      Təcili tibbi yardım
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#61666D]">
                    103 dispetçerinə köşkün koordinatlarını göndərin. Telefon tələb olunmur.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#C8102E]">
                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-900 font-black">
                    Pulsuz & Təcili
                  </span>
                  <span className="flex items-center gap-1 font-extrabold">
                    Çağır <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom Value Indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#61666D] font-bold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Telefon tələb olunmur
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Əsas xidmətlər ödənişsizdir
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Anonim & Ephemeral (Məlumat saxlanılmır)
              </span>
            </div>
          </div>
        )}

        {/* ================= STATE 2: INSTRUCTIONS (SCREEN 1) ================= */}
        {state.state === "instructions" && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-[#8B1028]">
              <span>Addım 1 / 3</span>
            </div>

            <h2
              className={`font-black tracking-tight text-[#171717] ${
                isLargeText ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              } ${isHighContrast ? "text-white" : ""}`}
            >
              Köşkdəki cihazı götürün.
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              Köşkün sağ tərəfindəki steril yuvasından ölçmə cihazını çıxarın. Cihaz təmizlənmiş və
              hazırdır.
            </p>

            <div className={`p-8 rounded-3xl ${cardTheme} flex flex-col items-center justify-center gap-4`}>
              <div className="w-24 h-24 rounded-3xl bg-red-50 border-2 border-red-200 flex items-center justify-center shadow-inner">
                <Heart className="w-12 h-12 text-[#C8102E] animate-bounce" />
              </div>
              <p className="text-xs font-bold text-[#61666D]">
                Cihaz avtomatik olaraq aktivləşir.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "RESET_SESSION" });
                }}
                className="px-6 py-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-sm font-bold text-[#171717] min-h-[56px]"
              >
                Ləğv et
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "GO_TO_STEP", step: "device_preparation" });
                }}
                className={`px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center gap-2 min-h-[56px] ${primaryBtnTheme}`}
              >
                <span>Cihazı götürdüm, növbəti addım</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 3: DEVICE PREPARATION (SCREEN 2) ================= */}
        {state.state === "device_preparation" && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-[#8B1028]">
              <span>Addım 2 / 3</span>
            </div>

            <h2
              className={`font-black tracking-tight text-[#171717] ${
                isLargeText ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              } ${isHighContrast ? "text-white" : ""}`}
            >
              Cihazı göstərişə uyğun taxın.
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              Cihazı göstərici barmağınıza rahat şəkildə yerləşdirin. Sensor dərinin üstünə kip oturmalıdır.
            </p>

            <div className={`p-8 rounded-3xl ${cardTheme} flex flex-col items-center justify-center gap-4`}>
              <div className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-[#61666D]">
                Sensor yaşıl işıqla təması təsdiqləyir.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "GO_TO_STEP", step: "instructions" });
                }}
                className="px-6 py-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-sm font-bold text-[#171717] min-h-[56px]"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "GO_TO_STEP", step: "ready" });
                }}
                className={`px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center gap-2 min-h-[56px] ${primaryBtnTheme}`}
              >
                <span>Cihazı taxdım, hazıram</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 4: READY (SCREEN 3) ================= */}
        {state.state === "ready" && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-[#8B1028]">
              <span>Addım 3 / 3</span>
            </div>

            <h2
              className={`font-black tracking-tight text-[#171717] ${
                isLargeText ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              } ${isHighContrast ? "text-white" : ""}`}
            >
              Ölçmə zamanı əlinizi sabit saxlayın.
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              Ölçmə cəmi 15 saniyə çəkəcək. Bu müddətdə hərəkət etməmək siqnal keyfiyyətini təmin edir.
            </p>

            <div className={`p-8 rounded-3xl ${cardTheme} flex flex-col items-center justify-center gap-4`}>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-[#C8102E]">
                <Activity className="w-10 h-10 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-[#61666D]">
                Ölçmə düyməsinə basdıqdan sonra cihaz optik siqnalı oxumağa başlayacaq.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatchDemoEvent("measurement_started", station.id, stationCode);
                  dispatch({ type: "GO_TO_STEP", step: "measuring" });
                }}
                className={`px-10 py-5 rounded-2xl text-base font-extrabold flex items-center gap-3 min-h-[64px] ${primaryBtnTheme}`}
              >
                <Heart className="w-6 h-6 fill-current" />
                <span>Ölçməyə başla (15 saniyə)</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 5: MEASURING (SCREEN 4) ================= */}
        {state.state === "measuring" && (
          <div className="max-w-3xl mx-auto w-full space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-[#C8102E]">
                  Optik Sensor Aktivdir
                </span>
                <h2
                  className={`font-black tracking-tight text-[#171717] ${
                    isLargeText ? "text-3xl" : "text-2xl"
                  } ${isHighContrast ? "text-white" : ""}`}
                >
                  Nəbziniz ölçülür...
                </h2>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-red-100 text-[#8B1028] font-mono font-black text-xl">
                {state.countdownSeconds}s
              </div>
            </div>

            {/* Live Synthetic PPG Canvas Waveform */}
            <div className="rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl relative bg-[#0A0E1A]">
              <canvas
                ref={canvasRef}
                width={800}
                height={260}
                className="w-full h-[220px] sm:h-[260px] block"
              />
              <div className="absolute top-3 left-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[11px] font-mono text-gray-400">
                  PPG TELEMETRY • SAMPLE SIMULATION
                </span>
              </div>
              <div className="absolute bottom-3 right-4 text-xs font-mono text-gray-400">
                SQI Filter: AKTİV
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#61666D]">
                <span>Ölçmə gedişatı</span>
                <span>{state.progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-[#C8102E] transition-all duration-300"
                  style={{ width: `${state.progressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-center text-xs text-[#61666D]">
              Zəhmət olmasa əlinizi sabit saxlayın və danışmayın.
            </p>
          </div>
        )}

        {/* ================= STATE 6: RESULT ================= */}
        {state.state === "result" && state.result && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn">
            {/* Prominent Sample Notice (Section 7 requirement) */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{t("kiosk.sampleNotice", "Nümunə nəticə — real tibbi ölçmə deyil")}</span>
            </div>

            {/* Big Pulse Display */}
            <div
              className={`p-8 sm:p-10 rounded-3xl ${cardTheme} text-center space-y-4 border-2 border-red-200 shadow-xl`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#8B1028] text-xs font-black">
                <Heart className="w-3.5 h-3.5 fill-[#C8102E]" />
                <span>Nəbz Ölçümü</span>
              </div>

              <div className="space-y-1">
                <div className="text-6xl sm:text-7xl font-black text-[#C8102E] tracking-tight">
                  {state.result.bpm}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-[#61666D] uppercase tracking-wider">
                  {state.result.unit}
                </div>
              </div>

              {/* Signal Quality Status */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-[#61666D]">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Siqnal keyfiyyəti: Əla (SQI {state.result.sqi}%)
                </span>
                <span>Ölçmə vaxtı: {state.result.timestamp}</span>
              </div>
            </div>

            {/* Medical Transparency Notice (Strictly no "you are healthy" verdict!) */}
            <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-xs text-[#61666D] space-y-1 leading-relaxed">
              <p className="font-bold text-[#171717]">
                ⚠️ Nümayiş Xəbərdarlığı:
              </p>
              <p>
                Siqnal keyfiyyətinin qənaətbəxş olması yalnız nümayiş alqoritminin uğurla icra
                edildiyini bildirir. Bu nəticə tibbi sağlamlıq rəyi və ya diaqnoz deyildir.
              </p>
            </div>

            {/* Result Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "RETRY_MEASUREMENT" });
                }}
                className="p-3.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-[#171717] hover:border-red-400 flex flex-col items-center justify-center gap-1 shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-[#C8102E]" />
                <span>Yenidən ölç</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "START_DOCTOR_HANDOFF" });
                }}
                className="p-3.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-[#171717] hover:border-blue-400 flex flex-col items-center justify-center gap-1 shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Həkimlə əlaqə</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerEmergency}
                className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#8B1028] hover:bg-red-100 flex flex-col items-center justify-center gap-1 shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-[#C8102E]" />
                <span>Təcili yardım</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatchDemoEvent("session_completed", station.id, stationCode);
                  dispatch({ type: "COMPLETE_SESSION" });
                }}
                className={`p-3.5 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 shadow-md ${primaryBtnTheme}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sessiyanı bitir</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 7: POOR SIGNAL (REJECTED) ================= */}
        {state.state === "poor_signal" && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2
                className={`font-black text-[#171717] tracking-tight ${
                  isLargeText ? "text-3xl" : "text-2xl"
                } ${isHighContrast ? "text-white" : ""}`}
              >
                Ölçmə tamamlanmadı.
              </h2>
              <p className="text-sm sm:text-base text-[#61666D] max-w-lg mx-auto">
                {state.errorMessage ||
                  "Siqnal küyü və ya hərəkət xətası aşkar edildi. Cihazı yenidən yerləşdirib əlinizi sabit saxlayın."}
              </p>
            </div>

            {/* Zero Vitals Notice (Prompt rule: no fabricated vitals on rejected signal) */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold max-w-md mx-auto">
              Siqnal keyfiyyəti qeyri-kafi olduğu üçün nəticə göstərilmədi (SQI: 54%).
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "RETRY_MEASUREMENT" });
                }}
                className={`px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center gap-2 min-h-[56px] ${primaryBtnTheme}`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yenidən cəhd et</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerEmergency}
                className="px-6 py-4 rounded-2xl bg-red-100 hover:bg-red-200 text-sm font-extrabold text-[#8B1028] flex items-center gap-2 min-h-[56px]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Kömək lazımdır (Təcili)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "RESET_SESSION" });
                }}
                className="px-6 py-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-sm font-bold text-[#171717] min-h-[56px]"
              >
                Sessiyanı bağla
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 8: COMPLETED (DEVICE RETURN) ================= */}
        {state.state === "completed" && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2
                className={`font-black text-[#171717] tracking-tight ${
                  isLargeText ? "text-3xl" : "text-2xl"
                } ${isHighContrast ? "text-white" : ""}`}
              >
                Təşəkkür edirik!
              </h2>
              <p className="text-base sm:text-lg font-bold text-[#C8102E]">
                Köşkdəki cihazı steril yuvasına qaytarın.
              </p>
              <p className="text-xs sm:text-sm text-[#61666D]">
                Cihaz növbəti vətəndaş üçün avtomatik dezinfeksiya olunacaq.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-xs font-mono text-[#61666D]">
              Sessiya {state.inactivityRemainingSeconds} saniyə sonra tamamilə sıfırlanacaq.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  dispatch({ type: "RESET_SESSION" });
                }}
                className={`px-8 py-4 rounded-2xl text-sm font-extrabold min-h-[56px] ${primaryBtnTheme}`}
              >
                İndi bağla / Əsas ekrana qayıt
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= SIMULATED EMERGENCY MODAL / OVERLAY ================= */}
      {state.emergency.state !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border-2 border-red-500 p-6 sm:p-8 space-y-5 text-[#171717] shadow-2xl animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E]">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#C8102E]">
                    Təcili Tibbi Yardım Çağırışı
                  </h3>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Lokal Hakaton Simulyasiyası
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "CANCEL_EMERGENCY" })}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mandatory Safety Notice */}
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 font-bold space-y-1">
              <p className="flex items-center gap-1.5 font-black text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                DİQQƏT — Bu demo real 103 xidmətinə zəng etmir!
              </p>
              <p className="font-medium text-red-800">
                Həqiqi fövqəladə vəziyyətdə dərhal mobil telefondan <strong>103</strong> və ya{" "}
                <strong>112</strong> nömrəsini yığın.
              </p>
            </div>

            {/* State Progress Sequence */}
            <div className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span>Sorğu Statusu:</span>
                <span className="font-extrabold text-[#C8102E] uppercase">
                  {state.emergency.state === "starting" && "Başladılır..."}
                  {state.emergency.state === "locating" && "Köşk GPS məlumatı əlavə edilir..."}
                  {state.emergency.state === "awaiting_ack" && "Dispetçer təsdiqi gözlənilir..."}
                  {state.emergency.state === "acknowledged" && "Təsdiqləndi (Simulyasiya)"}
                  {state.emergency.state === "failed" && "Simulyasiya xətası"}
                </span>
              </div>

              {state.emergency.request && (
                <div className="space-y-1.5 pt-2 border-t border-gray-200 font-mono text-[11px] text-[#61666D]">
                  <p>
                    <strong>Sorğu ID:</strong> {state.emergency.request.requestId}
                  </p>
                  <p>
                    <strong>Məntəqə:</strong> {state.emergency.request.stationCode} •{" "}
                    {state.emergency.request.stationName}
                  </p>
                  <p>
                    <strong>Ünvan:</strong> {state.emergency.request.stationAddress}
                  </p>
                  <p>
                    <strong>GPS:</strong> {state.emergency.request.latitude.toFixed(4)},{" "}
                    {state.emergency.request.longitude.toFixed(4)}
                  </p>
                  <p>
                    <strong>Vaxt:</strong> {state.emergency.request.timestamp}
                  </p>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href="tel:103"
                className="px-4 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-bold text-[#171717] flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Real 103 Zəngi Et</span>
              </a>
              <button
                type="button"
                onClick={() => dispatch({ type: "CANCEL_EMERGENCY" })}
                className="px-6 py-3 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028]"
              >
                Pəncərəni bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NFC DOCTOR HANDOFF SIMULATION MODAL ================= */}
      {state.doctorHandoff.state !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-blue-400 p-6 sm:p-8 space-y-5 text-[#171717] shadow-2xl animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#171717]">
                    NFC Həkim Handoff-u
                  </h3>
                  <p className="text-xs text-[#61666D]">Şəxsi smartfonla tele-məsləhət</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "END_DOCTOR_CALL" })}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Waiting for Tap / Tap Action */}
            {state.doctorHandoff.state === "waiting_tap" && (
              <div className="space-y-4 text-center py-4">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 border-2 border-dashed border-blue-300 flex items-center justify-center animate-pulse">
                  <Smartphone className="w-12 h-12 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#171717]">
                    Smartfonunuzu NFC sahəsinə toxundurun
                  </h4>
                  <p className="text-xs text-[#61666D]">
                    Köşkün sol altındakı göy rəngli NFC nişanına yaxınlaşdırın.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateNfcTap}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  NFC toxunuşunu simulyasiya et 📲
                </button>
              </div>
            )}

            {/* Connecting */}
            {state.doctorHandoff.state === "connecting" && (
              <div className="space-y-4 text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <p className="font-extrabold text-[#171717] text-sm">
                  Smartfona səsli zəng handoff-u ötürülür...
                </p>
              </div>
            )}

            {/* Connected Voice Call Interface */}
            {state.doctorHandoff.state === "connected" && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                    SV
                  </span>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm text-[#171717]">
                      Dr. Samirə Vəliyeva
                    </h4>
                    <p className="text-xs text-[#61666D]">
                      Təcili Tibbi Yardım Mütəxəssisi (Simulyasiya)
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {Math.floor(state.doctorHandoff.callDurationSeconds / 60)
                      .toString()
                      .padStart(2, "0")}
                    :
                    {(state.doctorHandoff.callDurationSeconds % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>

                {/* Animated Voice Waveform */}
                <div className="h-14 rounded-2xl bg-zinc-900 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
                  {[24, 40, 16, 32, 48, 20, 36, 12, 44, 28].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-blue-400 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "TOGGLE_DOCTOR_MUTE" })}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                      state.doctorHandoff.isMuted
                        ? "bg-red-100 border-red-300 text-red-800"
                        : "bg-white border-gray-200 text-[#171717]"
                    }`}
                  >
                    {state.doctorHandoff.isMuted ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                    <span>{state.doctorHandoff.isMuted ? "Səssizdə" : "Mikrofon"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => dispatch({ type: "END_DOCTOR_CALL" })}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 rotate-[135deg]" />
                    <span>Zəngi bitir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-[#61666D] text-center">
              ⚠️ Qeyd: Bu nümayiş interfeysidir. Real həkim şəbəkəsi pilot mərhələsində inteqrasiya
              ediləcəkdir.
            </p>
          </div>
        </div>
      )}

      {/* Inactivity Warning Banner */}
      {state.isExtendingSession && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-4 text-xs font-bold animate-bounce">
          <span>Hərəkətsizlik səbəbindən sessiya {state.inactivityRemainingSeconds}s sonra sıfırlanacaq.</span>
          <button
            type="button"
            onClick={() => dispatch({ type: "EXTEND_SESSION" })}
            className="px-3 py-1 rounded-lg bg-[#C8102E] text-white hover:bg-[#8B1028]"
          >
            Vaxtı uzat
          </button>
        </div>
      )}

      {/* Presenter Mode Control Bar (Unobtrusive Bottom Bar) */}
      <footer
        className={`w-full px-4 sm:px-8 py-2 border-t flex flex-wrap items-center justify-between gap-3 text-xs z-20 ${
          isHighContrast ? "bg-black border-zinc-700 text-gray-300" : "bg-white border-[#E8E3DE] text-[#61666D]"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#C8102E] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Hakaton Nümayiş Paneli:
          </span>
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5 border border-gray-200">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_PRESENTER_SCENARIO", scenario: "clean" })}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                state.presenter.signalScenario === "clean"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              ✓ Təmiz Siqnal (97% SQI)
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_PRESENTER_SCENARIO", scenario: "poor" })}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                state.presenter.signalScenario === "poor"
                  ? "bg-amber-600 text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              ⚠ Küy / Hərəkət xətası (54% SQI)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/demo" className="font-bold text-[#C8102E] hover:underline">
            Münsiflər Bələdçisinə keç →
          </Link>
          <Link to="/admin" className="font-bold text-gray-700 hover:text-black hover:underline">
            OpenCare City İdarəetməsi →
          </Link>
        </div>
      </footer>
    </div>
  );
}
