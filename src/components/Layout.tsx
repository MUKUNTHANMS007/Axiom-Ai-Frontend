import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar />
      <main className="ml-64 min-h-screen relative flex flex-col">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
