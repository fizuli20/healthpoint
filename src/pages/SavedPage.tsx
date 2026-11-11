import { useMemo, useState } from "react";
import { Bookmark, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AccessPointCard } from "../components/AccessPointCard";
import { ReportIssueModal } from "../components/ReportIssueModal";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  useAccessPointsQuery,
  useSavedIdsQuery,
  useToggleSaveMutation,
} from "../hooks/useHealthPointData";
import { haversineDistanceMeters } from "../lib/geo";
import type { AccessPoint } from "../types/healthpoint";

export function SavedPage() {
  const { t } = useTranslation();
  const { effectiveOrigin } = useHealthPoint();
  const { data: points = [], isLoading } = useAccessPointsQuery();
  const { data: savedIds = [] } = useSavedIdsQuery();
  const toggleSave = useToggleSaveMutation();
  const [reportTarget, setReportTarget] = useState<AccessPoint | null>(null);

  const savedPoints = useMemo(
    () =>
      points
        .filter((p) => savedIds.includes(p.id))
        .map((p) => ({
          point: p,
          dist: haversineDistanceMeters(effectiveOrigin, { lat: p.latitude, lng: p.longitude }),
        }))
        .sort((a, b) => a.dist - b.dist),
    [points, savedIds, effectiveOrigin]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#C8102E]" />
            {t("profile.savedTitle")}
          </h1>
          <p className="text-sm text-[#737373] mt-0.5">
            {savedPoints.length} {t("nav.saved").toLowerCase()}
          </p>
        </div>
        <Link
          to="/nearby"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#C8102E] text-[#C8102E] text-sm font-semibold hover:bg-[#FFF1F2]"
        >
          <MapPin className="w-4 h-4" />
          {t("nav.nearby")}
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 text-center text-sm text-[#737373]">
          Loading saved locations...
        </div>
      ) : savedPoints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-8 sm:p-10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF1F2] text-[#C8102E] flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-[#171717] max-w-md mx-auto">
            {t("profile.savedEmpty")}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028]"
            >
              {t("nav.map")}
            </Link>
            <Link
              to="/nearby"
              className="px-5 py-2.5 rounded-xl bg-white border border-[#C8102E] text-[#C8102E] text-sm font-semibold hover:bg-[#FFF1F2]"
            >
              {t("nav.nearby")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPoints.map(({ point, dist }) => (
            <AccessPointCard
              key={point.id}
              point={point}
              distanceMeters={dist}
              isSaved={true}
              onToggleSave={(id) => toggleSave.mutate(id)}
              onReport={(pt) => setReportTarget(pt)}
            />
          ))}
        </div>
      )}

      {reportTarget && (
        <ReportIssueModal
          open={Boolean(reportTarget)}
          accessPointId={reportTarget.id}
          accessPointName={reportTarget.name}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
