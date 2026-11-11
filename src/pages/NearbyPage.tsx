import { useMemo, useState } from "react";
import { ArrowUpDown, LocateFixed, QrCode } from "lucide-react";
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
import type { AccessPoint, SortMode } from "../types/healthpoint";

export function NearbyPage() {
  const { t } = useTranslation();
  const { effectiveOrigin, filter, resetFilters, requestLocation } = useHealthPoint();
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
