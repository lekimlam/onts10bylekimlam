import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
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
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/login/admin';
  
  const shouldBlock = isMaintenance && !isAdmin && !isAdminRoute;

  if (shouldBlock && !authLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex items-center justify-center p-6 text-center overflow-hidden font-sans">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-[#1e293b]/80 backdrop-blur-2xl border border-white/5 p-12 rounded-[4rem] shadow-2xl relative z-10"
        >
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mb-10 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <Hammer size={40} className="text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Hệ Thống <br/>
            <span className="text-amber-500">Đang Bảo Trì</span>
          </h1>
          
          <p className="text-slate-400 font-medium text-lg mb-10 leading-relaxed">
            Xin lỗi bạn nhieeufs! LeeKimLaam đang được nâng cấp để mang lại trải nghiệm học tập tốt hơn. Chúng tôi sẽ quay lại trong giây lát!
          </p>
          
          <div className="flex items-center justify-center gap-3 text-amber-500 font-bold bg-amber-500/5 py-4 px-8 rounded-2xl border border-amber-500/20 mb-12 max-w-sm mx-auto">
            <Clock size={20} /> Dự kiến hoàn thành: vài phút tới
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em]">lekimlam coder team</p>
            <a href="https://www.facebook.com/LeKimLaam160511" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold">Liên hệ admin</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <MaintenanceContext.Provider value={{ isMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
};
