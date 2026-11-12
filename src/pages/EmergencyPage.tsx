import { useEffect, useState } from "react";
import {
  AlertOctagon,
  HeartPulse,
  LocateFixed,
  PhoneCall,
  Play,
  Share2,
  ShieldAlert,
  Square,
  UserCheck,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  useEmergencyContactsQuery,
  useLocalizedAccessPointsQuery,
} from "../hooks/useHealthPointData";
import { findNearestSuitablePoint } from "../lib/geo";
import { loadMedicalCard } from "../services/healthpointStore";

export function EmergencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { effectiveOrigin, requestLocation, setSelectedPointId } = useHealthPoint();
  const { data: points = [] } = useLocalizedAccessPointsQuery();
  const { data: contacts = [] } = useEmergencyContactsQuery();

  const [shareConfirmOpen, setShareConfirmOpen] = useState(false);
  const [shareCoordsText, setShareCoordsText] = useState("");
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [showContactsList, setShowContactsList] = useState(false);

  const [cprActive, setCprActive] = useState(false);
  const [cprCount, setCprCount] = useState(0);
  const [cprPulse, setCprPulse] = useState(false);
  const medicalCard = loadMedicalCard();
  const hasMedicalData = Boolean(
    medicalCard.bloodType || medicalCard.allergies || medicalCard.conditions || medicalCard.medications
  );

  useEffect(() => {
    if (!cprActive) {
      setCprPulse(false);
      return;
    }
    const interval = window.setInterval(() => {
      setCprCount((c) => c + 1);
      setCprPulse(true);
      window.setTimeout(() => setCprPulse(false), 160);
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.065);
          window.setTimeout(() => void ctx.close().catch(() => undefined), 120);
        }
      } catch {
        // Ignore audio errors if blocked or unavailable
      }
    }, Math.round(60000 / 110));
    return () => window.clearInterval(interval);
  }, [cprActive]);

  const openShareConfirmation = async () => {
    const coords = await requestLocation();
    setShareCoordsText(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
    setShareConfirmOpen(true);
  };

  const executeShare = async () => {
    const url = `https://maps.google.com/?q=${shareCoordsText.replace(/\s+/g, "")}`;
    const text = `${t("app.name")} — ${shareCoordsText} (${url})`;
    setShareConfirmOpen(false);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: t("app.name"), text, url });
        return;
      } catch {
        // User cancelled or share unsupported, fall back to clipboard copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareNotice(t("emergency.copied"));
      window.setTimeout(() => setShareNotice(null), 4000);
    }
  };

  const handleNearestAccessPoint = async () => {
    const coords = await requestLocation();
    const match = findNearestSuitablePoint(points, coords);
    if (match) {
      setSelectedPointId(match.point.id);
      navigate(`/navigation/${match.point.id}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Urgent Header */}
      <div className="rounded-3xl bg-[#FFF1F2] border-2 border-[#C8102E] p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8102E] text-white text-xs font-extrabold uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4" />
          SOS
        </div>
        <h1 className="text-3xl font-extrabold text-[#171717]">{t("emergency.headline")}</h1>
        <p className="text-base text-[#737373]">{t("emergency.subheading")}</p>
      </div>

      {/* Native Direct Emergency Dial Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="tel:103"
          role="button"
          className="flex items-center justify-center gap-3 p-5 rounded-3xl bg-[#C8102E] text-white font-extrabold text-lg shadow-brand hover:bg-[#8B1028] focus:outline-none focus:ring-4 focus:ring-[#FCE8EC] transition"
        >
          <PhoneCall className="w-6 h-6 shrink-0" />
          <span>{t("emergency.callAmbulance")}</span>
        </a>

        <a
          href="tel:112"
          role="button"
          className="flex items-center justify-center gap-3 p-5 rounded-3xl bg-[#8B1028] text-white font-extrabold text-lg shadow-brand hover:bg-[#171717] focus:outline-none focus:ring-4 focus:ring-[#FCE8EC] transition"
        >
          <PhoneCall className="w-6 h-6 shrink-0" />
          <span>{t("emergency.callEmergency")}</span>
        </a>
      </div>

      {/* Supporting Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => void openShareConfirmation()}
          className="w-full p-4 rounded-2xl bg-white border-2 border-[#E5E7EB] hover:border-[#C8102E] text-left flex items-center gap-3 font-bold text-[#171717] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#C8102E] flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <p>{t("emergency.shareLocation")}</p>
            <p className="text-xs font-normal text-[#737373]">
              {effectiveOrigin.lat.toFixed(4)}, {effectiveOrigin.lng.toFixed(4)}
            </p>
          </div>
        </button>

        {shareNotice && (
          <div
            role="status"
            className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl"
          >
            {shareNotice}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowContactsList((s) => !s)}
          className="w-full p-4 rounded-2xl bg-white border-2 border-[#E5E7EB] hover:border-[#C8102E] text-left flex items-center gap-3 font-bold text-[#171717] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#C8102E] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <span>{t("emergency.contactTrusted")}</span>
        </button>

        {showContactsList && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 space-y-2">
            {contacts.length === 0 ? (
              <div className="text-xs text-[#737373] flex items-center justify-between gap-2">
                <span>{t("emergency.noContacts")}</span>
                <Link to="/profile" className="text-[#C8102E] font-bold underline">
                  {t("nav.profile")}
                </Link>
              </div>
            ) : (
              contacts.map((c) => (
                <a
                  key={c.id}
                  href={`tel:${c.phoneNumber}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#C8102E] text-sm font-semibold"
                >
                  <span>{c.contactName}</span>
                  <span className="text-[#C8102E] inline-flex items-center gap-1">
                    <PhoneCall className="w-4 h-4" />
                    {c.phoneNumber}
                  </span>
                </a>
              ))
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleNearestAccessPoint()}
          className="w-full p-4 rounded-2xl bg-white border-2 border-[#C8102E] text-[#C8102E] hover:bg-[#FFF1F2] text-left flex items-center gap-3 font-bold transition"
        >
          <div className="w-10 h-10 rounded-xl bg-[#C8102E] text-white flex items-center justify-center shrink-0">
            <LocateFixed className="w-5 h-5" />
          </div>
          <span>{t("emergency.findNearest")}</span>
        </button>
      </div>

      {/* Personal Emergency Medical ID (ICE) */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-[#171717] flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#C8102E]" />
            {t("emergency.iceTitle")}
          </h2>
          <Link to="/profile" className="text-xs font-bold text-[#C8102E] hover:underline">
            {t("emergency.iceEdit")}
          </Link>
        </div>
        {hasMedicalData ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] px-3 py-2.5">
              <p className="text-[11px] font-semibold text-[#8B1028]">{t("emergency.iceBlood")}</p>
              <p className="text-base font-extrabold text-[#C8102E] mt-0.5">
                {medicalCard.bloodType || "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-2.5">
              <p className="text-[11px] font-semibold text-[#737373]">{t("emergency.iceAllergy")}</p>
              <p className="text-xs font-bold text-[#171717] mt-0.5">
                {medicalCard.allergies || "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-2.5">
              <p className="text-[11px] font-semibold text-[#737373]">{t("emergency.iceConditions")}</p>
              <p className="text-xs font-bold text-[#171717] mt-0.5">
                {[medicalCard.conditions, medicalCard.medications].filter(Boolean).join(" • ") || "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#737373]">{t("emergency.iceEmpty")}</p>
        )}
      </section>

      {/* First-Aid Coach & Interactive 110 BPM CPR Pacer */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-extrabold text-[#171717]">{t("emergency.firstAidTitle")}</h2>
            <p className="text-xs text-[#737373] mt-0.5">{t("emergency.firstAidNote")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded-full transition-transform duration-100 ${
                cprPulse ? "scale-125 bg-[#C8102E]" : "scale-100 bg-[#FCE8EC]"
              }`}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => {
                if (cprActive) {
                  setCprActive(false);
                } else {
                  setCprCount(0);
                  setCprActive(true);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                cprActive
                  ? "bg-[#171717] text-white"
                  : "bg-[#C8102E] text-white hover:bg-[#8B1028]"
              }`}
            >
              {cprActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {cprActive ? t("emergency.cprStop") : t("emergency.cprStart")}
            </button>
          </div>
        </div>

        {cprActive && (
          <div
            role="status"
            className="rounded-2xl bg-[#FFF1F2] border border-[#C8102E] px-4 py-3 flex items-center justify-between gap-2 flex-wrap"
          >
            <span className="text-xs font-bold text-[#8B1028]">{t("emergency.cprHint")}</span>
            <span className="text-sm font-extrabold text-[#C8102E] tabular-nums">
              {t("emergency.cprCount", { count: cprCount })}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3.5 space-y-1">
            <p className="text-xs font-extrabold text-[#C8102E]">{t("emergency.stepCprTitle")}</p>
            <p className="text-xs text-[#171717] leading-relaxed">{t("emergency.stepCprBody")}</p>
          </div>
          <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3.5 space-y-1">
            <p className="text-xs font-extrabold text-[#C8102E]">{t("emergency.stepChestTitle")}</p>
            <p className="text-xs text-[#171717] leading-relaxed">{t("emergency.stepChestBody")}</p>
          </div>
          <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3.5 space-y-1">
            <p className="text-xs font-extrabold text-[#C8102E]">{t("emergency.stepBleedTitle")}</p>
            <p className="text-xs text-[#171717] leading-relaxed">{t("emergency.stepBleedBody")}</p>
          </div>
        </div>
      </section>

      {/* Explicit Safety Disclaimer */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 flex items-start gap-3 text-xs text-[#737373] leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
        <p>{t("emergency.disclaimer")}</p>
      </div>

      {/* Location Share Confirmation Dialog */}
      {shareConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-card border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#171717]">
                {t("emergency.confirmShareTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setShareConfirmOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#737373]">
              {t("emergency.confirmShareBody", { coords: shareCoordsText })}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShareConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold"
              >
                {t("report.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void executeShare()}
                className="flex-1 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-semibold"
              >
                {t("emergency.confirmShareBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
