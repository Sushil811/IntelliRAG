import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === 'Incorrect email or password') {
        setError('Incorrect email or password. If you do not have an account yet, please click "Create Account" below.');
      } else {
        setError(detail || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white mb-4 shadow-lg">
          <Sparkles size={28} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Log in to your IntelliRAG account</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3"
        >
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com" 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
          Create one now
        </Link>
      </div>
    </div>
  );
}
