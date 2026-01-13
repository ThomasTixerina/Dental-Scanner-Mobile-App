
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
