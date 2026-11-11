import type {
  AccessPoint,
  AccessPointFilter,
  Coordinates,
  OperationalStatus,
  SortMode,
} from "../types/healthpoint";
import { haversineDistanceMeters } from "./geo";

export const DEFAULT_FILTER: AccessPointFilter = {
  search: "",
  nearestOnly: false,
  operationalOnly: false,
  open247Only: false,
  wheelchairOnly: false,
  equipment: [],
};

const STATUS_PRIORITY: Record<OperationalStatus, number> = {
  operational: 0,
  limited: 1,
  unknown: 2,
  unavailable: 3,
};

export function filterAccessPoints(
  points: AccessPoint[],
  filter: AccessPointFilter,
  userLocation?: Coordinates | null
): AccessPoint[] {
  const query = filter.search.trim().toLowerCase();

  let results = points.filter((point) => {
    if (filter.operationalOnly && point.operationalStatus !== "operational") {
      return false;
    }
    if (filter.open247Only && !point.open247) {
      return false;
    }
    if (filter.wheelchairOnly && !point.wheelchairAccessible) {
      return false;
    }
    if (filter.equipment.length > 0) {
      const hasAll = filter.equipment.every((eq) => point.equipment.includes(eq));
      if (!hasAll) return false;
    }
    if (query.length > 0) {
      const haystack = [
        point.name,
        point.address,
        point.neighborhood,
        point.description,
        ...point.equipment,
        point.wheelchairAccessible ? "wheelchair accessible əlil pandus коляска" : "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  if (filter.nearestOnly && userLocation) {
    results = [...results]
      .sort(
        (a, b) =>
          haversineDistanceMeters(userLocation, { lat: a.latitude, lng: a.longitude }) -
          haversineDistanceMeters(userLocation, { lat: b.latitude, lng: b.longitude })
      )
      .slice(0, 3);
  }

  return results;
}

export function sortAccessPoints(
  points: AccessPoint[],
  origin: Coordinates,
  sortBy: SortMode
): AccessPoint[] {
  return [...points].sort((a, b) => {
    const distA = haversineDistanceMeters(origin, { lat: a.latitude, lng: a.longitude });
    const distB = haversineDistanceMeters(origin, { lat: b.latitude, lng: b.longitude });

    if (sortBy === "availability") {
      const pDiff = STATUS_PRIORITY[a.operationalStatus] - STATUS_PRIORITY[b.operationalStatus];
      if (pDiff !== 0) return pDiff;
      return distA - distB;
    }

    if (sortBy === "equipment") {
      const eDiff = b.equipment.length - a.equipment.length;
      if (eDiff !== 0) return eDiff;
      return distA - distB;
    }

    return distA - distB;
  });
}

export function countActiveFilters(filter: AccessPointFilter): number {
  let count = 0;
  if (filter.nearestOnly) count += 1;
  if (filter.operationalOnly) count += 1;
  if (filter.open247Only) count += 1;
  if (filter.wheelchairOnly) count += 1;
  count += filter.equipment.length;
  return count;
}
