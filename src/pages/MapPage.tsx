import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, LocateFixed, MapPin, PhoneCall, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AccessPointCard } from "../components/AccessPointCard";
import { LeafletMapView } from "../components/LeafletMapView";
import { MapErrorBoundary } from "../components/MapErrorBoundary";
import { ReportIssueModal } from "../components/ReportIssueModal";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { DemoBadge, StatusBadge } from "../components/StatusBadge";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  useAccessPointsQuery,
  useSavedIdsQuery,
  useToggleSaveMutation,
} from "../hooks/useHealthPointData";
import { filterAccessPoints, sortAccessPoints } from "../lib/filters";
import { findNearestSuitablePoint, formatDistance, haversineDistanceMeters } from "../lib/geo";
import type { AccessPoint } from "../types/healthpoint";

const MANUAL_BAKU_LOCATIONS = [
  { label: "Sahil / Seaside", lat: 40.3712, lng: 49.8473 },
  { label: "28 May Metro", lat: 40.3792, lng: 49.8489 },
  { label: "Icherisheher", lat: 40.3661, lng: 49.8318 },
  { label: "Ganjlik", lat: 40.4004, lng: 49.8524 },
];

export function MapPage() {
  const { t, i18n } = useTranslation();
  const {
    userLocation,
    effectiveOrigin,
    locationPermission,
    requestLocation,
    setManualLocation,
    filter,
    resetFilters,
    accessibility,
    selectedPointId,
    setSelectedPointId,
  } = useHealthPoint();

  const { data: points = [], isLoading } = useAccessPointsQuery();
  const { data: savedIds = [] } = useSavedIdsQuery();
  const toggleSave = useToggleSaveMutation();

  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [reportTarget, setReportTarget] = useState<AccessPoint | null>(null);
  const [nearestBanner, setNearestBanner] = useState(false);
  const [showManualLoc, setShowManualLoc] = useState(false);

  const filteredPoints = useMemo(
    () =>
      sortAccessPoints(
        filterAccessPoints(points, filter, effectiveOrigin),
        effectiveOrigin,
        "distance"
      ),
    [points, filter, effectiveOrigin]
  );

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedPointId) ?? null,
    [points, selectedPointId]
  );

  const handleFindNearest = async () => {
    const coords = await requestLocation();
    const match = findNearestSuitablePoint(filteredPoints.length ? filteredPoints : points, coords, {
      wheelchairOnly: filter.wheelchairOnly,
      allowLimited: true,
    });
    if (match) {
      setSelectedPointId(match.point.id);
      setSheetExpanded(false);
      setNearestBanner(true);
      window.setTimeout(() => setNearestBanner(false), 3500);
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Interactive Leaflet Map */}
      <MapErrorBoundary>
        <LeafletMapView
          points={filteredPoints}
          selectedPointId={selectedPointId}
          onSelectPoint={(p) => {
            setSelectedPointId(p.id);
            setSheetExpanded(false);
          }}
          userLocation={userLocation}
          center={effectiveOrigin}
        />
      </MapErrorBoundary>

      {/* Top Search & Find Nearest Floating Overlay */}
      <div className="absolute top-3 left-3 right-16 z-[410] max-w-xl space-y-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E5E7EB] shadow-card p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <DemoBadge />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowManualLoc((v) => !v)}
                className="text-[11px] font-semibold text-[#737373] hover:text-[#C8102E] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[#E5E7EB] bg-[#FAFAFA]"
              >
                <MapPin className="w-3 h-3 text-[#C8102E]" />
                {locationPermission === "granted"
                  ? t("map.yourLocation")
                  : t("map.bakuCenter")}
              </button>
              <button
                type="button"
                onClick={() => void handleFindNearest()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8102E] text-white text-xs font-bold shadow-brand hover:bg-[#8B1028] focus:outline-none focus:ring-2 focus:ring-[#E11D48] transition"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {t("map.findNearest")}
              </button>
            </div>
          </div>

          {showManualLoc && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#E5E7EB]">
              <span className="text-[11px] font-semibold text-[#737373] w-full">
                {t("map.manualLocation")}:
              </span>
              {MANUAL_BAKU_LOCATIONS.map((loc) => (
                <button
                  key={loc.label}
                  type="button"
                  onClick={() => {
                    setManualLocation({ lat: loc.lat, lng: loc.lng });
                    setShowManualLoc(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF1F2] text-[#8B1028] border border-[#FCE8EC] hover:bg-[#C8102E] hover:text-white transition"
                >
                  {loc.label}
                </button>
              ))}
            </div>
          )}

          {locationPermission === "denied" && !showManualLoc && (
            <p className="text-[11px] text-[#8B1028] bg-[#FFF1F2] px-2.5 py-1 rounded-xl">
              {t("map.locationDenied")}
            </p>
          )}

          <SearchFilterBar compact />
        </div>

        {nearestBanner && (
          <div
            role="status"
            className="inline-flex items-center gap-2 bg-[#171717] text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-card"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#E11D48]" />
            {t("map.nearestRecommended")}
          </div>
        )}
      </div>

      {/* Always-accessible Floating Emergency SOS Button (never covered by bottom sheet/nav) */}
      <div className="fixed md:absolute bottom-24 md:bottom-6 right-4 z-[460]">
        <Link
          to="/emergency"
          role="button"
          aria-label="Emergency SOS"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#C8102E] text-white font-extrabold text-sm shadow-brand border-2 border-white hover:bg-[#8B1028] focus:outline-none focus:ring-4 focus:ring-[#FCE8EC] transition"
        >
          <PhoneCall className="w-4 h-4 animate-pulse" />
          <span>SOS • 103 / 112</span>
        </Link>
      </div>

      {/* Selected Access Point Animated Info Card */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={accessibility.reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="absolute bottom-20 md:bottom-6 left-3 right-3 md:right-auto md:w-[420px] z-[440]"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelectedPointId(null)}
                aria-label="Close card"
                className="absolute -top-2.5 -right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-[#E5E7EB] shadow-soft flex items-center justify-center text-[#171717] hover:text-[#C8102E]"
              >
                <X className="w-4 h-4" />
              </button>
              <AccessPointCard
                point={selectedPoint}
                distanceMeters={haversineDistanceMeters(effectiveOrigin, {
                  lat: selectedPoint.latitude,
                  lng: selectedPoint.longitude,
                })}
                isSaved={savedIds.includes(selectedPoint.id)}
                onToggleSave={(id) => toggleSave.mutate(id)}
                onReport={(p) => setReportTarget(p)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet for Nearby Points when no single card is focused */}
      {!selectedPoint && (
        <section
          aria-label={t("map.sheetTitle")}
          className={`absolute left-3 right-3 md:right-auto md:w-[420px] bottom-16 md:bottom-4 z-[420] bg-white rounded-3xl border border-[#E5E7EB] shadow-card transition-all ${
            sheetExpanded ? "max-h-[58vh]" : "max-h-[155px]"
          } flex flex-col overflow-hidden`}
        >
          <button
            type="button"
            onClick={() => setSheetExpanded((s) => !s)}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-[#F5F5F5] text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#C8102E]"
          >
            <div>
              <h2 className="font-bold text-sm text-[#171717]">{t("map.sheetTitle")}</h2>
              <p className="text-xs text-[#737373]">
                {isLoading ? "..." : t("map.resultsCount", { count: filteredPoints.length })}
              </p>
            </div>
            <span className="p-1.5 rounded-full bg-[#FAFAFA] text-[#171717]">
              {sheetExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </span>
          </button>

          <div className="overflow-y-auto p-3 space-y-2.5">
            {filteredPoints.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm font-semibold text-[#171717]">{t("filters.emptyTitle")}</p>
                <p className="text-xs text-[#737373]">{t("filters.emptySubtitle")}</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-1.5 rounded-full bg-[#C8102E] text-white text-xs font-semibold"
                >
                  {t("filters.clear")}
                </button>
              </div>
            ) : (
              filteredPoints.map((pt) => {
                const dist = haversineDistanceMeters(effectiveOrigin, {
                  lat: pt.latitude,
                  lng: pt.longitude,
                });
                return (
                  <div
                    key={pt.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-2xl border border-[#E5E7EB] hover:border-[#C8102E] bg-[#FAFAFA]/60 transition"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPointId(pt.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="font-bold text-xs sm:text-sm text-[#171717] truncate">
                        {pt.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <StatusBadge status={pt.operationalStatus} />
                        <span className="text-xs font-semibold text-[#737373]">
                          {formatDistance(dist, i18n.language)}
                        </span>
                      </div>
                    </button>
                    <Link
                      to={`/navigation/${pt.id}`}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#8B1028]"
                    >
                      {t("point.navigate")}
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      <ReportIssueModal
        accessPointId={reportTarget?.id ?? ""}
        accessPointName={reportTarget?.name ?? ""}
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}
