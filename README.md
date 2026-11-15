# soulsoulsoul

## 구조
- `frontend/` React + Vite
- `backend/src/` NestJS
- `AI/` Python 예약
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
화면 감시: 캡처 이미지는 백엔드를 거쳐 로컬 Ollama(gemma4:12b)로 전달된다. 외부로 나가지 않는다.

## 화면 감시 (Ollama)
1. https://ollama.com 에서 Windows 설치
2. `ollama pull gemma4:12b`
3. 루트 `.env` 에 `OLLAMA_URL` 설정 (`.env.example` 참고)
