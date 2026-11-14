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

export interface FaceResult {
  // 양쪽 눈 감김 점수 평균 (0~1)
  eyeBlink: number;
}

export interface AnalysisFrame {
  timestamp: number;
  pose: PoseResult | null;
  objects: DetectedObject[];
  face: FaceResult | null;
}

export interface VisionService<T> {
  detect: (video: HTMLVideoElement, timestamp: number) => T;
  close: () => void;
}

export interface AnalysisService {
  analyze: (video: HTMLVideoElement, timestamp: number) => AnalysisFrame;
  close: () => void;
}
