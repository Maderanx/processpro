import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Meetings from './pages/Meetings';
import Team from './pages/Team';
import VideoMinutes from './pages/VideoMinutes';
import ManagerDashboard from './pages/ManagerDashboard';
import { ScreenReaderProvider } from './components/ui/screen-reader';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'manager') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <>
      <Toaster />
      <ScreenReaderProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <PrivateRoute>
                  <Meetings />
                </PrivateRoute>
              }
            />
            <Route
              path="/team"
              element={
                <PrivateRoute>
                  <Team />
                </PrivateRoute>
              }
            />
            <Route
              path="/video-minutes"
              element={
                <PrivateRoute>
                  <VideoMinutes />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <ManagerRoute>
                  <ManagerDashboard />
                </ManagerRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ScreenReaderProvider>
    </>
  );
}

export default App;