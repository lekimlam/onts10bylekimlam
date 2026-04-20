import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Vocabulary } from './pages/Vocabulary';
import { Grammar } from './pages/Grammar';
import { Practice } from './pages/Practice';
import { Exam } from './pages/Exam';
import { Admin } from './pages/Admin';
import { AuthProvider } from './lib/auth-context';
import { MaintenanceProvider } from './lib/maintenance-context';
import './index.css';
import { testFirestoreConnection } from './lib/firebase';

// Test connection on boot
testFirestoreConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MaintenanceProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="login/admin" element={<Login />} />
              <Route path="grammar" element={<Grammar />} />
              <Route path="vocabulary" element={<Vocabulary />} />
              <Route path="practice" element={<Practice />} />
              <Route path="exam" element={<Exam />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MaintenanceProvider>
    </AuthProvider>
  </StrictMode>
);
