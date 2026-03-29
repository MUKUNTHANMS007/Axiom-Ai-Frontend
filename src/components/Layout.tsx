import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNavBar from './BottomNavBar';
import { DeploymentOrchestrator } from './deployment-orchestrator';

const Layout = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeProject, setActiveProject] = useState("Technical OS v4.0");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const triggerDeployment = (projectName?: string) => {
    if (projectName) setActiveProject(projectName);
    setIsDeploying(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body overflow-x-hidden">
      <Sidebar 
        onDeploy={() => triggerDeployment()} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="lg:ml-64 min-h-screen relative flex flex-col transition-all duration-300">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex-1 pt-16">
          <Outlet context={{ onDeploy: triggerDeployment }} />
        </div>
        {/* Padding for BottomNavBar on mobile */}
        <div className="h-20 lg:hidden" />
      </main>

      <BottomNavBar />

      <DeploymentOrchestrator 
        isOpen={isDeploying} 
        onClose={() => setIsDeploying(false)} 
        projectName={activeProject}
      />
    </div>
  );
};

export default Layout;
