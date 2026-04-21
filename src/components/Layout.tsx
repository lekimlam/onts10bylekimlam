import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { useAuth } from '@/src/lib/auth-context';
import { BookOpen, Home, Layers, PlaySquare, Trophy, User, LogOut, Menu, X, Settings, Zap, MessageSquare, Laptop, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

export function Layout() {
  const { user, signOut, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isFabOpen, setIsFabOpen] = React.useState(false);

  const isLoginPage = location.pathname.startsWith('/login');

  // If loading auth, show a splash screen
  if (authLoading) {
    return (
      <div className="h-screen w-full bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl animate-bounce shadow-[0_0_50px_rgba(79,70,229,0.4)]">
            E
          </div>
          <p className="mt-8 text-indigo-400 font-bold uppercase tracking-[0.3em] animate-pulse">LeeKimLaam</p>
        </div>
      </div>
    );
  }

  // Strict Redirect for unauthenticated users
  if (!user && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  // Redirect logged-in users away from login pages
  if (user && isLoginPage) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  // If not logged in and on login page, hide the sidebar and background noise
  if (!user && isLoginPage) {
    return (
      <div className="h-screen flex flex-col font-sans overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  const navItems = user?.role === 'admin' 
    ? [
        { name: 'Tổng quan', path: '/admin', icon: Home },
        { name: 'Người dùng', path: '/admin', icon: User }, // Use anchors to section in Admin page or keep simple
        { name: 'Cài đặt', path: '/admin', icon: Settings },
      ]
    : [
        { name: 'Trang chủ', path: '/', icon: Home },
        { name: 'Ngữ pháp', path: '/grammar', icon: BookOpen },
        { name: 'Từ vựng (Flashcard)', path: '/vocabulary', icon: Layers },
        { name: 'Luyện tập', path: '/practice', icon: PlaySquare },
        { name: 'Thi thử', path: '/exam', icon: Trophy },
      ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="h-screen bg-[#F1F5F9] text-slate-900 font-sans overflow-hidden flex flex-col md:flex-row relative">
      {/* Global Cyber Effects */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-[0.4]"></div>
      <div className="cyber-scanline pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200 hidden md:flex flex-col p-6 space-y-8 z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 px-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">LeeKimLaam</span>
          </Link>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] font-semibold' 
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold italic border-2 border-amber-200 text-xl mb-2">
              V
            </div>
            <p className="font-bold text-slate-800 mb-2 truncate max-w-full">{user.username}</p>
            <div className="w-full text-center mb-3">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Cấp độ {user.level}</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[75%]"></div>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-2">{user.xp} XP</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={signOut}>Đăng xuất</Button>
          </div>
        ) : (
          <div className="mt-auto">
            <Link to="/login">
              <Button className="w-full">Đăng nhập</Button>
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Desktop Header */}
        <header className="h-20 bg-white/40 backdrop-blur-md border-b border-slate-200 px-8 hidden md:flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-orange-500">{user ? user.streak : 0} Ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="font-bold text-blue-500">{user ? user.xp : 0} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{user.username}</p>
                  <p className="text-xs text-slate-500">Người dùng</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 border-2 border-indigo-200 rounded-xl flex items-center justify-center overflow-hidden font-bold text-indigo-700">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-400">Khách</span>
            )}
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white/60 backdrop-blur-lg border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
              E
            </div>
            <span className="font-black text-slate-800 tracking-tight">LeeKimLaam</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 mr-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">🔥</span>
                  <span className="font-bold text-orange-500 text-sm">{user.streak}</span>
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 md:hidden"
                onClick={closeMenu}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-64 bg-white/90 backdrop-blur-2xl shadow-2xl z-50 p-6 flex flex-col md:hidden border-l border-white/20"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-lg">Menu</span>
                  <Button variant="ghost" size="icon" onClick={closeMenu}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] font-semibold' 
                            : 'text-slate-500 hover:bg-blue-50 hover:text-blue-500'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start gap-2 text-red-600" onClick={() => { signOut(); closeMenu(); }}>
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </Button>
                  ) : (
                    <Link to="/login" onClick={closeMenu}>
                      <Button className="w-full">Đăng nhập</Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              className="flex flex-col gap-3 mb-2"
            >
              <button 
                title="Giao diện Máy tính"
                className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 border-2 border-blue-50 hover:bg-blue-50 transition-all group"
              >
                <Laptop className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                title="Giao diện Điện thoại"
                className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 hover:bg-emerald-50 transition-all group"
              >
                <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                title="Hỗ trợ"
                className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border-2 border-indigo-50 hover:bg-indigo-50 transition-all group"
              >
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                title="Cài đặt nhanh"
                onClick={() => user?.role === 'admin' ? window.location.href = '/admin' : null}
                className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-amber-600 border-2 border-amber-50 hover:bg-amber-50 transition-all group"
              >
                <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 ${
            isFabOpen 
              ? 'bg-slate-900 text-white rotate-45' 
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)]'
          }`}
        >
          {isFabOpen ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
