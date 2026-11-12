import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bluetooth,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  MapPin,
  PhoneCall,
  QrCode,
  RotateCcw,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useActivateStationMutation,
  useSaveVitalReadingMutation,
} from "../hooks/useHealthPointData";
import {
  EQUIPMENT_USAGE_GUIDE,
  getKioskCode,
  localizeAccessPoint,
  resolveLang,
} from "../lib/localizePoint";
import {
  runVitalCheckSimulation,
  SESSION_PASS_CATALOG,
} from "../lib/sensorSignalAi";
import type {
  AccessPoint,
  EquipmentItem,
  SessionPassType,
  VitalReadingRecord,
} from "../types/healthpoint";
import { DemoBadge, StatusBadge } from "./StatusBadge";

interface StationActivateModalProps {
  open: boolean;
  points: AccessPoint[];
  initialPoint?: AccessPoint | null;
  onClose: () => void;
}

export function StationActivateModal({
  open,
  points,
  initialPoint = null,
  onClose,
}: StationActivateModalProps) {
  const { t, i18n } = useTranslation();
  const lang = resolveLang(i18n.language);
  const activateMutation = useActivateStationMutation();
  const saveReadingMutation = useSaveVitalReadingMutation();

  const [codeInput, setCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<AccessPoint | null>(null);
  const [selectedModule, setSelectedModule] = useState<EquipmentItem | null>(null);
  const [selectedPass, setSelectedPass] = useState<SessionPassType>("free_basic");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [latestReading, setLatestReading] = useState<VitalReadingRecord | null>(null);
  const [ringConnected, setRingConnected] = useState(false);
  const [receiptCopied, setReceiptCopied] = useState(false);

  useEffect(() => {
    if (!open || !activePoint) {
      setElapsedSeconds(0);
      return;
    }
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, activePoint]);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setLatestReading(null);
    setElapsedSeconds(0);
    setRingConnected(false);
    setReceiptCopied(false);
    if (initialPoint) {
      const loc = localizeAccessPoint(initialPoint, i18n.language);
      setCodeInput(getKioskCode(loc.id));
      if (loc.operationalStatus === "unavailable") {
        setActivePoint(null);
        setErrorMsg(t("station.unavailableWarning"));
      } else {
        setActivePoint(loc);
        setSelectedModule(loc.equipment[0] ?? null);
        activateMutation.mutate(loc.id);
      }
    } else {
      setCodeInput("");
      setActivePoint(null);
      setSelectedModule(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPoint?.id]);

  if (!open) return null;

  const activateByPoint = (rawPoint: AccessPoint) => {
    const loc = localizeAccessPoint(rawPoint, i18n.language);
    if (loc.operationalStatus === "unavailable") {
      setErrorMsg(t("station.unavailableWarning"));
      return;
    }
    setErrorMsg(null);
    setLatestReading(null);
    setElapsedSeconds(0);
    setRingConnected(false);
    setReceiptCopied(false);
    setCodeInput(getKioskCode(loc.id));
    setActivePoint(loc);
    setSelectedModule(loc.equipment[0] ?? null);
    activateMutation.mutate(loc.id);
  };

  const runSensorCheck = (mode: "good" | "poor") => {
    if (!activePoint) return;
    const result = runVitalCheckSimulation(mode, selectedPass, activePoint);
    setLatestReading(result);
    if (result.signalStatus === "good") {
      saveReadingMutation.mutate(result);
    }
  };

  const formatTimer = (sec: number) => {
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = codeInput.trim().toUpperCase();
    const match = points.find(
      (pt) => getKioskCode(pt.id).toUpperCase() === cleaned || pt.id.toUpperCase() === cleaned
    );
    if (!match) {
      setErrorMsg(t("station.codeNotFound"));
      return;
    }
    activateByPoint(match);
  };

  const speakGuide = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US";
    window.speechSynthesis.speak(utter);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-modal-title"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#E5E7EB] shadow-card max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 id="station-modal-title" className="text-lg font-extrabold text-[#171717]">
                {activePoint ? activePoint.name : t("station.enterCodeTitle")}
              </h2>
              <p className="text-xs text-[#737373]">
                {activePoint
                  ? `${getKioskCode(activePoint.id)} • ${activePoint.address}`
                  : t("station.enterCodeSubtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            aria-label={t("report.cancel")}
            className="p-2 rounded-full text-[#737373] hover:bg-[#F5F5F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!activePoint ? (
          <div className="space-y-4">
            <form onSubmit={handleCodeSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={t("station.codePlaceholder")}
                aria-label={t("point.kioskCode")}
                className="flex-1 px-4 py-3 rounded-2xl border border-[#E5E7EB] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#C8102E]"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-2xl bg-[#C8102E] text-white text-xs sm:text-sm font-bold hover:bg-[#8B1028] shrink-0"
              >
                {t("station.activateBtn")}
              </button>
            </form>

            {errorMsg && (
              <p className="text-xs font-semibold text-[#C8102E]" role="alert">
                {errorMsg}
              </p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#737373]">
                {t("station.quickSelect")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {points.map((rawPt) => {
                  const pt = localizeAccessPoint(rawPt, i18n.language);
                  const disabled = pt.operationalStatus === "unavailable";
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => activateByPoint(pt)}
                      className={`p-3 rounded-2xl border text-left transition flex items-start justify-between gap-2 ${
                        disabled
                          ? "bg-[#F5F5F5] border-[#E5E7EB] opacity-60 cursor-not-allowed"
                          : "bg-white border-[#E5E7EB] hover:border-[#C8102E] hover:bg-[#FFF1F2]"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#C8102E] text-white text-[10px] font-extrabold mb-1">
                          {getKioskCode(pt.id)}
                        </span>
                        <p className="text-xs font-bold text-[#171717] truncate">{pt.name}</p>
                        <p className="text-[11px] text-[#737373] truncate inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {pt.neighborhood}
                        </p>
                      </div>
                      <StatusBadge status={pt.operationalStatus} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("station.activeSessionBadge")}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#171717] text-xs font-extrabold tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#C8102E]" />
                  {t("station.sessionTimer")}: {formatTimer(elapsedSeconds)}
                </span>
              </div>
              <DemoBadge />
            </div>

            <div className="rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] px-3.5 py-2.5 text-xs text-[#8B1028]">
              {t("station.demoNotice")}
            </div>

            {/* Apar-style One-Time Pass / Free Core Selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#171717]">{t("station.passSelectTitle")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["free_basic", "one_time_full", "tele_consult"] as SessionPassType[]).map((passId) => {
                  const active = selectedPass === passId;
                  const titleKey =
                    passId === "free_basic"
                      ? "station.passFreeTitle"
                      : passId === "one_time_full"
                        ? "station.passPaidTitle"
                        : "station.passTeleTitle";
                  const priceKey =
                    passId === "free_basic"
                      ? "station.passFreePrice"
                      : passId === "one_time_full"
                        ? "station.passPaidPrice"
                        : "station.passTelePrice";
                  const descKey =
                    passId === "free_basic"
                      ? "station.passFreeDesc"
                      : passId === "one_time_full"
                        ? "station.passPaidDesc"
                        : "station.passTeleDesc";
                  return (
                    <button
                      key={passId}
                      type="button"
                      onClick={() => setSelectedPass(passId)}
                      className={`p-2.5 rounded-2xl border text-left transition ${
                        active
                          ? "bg-[#FFF1F2] border-[#C8102E] shadow-soft"
                          : "bg-white border-[#E5E7EB] hover:border-[#C8102E]"
                      }`}
                    >
                      <p className="text-[11px] font-extrabold text-[#171717]">{t(titleKey)}</p>
                      <p className="text-xs font-extrabold text-[#C8102E] mt-0.5">{t(priceKey)}</p>
                      <p className="text-[10px] text-[#737373] mt-0.5 leading-snug">{t(descKey)}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#737373]">{t("station.passDisclaimer")}</p>
            </div>

            {/* RingXCare Optical Sensor + Edge AI Signal Quality Simulator */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3.5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#171717] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#C8102E]" />
                    {t("station.sensorTitle")}
                  </h3>
                  <p className="text-[11px] text-[#737373] mt-0.5">{t("station.sensorSubtitle")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRingConnected((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    ringConnected
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-[#E5E7EB] text-[#171717] hover:border-[#C8102E]"
                  }`}
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  {ringConnected ? t("station.ringConnected") : t("station.connectRingBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => runSensorCheck("good")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028] transition"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {t("station.measureNormalBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => runSensorCheck("poor")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-50 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("station.measurePoorBtn")}
                </button>
              </div>

              {latestReading && (
                <div className="rounded-2xl bg-white border border-[#E5E7EB] p-3 space-y-2.5">
                  {/* PPG Waveform SVG */}
                  <div className="rounded-xl bg-[#FAFAFA] px-2 py-1.5 border border-[#F5F5F5]">
                    <svg
                      viewBox="0 0 240 44"
                      className="w-full h-11 overflow-visible"
                      aria-hidden="true"
                    >
                      <polyline
                        fill="none"
                        stroke={latestReading.signalStatus === "good" ? "#C8102E" : "#D97706"}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={latestReading.waveform
                          .map(
                            (v, idx) =>
                              `${Math.round((idx / (latestReading.waveform.length - 1)) * 236 + 2)},${Math.round(
                                40 - v * 34
                              )}`
                          )
                          .join(" ")}
                      />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[#737373]">
                      {t("station.sqiLabel")}:
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        latestReading.signalStatus === "good"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {latestReading.signalQualityScore}% •{" "}
                      {latestReading.signalStatus === "good"
                        ? t("station.sqiGood")
                        : t("station.sqiPoor")}
                    </span>
                  </div>

                  {latestReading.signalStatus === "good" ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-[#FFF1F2] px-2.5 py-2 text-center">
                          <p className="text-[10px] font-semibold text-[#8B1028]">{t("station.bpm")}</p>
                          <p className="text-sm font-extrabold text-[#C8102E]">
                            {latestReading.heartRateBpm} bpm
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-2 text-center">
                          <p className="text-[10px] font-semibold text-[#737373]">{t("station.spo2")}</p>
                          <p className="text-sm font-extrabold text-[#171717]">
                            {latestReading.spo2Percent}%
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-2 text-center">
                          <p className="text-[10px] font-semibold text-[#737373]">{t("station.bp")}</p>
                          <p className="text-xs font-extrabold text-[#171717] mt-0.5">
                            {latestReading.bloodPressure ??
                              (SESSION_PASS_CATALOG[selectedPass].includesBloodPressure
                                ? "—"
                                : "0 AZN")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          {t("station.aiOkMsg", { score: latestReading.signalQualityScore })}
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            const receipt = `${latestReading.kioskCode} • ${latestReading.accessPointName} | ${latestReading.heartRateBpm} bpm | SpO2 ${latestReading.spo2Percent}%${
                              latestReading.bloodPressure ? ` | ${latestReading.bloodPressure}` : ""
                            } | SQI ${latestReading.signalQualityScore}% | ${
                              latestReading.priceAzn === 0 ? "0 AZN" : `${latestReading.priceAzn.toFixed(2)} AZN (Demo)`
                            }`;
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                              await navigator.clipboard.writeText(receipt).catch(() => undefined);
                            }
                            setReceiptCopied(true);
                            window.setTimeout(() => setReceiptCopied(false), 3000);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF1F2] border border-[#FCE8EC] text-[#C8102E] text-[11px] font-bold hover:bg-[#FCE8EC]"
                        >
                          <Copy className="w-3 h-3" />
                          {receiptCopied ? t("station.receiptCopied") : t("station.copyReceiptBtn")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                        {t("station.aiPoorMsg", { score: latestReading.signalQualityScore })}
                      </p>
                      <button
                        type="button"
                        onClick={() => runSensorCheck("good")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171717] text-white text-xs font-bold hover:bg-[#C8102E] transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t("station.retryMeasureBtn")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#C8102E]" />
                  {t("station.availableModules")}
                </h3>
              </div>
              <p className="text-xs text-[#737373]">{t("station.stepGuide")}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                {activePoint.equipment.map((eq) => {
                  const active = selectedModule === eq;
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setSelectedModule(eq)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        active
                          ? "bg-[#C8102E] text-white border-[#C8102E]"
                          : "bg-white text-[#171717] border-[#E5E7EB] hover:border-[#C8102E]"
                      }`}
                    >
                      {t(`equipment.${eq}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedModule && (
              <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-[#C8102E]">
                    {t(`equipment.${selectedModule}`)}
                  </p>
                  {typeof window !== "undefined" && "speechSynthesis" in window && (
                    <button
                      type="button"
                      onClick={() => speakGuide(EQUIPMENT_USAGE_GUIDE[selectedModule][lang])}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#171717] hover:border-[#C8102E]"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#C8102E]" />
                      {t("station.listenVoice")}
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                  {EQUIPMENT_USAGE_GUIDE[selectedModule][lang]}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <a
                href="tel:103"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-[#FFF1F2] border border-[#C8102E] text-[#C8102E] text-xs font-bold hover:bg-[#FCE8EC]"
              >
                <PhoneCall className="w-4 h-4" />
                103
              </a>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  onClose();
                }}
                className="flex-1 py-3 rounded-2xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#8B1028]"
              >
                {t("station.endSession")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
