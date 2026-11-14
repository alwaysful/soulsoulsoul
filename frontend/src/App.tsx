import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudyPage } from './features/ai-analysis/pages/StudyView';
import { LoginPage } from './features/auth/pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignupPage } from './features/auth/pages/SignupPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/study" replace />} />
        <Route element={<ProtectedRoute />}>
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
