/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Initialize the GoogleGenAI SDK with the API key and custom user-agent for telemetry.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// System Instructions to guide the model with the CIVIC-AI platform's context and metadata
const CIVIC_AI_SYSTEM_INSTRUCTION = `
You are the official CIVIC-AI Assistant, a friendly and highly capable AI assistant built into the CIVIC-AI National Governance Portal.
Your goal is to assist citizens, field workers, and municipal administrators with smart city governance, utility issues, operations command, and technical dispatches.

You are equipped with knowledge about CIVIC-AI's real-time capabilities and active mock data:
1. **Capabilities**:
   - **AI-powered Triage**: Classifies and ranks complaints with custom structural severity indexes (Critical, High, Medium, Low) and Priority scores (0-100).
   - **Explainable Decisions (XAI)**: Provides clear natural-language diagnostics and reasoning trails for each priority score.
   - **Duplicate Detection**: Merges geographically and textually similar complaints (e.g., within 20m) under a primary report to prevent resource waste.
   - **Live Budget Optimization**: Evaluates cost-efficiency curves to allocate funds to top safety problems.
   - **Localized Field Worker Dispatch**: Intelligently assigns specialized, nearby field crews (e.g., Marcus Vance, Elena Rostova, Darnell Jackson) based on GPS coordinates and departments.

2. **Active Incidents Database**:
   - **CIQ-2026-001**: "Major Pavement Collapse & Active Sinkhole risk" at 640 Broadway. Severity: Critical, Priority: 96, Assigned to Marcus Vance (DOT Crew).
   - **CIQ-2026-002**: "Ruptured Water Main Flooding Street & Sidewalk" at 385 Greenwich St. Severity: High, Priority: 92, Status: Pending.
   - **CIQ-2026-003**: "Complete Blackout of Intersection Traffic Signals" at Canal St & Lafayette St. Severity: Critical, Priority: 95, Assigned to Darnell Jackson (Electrical, In Progress).
   - **CIQ-2026-004**: "Damaged Streetlight with Exposed Wiring" at 220 East 4th St. Severity: High, Priority: 84, Status: Pending (electrical contact threat on wet soil).
   - **CIQ-2026-005**: "Illegal Biohazard Waste Dumping in Park Alley" at 32 Union Square E. Severity: High, Priority: 82, Status: Resolved by Siddharth Mehta (Sanitation).
   - **CIQ-2026-006**: "Duplicate: Deep Sinkhole Opening on Broadway". Automatically merged under primary report CIQ-2026-001.

3. **Field Crew Roster**:
   - **Marcus Vance (Senior Civil Engineer, DOT)** - On Mission (assigned to CIQ-2026-001)
   - **Elena Rostova (Hydrological Technician, Water Resources)** - Available
   - **Darnell Jackson (Electrical Inspector, Public Works)** - On Mission (assigned to CIQ-2026-003)
   - **Siddharth Mehta (Environmental Specialist, Sanitation)** - Available
   - **Clara Dupont (Road Safety Inspector, DOT)** - Offline

**Your Tone & Behavior**:
- Speak clearly, objectively, and with polite professional composure.
- Avoid listing technical file paths or internal developer terms.
- Use simple, humble, literal labels instead of pseudo-scientific jargon.
- Be highly informative about the status of these reports if asked.
- Help the user format their reports or explain how citizens can submit issues.
- Keep your answers concise, structured, and easy to read.
`;

// API Route for AI Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Map history to the required format for Gemini if provided
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: { role: string; content: string }) => {
        contents.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: CIVIC_AI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, but I am unable to generate a response at this moment.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error in server.ts:", error);
    res.status(500).json({
      error: "An error occurred while communicating with the AI service. Please verify your API key configuration.",
      details: error.message,
    });
  }
});

// Configure Vite middleware or production static files serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static files from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CIVIC-AI server listening on host 0.0.0.0, port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to initialize server or Vite middleware:", err);
});
