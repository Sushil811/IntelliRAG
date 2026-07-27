import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  UploadCloud, 
  Database, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { authAxios, useAuth } from '@/context/AuthContext';

interface DocumentItem {
  id: string;
  name: string;
  file_type: string;
  status: string;
  created_at?: string;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real document activity from backend API
  const { data: docs = [] } = useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await authAxios.get('/documents/');
      return response.data;
    }
  });

  const recentDocs = docs.slice(0, 4);

  const QUICK_PROMPTS = [
    { title: 'Security & Auth Policy', query: 'What is the authentication requirement and latency target for IntelliRAG?' },
    { title: 'Document Ingestion Guide', query: 'How does the hybrid search and vector ingestion process work in IntelliRAG?' },
    { title: 'Deployment Specifications', query: 'Where are the backend and frontend components targeted for deployment?' },
    { title: 'System Architecture', query: 'Explain the Qdrant vector database and RAG pipeline architecture.' },
  ];

  const handleLaunchPrompt = (query: string) => {
    navigate('/chat', { state: { initialQuery: query } });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      
      {/* Welcome Hero Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-purple-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-4">
              <Sparkles size={14} /> Enterprise AI Knowledge Hub
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Admin'}! 👋
            </h2>
            <p className="text-blue-100/80 mt-2 font-medium leading-relaxed">
              Your IntelliRAG AI copilot is active, indexed, and ready to assist with enterprise knowledge retrieval.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/chat')}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all"
            >
              <MessageSquare size={18} />
              Open AI Copilot
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/documents')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <UploadCloud size={18} />
              Upload Document
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* System Infrastructure Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Vector Store', status: 'Qdrant Cloud (Online)', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'AI Model', status: 'Gemini Flash Latest', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Retrieval Engine', status: 'Hybrid RRF + Cohere', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Primary DB', status: 'Supabase PostgreSQL', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        ].map((sys, i) => {
          const Icon = sys.icon;
          return (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-md flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl ${sys.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${sys.color}`} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{sys.title}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{sys.status}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommended Copilot Prompts & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Prompts */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Copilot Quick Actions</h3>
            <span className="text-xs font-semibold text-gray-400">Click to ask AI Copilot</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_PROMPTS.map((prompt, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLaunchPrompt(prompt.query)}
                className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-md cursor-pointer hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <Sparkles size={16} />
                    </span>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors mb-1">
                    {prompt.title}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2">
                    "{prompt.query}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Knowledge Activity */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Recent Knowledge</h3>
              <button 
                onClick={() => navigate('/documents')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>

            {recentDocs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-medium text-sm">
                No documents uploaded yet. Upload a document to start building your AI copilot's knowledge base.
              </div>
            ) : (
              <div className="space-y-4">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                        {doc.file_type}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{doc.name}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{doc.file_type}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <CheckCircle2 size={12} className="inline mr-1" /> Ready
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><Clock size={14} /> Total: {docs.length} Knowledge Documents</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
