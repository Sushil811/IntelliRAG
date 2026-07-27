import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import Chat from '@/pages/Chat';
import Documents from '@/pages/Documents';
import Dashboard from '@/pages/Dashboard';

// Mock Pages (You will implement these)
const Login = () => <div className="p-8 text-2xl font-bold">Login Page</div>;
const Register = () => <div className="p-8 text-2xl font-bold">Register Page</div>;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/knowledge-base" element={<div className="p-8">Knowledge Base</div>} />
            <Route path="/analytics" element={<div className="p-8">Detailed Analytics</div>} />
            <Route path="/evaluations" element={<div className="p-8">AI Evaluations</div>} />
            <Route path="/settings" element={<div className="p-8">Settings</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
