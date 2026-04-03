import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
