import { AlertTriangle, CheckCircle2, ClipboardList, MapPin, Plus, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import {
  useLocalizedAccessPointsQuery,
  useLocalizedReportsQuery,
} from "../../hooks/useHealthPointData";

export function AdminOverviewPage() {
  const { t } = useTranslation();
  const { data: points = [] } = useLocalizedAccessPointsQuery();
  const { data: reports = [] } = useLocalizedReportsQuery();
  const pointNames = new Map(points.map((p) => [p.id, p.name]));

  const operationalCount = points.filter((p) => p.operationalStatus === "operational").length;
  const limitedCount = points.filter((p) => p.operationalStatus === "limited").length;
  const unavailableCount = points.filter((p) => p.operationalStatus === "unavailable").length;
  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_progress");
  const totalUsage = points.reduce((sum, p) => sum + (p.usageCount || 0), 0);

  const kpis = [
    { label: t("admin.totalPoints"), value: points.length, icon: MapPin, accent: "text-[#C8102E]" },
    {
      label: t("admin.operationalPoints"),
      value: operationalCount,
      icon: CheckCircle2,
      accent: "text-emerald-700",
    },
    {
      label: t("admin.limitedPoints"),
      value: limitedCount,
      icon: AlertTriangle,
      accent: "text-amber-700",
    },
    {
      label: t("admin.unavailablePoints"),
      value: unavailableCount,
      icon: AlertTriangle,
      accent: "text-rose-700",
    },
    {
      label: t("admin.pendingReports"),
      value: openReports.length,
      icon: ClipboardList,
      accent: "text-[#C8102E]",
    },
    {
      label: t("admin.totalUsage"),
      value: totalUsage,
      icon: TrendingUp,
      accent: "text-[#171717]",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#737373]">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.accent}`} />
              </div>
              <p className="text-2xl font-extrabold text-[#171717]">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171717]">{t("admin.points")}</h2>
            <Link
              to="/admin/points"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028]"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("admin.addPoint")}
            </Link>
          </div>
          <div className="space-y-2.5">
            {points.slice(0, 5).map((pt) => (
              <div
                key={pt.id}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]"
              >
                <div>
                  <p className="text-xs font-bold text-[#171717]">{pt.name}</p>
                  <p className="text-[11px] text-[#737373]">{pt.neighborhood}</p>
                </div>
                <StatusBadge status={pt.operationalStatus} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171717]">{t("admin.reports")}</h2>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-[#C8102E] hover:underline"
            >
              {t("admin.viewAll", { count: reports.length })}
            </Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-[#737373]">{t("admin.noReports")}</p>
          ) : (
            <div className="space-y-2.5">
              {reports.slice(0, 5).map((rep) => (
                <div
                  key={rep.id}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#171717]">
                      {pointNames.get(rep.accessPointId) || rep.accessPointName || rep.accessPointId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF1F2] text-[#C8102E]">
                      {t(`admin.reportStatuses.${rep.status}`)}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] line-clamp-2">{rep.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
