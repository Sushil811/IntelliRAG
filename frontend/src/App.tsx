import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import Chat from '@/pages/Chat';
import Documents from '@/pages/Documents';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

const queryClient = new QueryClient();

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
                <Route path="/knowledge-base" element={<div className="p-8 font-bold text-gray-800 dark:text-white">Knowledge Base System</div>} />
                <Route path="/analytics" element={<div className="p-8 font-bold text-gray-800 dark:text-white">Detailed Analytics System</div>} />
                <Route path="/evaluations" element={<div className="p-8 font-bold text-gray-800 dark:text-white font-bold">AI RAG Evaluations</div>} />
                <Route path="/settings" element={<div className="p-8 font-bold text-gray-800 dark:text-white">System Settings</div>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
