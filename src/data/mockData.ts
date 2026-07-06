/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Complaint, FieldWorker, Notification } from "../types";

export const INITIAL_WORKERS: FieldWorker[] = [
  {
    id: "FW-101",
    name: "Ravi Kumar",
    role: "Senior Civil Engineer",
    department: "Rajahmundry Municipal Corporation",
    status: "On Mission",
    currentLat: 17.0050,
    currentLng: 81.7860,
    phone: "+91 9876543210",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-102",
    name: "Priya Reddy",
    role: "Water Supply Engineer",
    department: "Public Health Engineering Department",
    status: "Available",
    currentLat: 16.9870,
    currentLng: 81.7680,
    phone: "+91 9876543211",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-103",
    name: "Arjun Naidu",
    role: "Electrical Inspector",
    department: "Andhra Pradesh Electricity Department",
    status: "On Mission",
    currentLat: 17.0010,
    currentLng: 81.7940,
    phone: "+91 9876543212",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-104",
    name: "Srinivas Rao",
    role: "Sanitation Officer",
    department: "Municipal Sanitation Department",
    status: "Available",
    currentLat: 17.0090,
    currentLng: 81.8050,
    phone: "+91 9876543213",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-105",
    name: "Anjali Sharma",
    role: "Road Safety Officer",
    department: "Transport Department",
    status: "Offline",
    currentLat: 17.0180,
    currentLng: 81.7830,
    phone: "+91 9876543214",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "CIQ-2026-001",
    title: "Major Pavement Collapse & Active Sinkhole risk",
    description: "A substantial portion of the asphalt has failed on Main Road near Kotagummam Junction, exposing deep sub-grade washouts. Heavy commercial trucks are bouncing over it, causing heavy vibrations. High probability of worsening into a full sinkhole if not addressed prior to the incoming storm.",
    category: "Pothole & Road Damage",
    status: "Assigned",
    latitude: 17.0060,
    longitude: 81.7855,
    address: "Main Road, near Kotagummam Junction, Rajahmundry - 533101",
    reportedBy: "Sarah Jenkins (Local Business Owner)",
    reportedAt: "2026-07-04T14:32:00Z",
    images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: "Yes, hello, there is a very deep collapse in the asphalt right on Main Road in front of our shop. It's vibrating the whole building when buses pass by, and you can see water pooling underneath. It looks like it's going to collapse completely. Please send someone immediately.",
    assignedWorkerId: "FW-101",
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-04T14:32:00Z",
        comment: "Citizen submitted report with high-fidelity photo and audio attachment.",
        updatedBy: "System"
      },
      {
        status: "Assigned",
        updatedAt: "2026-07-04T14:35:12Z",
        comment: "CivicIQ Agent dispatched Ravi Kumar based on specialization and close proximity (250m away).",
        updatedBy: "CivicIQ Orchestrator"
      }
    ],
    aiAnalysis: {
      classification: "Critical Road Infrastructure Failure",
      category: "Pothole & Road Damage",
      confidence: 0.98,
      reasoning: "Visual analysis shows structural concrete sub-base exposure. Audio transcript indicates building resonance (vibration), which suggests deep structural cavern. Extreme weather forecast predicts heavy rains in 12 hours, elevating water erosion and imminent sinkhole threat.",
      severity: "Critical",
      populationAffected: 1240, // Busy commuter lane and commercial hub
      delayImpactScore: 91,
      budgetRequired: 4800,
      timeToRepairHours: 6,
      priorityScore: 96,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-002",
    title: "Ruptured Water Main Flooding Street & Sidewalk",
    description: "Water is bubbling up rapidly from under the sidewalk flagstones, flooding the gutter and turning the crosswalk into a river. The water pressure seems to be lifting the concrete paving slabs. Safe pedestrian crossing is compromised, forcing disabled citizens onto the active roadway.",
    category: "Water Leakage & Flooding",
    status: "Pending",
    latitude: 16.9930,
    longitude: 81.7720,
    address: "Danavaipeta Road, Rajahmundry - 533103",
    reportedBy: "Robert Chen (Resident)",
    reportedAt: "2026-07-05T01:10:00Z",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: null,
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-05T01:10:00Z",
        comment: "Report flagged by Citizen portal with photo evidence.",
        updatedBy: "System"
      }
    ],
    aiAnalysis: {
      classification: "High-Pressure Water Main Fracture",
      category: "Water Leakage & Flooding",
      confidence: 0.94,
      reasoning: "Continuous fluid flow in heavy volume lifting structural pedestrian pathways. Sub-surface erosion risk is high. Water pressure is estimated at >60 PSI based on visual fountain height. Affects local water pressure for 14 surrounding residential buildings.",
      severity: "High",
      populationAffected: 3200,
      delayImpactScore: 78,
      budgetRequired: 8500,
      timeToRepairHours: 8,
      priorityScore: 92,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-003",
    title: "Complete Blackout of Intersection Traffic Signals",
    description: "The entire array of traffic and pedestrian lights at the Court Road & Innespeta Main Street junction are completely dead. Traffic is locking up, drivers are aggressively forcing their way through, and pedestrians are stranded on the corners. Extreme collision hazard.",
    category: "Traffic Light Malfunction",
    status: "In Progress",
    latitude: 17.0015,
    longitude: 81.7945,
    address: "Court Road & Innespeta Main Street Junction, Rajahmundry - 533101",
    reportedBy: "Officer Martinez (Traffic Police Dispatch)",
    reportedAt: "2026-07-05T02:05:00Z",
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: "Court Road and Innespeta junction is fully dark. Repeat, all phases are dark. Vehicles are blocking the box. We need emergency crews and traffic police down here immediately.",
    assignedWorkerId: "FW-103",
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-05T02:05:00Z",
        comment: "Incident reported by police dispatcher. Priority flagged by municipal data stream.",
        updatedBy: "Officer Martinez"
      },
      {
        status: "Assigned",
        updatedAt: "2026-07-05T02:08:00Z",
        comment: "System selected Arjun Naidu (Electrical specialist) to resolve controller cabinet failure.",
        updatedBy: "CivicIQ Orchestrator"
      },
      {
        status: "In Progress",
        updatedAt: "2026-07-05T02:15:00Z",
        comment: "Arjun Naidu arrived on site and opened the local controller assembly.",
        updatedBy: "FW-103"
      }
    ],
    aiAnalysis: {
      classification: "Grid Intersection Signal System Failure",
      category: "Traffic Light Malfunction",
      confidence: 0.99,
      reasoning: "Interlocking grid locking at major transit corridor (Court Road connects to the Godavari Bridge Road). Direct threat to vehicle and pedestrian safety. Expected traffic delay build-up rate is 4.5 miles per hour of downtime.",
      severity: "Critical",
      populationAffected: 8500,
      delayImpactScore: 95,
      budgetRequired: 1200,
      timeToRepairHours: 2,
      priorityScore: 95,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-004",
    title: "Damaged Streetlight with Exposed Wiring",
    description: "The metal access cover plate at the base of the street lamp post has been knocked off. There are thick live-looking electrical cables spilling onto the wet grass next to the pedestrian walkway. Children play in this immediate area daily.",
    category: "Streetlight Failure",
    status: "Pending",
    latitude: 17.0075,
    longitude: 81.8010,
    address: "T-Chowrastha Link Road, Rajahmundry - 533105",
    reportedBy: "Amanda Morris (Resident)",
    reportedAt: "2026-07-05T02:30:00Z",
    images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: null,
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-05T02:30:00Z",
        comment: "Citizen uploaded image of base wiring. AI automatically isolated copper conductors.",
        updatedBy: "System"
      }
    ],
    aiAnalysis: {
      classification: "Exposed High-Voltage Ground Terminal",
      category: "Streetlight Failure",
      confidence: 0.91,
      reasoning: "Visible raw copper cabling on wet soil near playground fence. Substantially high hazard index for electrocution. Immediate area secured via public warning alerts, but physical repair is urgent.",
      severity: "High",
      populationAffected: 450,
      delayImpactScore: 12,
      budgetRequired: 800,
      timeToRepairHours: 1.5,
      priorityScore: 84,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-005",
    title: "Illegal Biohazard Waste Dumping in Park Alley",
    description: "Several bags containing clinical waste, including syringes, specimen cups, and heavy-duty chemicals, have been dumped illegally in the park service alleyway. The bags are ripping open and spilling onto public park access turf.",
    category: "Waste & Sanitation",
    status: "Resolved",
    latitude: 17.0055,
    longitude: 81.7845,
    address: "Kotagummam Park, Rajahmundry - 533101",
    reportedBy: "Gregory Peck (Park Warden)",
    reportedAt: "2026-07-03T08:15:00Z",
    images: ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: "FW-104",
    completionProof: {
      photos: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80"],
      completedAt: "2026-07-03T11:45:00Z",
      comments: "Alleyway cleared, disinfected, and hazardous items secured in regulatory containment barrels. Transferred to municipal medical disposal yard. Camera footage requested from park security."
    },
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-03T08:15:00Z",
        comment: "Park Warden reported clinical waste via mobile portal.",
        updatedBy: "Gregory Peck"
      },
      {
        status: "Assigned",
        updatedAt: "2026-07-03T08:20:00Z",
        comment: "Assigned to Srinivas Rao (Sanitation Officer) with biohazard clearance equipment.",
        updatedBy: "CivicIQ Orchestrator"
      },
      {
        status: "In Progress",
        updatedAt: "2026-07-03T09:00:00Z",
        comment: "Srinivas arrived on site with hazardous response vehicle.",
        updatedBy: "FW-104"
      },
      {
        status: "Resolved",
        updatedAt: "2026-07-03T11:45:00Z",
        comment: "Hazmat clearance complete. Site cleared and declared safe.",
        updatedBy: "FW-104"
      }
    ],
    aiAnalysis: {
      classification: "Unregulated Clinical Biohazard Disposal",
      category: "Waste & Sanitation Overflow",
      confidence: 0.96,
      reasoning: "Visual presence of red biological waste containers and puncture risks. High risk of pathogen spread. Proximity to public park turf requires instant neutralization.",
      severity: "High",
      populationAffected: 800,
      delayImpactScore: 5,
      budgetRequired: 1800,
      timeToRepairHours: 3,
      priorityScore: 82,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-006",
    title: "Duplicate: Deep Sinkhole Opening on Main Road",
    description: "Huge hole on Main Road. Asphalt seems to have completely fallen in. This is extremely dangerous, please repair!",
    category: "Pothole & Road Damage",
    status: "Pending",
    latitude: 17.0061,
    longitude: 81.7856,
    address: "642 Main Road, near Kotagummam Junction, Rajahmundry - 533101",
    reportedBy: "Jane Doe (Pedestrian)",
    reportedAt: "2026-07-04T15:10:00Z",
    images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: null,
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-04T15:10:00Z",
        comment: "Citizen report automatically flagged as potential duplicate of CIQ-2026-001 (distance 12m, category match, high text cosine similarity).",
        updatedBy: "System"
      }
    ],
    aiAnalysis: {
      classification: "Critical Road Infrastructure Failure",
      category: "Pothole & Road Damage",
      confidence: 0.99,
      reasoning: "Distance to active report CIQ-2026-001 is 12m. Text clusters with Main Road sinkhole report. Images exhibit identical asphalt damage geometry. Marked as duplicate to prevent resource doubling.",
      severity: "Critical",
      populationAffected: 1240,
      delayImpactScore: 91,
      budgetRequired: 0,
      timeToRepairHours: 0,
      priorityScore: 0,
      isDuplicate: true,
      duplicateGroup: "CIQ-2026-001"
    }
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "N-1",
    role: "Admin",
    title: "Critical Priority Incident Detected",
    message: "Main Road sinkhole risk (CIQ-2026-001) has been escalated to Critical with Priority Score 96.",
    createdAt: "2026-07-04T14:35:00Z",
    read: false,
  },
  {
    id: "N-2",
    role: "Admin",
    title: "Duplicate Cluster Formed",
    message: "Report CIQ-2026-006 has been automatically merged under primary report CIQ-2026-001.",
    createdAt: "2026-07-04T15:12:00Z",
    read: true,
  },
  {
    id: "N-3",
    role: "Citizen",
    title: "Report Received",
    message: "Your complaint regarding 'Water Main Flooding' (CIQ-2026-002) has been logged and analyzed by CivicIQ AI.",
    createdAt: "2026-07-05T01:12:00Z",
    read: false,
  },
  {
    id: "N-4",
    role: "Worker",
    title: "Emergency Dispatch Assigned",
    message: "You have been assigned to 'Main Road Sinkhole Risk' (CIQ-2026-001). Report immediately.",
    createdAt: "2026-07-04T14:35:12Z",
    read: false,
  },
];
