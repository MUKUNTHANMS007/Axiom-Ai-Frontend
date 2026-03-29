import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNavBar from './BottomNavBar';
import { BlueprintExporter } from './blueprint-exporter';
import { BeamsBackground } from './ui/beams-background';

const Layout = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeProject, setActiveProject] = useState("Technical OS v4.0");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const triggerExport = (projectName?: string) => {
    if (projectName) setActiveProject(projectName);
    setIsExporting(true);
  };

  return (
    <div className="min-h-screen bg-black text-on-surface font-body overflow-x-hidden relative">
      <BeamsBackground className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" />
      <Sidebar 
        onDeploy={() => triggerExport()} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="lg:ml-64 min-h-screen relative flex flex-col transition-all duration-300">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex-1 pt-16">
          <Outlet context={{ onDeploy: triggerExport }} />
        </div>
        {/* Padding for BottomNavBar on mobile */}
        <div className="h-20 lg:hidden" />
      </main>

      <BottomNavBar />

      <BlueprintExporter 
        isOpen={isExporting} 
        onClose={() => setIsExporting(false)} 
        projectName={activeProject}
      />
    </div>
  );
};

export default Layout;
