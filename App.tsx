import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// FIX: AuthProvider is exported from './context/AuthContext.tsx', not from './hooks/useAuth.ts'.
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { Header } from './components/Header';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const AuthLayout: React.FC = () => (
    <div className="min-h-screen bg-premium-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
            <Outlet />
        </main>
    </div>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
      return <div className="flex justify-center items-center h-screen">Loading application...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      <Route element={<AuthLayout />}>
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
          </Route>
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
