import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bookmark,
  CheckCircle2,
  HeartPulse,
  Lock,
  LogIn,
  LogOut,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  useEmergencyContactsQuery,
  useLocalizedAccessPointsQuery,
  useSavedIdsQuery,
  useVitalReadingsQuery,
} from "../hooks/useHealthPointData";
import {
  addEmergencyContact,
  clearVitalReadings,
  deleteEmergencyContact,
  loadMedicalCard,
  saveMedicalCard,
} from "../services/healthpointStore";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, signOut, updateUserProfile } = useHealthPoint();
  const queryClient = useQueryClient();
  const { data: contacts = [] } = useEmergencyContactsQuery();
  const { data: savedIds = [] } = useSavedIdsQuery();
  const { data: points = [] } = useLocalizedAccessPointsQuery();
  const { data: vitalReadings = [] } = useVitalReadingsQuery();

  const uid = user && !user.isDemoAuth ? user.id : null;

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [submittingContact, setSubmittingContact] = useState(false);

  const [medicalCard, setMedicalCard] = useState(() => loadMedicalCard());
  const [medicalSaved, setMedicalSaved] = useState(false);

  const savedPoints = points.filter((p) => savedIds.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ fullName: fullName.trim() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = contactName.trim();
    const cleanPhone = contactPhone.trim();
    if (cleanName.length < 2) {
      setContactError(t("profile.validationName"));
      return;
    }
    if (!/^[+\d][\d\s-]{2,}$/.test(cleanPhone)) {
      setContactError(t("profile.validationPhone"));
      return;
    }
    setContactError(null);
    setSubmittingContact(true);
    try {
      await addEmergencyContact({ contactName: cleanName, phoneNumber: cleanPhone }, uid);
      setContactName("");
      setContactPhone("");
      await queryClient.invalidateQueries({ queryKey: ["emergencyContacts", uid ?? "anon"] });
    } catch (err) {
      setContactError((err as Error).message);
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    await deleteEmergencyContact(id, uid);
    await queryClient.invalidateQueries({ queryKey: ["emergencyContacts", uid ?? "anon"] });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <h1 className="text-2xl font-extrabold text-[#171717] flex items-center gap-2">
        <User className="w-6 h-6 text-[#C8102E]" />
        {t("profile.title")}
      </h1>

      {/* Account Summary */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-4">
        {user ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
                {t("profile.signedInAs")}
              </p>
              <p className="text-base font-bold text-[#171717]">
                {user.fullName || user.email || user.id}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {user.email && <span className="text-xs text-[#737373]">{user.email}</span>}
                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#C8102E] border border-[#FCE8EC]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-xl bg-[#FFF1F2] text-[#C8102E] border border-[#FCE8EC] text-xs font-bold hover:bg-[#FCE8EC]"
                >
                  {t("nav.admin")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5]"
              >
                <LogOut className="w-4 h-4" />
                {t("auth.signOut")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-[#737373]">{t("profile.guestBanner")}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028]"
            >
              <LogIn className="w-4 h-4" />
              {t("auth.signIn")}
            </Link>
          </div>
        )}

        <form onSubmit={(e) => void handleSaveProfile(e)} className="pt-2 border-t border-[#E5E7EB] space-y-3">
          <div>
            <label htmlFor="profile-fullname" className="block text-xs font-bold text-[#171717] mb-1.5">
              {t("profile.fullName")}
            </label>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                id="profile-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("profile.fullName")}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm text-[#171717] focus:outline-none focus:border-[#C8102E]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028] focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
              >
                {t("profile.saveProfile")}
              </button>
            </div>
          </div>
          {profileSaved && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              {t("profile.profileSaved")}
            </p>
          )}
        </form>
      </section>

      {/* Emergency Medical ID (ICE — Local Only) */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#C8102E]" />
            {t("profile.medicalCardTitle")}
          </h2>
          <p className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
            <Lock className="w-3.5 h-3.5 text-[#C8102E]" />
            {t("profile.medicalCardDesc")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMedicalCard({
              bloodType: medicalCard.bloodType.trim(),
              allergies: medicalCard.allergies.trim(),
              conditions: medicalCard.conditions.trim(),
              medications: medicalCard.medications.trim(),
            });
            setMedicalSaved(true);
            setTimeout(() => setMedicalSaved(false), 3000);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ice-blood" className="block text-xs font-bold text-[#171717] mb-1">
                {t("profile.bloodType")}
              </label>
              <select
                id="ice-blood"
                value={medicalCard.bloodType}
                onChange={(e) => setMedicalCard((c) => ({ ...c, bloodType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:border-[#C8102E]"
              >
                <option value="">—</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ice-allergies" className="block text-xs font-bold text-[#171717] mb-1">
                {t("profile.allergies")}
              </label>
              <input
                id="ice-allergies"
                type="text"
                value={medicalCard.allergies}
                onChange={(e) => setMedicalCard((c) => ({ ...c, allergies: e.target.value }))}
                placeholder="Penisilin / Yoxdur"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>
            <div>
              <label htmlFor="ice-conditions" className="block text-xs font-bold text-[#171717] mb-1">
                {t("profile.conditions")}
              </label>
              <input
                id="ice-conditions"
                type="text"
                value={medicalCard.conditions}
                onChange={(e) => setMedicalCard((c) => ({ ...c, conditions: e.target.value }))}
                placeholder="Hipertoniya / Astma"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>
            <div>
              <label htmlFor="ice-meds" className="block text-xs font-bold text-[#171717] mb-1">
                {t("profile.medications")}
              </label>
              <input
                id="ice-meds"
                type="text"
                value={medicalCard.medications}
                onChange={(e) => setMedicalCard((c) => ({ ...c, medications: e.target.value }))}
                placeholder="İnhalyator"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {medicalSaved ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {t("profile.medicalCardSaved")}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028]"
            >
              {t("profile.saveMedicalCard")}
            </button>
          </div>
        </form>
      </section>

      {/* Private Emergency Contacts */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#171717]">{t("profile.contactsTitle")}</h2>
          <p className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
            <Lock className="w-3.5 h-3.5 text-[#C8102E]" />
            {t("profile.contactsPrivacy")}
          </p>
        </div>

        <form onSubmit={(e) => void handleAddContact(e)} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder={t("profile.contactName")}
            aria-label={t("profile.contactName")}
            className="px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
          />
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder={t("profile.contactPhone")}
            aria-label={t("profile.contactPhone")}
            className="px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#C8102E]"
          />
          <button
            type="submit"
            disabled={submittingContact}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {t("profile.addContact")}
          </button>
        </form>

        {contactError && (
          <p className="text-xs text-[#C8102E] font-medium" role="alert">
            {contactError}
          </p>
        )}

        {contacts.length === 0 ? (
          <p className="text-sm text-[#737373]">{t("emergency.noContacts")}</p>
        ) : (
          <ul className="space-y-2">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]"
              >
                <div>
                  <p className="text-sm font-bold text-[#171717]">{c.contactName}</p>
                  <p className="text-xs text-[#737373]">{c.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${c.phoneNumber}`}
                    aria-label={`${t("emergency.callNow")}: ${c.contactName}`}
                    className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-[#C8102E] hover:bg-[#FFF1F2]"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleDeleteContact(c.id)}
                    aria-label={`Sil: ${c.contactName}`}
                    className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-[#737373] hover:text-[#C8102E]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Vitals & B2C Check-In History */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C8102E]" />
            {t("profile.vitalsTitle")} ({vitalReadings.length})
          </h2>
          <div className="flex items-center gap-3">
            <Link to="/plans" className="text-xs font-bold text-[#C8102E] hover:underline">
              {t("nav.plans")}
            </Link>
            {vitalReadings.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await clearVitalReadings();
                  await queryClient.invalidateQueries({ queryKey: ["vitalReadings"] });
                }}
                className="text-xs font-semibold text-[#737373] hover:text-[#C8102E]"
              >
                {t("profile.clearVitals")}
              </button>
            )}
          </div>
        </div>
        {vitalReadings.length === 0 ? (
          <p className="text-sm text-[#737373]">{t("profile.vitalsEmpty")}</p>
        ) : (
          <ul className="space-y-2.5">
            {vitalReadings.map((vr) => (
              <li
                key={vr.id}
                className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]"
              >
                <div>
                  <p className="text-xs font-extrabold text-[#C8102E]">
                    {vr.kioskCode} • {vr.accessPointName}
                  </p>
                  <p className="text-xs font-bold text-[#171717] mt-0.5">
                    {vr.heartRateBpm ?? "--"} bpm • SpO2 {vr.spo2Percent ?? "--"}%
                    {vr.bloodPressure ? ` • ${vr.bloodPressure}` : ""}
                  </p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    SQI {vr.signalQualityScore}% •{" "}
                    {vr.priceAzn === 0 ? "0 AZN" : `${vr.priceAzn.toFixed(2)} AZN (Demo)`} •{" "}
                    {new Date(vr.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saved summary */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#C8102E]" />
            {t("profile.savedTitle")} ({savedPoints.length})
          </h2>
          <Link to="/saved" className="text-xs font-bold text-[#C8102E] hover:underline">
            {t("point.details")}
          </Link>
        </div>
        {savedPoints.length === 0 ? (
          <p className="text-sm text-[#737373]">{t("profile.savedEmpty")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedPoints.map((pt) => (
              <Link
                key={pt.id}
                to={`/points/${pt.id}`}
                className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-semibold text-[#171717] hover:border-[#C8102E]"
              >
                {pt.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
