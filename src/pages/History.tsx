const History = () => {
  const explorations = [
    { id: 'EXP-882-01', name: 'Ethereal Edge Nodes', stack: ['Next.js', 'Redis'], date: 'Oct 24, 2023', score: 98, color: 'text-primary' },
    { id: 'EXP-901-44', name: 'Monolith Migration Beta', stack: ['Python', 'AWS'], date: 'Oct 21, 2023', score: 82, color: 'text-tertiary' },
    { id: 'EXP-742-12', name: 'Serverless GraphQL Layer', stack: ['Apollo', 'GCP'], date: 'Oct 14, 2023', score: 74, color: 'text-on-surface-variant' },
  ];

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

        <div className="space-y-4">
          {explorations.map((item) => (
            <div key={item.id} className="glass-panel rounded-xl p-6 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex items-center gap-6 w-1/3">
                <div className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${item.color.replace('text-', 'text-opacity-100 text-')}`} data-icon="rocket_launch">rocket_launch</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-white tracking-tight">{item.name}</h3>
                  <p className="text-xs text-slate-500 font-body">ID: {item.id}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 w-1/6">
                <span className="text-xs text-slate-500 font-label uppercase tracking-widest">Core Stack</span>
                <div className="flex gap-1">
                  {item.stack.map(s => (
                    <span key={s} className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] text-primary-fixed border border-primary/10">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 w-1/6">
                <span className="text-xs text-slate-500 font-label uppercase tracking-widest">Date Analyzed</span>
                <span className="text-sm font-body text-on-surface">{item.date}</span>
              </div>
              <div className="flex flex-col gap-1 w-1/12 text-center">
                <span className="text-xs text-slate-500 font-label uppercase tracking-widest">Vibe Score</span>
                <span className={`text-lg font-headline font-extrabold ${item.color}`}>{item.score}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg">
                  <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default History;
