import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary/10 blur-[100px] rounded-full"></div>
      </div>

      <main className="relative z-10 overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-surface-container-highest border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium tracking-wider text-primary-fixed uppercase">v1.4 Now Live</span>
            </div>
            <h1 className="font-headline text-5xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
              Vibe to Architecture:<br/>
              <span className="italic font-light text-primary">Build Your Vision</span> 
              with the Perfect Stack.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-on-surface-variant font-body mb-12 leading-relaxed">
              The intelligence engine that interprets your project’s DNA to recommend the ideal frameworks, languages, and cloud infrastructure for elite scalability.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/dashboard" className="px-10 py-5 bg-gradient-to-r from-primary to-primary-dim rounded-md font-label font-bold text-on-primary-fixed uppercase tracking-widest hover:shadow-[0_0_40px_rgba(182,160,255,0.4)] transition-all transform active:scale-95">
                Start Designing
              </Link>
              <button className="px-10 py-5 bg-secondary-container rounded-md font-label font-bold text-on-secondary-container uppercase tracking-widest hover:bg-surface-bright transition-all">
                View Demo
              </button>
            </div>
          </div>

          <div className="mt-24 w-full max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden glass-panel p-1 shadow-2xl">
            <div className="w-full h-full bg-surface-container-lowest rounded-lg overflow-hidden relative">
              <img alt="Abstract digital rendering" className="w-full h-full object-cover mix-blend-screen opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI9izjbjxEy1OfekN1bMORmqGce9lR7mpBtdUzxQcnGXhAxqTIFv3w7qMtZTyBtoWdVrfN8usk8o8i9p-3tKXvyuUAGcSOBZ8WzdCwPeyxt_mbh-L3yhM1U7Z8xaZA1TPKyLjpNlIGpSYDSn9Nyvhncm9Zju7JO9Wnvm9ZAgmM9H-y5VAis6Ddvi8YuI3tKfRwEUWyn0KFDyHsbtepaJts7EkdVJwhsyphTF5-M9Inv3j6GsVnc8OPSsrT856q59ngct6tI_qaF9A"/>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
              <div className="absolute top-8 left-8 p-4 glass-panel rounded-xl border-l-4 border-primary">
                <pre className="font-mono text-xs text-primary-fixed leading-relaxed">{"{"}
  "project_vibe": "High Scalability",
  "concurrency": "Heavy",
  "recommended": ["Rust", "Kubernetes", "Redis"]
{"}"}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Engineered for Precision</h2>
              <p className="text-on-surface-variant text-lg">Infrastructure choices are no longer a guessing game.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">hub</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">Smart Framework Matching</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">Analyze your business logic requirements to find the exact language and framework ecosystem that reduces technical debt.</p>
              </div>
              <div className="group p-8 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 flex flex-col relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">insights</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">AI-Driven Platform Insights</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">Get telemetry projections on how your stack will perform across AWS, GCP, or Azure based on real-world benchmarks.</p>
              </div>
              <div className="group p-8 rounded-xl bg-surface-container-highest flex flex-col border border-primary/20 shadow-[0_0_50px_rgba(182,160,255,0.05)]">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>architecture</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 text-white">Optimized Scalability</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">Auto-generate configuration tailored to your specific application load and latency targets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-surface-container-lowest border-y border-outline-variant/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#b6a0ff 1px, transparent 1px)", backgroundSize: "32px 32px"}}></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter text-white">Ready to Deploy Your Legacy?</h2>
            <p className="text-on-surface-variant text-xl mb-12">Join 4,000+ founders using ArchIntel to build the next generation of digital infrastructure.</p>
            <Link to="/dashboard" className="px-12 py-6 bg-white text-black rounded-md font-label font-extrabold uppercase tracking-widest hover:bg-primary transition-all hover:text-on-primary-fixed shadow-xl">
              Get Beta Access
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
