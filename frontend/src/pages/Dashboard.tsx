import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Users, FileText, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', queries: 400, documents: 24 },
  { name: 'Tue', queries: 300, documents: 13 },
  { name: 'Wed', queries: 550, documents: 45 },
  { name: 'Thu', queries: 278, documents: 39 },
  { name: 'Fri', queries: 189, documents: 48 },
  { name: 'Sat', queries: 239, documents: 38 },
  { name: 'Sun', queries: 349, documents: 43 },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Analytics Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor your AI copilot's performance and usage</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Documents', value: '1,284', icon: FileText, change: '+12%', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Users', value: '842', icon: Users, change: '+5%', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { title: 'Queries Today', value: '3,492', icon: MessageSquare, change: '+24%', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Avg Latency', value: '840ms', icon: Zap, change: '-15%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change.startsWith('+');
          return (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-transparent to-white/5 dark:to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center shadow-inner`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold tracking-wide uppercase relative z-10">{kpi.title}</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight relative z-10">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Search Queries (7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 5, fill: "#fff", strokeWidth: 3, stroke: "#3b82f6" }} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#2563eb" }} 
                />
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', color: '#1f2937', fontWeight: 600 }}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Documents Indexed</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', color: '#1f2937', fontWeight: 600 }}
                />
                <Bar dataKey="documents" fill="url(#colorDocs)" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
