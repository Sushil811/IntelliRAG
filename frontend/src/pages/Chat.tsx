import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, StopCircle, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ document_name: string; page: number; section: string; score: number }>;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am IntelliRAG, your enterprise AI knowledge copilot. Ask me anything about our company documents, policies, or technical specs.'
    }
  ]);
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await axios.post('http://localhost:8000/api/chat', { query });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev, 
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.answer,
          sources: data.sources
        }
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev, 
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while trying to answer your question.'
        }
      ]);
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Math.random().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    chatMutation.mutate(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-gray-700/50 overflow-hidden relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white' 
                  : 'bg-gradient-to-tr from-violet-600 to-purple-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-4 rounded-3xl shadow-md max-w-prose ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-tl-sm border border-white/20 dark:border-gray-700/50'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                </div>
                
                {/* Citations block */}
                {msg.sources && msg.sources.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 flex flex-wrap gap-2 justify-start"
                  >
                    {msg.sources.map((src, i) => (
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={i} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/40 dark:border-gray-600/50 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-all"
                      >
                        <Paperclip size={12} className="text-purple-500" />
                        <span className="truncate max-w-[150px]">{src.document_name}</span>
                        {src.page && <span className="opacity-60">· Pg {src.page}</span>}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {chatMutation.isPending && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-4xl mx-auto"
          >
            <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
              <Bot size={20} />
            </div>
            <div className="px-5 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl rounded-tl-sm border border-white/20 dark:border-gray-700/50 shadow-md flex items-center">
              <div className="flex gap-1.5">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/50">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-3 group">
          <div className="relative flex-1">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500 ${chatMutation.isPending ? 'opacity-70 animate-pulse' : ''}`}></div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask IntelliRAG..."
              className="relative w-full bg-white dark:bg-gray-800 border-0 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-0 resize-none max-h-32 min-h-[60px] text-gray-900 dark:text-gray-100 placeholder-gray-400 font-medium shadow-inner"
              rows={1}
            />
            <Sparkles className="absolute right-4 top-4 text-purple-400 opacity-50" size={20} />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            disabled={!input.trim() || chatMutation.isPending}
            className="h-[60px] w-[60px] flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all shadow-lg"
          >
            {chatMutation.isPending ? <StopCircle size={24} className="animate-spin-slow" /> : <Send size={24} className="ml-1" />}
          </motion.button>
        </form>
        <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-4 tracking-wide">
          IntelliRAG answers are based on your enterprise data but can make mistakes. Always verify sources.
        </p>
      </div>
    </div>
  );
}
