import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useHealthPoint } from "../context/HealthPointContext";
import { localizeAccessPoint, localizeMaintenanceReport } from "../lib/localizePoint";
import {
  fetchAccessPointById,
  fetchAccessPoints,
  fetchEmergencyContacts,
  fetchMaintenanceReports,
  fetchPartnerInquiries,
  fetchSavedPointIds,
  fetchVitalReadings,
  recordStationActivation,
  saveVitalReading,
  toggleSavedPointId,
} from "../services/healthpointStore";
import type { VitalReadingRecord } from "../types/healthpoint";

export function useAccessPointsQuery() {
  return useQuery({
    queryKey: ["accessPoints"],
    queryFn: fetchAccessPoints,
    staleTime: 30_000,
  });
}

export function useLocalizedAccessPointsQuery() {
  const { i18n } = useTranslation();
  const query = useAccessPointsQuery();
  const localized = useMemo(
    () => (query.data ?? []).map((p) => localizeAccessPoint(p, i18n.language)),
    [query.data, i18n.language]
  );
  return { ...query, data: localized };
}

export function useAccessPointQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["accessPoint", id],
    queryFn: () => (id ? fetchAccessPointById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useLocalizedAccessPointQuery(id: string | undefined) {
  const { i18n } = useTranslation();
  const query = useAccessPointQuery(id);
  const localized = useMemo(
    () => (query.data ? localizeAccessPoint(query.data, i18n.language) : query.data),
    [query.data, i18n.language]
  );
  return { ...query, data: localized };
}

export function useSavedIdsQuery() {
  const { user } = useHealthPoint();
  const uid = user && !user.isDemoAuth ? user.id : null;

  return useQuery({
    queryKey: ["savedIds", uid ?? "anon"],
    queryFn: () => fetchSavedPointIds(uid),
  });
}

export function useToggleSaveMutation() {
  const { user } = useHealthPoint();
  const queryClient = useQueryClient();
  const uid = user && !user.isDemoAuth ? user.id : null;

  return useMutation({
    mutationFn: (pointId: string) => toggleSavedPointId(pointId, uid),
    onSuccess: (nextIds) => {
      queryClient.setQueryData(["savedIds", uid ?? "anon"], nextIds);
    },
  });
}

export function useActivateStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pointId: string) => recordStationActivation(pointId),
    onSuccess: (_data, pointId) => {
      void queryClient.invalidateQueries({ queryKey: ["accessPoints"] });
      void queryClient.invalidateQueries({ queryKey: ["accessPoint", pointId] });
    },
  });
}

export function useReportsQuery() {
  return useQuery({
    queryKey: ["maintenanceReports"],
    queryFn: fetchMaintenanceReports,
  });
}

export function useLocalizedReportsQuery() {
  const { i18n } = useTranslation();
  const query = useReportsQuery();
  const localized = useMemo(
    () => (query.data ?? []).map((r) => localizeMaintenanceReport(r, i18n.language)),
    [query.data, i18n.language]
  );
  return { ...query, data: localized };
}

export function useVitalReadingsQuery() {
  return useQuery({
    queryKey: ["vitalReadings"],
    queryFn: fetchVitalReadings,
  });
}

export function useSaveVitalReadingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: VitalReadingRecord) => saveVitalReading(record),
    onSuccess: (next) => {
      queryClient.setQueryData(["vitalReadings"], next);
    },
  });
}

export function usePartnerInquiriesQuery() {
  return useQuery({
    queryKey: ["partnerInquiries"],
    queryFn: fetchPartnerInquiries,
  });
}

export function useEmergencyContactsQuery() {
  const { user } = useHealthPoint();
  const uid = user && !user.isDemoAuth ? user.id : null;

  return useQuery({
    queryKey: ["emergencyContacts", uid ?? "anon"],
    queryFn: () => fetchEmergencyContacts(uid),
  });
}
