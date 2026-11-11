import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  PhoneCall,
  QrCode,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useActivateStationMutation } from "../hooks/useHealthPointData";
import {
  EQUIPMENT_USAGE_GUIDE,
  getKioskCode,
  localizeAccessPoint,
  resolveLang,
} from "../lib/localizePoint";
import type { AccessPoint, EquipmentItem } from "../types/healthpoint";
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

  const [codeInput, setCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<AccessPoint | null>(null);
  const [selectedModule, setSelectedModule] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
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
    setCodeInput(getKioskCode(loc.id));
    setActivePoint(loc);
    setSelectedModule(loc.equipment[0] ?? null);
    activateMutation.mutate(loc.id);
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {t("station.activeSessionBadge")}
              </span>
              <DemoBadge />
            </div>

            <div className="rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] px-3.5 py-2.5 text-xs text-[#8B1028]">
              {t("station.demoNotice")}
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
