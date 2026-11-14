# soulsoulsoul

## 구조
- `frontend/` React + Vite
- `backend/src/` NestJS
- `ai/` Python 예약
- `prisma/` 스키마

## 실행
```bash
cd frontend && npm install && npm run dev
```

## AI 분석 (`/analysis`)
모델 파일을 `frontend/public/models/` 에 둔다.
- `pose_landmarker_lite.task`
- `face_landmarker.task` (눈 감김 감지)
- `efficientdet_lite0.tflite` (COCO, `cell phone` 클래스)

웹캠 영상은 브라우저 안에서만 처리한다.
화면 감시: 캡처 이미지는 백엔드를 거쳐 로컬 Ollama(Qwen3-VL 4B)로 전달된다. 외부로 나가지 않는다.
