import { useState } from "react";
import {
  AlertOctagon,
  LocateFixed,
  PhoneCall,
  Share2,
  ShieldAlert,
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
