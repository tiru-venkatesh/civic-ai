/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Ops Copilot — natural language layer over the admin console.
 *
 * WIRING NOTE (read before shipping):
 * This component posts to POST /api/copilot on your backend. That endpoint should
 * call the Anthropic Messages API server-side (never from the browser — keep the
 * API key off the client) with tool definitions matching the `runLocalAction`
 * cases below (assign_worker, filter_queue, lookup_incident, summarize_load).
 * Claude returns a tool_use block, your backend executes nothing itself (this app
 * owns the data), and just relays the tool name + input back to the client, which
 * calls runLocalAction() against the in-memory state already in AdminDashboard.
 * That keeps a single source of truth (React state) instead of duplicating it
 * server-side.
 */

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import { Complaint, FieldWorker } from "../types";

interface CopilotChatProps {
  complaints: Complaint[];
  workers: FieldWorker[];
  onClose: () => void;
  onSelectComplaint: (id: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How many critical incidents are unassigned right now?",
  "Which technician is closest to CIQ-1042?",
  "Summarize today's SLA risk",
];

export default function CopilotChat({ complaints, workers, onClose, onSelectComplaint }: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ops Copilot online. Ask me about incident load, crew availability, or say something like \"assign the nearest free technician to the worst backlog\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Executes a tool call returned by Claude against the real app state.
  // Replace this switch with real handlers wired to AdminDashboard's setters
  // (pass them down as extra props once you move past this scaffold).
  function runLocalAction(toolName: string, input: Record<string, any>): string {
    switch (toolName) {
      case "lookup_incident": {
        const c = complaints.find((c) => c.id === input.incident_id);
        if (!c) return `No incident found matching ${input.incident_id}.`;
        onSelectComplaint(c.id);
        return `Opened ${c.id} — "${c.title}", priority ${c.aiAnalysis.priorityScore}, status ${c.status}.`;
      }
      case "filter_queue": {
        const matches = complaints.filter(
          (c) => (!input.severity || c.aiAnalysis.severity === input.severity) && (!input.status || c.status === input.status)
        );
        return `Found ${matches.length} matching incidents: ${matches.slice(0, 5).map((c) => c.id).join(", ")}${matches.length > 5 ? "…" : ""}`;
      }
      case "summarize_load": {
        const pending = complaints.filter((c) => c.status === "Pending").length;
        const critical = complaints.filter((c) => c.aiAnalysis.severity === "Critical" && c.status !== "Resolved").length;
        const free = workers.filter((w) => w.status === "Available").length;
        return `${pending} pending, ${critical} critical unresolved, ${free} technicians free right now.`;
      }
      default:
        return "I couldn't map that to an action yet.";
    }
  }

  async function handleSend(text?: string) {
    const query = (text ?? input).trim();
    if (!query || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Server-side endpoint — see file header. Falls back to a local
      // heuristic reply below if the backend isn't wired up yet, so the
      // component still demos standalone.
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            totalIncidents: complaints.length,
            availableWorkers: workers.filter((w) => w.status === "Available").length,
          },
        }),
      });

      if (!res.ok) throw new Error("copilot endpoint not available");
      const data = await res.json();

      if (data.tool_call) {
        const result = runLocalAction(data.tool_call.name, data.tool_call.input);
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? result }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      // Local fallback so the panel is usable before /api/copilot exists.
      const reply = runLocalAction("summarize_load", {});
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold leading-none">Ops Copilot</h3>
              <span className="text-[10px] text-slate-400 font-mono">Command-center assistant</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
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
        </div>

        {/* Suggestions (only before first user message) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[10px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-gov-blue hover:text-gov-blue flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about incidents, crews, budget…"
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
    </div>
  );
}