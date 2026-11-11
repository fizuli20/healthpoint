import type { AccessPoint, Coordinates, RouteResult } from "../types/healthpoint";

const EARTH_RADIUS_METERS = 6_371_000;

export function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

export function formatDistance(meters: number, lang: string = "en"): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const unit = lang === "ru" ? "км" : "km";
  return `${(meters / 1000).toFixed(2)} ${unit}`;
}

export function estimateDurationSeconds(meters: number, mode: "walking" | "driving"): number {
  const speedMetersPerSec = mode === "walking" ? 1.35 : 8.5;
  return Math.max(60, Math.round(meters / speedMetersPerSec));
}

export function formatDurationMinutes(seconds: number, lang: string = "en"): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (lang === "az") return `${mins} dəq`;
  if (lang === "ru") return `${mins} мин`;
  return `${mins} min`;
}

export function findNearestSuitablePoint(
  points: AccessPoint[],
  origin: Coordinates,
  options?: { wheelchairOnly?: boolean; allowLimited?: boolean }
): { point: AccessPoint; distanceMeters: number } | null {
  const allowLimited = options?.allowLimited ?? true;
  const wheelchairOnly = options?.wheelchairOnly ?? false;

  const eligible = points.filter((point) => {
    if (wheelchairOnly && !point.wheelchairAccessible) return false;
    if (point.operationalStatus === "operational") return true;
    return allowLimited && point.operationalStatus === "limited";
  });

  if (eligible.length === 0) return null;

  const ranked = eligible
    .map((point) => ({
      point,
      distanceMeters: haversineDistanceMeters(origin, {
        lat: point.latitude,
        lng: point.longitude,
      }),
    }))
    .sort((a, b) => {
      if (a.point.operationalStatus !== b.point.operationalStatus) {
        if (a.point.operationalStatus === "operational") return -1;
        if (b.point.operationalStatus === "operational") return 1;
      }
      return a.distanceMeters - b.distanceMeters;
    });

  return ranked[0] ?? null;
}

export async function fetchRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: "walking" | "driving" = "walking"
): Promise<RouteResult> {
  const profile = mode === "walking" ? "foot" : "car";
  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    window.clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`OSRM error: ${response.status}`);
    }

    const payload = await response.json();
    const route = payload?.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      throw new Error("Invalid OSRM route geometry");
    }

    const latLngs: [number, number][] = coords.map((pair: [number, number]) => [
      pair[1],
      pair[0],
    ]);

    return {
      coordinates: latLngs,
      distanceMeters: Number(route.distance) || haversineDistanceMeters(origin, destination),
      durationSeconds:
        Number(route.duration) ||
        estimateDurationSeconds(haversineDistanceMeters(origin, destination), mode),
      mode,
      isEstimatedFallback: false,
    };
  } catch {
    const directMeters = haversineDistanceMeters(origin, destination);
    return {
      coordinates: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ],
      distanceMeters: directMeters,
      durationSeconds: estimateDurationSeconds(directMeters, mode),
      mode,
      isEstimatedFallback: true,
    };
  }
}

export function buildGoogleMapsUrl(
  destination: Coordinates,
  mode: "walking" | "driving",
  origin?: Coordinates | null
): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: mode,
  });
  if (origin) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
