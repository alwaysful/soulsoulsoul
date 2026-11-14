import { FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

let fileset: ReturnType<typeof FilesetResolver.forVisionTasks> | null = null;

export function getVision() {
  fileset ??= FilesetResolver.forVisionTasks(WASM_URL);
  // 실패한 Promise 를 캐시하지 않는다 (네트워크 오류 후 재시도 가능)
  fileset.catch(() => {
    fileset = null;
  });
  return fileset;
}

// GPU delegate 미지원 환경에서는 CPU 로 재시도
export async function withDelegateFallback<T>(
  create: (delegate: 'GPU' | 'CPU') => Promise<T>,
): Promise<T> {
  try {
    return await create('GPU');
  } catch {
    return create('CPU');
  }
}
