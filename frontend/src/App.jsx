import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import MedicalDisciplinary from './pages/MedicalDisciplinary';
import ECDashboard from './pages/ECDashboard';
import ECActivitiesList from './pages/ECActivitiesList';
import ECStudentPortfolio from './pages/ECStudentPortfolio';
import ECCertificateVault from './pages/ECCertificateVault';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Authenticating user...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/results" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Toaster position="top-right" />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medical-disciplinary"
                element={
                  <ProtectedRoute>
                    <MedicalDisciplinary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/extra-curricular"
                element={
                  <ProtectedRoute>
                    <ECDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/extra-curricular/activities"
                element={
                  <ProtectedRoute>
                    <ECActivitiesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/extra-curricular/portfolio"
                element={
                  <ProtectedRoute>
                    <ECStudentPortfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/extra-curricular/certificates"
                element={
                  <ProtectedRoute>
                    <ECCertificateVault />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/results" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
