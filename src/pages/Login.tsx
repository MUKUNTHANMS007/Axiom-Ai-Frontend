import { useSearchParams } from "react-router-dom";
import SignInBlock from "@/components/sign-in-block";

interface LoginProps {
  initialMode?: "signin" | "signup";
}

const Login = ({ initialMode = "signin" }: LoginProps) => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Static Background gradients instead of animated Beams for performance */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <div className="max-w-md mx-auto mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Secure Access</span>
            </div>
            <h1 className="text-4xl font-headline font-bold text-white tracking-tighter mb-2">Vibe Control Center</h1>
            <p className="text-slate-500 text-sm">Join the network to sync your technical DNA across the cloud.</p>
        </div>
        
        <SignInBlock initialMode={initialMode} inviteToken={inviteToken} />
        
        <div className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-widest font-medium">
            Powered by Aether AI & Supabase
        </div>
      </div>
    </div>
  );
};

export default Login;
