c/**
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
