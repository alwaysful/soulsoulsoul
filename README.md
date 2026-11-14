# soulsoulsoul

## 구조
- `frontend/` React + Vite
- `BE/` NestJS (이동 예정 → `backend/src`)
- `ai/` Python 예약
- `prisma/` 스키마

## 실행
```bash
cd frontend && npm install && npm run dev
```

## AI 분석 (`/analysis`)
모델 파일을 `frontend/public/models/` 에 둔다.
- `pose_landmarker_lite.task`
- `efficientdet_lite0.tflite` (COCO, `cell phone` 클래스)

영상은 브라우저 안에서만 처리한다.
