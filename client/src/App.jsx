import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Layout/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/landing" replace />;
};

// Smart home: authenticated → editor, else → landing page
const SmartHome = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Home /> : <Navigate to="/landing" replace />;
};

// Only show the global Navbar on app pages (not the landing page which has its own)
const AppShell = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  return (
    <div className="app">
      {!isLanding && <Navbar />}
      <ErrorBoundary>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SmartHome />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
