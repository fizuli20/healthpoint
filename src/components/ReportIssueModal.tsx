import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useHealthPoint } from "../context/HealthPointContext";
import { submitMaintenanceReport } from "../services/healthpointStore";
import type { IssueType } from "../types/healthpoint";

const ISSUE_TYPES: IssueType[] = [
  "broken_equipment",
  "incorrect_location",
  "accessibility_issue",
  "closed_unavailable",
  "damaged_infrastructure",
  "other",
];

interface ReportIssueModalProps {
  accessPointId: string;
  accessPointName: string;
  open: boolean;
  onClose: () => void;
}

export function ReportIssueModal({
  accessPointId,
  accessPointName,
  open,
  onClose,
}: ReportIssueModalProps) {
  const { t } = useTranslation();
  const { user } = useHealthPoint();
  const queryClient = useQueryClient();

  const [issueType, setIssueType] = useState<IssueType>("broken_equipment");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      submitMaintenanceReport({
        accessPointId,
        issueType,
        description,
        userId: user && !user.isDemoAuth ? user.id : null,
      }),
    onSuccess: () => {
      setSubmitted(true);
      setDescription("");
      setErrorMsg(null);
      void queryClient.invalidateQueries({ queryKey: ["maintenanceReports"] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    },
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setErrorMsg(t("report.descriptionPlaceholder"));
      return;
    }
    setErrorMsg(null);
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-card border border-[#E5E7EB]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="report-modal-title" className="text-lg font-bold text-[#171717]">
              {t("report.title")}
            </h2>
            <p className="text-sm text-[#737373] mt-0.5">{accessPointName}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setErrorMsg(null);
              onClose();
            }}
            className="p-2 rounded-full text-[#737373] hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            aria-label={t("report.cancel")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-[#171717]">{t("report.success")}</p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#C8102E] text-white font-semibold hover:bg-[#8B1028] transition"
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="issue-type-select"
                className="block text-xs font-semibold uppercase tracking-wider text-[#737373] mb-1.5"
              >
                {t("report.issueType")}
              </label>
              <select
                id="issue-type-select"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#171717] focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#FCE8EC]"
              >
                {ISSUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`report.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="issue-description-input"
                className="block text-xs font-semibold uppercase tracking-wider text-[#737373] mb-1.5"
              >
                {t("report.description")}
              </label>
              <textarea
                id="issue-description-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("report.descriptionPlaceholder")}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#171717] focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#FCE8EC]"
                required
              />
            </div>

            {errorMsg && (
              <div
                className="flex items-center gap-2 text-xs font-medium text-[#8B1028] bg-[#FFF1F2] border border-[#FCE8EC] px-3 py-2 rounded-xl"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#171717] hover:bg-[#F5F5F5] transition"
              >
                {t("report.cancel")}
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#C8102E] text-sm font-semibold text-white hover:bg-[#8B1028] disabled:opacity-60 transition"
              >
                {mutation.isPending ? "..." : t("report.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
