import React, { useState } from "react";
import { AlertCircle, LogIn, ShieldCheck, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HealthPointIcon } from "../components/BrandLogo";
import { useHealthPoint } from "../context/HealthPointContext";
import { isSupabaseConfigured } from "../lib/supabase";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithEmail, signUpWithEmail, signInDemo, signOut } = useHealthPoint();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const liveDb = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError(t("auth.validationEmail"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.validationPassword"));
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, fullName.trim() || "OpenCarePoint İstifadəçisi");
      }
      navigate("/profile");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-2">
          <HealthPointIcon className="w-12 h-12" />
          <h1 className="text-2xl font-extrabold text-[#171717]">{t("auth.title")}</h1>
          <p className="text-xs text-[#737373]">{t("auth.subtitle")}</p>
        </div>

        {user ? (
          <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-4 space-y-3 text-center">
            <p className="text-xs text-[#737373]">{t("profile.signedInAs")}</p>
            <p className="text-sm font-bold text-[#171717]">
              {user.fullName || user.email || user.id}
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="w-full py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#8B1028]"
                >
                  {t("nav.admin")}
                </button>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                className="w-full py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#171717] hover:bg-white"
              >
                {t("auth.signOut")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F5F5F5]">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  mode === "signin" ? "bg-white text-[#C8102E] shadow-soft" : "text-[#737373]"
                }`}
              >
                {t("auth.signIn")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  mode === "signup" ? "bg-white text-[#C8102E] shadow-soft" : "text-[#737373]"
                }`}
              >
                {t("auth.signUp")}
              </button>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] px-3.5 py-2.5 text-xs text-[#8B1028]"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C8102E]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label htmlFor="auth-fullname" className="block text-xs font-bold text-[#171717] mb-1">
                    {t("profile.fullName")}
                  </label>
                  <input
                    id="auth-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-[#171717] mb-1">
                  {t("auth.email")}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-bold text-[#171717] mb-1">
                  {t("auth.password")}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#8B1028] disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
              </button>
            </form>

            {!liveDb && (
              <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#737373] text-center">
                  {t("app.demoModeLabel")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    signInDemo(false);
                    navigate("/profile");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-bold text-[#171717] hover:border-[#C8102E]"
                >
                  <UserCheck className="w-4 h-4 text-[#C8102E]" />
                  {t("auth.demoUserBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signInDemo(true);
                    navigate("/admin");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#C8102E] bg-[#FFF1F2] text-xs font-bold text-[#C8102E] hover:bg-[#FCE8EC]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t("auth.demoAdminBtn")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
