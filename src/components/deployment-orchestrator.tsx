import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DeploymentLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  timestamp: string;
}

interface DeploymentOrchestratorProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const DeploymentOrchestrator: React.FC<DeploymentOrchestratorProps> = ({ isOpen, onClose, projectName = "Synthesis OS Project" }) => {
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'initializing' | 'provisioning' | 'deploying' | 'verifying' | 'complete'>('initializing');
  const scrollRef = useRef<HTMLDivElement>(null);

  const LOG_SEQUENCE = [
    { message: "Establishing Neural Link to Aether Core...", type: 'system', delay: 500 },
    { message: "Authentication via Supabase Identity successful.", type: 'success', delay: 1000 },
    { message: "Fetching architectural blueprint for comparison...", type: 'info', delay: 1500 },
    { message: "Blueprint verified. Identifying target infrastructure...", type: 'info', delay: 2000 },
    { message: "Vercel / Next.js Bridge: Provisioning Edge Nodes...", type: 'system', delay: 2500 },
    { message: "Supabase DB: Initializing PostgreSQL 16 standard...", type: 'system', delay: 3000 },
    { message: "Tailwind CSS: Injecting JIT styles into theme layers...", type: 'info', delay: 3500 },
    { message: "Deployment started: Running 'npm run build'...", type: 'info', delay: 4500 },
    { message: "Bundle optimization complete. Size: 142KB (Gzip).", type: 'success', delay: 5500 },
    { message: "Uploading assets to global CDN (14 regions)...", type: 'info', delay: 6500 },
    { message: "Checking Vibe alignment... Done.", type: 'success', delay: 7500 },
    { message: "Sanity Check: All services operational.", type: 'success', delay: 8500 },
    { message: "DEPLOYMENT SUCCESSFUL", type: 'success', delay: 9500 },
  ];

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setProgress(0);
      setStatus('initializing');
      
      let timer = 0;
      LOG_SEQUENCE.forEach((log, index) => {
        timer += log.delay;
        setTimeout(() => {
          setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            message: log.message,
            type: log.type as any,
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }]);
          
          setProgress((index + 1) * (100 / LOG_SEQUENCE.length));
          
          if (index < 3) setStatus('initializing');
          else if (index < 6) setStatus('provisioning');
          else if (index < 10) setStatus('deploying');
          else if (index < 12) setStatus('verifying');
          else setStatus('complete');

        }, timer);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-xl"
      >
        <div className="max-w-4xl w-full bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group">
                <span className="material-symbols-outlined animate-pulse" data-icon="rocket_launch">rocket_launch</span>
              </div>
              <div>
                <h2 className="text-xl font-headline font-bold text-white tracking-tight">Deployment Orchestrator</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-mono">
                    Target: {projectName} • Stage: {status}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
              <span className="material-symbols-outlined" data-icon="close">close</span>
            </button>
          </div>

          {/* Progress Section */}
          <div className="p-8 bg-black/40">
            <div className="flex justify-between items-end mb-4 font-mono">
              <span className="text-xs text-primary/60 uppercase tracking-widest">Synthesis Pipeline</span>
              <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <motion.div 
                className="h-full bg-primary relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
              </motion.div>
            </div>
          </div>

          {/* Terminal / Visualization Area */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            {/* Visualizer */}
            <div className="p-8 border-r border-white/5 flex flex-col items-center justify-center bg-black/20 order-2 lg:order-1">
               <div className="relative w-48 h-48 border-2 border-primary/20 rounded-full flex items-center justify-center">
                  <div className={cn(
                    "absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin-slow transition-opacity",
                    status === 'complete' ? 'opacity-0' : 'opacity-100'
                  )}></div>
                  <AnimatePresence mode="wait">
                    {status === 'complete' ? (
                        <motion.div 
                          key="success"
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="flex flex-col items-center"
                        >
                          <span className="material-symbols-outlined text-6xl text-emerald-500 mb-2" data-icon="verified">verified</span>
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Live at alpha.aether.os</span>
                        </motion.div>
                    ) : (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          className="text-center"
                        >
                          <span className="material-symbols-outlined text-4xl text-primary animate-pulse mb-2" data-icon="hub">hub</span>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Bridging Layers...</p>
                        </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Logs */}
            <div className="bg-[#0a0a0a] p-6 font-mono text-sm overflow-hidden flex flex-col order-1 lg:order-2">
               <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                  <span className="ml-2 text-[10px] text-slate-500 tracking-tighter uppercase">system-terminal-v4.0.1</span>
               </div>
               <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 scroll-smooth pr-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-baseline gap-3 group">
                       <span className="text-[9px] text-slate-700 select-none">{log.timestamp}</span>
                       <span className={cn(
                         "text-xs leading-relaxed",
                         log.type === 'system' ? 'text-primary' : 
                         log.type === 'success' ? 'text-emerald-400 font-bold' :
                         log.type === 'warning' ? 'text-amber-400' :
                         log.type === 'error' ? 'text-error' : 'text-slate-400'
                       )}>
                         {log.type === 'system' && <span className="mr-2">»</span>}
                         {log.message}
                       </span>
                    </div>
                  ))}
                  {status !== 'complete' && (
                    <div className="flex items-center gap-2 py-2">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                       <span className="text-[10px] text-primary uppercase font-bold tracking-widest italic">Awaiting sync...</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Footer Card */}
          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Compute Region</span>
                      <span className="text-white text-xs font-bold uppercase tracking-tight">ap-south-1 (Mumbai)</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Vibe Integrity</span>
                      <span className="text-emerald-500 text-xs font-bold uppercase tracking-tight">Optimal</span>
                   </div>
                </div>
                {status === 'complete' && (
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all"
                  >
                    Launch Architecture
                  </motion.button>
                )}
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
