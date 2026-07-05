/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Citizen AI Assistant — conversational alternative to the multi-section
 * intake form. Two jobs only:
 *   1. Turn a free-text description into a Complaint-shaped draft (title,
 *      category, severity, AIAnalysis) the citizen can confirm before it's
 *      filed — never auto-submits without a confirm step.
 *   2. Answer "where's my report" questions read-only against existing
 *      complaints (no tool call here ever writes data).
 *
 * WIRING NOTE: posts to POST /api/citizen-intake. That endpoint calls the
 * Messages API server-side with two tools: `draft_complaint` (extracts
 * title/category/severity/reasoning/budget/etc — matches AIAnalysis in
 * types.ts) and `lookup_status` (read-only, takes an incident id or
 * "my last N days"). Until that backend exists, this component runs a local
 * keyword heuristic (same logic as CitizenApp's triggerAIEvaluation) so it's
 * still usable standalone.
 */

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, MapPin, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Complaint, AIAnalysis } from "../types";
import SmartCityMap from "./SmartCityMap";

interface CitizenAIChatProps {
  complaints: Complaint[];
  onSubmitComplaint: (newComplaint: Complaint) => void;
  onClose: () => void;
  reporterName?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Draft {
  title: string;
  description: string;
  analysis: AIAnalysis;
}

export default function CitizenAIChat({ complaints, onSubmitComplaint, onClose, reporterName }: CitizenAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Tell me what's wrong and where — e.g. \"there's a burst water pipe flooding the sidewalk on 5th Ave.\" Or ask me to check an existing report, like \"status of CIQ-2026-0114\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, draft]);

  // Local fallback extraction — mirrors CitizenApp's keyword heuristic so the
  // component works before /api/citizen-intake exists. Swap for the real
  // tool-call result once the backend is wired.
  function localDraftFromText(text: string): Draft {
    const lower = text.toLowerCase();
    const hasWater = lower.includes("water") || lower.includes("leak") || lower.includes("flood");
    const hasTraffic = lower.includes("traffic") || lower.includes("light") || lower.includes("signal");
    const hasRoad = lower.includes("pothole") || lower.includes("asphalt") || lower.includes("crack") || lower.includes("sinkhole");
    const hasElectric = lower.includes("wire") || lower.includes("cable") || lower.includes("electric") || lower.includes("spark");

    let category = "Waste & Sanitation";
    let severity: AIAnalysis["severity"] = "Medium";
    let priority = 55;
    let budget = 900;
    let hours = 3;

    if (hasWater) { category = "Water Leakage & Flooding"; severity = "High"; priority = 84; budget = 5200; hours = 6; }
    else if (hasTraffic) { category = "Traffic Light Malfunction"; severity = "Critical"; priority = 91; budget = 2100; hours = 2; }
    else if (hasRoad) { category = "Pothole & Road Damage"; severity = "High"; priority = 81; budget = 3000; hours = 4; }
    else if (hasElectric) { category = "Streetlight Failure"; severity = "High"; priority = 88; budget = 750; hours = 2; }

    return {
      title: text.length > 60 ? text.slice(0, 57) + "…" : text,
      description: text,
      analysis: {
        classification: `${category} — citizen-reported`,
        category,
        confidence: 0.86,
        reasoning: `Assistant parsed the description and matched it to '${category}' based on the terms used.`,
        severity,
        populationAffected: 280,
        delayImpactScore: 48,
        budgetRequired: budget,
        timeToRepairHours: hours,
        priorityScore: priority,
        isDuplicate: false,
        duplicateGroup: null,
      },
    };
  }

  function tryStatusLookup(text: string): string | null {
    const match = text.match(/CIQ[-\w]*\d{3,}/i);
    if (!match) return null;
    const id = match[0].toUpperCase();
    const c = complaints.find((c) => c.id.toUpperCase() === id);
    if (!c) return `I don't see ${id} on your account. Double check the receipt ID from your confirmation screen.`;
    const lastEvent = c.history[c.history.length - 1];
    return `${c.id} — "${c.title}" is currently ${c.status}. Last update: ${lastEvent.comment}`;
  }

  async function handleSend(text?: string) {
    const query = (text ?? input).trim();
    if (!query || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Status lookups never produce a draft / never write data.
    const statusReply = tryStatusLookup(query);
    if (statusReply) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: statusReply }]);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const res = await fetch("/api/citizen-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok) throw new Error("intake endpoint not available");
      const data = await res.json();

      if (data.draft) {
        setDraft(data.draft);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply ?? "Here's what I've got — check the summary below and drop a location pin." },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      const localDraft = localDraftFromText(query);
      setDraft(localDraft);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sounds like a ${localDraft.analysis.category.toLowerCase()} issue, severity ${localDraft.analysis.severity}. Check the summary below, drop a pin on the map, and confirm to file it.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmSubmit() {
    if (!draft) return;
    const finalLat = gpsLocation?.lat || 40.7185;
    const finalLng = gpsLocation?.lng || -73.9985;
    const newTicketId = `CIQ-2026-0${Math.floor(Math.random() * 900) + 100}`;

    const newComplaint: Complaint = {
      id: newTicketId,
      title: draft.title,
      description: draft.description,
      category: draft.analysis.category,
      status: "Pending",
      latitude: finalLat,
      longitude: finalLng,
      address: gpsLocation ? `Sector near (${finalLat.toFixed(4)}, ${finalLng.toFixed(4)})` : "Location pending confirmation",
      reportedBy: reporterName || "Citizen (AI Assistant Intake)",
      reportedAt: new Date().toISOString(),
      images: [],
      voiceTranscript: null,
      aiAnalysis: draft.analysis,
      assignedWorkerId: null,
      history: [
        {
          status: "Pending",
          updatedAt: new Date().toISOString(),
          comment: "Citizen filed via conversational AI assistant intake.",
          updatedBy: "System",
        },
      ],
      completionProof: null,
    };

    onSubmitComplaint(newComplaint);
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold leading-none">CivicIQ Assistant</h3>
          <span className="text-[9px] text-slate-400 font-mono">File a report or check status</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-gov-blue text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gov-blue" />
              <span className="text-[10px] text-slate-400 font-mono">thinking…</span>
            </div>
          </div>
        )}

        {/* Draft confirmation card */}
        {draft && (
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-lg border border-slate-800 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold">Draft Report Summary</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-bold border border-emerald-900">
                {Math.round(draft.analysis.confidence * 100)}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono">
              <div>
                <span className="text-slate-500 block uppercase">Category:</span>
                <span className="text-white font-bold">{draft.analysis.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Severity:</span>
                <span className={`font-bold ${draft.analysis.severity === "Critical" ? "text-red-400" : "text-amber-400"}`}>
                  {draft.analysis.severity}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Est. Priority:</span>
                <span className="text-blue-400 font-bold">{draft.analysis.priorityScore}/100</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Est. Budget:</span>
                <span className="text-white font-bold">${draft.analysis.budgetRequired.toLocaleString()}</span>
              </div>
            </div>

            {/* Location step */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Drop a pin at the location
              </span>
              <SmartCityMap
                interactiveMode={true}
                manualPin={gpsLocation}
                onMapClick={(lat, lng) => setGpsLocation({ lat, lng })}
                heightClass="h-[140px]"
                showHeatmap={false}
                showClusters={false}
                showWorkers={false}
                showPriorityZones={false}
              />
              {gpsLocation && (
                <span className="text-[9px] font-mono text-slate-400 block">
                  Pinned: {gpsLocation.lat.toFixed(4)}°N, {gpsLocation.lng.toFixed(4)}°W
                </span>
              )}
            </div>

            <button
              onClick={handleConfirmSubmit}
              disabled={!gpsLocation}
              className="w-full py-2.5 bg-white disabled:bg-slate-700 disabled:text-slate-400 text-slate-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm & File Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 sticky bottom-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Describe the issue or ask about a report…"
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-gov-blue"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="p-2.5 bg-gov-blue hover:bg-gov-blue-hover disabled:opacity-50 text-white rounded-lg"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}