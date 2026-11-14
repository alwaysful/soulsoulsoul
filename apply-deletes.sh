#!/bin/sh
# 삭제할 파일. 저장소 루트에서 실행.
rm -f backend/src/common/dto/pagination-response.dto.ts
rm -f backend/src/post/dto/post.dto.ts
rm -f backend/src/post/post.controller.ts
rm -f backend/src/post/post.module.ts
rm -f backend/src/post/post.service.ts
rm -f frontend/src/api/categories.ts
rm -f frontend/src/api/posts.ts
rm -f frontend/src/components/Pagination.tsx
rm -f frontend/src/features/ai-analysis/hooks/useSleep.ts
rm -f frontend/src/features/ai-analysis/pages/AnalysisPage.tsx
rm -f frontend/src/features/ai-analysis/pages/StudyPage.tsx
rm -f frontend/src/features/posts/pages/PostDetailPage.tsx
rm -f frontend/src/features/posts/pages/PostFormPage.tsx
rm -f frontend/src/features/posts/pages/PostListPage.tsx
rm -rf backend/src/post frontend/src/features/posts
