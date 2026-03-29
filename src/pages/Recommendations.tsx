import { useLocation, Navigate, useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { saveStack, fetchSavedStacks, type AnalysisResult } from '../services/api';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { Route, PlayCircle } from 'lucide-react';
import TechIcon from '@/components/ui/tech-icon';

const Recommendations = () => {
  const location = useLocation();
  const result = location.state?.result as AnalysisResult;
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { onDeploy } = useOutletContext<{ onDeploy: (name: string) => void }>();

  // Persistent Save status check on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      const localSession = localStorage.getItem("vibe_session");
      if (!localSession || !result.project_title) return;
      
      const user = JSON.parse(localSession).user;
      try {
        const savedStacks = await fetchSavedStacks(user.name);
        const alreadySaved = savedStacks.some((s: any) => s.name === result.project_title);
        if (alreadySaved) {
            setSaveStatus('success');
        }
      } catch (err) {
        console.error("Failed to fetch saved status:", err);
      }
    };

    checkSavedStatus();
  }, [result.project_title]);

  // If no result is present, redirect to dashboard
  if (!result) {
    return <Navigate to="/architecture" replace />;
  }

  const handleSaveStack = async () => {
    if (saveStatus === 'success') return; // Prevent duplicate saves

    const localSession = localStorage.getItem("vibe_session");
    if (!localSession) return;
    
    const user = JSON.parse(localSession).user;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const tech_slugs = [
          ...result.languages.map(l => l.icon),
          ...result.frameworks.map(f => f.icon)
      ];
      
      await saveStack(
          user.name, 
          result.project_title, 
          tech_slugs, 
          result.project_summary
      );
      setSaveStatus('success');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      // Reset only on error, success should persist
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <span className="text-primary font-label font-semibold tracking-[0.2em] uppercase text-xs mb-3 block">Recommendation Engine v4.2</span>
          <h1 className="font-headline text-5xl lg:text-6xl font-extrabold tracking-tighter text-white max-w-2xl">
            {result.project_title || "Optimized Infrastructure"} <br/><span className="text-primary-fixed">Blueprint</span>
          </h1>
          <p className="mt-4 text-on-surface-variant max-w-xl font-light leading-relaxed">
            {result.project_summary}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-container px-4 py-2 rounded border border-outline-variant/20 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">Confidence</span>
            <span className="text-lg font-headline font-black text-primary">{result.confidence_score}%</span>
          </div>
          <button 
            onClick={handleSaveStack}
            disabled={isSaving}
            className={`px-8 py-2.5 rounded-md font-label text-sm font-bold uppercase tracking-wider shadow-lg transition-all ${
                saveStatus === 'success' ? 'bg-green-500 text-white' : 
                saveStatus === 'error' ? 'bg-red-500 text-white' :
                'bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-primary/20 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSaving ? 'Synching...' : saveStatus === 'success' ? 'Vibe Saved' : 'Save Stack'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          {/* Languages & Frameworks */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary" data-icon="code">code</span>
              <h2 className="font-headline text-xl font-bold tracking-tight text-white uppercase tracking-widest text-sm">Recommended Ecosystem</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.languages?.map((lang: any, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors border border-white/5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <TechIcon slug={lang.icon} name={lang.name} size={32} />
                    <span className="bg-primary/10 text-primary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                       {lang.type || 'Language'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{lang.reason}</p>
                  
                  {lang.detailed_reasoning && lang.detailed_reasoning.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {lang.detailed_reasoning.map((point: string, j: number) => (
                        <li key={j} className="text-[11px] text-slate-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                      <span className="bg-surface-container-lowest text-slate-400 text-[11px] px-2 py-1 rounded border border-white/5">{lang.use_case}</span>
                      <span className="bg-surface-container-lowest text-primary-fixed text-[11px] px-2 py-1 rounded border border-primary/20 font-bold">{lang.match}% Match</span>
                    </div>
                    {lang.docs_url && (
                      <a href={lang.docs_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest group/link">
                        Docs <span className="material-symbols-outlined text-[14px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" data-icon="open_in_new">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {result.frameworks?.map((fw: any, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors border border-white/5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <TechIcon slug={fw.icon} name={fw.name} size={32} />
                    <span className="bg-tertiary/10 text-tertiary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                       {fw.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{fw.name}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{fw.reason}</p>

                  {fw.detailed_reasoning && fw.detailed_reasoning.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {fw.detailed_reasoning.map((point: string, j: number) => (
                        <li key={j} className="text-[11px] text-slate-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                      <span className="bg-surface-container-lowest text-slate-400 text-[11px] px-2 py-1 rounded border border-white/5">Curve: {fw.learning_curve}</span>
                      <span className="bg-surface-container-lowest text-tertiary-fixed text-[11px] px-2 py-1 rounded border border-tertiary/20 font-bold">{fw.match}% Match</span>
                    </div>
                    {fw.docs_url && (
                      <a href={fw.docs_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-tertiary hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest group/link">
                        Specs <span className="material-symbols-outlined text-[14px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" data-icon="open_in_new">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture Insights */}
          <div className="bg-surface-container-high p-8 rounded-xl relative overflow-hidden border border-white/5">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-primary to-tertiary"></div>
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary" data-icon="auto_awesome">auto_awesome</span>
              <h2 className="font-headline text-lg font-bold text-white tracking-tight uppercase tracking-widest text-xs">The Architecture Vibe</h2>
            </div>
            
            <div className="space-y-10">
              <section>
                <h4 className="text-primary-fixed text-sm font-bold mb-4 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm" data-icon="account_tree">account_tree</span>
                   Key Paradigm
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.architecture_patterns?.filter(p => p.recommended).map((p, i) => (
                    <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <p className="text-white font-bold text-lg mb-3">{p.name}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-black text-emerald-500 mb-2">Architectural Pros</p>
                          <ul className="space-y-1 text-xs text-on-surface-variant">
                             {p.pros.map((pro: string, j: number) => <li key={j} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>{pro}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-amber-500 mb-2">Trade-offs</p>
                          <ul className="space-y-1 text-xs text-on-surface-variant">
                             {p.cons.map((con: string, j: number) => <li key={j} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-500"></span>{con}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-error-container text-sm font-bold mb-4 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm" data-icon="warning">warning</span>
                   Risk Analysis & Mitigation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.potential_risks?.map((risk: any, i) => (
                    <div key={i} className="bg-error/5 p-4 rounded-xl border border-error/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold text-sm tracking-tight">{typeof risk === 'string' ? risk : risk.title}</p>
                        {risk.severity && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            risk.severity === 'High' ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {risk.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {typeof risk === 'string' ? "Potential bottleneck identified in system flow." : risk.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Platforms */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary" data-icon="cloud">cloud</span>
              <h2 className="font-headline text-xl font-bold tracking-tight text-white uppercase tracking-widest text-sm">Deployment & Ops</h2>
            </div>
            <div className="space-y-4">
              {result.deploy_platforms?.map((plat, i) => (
                <div key={i} className="bg-surface-container-lowest border border-white/5 p-5 rounded-xl group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <TechIcon slug={plat.icon} name={plat.name} size={28} className="bg-black/20" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{plat.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{plat.type} • {plat.pricing}</p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4 italic">"{plat.best_for}"</p>
                  <div className="flex items-center justify-between text-[11px] font-bold mt-4">
                    <div className="flex flex-col">
                      <span className="text-primary-fixed uppercase tracking-tighter">Est: {plat.monthly_estimate}</span>
                      <span className="text-[9px] text-slate-500 font-medium">Scale: {plat.scalability}</span>
                    </div>
                    {plat.docs_url && (
                      <a href={plat.docs_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 px-3 py-1.5 rounded-lg text-white hover:bg-primary transition-all flex items-center gap-2 group/link border border-white/10">
                        <span className="text-[10px] uppercase tracking-widest font-black">Platform</span>
                        <span className="material-symbols-outlined text-[14px] group-hover/link:rotate-45 transition-transform" data-icon="arrow_outward">arrow_outward</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Budget Breakdown */}
          <div className="glass-panel p-6 rounded-xl border border-primary/20">
             <h3 className="font-headline text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Fiscal Projections</h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500">Minimum</span>
                 <span className="text-sm font-bold text-white">{result.budget_breakdown?.minimum}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/10 p-2 rounded">
                 <span className="text-xs text-primary-fixed font-bold uppercase">Optimal</span>
                 <span className="text-sm font-black text-white">{result.budget_breakdown?.recommended}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500">At Scale</span>
                 <span className="text-sm font-bold text-white">{result.budget_breakdown?.at_scale}</span>
               </div>
             </div>
             <p className="mt-4 text-[10px] text-slate-500 italic text-center leading-relaxed">
                {result.budget_breakdown?.note}
             </p>
          </div>
        </div>
      </div>

      {/* Execution Roadmap using Radial Orbital Timeline */}
      {result.mvp_roadmap && result.mvp_roadmap.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
             <span className="material-symbols-outlined text-primary" data-icon="route">route</span>
             <h2 className="font-headline text-xl font-bold tracking-tight text-white uppercase tracking-widest text-sm">Execution Roadmap</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <RadialOrbitalTimeline timelineData={
                result.mvp_roadmap.map((step: string, index: number, arr: string[]) => ({
                  id: index + 1,
                  title: step.split(':')[0] || `Phase ${index + 1}`,
                  date: `Phase ${index + 1}`,
                  content: step.includes(':') ? step.split(':')[1].trim() : step,
                  category: "Roadmap",
                  icon: index === 0 ? PlayCircle : Route,
                  relatedIds: index < arr.length - 1 ? [index + 2] : [],
                  status: index === 0 ? "in-progress" : "pending",
                  energy: Math.max(20, 100 - (index * 20))
                }))
              } />
            </div>
            
            {result.market_analysis && (
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 relative overflow-hidden group border-l-4 border-l-primary">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="troubleshoot">troubleshoot</span>
                    Market Opportunity
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed italic mb-6">"{result.market_analysis.market_opportunity}"</p>
                  
                  {result.market_analysis.startup_viability && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[12px]" data-icon="balance">balance</span>
                        Startup Viability
                      </h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {result.market_analysis.startup_viability}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="group">group</span>
                    Core Competitors
                  </h3>
                  <div className="space-y-4">
                    {result.market_analysis.potential_competitors.map((comp: any, i) => (
                      <div key={i} className="group/comp">
                        <p className="text-xs font-bold text-white group-hover/comp:text-primary transition-colors">
                          {typeof comp === 'string' ? comp : comp.name}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                          {typeof comp === 'string' ? "Major player in this technical landscape." : comp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" data-icon="trending_up">trending_up</span>
                    Growth Strategy
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-light">{result.market_analysis.growth_strategy}</p>
                </div>

                <button 
                  onClick={() => onDeploy(result.project_title)}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95 px-4"
                >
                  Deploy Synthesis v1.0
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Recommendations;
