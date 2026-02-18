import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MaquinaPage from './pages/MaquinaPage';
import MonitorPage from './pages/MonitorPage';
import DevolucaoPage from './pages/DevolucaoPage';
import KitPage from './pages/KitPage';
import ChamadosPage from './pages/ChamadosPage';
import { useAuth } from './contexts/AuthContext';

// Componente de rota protegida
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0fdf4'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #dcfce7',
            borderTopColor: '#22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#166534', fontWeight: '600' }}>Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Verificar permissão se for necessário
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={
          <ProtectedRoute requiredPermission="dashboard">
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="maquinas" element={
          <ProtectedRoute requiredPermission="maquinas">
            <MaquinaPage />
          </ProtectedRoute>
        } />
        <Route path="monitores" element={
          <ProtectedRoute requiredPermission="monitores">
            <MonitorPage />
          </ProtectedRoute>
        } />
        <Route path="devolucao" element={
          <ProtectedRoute requiredPermission="devolucao">
            <DevolucaoPage />
          </ProtectedRoute>
        } />
        <Route path="kit" element={
          <ProtectedRoute requiredPermission="kit">
            <KitPage />
          </ProtectedRoute>
        } />

        <Route path="chamados" element={
          <ProtectedRoute requiredPermission="chamados">
            <ChamadosPage />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;