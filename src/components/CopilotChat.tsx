/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Ops Copilot — natural language layer over the admin console.
 *
 * WIRING NOTE:
 * This component now talks directly to your local Express + Groq backend
 * (server/server.ts) via POST http://localhost:3001/api/copilot/chat.
 * No tool-calling / runLocalAction scaffold — Groq just answers in plain
 * text and we render it. Session history is kept server-side per sessionId.
 */

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";

interface CopilotChatProps {
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const COPILOT_API_URL = "http://localhost:3001/api/copilot/chat";
const SESSION_ID = "admin-dashboard";

const SUGGESTIONS = [
  "How do I report a civic complaint?",
  "What is CivicIQ?",
  "Explain smart governance.",
];

export default function CopilotChat({ onClose }: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm CivicIQ AI Copilot. Ask me anything about civic governance, complaints, public services, or smart city operations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const query = (text ?? input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(COPILOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          message: query,
        }),
      });

      if (!res.ok) throw new Error("copilot endpoint returned an error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "No response." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Unable to connect to CivicIQ AI Copilot. Is the server running on localhost:3001?" },
      ]);
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
              <span className="text-[10px] text-slate-400 font-mono">CivicIQ AI Assistant</span>
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
            placeholder="Ask CivicIQ AI anything..."
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