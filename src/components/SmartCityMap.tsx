/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, Users, Flame, Navigation, AlertTriangle, Layers } from "lucide-react";
import { Complaint, FieldWorker } from "../types";

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
  heightClass = "h-[450px]",
}: SmartCityMapProps) {
  const [hoveredEntity, setHoveredEntity] = useState<{
    x: number;
    y: number;
    title: string;
    type: "complaint" | "worker" | "pin";
    detail?: string;
  } | null>(null);

  // Constants for map boundaries
  const minLat = 40.7100;
  const maxLat = 40.7400;
  const minLng = -74.0200;
  const maxLng = -73.9800;

  const mapCoordsToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = 600 - ((lat - minLat) / (maxLat - minLat)) * 600;
    return { x, y };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactiveMode || !onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale back to viewBox coordinates (800x600)
    const svgX = (clickX / rect.width) * 800;
    const svgY = (clickY / rect.height) * 600;

    // Convert SVG x,y back to Lat, Lng
    const lng = minLng + (svgX / 800) * (maxLng - minLng);
    const lat = minLat + ((600 - svgY) / 600) * (maxLat - minLat);

    // Round for clean coordinate printing
    onMapClick(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
  };

  // Predefined vector layouts representing streets, parks, and rivers
  const rivers = [
    // Hudson River (left side)
    "M 0,0 L 110,0 L 150,150 L 120,350 L 180,600 L 0,600 Z",
    // East River (bottom right)
    "M 720,600 L 680,480 L 710,380 L 800,320 L 800,600 Z"
  ];

  const parks = [
    // Washington Square Park area
    { x: 380, y: 180, w: 90, h: 55, label: "Washington Square Park" },
    // Union Square
    { x: 520, y: 120, w: 40, h: 45, label: "Union Square Park" },
    // Battery Park (bottom left)
    { x: 190, y: 520, w: 80, h: 60, label: "City Hall Common" }
  ];

  const mainRoads = [
    // Broadway (Diagonal main road)
    { path: "M 320,0 L 450,220 L 520,350 L 590,510 L 620,600", label: "Broadway", traffic: "heavy" },
    // Canal St (Cross street)
    { path: "M 110,300 L 800,380", label: "Canal St", traffic: "jammed" },
    // Greenwich St
    { path: "M 180,100 L 260,350 L 300,600", label: "Greenwich St", traffic: "light" },
    // Lafayette St
    { path: "M 530,0 L 560,300 L 610,600", label: "Lafayette St", traffic: "light" },
    // E 4th St
    { path: "M 350,150 L 800,210", label: "East 4th St", traffic: "light" },
    // Grand St
    { path: "M 120,400 L 800,450", label: "Grand St", traffic: "moderate" }
  ];

  const priorityZones = [
    // School Zone (Accident threat)
    {
      points: "320,130 480,140 460,240 330,220",
      name: "Union-Broadway School Pedestrian Safety Corridor",
      color: "rgba(249, 115, 22, 0.08)",
      stroke: "#F97316"
    },
    // High-water Risk Zone
    {
      points: "150,310 310,330 290,480 130,460",
      name: "Greenwich-Canal Flood Elevation Zone",
      color: "rgba(37, 99, 235, 0.06)",
      stroke: "#2563EB"
    }
  ];

  return (
    <div className="relative w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
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

      {/* SVG Container */}
      <div className={`relative w-full ${heightClass} overflow-hidden cursor-crosshair`}>
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full select-none"
          onClick={handleMapClick}
        >
          {/* Grid lines for data-driven authority look */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="heat-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#F97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Hudson & East Rivers */}
          {rivers.map((pathStr, idx) => (
            <path key={`river-${idx}`} d={pathStr} fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="1" />
          ))}

          {/* Parks */}
          {parks.map((p, idx) => (
            <g key={`park-${idx}`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#DCFCE7" rx="6" stroke="#BBF7D0" strokeWidth="1" />
              <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 4} fill="#166534" fontSize="10" fontWeight="500" textAnchor="middle" className="font-sans pointer-events-none">
                {p.label}
              </text>
            </g>
          ))}

          {/* Priority Safety/Incident Zones */}
          {showPriorityZones && priorityZones.map((z, idx) => (
            <g key={`zone-${idx}`}>
              <polygon points={z.points} fill={z.color} stroke={z.stroke} strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Draw tiny shield/warning icon coordinate near center */}
              <text
                x={idx === 0 ? 390 : 210}
                y={idx === 0 ? 190 : 380}
                fill={z.stroke}
                fontSize="9"
                fontWeight="600"
                className="font-mono bg-white uppercase tracking-wider"
              >
                ⚠️ {idx === 0 ? "PEDESTRIAN ZONE" : "FLOOD PLAIN"}
              </text>
            </g>
          ))}

          {/* Main Roads */}
          {mainRoads.map((road, idx) => {
            let color = "#E2E8F0";
            let width = 12;
            if (showTraffic) {
              if (road.traffic === "heavy") { color = "#F97316"; width = 13; }
              else if (road.traffic === "jammed") { color = "#EF4444"; width = 14; }
              else { color = "#10B981"; }
            } else {
              color = "#FFFFFF";
            }
            return (
              <g key={`road-${idx}`}>
                {/* Road Casing */}
                <path d={road.path} fill="none" stroke="#CBD5E1" strokeWidth={width + 2} strokeLinecap="round" strokeLinejoin="round" />
                {/* Active Road surface */}
                <path d={road.path} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
                {/* Central Lane divider dashed line */}
                <path d={road.path} fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}

          {/* Text Labels for Roads */}
          <text x="350" y="50" fill="#64748B" fontSize="9" fontWeight="500" transform="rotate(58 350 50)" className="font-mono">Broadway</text>
          <text x="240" y="325" fill="#64748B" fontSize="9" fontWeight="500" transform="rotate(6 240 325)" className="font-mono">Canal St</text>

          {/* Heatmap Layer */}
          {showHeatmap && complaints.map((c) => {
            if (c.aiAnalysis.isDuplicate) return null;
            if (c.aiAnalysis.severity !== "Critical" && c.aiAnalysis.severity !== "High") return null;
            const { x, y } = mapCoordsToSvg(c.latitude, c.longitude);
            return (
              <circle
                key={`heat-${c.id}`}
                cx={x}
                cy={y}
                r={c.aiAnalysis.severity === "Critical" ? 60 : 40}
                fill="url(#heat-grad)"
                className="pointer-events-none"
              />
            );
          })}

          {/* Complaint Clusters (dotted rings around high clusters) */}
          {showClusters && (
            <g>
              {/* Hardcoded visual cluster representing Broadway high-density area */}
              <circle cx="452" cy="225" r="35" fill="none" stroke="#6366F1" strokeWidth="1" strokeDasharray="3 3 animate-pulse" />
              <rect x="422" y="245" width="60" height="15" rx="3" fill="#6366F1" />
              <text x="452" y="255" fill="#FFFFFF" fontSize="9" fontWeight="600" textAnchor="middle" className="font-mono">
                CL-1 (2)
              </text>
            </g>
          )}

          {/* Active Incident Pins */}
          {complaints.map((c) => {
            const { x, y } = mapCoordsToSvg(c.latitude, c.longitude);
            const isSelected = selectedComplaintId === c.id;

            // Determine Pin Color
            let pinColor = "#3B82F6"; // Low
            if (c.status === "Resolved") pinColor = "#10B981"; // Resolved green
            else if (c.aiAnalysis.severity === "Critical") pinColor = "#EF4444"; // Critical Red
            else if (c.aiAnalysis.severity === "High") pinColor = "#F97316"; // High Orange
            else if (c.aiAnalysis.severity === "Medium") pinColor = "#F59E0B"; // Yellow

            // Don't draw duplicates separately if cluster is on, but we can draw them grayed out or stacked
            if (c.aiAnalysis.isDuplicate) {
              return (
                <g
                  key={c.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectComplaint && onSelectComplaint(c.id)}
                  onMouseEnter={() => setHoveredEntity({ x, y: y - 10, title: "Duplicate Report Flagged", type: "complaint", detail: `${c.id}: Linked under primary.` })}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  <circle cx={x + 5} cy={y + 5} r="5" fill="#94A3B8" stroke="#FFFFFF" strokeWidth="1" />
                </g>
              );
            }

            return (
              <g
                key={c.id}
                className="cursor-pointer"
                onClick={() => onSelectComplaint && onSelectComplaint(c.id)}
                onMouseEnter={() => setHoveredEntity({
                  x,
                  y: y - 12,
                  title: `${c.id}: ${c.category}`,
                  type: "complaint",
                  detail: `${c.title} (${c.aiAnalysis.priorityScore}/100 Priority)`
                })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Selection Pulse Ring */}
                {isSelected && (
                  <circle cx={x} cy={y} r="16" fill="none" stroke={pinColor} strokeWidth="2">
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Pin shadow */}
                <ellipse cx={x} cy={y + 3} rx="4" ry="1.5" fill="rgba(0,0,0,0.2)" />

                {/* Actual Pin Pinhead */}
                <path
                  d="M 8,0 C 8,4.5 3.5,9 0,14 C -3.5,9 -8,4.5 -8,0 C -8,-4.5 -3.5,-8 0,-8 C 3.5,-8 8,-4.5 8,0 Z"
                  transform={`translate(${x}, ${y})`}
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-transform duration-200 hover:scale-125"
                />

                {/* Priority display inside or next to pin */}
                <circle cx={x} cy={y} r="3" fill="#FFFFFF" />
              </g>
            );
          })}

          {/* Live Field Workers tracking */}
          {showWorkers && workers.map((w) => {
            if (w.status === "Offline") return null;
            const { x, y } = mapCoordsToSvg(w.currentLat, w.currentLng);
            return (
              <g
                key={w.id}
                onMouseEnter={() => setHoveredEntity({
                  x,
                  y: y - 14,
                  title: `${w.name} (${w.role})`,
                  type: "worker",
                  detail: `Dept: ${w.department} | Status: ${w.status}`
                })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Radar pulse ring for live tracking */}
                <circle cx={x} cy={y} r="12" fill="none" stroke="#1565C0" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="4;15" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Worker marker */}
                <circle cx={x} cy={y} r="6.5" fill="#1565C0" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M -3,-3 L 3,3 M 3,-3 L -3,3" stroke="#FFFFFF" strokeWidth="1" transform={`translate(${x}, ${y})`} />
              </g>
            );
          })}

          {/* Citizen Manual Location Drop Pin (Citizen Complaint Submit Screen) */}
          {manualPin && (
            <g
              onMouseEnter={() => setHoveredEntity({
                x: mapCoordsToSvg(manualPin.lat, manualPin.lng).x,
                y: mapCoordsToSvg(manualPin.lat, manualPin.lng).y - 12,
                title: "Report GPS Anchor",
                type: "pin",
                detail: `Lat: ${manualPin.lat}, Lng: ${manualPin.lng}`
              })}
              onMouseLeave={() => setHoveredEntity(null)}
            >
              {/* Dropped pin indicator */}
              <circle
                cx={mapCoordsToSvg(manualPin.lat, manualPin.lng).x}
                cy={mapCoordsToSvg(manualPin.lat, manualPin.lng).y}
                r="18"
                fill="none"
                stroke="#1565C0"
                strokeWidth="2"
                strokeDasharray="3 2 animate-spin"
              />
              <path
                d="M 10,0 C 10,5.5 4.5,11 0,18 C -4.5,11 -10,5.5 -10,0 C -10,-5.5 -4.5,-10 0,-10 C 4.5,-10 10,-5.5 10,0 Z"
                transform={`translate(${mapCoordsToSvg(manualPin.lat, manualPin.lng).x}, ${mapCoordsToSvg(manualPin.lat, manualPin.lng).y})`}
                fill="#1565C0"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle
                cx={mapCoordsToSvg(manualPin.lat, manualPin.lng).x}
                cy={mapCoordsToSvg(manualPin.lat, manualPin.lng).y}
                r="4"
                fill="#FFFFFF"
              />
            </g>
          )}
        </svg>

        {/* Hover / Tooltip HUD element */}
        {hoveredEntity && (
          <div
            className="absolute z-20 bg-slate-900 text-white p-2.5 rounded shadow-lg text-xs pointer-events-none transition-all font-mono"
            style={{
              left: `${(hoveredEntity.x / 800) * 100}%`,
              top: `${(hoveredEntity.y / 600) * 100}%`,
              transform: "translate(-50%, -100%)",
              marginTop: "-8px"
            }}
          >
            <div className="font-bold flex items-center gap-1.5 text-blue-300">
              {hoveredEntity.type === "complaint" && <MapPin className="h-3 w-3" />}
              {hoveredEntity.type === "worker" && <Users className="h-3 w-3" />}
              {hoveredEntity.type === "pin" && <Navigation className="h-3 w-3" />}
              <span>{hoveredEntity.title}</span>
            </div>
            {hoveredEntity.detail && (
              <div className="text-[10px] text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed max-w-[220px]">
                {hoveredEntity.detail}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini control panel bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-slate-400" />
          <span className="text-slate-800 font-mono">Boundaries: NYC Central Sector (40.71°N to 40.74°N)</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
          Vectors: 100% Vector Canvas Layer
        </div>
      </div>
    </div>
  );
}
