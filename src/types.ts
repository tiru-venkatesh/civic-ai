/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AIAnalysis {
  classification: string;
  category: string;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  populationAffected: number; // count of citizens impacted
  delayImpactScore: number; // 0 to 100
  budgetRequired: number; // USD
  timeToRepairHours: number;
  priorityScore: number; // 0 to 100
  isDuplicate: boolean;
  duplicateGroup: string | null; // ID of primary incident if duplicate
}

export interface HistoryEvent {
  status: "Pending" | "Assigned" | "In Progress" | "Resolved";
  updatedAt: string;
  comment: string;
  updatedBy: string;
}

export interface CompletionProof {
  photos: string[];
  completedAt: string;
  comments: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "Pending" | "Assigned" | "In Progress" | "Resolved";
  latitude: number;
  longitude: number;
  address: string;
  reportedBy: string;
  reportedAt: string;
  images: string[];
  voiceTranscript: string | null;
  aiAnalysis: AIAnalysis;
  assignedWorkerId: string | null;
  history: HistoryEvent[];
  completionProof: CompletionProof | null;
}

export interface FieldWorker {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Available" | "On Mission" | "Offline";
  currentLat: number;
  currentLng: number;
  phone: string;
  avatar: string;
}

export interface Notification {
  id: string;
  role: "Citizen" | "Admin" | "Worker";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SmartCityBudget {
  allocated: number;
  spent: number;
  remaining: number;
  unassigned: number;
}
