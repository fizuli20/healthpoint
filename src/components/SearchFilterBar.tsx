import { useState } from "react";
import { Mic, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHealthPoint } from "../context/HealthPointContext";
import { countActiveFilters } from "../lib/filters";
import { ALL_EQUIPMENT, type EquipmentItem } from "../types/healthpoint";

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function SearchFilterBar({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation();
  const { filter, setFilter, resetFilters } = useHealthPoint();
  const [showEquipment, setShowEquipment] = useState(!compact);
  const [listening, setListening] = useState(false);

  const activeCount = countActiveFilters(filter);

  const toggleEquipment = (item: EquipmentItem) => {
    setFilter((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((x) => x !== item)
        : [...prev.equipment, item],
    }));
  };

  const handleVoiceSearch = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Rec) return;

    const rec = new Rec();
    rec.lang = i18n.language === "az" ? "az-AZ" : i18n.language === "ru" ? "ru-RU" : "en-US";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setFilter((prev) => ({ ...prev, search: transcript }));
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const supportsSpeech =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            placeholder={t("map.searchPlaceholder")}
            aria-label={t("map.searchPlaceholder")}
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white pl-10 pr-16 py-2.5 text-sm text-[#171717] placeholder:text-[#737373] shadow-soft focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#FCE8EC]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {filter.search && (
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, search: "" }))}
                aria-label={t("filters.clear")}
                className="p-1.5 rounded-full text-[#737373] hover:bg-[#F5F5F5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {supportsSpeech && (
              <button
                type="button"
                onClick={handleVoiceSearch}
                aria-label={t("assistant.voiceInput")}
                className={`p-1.5 rounded-full transition ${
                  listening
                    ? "bg-[#C8102E] text-white"
                    : "text-[#737373] hover:bg-[#FFF1F2] hover:text-[#C8102E]"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setShowEquipment((s) => !s)}
            aria-expanded={showEquipment}
            aria-label="Filtrlər"
            className={`px-3 py-2.5 rounded-2xl border text-xs font-semibold inline-flex items-center gap-1.5 shadow-soft transition ${
              activeCount > 0 || showEquipment
                ? "bg-[#FFF1F2] border-[#C8102E] text-[#C8102E]"
                : "bg-white border-[#E5E7EB] text-[#171717]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#C8102E] text-white text-[10px]">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          active={filter.nearestOnly}
          onClick={() => setFilter((p) => ({ ...p, nearestOnly: !p.nearestOnly }))}
          label={t("filters.nearest")}
        />
        <FilterChip
          active={filter.operationalOnly}
          onClick={() => setFilter((p) => ({ ...p, operationalOnly: !p.operationalOnly }))}
          label={t("filters.operational")}
        />
        <FilterChip
          active={filter.open247Only}
          onClick={() => setFilter((p) => ({ ...p, open247Only: !p.open247Only }))}
          label={t("filters.open247")}
        />
        <FilterChip
          active={filter.wheelchairOnly}
          onClick={() => setFilter((p) => ({ ...p, wheelchairOnly: !p.wheelchairOnly }))}
          label={t("filters.wheelchair")}
        />
        {(activeCount > 0 || filter.search) && (
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-[#C8102E] hover:bg-[#FFF1F2] transition"
          >
            {t("filters.clear")}
          </button>
        )}
      </div>

      {showEquipment && (
        <div className="flex flex-wrap gap-1.5">
          {ALL_EQUIPMENT.map((item) => (
            <FilterChip
              key={item}
              active={filter.equipment.includes(item)}
              onClick={() => toggleEquipment(item)}
              label={t(`equipment.${item}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
        active
          ? "bg-[#C8102E] border-[#C8102E] text-white shadow-sm"
          : "bg-white border-[#E5E7EB] text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E]"
      }`}
    >
      {label}
    </button>
  );
}
