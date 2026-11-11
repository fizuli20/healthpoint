import { Accessibility, Contrast, Eye, MessageSquareText, Sparkles, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHealthPoint } from "../context/HealthPointContext";
import type { AccessibilityPreferences } from "../types/healthpoint";

const FONT_OPTIONS: { value: AccessibilityPreferences["fontSize"]; labelKey: string }[] = [
  { value: "normal", labelKey: "accessibility.fontNormal" },
  { value: "large", labelKey: "accessibility.fontLarge" },
  { value: "xlarge", labelKey: "accessibility.fontXLarge" },
];

export function AccessibilityPage() {
  const { t } = useTranslation();
  const { accessibility, updateAccessibility } = useHealthPoint();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#171717] flex items-center gap-2">
          <Accessibility className="w-6 h-6 text-[#C8102E]" />
          {t("accessibility.title")}
        </h1>
        <p className="text-sm text-[#737373] mt-1">{t("accessibility.subtitle")}</p>
      </div>

      {/* Master Easy Access Mode */}
      <section className="rounded-3xl bg-[#FFF1F2] border-2 border-[#C8102E] p-5 sm:p-6 shadow-soft flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#C8102E]">
            <Sparkles className="w-3.5 h-3.5" />
            WCAG 2.2 AA
          </span>
          <h2 className="text-lg font-extrabold text-[#171717]">{t("accessibility.easyAccess")}</h2>
          <p className="text-sm text-[#8B1028] leading-relaxed">{t("accessibility.easyAccessDesc")}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={accessibility.easyAccessMode}
          aria-label={t("accessibility.easyAccess")}
          onClick={() => updateAccessibility({ easyAccessMode: !accessibility.easyAccessMode })}
          className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
            accessibility.easyAccessMode ? "bg-[#C8102E]" : "bg-white border border-[#C8102E]"
          }`}
        >
          <span
            className={`block w-6 h-6 rounded-full shadow transition-transform ${
              accessibility.easyAccessMode
                ? "translate-x-6 bg-white"
                : "translate-x-0 bg-[#C8102E]"
            }`}
          />
        </button>
      </section>

      {/* Font Size */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Type className="w-5 h-5 text-[#C8102E]" />
          {t("accessibility.fontSize")}
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {FONT_OPTIONS.map((opt) => {
            const active = accessibility.fontSize === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => updateAccessibility({ fontSize: opt.value })}
                className={`py-3 px-3 rounded-2xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
                  active
                    ? "bg-[#C8102E] border-[#C8102E] text-white"
                    : "bg-white border-[#E5E7EB] text-[#171717] hover:bg-[#FAFAFA]"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Visual, Motion & Plain Language Controls */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft divide-y divide-[#E5E7EB]">
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Contrast className="w-5 h-5 text-[#C8102E] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("accessibility.highContrast")}</p>
              <p className="text-xs text-[#737373] mt-0.5">{t("accessibility.highContrastDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={accessibility.highContrast}
            aria-label={t("accessibility.highContrast")}
            onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
            className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
              accessibility.highContrast ? "bg-[#C8102E]" : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                accessibility.highContrast ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-[#C8102E] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("accessibility.reducedMotion")}</p>
              <p className="text-xs text-[#737373] mt-0.5">{t("accessibility.reducedMotionDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={accessibility.reducedMotion}
            aria-label={t("accessibility.reducedMotion")}
            onClick={() => updateAccessibility({ reducedMotion: !accessibility.reducedMotion })}
            className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
              accessibility.reducedMotion ? "bg-[#C8102E]" : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                accessibility.reducedMotion ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MessageSquareText className="w-5 h-5 text-[#C8102E] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("accessibility.simpleLanguage")}</p>
              <p className="text-xs text-[#737373] mt-0.5">{t("accessibility.simpleLanguageDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={accessibility.simpleLanguage}
            aria-label={t("accessibility.simpleLanguage")}
            onClick={() => updateAccessibility({ simpleLanguage: !accessibility.simpleLanguage })}
            className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
              accessibility.simpleLanguage ? "bg-[#C8102E]" : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                accessibility.simpleLanguage ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/"
          className="px-5 py-3 rounded-2xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#8B1028]"
        >
          {t("point.backToMap")}
        </Link>
        <Link
          to="/emergency"
          className="px-5 py-3 rounded-2xl bg-white border border-[#C8102E] text-[#C8102E] text-sm font-bold hover:bg-[#FFF1F2]"
        >
          {t("nav.emergency")}
        </Link>
      </div>
    </div>
  );
}
