import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AlertTriangle, Hammer, Clock } from 'lucide-react';
import { useAuth } from './auth-context';

interface MaintenanceContextType {
  isMaintenance: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType>({ isMaintenance: false });

export const useMaintenance = () => useContext(MaintenanceContext);

export const MaintenanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Listen to global settings for maintenance mode
    const unsubscribe = onSnapshot(doc(db, 'settings', 'maintenance'), (doc) => {
      if (doc.exists()) {
        setIsMaintenance(doc.data().active || false);
      }
    }, (error) => {
      // If permission denied or offline, assume no maintenance or let the connectivity test handle it
      console.log("Maintenance check skipped or restricted", error.message);
    });

    return () => unsubscribe();
  }, []);

  // Check if we should ignore maintenance mode for this user/path
  const isAdmin = user?.role === 'admin';
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
  
  const shouldBlock = isMaintenance && !isAdmin && !isLoginPage;

  if (shouldBlock && !authLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-6 text-center overflow-hidden">
        {/* Animated Background for maintenance */}
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px] animate-pulse"></div>
        </div>
        
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[48px] shadow-2xl relative z-10">
          <div className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-bounce">
            <Hammer size={48} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4">Hệ Thống <br/><span className="text-amber-400">Đang Bảo Trì</span></h1>
          <p className="text-slate-400 font-medium mb-8 leading-relaxed">
            Chào bồ! LeeKimLaam đang được nâng cấp để mang lại trải nghiệm học tập tốt hơn. Chúng tôi sẽ quay lại trong giây lát!
          </p>
          
          <div className="flex items-center justify-center gap-3 text-amber-500 font-bold bg-amber-500/10 py-3 px-6 rounded-2xl border border-amber-500/20">
            <Clock size={20} /> Dự kiến hoàn thành: 2 tiếng nữa
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">lekimlam coder team</p>
            {/* Hidden admin access */}
            <a href="/login/admin" className="text-[10px] text-slate-700 hover:text-slate-500 transition-colors">Admin Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MaintenanceContext.Provider value={{ isMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
};
