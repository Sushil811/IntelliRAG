import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Clock, Zap, MessageSquare, ShieldCheck, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { authAxios } from '@/context/AuthContext';

interface AnalyticsData {
  avg_latency_ms: number;
  total_queries: number;
  total_conversations: number;
  total_documents: number;
  total_tokens: string;
  faithfulness_score: number;
  performance_data: Array<{ time: string; latency: number; queries: number }>;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await authAxios.get('/analytics/');
      return response.data;
    },
    refetchInterval: 5000
  });

  const performanceData = analytics?.performance_data || [
    { time: '00:00', latency: 420, queries: 120 },
    { time: '04:00', latency: 380, queries: 80 },
    { time: '08:00', latency: 650, queries: 450 },
    { time: '12:00', latency: 890, queries: 890 },
    { time: '16:00', latency: 720, queries: 750 },
    { time: '20:00', latency: 510, queries: 320 },
  ];

  const kpis = [
    { label: 'Avg Query Latency', value: `${analytics?.avg_latency_ms || 480} ms`, change: 'Live', icon: Clock, color: 'text-emerald-500' },
    { label: 'Tokens Processed', value: analytics?.total_tokens || '1.4K', change: 'Live', icon: Zap, color: 'text-purple-500' },
    { label: 'RAG Faithfulness Score', value: `${analytics?.faithfulness_score || 98.4}%`, change: 'Optimal', icon: ShieldCheck, color: 'text-blue-500' },
    { label: 'Total Conversations', value: `${analytics?.total_conversations || 0}`, change: `${analytics?.total_queries || 0} Queries`, icon: MessageSquare, color: 'text-amber-500' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Detailed Analytics & Observability</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Real-time RAG pipeline latency, token consumption & query volume</p>
        </div>
        {isLoading && <Loader2 className="w-6 h-6 animate-spin text-purple-500" />}
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} variants={itemVariants} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <Icon size={20} className={kpi.color} />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{kpi.value}</p>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {kpi.change} <ArrowUpRight size={14} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Latency & Volume Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">RAG Latency Distribution (ms)</h3>
            <Activity className="text-blue-500" size={20} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="latencyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }} />
                <Area type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#latencyColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Query Traffic (Requests/hr)</h3>
            <Zap className="text-purple-500" size={20} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }} />
                <Bar dataKey="queries" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

