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
import { AuthProvider } from './lib/auth-context';
import './index.css';

// Placeholder empty components for other pages to avoid errors
// const Practice = () => <div className="h-full flex items-center justify-center"><div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md"><span className="text-4xl mb-4 block">🚧</span><h2 className="text-2xl font-black text-slate-800 mb-2">Trang đang xây dựng</h2><p className="text-slate-500 font-medium">Tính năng Luyện Tập sẽ sớm ra mắt. Vui lòng quay lại sau!</p></div></div>;
const Exam = () => <div className="h-full flex items-center justify-center"><div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md"><span className="text-4xl mb-4 block">🚧</span><h2 className="text-2xl font-black text-slate-800 mb-2">Trang đang xây dựng</h2><p className="text-slate-500 font-medium">Tính năng Thi Thử sẽ sớm ra mắt. Vui lòng quay lại sau!</p></div></div>;
const Admin = () => <div className="h-full flex items-center justify-center"><div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md"><span className="text-4xl mb-4 block">🚧</span><h2 className="text-2xl font-black text-slate-800 mb-2">Trang đang xây dựng</h2><p className="text-slate-500 font-medium">Khu vực Quản Trị sẽ sớm ra mắt. Vui lòng quay lại sau!</p></div></div>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
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
    </AuthProvider>
  </StrictMode>
);
