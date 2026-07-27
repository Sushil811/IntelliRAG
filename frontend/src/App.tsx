import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

const Chat = lazy(() => import('@/pages/Chat'));
const Documents = lazy(() => import('@/pages/Documents'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const KnowledgeBase = lazy(() => import('@/pages/KnowledgeBase'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const EvaluationsPage = lazy(() => import('@/pages/EvaluationsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex h-64 items-center justify-center text-purple-600 font-medium">
    Loading...
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white font-bold">
        Loading IntelliRAG...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/evaluations" element={<EvaluationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

