/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  MapPin,
  AlertTriangle,
  Users,
  CheckCircle,
  FileText,
  Clock,
  Download,
  Flame,
  Search,
  Filter,
  Layers,
  Sparkles,
  TrendingUp,
  Sliders,
  DollarSign,
  UserCheck,
  ChevronRight,
  Info,
  Layers2,
  Navigation,
  X
} from "lucide-react";
import { Complaint, FieldWorker, SmartCityBudget } from "../types";
import SmartCityMap from "./SmartCityMap";

interface AdminDashboardProps {
  complaints: Complaint[];
  workers: FieldWorker[];
  onAssignWorker: (complaintId: string, workerId: string) => void;
  onUpdateStatus: (complaintId: string, status: "In Progress" | "Resolved", comment: string, photo: string | null) => void;
}

export default function AdminDashboard({
  complaints,
  workers,
  onAssignWorker,
  onUpdateStatus,
}: AdminDashboardProps) {
  // Navigation tabs for Admin Workspace
  // "overview" | "reports" | "workers" | "simulator"
  const [adminTab, setAdminTab] = useState<"overview" | "reports" | "workers" | "simulator">("overview");

  // Selected complaint in the list for detail view & explainability drawer
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(complaints[0]?.id || null);

  // Filter criteria states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  // Budget Simulation Multiplier State
  const [budgetMultiplier, setBudgetMultiplier] = useState(1.0); // 1.0x to 2.5x

  // Map layer toggle states
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showPriorityZones, setShowPriorityZones] = useState(true);

  // Assignment Modal/State helper
  const [assigningIncidentId, setAssigningIncidentId] = useState<string | null>(null);

  // PDF Download simulation state
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const selectedIncident = complaints.find((c) => c.id === selectedIncidentId);

  // Filtered complaints list (ignoring duplicates in the main ranking table for cleaner presentation, although they can be shown)
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesSeverity = severityFilter === "All" || c.aiAnalysis.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // KPI Calculations
  const totalReports = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress" || c.status === "Assigned").length;

  const totalAllocatedBudget = 450000;
  const spentBudget = complaints.reduce((sum, c) => sum + (c.status === "Resolved" ? c.aiAnalysis.budgetRequired : 0), 0) + 124000;
  const activeBudgetRequired = complaints.reduce((sum, c) => sum + (c.status !== "Resolved" ? c.aiAnalysis.budgetRequired : 0), 0);

  // Simulation Calculations based on multiplier slider
  const simulatedSpeedupPercentage = Math.round((budgetMultiplier - 1.0) * 140);
  const simulatedWaitTimeCompression = Math.round((1 - (1 / budgetMultiplier)) * 100);
  const simulatedTechnicianEfficiency = Math.round((budgetMultiplier - 1.0) * 45 + 100);

  const handleDownloadPDF = () => {
    setDownloadingPDF(true);
    setTimeout(() => {
      setDownloadingPDF(false);
      alert("CivicIQ Report PDF compiled. Downloading Official Security Digest.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/civiciq_logo_1783246559258.jpg"
            alt="CivicIQ Logo"
            className="w-10 h-10 rounded-lg shrink-0 object-cover border border-slate-200 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-slate-900 leading-none">Command Center Workspace</h1>
              <span className="text-[9px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                <span>Active Link</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Secure administrative dashboard for multi-agent prioritization and smart-city dispatch routing.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start xl:self-center font-mono text-xs">
          <button
            onClick={() => setAdminTab("overview")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "overview" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Core Live Ops
          </button>
          <button
            onClick={() => setAdminTab("reports")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "reports" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Analytics Reports
          </button>
          <button
            onClick={() => setAdminTab("workers")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "workers" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            3. Field Crew ({workers.length})
          </button>
          <button
            onClick={() => setAdminTab("simulator")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "simulator" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            4. "What-If" Simulator
          </button>
        </div>
      </div>

      {/* ADMIN SCREEN: CORE LIVE OPERATIONS OVERVIEW */}
      {adminTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">Total Complaints</div>
              <div className="text-3xl font-bold mt-1 text-slate-900 font-mono">{totalReports}</div>
              <div className="text-slate-500 text-[10px] font-bold font-mono mt-2 flex items-center gap-1">
                <FileText className="h-3 w-3 text-gov-blue" />
                All citizen portals linked
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">Active Pending</div>
              <div className="text-3xl font-bold mt-1 text-slate-900 font-mono">{pendingCount}</div>
              <div className="text-red-600 text-[10px] font-bold font-mono mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 animate-pulse" />
                Requires triage
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">Resolved Total</div>
              <div className="text-3xl font-bold mt-1 text-slate-900 font-mono">{resolvedCount}</div>
              <div className="text-emerald-600 text-[10px] font-bold font-mono mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {Math.round((resolvedCount / totalReports) * 100)}% clearance rate
              </div>
            </div>

            {/* Solid primary color card as in Geometric Balance theme */}
            <div className="bg-gov-blue p-5 rounded-xl shadow-md text-white border border-gov-blue">
              <div className="opacity-80 text-xs font-bold uppercase tracking-wider font-mono font-semibold">Allocated Budget</div>
              <div className="text-3xl font-bold mt-1 font-mono">${spentBudget.toLocaleString()}</div>
              <div className="text-white/90 text-[10px] font-bold font-mono mt-2 flex items-center gap-1 uppercase tracking-wide">
                <DollarSign className="h-3 w-3" />
                Max limit: ${totalAllocatedBudget.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Interactive GIS Command Map Section with toggles */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-gov-blue" />
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Interactive Smart GIS Workspace</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle high-contrast data overlays and inspect live coordinates.</p>
                </div>
              </div>

              {/* Layer Controls Dashboard */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-600 font-semibold">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    showHeatmap ? "bg-red-50 text-red-600 border-red-200" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Heatmap {showHeatmap ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setShowClusters(!showClusters)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    showClusters ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Layers2 className="h-3.5 w-3.5" />
                  <span>Clustering {showClusters ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setShowWorkers(!showWorkers)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    showWorkers ? "bg-blue-50 text-gov-blue border-blue-200" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Live Technicians {showWorkers ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setShowTraffic(!showTraffic)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    showTraffic ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Traffic Overlay {showTraffic ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>

            <SmartCityMap
              complaints={complaints}
              workers={workers}
              selectedComplaintId={selectedIncidentId}
              onSelectComplaint={(id) => setSelectedIncidentId(id)}
              showHeatmap={showHeatmap}
              showClusters={showClusters}
              showWorkers={showWorkers}
              showTraffic={showTraffic}
              showPriorityZones={showPriorityZones}
              heightClass="h-[380px]"
            />
          </div>

          {/* Table & Detailed Explainability Drawer split layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Table side (7 columns on XL) */}
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-gov-blue" />
                  <h3 className="font-display font-semibold text-slate-800 text-sm">AI-Prioritized Resolution Queue</h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono"
                  >
                    <option value="All">All Categories</option>
                    <option value="Pothole & Road Damage">Road Damage</option>
                    <option value="Water Leakage & Flooding">Water Mains</option>
                    <option value="Streetlight Failure">Streetlights</option>
                    <option value="Traffic Light Malfunction">Signals</option>
                    <option value="Waste & Sanitation">Sanitation</option>
                  </select>
                </div>
              </div>

              {/* Table Element */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600">
                      <th className="p-3 font-semibold">Incident ID</th>
                      <th className="p-3 font-semibold">Primary Title</th>
                      <th className="p-3 font-semibold text-center">Priority</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Severity</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {filteredComplaints.map((c) => {
                      const isSelected = selectedIncidentId === c.id;
                      let badge = "bg-amber-50 text-amber-700 border-amber-200";
                      if (c.status === "Resolved") badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      else if (c.status === "In Progress") badge = "bg-blue-50 text-blue-700 border-blue-200";

                      let severityBadge = "bg-slate-100 text-slate-700";
                      if (c.aiAnalysis.severity === "Critical") severityBadge = "bg-red-100 text-red-700 font-bold";
                      else if (c.aiAnalysis.severity === "High") severityBadge = "bg-orange-100 text-orange-700";

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedIncidentId(c.id)}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                            isSelected ? "bg-gov-blue-light/40 font-semibold" : ""
                          }`}
                        >
                          <td className="p-3 font-bold text-slate-900">{c.id}</td>
                          <td className="p-3 font-sans font-medium text-slate-800 truncate max-w-[150px]">
                            {c.title}
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-gov-blue bg-gov-blue-light px-2 py-0.5 rounded">
                              {c.aiAnalysis.priorityScore}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[9px] px-2 py-0.5 border rounded-full uppercase font-bold ${badge}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${severityBadge}`}>
                              {c.aiAnalysis.severity}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssigningIncidentId(c.id);
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-gov-blue text-[10px] font-bold text-gov-blue"
                            >
                              Dispatch
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explainable AI Side Panel (5 columns on XL) */}
            <div className="xl:col-span-5 bg-white border border-slate-200 border-l-4 border-l-gov-blue rounded-xl shadow-sm p-5 space-y-4">
              {selectedIncident ? (
                <>
                  {/* Header Title */}
                  <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        Active Audit View: {selectedIncident.id}
                      </span>
                      <h4 className="font-display font-semibold text-slate-800 text-sm mt-0.5">
                        Explainable AI Diagnostics
                      </h4>
                      <div className="inline-block mt-1 bg-gov-blue/10 text-gov-blue px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider italic">
                        Explainable Engine
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gov-blue bg-gov-blue-light px-2.5 py-1 rounded">
                      Score: {selectedIncident.aiAnalysis.priorityScore}/100
                    </span>
                  </div>

                  {/* Mathematical priority formula */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] font-mono text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700 block uppercase text-[9px] mb-1">
                      Priority Weights Algorithm Formula:
                    </span>
                    <code>
                      Priority = (Severity Weight × 0.40) + (Population Affected Weight × 0.25) + (Delay Impact × 0.20) + (Weather/Risk × 0.15)
                    </code>
                  </div>

                  {/* Explanations Grid */}
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">Severity Class:</span>
                        <span className="text-slate-900 font-bold block mt-0.5">{selectedIncident.aiAnalysis.severity}</span>
                      </div>
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">Population Buffer:</span>
                        <span className="text-slate-900 font-bold block mt-0.5">
                          {selectedIncident.aiAnalysis.populationAffected.toLocaleString()} citizens
                        </span>
                      </div>
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">Estimated Budget:</span>
                        <span className="text-slate-900 font-bold block mt-0.5">
                          ${selectedIncident.aiAnalysis.budgetRequired.toLocaleString()}
                        </span>
                      </div>
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">Confidence Index:</span>
                        <span className="text-emerald-600 font-bold block mt-0.5">
                          {Math.round(selectedIncident.aiAnalysis.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-100 border-l-4 border-l-gov-blue p-3.5 rounded-lg bg-slate-50/50 space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-gov-blue block">
                        Agent Logic & Reasoning Explanation:
                      </span>
                      <p className="text-xs text-slate-700 font-sans italic leading-relaxed">
                        "{selectedIncident.aiAnalysis.reasoning}"
                      </p>
                    </div>

                    {/* Timeline History Tracker */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        Lifecycle Event Audit Trail
                      </span>
                      <div className="space-y-3 font-mono text-[10px] text-slate-600 pl-1">
                        {selectedIncident.history.map((h, idx) => (
                          <div key={idx} className="relative pl-4 border-l border-slate-200 pb-1">
                            <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white inline-block"></span>
                            <div className="flex items-center justify-between text-slate-800">
                              <span className="font-bold uppercase text-[9px]">{h.status}</span>
                              <span className="text-[8px] text-slate-400">{new Date(h.updatedAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-tight">{h.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Assignment Dispatch */}
                    <div className="border-t border-slate-100 pt-3 flex gap-2">
                      <button
                        onClick={() => setAssigningIncidentId(selectedIncident.id)}
                        className="flex-1 py-2.5 bg-gov-blue hover:bg-gov-blue-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Reassign Crew</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF()}
                        className="py-2.5 px-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
                        title="Export Incident Dossier to PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 font-sans">
                  <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">Select an incident from the ranked priority list to load explains.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ADMIN SCREEN: DETAILED STATS REPORTS & CHARTS */}
      {adminTab === "reports" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-base">District Performance Indicators</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statistical outputs compiled by CivicIQ Analytics Agent.</p>
              </div>
              <button
                onClick={() => handleDownloadPDF()}
                className="px-4 py-2 bg-gov-blue hover:bg-gov-blue-hover text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Compile PDF Digest</span>
              </button>
            </div>

            {/* Custom high-fidelity CSS charts representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Performance by Department */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-500">Department SLA Performance</h4>
                <div className="space-y-3 font-mono text-[11px] text-slate-600">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Transportation (Road/Pothole)</span>
                      <span className="font-bold">94% (Within 6h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gov-blue h-full rounded-full" style={{ width: "94%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Water Resources (Leakage/Flood)</span>
                      <span className="font-bold">89% (Within 8h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "89%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Public Works (Streetlights)</span>
                      <span className="font-bold">78% (Within 12h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Sanitation Services (Hazmat/Trash)</span>
                      <span className="font-bold">96% (Within 3h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "96%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution volume over time (Weekly) */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-500">Weekly Incident Intake & Resolution</h4>
                
                {/* Styled Vector Line Chart representation */}
                <div className="h-36 relative flex items-end justify-between font-mono text-[9px] text-slate-400">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-200">
                    <div className="border-b border-slate-100 h-0 w-full"></div>
                    <div className="border-b border-slate-100 h-0 w-full"></div>
                    <div className="border-b border-slate-100 h-0 w-full"></div>
                  </div>

                  {/* Draw simple visual bars / heights */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-16 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-12 absolute bottom-0"></div>
                    </div>
                    <span>Mon</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-20 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-14 absolute bottom-0"></div>
                    </div>
                    <span>Tue</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-28 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-22 absolute bottom-0"></div>
                    </div>
                    <span>Wed</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-32 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-26 absolute bottom-0"></div>
                    </div>
                    <span>Thu</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-24 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-20 absolute bottom-0"></div>
                    </div>
                    <span>Fri</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-blue-100 rounded"></span>
                    <span>Intake Volume</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-gov-blue rounded"></span>
                    <span>Resolved Volume</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADMIN SCREEN: FIELD WORKER MANAGEMENT LIST */}
      {adminTab === "workers" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base">Municipal Crew Profiles</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status tracking of all engineers and specialists on the grid.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((w) => {
                let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
                if (w.status === "Available") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                else if (w.status === "On Mission") statusColor = "bg-blue-50 text-blue-700 border-blue-200";

                const assignedIncident = complaints.find(c => c.assignedWorkerId === w.id && c.status !== "Resolved");

                return (
                  <div key={w.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-gov-blue transition-colors flex flex-col justify-between gap-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          <img src={w.avatar} alt={w.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">{w.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{w.role}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 border rounded-full uppercase font-mono font-bold ${statusColor}`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span>DEPARTMENT:</span>
                        <span className="text-slate-800 font-semibold">{w.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PHONE CONTACT:</span>
                        <span className="text-slate-800">{w.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LIVE SECTOR:</span>
                        <span className="text-slate-800">{w.currentLat.toFixed(4)}°N, {w.currentLng.toFixed(4)}°W</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs">
                      {assignedIncident ? (
                        <div>
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Assigned Work Order:</span>
                          <span className="text-slate-800 font-semibold block truncate mt-0.5">{assignedIncident.title}</span>
                          <span className="text-[9px] font-mono text-gov-blue font-bold block uppercase mt-0.5">{assignedIncident.id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px] uppercase block">No active assignment</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SCREEN: "WHAT-IF" SIMULATION PLAYGROUND */}
      {adminTab === "simulator" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base">"What-If" Budget & Dispatch Simulator</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Model smart-city resolution performance. Adjust the funding multipliers below to simulate technician compression speeds and predictive SLA compaction.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Slider side (5 cols) */}
              <div className="lg:col-span-5 border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                <div className="flex justify-between font-mono text-xs text-slate-600">
                  <span className="font-bold text-slate-800">EXPAND BUDGET MULTIPLIER:</span>
                  <span className="text-gov-blue font-bold text-sm bg-gov-blue-light px-2.5 py-0.5 rounded">
                    {budgetMultiplier.toFixed(1)}x Funding
                  </span>
                </div>

                {/* Slider input */}
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={budgetMultiplier}
                  onChange={(e) => setBudgetMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gov-blue"
                />

                <div className="flex justify-between font-mono text-[9px] text-slate-400 uppercase font-bold">
                  <span>Standard ($1.0x)</span>
                  <span>1.7x</span>
                  <span>Max Out ($2.5x)</span>
                </div>

                <div className="text-xs text-slate-500 font-sans leading-relaxed pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">Under the hood simulation:</span>
                  Increasing budget allocates auxiliary contractor trucks, activates localized repair crews, and automates micro-routing queues via predictive CivicIQ vectors.
                </div>
              </div>

              {/* Numerical predictive metrics outputs (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Resolution Speedup</span>
                  <h4 className="text-3xl font-mono font-bold text-emerald-600">+{simulatedSpeedupPercentage}%</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Faster repair completions</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Wait Time Compression</span>
                  <h4 className="text-3xl font-mono font-bold text-gov-blue">-{simulatedWaitTimeCompression}%</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Reduced citizen SLA delay</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Dispatched Crew Efficiency</span>
                  <h4 className="text-3xl font-mono font-bold text-indigo-600">{simulatedTechnicianEfficiency}%</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Adaptive route loading index</p>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* DISPATCH/ASSIGN WORKER MODAL (Absolute Overlay backdrop) */}
      {assigningIncidentId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Manual override dispatch</span>
                <h4 className="font-display font-semibold text-slate-900 text-sm">Assign Crew: {assigningIncidentId}</h4>
              </div>
              <button
                onClick={() => setAssigningIncidentId(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed font-sans">
              <p>
                Select an available engineer below. CivicIQ recommends technicians specialized in the matching infrastructure field.
              </p>
            </div>

            {/* Crew options list */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {workers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    onAssignWorker(assigningIncidentId, w.id);
                    setAssigningIncidentId(null);
                  }}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-gov-blue hover:bg-slate-50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={w.avatar} alt={w.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block leading-tight">{w.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{w.role} ({w.department})</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    w.status === "Available" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
