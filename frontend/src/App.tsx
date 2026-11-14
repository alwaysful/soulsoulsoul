import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudyPage } from './features/ai-analysis/pages/StudyPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PostDetailPage } from './features/posts/pages/PostDetailPage';
import { PostFormPage } from './features/posts/pages/PostFormPage';
import { PostListPage } from './features/posts/pages/PostListPage';
import { SignupPage } from './features/auth/pages/SignupPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PostListPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/:id/edit" element={<PostFormPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="analysis" element={<Navigate to="/study" replace />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
