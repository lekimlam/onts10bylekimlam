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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-10"></div>
          
          {/* Floating Blobs */}
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full"
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-indigo-500/10 blur-[120px] rounded-full"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            damping: 20,
            stiffness: 100
          }}
          className="max-w-lg w-full bg-[#1e293b]/80 backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] relative z-10"
        >
          {/* Hammer Icon with swing animation */}
          <motion.div 
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mb-10 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.2)]"
          >
            <Hammer size={40} className="text-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Hệ Thống <br/>
              <span className="text-amber-500">Đang Bảo Trì</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 font-medium text-lg mb-10 leading-relaxed"
          >
            Xin lỗi bạn nhieeufs! LeeKimLaam đang được nâng cấp để mang lại trải nghiệm học tập tốt hơn. Chúng tôi sẽ quay lại trong giây lát!
          </motion.p>
          
          {/* Pulsing Status Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 0 0px rgba(245,158,11,0)", "0 0 0 10px rgba(245,158,11,0.05)", "0 0 0 0px rgba(245,158,11,0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center justify-center gap-3 text-amber-500 font-bold bg-amber-500/5 py-4 px-8 rounded-2xl border border-amber-500/20 max-w-sm mx-auto"
            >
              <Clock size={20} className="animate-spin-slow" style={{ animationDuration: '4s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />
              <span>Dự kiến hoàn thành: vài phút tới</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-white/5 flex flex-col items-center gap-4"
          >
            <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em]">lekimlam coder team</p>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://www.facebook.com/LeKimLaam160511" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-[12px] text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest font-black shadow-lg shadow-amber-500/5 rotate-[-1deg] hover:rotate-0"
            >
              Liên hệ admin
            </motion.a>
          </motion.div>
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
