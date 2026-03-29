import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { submitSupportRequest } from '@/services/api';

const Support = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // Check for Supabase session first, then fallback to local session protocol
      let currentUser = null;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        currentUser = { id: user.id, email: user.email || user.user_metadata?.name || 'Anonymous' };
      } else {
        const localSession = localStorage.getItem("vibe_session");
        if (localSession) {
          const parsed = JSON.parse(localSession);
          currentUser = { 
            id: String(parsed.user?.id || ''), 
            email: String(parsed.user?.name || 'Anonymous Architect') 
          };
        }
      }

      if (!currentUser || !currentUser.id) {
        setError("Neural Connection Failed. Please re-authenticate.");
        return;
      }

      await submitSupportRequest(currentUser.id, currentUser.email, message);
      
      setIsSuccess(true);
      setMessage('');
    } catch (err) {
      console.error("Support relay failed:", err);
      setError("Relay Failed. Communication link unstable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen pt-24 pb-32 px-4 lg:ml-64 max-w-7xl mx-auto relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              Protocol: Neural Support v1.0
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              Central <br/> <span className="text-primary">Command</span> Relay
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Encountering architectural bottlenecks? Send a direct signal to the Aether core for immediate stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Zap, label: "Priority Response", color: "text-amber-500" },
              { icon: ShieldCheck, label: "Secure Link", color: "text-emerald-500" },
              { icon: MessageSquare, label: "Direct Support", color: "text-blue-500" },
              { icon: HeartHandshake, label: "Human Oversight", color: "text-rose-500" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
                <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-1 items-center border-white/10 rounded-[2.5rem] bg-[#080808]/80 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px] -mr-16 -mt-16" />
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">Post Your Request</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Relay direct to: mukunthanthebest@gmail.com</p>
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-[10px] text-rose-500 font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
              </div>

              <div className="relative group">
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your architectural bottleneck or feature request..."
                  className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all resize-none font-medium leading-relaxed custom-scrollbar group-hover:border-white/10"
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  Secure Protocol 
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-6 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Signal Received Successfully</p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsSuccess(false)}
                      className="text-[9px] text-slate-500 uppercase font-black hover:text-white"
                    >
                      Send another request
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    key="submit-btn"
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black uppercase tracking-[0.3em] text-[11px] group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> DISPATCHING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        Dispatch Signal <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                )}
              </AnimatePresence>
            </form>
          </Card>
          
          <p className="mt-8 text-[9px] text-slate-600 text-center uppercase font-black tracking-[0.25em] opacity-40">
            Axiom Support Protocol System • Professional Steward Relay • v1.4
          </p>
        </motion.div>
      </div>
    </main>
  );
};

const Badge = ({ children, className }: any) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);

export default Support;
