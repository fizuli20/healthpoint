import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  useLocalizedAccessPointsQuery,
  useLocalizedReportsQuery,
} from "../../hooks/useHealthPointData";
import { updateMaintenanceReport } from "../../services/healthpointStore";
import type { MaintenanceReport, ReportStatus } from "../../types/healthpoint";

const REPORT_STATUSES: ReportStatus[] = ["open", "in_progress", "resolved", "dismissed"];

function ReportRow({
  report,
  pointName,
}: {
  report: MaintenanceReport;
  pointName?: string;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [assignedTo, setAssignedTo] = useState(report.assignedTo ?? "");
  const [notes, setNotes] = useState(report.notes ?? "");
  const [savedNotice, setSavedNotice] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      updateMaintenanceReport(report.id, {
        status,
        assignedTo: assignedTo.trim(),
        notes: notes.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["maintenanceReports"] });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <Link
            to={`/points/${report.accessPointId}`}
            className="text-sm font-bold text-[#171717] hover:text-[#C8102E]"
          >
            {pointName || report.accessPointName || report.accessPointId}
          </Link>
          <p className="text-xs text-[#737373]">
            {t(`report.types.${report.issueType}`)} •{" "}
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#C8102E]">
          {t(`admin.reportStatuses.${report.status}`)}
        </span>
      </div>

      <p className="text-sm text-[#171717] bg-[#FAFAFA] rounded-xl px-3.5 py-2.5 border border-[#E5E7EB]">
        {report.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-[#737373] mb-1">
            {t("admin.reportStatus")}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus)}
            className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs bg-white"
          >
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`admin.reportStatuses.${s}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#737373] mb-1">
            {t("admin.assignedTo")}
          </label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={t("admin.assignedPlaceholder")}
            className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#737373] mb-1">
            {t("admin.notes")}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("admin.notesPlaceholder")}
            className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("admin.updated")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028] disabled:opacity-50"
        >
          {t("admin.savePoint")}
        </button>
      </div>
    </div>
  );
}

export function AdminReportsPage() {
  const { t } = useTranslation();
  const { data: reports = [] } = useLocalizedReportsQuery();
  const { data: points = [] } = useLocalizedAccessPointsQuery();
  const pointNames = new Map(points.map((p) => [p.id, p.name]));
  const [filterStatus, setFilterStatus] = useState<"all" | ReportStatus>("all");

  const filtered =
    filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#C8102E]" />
          {t("admin.reports")} ({filtered.length})
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", ...REPORT_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                filterStatus === s
                  ? "bg-[#C8102E] text-white border-[#C8102E]"
                  : "bg-white text-[#737373] border-[#E5E7EB]"
              }`}
            >
              {s === "all" ? t("admin.all") : t(`admin.reportStatuses.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 text-center text-sm text-[#737373]">
          {t("admin.noMatchingReports")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rep) => (
            <ReportRow key={rep.id} report={rep} pointName={pointNames.get(rep.accessPointId)} />
          ))}
        </div>
      )}
    </div>
  );
}
