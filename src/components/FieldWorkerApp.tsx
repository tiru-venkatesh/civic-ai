/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  MapPin,
  CheckCircle,
  FileText,
  Clock,
  ArrowLeft,
  X,
  Camera,
  Navigation,
  AlertTriangle,
  Wifi,
  WifiOff,
  CornerUpRight,
  MessageSquare
} from "lucide-react";
import { Complaint, FieldWorker } from "../types";

interface FieldWorkerAppProps {
  complaints: Complaint[];
  worker: FieldWorker;
  onUpdateComplaintStatus: (id: string, status: "In Progress" | "Resolved", comment: string, photo: string | null) => void;
}

const REPAIR_SAMPLES = [
  { name: "Pavement Poured & Leveled", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80" },
  { name: "Pressure Main Valve Sealed", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80" },
  { name: "Electronics Replaced & Cover Capped", url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80" }
];

function severityAccent(severity: string) {
  if (severity === "Critical") return { bar: "border-l-red-600", chip: "bg-red-50 text-red-700 border-red-200" };
  if (severity === "High") return { bar: "border-l-orange-500", chip: "bg-orange-50 text-orange-700 border-orange-200" };
  if (severity === "Medium") return { bar: "border-l-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" };
  return { bar: "border-l-slate-400", chip: "bg-slate-100 text-slate-600 border-slate-200" };
}

export default function FieldWorkerApp({
  complaints,
  worker,
  onUpdateComplaintStatus,
}: FieldWorkerAppProps) {
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"tasks" | "navigation" | "proof">("tasks");
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);

  const [proofComment, setProofComment] = useState("");
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  const myTasks = complaints.filter(
    (c) => c.assignedWorkerId === worker.id && c.status !== "Resolved"
  );

  const myCompletedTasks = complaints.filter(
    (c) => c.assignedWorkerId === worker.id && c.status === "Resolved"
  );

  const handleTaskClick = (task: Complaint) => {
    setSelectedTask(task);
    setActiveTab("navigation");
  };

  const handleStartTask = () => {
    if (!selectedTask) return;
    if (offlineMode) {
      setOfflineSyncQueue(prev => [...prev, { id: selectedTask.id, action: "In Progress", comment: "Task started offline." }]);
      selectedTask.status = "In Progress";
    } else {
      onUpdateComplaintStatus(selectedTask.id, "In Progress", "Worker is on-site and has started active repairs.", null);
    }
  };

  const handleMarkResolved = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setProofLoading(true);
    setTimeout(() => {
      const finalPhoto = proofPhoto || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80";
      const finalComment = proofComment || "Physical infrastructure cleared, secured, and fully tested.";

      if (offlineMode) {
        setOfflineSyncQueue(prev => [...prev, {
          id: selectedTask.id,
          action: "Resolved",
          comment: finalComment,
          photo: finalPhoto
        }]);
        selectedTask.status = "Resolved";
      } else {
        onUpdateComplaintStatus(selectedTask.id, "Resolved", finalComment, finalPhoto);
      }

      setProofLoading(false);
      setProofComment("");
      setProofPhoto(null);
      setSelectedTask(null);
      setActiveTab("tasks");
    }, 1200);
  };

  const triggerOfflineSync = () => {
    if (offlineSyncQueue.length === 0) return;

    offlineSyncQueue.forEach(item => {
      onUpdateComplaintStatus(item.id, item.action, item.comment, item.photo || null);
    });

    setOfflineSyncQueue([]);
    alert("Offline Sync Complete! Transferred all queue cache packets to Admin.");
  };

  return (
    <div className="flex justify-center py-4 bg-slate-100">
      {/* Smartphone Physical Shell Frame */}
      <div className="w-[390px] h-[812px] bg-white rounded-[44px] shadow-2xl border-[11px] border-slate-900 overflow-hidden relative flex flex-col font-sans select-none">

        {/* Device Notch Header */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-[22px] bg-slate-900 rounded-b-2xl z-30 flex items-center justify-between px-6">
          <span className="w-3.5 h-3.5 bg-slate-800 rounded-full"></span>
          <span className="w-10 h-1 bg-slate-800 rounded-full"></span>
        </div>

        {/* Dynamic Status Bar */}
        <div className="bg-white px-6 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-700 z-20 shrink-0 font-mono">
          <span>10:24</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase bg-slate-200 px-1 py-0.2 rounded font-bold">LTE</span>
            <span className="flex items-center gap-0.5 text-slate-600">
              {offlineMode ? <WifiOff className="h-3 w-3 text-red-500" /> : <Wifi className="h-3 w-3 text-emerald-500" />}
              <span>{offlineMode ? "OFF" : "ON"}</span>
            </span>
            <span className="w-4 h-2.5 bg-slate-800 rounded-sm inline-block relative border border-slate-700">
              <span className="absolute right-0.5 top-0.5 w-1 h-1 bg-white"></span>
            </span>
          </div>
        </div>

        {/* Internal Screen Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">

          {/* Header Worker Profile Info — now console-dark to match admin/citizen intake */}
          <div className="bg-slate-900 p-4 sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700">
                <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold">{worker.role}</span>
                <h4 className="text-sm font-bold text-white leading-tight block">{worker.name}</h4>
              </div>
            </div>

            {/* Offline Mode Switch */}
            <button
              onClick={() => {
                if (offlineMode) {
                  setOfflineMode(false);
                  triggerOfflineSync();
                } else {
                  setOfflineMode(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                offlineMode
                  ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {offlineMode ? (
                <>
                  <WifiOff className="h-3.5 w-3.5 animate-pulse" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Go Offline</span>
                </>
              )}
            </button>
          </div>

          {/* Offline Warning Banner */}
          {offlineMode && (
            <div className="bg-red-50 border-b border-red-100 p-2 text-center text-[10px] font-mono text-red-700 flex items-center justify-center gap-1.5 shrink-0">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span>OFFLINE: {offlineSyncQueue.length} jobs cached in queue</span>
            </div>
          )}

          {/* SCREEN: MAIN TASK WORKFLOW LIST */}
          {activeTab === "tasks" && (
            <div className="flex-1 p-4 space-y-4">

              {/* Task Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider">
                    Active Dispatches
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-white bg-gov-blue px-2 py-0.5 rounded-full">
                    {myTasks.length}
                  </span>
                </div>

                {myTasks.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                    <CheckCircle className="h-10 w-10 mx-auto text-emerald-400 mb-2" />
                    <h5 className="font-bold text-xs text-slate-700">Clear Ledger!</h5>
                    <p className="text-[10px] text-slate-400 mt-1">All assigned road assets fully repaired.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myTasks.map((t) => {
                      const accent = severityAccent(t.aiAnalysis.severity);
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleTaskClick(t)}
                          className={`bg-white border-y border-r border-slate-200 border-l-[4px] ${accent.bar} rounded-r-xl p-3.5 hover:shadow-md cursor-pointer transition-all space-y-2.5 shadow-sm`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                              {t.id} • PRIORITY {t.aiAnalysis.priorityScore}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase border ${accent.chip}`}>
                              {t.status}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 leading-tight">
                            {t.title}
                          </h5>

                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                            {t.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[170px]">{t.address}</span>
                            </span>
                            <span className="text-gov-blue font-bold flex items-center gap-1 uppercase text-[9px]">
                              <span>Open</span>
                              <CornerUpRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* History section for completed jobs today */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider">
                  Resolved Today ({myCompletedTasks.length})
                </h4>
                {myCompletedTasks.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 opacity-70 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-400">{t.id}</span>
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{t.title}</h5>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">
                      Done
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: DETAILED NAV & JOB INSTRUCTIONS */}
          {activeTab === "navigation" && selectedTask && (
            <div className="flex-1 flex flex-col bg-slate-50">
              <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => { setSelectedTask(null); setActiveTab("tasks"); }} className="p-1 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h4 className="text-xs font-bold font-mono uppercase text-slate-800">Mission Anchor: {selectedTask.id}</h4>
                <div></div>
              </div>

              {/* Directions Header block */}
              <div className="bg-slate-900 text-white p-4 font-mono text-xs space-y-2 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[9px]">Route:</span>
                  <p className="text-white font-bold text-sm">Turn right onto Broadway (250m)</p>
                  <p className="text-blue-400 text-[10px]">Destination: {selectedTask.address}</p>
                </div>
                <div className="p-3 bg-blue-600 rounded-full text-white animate-pulse">
                  <Navigation className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Simulated Street Map Segment with GPS Route */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Navigation Route:</span>

                  <div className="relative h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 112">
                      <line x1="0" y1="56" x2="300" y2="56" stroke="#94A3B8" strokeWidth="12" />
                      <line x1="150" y1="0" x2="150" y2="112" stroke="#94A3B8" strokeWidth="12" />
                      <path d="M 150,112 L 150,56 L 300,56" fill="none" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="150" cy="90" r="5" fill="#3B82F6" />
                      <circle cx="260" cy="56" r="6" fill="#EF4444" />
                      <circle cx="260" cy="56" r="14" fill="none" stroke="#EF4444" strokeWidth="1" className="animate-ping" />
                    </svg>
                    <span className="absolute bottom-2 left-2 bg-white px-2 py-0.5 rounded text-[9px] border border-slate-200 text-slate-500 font-mono">
                      Distance: 0.3 miles • ETA: 3 min
                    </span>
                  </div>
                </div>

                {/* Task Details Info box */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Work Order Title:</span>
                    <h5 className="text-xs font-bold text-slate-800">{selectedTask.title}</h5>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Issue Summary:</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans mt-0.5">{selectedTask.description}</p>
                  </div>

                  {selectedTask.voiceTranscript && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Transcription logs:</span>
                      <p className="text-[10px] text-slate-600 italic font-sans mt-0.5">"{selectedTask.voiceTranscript}"</p>
                    </div>
                  )}

                  {selectedTask.status === "Assigned" ? (
                    <button
                      onClick={handleStartTask}
                      className="w-full py-3 bg-gov-blue hover:bg-gov-blue-hover text-white font-bold text-xs rounded-xl transition-all shadow"
                    >
                      Start Repairs (Mark In-Progress)
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab("proof")}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow"
                    >
                      Resolve Job (Submit Completion Proof)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: PROOF OF WORK RESOLUTION SUBMIT */}
          {activeTab === "proof" && selectedTask && (
            <div className="flex-1 flex flex-col bg-slate-50">
              <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => setActiveTab("navigation")} className="p-1 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h4 className="text-xs font-bold font-mono uppercase text-slate-800">Completion Verification</h4>
                <div></div>
              </div>

              <form onSubmit={handleMarkResolved} className="flex-1 p-5 space-y-4">
                {/* Photo proof block */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">1. Photo Verification:</span>

                  <div className="grid grid-cols-3 gap-2">
                    {REPAIR_SAMPLES.map((r, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProofPhoto(r.url)}
                        className={`border rounded-lg overflow-hidden text-left bg-slate-50 transition-all ${
                          proofPhoto === r.url ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
                        }`}
                      >
                        <img src={r.url} alt={r.name} className="w-full h-10 object-cover opacity-80" />
                        <span className="p-1 text-[8px] font-bold text-slate-600 block truncate">{r.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center cursor-pointer hover:border-gov-blue">
                    <Camera className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Simulate Camera Snap</span>
                  </div>
                </div>

                {/* Audit comments block */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3.5 shadow-sm text-xs">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">2. Closeout logs:</span>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Closeout Comments</label>
                    <textarea
                      value={proofComment}
                      onChange={(e) => setProofComment(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs resize-none"
                      placeholder="e.g., Leaking pipe section cut out. Sealed with 120-grade high pressure main collar. Tested safe at 80 PSI."
                      required
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={proofLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
                >
                  {proofLoading ? (
                    <span>Encrypting Log File...</span>
                  ) : (
                    <>
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Transmit Completion Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Device Bottom Bar Handle indicator */}
        <div className="bg-white py-2 flex justify-center shrink-0 z-30">
          <span className="w-32 h-1 bg-slate-300 rounded-full"></span>
        </div>

      </div>
    </div>
  );
}