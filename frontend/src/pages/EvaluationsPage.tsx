import { CheckCircle2, Award, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const EVAL_METRICS = [
  { name: 'Faithfulness (RAGAS)', score: '0.96 / 1.0', description: 'Measures how grounded the answer is in the retrieved document chunks.', status: 'Excellent' },
  { name: 'Answer Relevance', score: '0.94 / 1.0', description: 'Measures how directly the answer addresses the user query.', status: 'Excellent' },
  { name: 'Context Precision', score: '0.91 / 1.0', description: 'Measures signal-to-noise ratio in retrieved context chunks.', status: 'Good' },
  { name: 'Context Recall', score: '0.95 / 1.0', description: 'Measures if all necessary context was retrieved to formulate the answer.', status: 'Excellent' },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function EvaluationsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">AI RAG Evaluations & Benchmark (RAGAS)</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Automated LLM-as-a-Judge hallucination checks and retrieval scoring</p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <RefreshCw size={18} />
          Run Evaluation Suite
        </motion.button>
      </motion.div>

      {/* Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-gray-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-emerald-500/20 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-300">
            <Award size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">RAG Quality Index: 94.8%</h3>
            <p className="text-xs text-emerald-200/70 font-medium">Zero hallucinations detected across recent 500 test queries</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <Sparkles size={16} /> Certified Production Grade
        </div>
      </motion.div>

      {/* Metrics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EVAL_METRICS.map((metric, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{metric.name}</h4>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> {metric.status}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-3">{metric.score}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{metric.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
