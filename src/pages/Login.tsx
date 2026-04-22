import React, { useState } from 'react';
import { useAuth } from '@/src/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '@/src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

export function Login() {
  const location = useLocation();
  const isAdminPath = location.pathname === '/login/admin';
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pseudo email mapping for username login
  const getEmail = (uname: string) => {
    if (uname.includes('@')) return uname;
    return `${uname}@eng10.pro`;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Đăng nhập bằng Google thành công!");
      navigate(isAdminPath ? '/admin' : '/');
    } catch (error: any) {
      if (error.message.includes('auth/configuration-not-found')) {
        toast.error("Vui lòng bật Google Login trong Firebase Console!");
      } else if (error.message.includes('auth/popup-closed-by-user')) {
        // Do nothing
      } else {
        toast.error("Lỗi Google Login: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }

    // Strict Admin check for /login/admin path
    if (isAdminPath) {
      if (username.toLowerCase() !== 'lekimlam' || password !== '16052011') {
        toast.error("Sai thông tin quản trị viên!");
        return;
      }
    } else {
      // Normal /login path: Block the admin account lekimlam
      if (username.toLowerCase() === 'lekimlam') {
        toast.error("Tài khoản này của admin không thể đăng nhập vui lòng tạo tài khoản mới");
        return;
      }
    }

    setLoading(true);
    const email = getEmail(username.trim().toLowerCase());
    
    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          toast.success("Đăng nhập thành công!");
          navigate(isAdminPath ? '/admin' : '/');
        } catch (err: any) {
          if (username.toLowerCase() === 'lekimlam' && (err.message.includes('auth/invalid-credential') || err.message.includes('auth/user-not-found'))) {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              // Also store in Firebase so admin can see info
              await setDoc(doc(db, 'users', auth.currentUser!.uid), {
                username: 'AdminLeKimLam',
                email: email,
                role: 'admin',
                password: password, // As requested, store password
                createdAt: new Date().toISOString()
              }, { merge: true });
              toast.success("Đã khởi tạo tài khoản Admin!");
              navigate('/admin');
              return;
            } catch (createErr: any) {
              throw createErr;
            }
          }
          throw err;
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Store password in doc so admin can see it (as requested)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: username.trim(),
          email: email,
          role: 'user',
          password: password, // As requested
          xp: 0,
          level: 1,
          rank: 'Bronze',
          streak: 0,
          createdAt: new Date().toISOString()
        });
        toast.success("Đăng ký thành công! Chào mừng bạn.");
        navigate('/');
      }
    } catch (error: any) {
      const msg = error.message;
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
        toast.error("Tài khoản hoặc mật khẩu không đúng.");
      } else if (msg.includes('auth/email-already-in-use')) {
        toast.error("Tài khoản đã tồn tại. Vui lòng đăng nhập.");
      } else if (msg.includes('auth/configuration-not-found') || msg.includes('auth/operation-not-allowed')) { 
        toast.error("Tính năng đăng nhập bằng Email/Mật khẩu chưa được bật trong Firebase!");
      } else {
        toast.error("Có lỗi xảy ra: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center py-16 h-full min-h-[500px] overflow-hidden bg-slate-950">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute w-full h-full object-cover opacity-30 scale-110 blur-[2px]"
        >
          <source src="/pcbylekimlam.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-purple-900/40"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-[92%] max-w-md relative z-10 p-0.5 md:p-1"
      >
        <div className="led-border bg-slate-900/80 backdrop-blur-xl animate-neon rounded-[2.5rem]">
          <Card className="led-content p-6 md:p-8 border-none shadow-none bg-transparent text-white">
            <CardHeader className="text-center pb-4 md:pb-6 px-0 pt-0">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-2xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  {isAdminPath ? "Quản trị viên" : (isLogin ? "Đăng nhập" : "Tạo tài khoản")}
                </CardTitle>
                <p className="text-[10px] md:text-sm font-bold text-indigo-300/60 mt-2 md:mt-3 uppercase tracking-[0.2em]">
                  {isAdminPath 
                    ? "Cổng điều khiển hệ thống" 
                    : (isLogin ? "Tiếp tục hành trình học tập" : "Gia nhập thế hệ học tập mới")
                  }
                </p>
              </motion.div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-1.5 md:space-y-2 group">
                  <label className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1 group-focus-within:text-indigo-300 transition-colors">Tên đăng nhập / Email</label>
                  <Input 
                    placeholder="VD: lekimlam" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-indigo-500 h-11 md:h-14 rounded-xl md:rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 transition-all font-bold text-sm md:text-base"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2 group">
                  <label className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1 group-focus-within:text-indigo-300 transition-colors">Mật mã bảo mật</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-indigo-500 h-11 md:h-14 rounded-xl md:rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 transition-all font-bold text-sm md:text-base"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 md:h-14 text-base md:text-lg rounded-xl md:rounded-2xl mt-4 md:mt-8 font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform active:scale-[0.98] transition-all border-none uppercase tracking-widest" 
                  disabled={loading}
                >
                  {loading ? "ĐANG XÁC THỰC..." : (isLogin ? "BẮT ĐẦU NGAY" : "TẠO TÀI KHOẢN")}
                </Button>
              </form>

              <div className="relative my-6 md:my-10">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-[9px] md:text-[10px] uppercase font-black tracking-[0.3em]">
                  <span className="bg-[#0f172a] px-3 md:px-4 text-white/30">Phương thức</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 md:h-14 text-xs md:text-sm rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-lg"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Liên kết Google
              </Button>
              
              {!isAdminPath && (
                <div className="mt-6 md:mt-10 text-center text-[10px] md:text-[11px] font-black uppercase tracking-widest text-indigo-400/60">
                  {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-indigo-400 hover:text-white transition-colors underline decoration-2 underline-offset-4"
                    disabled={loading}
                  >
                    {isLogin ? "Tạo ngay" : "Đăng nhập ngay"}
                  </button>
                </div>
              )}
              
              {isAdminPath && (
                <div className="mt-10 p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[11px] text-indigo-300 font-bold uppercase tracking-widest flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                    Đang ghi đè hệ thống
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-white/40">USER:</span> lekimlam
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-white/40">PASS:</span> 16052011
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
