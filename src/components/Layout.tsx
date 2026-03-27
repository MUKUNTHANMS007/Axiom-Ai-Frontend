import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { DeploymentOrchestrator } from './deployment-orchestrator';

const Layout = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeProject, setActiveProject] = useState("Technical OS v4.0");

  const triggerDeployment = (projectName?: string) => {
    if (projectName) setActiveProject(projectName);
    setIsDeploying(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar onDeploy={() => triggerDeployment()} />
      <main className="ml-64 min-h-screen relative flex flex-col">
        <TopBar />
        <Outlet context={{ onDeploy: triggerDeployment }} />
      </main>

      <DeploymentOrchestrator 
        isOpen={isDeploying} 
        onClose={() => setIsDeploying(false)} 
        projectName={activeProject}
      />
    </div>
  );
};

export default Layout;
