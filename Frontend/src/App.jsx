import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth page — redirect to dashboard if already logged in */}
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />

        {/* Protected dashboard */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />

        {/* Protected profile */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
