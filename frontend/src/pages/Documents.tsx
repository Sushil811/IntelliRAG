import { useState, useRef } from 'react';
import { UploadCloud, FileText, Search, MoreVertical, CheckCircle2, Loader2, Trash2, File, FileCode2, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DOCS = [
  { id: '1', name: 'HR_Employee_Handbook_2024.pdf', type: 'pdf', status: 'ready', uploaded: '2 hours ago', size: '2.4 MB' },
  { id: '2', name: 'Q3_Financial_Report.docx', type: 'docx', status: 'ready', uploaded: '1 day ago', size: '1.1 MB' },
  { id: '3', name: 'Engineering_Onboarding.md', type: 'md', status: 'ready', uploaded: '3 days ago', size: '45 KB' },
  { id: '4', name: 'Customer_Support_SOPs.pdf', type: 'pdf', status: 'processing', uploaded: 'Just now', size: '5.6 MB' },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Documents() {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'docx': return <File className="w-6 h-6 text-blue-500" />;
      case 'md': return <FileCode2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />;
      case 'csv': return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      default: return <FileText className="w-6 h-6 text-blue-400" />;
    }
  };

  const handleFiles = (files: FileList) => {
    if (files && files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        setDocs(prev => [
          {
            id: Math.random().toString(),
            name: files[0].name,
            type: files[0].name.split('.').pop() || 'unknown',
            status: 'processing',
            uploaded: 'Just now',
            size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`
          },
          ...prev
        ]);
        setIsUploading(false);
      }, 1500);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Documents</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage your enterprise knowledge base</p>
        </div>
      </motion.div>

      {/* Upload Dropzone */}
      <motion.div variants={itemVariants}>
        <div 
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-300 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60'
          } backdrop-blur-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group shadow-sm hover:shadow-md`}
          onDragEnter={() => setIsDragActive(true)}
          onDragLeave={() => setIsDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            accept=".pdf,.docx,.txt,.md,.csv" 
          />
          
          <motion.div 
            animate={{ y: isUploading ? [0, -10, 0] : 0 }} 
            transition={{ repeat: isUploading ? Infinity : 0, duration: 1.5 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${
              isUploading ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-300 group-hover:from-blue-50 dark:group-hover:from-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            } transition-colors duration-300`}
          >
            {isUploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <UploadCloud className="w-10 h-10" />}
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isUploading ? 'Uploading & Processing...' : 'Click or drag documents to upload'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm">
            Supported formats: PDF, DOCX, TXT, MD, CSV. Maximum file size: 50MB.
          </p>
        </div>
      </motion.div>

      {/* Documents List */}
      <motion.div variants={itemVariants} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between bg-white/30 dark:bg-gray-900/30 backdrop-blur-md">
          <div className="relative w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full bg-white dark:bg-gray-900 border-0 shadow-inner rounded-xl pl-11 pr-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
            />
          </div>
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold tracking-wide">
            {docs.length} Documents
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-gray-900/30 text-xs uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Size</th>
                <th className="px-8 py-5">Uploaded</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <AnimatePresence>
                {docs.map((doc) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, backgroundColor: 'rgba(255,255,255,0)' }}
                    animate={{ opacity: 1, backgroundColor: 'rgba(255,255,255,0)' }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.03)' }}
                    key={doc.id} 
                    className="transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.name}</p>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">{doc.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {doc.status === 'ready' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{doc.size}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{doc.uploaded}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shadow-sm">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
