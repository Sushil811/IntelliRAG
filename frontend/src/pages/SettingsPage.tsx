import { useState } from 'react';
import { Sliders, Cpu, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
  const [llmModel, setLlmModel] = useState('models/gemini-flash-latest');
  const [topK, setTopK] = useState(5);
  const [temperature, setTemperature] = useState(0.0);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-4xl">
      
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Configure LLM models, RAG retrieval thresholds & vector DB connections</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Model Settings */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Cpu size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">LLM Provider & Model</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Select primary language model for answer generation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">Model</label>
              <select 
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="models/gemini-flash-latest">Google Gemini Flash Latest (Recommended)</option>
                <option value="models/gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                <option value="models/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">Temperature ({temperature})</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Lower temperature (0.0) ensures deterministic & fact-grounded responses.</p>
            </div>
          </div>
        </motion.div>

        {/* Retrieval Settings */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Sliders size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Retrieval Parameters</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Configure vector search limits and hybrid RRF weighting</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">Top-K Retrived Chunks: {topK}</label>
            <input 
              type="number" 
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Save size={18} />
          {saved ? 'Settings Saved!' : 'Save System Settings'}
        </motion.button>
      </form>
    </motion.div>
  );
}
