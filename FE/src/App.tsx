import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostFormPage } from './pages/PostFormPage';
import { PostListPage } from './pages/PostListPage';
import { SignupPage } from './pages/SignupPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PostListPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/:id/edit" element={<PostFormPage />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
