import React from "react";
import {
  Accessibility,
  Bookmark,
  Bot,
  List,
  Map as MapIcon,
  PhoneCall,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useHealthPoint } from "../context/HealthPointContext";
import { HealthPointWordmark } from "./BrandLogo";
import type { LanguageCode } from "../types/healthpoint";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { accessibility, language, setLanguage, user } = useHealthPoint();
  const location = useLocation();
  const isMapHome = location.pathname === "/";
  const isEmergency = location.pathname === "/emergency";

  const desktopNav = [
    { to: "/", label: t("nav.map"), icon: MapIcon },
    { to: "/nearby", label: t("nav.nearby"), icon: List },
    { to: "/assistant", label: t("nav.assistant"), icon: Bot },
    { to: "/saved", label: t("nav.saved"), icon: Bookmark },
    ...(accessibility.easyAccessMode
      ? []
      : [
          { to: "/accessibility", label: t("nav.accessibility"), icon: Accessibility },
          { to: "/settings", label: t("nav.settings"), icon: Settings },
        ]),
    ...(user?.isAdmin ? [{ to: "/admin", label: t("nav.admin"), icon: ShieldCheck }] : []),
  ];

  const mobileNav = accessibility.easyAccessMode
    ? [
        { to: "/", label: t("nav.map"), icon: MapIcon },
        { to: "/nearby", label: t("nav.nearby"), icon: List },
        { to: "/emergency", label: t("nav.emergency"), icon: PhoneCall, isSos: true },
        { to: "/accessibility", label: t("nav.accessibility"), icon: Accessibility },
      ]
    : [
        { to: "/", label: t("nav.map"), icon: MapIcon },
        { to: "/nearby", label: t("nav.nearby"), icon: List },
        { to: "/assistant", label: t("nav.assistant"), icon: Bot },
        { to: "/saved", label: t("nav.saved"), icon: Bookmark },
        { to: "/profile", label: t("nav.profile"), icon: User },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#171717]">
      {/* Desktop & Tablet Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C8102E] rounded-xl p-0.5 sm:p-1">
            <HealthPointWordmark compact />
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Əsas naviqasiya">
            {desktopNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#FFF1F2] text-[#C8102E]"
                        : "text-[#737373] hover:text-[#171717] hover:bg-[#FAFAFA]"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Compact Language Switcher */}
            <div
              className="inline-flex rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-0.5"
              role="group"
              aria-label={t("settings.language")}
            >
              {(["az", "en", "ru"] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  aria-pressed={language === code}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold uppercase transition ${
                    language === code
                      ? "bg-[#C8102E] text-white"
                      : "text-[#737373] hover:text-[#171717]"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <Link
              to={user ? "/profile" : "/login"}
              aria-label={user ? t("nav.profile") : t("nav.login")}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#171717] hover:border-[#C8102E] transition shrink-0"
            >
              <User className="w-4 h-4 text-[#C8102E]" />
              <span className="hidden sm:inline">{user ? user.fullName || t("nav.profile") : t("nav.login")}</span>
            </Link>

            {!isEmergency && (
              <Link
                to="/emergency"
                role="button"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#C8102E] text-white text-xs sm:text-sm font-bold shadow-brand hover:bg-[#8B1028] focus:outline-none focus:ring-2 focus:ring-[#E11D48] transition shrink-0"
              >
                <PhoneCall className="w-4 h-4" />
                <span>SOS</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className={`flex-1 ${isMapHome ? "relative" : "pb-24 md:pb-10"}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar — safely clear of floating SOS */}
      <nav
        aria-label="Mobil naviqasiya"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] safe-pb"
      >
        <div className="flex items-center justify-around px-1 pt-1.5">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isSos = "isSos" in item && item.isSos;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition ${
                    isSos
                      ? "text-white bg-[#C8102E] px-4"
                      : isActive
                        ? "text-[#C8102E]"
                        : "text-[#737373]"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
