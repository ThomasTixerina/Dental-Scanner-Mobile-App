
export enum ScannerState {
  IDLE = 'IDLE',
  CALIBRATING = 'CALIBRATING',
  SCANNING = 'SCANNING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED'
}

export enum ScanStage {
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  BITE = 'BITE'
}

export interface CaptureFrame {
  id: string;
  dataUrl: string;
  timestamp: number;
  angle: number; // 0-359
  stage: ScanStage;
}

export interface ScanResult {
  id: string;
  stlUrl?: string;
  objUrl?: string;
  plyUrl?: string;
  previewImageUrl: string;
  accuracy: number; // e.g., 0.98 for 98%
  timestamp: number;
}

// Unified Clinical Registries Interfaces for Supabase & Local Database
export interface Doctor {
  id: string;
  name: string;
  licenseNumber: string; // Professional License / Cédula Profesional
  specialty: string;
  email: string;
  phone: string;
  clinicName: string;
  createdAt: number;
}

export interface Patient {
  id: string;
  name: string;
  clinicalId: string; // ID interno de expediente clínico
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  notes: string;
  createdAt: number;
}

export interface Laboratory {
  id: string;
  name: string;
  address: string;
  directorName: string;
  email: string;
  phone: string;
  exocadCertified: boolean;
  createdAt: number;
}

export interface DentalWorkOrder {
  id: string;
  doctorId: string;
  patientId: string;
  laboratoryId: string;
  scanId?: string; // Connected 3D Scan output
  treatmentType: 'crown' | 'bridge' | 'onlay' | 'implant' | 'orthodontics' | 'other';
  status: 'pending' | 'in_design' | 'milling' | 'completed' | 'canceled';
  deliveryDate: string;
  notes: string;
  cost?: number;
  createdAt: number;
}

