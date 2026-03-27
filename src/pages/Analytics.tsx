import { useState, useEffect } from 'react';
import { fetchAnalytics, type AnalyticsData } from '../services/api';
import TechIcon from '@/components/ui/tech-icon';

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAnalytics = async () => {
      const localSession = localStorage.getItem("vibe_session");
      const user = localSession ? JSON.parse(localSession).user : null;
      if (!user) return;

      try {
        const analytics = await fetchAnalytics(user.name);
        setData(analytics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getAnalytics();
  }, []);

  return (
    <section className="p-12 max-w-7xl mx-auto w-full">
      <div className="mb-12">
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-white mb-4">Architectural Intelligence</h1>
        <p className="text-slate-400 font-body text-lg">Analyze your synthesis patterns and infrastructure preferences over time.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant">Gathering telemetry...</p>
        </div>
      ) : !data ? (
        <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-4" data-icon="insights">insights</span>
            <p className="text-on-surface-variant">Failed to load analytics data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics row */}
          <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-all"></div>
            <span className="material-symbols-outlined text-3xl text-primary mb-4" data-icon="memory">memory</span>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">Total Blueprints</p>
            <h3 className="text-5xl font-headline font-black text-white">{data.total_syntheses}</h3>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-tertiary/20 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 blur-[50px] rounded-full group-hover:bg-tertiary/20 transition-all"></div>
            <span className="material-symbols-outlined text-3xl text-tertiary mb-4" data-icon="query_stats">query_stats</span>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">Avg Vibe Precision</p>
            <h3 className="text-5xl font-headline font-black text-white">{data.average_score}%</h3>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-green-500/20 transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full group-hover:bg-green-500/20 transition-all"></div>
             <span className="material-symbols-outlined text-3xl text-green-500 mb-4" data-icon="eco">eco</span>
             <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">Est. Tokens Saved</p>
             <h3 className="text-5xl font-headline font-black text-white">{data.tokens_saved.toLocaleString()}</h3>
          </div>

          {/* Activity Chart (Native CSS implementation) */}
          <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-3xl border border-white/5 flex flex-col">
            <h2 className="text-xl font-headline font-bold text-white mb-8">Synthesis Activity (7 Days)</h2>
            <div className="flex-1 flex items-end gap-2 h-48 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-x-0 bottom-0 border-b border-white/5"></div>
                <div className="absolute inset-x-0 bottom-1/2 border-b border-white/5"></div>
                <div className="absolute inset-x-0 top-0 border-b border-white/5"></div>
                
                {data.activity.map((point, index) => {
                    const maxSyntheses = Math.max(...data.activity.map(a => a.syntheses), 1);
                    const heightPercent = (point.syntheses / maxSyntheses) * 100;
                    
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 relative z-10 group">
                            <div className="w-full relative flex items-end justify-center rounded-sm bg-primary/5 hover:bg-primary/20 transition-all h-full" style={{ height: '100%' }}>
                                <div 
                                    className="w-full bg-gradient-to-t from-primary/50 to-primary rounded-t-sm transition-all duration-1000 ease-out" 
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{point.date.replace('Day ', 'D')}</span>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-10 bg-surface-container-highest text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {point.syntheses} runs
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Top Frameworks */}
          <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 flex flex-col">
             <h2 className="text-xl font-headline font-bold text-white mb-6">Top Technologies</h2>
             {data.top_frameworks.length > 0 ? (
                 <div className="flex-1 space-y-4">
                     {data.top_frameworks.map((fw, i) => (
                         <div key={i} className="flex items-center gap-4 group">
                             <TechIcon slug={fw.name} size={24} className="bg-white/5 group-hover:bg-primary/10 transition-colors" />
                             <div className="flex-1">
                                 <div className="flex justify-between items-center mb-1">
                                     <span className="text-sm font-bold text-white uppercase tracking-wider">{fw.name}</span>
                                     <span className="text-xs text-primary font-mono">{fw.count} uses</span>
                                 </div>
                                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                     <div 
                                         className="h-full bg-primary" 
                                         style={{ width: `${(fw.count / Math.max(...data.top_frameworks.map(f => f.count))) * 100}%` }}
                                     ></div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                     <span className="material-symbols-outlined text-4xl mb-2" data-icon="category">category</span>
                     <p className="text-sm">Not enough data to determine favorites yet.</p>
                 </div>
             )}
          </div>

          {/* Strategic Prediction Briefings */}
          <div className="lg:col-span-3 mt-4">
             <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary" data-icon="predictive_conveyance">predictive_conveyance</span>
                <h2 className="text-2xl font-headline font-bold text-white tracking-tight">Project Vibe Predictions</h2>
             </div>
             
             {data.strategic_insights && data.strategic_insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.strategic_insights.map((insight, idx) => (
                        <div key={idx} className="bg-surface-container-low p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all flex flex-col">
                           <div className="mb-6">
                              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 opacity-50">Strategic Report</h4>
                              <h3 className="text-xl font-headline font-bold text-white">{insight.project_title}</h3>
                           </div>
                           
                           <div className="flex-1 space-y-6">
                              <div>
                                 <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-tighter">Market Gap Identified</p>
                                 <p className="text-sm text-slate-400 leading-relaxed italic">"{insight.market_opportunity}"</p>
                              </div>
                              
                              <div>
                                 <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-tighter">Primary Inhibitors/Competitors</p>
                                 <div className="flex flex-wrap gap-2">
                                    {insight.competitors.map((c, i) => (
                                       <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-300 border border-white/10">{c}</span>
                                    ))}
                                 </div>
                              </div>

                              <div className="pt-4 border-t border-white/5 mt-auto">
                                 <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-tighter">Synthesis Recommendation</p>
                                 <p className="text-xs text-primary-fixed leading-tight font-medium">{insight.growth_strategy}</p>
                              </div>
                           </div>
                        </div>
                    ))}
                </div>
             ) : (
                <div className="bg-surface-container-low p-12 rounded-3xl border border-dashed border-white/10 text-center">
                   <span className="material-symbols-outlined text-4xl text-slate-500 mb-4" data-icon="neurology">neurology</span>
                   <p className="text-slate-500 max-w-sm mx-auto">Neural insights require a more detailed project description. Synthesize a new vision to unlock predictive data.</p>
                </div>
             )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Analytics;
