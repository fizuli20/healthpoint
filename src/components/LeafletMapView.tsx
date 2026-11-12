import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { Compass, Layers, Maximize2, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BAKU_DEFAULT_CENTER } from "../data/bakuDemoPoints";
import type { AccessPoint, Coordinates, OperationalStatus } from "../types/healthpoint";

const STATUS_DOT_HEX: Record<OperationalStatus, string> = {
  operational: "#10B981",
  limited: "#F59E0B",
  unavailable: "#E11D48",
  unknown: "#737373",
};

function createHealthPointMarkerIcon(status: OperationalStatus, selected: boolean): L.DivIcon {
  const scale = selected ? 1.18 : 1;
  const ringColor = STATUS_DOT_HEX[status] ?? "#737373";
  const ringBorder = selected ? "#8B1028" : "#FFFFFF";
  const html = `
    <div style="position:relative;width:40px;height:46px;transform:scale(${scale});transform-origin:bottom center;transition:transform .2s ease;">
      <svg width="40" height="46" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 5px 10px rgba(200,16,46,0.34));">
        <path d="M32 4C17.64 4 6 15.64 6 30c0 18.48 22.88 35.12 23.85 35.8a3.8 3.8 0 0 0 4.3 0C35.12 65.12 58 48.48 58 30 58 15.64 46.36 4 32 4Z" fill="#C8102E" stroke="${ringBorder}" stroke-width="3.5"/>
        <rect x="28.5" y="18" width="7" height="20" rx="2" fill="#FFFFFF"/>
        <rect x="22" y="24.5" width="20" height="7" rx="2" fill="#FFFFFF"/>
      </svg>
      <span style="position:absolute;top:1px;right:2px;width:12px;height:12px;border-radius:9999px;background:${ringColor};border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></span>
    </div>`;

  return L.divIcon({
    html,
    className: "hp-marker-wrapper",
    iconSize: [40, 46],
    iconAnchor: [20, 46],
  });
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;border-radius:9999px;background:#C8102E;border:3px solid #FFFFFF;box-shadow:0 0 0 6px rgba(200,16,46,0.22);"></div>`,
    className: "hp-marker-wrapper",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

interface LeafletMapViewProps {
  points: AccessPoint[];
  selectedPointId?: string | null;
  onSelectPoint?: (point: AccessPoint) => void;
  userLocation?: Coordinates | null;
  center?: Coordinates;
  zoom?: number;
  routeCoordinates?: [number, number][];
  showControls?: boolean;
  heightClass?: string;
}

export function LeafletMapView({
  points,
  selectedPointId,
  onSelectPoint,
  userLocation,
  center = BAKU_DEFAULT_CENTER,
  zoom = 12,
  routeCoordinates,
  showControls = true,
  heightClass = "h-full w-full",
}: LeafletMapViewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [layerMode, setLayerMode] = useState<"minimal" | "standard">("minimal");
  const [tileError, setTileError] = useState(false);

  // Initialize Leaflet instance once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
    });

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 42,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: "hp-cluster-icon",
          iconSize: [36, 36],
        }),
    });

    map.addLayer(clusterGroup);
    mapRef.current = map;
    clusterRef.current = clusterGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tile layer switcher
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    const layer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    });

    layer.on("tileerror", () => setTileError(true));
    layer.on("load", () => setTileError(false));
    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [layerMode]);

  // Sync access point markers into cluster layer
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    points.forEach((point) => {
      const isSelected = point.id === selectedPointId;
      const marker = L.marker([point.latitude, point.longitude], {
        icon: createHealthPointMarkerIcon(point.operationalStatus, isSelected),
        title: point.name,
      });
      marker.on("click", () => {
        onSelectPoint?.(point);
      });
      cluster.addLayer(marker);
    });
  }, [points, selectedPointId, onSelectPoint]);

  // Sync user geolocation indicator
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const m = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserLocationIcon(),
        zIndexOffset: 1000,
      }).addTo(map);
      m.bindTooltip(t("map.yourLocation"), { direction: "top" });
      userMarkerRef.current = m;
    }
  }, [userLocation, t]);

  // Pan smoothly to selected point
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPointId) return;
    const match = points.find((p) => p.id === selectedPointId);
    if (match) {
      map.setView([match.latitude, match.longitude], Math.max(map.getZoom(), 15), {
        animate: true,
      });
    }
  }, [selectedPointId, points]);

  // Render active navigation route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length >= 2) {
      const poly = L.polyline(routeCoordinates, {
        color: "#C8102E",
        weight: 5,
        opacity: 0.9,
      }).addTo(map);
      routeLayerRef.current = poly;
      map.fitBounds(poly.getBounds(), { padding: [48, 48] });
    }
  }, [routeCoordinates]);

  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const target = userLocation ?? center;
    map.setView([target.lat, target.lng], 14, { animate: true });
  };

  const handleFitAll = () => {
    const map = mapRef.current;
    if (!map || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 });
  };

  return (
    <div className={`relative ${heightClass}`}>
      <div
        ref={containerRef}
        className={`h-full w-full z-0 ${layerMode === "minimal" ? "hp-map-minimal" : ""}`}
        role="region"
        aria-label={t("map.ariaRegion")}
      />

      {tileError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-white/95 border border-[#FCE8EC] text-[#8B1028] text-xs font-medium px-3 py-1.5 rounded-full shadow-soft">
          {t("map.tileSlow")}
        </div>
      )}

      {showControls && (
        <div className="absolute right-3 top-3 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label={t("map.zoomIn")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-soft flex items-center justify-center text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E] transition"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label={t("map.zoomOut")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-soft flex items-center justify-center text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E] transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            aria-label={t("map.recenter")}
            title={t("map.recenter")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-soft flex items-center justify-center text-[#C8102E] hover:bg-[#FFF1F2] transition"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFitAll}
            aria-label={t("map.fitAll")}
            title={t("map.fitAll")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-soft flex items-center justify-center text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E] transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setLayerMode((m) => (m === "minimal" ? "standard" : "minimal"))}
            aria-label={
              layerMode === "minimal" ? t("map.layerStandard") : t("map.layerMinimal")
            }
            title={layerMode === "minimal" ? t("map.layerStandard") : t("map.layerMinimal")}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] shadow-soft flex items-center justify-center text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E] transition"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
