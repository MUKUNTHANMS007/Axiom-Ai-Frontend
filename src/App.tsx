import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page is standalone, no sidebar/topbar */}
        <Route path="/" element={<Landing />} />
        
        {/* Protected/Internal pages use the Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
