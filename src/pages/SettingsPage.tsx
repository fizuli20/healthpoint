import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Accessibility,
  Bell,
  CheckCircle2,
  Database,
  Globe,
  RotateCcw,
  Settings,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHealthPoint } from "../context/HealthPointContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { resetDemoData } from "../services/healthpointStore";
import type { LanguageCode } from "../types/healthpoint";

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "az", label: "Azerbaijani", native: "Azərbaycan" },
  { code: "en", label: "English", native: "English" },
  { code: "ru", label: "Russian", native: "Русский" },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const { language, setLanguage, user, updateUserProfile } = useHealthPoint();
  const queryClient = useQueryClient();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? false
  );
  const [shareLocationHistory, setShareLocationHistory] = useState(
    user?.shareLocationHistory ?? false
  );
  const [resetMessage, setResetMessage] = useState(false);

  const liveDb = isSupabaseConfigured();

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    void updateUserProfile({ notificationsEnabled: next });
  };

  const handleTogglePrivacy = () => {
    const next = !shareLocationHistory;
    setShareLocationHistory(next);
    void updateUserProfile({ shareLocationHistory: next });
  };

  const handleResetDemo = () => {
    resetDemoData();
    void queryClient.invalidateQueries({ queryKey: ["accessPoints"] });
    void queryClient.invalidateQueries({ queryKey: ["maintenanceReports"] });
    void queryClient.invalidateQueries({ queryKey: ["savedIds"] });
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 3500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <h1 className="text-2xl font-extrabold text-[#171717] flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#C8102E]" />
        {t("settings.title")}
      </h1>

      {/* Language selector */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#C8102E]" />
          {t("settings.language")}
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {LANGUAGES.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                aria-pressed={active}
                onClick={() => setLanguage(lang.code)}
                className={`py-3 px-3 rounded-2xl border text-center transition focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
                  active
                    ? "bg-[#C8102E] border-[#C8102E] text-white shadow-brand"
                    : "bg-white border-[#E5E7EB] text-[#171717] hover:bg-[#FAFAFA]"
                }`}
              >
                <span className="block text-sm font-bold">{lang.native}</span>
                <span className={`block text-[11px] ${active ? "text-white/80" : "text-[#737373]"}`}>
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Notifications & Privacy */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft divide-y divide-[#E5E7EB]">
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-[#C8102E] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("settings.notifications")}</p>
              <p className="text-xs text-[#737373] mt-0.5">{t("settings.notificationsDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={handleToggleNotifications}
            className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
              notificationsEnabled ? "bg-[#C8102E]" : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                notificationsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#C8102E] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("settings.privacy")}</p>
              <p className="text-xs text-[#737373] mt-0.5">{t("settings.privacyDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={shareLocationHistory}
            onClick={handleTogglePrivacy}
            className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
              shareLocationHistory ? "bg-[#C8102E]" : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                shareLocationHistory ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <Link
          to="/accessibility"
          className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#FAFAFA] transition rounded-b-3xl"
        >
          <div className="flex items-center gap-3">
            <Accessibility className="w-5 h-5 text-[#C8102E]" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("accessibility.title")}</p>
              <p className="text-xs text-[#737373]">{t("accessibility.subtitle")}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#C8102E]">Open →</span>
        </Link>
      </section>

      {/* Backend / Demo Status */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-[#C8102E] mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#171717]">{t("settings.backendStatus")}</p>
              <p className="text-xs font-semibold text-[#8B1028] mt-0.5">
                {liveDb ? t("app.liveModeLabel") : t("app.demoModeLabel")}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              liveDb
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-[#FFF1F2] text-[#8B1028] border border-[#FCE8EC]"
            }`}
          >
            {liveDb ? "Supabase Connected" : "Local Demo Store"}
          </span>
        </div>

        {!liveDb && (
          <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C8102E] text-[#C8102E] text-sm font-semibold hover:bg-[#FFF1F2]"
            >
              <RotateCcw className="w-4 h-4" />
              {t("settings.resetDemo")}
            </button>
            {resetMessage && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {t("settings.resetDone")}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
