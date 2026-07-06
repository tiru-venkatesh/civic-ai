/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { MapPin, Users, Navigation, Layers } from "lucide-react";
import { Complaint, FieldWorker } from "../types";

/**
 * SETUP REQUIRED
 * --------------
 * 1. npm install @googlemaps/js-api-loader @googlemaps/markerclusterer
 * 2. Add to your .env:
 *      VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
 * 3. Enable the "Maps JavaScript API" (and "Places API" if you use autocomplete
 *    elsewhere) on the same GCP project that owns the Map ID below.
 * 4. The Map ID (civic-ai) was created in Google Maps Platform > Map Management.
 *    It carries the cloud-based styling and is required for Advanced Markers.
 */
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const MAP_ID = "848e06ac11ba501230550cb7"; // civic-ai

interface SmartCityMapProps {
  complaints?: Complaint[];
  workers?: FieldWorker[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (id: string) => void;
  interactiveMode?: boolean; // If true, citizen can click to drop pin
  manualPin?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  showHeatmap?: boolean;
  showClusters?: boolean;
  showWorkers?: boolean;
  showTraffic?: boolean;
  showPriorityZones?: boolean;
  heightClass?: string;
}

// Rajahmundry Municipal Corporation sector — same bounds as the old SVG map,
// used only to center/fit the real map and to place the two priority zones.
const CITY_CENTER = { lat: 17.0015, lng: 81.7905 };

const PRIORITY_ZONES: {
  name: string;
  color: string;
  strokeColor: string;
  path: { lat: number; lng: number }[];
}[] = [
  {
    name: "Main Road – Kotagummam School Safety Corridor",
    color: "#F97316",
    strokeColor: "#F97316",
    path: [
      { lat: 17.0146, lng: 81.7900 },
      { lat: 17.0143, lng: 81.8006 },
      { lat: 17.0068, lng: 81.7994 },
      { lat: 17.0080, lng: 81.7911 }
    ]
  },
  {
    name: "Godavari Ghat Flood Elevation Zone",
    color: "#2563EB",
    strokeColor: "#2563EB",
    path: [
      { lat: 17.0000, lng: 81.7740 },
      { lat: 16.9980, lng: 81.7860 },
      { lat: 16.9905, lng: 81.7845 },
      { lat: 16.9922, lng: 81.7730 }
    ]
  }
];

let loaderInstance: Loader | null = null;
function getLoader() {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly"
    });
  }
  return loaderInstance;
}

function severityColor(c: Complaint): string {
  if (c.status === "Resolved") return "#10B981";
  if (c.aiAnalysis.severity === "Critical") return "#EF4444";
  if (c.aiAnalysis.severity === "High") return "#F97316";
  if (c.aiAnalysis.severity === "Medium") return "#F59E0B";
  return "#3B82F6";
}

export default function SmartCityMap({
  complaints = [],
  workers = [],
  selectedComplaintId = null,
  onSelectComplaint,
  interactiveMode = false,
  manualPin = null,
  onMapClick,
  showHeatmap = true,
  showClusters = true,
  showWorkers = true,
  showTraffic = false,
  showPriorityZones = true,
  heightClass = "h-[450px]"
}: SmartCityMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const complaintMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const workerMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const manualPinMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const zoneOverlaysRef = useRef<google.maps.Polygon[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const markerLibRef = useRef<google.maps.MarkerLibrary | null>(null);
  const vizLibRef = useRef<google.maps.VisualizationLibrary | null>(null);

  // ---- One-time map initialization -----------------------------------
  useEffect(() => {
    let cancelled = false;

    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError("Missing VITE_GOOGLE_MAPS_API_KEY — add it to your .env file.");
      return;
    }

    (async () => {
      try {
        const loader = getLoader();
        const { Map } = await loader.importLibrary("maps");
        const markerLib = (await loader.importLibrary("marker")) as google.maps.MarkerLibrary;
        const vizLib = (await loader.importLibrary("visualization")) as google.maps.VisualizationLibrary;

        if (cancelled || !mapDivRef.current) return;

        markerLibRef.current = markerLib;
        vizLibRef.current = vizLib;

        const map = new Map(mapDivRef.current, {
          center: CITY_CENTER,
          zoom: 14,
          mapId: MAP_ID,
          disableDefaultUI: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false
        });

        mapRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();

        setIsReady(true);
      } catch (err: any) {
        console.error("Google Maps failed to load:", err);
        if (!cancelled) setLoadError(err.message || "Failed to load Google Maps.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Interactive click-to-drop-pin -----------------------------------
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    if (clickListenerRef.current) {
      clickListenerRef.current.remove();
      clickListenerRef.current = null;
    }

    if (interactiveMode && onMapClick) {
      clickListenerRef.current = mapRef.current.addListener(
        "click",
        (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          onMapClick(
            Number(e.latLng.lat().toFixed(6)),
            Number(e.latLng.lng().toFixed(6))
          );
        }
      );
    }

    return () => {
      clickListenerRef.current?.remove();
      clickListenerRef.current = null;
    };
  }, [isReady, interactiveMode, onMapClick]);

  // ---- Priority zone polygons -----------------------------------
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    zoneOverlaysRef.current.forEach((poly) => poly.setMap(null));
    zoneOverlaysRef.current = [];

    if (showPriorityZones) {
      PRIORITY_ZONES.forEach((zone) => {
        const polygon = new google.maps.Polygon({
          paths: zone.path,
          strokeColor: zone.strokeColor,
          strokeOpacity: 0.9,
          strokeWeight: 1.5,
          fillColor: zone.color,
          fillOpacity: 0.08,
          map: mapRef.current!
        });
        polygon.addListener("click", () => {
          infoWindowRef.current?.setContent(
            `<div style="font:600 12px monospace;color:${zone.strokeColor}">⚠️ ${zone.name}</div>`
          );
          infoWindowRef.current?.setPosition(zone.path[0]);
          infoWindowRef.current?.open(mapRef.current!);
        });
        zoneOverlaysRef.current.push(polygon);
      });
    }
  }, [isReady, showPriorityZones]);

  // ---- Traffic layer -----------------------------------
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(mapRef.current);
    } else {
      trafficLayerRef.current?.setMap(null);
    }
  }, [isReady, showTraffic]);

  // ---- Heatmap layer (Critical/High, non-duplicate complaints) --------
  useEffect(() => {
    if (!isReady || !mapRef.current || !vizLibRef.current) return;

    heatmapRef.current?.setMap(null);
    heatmapRef.current = null;

    if (showHeatmap) {
      const points = complaints
        .filter(
          (c) =>
            !c.aiAnalysis.isDuplicate &&
            (c.aiAnalysis.severity === "Critical" || c.aiAnalysis.severity === "High")
        )
        .map((c) => ({
          location: new google.maps.LatLng(c.latitude, c.longitude),
          weight: c.aiAnalysis.severity === "Critical" ? 3 : 1.5
        }));

      if (points.length > 0) {
        heatmapRef.current = new vizLibRef.current.HeatmapLayer({
          data: points,
          map: mapRef.current,
          radius: 40,
          opacity: 0.5
        });
      }
    }
  }, [isReady, showHeatmap, complaints]);

  // ---- Complaint markers (+ optional clustering) -----------------------
  useEffect(() => {
    if (!isReady || !mapRef.current || !markerLibRef.current) return;

    // Clear previous markers/clusterer
    clustererRef.current?.clearMarkers();
    complaintMarkersRef.current.forEach((m) => (m.map = null));
    complaintMarkersRef.current.clear();

    const { AdvancedMarkerElement, PinElement } = markerLibRef.current;
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    complaints.forEach((c) => {
      const isSelected = selectedComplaintId === c.id;
      const color = c.aiAnalysis.isDuplicate ? "#94A3B8" : severityColor(c);

      const pin = new PinElement({
        background: color,
        borderColor: "#FFFFFF",
        glyphColor: "#FFFFFF",
        scale: c.aiAnalysis.isDuplicate ? 0.6 : isSelected ? 1.2 : 0.9
      });

      const marker = new AdvancedMarkerElement({
        map: mapRef.current!,
        position: { lat: c.latitude, lng: c.longitude },
        content: pin.element,
        title: `${c.id}: ${c.title}`,
        zIndex: isSelected ? 999 : c.aiAnalysis.isDuplicate ? 1 : 100
      });

      marker.addListener("click", () => {
        onSelectComplaint?.(c.id);
        const detail = c.aiAnalysis.isDuplicate
          ? `Duplicate — linked under primary report.`
          : `${c.category} · ${c.aiAnalysis.priorityScore}/100 priority`;
        infoWindowRef.current?.setContent(
          `<div style="font:600 12px sans-serif;margin-bottom:2px">${c.id}: ${c.title}</div>
           <div style="font:11px monospace;color:#475569">${detail}</div>`
        );
        infoWindowRef.current?.open({ map: mapRef.current!, anchor: marker });
      });

      complaintMarkersRef.current.set(c.id, marker);
      newMarkers.push(marker);
    });

    if (showClusters) {
      clustererRef.current = new MarkerClusterer({
        map: mapRef.current!,
        markers: newMarkers
      });
    }
  }, [isReady, complaints, selectedComplaintId, showClusters, onSelectComplaint]);

  // ---- Pan/zoom to the selected complaint -----------------------------
  useEffect(() => {
    if (!isReady || !mapRef.current || !selectedComplaintId) return;
    const marker = complaintMarkersRef.current.get(selectedComplaintId);
    if (marker && marker.position) {
      mapRef.current.panTo(marker.position);
    }
  }, [isReady, selectedComplaintId]);

  // ---- Live field worker markers -----------------------------
  useEffect(() => {
    if (!isReady || !mapRef.current || !markerLibRef.current) return;

    workerMarkersRef.current.forEach((m) => (m.map = null));
    workerMarkersRef.current = [];

    if (!showWorkers) return;

    const { AdvancedMarkerElement } = markerLibRef.current;

    workers
      .filter((w) => w.status !== "Offline")
      .forEach((w) => {
        const content = document.createElement("div");
        content.style.width = "16px";
        content.style.height = "16px";
        content.style.borderRadius = "50%";
        content.style.background = "#1565C0";
        content.style.border = "2px solid #FFFFFF";
        content.style.boxShadow = "0 0 0 rgba(21,101,192,0.6)";
        content.style.animation = "civic-worker-pulse 2s infinite";

        const marker = new AdvancedMarkerElement({
          map: mapRef.current!,
          position: { lat: w.currentLat, lng: w.currentLng },
          content,
          title: `${w.name} (${w.role})`
        });

        marker.addListener("click", () => {
          infoWindowRef.current?.setContent(
            `<div style="font:600 12px sans-serif">${w.name} (${w.role})</div>
             <div style="font:11px monospace;color:#475569">Dept: ${w.department} · Status: ${w.status}</div>`
          );
          infoWindowRef.current?.open({ map: mapRef.current!, anchor: marker });
        });

        workerMarkersRef.current.push(marker);
      });
  }, [isReady, workers, showWorkers]);

  // ---- Citizen manual drop pin -----------------------------
  useEffect(() => {
    if (!isReady || !mapRef.current || !markerLibRef.current) return;

    if (manualPinMarkerRef.current) {
      manualPinMarkerRef.current.map = null;
      manualPinMarkerRef.current = null;
    }

    if (manualPin) {
      const { AdvancedMarkerElement, PinElement } = markerLibRef.current;
      const pin = new PinElement({
        background: "#1565C0",
        borderColor: "#FFFFFF",
        glyphColor: "#FFFFFF",
        scale: 1.1
      });
      manualPinMarkerRef.current = new AdvancedMarkerElement({
        map: mapRef.current,
        position: manualPin,
        content: pin.element,
        title: "Report GPS Anchor",
        zIndex: 1000
      });
      mapRef.current.panTo(manualPin);
    }
  }, [isReady, manualPin]);

  if (loadError) {
    return (
      <div className={`w-full ${heightClass} flex items-center justify-center bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-mono p-4 text-center`}>
        {loadError}
      </div>
    );
  }

  return (
    <div className="relative w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
      <style>{`
        @keyframes civic-worker-pulse {
          0% { box-shadow: 0 0 0 0 rgba(21,101,192,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(21,101,192,0); }
          100% { box-shadow: 0 0 0 0 rgba(21,101,192,0); }
        }
      `}</style>

      {/* Map Legend Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm text-xs space-y-2 max-w-[200px]">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          <Layers className="h-3.5 w-3.5 text-gov-blue" />
          <span>Map Legend</span>
        </div>
        <div className="space-y-1.5 text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span>Critical Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
            <span>Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Low Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Resolved</span>
          </div>
          {showWorkers && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gov-blue animate-pulse inline-block"></span>
              <span>Field Worker (Live)</span>
            </div>
          )}
        </div>
      </div>

      {/* Real Google Map container */}
      <div className={`relative w-full ${heightClass} ${interactiveMode ? "cursor-crosshair" : ""}`}>
        <div ref={mapDivRef} className="w-full h-full" />
        {!isReady && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-xs text-slate-400 font-mono">
            Loading map…
          </div>
        )}
      </div>

      {/* Mini control panel bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-slate-400" />
          <span className="text-slate-800 font-mono">Rajahmundry Municipal Corp. · Live Google Maps</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
          Map ID: civic-ai
        </div>
      </div>
    </div>
  );
}
