import { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { FaceResult, VisionService } from '../types';
import { getVision, withDelegateFallback } from './visionRuntime';

export const FACE_MODEL_URL = '/models/face_landmarker.task';

export async function createFaceService(): Promise<
  VisionService<FaceResult | null>
> {
  const vision = await getVision();
  const landmarker = await withDelegateFallback((delegate) =>
    FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
    }),
  );

  return {
    detect(video, timestamp) {
      const res = landmarker.detectForVideo(video, timestamp);
      const cats = res.faceBlendshapes[0]?.categories;
      if (!cats) return null;
      const score = (name: string) =>
        cats.find((c) => c.categoryName === name)?.score ?? 0;
      return {
        eyeBlink: (score('eyeBlinkLeft') + score('eyeBlinkRight')) / 2,
      };
    },
    close: () => landmarker.close(),
  };
}
