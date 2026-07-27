import { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Layers, 
  Cpu, 
  Sparkles, 
  FileText, 
  Tag, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { authAxios } from '@/context/AuthContext';

interface DocumentItem {
  id: string;
  name: string;
  file_type: string;
  status: string;
  created_at?: string;
}

interface CollectionCategory {
  id: string;
  name: string;
  description: string;
  chunksCount: number;
  icon: any;
  color: string;
  bg: string;
  status: string;
}

const CATEGORIES: CollectionCategory[] = [
  {
    id: '1',
    name: 'HR & People Operations',
    description: 'Employee handbooks, benefits policies, onboarding guidelines, and compliance rules.',
    chunksCount: 1420,
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    status: 'Indexed'
  },
  {
    id: '2',
    name: 'Engineering & Technical Architecture',
    description: 'System design docs, API specifications, infrastructure runbooks, and GitHub repos.',
    chunksCount: 3890,
    icon: Cpu,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    status: 'Indexed'
  },
  {
    id: '3',
    name: 'Finance & Compliance',
    description: 'Quarterly financial reports, audit logs, vendor agreements, and SEC filings.',
    chunksCount: 940,
    icon: Database,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    status: 'Indexed'
  },
  {
    id: '4',
    name: 'Customer Support SOPs',
    description: 'Standard Operating Procedures, resolution scripts, product FAQs, and troubleshooting.',
    chunksCount: 2150,
    icon: Layers,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    status: 'Indexed'
  }
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticTestQuery, setSemanticTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch real user documents from backend
  const { data: docs = [] } = useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await authAxios.get('/documents/');
      return response.data;
    }
  });

  const handleTestSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticTestQuery.trim()) return;

    setIsSearching(true);
    try {
      // Call backend RAG chat endpoint to test vector & hybrid retrieval
      const response = await authAxios.post('/chat/', { query: semanticTestQuery });
      setTestResults(response.data.sources || []);
    } catch (err) {
      console.error('Semantic search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Enterprise Knowledge Base</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Vector index collections, semantic chunking & Qdrant vector store management</p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={18} />
          Create Knowledge Domain
        </motion.button>
      </motion.div>

      {/* Metrics Banner */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Vector Chunks', value: '8,400+', icon: Database, color: 'text-blue-500' },
          { label: 'Indexed Documents', value: `${docs.length} Files`, icon: FileText, color: 'text-purple-500' },
          { label: 'Embedding Model', value: 'Gemini 768-D', icon: Cpu, color: 'text-emerald-500' },
          { label: 'Vector Database', value: 'Qdrant Cloud', icon: Layers, color: 'text-indigo-500' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
                <Icon size={20} className={m.color} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{m.value}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Semantic Search Inspector Sandbox */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-gray-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-purple-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Semantic Retrieval & Chunk Inspector</h3>
            <p className="text-xs text-purple-200/70 font-medium">Test raw hybrid vector search (Qdrant Cosine + BM25 RRF) against your knowledge base</p>
          </div>
        </div>

        <form onSubmit={handleTestSemanticSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/60" size={18} />
            <input 
              type="text" 
              value={semanticTestQuery}
              onChange={(e) => setSemanticTestQuery(e.target.value)}
              placeholder="Type a test query (e.g. 'What is the authentication policy?')" 
              className="w-full bg-white/10 dark:bg-gray-900/60 border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-purple-200/50 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSearching || !semanticTestQuery.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSearching ? 'Searching Vectors...' : 'Inspect Chunks'}
            {!isSearching && <ChevronRight size={18} />}
          </motion.button>
        </form>

        {testResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">Top Retrieved Vector Chunks ({testResults.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.map((res, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-purple-300 truncate max-w-[200px]">{res.document_name || 'Document Chunk'}</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">Score: {(res.score * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">{res.text || 'Matching semantic content retrieved from vector database index.'}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Domain Collections Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Knowledge Domains</h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search domains..." 
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div 
                  layout
                  key={cat.id} 
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${cat.bg} flex items-center justify-center shadow-inner`}>
                        <Icon className={`w-6 h-6 ${cat.color}`} />
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                        {cat.status}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-gray-400" />
                      <span>{cat.chunksCount} Vector Chunks</span>
                    </div>
                    <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                      Explore Domain <ExternalLink size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
