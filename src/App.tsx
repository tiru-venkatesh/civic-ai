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
  Plus,
  Home,
  Lock,
  Key
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
import LandingPage from "./components/LandingPage";
import AdminLogin from "./components/AdminLogin";
import AIChatbot from "./components/AIChatbot";

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
  // "landing" | "admin" | "citizen" | "worker" | "docs"
  const [activeRole, setActiveRole] = useState<"landing" | "admin" | "citizen" | "worker" | "docs">("landing");

  // Localized clock state
  const [currentTime, setCurrentTime] = useState("");

  // Notification center visible flag
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Selected complaint ID for the global detail sidebar overlay
  const [inspectIncidentId, setInspectIncidentId] = useState<string | null>(null);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("ciq_admin_auth") === "true";
  });

  // Sync state with local storage on edits
  useEffect(() => {
    sessionStorage.setItem("ciq_admin_auth", String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

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

  if (activeRole === "landing") {
    return <LandingPage onSelectRole={setActiveRole} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 z-30 justify-between">
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveRole("landing")}>
            <img
              src="/src/assets/images/civiciq_logo_1783246559258.jpg"
              alt="CIVIC-AI Logo"
              className="w-9 h-9 rounded-full shrink-0 object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-display font-bold text-[#1565C0] tracking-tight leading-none">CIVIC-AI</h1>
                <span className="text-[8px] uppercase font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded">
                  v1.4
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Smart Governance Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveRole("landing")}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
                activeRole === "landing"
                  ? "bg-blue-50 text-[#1565C0] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Portal Home</span>
            </button>

            <button
              onClick={() => setActiveRole("admin")}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
                activeRole === "admin"
                  ? "bg-blue-50 text-[#1565C0] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>1. Admin Command</span>
            </button>

            <button
              onClick={() => setActiveRole("citizen")}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
                activeRole === "citizen"
                  ? "bg-blue-50 text-[#1565C0] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>2. Citizen Dashboard</span>
            </button>

            <button
              onClick={() => setActiveRole("worker")}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
                activeRole === "worker"
                  ? "bg-blue-50 text-[#1565C0] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>3. Field Crew Dashboard</span>
            </button>

            <button
              onClick={() => setActiveRole("docs")}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
                activeRole === "docs"
                  ? "bg-blue-50 text-[#1565C0] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>4. Design System</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 font-mono text-[11px] text-slate-500">
          {/* Clock */}
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] truncate">{currentTime || "2026-07-05 09:41 UTC"}</span>
          </div>

          {/* Central Notifications Widget */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="w-full flex items-center justify-between p-2 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              title="Central Alerts Dispatch"
            >
              <span className="flex items-center gap-1.5 font-bold uppercase text-[9px]">
                <Bell className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Alerts Logs</span>
              </span>
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-bold">
                  {unreadCount}
                </span>
              ) : (
                <span className="text-slate-300">●</span>
              )}
            </button>

            {/* Notification drop block inside sidebar */}
            {showNotificationCenter && (
              <div className="absolute bottom-11 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-3 space-y-2 font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 text-[10px] font-mono uppercase">System Alerts</span>
                  <button onClick={markAllNotifsRead} className="text-[9px] text-[#1565C0] font-bold uppercase hover:underline">
                    Mark Read
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className={`p-1.5 rounded text-[10px] space-y-0.5 ${n.read ? "bg-slate-50" : "bg-blue-50/50"}`}>
                      <div className="flex justify-between font-mono text-[8px] text-slate-400">
                        <span>{n.role.toUpperCase()}</span>
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h5 className="font-bold text-slate-800 truncate">{n.title}</h5>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="w-full py-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-bold font-mono uppercase"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={handleClearPersistence}
            className="w-full py-1.5 bg-white border border-slate-200 rounded text-[9px] text-slate-400 uppercase font-bold hover:border-red-400 hover:text-red-500 hover:bg-red-50/30 transition-all text-center"
          >
            Reset Mock Data
          </button>
        </div>
      </aside>

      {/* TOP BAR FOR MOBILE DEVICES */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex flex-col gap-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveRole("landing")}>
            <img
              src="/src/assets/images/civiciq_logo_1783246559258.jpg"
              alt="CIVIC-AI Logo"
              className="w-7 h-7 rounded-full shrink-0 object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-sm font-display font-bold text-[#1565C0] tracking-tight">CIVIC-AI</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="p-1.5 text-slate-500 hover:text-slate-800 relative bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
            </button>
            <button
              onClick={handleClearPersistence}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] text-slate-500 uppercase font-bold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Horizontal Navigation tabs on Mobile */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono text-[10px] overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveRole("landing")}
            className={`px-2 py-1 rounded font-bold transition-all shrink-0 ${
              activeRole === "landing" ? "bg-white text-[#1565C0] shadow-xs" : "text-slate-600"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveRole("admin")}
            className={`px-2 py-1 rounded font-bold transition-all shrink-0 ${
              activeRole === "admin" ? "bg-white text-[#1565C0] shadow-xs" : "text-slate-600"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveRole("citizen")}
            className={`px-2 py-1 rounded font-bold transition-all shrink-0 ${
              activeRole === "citizen" ? "bg-white text-[#1565C0] shadow-xs" : "text-slate-600"
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => setActiveRole("worker")}
            className={`px-2 py-1 rounded font-bold transition-all shrink-0 ${
              activeRole === "worker" ? "bg-white text-[#1565C0] shadow-xs" : "text-slate-600"
            }`}
          >
            Crew
          </button>
          <button
            onClick={() => setActiveRole("docs")}
            className={`px-2 py-1 rounded font-bold transition-all shrink-0 ${
              activeRole === "docs" ? "bg-white text-[#1565C0] shadow-xs" : "text-slate-600"
            }`}
          >
            Docs
          </button>
        </div>

        {/* Mobile alerts dropdown overlay */}
        {showNotificationCenter && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 mt-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-800 text-[10px] font-mono uppercase">System Alerts Log</span>
              <button onClick={markAllNotifsRead} className="text-[9px] text-[#1565C0] font-bold uppercase hover:underline">
                Mark Read
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className={`p-1.5 rounded text-[10px] space-y-0.5 ${n.read ? "bg-slate-50" : "bg-blue-50/50"}`}>
                  <p className="text-[10px] text-slate-700 font-medium">{n.title}: {n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Frame container next to Sidebar */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <main className="flex-1 p-4 md:p-6 space-y-6">
          
          {/* Role Helper Banner */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed max-w-3xl">
              <div className="p-2 bg-gov-blue-light text-[#1565C0] rounded-lg shrink-0 mt-0.5">
                <Info className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {activeRole === "admin" && (isAdminAuthenticated ? "Administrative Command Center Active" : "Administrative Login Verification")}
                  {activeRole === "citizen" && "Citizen Portal Dashboard Active"}
                  {activeRole === "worker" && "Field Crew Technician Dashboard Active"}
                  {activeRole === "docs" && "Design Token Specification View Active"}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeRole === "admin" && (isAdminAuthenticated ? "Authorized personnel ONLY. Triage incoming citizen complaints, dispatch workers, and run budget simulators with high contrast explainable details." : "Identify verification required. Please input your official employee ID and access passcode sequence.")}
                  {activeRole === "citizen" && "Submit high-fidelity photo or audio complaints, drop exact coordinate anchors, and view pre-submission classification feedback outputs from CivicIQ Agents."}
                  {activeRole === "worker" && "Track daily work orders, simulate offline navigation queues, upload visual completion proof, and sync closeout comments with the central console."}
                  {activeRole === "docs" && "Inspect exact Figma coordinates, 8px grid tokens, information architectures, WCAG checklists, and orchestration guidelines."}
                </p>
              </div>
            </div>

            {activeRole === "admin" && isAdminAuthenticated && (
              <button
                onClick={() => setIsAdminAuthenticated(false)}
                className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-end md:self-center"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Lock Console</span>
              </button>
            )}
          </div>

          {/* WORKSPACE RENDER BLOCK */}
          <div className="min-h-[500px]">
            {activeRole === "admin" && (
              isAdminAuthenticated ? (
                <AdminDashboard
                  complaints={complaints}
                  workers={workers}
                  onAssignWorker={handleAssignWorker}
                  onUpdateStatus={handleWorkerUpdateStatus}
                />
              ) : (
                <AdminLogin
                  onLoginSuccess={() => setIsAdminAuthenticated(true)}
                  onBackToHome={() => setActiveRole("landing")}
                />
              )
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

      {/* Floating Global AI Support Copilot */}
      <AIChatbot mode="floating" activeRole={activeRole} />

    </div>
  );
}
