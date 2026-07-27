import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Files, 
  Library, 
  BarChart3, 
  CheckSquare, 
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat Copilot', path: '/chat', icon: MessageSquare },
  { name: 'Documents', path: '/documents', icon: Files },
  { name: 'Knowledge Base', path: '/knowledge-base', icon: Library },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Evaluations', path: '/evaluations', icon: CheckSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar - Glassmorphism */}
      <aside className="relative z-10 w-72 m-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col">
        <div className="p-8 pb-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          >
            IntelliRAG
          </motion.h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide uppercase">Enterprise AI Copilot</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-sm'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-inner flex-shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.full_name || 'User'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Logged in'}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              title="Log out"
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex-shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 my-4 mr-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden flex flex-col">
        <header className="h-20 bg-transparent border-b border-gray-200/50 dark:border-gray-700/50 flex items-center px-8 justify-between backdrop-blur-md">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={location.pathname}
            className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight"
          >
            {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'IntelliRAG'}
          </motion.h2>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-64 bg-white/50 dark:bg-gray-900/50 rounded-full border border-gray-200/50 dark:border-gray-700/50 flex items-center px-4 shadow-inner">
              <span className="text-sm text-gray-400">Search globally... (Ctrl+K)</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
