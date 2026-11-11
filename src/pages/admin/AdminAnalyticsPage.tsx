import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedAccessPointsQuery, useReportsQuery } from "../../hooks/useHealthPointData";
import { ALL_EQUIPMENT, type OperationalStatus, type ReportStatus } from "../../types/healthpoint";

export function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const { data: points = [] } = useLocalizedAccessPointsQuery();
  const { data: reports = [] } = useReportsQuery();

  const total = Math.max(points.length, 1);

  const statusCounts: { status: OperationalStatus; count: number; color: string }[] = [
    {
      status: "operational",
      count: points.filter((p) => p.operationalStatus === "operational").length,
      color: "#059669",
    },
    {
      status: "limited",
      count: points.filter((p) => p.operationalStatus === "limited").length,
      color: "#D97706",
    },
    {
      status: "unavailable",
      count: points.filter((p) => p.operationalStatus === "unavailable").length,
      color: "#C8102E",
    },
    {
      status: "unknown",
      count: points.filter((p) => p.operationalStatus === "unknown").length,
      color: "#737373",
    },
  ];

  const maxUsage = Math.max(...points.map((p) => p.usageCount || 0), 1);

  const reportByStatus: { status: ReportStatus; count: number }[] = (
    ["open", "in_progress", "resolved", "dismissed"] as ReportStatus[]
  ).map((s) => ({
    status: s,
    count: reports.filter((r) => r.status === s).length,
  }));

  const equipmentCoverage = ALL_EQUIPMENT.map((item) => ({
    item,
    count: points.filter((p) => p.equipment.includes(item)).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#C8102E]" />
          {t("admin.analytics")}
        </h2>
        <span className="text-xs font-medium text-[#737373] bg-white px-3 py-1.5 rounded-full border border-[#E5E7EB]">
          {t("admin.gapNotice")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#171717]">{t("admin.coverageChart")}</h3>
          <div className="space-y-3">
            {statusCounts.map((row) => {
              const pct = Math.round((row.count / total) * 100);
              return (
                <div key={row.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#171717]">{t(`status.${row.status}`)}</span>
                    <span className="text-[#737373]">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#F5F5F5] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Equipment Coverage */}
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#171717]">{t("point.equipmentList")}</h3>
          <div className="space-y-3">
            {equipmentCoverage.map((row) => {
              const pct = Math.round((row.count / total) * 100);
              return (
                <div key={row.item} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#171717]">{t(`equipment.${row.item}`)}</span>
                    <span className="text-[#737373]">
                      {row.count}/{points.length} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#F5F5F5] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C8102E]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Usage by Baku Location */}
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#171717]">{t("admin.neighborhoodChart")}</h3>
          <div className="space-y-2.5">
            {points
              .slice()
              .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
              .map((pt) => {
                const pct = Math.round(((pt.usageCount || 0) / maxUsage) * 100);
                return (
                  <div key={pt.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#171717] truncate pr-2">{pt.name}</span>
                      <span className="text-[#737373] font-bold shrink-0">{pt.usageCount}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FFF1F2] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C8102E]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Maintenance Reports */}
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#171717]">{t("admin.reportTrends")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {reportByStatus.map((row) => (
              <div
                key={row.status}
                className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-4 space-y-1"
              >
                <span className="text-xs font-semibold text-[#737373]">
                  {t(`admin.reportStatuses.${row.status}`)}
                </span>
                <p className="text-2xl font-extrabold text-[#171717]">{row.count}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
