import { useLocation, Navigate } from 'react-router-dom';
import type { AnalysisResult } from '../services/api';

const Recommendations = () => {
  const location = useLocation();
  const result = location.state?.result as AnalysisResult;

  // If no result is present, redirect to dashboard
  if (!result) {
    return <Navigate to="/dashboard" replace />;
  }

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
          <button className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-8 py-2.5 rounded-md font-label text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Save Stack
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
              {result.languages?.map((lang, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">{lang.icon || '🛠️'}</span>
                    <span className="bg-primary/10 text-primary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Language</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{lang.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container-lowest text-slate-400 text-[11px] px-2 py-1 rounded border border-white/5">{lang.use_case}</span>
                    <span className="bg-surface-container-lowest text-primary-fixed text-[11px] px-2 py-1 rounded border border-primary/20 font-bold">{lang.match}% Match</span>
                  </div>
                </div>
              ))}
              {result.frameworks?.map((fw, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">{fw.icon || '⚡'}</span>
                    <span className="bg-tertiary/10 text-tertiary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{fw.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{fw.name}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{fw.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container-lowest text-slate-400 text-[11px] px-2 py-1 rounded border border-white/5">UI: {fw.learning_curve}</span>
                    <span className="bg-surface-container-lowest text-tertiary-fixed text-[11px] px-2 py-1 rounded border border-tertiary/20 font-bold">{fw.match}% Match</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture Insights */}
          <div className="bg-surface-container-high p-8 rounded-xl relative overflow-hidden border border-white/5">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-primary to-tertiary"></div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary" data-icon="auto_awesome">auto_awesome</span>
              <h2 className="font-headline text-lg font-bold text-white tracking-tight uppercase tracking-widest text-xs">The Architecture Vibe</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-primary-fixed text-sm font-bold mb-3">Key Paradigm</h4>
                {result.architecture_patterns?.filter(p => p.recommended).map((p, i) => (
                  <div key={i} className="mb-4">
                    <p className="text-white font-bold text-lg mb-2">{p.name}</p>
                    <ul className="space-y-1">
                      {p.pros.map((pro: string, j: number) => (
                        <li key={j} className="text-xs text-on-surface-variant flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary"></span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="text-tertiary-fixed text-sm font-bold">Risk Analysis</h4>
                <div className="flex flex-wrap gap-2">
                  {result.potential_risks?.map((risk, i) => (
                    <span key={i} className="bg-error/10 text-error-container text-[11px] px-3 py-1.5 rounded-full border border-error/20">
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
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
                    <div className="text-2xl">{plat.icon || '☁️'}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{plat.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{plat.type} • {plat.pricing}</p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4 italic">"{plat.best_for}"</p>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-primary-fixed uppercase tracking-tighter">Est: {plat.monthly_estimate}</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-slate-400">Scale: {plat.scalability}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Budget Breakdown */}
          <div className="glass-panel p-6 rounded-xl border border-primary/20">
             <h3 className="font-headline text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Fiscal Projections</h3>
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
             <p className="mt-6 text-[11px] text-slate-500 italic text-center">
                {result.budget_breakdown?.note}
             </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
