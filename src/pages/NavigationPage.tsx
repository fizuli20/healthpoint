import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  Car,
  ExternalLink,
  Footprints,
  Navigation,
  Square,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { LoadingSplash } from "../components/BrandLogo";
import { LeafletMapView } from "../components/LeafletMapView";
import { MapErrorBoundary } from "../components/MapErrorBoundary";
import { DemoBadge } from "../components/StatusBadge";
import { useHealthPoint } from "../context/HealthPointContext";
import { useAccessPointQuery } from "../hooks/useHealthPointData";
import {
  buildGoogleMapsUrl,
  fetchRoute,
  formatDistance,
  formatDurationMinutes,
} from "../lib/geo";
import type { RouteResult } from "../types/healthpoint";

export function NavigationPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { effectiveOrigin, userLocation, setManualLocation } = useHealthPoint();
  const { data: point, isLoading } = useAccessPointQuery(id);

  const [mode, setMode] = useState<"walking" | "driving">("walking");
  const [wheelchairPriority, setWheelchairPriority] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [navActive, setNavActive] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!point) return;
    let active = true;
    void fetchRoute(
      effectiveOrigin,
      { lat: point.latitude, lng: point.longitude },
      mode
    ).then((res) => {
      if (active) setRoute(res);
    });
    return () => {
      active = false;
    };
  }, [point, effectiveOrigin, mode]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (isLoading) return <LoadingSplash />;
  if (!point) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="font-bold text-xl">{t("point.notFound")}</p>
        <Link to="/" className="text-[#C8102E] font-semibold">
          {t("point.backToMap")}
        </Link>
      </div>
    );
  }

  const toggleNavigation = () => {
    if (navActive) {
      if (watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setNavActive(false);
      return;
    }

    setNavActive(true);
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setManualLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Keep active with fallback location smoothly
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const googleMapsUrl = buildGoogleMapsUrl(
    { lat: point.latitude, lng: point.longitude },
    mode,
    userLocation ?? effectiveOrigin
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link
          to={`/points/${point.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#737373] hover:text-[#C8102E]"
        >
          <ArrowLeft className="w-4 h-4" />
          {point.name}
        </Link>
        {point.isDemo && <DemoBadge />}
      </div>

      {/* Mode Selector + Wheelchair Toggle */}
      <div className="hp-card bg-white rounded-3xl border border-[#E5E7EB] shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
              {t("navigation.title")}
            </span>
            <h1 className="text-xl font-extrabold text-[#171717] mt-0.5">{point.name}</h1>
            <p className="text-xs text-[#737373]">{point.address}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("walking")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                mode === "walking"
                  ? "bg-[#C8102E] border-[#C8102E] text-white"
                  : "bg-white border-[#E5E7EB] text-[#171717]"
              }`}
            >
              <Footprints className="w-4 h-4" />
              {t("navigation.walking")}
            </button>
            <button
              type="button"
              onClick={() => setMode("driving")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                mode === "driving"
                  ? "bg-[#C8102E] border-[#C8102E] text-white"
                  : "bg-white border-[#E5E7EB] text-[#171717]"
              }`}
            >
              <Car className="w-4 h-4" />
              {t("navigation.driving")}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-[#171717] cursor-pointer">
          <input
            type="checkbox"
            checked={wheelchairPriority}
            onChange={(e) => {
              setWheelchairPriority(e.target.checked);
              if (e.target.checked) setMode("walking");
            }}
            className="accent-[#C8102E] w-4 h-4"
          />
          <Accessibility className="w-4 h-4 text-[#C8102E]" />
          <span>{t("navigation.wheelchairMode")}</span>
          {wheelchairPriority && !point.wheelchairAccessible && (
            <span className="text-[#8B1028] font-bold">({t("point.wheelchairNo")})</span>
          )}
        </label>

        {route && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] p-3.5">
              <p className="text-xs font-semibold text-[#8B1028]">
                {t("navigation.distanceRemaining")}
              </p>
              <p className="text-2xl font-extrabold text-[#171717] mt-0.5">
                {formatDistance(route.distanceMeters, i18n.language)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-3.5">
              <p className="text-xs font-semibold text-[#737373]">{t("navigation.eta")}</p>
              <p className="text-2xl font-extrabold text-[#171717] mt-0.5">
                {formatDurationMinutes(route.durationSeconds, i18n.language)}
              </p>
            </div>
          </div>
        )}

        {route?.isEstimatedFallback && (
          <div className="flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{t("navigation.straightLineWarning")}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggleNavigation}
            className={`flex-1 min-w-[160px] py-3 px-5 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 transition ${
              navActive
                ? "bg-[#171717] text-white"
                : "bg-[#C8102E] text-white hover:bg-[#8B1028] shadow-brand"
            }`}
          >
            {navActive ? <Square className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
            {navActive ? t("navigation.stop") : t("navigation.start")}
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="button"
            className="flex-1 min-w-[180px] py-3 px-5 rounded-2xl border border-[#C8102E] bg-white text-[#C8102E] font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#FFF1F2] transition"
          >
            <ExternalLink className="w-4 h-4" />
            {t("navigation.openGoogleMaps")}
          </a>
        </div>

        {navActive && (
          <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            {t("navigation.activeStatus")}
          </p>
        )}
      </div>

      {/* Live Map with Route Polyline */}
      <div className="hp-card bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-card h-[420px]">
        <MapErrorBoundary>
          <LeafletMapView
            points={[point]}
            selectedPointId={point.id}
            userLocation={effectiveOrigin}
            routeCoordinates={route?.coordinates}
            center={effectiveOrigin}
          />
        </MapErrorBoundary>
      </div>
    </div>
  );
}
