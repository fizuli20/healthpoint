import { Accessibility, Bookmark, Clock, Flag, MapPin, Navigation, QrCode, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatDistance, estimateDurationSeconds, formatDurationMinutes } from "../lib/geo";
import { getKioskCode, localizePlacementZone } from "../lib/localizePoint";
import type { AccessPoint } from "../types/healthpoint";
import { DemoBadge, StatusBadge } from "./StatusBadge";

interface AccessPointCardProps {
  point: AccessPoint;
  distanceMeters?: number;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onReport?: (point: AccessPoint) => void;
  onActivate?: (point: AccessPoint) => void;
  compact?: boolean;
}

export function AccessPointCard({
  point,
  distanceMeters,
  isSaved,
  onToggleSave,
  onReport,
  onActivate,
  compact = false,
}: AccessPointCardProps) {
  const { t, i18n } = useTranslation();
  const walkSeconds =
    distanceMeters !== undefined ? estimateDurationSeconds(distanceMeters, "walking") : undefined;

  return (
    <article className="hp-card bg-white rounded-2xl border border-[#E5E7EB] shadow-soft hover:shadow-card transition-shadow p-4 sm:p-5 flex flex-col justify-between gap-4">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FFF1F2] border border-[#FCE8EC] text-[#C8102E] text-[10px] font-extrabold tracking-wide">
                {getKioskCode(point.id)}
              </span>
              <h3 className="font-bold text-[#171717] text-base leading-snug">{point.name}</h3>
            </div>
            <p className="text-xs text-[#737373] inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
              {point.address}
            </p>
          </div>
          <StatusBadge status={point.operationalStatus} />
        </div>

        {point.isDemo && (
          <div className="flex flex-wrap items-center gap-1.5">
            <DemoBadge />
            {point.placementZone && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[10px] font-bold text-[#737373]">
                {localizePlacementZone(point.placementZone, i18n.language)}
              </span>
            )}
          </div>
        )}

        {!compact && point.placementReason && (
          <p className="text-xs text-[#737373] bg-[#FAFAFA] border border-[#F5F5F5] rounded-xl px-2.5 py-2 leading-relaxed">
            <span className="font-bold text-[#8B1028]">{t("point.whyShort")}: </span>
            {point.placementReason}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#737373] pt-0.5">
          {distanceMeters !== undefined && (
            <span className="font-semibold text-[#171717]">
              {formatDistance(distanceMeters, i18n.language)}
              {walkSeconds !== undefined && ` • ~${formatDurationMinutes(walkSeconds, i18n.language)}`}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {point.openingHours}
          </span>
          {point.wheelchairAccessible && (
            <span className="inline-flex items-center gap-1 text-[#8B1028] font-medium">
              <Accessibility className="w-3.5 h-3.5" />
              {t("filters.wheelchair")}
            </span>
          )}
          {point.audioGuided && (
            <span className="inline-flex items-center gap-1 text-[#171717] font-medium">
              <Volume2 className="w-3.5 h-3.5 text-[#C8102E]" />
              {t("point.audioShort")}
            </span>
          )}
        </div>

        {!compact && point.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {point.equipment.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[11px] font-medium text-[#171717]"
              >
                {t(`equipment.${item}`)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <Link
          to={`/navigation/${point.id}`}
          role="button"
          className="flex-1 min-w-[115px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs sm:text-sm font-semibold hover:bg-[#8B1028] focus:outline-none focus:ring-2 focus:ring-[#E11D48] transition"
        >
          <Navigation className="w-4 h-4" />
          {t("point.navigate")}
        </Link>
        <Link
          to={`/points/${point.id}`}
          role="button"
          className="flex-1 min-w-[100px] inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-white border border-[#C8102E] text-[#C8102E] text-xs sm:text-sm font-semibold hover:bg-[#FFF1F2] focus:outline-none focus:ring-2 focus:ring-[#C8102E] transition"
        >
          {t("point.details")}
        </Link>
        <button
          type="button"
          onClick={() => onToggleSave(point.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? t("point.saved") : t("point.save")}
          className={`p-2.5 rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
            isSaved
              ? "bg-[#FFF1F2] border-[#C8102E] text-[#C8102E]"
              : "bg-white border-[#E5E7EB] text-[#737373] hover:text-[#171717]"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>
        {onActivate && (
          <button
            type="button"
            onClick={() => onActivate(point)}
            aria-label={t("point.activateStation")}
            title={t("point.activateStation")}
            className="p-2.5 rounded-xl border border-[#FCE8EC] bg-[#FFF1F2] text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}
        {onReport && (
          <button
            type="button"
            onClick={() => onReport(point)}
            aria-label={t("point.reportIssue")}
            className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#737373] hover:text-[#C8102E] hover:border-[#FCE8EC] transition focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
}
