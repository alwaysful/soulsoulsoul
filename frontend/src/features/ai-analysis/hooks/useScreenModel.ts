import { useCallback, useState } from 'react';
import {
  DEFAULT_SCREEN_MODEL,
  SCREEN_MODELS,
  type ScreenModel,
} from '../../../api/study';

const MODEL_KEY = 'screenModel';

function load(): ScreenModel {
  try {
    const v = localStorage.getItem(MODEL_KEY);
    return SCREEN_MODELS.find((m) => m === v) ?? DEFAULT_SCREEN_MODEL;
  } catch {
    return DEFAULT_SCREEN_MODEL;
  }
}

// 선택한 화면 분석 모델 (localStorage 에 기억)
export function useScreenModel() {
  const [model, setModelState] = useState<ScreenModel>(load);
  const setModel = useCallback((m: ScreenModel) => {
    setModelState(m);
    try {
      localStorage.setItem(MODEL_KEY, m);
    } catch {
      /* 저장 실패는 무시 */
    }
  }, []);
  return [model, setModel] as const;
}
