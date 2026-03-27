import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timeline } from '@/components/modern-timeline';
import { fetchHistory, type HistoryItem } from '../services/api';

const History = () => {
  const [explorations, setExplorations] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getHistory() {
      try {
        const localSession = localStorage.getItem("vibe_session");
        const user_id = localSession ? JSON.parse(localSession).user?.name : null;
        
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

  return (
    <section className="p-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white mb-4">Project Explorations</h1>
        <p className="text-on-surface-variant max-w-2xl font-body text-lg">Manage and analyze your architectural stack iterations. Each exploration evaluates performance, cost, and vibe alignment.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button className="bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant/20 text-sm font-medium text-white hover:bg-surface-bright transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
              Filter
            </button>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm" data-icon="search">search</span>
              <input className="bg-surface-container-highest border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 text-white focus:ring-2 focus:ring-primary/20" placeholder="Search explorations..." type="text"/>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-on-surface-variant">Loading your project history...</p>
            </div>
          ) : explorations.length > 0 ? (
            <Timeline items={
              explorations.map(item => ({
                title: item.name,
                description: item.result_json?.project_summary || "Architectural synthesis complete.",
                date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                status: "completed" as const,
                category: `Precision: ${item.score}%`,
                tech_slugs: item.stack,
                onClick: () => navigate('/recommendations', { state: { result: item.result_json } })
              }))
            } />
          ) : (
            <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-slate-500 mb-4" data-icon="history">history</span>
              <p className="text-on-surface-variant">No explorations found yet. Start designing on the dashboard!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default History;
