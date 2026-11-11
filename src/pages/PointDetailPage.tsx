import { useEffect, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Flag,
  MapPin,
  Navigation,
  QrCode,
  ShieldAlert,
  Volume2,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { HealthPointIcon, LoadingSplash } from "../components/BrandLogo";
import { LeafletMapView } from "../components/LeafletMapView";
import { MapErrorBoundary } from "../components/MapErrorBoundary";
import { ReportIssueModal } from "../components/ReportIssueModal";
import { StationActivateModal } from "../components/StationActivateModal";
import { DemoBadge, StatusBadge } from "../components/StatusBadge";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  useLocalizedAccessPointQuery,
  useLocalizedAccessPointsQuery,
  useSavedIdsQuery,
  useToggleSaveMutation,
} from "../hooks/useHealthPointData";
import {
  estimateDurationSeconds,
  formatDistance,
  formatDurationMinutes,
  haversineDistanceMeters,
} from "../lib/geo";
import { getKioskCode } from "../lib/localizePoint";
import { trackAccessPointView } from "../services/healthpointStore";

export function PointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { effectiveOrigin } = useHealthPoint();
  const { data: point, isLoading } = useLocalizedAccessPointQuery(id);
  const { data: allPoints = [] } = useLocalizedAccessPointsQuery();
  const { data: savedIds = [] } = useSavedIdsQuery();
  const toggleSave = useToggleSaveMutation();
  const [reportOpen, setReportOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

  useEffect(() => {
    if (id) {
      void trackAccessPointView(id);
    }
  }, [id]);

  if (isLoading) {
    return <LoadingSplash />;
  }

  if (!point) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-[#C8102E] mx-auto" />
        <h1 className="text-2xl font-bold text-[#171717]">{t("point.notFound")}</h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8102E] text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("point.backToMap")}
        </Link>
      </div>
    );
  }

  const distMeters = haversineDistanceMeters(effectiveOrigin, {
    lat: point.latitude,
    lng: point.longitude,
  });
  const walkSec = estimateDurationSeconds(distMeters, "walking");
  const isSaved = savedIds.includes(point.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#737373] hover:text-[#C8102E]"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("point.backToMap")}
      </Link>

      {/* Hero Visual Card */}
      <div className="hp-card bg-white rounded-3xl border border-[#E5E7EB] shadow-card overflow-hidden">
        {point.imageUrl ? (
          <img
            src={point.imageUrl}
            alt={point.name}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="h-44 bg-gradient-to-br from-[#FFF1F2] via-white to-[#FCE8EC] border-b border-[#FCE8EC] flex items-center justify-between px-6 sm:px-10">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#C8102E]">
                <span className="px-2 py-0.5 rounded-md bg-[#C8102E] text-white">
                  {getKioskCode(point.id)}
                </span>
                {t("app.name")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
                {point.name}
              </h1>
              <p className="text-sm text-[#737373] inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C8102E]" />
                {point.address}
              </p>
            </div>
            <div className="hidden sm:flex w-20 h-20 rounded-3xl bg-white shadow-soft border border-[#FCE8EC] items-center justify-center">
              <HealthPointIcon size={48} />
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={point.operationalStatus} />
            {point.isDemo && <DemoBadge />}
          </div>

          <p className="text-sm sm:text-base text-[#171717] leading-relaxed">
            {point.description}
          </p>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricBox
              label={t("point.distance")}
              value={formatDistance(distMeters, i18n.language)}
            />
            <MetricBox
              label={t("point.walkEstimate")}
              value={`~${formatDurationMinutes(walkSec, i18n.language)}`}
            />
            <MetricBox
              label={t("point.hours")}
              value={point.openingHours}
              icon={<Clock className="w-3.5 h-3.5 text-[#C8102E]" />}
            />
            <MetricBox
              label={t("point.lastVerified")}
              value={new Date(point.lastVerifiedAt).toLocaleDateString()}
            />
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActivateOpen(true)}
              className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#C8102E] text-white font-bold hover:bg-[#8B1028] transition shadow-brand"
            >
              <QrCode className="w-4 h-4" />
              {t("point.activateStation")}
            </button>
            <Link
              to={`/navigation/${point.id}`}
              role="button"
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FFF1F2] border border-[#C8102E] text-[#C8102E] font-bold hover:bg-[#FCE8EC] transition"
            >
              <Navigation className="w-4 h-4" />
              {t("point.navigate")}
            </Link>
            <button
              type="button"
              onClick={() => toggleSave.mutate(point.id)}
              className={`px-5 py-3 rounded-2xl border font-bold inline-flex items-center gap-2 transition ${
                isSaved
                  ? "bg-[#FFF1F2] border-[#C8102E] text-[#C8102E]"
                  : "bg-white border-[#E5E7EB] text-[#171717] hover:border-[#C8102E]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? t("point.saved") : t("point.save")}
            </button>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="px-5 py-3 rounded-2xl border border-[#C8102E] bg-white text-[#C8102E] font-bold inline-flex items-center gap-2 hover:bg-[#FFF1F2] transition"
            >
              <Flag className="w-4 h-4" />
              {t("point.reportIssue")}
            </button>
          </div>
        </div>
      </div>

      {/* Equipment & Accessibility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hp-card bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-[#C8102E] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {t("point.equipmentList")}
          </h2>
          <ul className="space-y-2">
            {point.equipment.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAFAFA] border border-[#F5F5F5] text-sm font-medium text-[#171717]"
              >
                <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                {t(`equipment.${item}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="hp-card bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-[#C8102E] flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            {t("point.accessibility")}
          </h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center gap-3">
              <Accessibility
                className={`w-5 h-5 ${
                  point.wheelchairAccessible ? "text-emerald-600" : "text-[#737373]"
                }`}
              />
              <span className="font-medium text-[#171717]">
                {point.wheelchairAccessible
                  ? t("point.wheelchairYes")
                  : t("point.wheelchairNo")}
              </span>
            </div>
            {point.audioGuided && (
              <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#C8102E]" />
                <span className="font-medium text-[#171717]">{t("point.audioYes")}</span>
              </div>
            )}
            <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] flex items-center gap-3">
              <Wrench className="w-5 h-5 text-[#8B1028]" />
              <div>
                <p className="font-semibold text-[#8B1028] text-xs">{t("point.maintenanceInfo")}</p>
                <p className="text-xs text-[#737373] mt-0.5">
                  {t("point.usageEvents")}: {point.usageCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Map Preview */}
      <div className="hp-card bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-soft h-64">
        <MapErrorBoundary>
          <LeafletMapView
            points={[point]}
            selectedPointId={point.id}
            center={{ lat: point.latitude, lng: point.longitude }}
            zoom={15}
            showControls={false}
          />
        </MapErrorBoundary>
      </div>

      <ReportIssueModal
        accessPointId={point.id}
        accessPointName={point.name}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      <StationActivateModal
        open={activateOpen}
        points={allPoints.length > 0 ? allPoints : [point]}
        initialPoint={point}
        onClose={() => setActivateOpen(false)}
      />
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3">
      <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-bold text-sm text-[#171717] inline-flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}
