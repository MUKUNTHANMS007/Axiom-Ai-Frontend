import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHistory, type HistoryItem } from '../services/api';
import { cn } from '@/lib/utils';

const History = () => {
  const [explorations, setExplorations] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    async function getHistory() {
      try {
        const localSession = localStorage.getItem("vibe_session");
        const user = localSession ? JSON.parse(localSession).user : null;
        const user_id = user?.id || user?.name;
        
        const data = await fetchHistory(user_id);
        setExplorations(data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    }
    getHistory();
  }, []);

  const filteredExplorations = useMemo(() => {
    return explorations.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.result_json?.project_summary?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeFilter === 'All') return matchesSearch;
      if (activeFilter === 'Development') return matchesSearch && (item.stack.includes('React') || item.stack.includes('TypeScript'));
      if (activeFilter === 'AI Models') return matchesSearch && (item.stack.includes('GPT') || item.stack.includes('Claude') || item.stack.includes('Llama'));
      return matchesSearch;
    });
  }, [explorations, searchQuery, activeFilter]);

  return (
    <main className="flex-1 min-h-screen pt-24 pb-32 px-4 lg:ml-64 max-w-7xl mx-auto space-y-8">
      {/* Search & Filter Header */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline font-black tracking-tighter text-white uppercase">History</h1>
          <p className="text-on-surface-variant text-sm font-medium">Archived architectural syntheses and system blueprints.</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" data-icon="search">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project archives..."
              className="w-full bg-surface-container-low border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/30 transition-all shadow-xl"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Development', 'AI Models'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                  activeFilter === filter 
                    ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" 
                    : "bg-surface-container-low text-on-surface-variant border-white/5 hover:border-white/10"
                )}
              >
                {filter === 'All' ? 'All Projects' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-surface-container-low animate-pulse border border-white/5" />
            ))
          ) : filteredExplorations.length > 0 ? (
            filteredExplorations.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate('/recommendations', { state: { result: item.result_json } })}
                className="group relative bg-surface-container-low rounded-3xl p-6 border border-white/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
              >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Complete</span>
                  </div>
                </div>

                {/* Meta Section */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-4">
                  <span className="text-primary">Precision: {item.score}%</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6 flex-grow">
                  {item.result_json?.project_summary || "Architectural synthesis complete. View the full technical blueprint and roadmap for deployment details."}
                </p>

                {/* Tech Bar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.stack.slice(0, 5).map((tech, i) => (
                    <div key={i} className="h-8 px-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center text-[10px] font-black text-on-surface uppercase tracking-widest group-hover:border-primary/30 transition-all">
                      {tech}
                    </div>
                  ))}
                  {item.stack.length > 5 && (
                    <div className="h-8 w-8 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                      +{item.stack.length - 5}
                    </div>
                  )}
                </div>

                {/* Bottom Progress Bar Decoration */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-secondary" 
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 bg-surface-container-low rounded-[3rem] border border-dashed border-white/5"
            >
              <span className="material-symbols-outlined text-6xl text-white/10" data-icon="storage">storage</span>
              <div className="space-y-1">
                <p className="text-white font-bold uppercase tracking-[0.2em]">Archive Empty</p>
                <p className="text-on-surface-variant text-xs">No project syntheses matched your search criteria.</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-8 py-3 bg-white/5 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full border border-white/5 hover:bg-white/10 transition-all"
              >
                Start New Project
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
};

export default History;
