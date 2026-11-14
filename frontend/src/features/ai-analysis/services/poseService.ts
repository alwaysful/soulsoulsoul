import { PoseLandmarker } from '@mediapipe/tasks-vision';
import type { PoseResult, VisionService } from '../types';
import { getVision } from './visionRuntime';

export const POSE_MODEL_URL = '/models/pose_landmarker_lite.task';

export async function createPoseService(): Promise<
  VisionService<PoseResult | null>
> {
  const vision = await getVision();
  const landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'GPU' },
    runningMode: 'VIDEO',
    numPoses: 1,
  });

  return {
    detect(video, timestamp) {
      const res = landmarker.detectForVideo(video, timestamp);
      const lm = res.landmarks[0];
      if (!lm) return null;
      return {
        landmarks: lm.map((p) => ({
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility,
        })),
      };
    },
    close: () => landmarker.close(),
  };
}
