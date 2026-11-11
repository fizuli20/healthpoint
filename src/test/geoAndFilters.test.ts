import { describe, expect, it } from "vitest";
import { BAKU_DEFAULT_CENTER, DEMO_ACCESS_POINTS } from "../data/bakuDemoPoints";
import { runDeterministicAssistant } from "../lib/assistantFallback";
import { DEFAULT_FILTER, filterAccessPoints, sortAccessPoints } from "../lib/filters";
import {
  buildGoogleMapsUrl,
  findNearestSuitablePoint,
  haversineDistanceMeters,
} from "../lib/geo";

describe("HealthPoint geo & filtering utilities", () => {
  it("computes Haversine distance accurately for Baku landmarks", () => {
    const boulevard = DEMO_ACCESS_POINTS.find((p) => p.id === "hp-baku-boulevard")!;
    const dist = haversineDistanceMeters(BAKU_DEFAULT_CENTER, {
      lat: boulevard.latitude,
      lng: boulevard.longitude,
    });
    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(2000);
  });

  it("finds nearest suitable operational point and respects wheelchair filter", () => {
    const nearest = findNearestSuitablePoint(DEMO_ACCESS_POINTS, BAKU_DEFAULT_CENTER, {
      wheelchairOnly: true,
    });
    expect(nearest).not.toBeNull();
    expect(nearest?.point.wheelchairAccessible).toBe(true);
    expect(nearest?.point.operationalStatus).toBe("operational");
  });

  it("builds valid Google Maps directions URL", () => {
    const url = buildGoogleMapsUrl({ lat: 40.3715, lng: 49.8415 }, "walking", {
      lat: 40.38,
      lng: 49.85,
    });
    expect(url).toContain("https://www.google.com/maps/dir/");
    expect(url).toContain("destination=40.3715%2C49.8415");
    expect(url).toContain("travelmode=walking");
  });

  it("filters points by equipment, 24/7, operational status, and search", () => {
    const aedPoints = filterAccessPoints(DEMO_ACCESS_POINTS, {
      ...DEFAULT_FILTER,
      operationalOnly: true,
      open247Only: true,
      wheelchairOnly: true,
      equipment: ["AED"],
    });
    expect(aedPoints.length).toBeGreaterThan(0);
    for (const pt of aedPoints) {
      expect(pt.operationalStatus).toBe("operational");
      expect(pt.open247).toBe(true);
      expect(pt.wheelchairAccessible).toBe(true);
      expect(pt.equipment).toContain("AED");
    }

    const nizamiMatches = filterAccessPoints(DEMO_ACCESS_POINTS, {
      ...DEFAULT_FILTER,
      search: "Nizami",
    });
    expect(nizamiMatches.some((p) => p.name.includes("Nizami"))).toBe(true);
  });

  it("sorts points by availability placing operational points first", () => {
    const sorted = sortAccessPoints(DEMO_ACCESS_POINTS, BAKU_DEFAULT_CENTER, "availability");
    const firstUnavailableIdx = sorted.findIndex((p) => p.operationalStatus === "unavailable");
    const lastOperationalIdx = sorted
      .map((p, i) => (p.operationalStatus === "operational" ? i : -1))
      .reduce((max, cur) => Math.max(max, cur), -1);
    if (firstUnavailableIdx !== -1 && lastOperationalIdx !== -1) {
      expect(lastOperationalIdx).toBeLessThan(firstUnavailableIdx);
    }
  });

  it("runs deterministic assistant across equipment & emergency prompts", () => {
    const res = runDeterministicAssistant(
      "Find an AED with wheelchair access",
      "en",
      DEMO_ACCESS_POINTS,
      BAKU_DEFAULT_CENTER
    );
    expect(res.mode).toBe("deterministic");
    expect(res.matchedIds.length).toBeGreaterThan(0);
    for (const id of res.matchedIds) {
      const pt = DEMO_ACCESS_POINTS.find((p) => p.id === id)!;
      expect(pt.wheelchairAccessible).toBe(true);
      expect(pt.equipment).toContain("AED");
    }

    const emergencyRes = runDeterministicAssistant(
      "chest pain emergency",
      "az",
      DEMO_ACCESS_POINTS,
      BAKU_DEFAULT_CENTER
    );
    expect(emergencyRes.reply).toContain("103");
  });
});
