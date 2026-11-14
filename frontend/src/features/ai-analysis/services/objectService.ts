import { ObjectDetector } from '@mediapipe/tasks-vision';
import type { DetectedObject, VisionService } from '../types';
import { getVision, withDelegateFallback } from './visionRuntime';

// COCO 라벨 모델: 스마트폰 클래스명은 'cell phone'
export const OBJECT_MODEL_URL = '/models/efficientdet_lite0.tflite';
const TARGET_LABELS = ['cell phone'];

export async function createObjectService(): Promise<
  VisionService<DetectedObject[]>
> {
  const vision = await getVision();
  const detector = await withDelegateFallback((delegate) =>
    ObjectDetector.createFromOptions(vision, {
      baseOptions: { modelAssetPath: OBJECT_MODEL_URL, delegate },
      runningMode: 'VIDEO',
      scoreThreshold: 0.4,
      categoryAllowlist: TARGET_LABELS,
    }),
  );

  return {
    detect(video, timestamp) {
      const res = detector.detectForVideo(video, timestamp);
      return res.detections.flatMap((d) => {
        const c = d.categories[0];
        const b = d.boundingBox;
        if (!c || !b) return [];
        return [
          {
            label: c.categoryName,
            score: c.score,
            box: { x: b.originX, y: b.originY, width: b.width, height: b.height },
          },
        ];
      });
    },
    close: () => detector.close(),
  };
}
