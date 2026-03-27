import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import History from './pages/History';
import Settings from './pages/Settings';
import TeamStack from './pages/TeamStack';
import Workflow from './pages/Workflow';
import MyProjects from './pages/MyProjects';
import MyTasks from './pages/MyTasks';
import ProjectDetail from './pages/ProjectDetail';
import InviteAccept from './pages/InviteAccept';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Docs from './pages/Docs';
import { supabase } from './lib/supabase';

const ProtectedRoute = ({ session }: { session: any }) => {
  if (session === undefined) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Authenticating...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function App() {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    const applyTheme = (theme: string) => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
      if (isDark) {
        document.documentElement.style.backgroundColor = '#000';
      } else {
        document.documentElement.style.backgroundColor = '#fff';
      }
    };

    const fetchTheme = async (userId: any) => {
        const { data } = await supabase.from('User').select('Theme').eq('User Id', userId).single();
        if (data?.Theme) {
            applyTheme(data.Theme);
        } else {
            applyTheme('dark');
        }
    };

    const getSession = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const localSession = localStorage.getItem("vibe_session");
      const parsedLocal = localSession ? JSON.parse(localSession) : null;
      
      const currentSession = supabaseSession || parsedLocal;
      setSession(currentSession);
      if (currentSession?.user?.id) {
          fetchTheme(currentSession.user.id);
      } else {
          applyTheme('dark'); // Default to dark for landing
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        fetchTheme(session.user.id);
      } else {
        const localSession = localStorage.getItem("vibe_session");
        const parsedLocal = localSession ? JSON.parse(localSession) : null;
        setSession(parsedLocal);
        if (parsedLocal?.user?.id) {
            fetchTheme(parsedLocal.user.id);
        } else {
            applyTheme('dark');
        }
      }
    });

    const handleStorageChange = () => {
      const localSession = localStorage.getItem("vibe_session");
      if (localSession) {
        const parsed = JSON.parse(localSession);
        setSession(parsed);
        fetchTheme(parsed.user.id);
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchTheme(session.user.id);
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login initialMode="signin" />} />
        <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <Login initialMode="signup" />} />
        <Route path="/invite/:token" element={<InviteAccept />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute session={session} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/history" element={<History />} />
            <Route path="/team-stack" element={<TeamStack />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/me" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
