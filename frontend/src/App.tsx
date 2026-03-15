import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

import { Layout } from './components/Layout';
import { LoginScreen } from './screens/Auth/LoginScreen';
import { RegisterScreen } from './screens/Auth/RegisterScreen';
import { DashboardScreen } from './screens/Dashboard/DashboardScreen';

import { TontineDetailsScreen } from './screens/Tontines/TontineDetailsScreen';
import { CreateTontineScreen } from './screens/Tontines/CreateTontineScreen';
import { ExploreScreen } from './screens/Tontines/ExploreScreen';
import { ConfirmTontineScreen } from './screens/Tontines/ConfirmTontineScreen';
import { InviteMembersScreen } from './screens/Tontines/InviteMembersScreen';
import { ContratScreen } from './screens/Tontines/ContratScreen';
import { PaymentHistoryScreen } from './screens/Tontines/PaymentHistoryScreen';
import { DistributionScreen } from './screens/Tontines/DistributionScreen';
import { AdminTontineScreen } from './screens/Tontines/AdminTontineScreen';
import { ProfileScreen } from './screens/Profile/ProfileScreen';
import { StatistiquesCotisationsScreen } from './screens/Cotisations/StatistiquesCotisationsScreen';
import { CotisationsScreen } from './screens/Cotisations/CotisationsScreen';
import { NotificationsScreen } from './screens/Notifications/NotificationsScreen';
import { ChatScreen } from './screens/Chat/ChatScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <DashboardScreen />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tontines/:id" element={
          <ProtectedRoute>
            <Layout>
              <TontineDetailsScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/explore" element={
          <ProtectedRoute>
            <Layout>
              <ExploreScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/create" element={
          <ProtectedRoute>
            <Layout>
              <CreateTontineScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/create/confirm" element={
          <ProtectedRoute>
            <Layout>
              <ConfirmTontineScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/invite" element={
          <ProtectedRoute>
            <Layout>
              <InviteMembersScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/contrat" element={
          <ProtectedRoute>
            <Layout>
              <ContratScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/payments" element={
          <ProtectedRoute>
            <Layout>
              <PaymentHistoryScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/distributions" element={
          <ProtectedRoute>
            <Layout>
              <DistributionScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/admin" element={
          <ProtectedRoute>
            <Layout>
              <AdminTontineScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfileScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/cotisations/stats" element={
          <ProtectedRoute>
            <Layout>
              <StatistiquesCotisationsScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/cotisations" element={
          <ProtectedRoute>
            <Layout>
              <CotisationsScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout>
              <NotificationsScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tontines/:id/chat" element={
          <ProtectedRoute>
            <Layout>
              <ChatScreen />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
