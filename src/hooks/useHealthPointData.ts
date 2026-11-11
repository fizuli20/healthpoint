import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHealthPoint } from "../context/HealthPointContext";
import {
  fetchAccessPointById,
  fetchAccessPoints,
  fetchEmergencyContacts,
  fetchMaintenanceReports,
  fetchSavedPointIds,
  toggleSavedPointId,
} from "../services/healthpointStore";

export function useAccessPointsQuery() {
  return useQuery({
    queryKey: ["accessPoints"],
    queryFn: fetchAccessPoints,
    staleTime: 30_000,
  });
}

export function useAccessPointQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["accessPoint", id],
    queryFn: () => (id ? fetchAccessPointById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
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

export function useReportsQuery() {
  return useQuery({
    queryKey: ["maintenanceReports"],
    queryFn: fetchMaintenanceReports,
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
