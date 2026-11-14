import type { AnalysisService, FaceResult } from '../types';
import { createFaceService } from './faceService';
import { createObjectService } from './objectService';
import { createPoseService } from './poseService';

// 얼굴 모델은 무거워서 일정 간격으로만 돌린다
const FACE_INTERVAL_MS = 200;

export async function createAnalysisService(): Promise<AnalysisService> {
  const closers: (() => void)[] = [];
  const closeAll = () => closers.forEach((c) => c());

  try {
    const pose = await createPoseService();
    closers.push(pose.close);
    const objects = await createObjectService();
    closers.push(objects.close);
    const face = await createFaceService();
    closers.push(face.close);

    let lastFace: FaceResult | null = null;
    let lastFaceAt = -Infinity;

    return {
      analyze(video, timestamp) {
        if (timestamp - lastFaceAt >= FACE_INTERVAL_MS) {
          lastFace = face.detect(video, timestamp);
          lastFaceAt = timestamp;
        }
        return {
          timestamp,
          pose: pose.detect(video, timestamp),
          objects: objects.detect(video, timestamp),
          face: lastFace,
        };
      },
      close: closeAll,
    };
  } catch (e) {
    closeAll();
    throw e;
  }
}
