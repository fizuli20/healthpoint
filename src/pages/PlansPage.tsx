import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Building2,
  Calculator,
  CheckCircle2,
  Cpu,
  CreditCard,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePartnerInquiriesQuery } from "../hooks/useHealthPointData";
import { submitPartnerInquiry } from "../services/healthpointStore";
import type { PartnerInquiry } from "../types/healthpoint";

export function PlansPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: inquiries = [] } = usePartnerInquiriesQuery();

  const [kiosks, setKiosks] = useState(10);
  const [dailyChecks, setDailyChecks] = useState(80);

  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState<PartnerInquiry["sector"]>("b2g_municipality");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedCount, setSubmittedCount] = useState<number | null>(null);

  const monthlyScreenings = kiosks * dailyChecks * 30;
  const estB2gFee = kiosks * 290;
  const estB2cRevenue = Math.round(monthlyScreenings * 0.2 * 1.2);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orgName.trim().length < 2 || !contactEmail.includes("@")) {
      setFormError(t("auth.validationEmail"));
      return;
    }
    setFormError(null);
    await submitPartnerInquiry({
      organizationName: orgName.trim(),
      sector,
      contactEmail: contactEmail.trim(),
      kioskCount: kiosks,
      notes: notes.trim(),
    });
    await queryClient.invalidateQueries({ queryKey: ["partnerInquiries"] });
    setSubmittedCount(inquiries.length + 1);
    setOrgName("");
    setContactEmail("");
    setNotes("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FCE8EC] text-[#8B1028] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
          {t("plans.demoBadge")}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
          {t("plans.title")}
        </h1>
        <p className="text-sm sm:text-base text-[#737373] max-w-3xl">
          {t("plans.subtitle")}
        </p>
      </div>

      {/* B2C Pay-Per-Use Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#171717] flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#C8102E]" />
          {t("plans.b2cHeading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlanCard
            badge={t("plans.b2cItems.freeNote")}
            title={t("plans.b2cItems.freeName")}
            price={t("plans.b2cItems.freePrice")}
            description={t("plans.b2cItems.freeDesc")}
            icon={<Activity className="w-5 h-5" />}
            highlighted={false}
          />
          <PlanCard
            badge={t("plans.b2cItems.fullNote")}
            title={t("plans.b2cItems.fullName")}
            price={t("plans.b2cItems.fullPrice")}
            description={t("plans.b2cItems.fullDesc")}
            icon={<ShieldCheck className="w-5 h-5" />}
            highlighted
          />
          <PlanCard
            badge={t("plans.b2cItems.teleNote")}
            title={t("plans.b2cItems.teleName")}
            price={t("plans.b2cItems.telePrice")}
            description={t("plans.b2cItems.teleDesc")}
            icon={<Stethoscope className="w-5 h-5" />}
            highlighted={false}
          />
        </div>
      </section>

      {/* B2G / B2B & Cost-Efficient Edge AI */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#171717] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#C8102E]" />
          {t("plans.b2gHeading")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1F2] text-[#C8102E] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#171717]">
              {t("plans.b2gCards.pilotName")}
            </h3>
            <p className="text-sm font-extrabold text-[#C8102E]">
              {t("plans.b2gCards.pilotPrice")}
            </p>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              {t("plans.b2gCards.pilotDesc")}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1F2] text-[#C8102E] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#171717]">
              {t("plans.b2gCards.mallName")}
            </h3>
            <p className="text-sm font-extrabold text-[#C8102E]">
              {t("plans.b2gCards.mallPrice")}
            </p>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              {t("plans.b2gCards.mallDesc")}
            </p>
          </div>

          <div className="bg-[#171717] text-white rounded-3xl p-5 space-y-2.5 shadow-card">
            <div className="w-10 h-10 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold">{t("plans.b2gCards.aiName")}</h3>
            <p className="text-sm font-extrabold text-[#FCE8EC]">
              {t("plans.b2gCards.aiPrice")}
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {t("plans.b2gCards.aiDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Calculator + Pilot Inquiry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#171717] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#C8102E]" />
              {t("plans.calcTitle")}
            </h2>
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#171717]">{t("plans.calcKiosks")}</span>
                <span className="text-[#C8102E]">{kiosks}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={kiosks}
                onChange={(e) => setKiosks(Number(e.target.value))}
                className="w-full accent-[#C8102E]"
              />
            </label>

            <label className="block space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#171717]">{t("plans.calcDaily")}</span>
                <span className="text-[#C8102E]">{dailyChecks}</span>
              </div>
              <input
                type="range"
                min={20}
                max={400}
                step={10}
                value={dailyChecks}
                onChange={(e) => setDailyChecks(Number(e.target.value))}
                className="w-full accent-[#C8102E]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3.5">
              <p className="text-[11px] font-semibold text-[#737373]">
                {t("plans.calcMonthlyScreenings")}
              </p>
              <p className="text-lg font-extrabold text-[#171717] mt-1">
                {monthlyScreenings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] p-3.5">
              <p className="text-[11px] font-semibold text-[#8B1028]">
                {t("plans.calcB2gMonthly")}
              </p>
              <p className="text-lg font-extrabold text-[#C8102E] mt-1">
                {estB2gFee.toLocaleString()} AZN
              </p>
            </div>
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3.5">
              <p className="text-[11px] font-semibold text-[#737373]">
                {t("plans.calcB2cShare")}
              </p>
              <p className="text-lg font-extrabold text-emerald-700 mt-1">
                +{estB2cRevenue.toLocaleString()} AZN
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <p className="text-xs text-[#737373]">{t("plans.calcNote")}</p>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028]"
            >
              {t("nav.map")} →
            </Link>
          </div>
        </section>

        {/* B2G / Venue Pilot Inquiry Form */}
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-[#171717] flex items-center gap-2">
            <Send className="w-5 h-5 text-[#C8102E]" />
            {t("plans.inquiryTitle")}
          </h2>

          <form onSubmit={(e) => void handleInquirySubmit(e)} className="space-y-3">
            <div>
              <label htmlFor="partner-org" className="block text-xs font-bold text-[#171717] mb-1">
                {t("plans.orgLabel")}
              </label>
              <input
                id="partner-org"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={t("plans.orgPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="partner-sector" className="block text-xs font-bold text-[#171717] mb-1">
                  {t("plans.sectorLabel")}
                </label>
                <select
                  id="partner-sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value as PartnerInquiry["sector"])}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:border-[#C8102E]"
                >
                  <option value="b2g_municipality">{t("plans.sectorB2g")}</option>
                  <option value="b2b_mall_metro">{t("plans.sectorB2b")}</option>
                  <option value="clinic_partner">{t("plans.sectorClinic")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="partner-email" className="block text-xs font-bold text-[#171717] mb-1">
                  {t("plans.emailLabel")}
                </label>
                <input
                  id="partner-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="pilot@organization.az"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="partner-notes" className="block text-xs font-bold text-[#171717] mb-1">
                {t("plans.notesLabel")}
              </label>
              <textarea
                id="partner-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            {formError && (
              <p className="text-xs font-semibold text-[#C8102E]" role="alert">
                {formError}
              </p>
            )}

            {submittedCount !== null && (
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {t("plans.inquirySuccess", { count: submittedCount })}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#8B1028] shadow-brand transition"
            >
              {t("plans.submitInquiry")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function PlanCard({
  badge,
  title,
  price,
  description,
  icon,
  highlighted,
}: {
  badge: string;
  title: string;
  price: string;
  description: string;
  icon: React.ReactNode;
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-5 space-y-3 border transition ${
        highlighted
          ? "bg-[#FFF1F2] border-[#C8102E] shadow-card"
          : "bg-white border-[#E5E7EB] shadow-soft"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-2xl ${
            highlighted ? "bg-[#C8102E] text-white" : "bg-[#FFF1F2] text-[#C8102E]"
          }`}
        >
          {icon}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#737373]">
          {badge}
        </span>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-[#171717]">{title}</h3>
        <p className="text-xl font-extrabold text-[#C8102E] mt-1">{price}</p>
      </div>
      <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">{description}</p>
    </div>
  );
}
