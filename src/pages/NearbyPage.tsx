import { useMemo, useState } from "react";
import { ArrowUpDown, Compass, LocateFixed, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AccessPointCard } from "../components/AccessPointCard";
import { ReportIssueModal } from "../components/ReportIssueModal";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { StationActivateModal } from "../components/StationActivateModal";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  useLocalizedAccessPointsQuery,
  useSavedIdsQuery,
  useToggleSaveMutation,
} from "../hooks/useHealthPointData";
import { filterAccessPoints, sortAccessPoints } from "../lib/filters";
import { haversineDistanceMeters } from "../lib/geo";
import { localizePlacementZone } from "../lib/localizePoint";
import {
  ALL_PLACEMENT_ZONES,
  type AccessPoint,
  type PlacementZone,
  type SortMode,
} from "../types/healthpoint";

export function NearbyPage() {
  const { t, i18n } = useTranslation();
  const { effectiveOrigin, filter, setFilter, resetFilters, requestLocation } = useHealthPoint();
  const { data: points = [], isLoading } = useLocalizedAccessPointsQuery();
  const { data: savedIds = [] } = useSavedIdsQuery();
  const toggleSave = useToggleSaveMutation();

  const [sortBy, setSortBy] = useState<SortMode>("distance");
  const [reportTarget, setReportTarget] = useState<AccessPoint | null>(null);
  const [activateTarget, setActivateTarget] = useState<AccessPoint | null>(null);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  const visiblePoints = useMemo(() => {
    const filtered = filterAccessPoints(points, filter, effectiveOrigin);
    return sortAccessPoints(filtered, effectiveOrigin, sortBy);
  }, [points, filter, effectiveOrigin, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            {t("map.sheetTitle")}
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            {isLoading ? "..." : t("map.resultsCount", { count: visiblePoints.length })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActivateTarget(null);
              setActivateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028] transition shadow-brand"
          >
            <QrCode className="w-4 h-4" />
            {t("station.scanOrCode")}
          </button>

          <button
            type="button"
            onClick={() => void requestLocation()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#C8102E] text-[#C8102E] text-xs font-bold hover:bg-[#FFF1F2] transition"
          >
            <LocateFixed className="w-4 h-4" />
            {t("map.findNearest")}
          </button>

          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#171717]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>{t("filters.sortBy")}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className="bg-transparent font-bold focus:outline-none"
            >
              <option value="distance">{t("filters.sortDistance")}</option>
              <option value="availability">{t("filters.sortAvailability")}</option>
              <option value="equipment">{t("filters.sortEquipment")}</option>
            </select>
          </label>
        </div>
      </div>

      <SearchFilterBar />

      {/* 15-Point Urban Placement Strategy & Zone Filter */}
      <section className="rounded-3xl bg-[#FFF1F2]/60 border border-[#FCE8EC] p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1 max-w-3xl">
            <h2 className="text-xs sm:text-sm font-extrabold text-[#8B1028] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#C8102E]" />
              {t("nearby.strategyTitle", { count: points.length })}
            </h2>
            <p className="text-xs text-[#737373] leading-relaxed">
              {t("nearby.strategyBody")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, zone: "all" }))}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              !filter.zone || filter.zone === "all"
                ? "bg-[#C8102E] text-white border-[#C8102E]"
                : "bg-white text-[#171717] border-[#E5E7EB] hover:border-[#C8102E]"
            }`}
          >
            {t("nearby.allZones")} ({points.length})
          </button>
          {ALL_PLACEMENT_ZONES.map((zone: PlacementZone) => {
            const count = points.filter((pt) => pt.placementZone === zone).length;
            const active = filter.zone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() =>
                  setFilter((p) => ({ ...p, zone: p.zone === zone ? "all" : zone }))
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active
                    ? "bg-[#C8102E] text-white border-[#C8102E]"
                    : "bg-white text-[#171717] border-[#E5E7EB] hover:border-[#C8102E]"
                }`}
              >
                {localizePlacementZone(zone, i18n.language)} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {visiblePoints.length === 0 && !isLoading ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-10 text-center space-y-3">
          <p className="text-lg font-bold text-[#171717]">{t("filters.emptyTitle")}</p>
          <p className="text-sm text-[#737373]">{t("filters.emptySubtitle")}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028]"
          >
            {t("filters.clear")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visiblePoints.map((pt) => (
            <AccessPointCard
              key={pt.id}
              point={pt}
              distanceMeters={haversineDistanceMeters(effectiveOrigin, {
                lat: pt.latitude,
                lng: pt.longitude,
              })}
              isSaved={savedIds.includes(pt.id)}
              onToggleSave={(id) => toggleSave.mutate(id)}
              onReport={(p) => setReportTarget(p)}
              onActivate={(p) => {
                setActivateTarget(p);
                setActivateModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ReportIssueModal
        accessPointId={reportTarget?.id ?? ""}
        accessPointName={reportTarget?.name ?? ""}
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
      />

      <StationActivateModal
        open={activateModalOpen}
        points={points}
        initialPoint={activateTarget}
        onClose={() => setActivateModalOpen(false)}
      />
    </div>
  );
}
