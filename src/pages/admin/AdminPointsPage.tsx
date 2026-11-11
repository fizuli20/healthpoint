import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../components/StatusBadge";
import { useLocalizedAccessPointsQuery } from "../../hooks/useHealthPointData";
import {
  createAccessPoint,
  deleteAccessPoint,
  updateAccessPoint,
} from "../../services/healthpointStore";
import {
  ALL_EQUIPMENT,
  type AccessPoint,
  type EquipmentItem,
  type OperationalStatus,
} from "../../types/healthpoint";

interface PointFormState {
  name: string;
  neighborhood: string;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  openingHours: string;
  operationalStatus: OperationalStatus;
  equipment: EquipmentItem[];
  wheelchairAccessible: boolean;
  audioGuided: boolean;
  open247: boolean;
  imageUrl: string;
  isDemo: boolean;
}

function emptyFormState(): PointFormState {
  return {
    name: "",
    neighborhood: "Baku",
    address: "",
    description: "",
    latitude: "40.3775",
    longitude: "49.8535",
    openingHours: "24/7",
    operationalStatus: "operational",
    equipment: ["Blood pressure monitor", "Heart rate monitor", "First-aid kit"],
    wheelchairAccessible: true,
    audioGuided: true,
    open247: true,
    imageUrl: "",
    isDemo: true,
  };
}

function toFormState(point: AccessPoint): PointFormState {
  return {
    name: point.name,
    neighborhood: point.neighborhood,
    address: point.address,
    description: point.description,
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    openingHours: point.openingHours,
    operationalStatus: point.operationalStatus,
    equipment: point.equipment,
    wheelchairAccessible: point.wheelchairAccessible,
    audioGuided: point.audioGuided,
    open247: point.open247,
    imageUrl: point.imageUrl ?? "",
    isDemo: point.isDemo,
  };
}

export function AdminPointsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: points = [] } = useLocalizedAccessPointsQuery();

  const [editingPoint, setEditingPoint] = useState<AccessPoint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PointFormState>(emptyFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccessPoint | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const lat = Number(form.latitude);
      const lng = Number(form.longitude);
      if (form.name.trim().length < 3 || form.address.trim().length < 3) {
        throw new Error(t("admin.errors.nameAddress"));
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error(t("admin.errors.coords"));
      }
      const payload = {
        name: form.name.trim(),
        neighborhood: form.neighborhood.trim() || "Baku",
        address: form.address.trim(),
        description: form.description.trim() || "İctimai OpenCarePoint sağlamlıq məntəqəsi.",
        latitude: lat,
        longitude: lng,
        openingHours: form.openingHours.trim() || "24/7",
        operationalStatus: form.operationalStatus,
        equipment: form.equipment,
        wheelchairAccessible: form.wheelchairAccessible,
        audioGuided: form.audioGuided,
        open247: form.open247,
        imageUrl: form.imageUrl.trim() || null,
        lastVerifiedAt: new Date().toISOString(),
        isDemo: form.isDemo,
      };
      if (editingPoint) {
        return updateAccessPoint(editingPoint.id, payload);
      }
      return createAccessPoint(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accessPoints"] });
      if (editingPoint) {
        void queryClient.invalidateQueries({ queryKey: ["accessPoint", editingPoint.id] });
      }
      setModalOpen(false);
      setEditingPoint(null);
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccessPoint(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accessPoints"] });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditingPoint(null);
    setForm(emptyFormState());
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (pt: AccessPoint) => {
    setEditingPoint(pt);
    setForm(toFormState(pt));
    setFormError(null);
    setModalOpen(true);
  };

  const toggleEquipment = (item: EquipmentItem) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-[#171717]">
          {t("admin.points")} ({points.length})
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs sm:text-sm font-bold hover:bg-[#8B1028]"
        >
          <Plus className="w-4 h-4" />
          {t("admin.addPoint")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {points.map((pt) => (
          <div
            key={pt.id}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">{pt.name}</h3>
                <p className="text-xs text-[#737373]">
                  {pt.neighborhood} • {pt.address}
                </p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                </p>
              </div>
              <StatusBadge status={pt.operationalStatus} />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB]">
              <span className="text-xs text-[#737373]">
                {t("admin.equipmentCount", { count: pt.equipment.length })} • {pt.openingHours}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(pt)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t("admin.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(pt)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#FCE8EC] bg-[#FFF1F2] text-xs font-semibold text-[#C8102E] hover:bg-[#FCE8EC]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("admin.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card max-w-lg w-full p-5 sm:p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#171717]">
                {editingPoint ? t("admin.edit") : t("admin.addPoint")}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-[#737373] hover:bg-[#F5F5F5]"
                aria-label={t("point.closeCard")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs font-semibold text-[#C8102E]" role="alert">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.name")}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.neighborhood")}
                </label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.status")}
                </label>
                <select
                  value={form.operationalStatus}
                  onChange={(e) =>
                    setForm({ ...form, operationalStatus: e.target.value as OperationalStatus })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm bg-white"
                >
                  <option value="operational">{t("status.operational")}</option>
                  <option value="limited">{t("status.limited")}</option>
                  <option value="unavailable">{t("status.unavailable")}</option>
                  <option value="unknown">{t("status.unknown")}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.address")}
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.latitude")}
                </label>
                <input
                  type="text"
                  required
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.longitude")}
                </label>
                <input
                  type="text"
                  required
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.openingHours")}
                </label>
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.imageUrl")}
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  {t("admin.fields.description")}
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <span className="block text-xs font-bold text-[#171717]">
                  {t("admin.fields.equipment")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_EQUIPMENT.map((item) => {
                    const checked = form.equipment.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEquipment(item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          checked
                            ? "bg-[#C8102E] text-white border-[#C8102E]"
                            : "bg-white text-[#737373] border-[#E5E7EB]"
                        }`}
                      >
                        {t(`equipment.${item}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1 text-xs font-semibold text-[#171717]">
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.wheelchairAccessible}
                    onChange={(e) => setForm({ ...form, wheelchairAccessible: e.target.checked })}
                  />
                  {t("admin.fields.wheelchair")}
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.audioGuided}
                    onChange={(e) => setForm({ ...form, audioGuided: e.target.checked })}
                  />
                  {t("admin.fields.audio")}
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.open247}
                    onChange={(e) => setForm({ ...form, open247: e.target.checked })}
                  />
                  {t("admin.fields.open247")}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#737373]"
              >
                {t("report.cancel")}
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028] disabled:opacity-50"
              >
                {t("admin.savePoint")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#171717]">
              {t("admin.confirmDelete", { name: deleteTarget.name })}
            </h3>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#737373]"
              >
                {t("report.cancel")}
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                className="px-4 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028]"
              >
                {t("admin.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
