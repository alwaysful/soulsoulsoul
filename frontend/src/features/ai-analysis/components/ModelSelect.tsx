import { SCREEN_MODELS, type ScreenModel } from '../../../api/study';

interface Props {
  value: ScreenModel;
  onChange: (model: ScreenModel) => void;
}

export function ModelSelect({ value, onChange }: Props) {
  return (
    <select
      className="model-select"
      aria-label="화면 분석 모델"
      title="화면 분석 모델"
      value={value}
      onChange={(e) => onChange(e.target.value as ScreenModel)}
    >
      {SCREEN_MODELS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
