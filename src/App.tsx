/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Shield,
  FileText,
  Users,
  Bell,
  Clock,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Info,
  MapPin,
  X,
  Plus
} from "lucide-react";
import { Complaint, FieldWorker, Notification } from "./types";
import {
  INITIAL_COMPLAINTS,
  INITIAL_WORKERS,
  INITIAL_NOTIFICATIONS
} from "./data/mockData";
import CitizenApp from "./components/CitizenApp";
import AdminDashboard from "./components/AdminDashboard";
import FieldWorkerApp from "./components/FieldWorkerApp";
import DesignSystemDocs from "./components/DesignSystemDocs";

export default function App() {
  // Global States representing database persistence
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem("ciq_complaints");
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [workers, setWorkers] = useState<FieldWorker[]>(() => {
    const saved = localStorage.getItem("ciq_workers");
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("ciq_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Current active viewport workspace
  // "admin" | "citizen" | "worker" | "docs"
  const [activeRole, setActiveRole] = useState<"admin" | "citizen" | "worker" | "docs">("admin");

  // Localized clock state
  const [currentTime, setCurrentTime] = useState("");

  // Notification center visible flag
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Selected complaint ID for the global detail sidebar overlay
  const [inspectIncidentId, setInspectIncidentId] = useState<string | null>(null);

  // Sync state with local storage on edits
  useEffect(() => {
    localStorage.setItem("ciq_complaints", JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem("ciq_workers", JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem("ciq_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Incident updates functions
  const handleAddNewComplaint = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);

    // Create system notification
    const newNotif: Notification = {
      id: `N-CT-${Date.now()}`,
      role: "Admin",
      title: "New Citizen Incident Logged",
      message: `${newComplaint.id}: '${newComplaint.title}' pre-classified at Priority ${newComplaint.aiAnalysis.priorityScore}.`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAssignWorker = (complaintId: string, workerId: string) => {
    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: "Assigned",
            assignedWorkerId: workerId,
            history: [
              ...c.history,
              {
                status: "Assigned",
                updatedAt: new Date().toISOString(),
                comment: `Admin manually assigned work order to ${targetWorker.name} (${targetWorker.role}).`,
                updatedBy: "Command Center Dispatcher"
              }
            ]
          };
        }
        return c;
      })
    );

    // Update worker status to On Mission
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status: "On Mission" } : w))
    );

    // Add alert notifications for Worker and Admin
    const newNotifs: Notification[] = [
      {
        id: `N-AW-${Date.now()}-1`,
        role: "Worker",
        title: "New Dispatch Order",
        message: `You have been assigned to investigate and repair incident ${complaintId}.`,
        createdAt: new Date().toISOString(),
        read: false
      },
      {
        id: `N-AW-${Date.now()}-2`,
        role: "Admin",
        title: "Crew Assigned to Work order",
        message: `Technician ${targetWorker.name} has been dispatched to ${complaintId}.`,
        createdAt: new Date().toISOString(),
        read: false
      }
    ];
    setNotifications((prev) => [...newNotifs, ...prev]);
  };

  const handleWorkerUpdateStatus = (
    complaintId: string,
    status: "In Progress" | "Resolved",
    comment: string,
    photo: string | null
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const finalHistoryEvent = {
            status,
            updatedAt: new Date().toISOString(),
            comment,
            updatedBy: "Field Crew Dispatch Terminal"
          };

          return {
            ...c,
            status,
            history: [...c.history, finalHistoryEvent],
            completionProof:
              status === "Resolved"
                ? {
                    photos: photo ? [photo] : ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
                    completedAt: new Date().toISOString(),
                    comments: comment
                  }
                : c.completionProof
          };
        }
        return c;
      })
    );

    // If Resolved, update worker status back to Available
    if (status === "Resolved") {
      const finishedComplaint = complaints.find((c) => c.id === complaintId);
      if (finishedComplaint?.assignedWorkerId) {
        setWorkers((prev) =>
          prev.map((w) =>
            w.id === finishedComplaint.assignedWorkerId ? { ...w, status: "Available" } : w
          )
        );
      }
    }

    // Push notification alert
    const newNotif: Notification = {
      id: `N-WU-${Date.now()}`,
      role: "Admin",
      title: status === "Resolved" ? "Work Order Completed" : "Repair Work Initiated",
      message: `Incident ${complaintId} has been updated to ${status}. Proof of work archived in logs.`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearPersistence = () => {
    if (window.confirm("Restore platform to default GovTech mock dataset? All custom submissions will clear.")) {
      localStorage.removeItem("ciq_complaints");
      localStorage.removeItem("ciq_workers");
      localStorage.removeItem("ciq_notifications");
      setComplaints(INITIAL_COMPLAINTS);
      setWorkers(INITIAL_WORKERS);
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const inspectedComplaint = complaints.find((c) => c.id === inspectIncidentId);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col text-slate-800 antialiased font-sans">
      
      {/* Top Banner Executive Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        
        {/* Logo and Seal Title */}
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/civic-ai.png"
            alt="CivicIQ Logo"
            className="w-9 h-9 rounded-full shrink-0 object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-display font-bold text-[#1565C0] tracking-tight leading-none">CivicIQ</h1>
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                v1.4 Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Smart Governance Decision Intelligence</p>
          </div>
        </div>

        {/* Outer Workspace Role Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono text-xs">
          <button
            onClick={() => setActiveRole("admin")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              activeRole === "admin"
                ? "bg-white text-gov-blue shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">1. Admin Command</span>
          </button>

          <button
            onClick={() => setActiveRole("citizen")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              activeRole === "citizen"
                ? "bg-white text-gov-blue shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">2. Citizen Mobile</span>
          </button>

          <button
            onClick={() => setActiveRole("worker")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              activeRole === "worker"
                ? "bg-white text-gov-blue shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">3. Field Crew</span>
          </button>

          <button
            onClick={() => setActiveRole("docs")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              activeRole === "docs"
                ? "bg-white text-gov-blue shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">4. Design System</span>
          </button>
        </div>

        {/* Live system clock & notifications hub icon */}
        <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>SYSTEM_TIME: {currentTime || "2026-07-05 09:41 UTC"}</span>
          </div>

          {/* Central Notifications drop trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="p-2 text-slate-500 hover:text-slate-800 relative bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Central Alerts Dispatch"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notification dropdown modal block */}
            {showNotificationCenter && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 text-xs font-mono uppercase">System Alerts Logs</span>
                  <button onClick={markAllNotifsRead} className="text-[10px] text-gov-blue font-bold uppercase hover:underline">
                    Mark Read
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className={`p-2 rounded text-xs space-y-0.5 ${n.read ? "bg-slate-50/70" : "bg-blue-50/50"}`}>
                      <div className="flex justify-between font-mono text-[9px] text-slate-400">
                        <span>{n.role.toUpperCase()} DISPATCH</span>
                        <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <h5 className="font-bold text-slate-800">{n.title}</h5>
                      <p className="text-[10px] text-slate-500 leading-tight">{n.message}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="w-full py-1.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold font-mono uppercase"
                >
                  Close panel
                </button>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Main Container Area with dynamic Workspace renders */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Role Helper Banner */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed max-w-3xl">
            <div className="p-2 bg-gov-blue-light text-gov-blue rounded-lg shrink-0 mt-0.5">
              <Info className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                {activeRole === "admin" && "Administrative Command Center Role Active"}
                {activeRole === "citizen" && "Citizen Portal View Active"}
                {activeRole === "worker" && "Field Crew Technician View Active"}
                {activeRole === "docs" && "Design Token Specification View Active"}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeRole === "admin" && "Authorized personnel ONLY. Triage incoming citizen complaints, dispatch workers, and run budget simulators with high contrast explainable details."}
                {activeRole === "citizen" && "Submit high-fidelity photo or audio complaints, drop exact coordinate anchors, and view pre-submission classification feedback outputs from CivicIQ Agents."}
                {activeRole === "worker" && "Track daily work orders, simulate offline navigation queues, upload visual completion proof, and sync closeout comments with the central console."}
                {activeRole === "docs" && "Inspect exact Figma coordinates, 8px grid tokens, information architectures, WCAG checklists, and orchestration guidelines."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center font-mono text-[10px]">
            <button
              onClick={handleClearPersistence}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:border-red-400 hover:text-red-500 text-slate-400 uppercase font-bold"
            >
              Reset Mock Data
            </button>
          </div>
        </div>

        {/* WORKSPACE RENDER BLOCK */}
        <div className="min-h-[500px]">
          {activeRole === "admin" && (
            <AdminDashboard
              complaints={complaints}
              workers={workers}
              onAssignWorker={handleAssignWorker}
              onUpdateStatus={handleWorkerUpdateStatus}
            />
          )}

          {activeRole === "citizen" && (
            <CitizenApp
              complaints={complaints}
              onSubmitComplaint={handleAddNewComplaint}
              onViewComplaintDetails={(id) => {
                setInspectIncidentId(id);
              }}
            />
          )}

          {activeRole === "worker" && (
            <FieldWorkerApp
              complaints={complaints}
              worker={workers[0] || INITIAL_WORKERS[0]} // Defaults to Marcus Vance
              onUpdateComplaintStatus={handleWorkerUpdateStatus}
            />
          )}

          {activeRole === "docs" && (
            <DesignSystemDocs />
          )}
        </div>

      </main>

      {/* GLOBAL INCIDENT DETAILS INSPECTOR MODAL/DRAWER OVERLAY */}
      {inspectIncidentId && inspectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white border-l border-slate-200 h-full w-full max-w-lg shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Header Title bar */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Incident Audit Ledger: {inspectedComplaint.id}
                  </span>
                  <h4 className="font-display font-semibold text-slate-900 text-base mt-1">
                    {inspectedComplaint.title}
                  </h4>
                </div>
                <button
                  onClick={() => setInspectIncidentId(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Badge rows */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase font-bold">
                  {inspectedComplaint.category}
                </span>
                <span className={`px-2.5 py-1 rounded-full uppercase font-bold border ${
                  inspectedComplaint.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {inspectedComplaint.status}
                </span>
                <span className="text-gov-blue bg-gov-blue-light px-2.5 py-1 rounded font-bold">
                  Priority: {inspectedComplaint.aiAnalysis.priorityScore}/100
                </span>
              </div>

              {/* Citizen Description narrative */}
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Citizen Narrative description:</span>
                <p className="text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  {inspectedComplaint.description}
                </p>
              </div>

              {/* Image Attachments */}
              {inspectedComplaint.images.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Media uploads:</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44">
                    <img
                      src={inspectedComplaint.images[0]}
                      alt="Attachment proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* AI Agent diagnostics panel */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    <span>Explainable AI Diagnostics logs</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Confidence: {Math.round(inspectedComplaint.aiAnalysis.confidence * 100)}%
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-slate-500 block uppercase">Affected Population:</span>
                      <span className="text-white font-bold">{inspectedComplaint.aiAnalysis.populationAffected} citizens</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase">Threat Severity:</span>
                      <span className="text-white font-bold">{inspectedComplaint.aiAnalysis.severity}</span>
                    </div>
                  </div>

                  <div className="text-[11px] leading-relaxed">
                    <span className="text-slate-500 block uppercase text-[9px] mb-0.5 font-bold">Reasoning Chain logic:</span>
                    <p className="text-slate-300 font-sans italic">"{inspectedComplaint.aiAnalysis.reasoning}"</p>
                  </div>

                  {/* Future risk graph simulation */}
                  <div className="border-t border-slate-800 pt-2 text-[10px]">
                    <span className="text-slate-500 block uppercase text-[9px] mb-1 font-bold">Predictive future risk index (If unrepaired):</span>
                    
                    {/* Tiny visual SVG sparkline indicating exponential threat growth */}
                    <div className="h-10 bg-slate-950 rounded border border-slate-800 flex items-center justify-between px-3 relative overflow-hidden">
                      <span className="absolute left-2 top-1 text-[8px] text-slate-500">24h Delay Risk Curve</span>
                      <svg className="w-full h-full" viewBox="0 0 300 40">
                        {/* Exponential line */}
                        <path d="M 0,35 Q 100,32 180,24 T 300,5" fill="none" stroke="#EF4444" strokeWidth="2" />
                        <circle cx="300" cy="5" r="3" fill="#EF4444" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit timelines */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Audit Lifecycle Trail:</span>
                <div className="space-y-3 font-mono text-[10px] text-slate-600 pl-1">
                  {inspectedComplaint.history.map((h, idx) => (
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

              {/* Completion logs if resolved */}
              {inspectedComplaint.completionProof && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2.5">
                  <div className="font-mono text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>Completion Proof Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans italic leading-relaxed">
                    "{inspectedComplaint.completionProof.comments}"
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Completed At: {new Date(inspectedComplaint.completionProof.completedAt).toLocaleDateString()} 
                  </span>
                </div>
              )}

            </div>

            <button
              onClick={() => setInspectIncidentId(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors font-mono uppercase mt-4"
            >
              Exit Inspector Ledger
            </button>
          </div>
        </div>
      )}

      {/* Civic Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-auto text-center space-y-2 font-mono text-[10px] text-slate-400 uppercase font-bold tracking-wider">
        <div>MUNICIPALITY OF METRO SECTOR • NATIONAL SMART CITY ALLIANCE</div>
        <div className="font-normal text-slate-300">
          This system complies fully with US Federal (WDS), EU Digital Single Market, and ISO-37120 standards.
        </div>
      </footer>

    </div>
  );
}
