/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  MapPin,
  Mic,
  Camera,
  CheckCircle,
  FileText,
  User,
  Settings as SettingsIcon,
  Bell,
  Clock,
  ChevronRight,
  ArrowLeft,
  X,
  Volume2,
  Lock,
  UploadCloud,
  ChevronDown
} from "lucide-react";
import { Complaint, AIAnalysis } from "../types";
import SmartCityMap from "./SmartCityMap";

// Predefined photo templates for quick click-to-upload simulation
const SAMPLE_PHOTOS = [
  {
    name: "Severe Road Cracking",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80",
    category: "Pothole & Road Damage",
    severity: "Critical",
    classification: "Active Structural Asphalt Faulting",
    confidence: 0.97,
    reasoning: "Deep fissure visible with high potential for full sub-grade cave-in. Proximity to dense traffic lanes increases hazard multiplier.",
    budget: 3200,
    hours: 4,
    priority: 94
  },
  {
    name: "Burst Sidewalk Main Pipe",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    category: "Water Leakage & Flooding",
    severity: "High",
    classification: "Sub-surface Pavement Lift & Flood",
    confidence: 0.93,
    reasoning: "Significant water flow under pressure lifting sidewalk paving flags. Elevates immediate pedestrian safety risk and localized utility dropouts.",
    budget: 7400,
    hours: 8,
    priority: 89
  },
  {
    name: "Exposed Electrical Cabling",
    url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80",
    category: "Streetlight Failure",
    severity: "High",
    classification: "Raw Grid Connection Terminal Leak",
    confidence: 0.91,
    reasoning: "Damaged post cover plate has exposed structural power connectors on damp soil. Poses immediate electrical contact threat.",
    budget: 750,
    hours: 2,
    priority: 85
  }
];

interface CitizenAppProps {
  complaints: Complaint[];
  onSubmitComplaint: (newComplaint: Complaint) => void;
  onViewComplaintDetails: (id: string) => void;
}

export default function CitizenApp({
  complaints,
  onSubmitComplaint,
  onViewComplaintDetails,
}: CitizenAppProps) {
  // Mobile app screens navigation
  // "splash" | "login" | "signup" | "home" | "submit" | "confirm" | "history" | "profile" | "settings"
  const [screen, setScreen] = useState<
    "splash" | "login" | "signup" | "home" | "submit" | "confirm" | "history" | "profile" | "settings"
  >("splash");

  // User auth state
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Voice recording mock state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceWave, setVoiceWave] = useState<number[]>([]);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // New report form state
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<typeof SAMPLE_PHOTOS[0] | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressText, setAddressText] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);

  // Dynamic AI evaluation state
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysisPreview, setAiAnalysisPreview] = useState<AIAnalysis | null>(null);

  // Finished Ticket Receipt ID
  const [lastSubmittedId, setLastSubmittedId] = useState("");

  // Simulated GPS auto-fetch
  const handleAutoGPS = () => {
    setIsAIAnalyzing(true);
    setTimeout(() => {
      setGpsLocation({ lat: 40.7262, lng: -73.9981 });
      setAddressText("640 Broadway, New York, NY 10012");
      setIsAIAnalyzing(false);
      triggerAIEvaluation(reportTitle, reportDesc, selectedPhoto, { lat: 40.7262, lng: -73.9981 });
    }, 800);
  };

  const handleManualMapClick = (lat: number, lng: number) => {
    setGpsLocation({ lat, lng });
    // Approximate an address for realism
    const mockAddress = `Sector-${Math.floor(lat * 100) % 10} Address near (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setAddressText(mockAddress);
    triggerAIEvaluation(reportTitle, reportDesc, selectedPhoto, { lat, lng });
  };

  // Simulate Voice Dictation
  const handleToggleVoice = () => {
    if (isRecording) {
      clearInterval(recordingTimer.current!);
      setIsRecording(false);
      setVoiceTranscript("Water is bubbling up in volume near the pedestrian pavement line.");
      setReportDesc(prev => prev ? prev + " Water is bubbling up in volume near the pedestrian pavement line." : "Water is bubbling up in volume near the pedestrian pavement line.");
      triggerAIEvaluation(reportTitle, "Water is bubbling up in volume near the pedestrian pavement line.", selectedPhoto, gpsLocation);
    } else {
      setIsRecording(true);
      let count = 0;
      recordingTimer.current = setInterval(() => {
        setVoiceWave(Array.from({ length: 15 }, () => Math.floor(Math.random() * 40) + 5));
        count++;
        if (count > 25) {
          clearInterval(recordingTimer.current!);
          setIsRecording(false);
          setVoiceTranscript("Water is bubbling up in volume near the pedestrian pavement line.");
          setReportDesc(prev => prev ? prev + " Water is bubbling up in volume near the pedestrian pavement line." : "Water is bubbling up in volume near the pedestrian pavement line.");
          triggerAIEvaluation(reportTitle, "Water is bubbling up in volume near the pedestrian pavement line.", selectedPhoto, gpsLocation);
        }
      }, 150);
    }
  };

  // Instant AI feedback simulation
  const triggerAIEvaluation = (
    title: string,
    desc: string,
    photo: typeof SAMPLE_PHOTOS[0] | null,
    gps: { lat: number; lng: number } | null
  ) => {
    if (!desc && !photo) {
      setAiAnalysisPreview(null);
      return;
    }
    setIsAIAnalyzing(true);
    setTimeout(() => {
      if (photo) {
        // If they chose a sample photo, inherit its high-fidelity analysis
        setAiAnalysisPreview({
          classification: photo.classification,
          category: photo.category,
          confidence: photo.confidence,
          reasoning: photo.reasoning,
          severity: photo.severity as any,
          populationAffected: gps ? Math.floor(Math.random() * 800) + 400 : 120,
          delayImpactScore: Math.floor(Math.random() * 30) + 60,
          budgetRequired: photo.budget,
          timeToRepairHours: photo.hours,
          priorityScore: photo.priority,
          isDuplicate: false,
          duplicateGroup: null
        });
      } else {
        // Default generic NLP categorization
        const hasWater = desc.toLowerCase().includes("water") || desc.toLowerCase().includes("leak") || desc.toLowerCase().includes("flood");
        const hasTraffic = desc.toLowerCase().includes("traffic") || desc.toLowerCase().includes("light") || desc.toLowerCase().includes("signal");
        const hasRoad = desc.toLowerCase().includes("pothole") || desc.toLowerCase().includes("asphalt") || desc.toLowerCase().includes("sinkhole") || desc.toLowerCase().includes("crack");

        let category = "Waste & Sanitation Overflow";
        let classification = "General Municipal Refuse Incident";
        let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
        let priority = 55;

        if (hasWater) {
          category = "Water Leakage & Flooding";
          classification = "Sewer System Spillover / Fluid Main Fault";
          severity = "High";
          priority = 84;
        } else if (hasTraffic) {
          category = "Traffic Light Malfunction";
          classification = "Electrical Grid Signal Controller Failure";
          severity = "Critical";
          priority = 91;
        } else if (hasRoad) {
          category = "Pothole & Road Damage";
          classification = "Eroded Sub-grade Asphalt Crack";
          severity = "High";
          priority = 81;
        }

        setAiAnalysisPreview({
          classification,
          category,
          confidence: 0.88,
          reasoning: `NLP Classifier detected keywords indicating '${category}'. Dynamic coordinates mapping indicates standard population sector.`,
          severity,
          populationAffected: 340,
          delayImpactScore: 42,
          budgetRequired: 1400,
          timeToRepairHours: 3,
          priorityScore: priority,
          isDuplicate: false,
          duplicateGroup: null
        });
      }
      setIsAIAnalyzing(false);
    }, 400);
  };

  const handleSelectSamplePhoto = (p: typeof SAMPLE_PHOTOS[0]) => {
    setSelectedPhoto(p);
    setReportTitle(p.name);
    setReportDesc(p.name + " reported in central business corridor. High threat to public traffic.");
    triggerAIEvaluation(p.name, p.name + " reported", p, gpsLocation);
  };

  // Submit complete complaint
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalLat = gpsLocation?.lat || 40.7185;
    const finalLng = gpsLocation?.lng || -73.9985;
    const finalAddress = addressText || "Greenwich St, New York, NY 10013";

    const finalAnalysis: AIAnalysis = aiAnalysisPreview || {
      classification: "Standard Sidewalk Disrepair",
      category: "Pothole & Road Damage",
      confidence: 0.85,
      reasoning: "Assigned default municipal profile based on citizen text description parameters.",
      severity: "Medium",
      populationAffected: 150,
      delayImpactScore: 10,
      budgetRequired: 600,
      timeToRepairHours: 2,
      priorityScore: 64,
      isDuplicate: false,
      duplicateGroup: null
    };

    const newTicketId = `CIQ-2026-0${Math.floor(Math.random() * 900) + 100}`;

    const newComplaint: Complaint = {
      id: newTicketId,
      title: reportTitle || "Public Hazard Incident Report",
      description: reportDesc || "Reported via citizen mobile terminal with GPS coordinate markers.",
      category: finalAnalysis.category,
      status: "Pending",
      latitude: finalLat,
      longitude: finalLng,
      address: finalAddress,
      reportedBy: user?.name || "Sarah Jenkins (Local Business Owner)",
      reportedAt: new Date().toISOString(),
      images: selectedPhoto ? [selectedPhoto.url] : [customPhotoUrl || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
      voiceTranscript,
      aiAnalysis: finalAnalysis,
      assignedWorkerId: null,
      history: [
        {
          status: "Pending",
          updatedAt: new Date().toISOString(),
          comment: "Citizen submitted report with automated system pre-classification markers.",
          updatedBy: "System"
        }
      ],
      completionProof: null
    };

    onSubmitComplaint(newComplaint);
    setLastSubmittedId(newTicketId);
    setScreen("confirm");

    // Clear form state
    setReportTitle("");
    setReportDesc("");
    setSelectedPhoto(null);
    setGpsLocation(null);
    setAddressText("");
    setVoiceTranscript(null);
    setAiAnalysisPreview(null);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans min-h-[700px]">
      
      {/* Internal Screen Workspace */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
          
          {/* SCREEN: SPLASH */}
          {screen === "splash" && (
            <div className="flex-1 flex flex-col items-center justify-between p-8 bg-white text-center">
              <div></div>
              <div className="flex flex-col items-center">
                {/* Official Circular Seal Logo */}
                <img
                  src="/civiciq-logo.jpg"
                  alt="CivicIQ Seal Logo"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gov-blue shadow-sm mb-4"
                  referrerPolicy="no-referrer"
                />
                <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">CivicIQ</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold font-mono mt-1">Smart Citizen Portal</p>
                <div className="w-8 h-1 bg-gov-blue rounded-full mt-4"></div>
              </div>

              <div className="w-full space-y-3">
                <p className="text-[10px] text-slate-400 font-medium">
                  Connecting Citizens and Smart Infrastructure via Decision Intelligence
                </p>
                <button
                  onClick={() => setScreen("login")}
                  className="w-full py-3 bg-gov-blue hover:bg-gov-blue-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Authenticate Portal Key</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  MUNICIPALITY OF METRO SECTOR
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: LOGIN */}
          {screen === "login" && (
            <div className="flex-1 flex flex-col p-6 justify-between bg-white">
              <div className="space-y-6">
                <button onClick={() => setScreen("splash")} className="p-1 text-slate-500 hover:text-slate-800 inline-block self-start">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Secure Authentication</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter your municipal credentials to access report logs.</p>
                </div>

                <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); setUser({ name: "Sarah Jenkins", email: emailInput }); setScreen("home"); }}>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Civic Account Email</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:border-gov-blue focus:bg-white"
                      placeholder="citizen@metro.gov"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block flex justify-between">
                      <span>Passcode / Portal PIN</span>
                      <span className="text-gov-blue text-[10px] cursor-pointer">Forgot PIN?</span>
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:border-gov-blue focus:bg-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gov-blue hover:bg-gov-blue-hover text-white font-semibold rounded-xl mt-2 transition-all shadow-sm"
                  >
                    Authenticate Securely
                  </button>
                </form>

                <div className="relative flex py-2 items-center text-[10px] text-slate-400 font-mono">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 uppercase">Secure Shield</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  onClick={() => { setUser({ name: "Guest Citizen", email: "guest@ciq.local" }); setScreen("home"); }}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold rounded-xl transition-all text-xs"
                >
                  Log In with Temporary Biometrics
                </button>
              </div>

              <div className="text-[10px] text-center text-slate-400 font-mono flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-300" />
                <span>AES-256 Municipal Cryptography Enforced</span>
              </div>
            </div>
          )}

          {/* SCREEN: HOME */}
          {screen === "home" && (
            <div className="flex-1 flex flex-col">
              {/* Home Header */}
              <div className="bg-white p-5 border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Logged In Citizen</span>
                    <span className="text-sm font-bold text-slate-800 leading-tight block">{user?.name || "Sarah Jenkins"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-400 hover:text-slate-700 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button onClick={() => setScreen("settings")} className="p-2 text-slate-400 hover:text-slate-700">
                    <SettingsIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Home Main Scrollable */}
              <div className="flex-1 p-5 space-y-5">
                {/* Primary CTA: File Report */}
                <div className="bg-gov-blue text-white rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg">Report Infrastructure Hazard</h3>
                    <p className="text-xs text-blue-100 mt-1">Submit visual or audio proof. CivicIQ AI will instantly parse, prioritize, and trigger technician dispatch.</p>
                  </div>
                  <button
                    onClick={() => setScreen("submit")}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-gov-blue font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="h-4.5 w-4.5" />
                    <span>Initiate AI Dispatch Intake</span>
                  </button>
                </div>

                {/* Submissions Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-500">Your Active Trackers</h4>
                    <button onClick={() => setScreen("history")} className="text-xs text-gov-blue font-semibold flex items-center gap-0.5">
                      <span>See All ({complaints.length})</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400">
                      <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs">No active reports filed under your token.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.slice(0, 3).map((c) => {
                        let statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                        if (c.status === "Resolved") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        else if (c.status === "In Progress") statusColor = "bg-blue-50 text-blue-700 border-blue-200";

                        return (
                          <div
                            key={c.id}
                            onClick={() => onViewComplaintDetails(c.id)}
                            className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-gov-blue cursor-pointer transition-colors space-y-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono block uppercase">{c.id}</span>
                                <h5 className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">{c.title}</h5>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase border ${statusColor}`}>
                                {c.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {c.description}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="line-clamp-1 max-w-[140px]">{c.address}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-300" />
                                <span>{new Date(c.reportedAt).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Info Card banner */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3.5 items-start">
                  <div className="p-2 bg-gov-blue-light text-gov-blue rounded-lg shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">Direct Citizen Empowerment</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      CivicIQ ensures fully audit-transparent resolution queues. Watch real-time GPS locations of worker teams once dispatched.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Mock Tab Bar */}
              <div className="mt-auto bg-white border-t border-slate-200 py-3 px-6 flex items-center justify-between z-10 sticky bottom-0">
                <button onClick={() => setScreen("home")} className="flex flex-col items-center gap-1 text-gov-blue font-bold">
                  <FileText className="h-5 w-5" />
                  <span className="text-[9px] tracking-wide">Portal</span>
                </button>
                <button onClick={() => setScreen("history")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700">
                  <Clock className="h-5 w-5" />
                  <span className="text-[9px] tracking-wide">History</span>
                </button>
                <button onClick={() => setScreen("profile")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700">
                  <User className="h-5 w-5" />
                  <span className="text-[9px] tracking-wide">Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: SUBMIT COMPLAINT FORM */}
          {screen === "submit" && (
            <div className="flex-1 flex flex-col bg-slate-50">
              <div className="bg-white p-4 border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => setScreen("home")} className="p-1 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">Intake Terminal Form</h3>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 p-5 space-y-4">
                {/* Section A: Proof of Hazard */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3.5">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <span className="w-1.5 h-3 bg-gov-blue rounded inline-block"></span>
                    <span>1. Capture Media Proof</span>
                  </div>

                  {/* Preloaded quick-click pictures */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Simulate Camera Upload:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSamplePhoto(p)}
                          className={`border rounded-lg overflow-hidden relative group text-left ${
                            selectedPhoto?.name === p.name ? "border-gov-blue ring-2 ring-gov-blue/20" : "border-slate-200"
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-11 object-cover" />
                          <div className="p-1 text-[9px] font-semibold text-slate-700 block truncate">
                            {p.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center text-[9px] text-slate-400 font-mono">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-2 uppercase">Or Manual Url</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  <input
                    type="url"
                    value={customPhotoUrl}
                    onChange={(e) => { setCustomPhotoUrl(e.target.value); triggerAIEvaluation(reportTitle, reportDesc, null, gpsLocation); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Section B: Narrative Description */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3.5">
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-gov-blue rounded inline-block"></span>
                      <span>2. Explain & Describe</span>
                    </span>
                    {/* Simulated Voice record button */}
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                        isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title="Dictate with voice"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>

                  {isRecording && (
                    <div className="bg-red-50/75 border border-red-200 p-3 rounded-lg flex flex-col items-center gap-2">
                      <span className="text-[10px] text-red-600 font-mono font-bold uppercase animate-pulse">
                        Listening... Dictate Now
                      </span>
                      {/* Audio wave simulation */}
                      <div className="flex items-center gap-1 h-8">
                        {voiceWave.map((h, i) => (
                          <span
                            key={i}
                            className="w-1 bg-red-500 rounded"
                            style={{ height: `${h}%` }}
                          ></span>
                        ))}
                      </div>
                    </div>
                  )}

                  {voiceTranscript && (
                    <div className="p-2.5 bg-gov-blue-light border border-gov-blue/20 rounded-lg space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-gov-blue flex items-center gap-1">
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>AI Transcribed Audio Proof:</span>
                      </span>
                      <p className="text-[10px] text-slate-700 italic">
                        "{voiceTranscript}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-slate-700 block">Report Summary Title</label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => { setReportTitle(e.target.value); triggerAIEvaluation(e.target.value, reportDesc, selectedPhoto, gpsLocation); }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      placeholder="e.g. Ruptured Waterpipe next to 5th Ave delis"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-slate-700 block">Narrative Details</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => { setReportDesc(e.target.value); triggerAIEvaluation(reportTitle, e.target.value, selectedPhoto, gpsLocation); }}
                      rows={3}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs resize-none"
                      placeholder="Describe size, immediate public risk, how long it has occurred, etc."
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Section C: GPS Anchor */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-gov-blue rounded inline-block"></span>
                      <span>3. Pinpoint GIS Coordinates</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoGPS}
                      className="text-[10px] text-gov-blue font-bold uppercase hover:underline"
                    >
                      Auto Locate GPS
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
                    Click the smart city grid map below to manually drop an exact anchor pin.
                  </p>

                  <SmartCityMap
                    interactiveMode={true}
                    manualPin={gpsLocation}
                    onMapClick={handleManualMapClick}
                    heightClass="h-[180px]"
                    showHeatmap={false}
                    showClusters={false}
                    showWorkers={false}
                    showPriorityZones={false}
                  />

                  {gpsLocation && (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-700 flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-[9px] uppercase text-slate-400">Locked Anchor:</span>
                        <span>{gpsLocation.lat.toFixed(5)}°N, {gpsLocation.lng.toFixed(5)}°W</span>
                      </div>
                      <button type="button" onClick={() => setGpsLocation(null)} className="p-1 text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Section D: AI Pre-Classification Real-time Evaluation Panel */}
                {(isAIAnalyzing || aiAnalysisPreview) && (
                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-lg border border-slate-800 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                        <span className="font-mono text-[11px] uppercase tracking-wider font-bold">CivicIQ Classifier Agent</span>
                      </div>
                      {aiAnalysisPreview && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-bold border border-emerald-900">
                          {Math.floor(aiAnalysisPreview.confidence * 100)}% Confidence
                        </span>
                      )}
                    </div>

                    {isAIAnalyzing ? (
                      <div className="py-4 text-center font-mono text-xs text-slate-400 space-y-2">
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <span>Deconstructuring image/text vectors...</span>
                      </div>
                    ) : aiAnalysisPreview && (
                      <div className="space-y-3 font-mono text-xs text-slate-300">
                        <div className="grid grid-cols-2 gap-2.5 text-[10px] border-b border-slate-800 pb-2.5">
                          <div>
                            <span className="text-slate-500 block uppercase">Classified Domain:</span>
                            <span className="text-white font-bold">{aiAnalysisPreview.category}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase">Threat Severity:</span>
                            <span className={`font-bold ${
                              aiAnalysisPreview.severity === "Critical" ? "text-red-400" : "text-amber-400"
                            }`}>{aiAnalysisPreview.severity}</span>
                          </div>
                        </div>

                        <div className="text-[11px] leading-relaxed">
                          <span className="text-slate-500 block uppercase text-[9px] mb-0.5">Explanation / Logical Reasoning:</span>
                          <p className="text-slate-300 font-sans italic">{aiAnalysisPreview.reasoning}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-[10px] pt-1">
                          <div>
                            <span className="text-slate-500 block uppercase">Assigned Priority Index:</span>
                            <span className="text-blue-400 font-bold">{aiAnalysisPreview.priorityScore}/100</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase">Duplicate Check:</span>
                            <span className="text-emerald-400">0 Matching Incidents</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAIAnalyzing}
                  className="w-full py-3.5 bg-gov-blue hover:bg-gov-blue-hover text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:bg-slate-300"
                >
                  Authorize Official Log Submit
                </button>
              </form>
            </div>
          )}

          {/* SCREEN: CONFIRMATION RECEIPT */}
          {screen === "confirm" && (
            <div className="flex-1 flex flex-col p-6 items-center justify-between bg-white text-center">
              <div></div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900">Incident Lodged</h3>
                  <span className="text-xs font-mono text-gov-blue font-bold uppercase tracking-wider block mt-1">
                    Receipt ID: {lastSubmittedId}
                  </span>
                </div>

                <div className="border border-dashed border-slate-200 p-4 rounded-xl max-w-[280px] mx-auto bg-slate-50 text-left space-y-2.5 font-mono text-[10px] text-slate-600">
                  <div className="flex justify-between">
                    <span>LODGED BY:</span>
                    <span className="text-slate-900 font-bold">Jenkins, Sarah</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIMESTAMP:</span>
                    <span className="text-slate-900">2026-07-05 09:41 UTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEVERITY:</span>
                    <span className="text-red-600 font-bold uppercase">HIGH</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-[11px] font-bold">
                    <span>PRIORITY:</span>
                    <span className="text-gov-blue">94 / 100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                  Your local tracking timeline is active. CivicIQ Dispatchers have merged your files. Check back for real-time status updates.
                </p>
              </div>

              <button
                onClick={() => setScreen("home")}
                className="w-full py-3 bg-gov-blue hover:bg-gov-blue-hover text-white font-semibold rounded-xl text-xs"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* SCREEN: HISTORY LIST */}
          {screen === "history" && (
            <div className="flex-1 flex flex-col">
              <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setScreen("home")} className="p-1 text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-sm font-bold text-slate-800">Report Logs History</h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {complaints.length} Total
                </span>
              </div>

              <div className="p-4 space-y-3">
                {complaints.map((c) => {
                  let badge = "bg-amber-50 text-amber-700 border-amber-100";
                  if (c.status === "Resolved") badge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  else if (c.status === "In Progress") badge = "bg-blue-50 text-blue-700 border-blue-100";

                  return (
                    <div
                      key={c.id}
                      onClick={() => onViewComplaintDetails(c.id)}
                      className="bg-white border border-slate-200 p-3 rounded-xl hover:border-gov-blue cursor-pointer transition-colors space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">{c.id}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full ${badge}`}>
                          {c.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-2 mt-1">
                        <span>Category: {c.category}</span>
                        <span>{new Date(c.reportedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN: PROFILE */}
          {screen === "profile" && (
            <div className="flex-1 flex flex-col p-6 bg-white space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen("home")} className="p-1 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">Your Citizen Token</h3>
              </div>

              <div className="text-center py-4 border border-slate-200 rounded-xl bg-slate-50 relative space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto overflow-hidden border-2 border-gov-blue">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" alt="Sarah" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Sarah Jenkins</h4>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Token UUID: e8a-497d-90d4</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-3 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold">Verify Citizen Identity</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase font-mono">Approved</span>
                </div>
                <div className="p-3 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold">Linked Smart Water Meter</span>
                  <span className="text-[10px] text-slate-400 font-mono">#WM-8219-A</span>
                </div>
                <div className="p-3 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold">Residential Zone Key</span>
                  <span className="text-[10px] text-slate-400 font-mono">District 4-B</span>
                </div>
              </div>

              <button
                onClick={() => { setUser(null); setScreen("login"); }}
                className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-semibold rounded-xl text-xs mt-auto transition-colors"
              >
                Revoke Credentials Token
              </button>
            </div>
          )}

          {/* SCREEN: SETTINGS */}
          {screen === "settings" && (
            <div className="flex-1 flex flex-col p-6 bg-white space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen("home")} className="p-1 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">Portal Settings</h3>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="space-y-1.5 border-b border-slate-100 pb-3">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Privacy & Safety</span>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Anonymize Report Metadata</span>
                    <input type="checkbox" defaultChecked className="accent-gov-blue" />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Share GPS with First Responders</span>
                    <input type="checkbox" defaultChecked className="accent-gov-blue" />
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-slate-100 pb-3">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Alerts notifications</span>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Push notifications for Dispatch</span>
                    <input type="checkbox" defaultChecked className="accent-gov-blue" />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Eweather Flooding Alerts</span>
                    <input type="checkbox" defaultChecked className="accent-gov-blue" />
                  </div>
                </div>

                <div className="space-y-1.5 pb-3">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Data Security</span>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Biometrics Lock</span>
                    <input type="checkbox" className="accent-gov-blue" />
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
