export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResult {
  landmarks: Landmark[];
}

export interface DetectedObject {
  label: string;
  score: number;
  box: { x: number; y: number; width: number; height: number };
}

export interface AnalysisFrame {
  timestamp: number;
  pose: PoseResult | null;
  objects: DetectedObject[];
}

export interface VisionService<T> {
  detect: (video: HTMLVideoElement, timestamp: number) => T;
  close: () => void;
}

export interface AnalysisService {
  analyze: (video: HTMLVideoElement, timestamp: number) => AnalysisFrame;
  close: () => void;
}
