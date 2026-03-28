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
import Architecture from './pages/Architecture';
import { supabase } from './lib/supabase';

const ProtectedRoute = ({ session }: { session: any }) => {
  if (session === undefined) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Authenticating...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function App() {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    const applyTheme = () => {
      // Force Dark Mode to preserve background animations
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#000';
    };

    const fetchTheme = async () => {
        // Theme is now locked to dark
        applyTheme();
    };

    const getSession = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const localSession = localStorage.getItem("vibe_session");
      const parsedLocal = localSession ? JSON.parse(localSession) : null;
      
      const currentSession = supabaseSession || parsedLocal;
      setSession(currentSession);
      fetchTheme();
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        fetchTheme();
      } else {
        const localSession = localStorage.getItem("vibe_session");
        const parsedLocal = localSession ? JSON.parse(localSession) : null;
        setSession(parsedLocal);
        fetchTheme();
      }
    });

    const handleStorageChange = () => {
      const localSession = localStorage.getItem("vibe_session");
      if (localSession) {
        const parsed = JSON.parse(localSession);
        setSession(parsed);
        fetchTheme();
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchTheme();
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
            <Route path="/architecture" element={<Architecture />} />
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
