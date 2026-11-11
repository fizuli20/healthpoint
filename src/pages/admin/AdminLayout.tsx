import { Activity, BarChart3, ClipboardList, Lock, MapPin, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useHealthPoint } from "../../context/HealthPointContext";

const ADMIN_TABS = [
  { to: "/admin", end: true, icon: Activity, labelKey: "admin.overview" },
  { to: "/admin/points", end: false, icon: MapPin, labelKey: "admin.points" },
  { to: "/admin/reports", end: false, icon: ClipboardList, labelKey: "admin.reports" },
  { to: "/admin/analytics", end: false, icon: BarChart3, labelKey: "admin.analytics" },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, authLoading } = useHealthPoint();

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-[#737373]">
        Checking administrator permissions...
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF1F2] text-[#C8102E] flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[#171717]">{t("admin.title")}</h1>
          <p className="text-sm text-[#737373]">{t("auth.adminRequired")}</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/login"
              className="w-full py-3 rounded-2xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#8B1028]"
            >
              {t("auth.signIn")}
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-2xl border border-[#E5E7EB] text-xs font-semibold text-[#737373] hover:text-[#171717]"
            >
              {t("point.backToMap")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#171717]">{t("admin.title")}</h1>
              <p className="text-xs text-[#737373]">
                {user.fullName || user.email || "Administrator"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Admin sections">
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
                {t(tab.labelKey)}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
