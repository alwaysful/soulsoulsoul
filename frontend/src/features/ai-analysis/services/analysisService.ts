import type { AnalysisService } from '../types';
import { createObjectService } from './objectService';
import { createPoseService } from './poseService';

export async function createAnalysisService(): Promise<AnalysisService> {
  const pose = await createPoseService();
  let objects: Awaited<ReturnType<typeof createObjectService>>;
  try {
    objects = await createObjectService();
  } catch (e) {
    pose.close();
    throw e;
  }

  return {
    analyze: (video, timestamp) => ({
      timestamp,
      pose: pose.detect(video, timestamp),
      objects: objects.detect(video, timestamp),
    }),
    close() {
      pose.close();
      objects.close();
    },
  };
}
