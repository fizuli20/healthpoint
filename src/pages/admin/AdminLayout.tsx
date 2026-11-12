import { Activity, BarChart3, ClipboardList, Layers, Lock, MapPin, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useHealthPoint } from "../../context/HealthPointContext";
import { clearDemoEvents } from "../../services/demoEventStore";

const ADMIN_TABS = [
  { to: "/admin", end: true, icon: Activity, labelKey: "admin.overview", labelDefault: "İcmal & Canlı Telemetriya" },
  { to: "/admin/points", end: false, icon: MapPin, labelKey: "admin.points", labelDefault: "Məntəqələr" },
  { to: "/admin/reports", end: false, icon: ClipboardList, labelKey: "admin.reports", labelDefault: "Təmir & Biletlər" },
  { to: "/admin/analytics", end: false, icon: BarChart3, labelKey: "admin.analytics", labelDefault: "İnfrastruktur Analitikası" },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, authLoading, signInDemo } = useHealthPoint();

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-[#737373]">
        {t("admin.checkingAuth", "İcazə yoxlanılır...")}
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-[#E8E3DE] shadow-card p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-[#C8102E] flex items-center justify-center shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-[#171717]">{t("admin.title")}</h1>
            <p className="text-sm text-[#737373]">{t("auth.adminRequired")}</p>
          </div>

          {/* Explicit Hackathon Demo Access (Safe isolated demo operator) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Münsiflər & Hakaton Girişi
            </span>
            <p className="text-xs text-amber-800">
              Münsiflər heyəti üçün ayrılmış təhlükəsiz nümayiş sessiyası ilə dərhal idarəetmə
              panelini yoxlaya bilərsiniz.
            </p>
            <button
              type="button"
              onClick={() => signInDemo(true)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition"
            >
              Demo Dispetçer Kimi Daxil Ol →
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028]"
            >
              {t("auth.signIn")}
            </Link>
            <Link
              to="/"
              className="w-full py-2 rounded-xl text-xs font-bold text-[#61666D] hover:text-[#171717]"
            >
              {t("point.backToMap", "Xəritəyə qayıt")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      {/* City Command Header */}
      <div className="bg-white rounded-3xl border border-[#E8E3DE] shadow-soft p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#171717]">
                  {t("admin.title")}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  OpenCare City
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  Demo Rejimi
                </span>
              </div>
              <p className="text-xs text-[#61666D]">
                Bələdiyyə & 103 Şəhər Şəbəkə İdarəetmə Paneli • {user.fullName || "Demo Dispetçer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearDemoEvents();
                window.location.reload();
              }}
              title="Hadisə şinini sıfırla"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#171717] transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Hadisələri Sıfırla</span>
            </button>

            <Link
              to="/kiosk"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8102E] hover:bg-[#8B1028] text-white text-xs font-bold shadow-sm transition"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Yeni Pəncərədə Köşk Aç</span>
            </Link>
          </div>
        </div>

        {/* Admin Section Tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Admin bölmələri">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                    isActive
                      ? "bg-[#C8102E] text-white shadow-brand"
                      : "bg-[#FAFAFA] text-[#737373] border border-[#E5E7EB] hover:text-[#171717]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {t(tab.labelKey, tab.labelDefault)}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
