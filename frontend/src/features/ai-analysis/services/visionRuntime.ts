import { FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

let fileset: ReturnType<typeof FilesetResolver.forVisionTasks> | null = null;

export function getVision() {
  fileset ??= FilesetResolver.forVisionTasks(WASM_URL);
  return fileset;
}
