import { useTranslation } from "react-i18next";
import type { OperationalStatus } from "../types/healthpoint";

const STATUS_STYLES: Record<
  OperationalStatus,
  { dot: string; bg: string; text: string; border: string }
> = {
  operational: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  limited: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  unavailable: {
    dot: "bg-rose-600",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  unknown: {
    dot: "bg-neutral-400",
    bg: "bg-neutral-100",
    text: "text-neutral-700",
    border: "border-neutral-200",
  },
};

export function StatusBadge({ status }: { status: OperationalStatus }) {
  const { t } = useTranslation();
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
      {t(`status.${status}`)}
    </span>
  );
}

export function DemoBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1F2] text-[#8B1028] border border-[#FCE8EC]">
      {t("app.demoBanner")}
    </span>
  );
}
