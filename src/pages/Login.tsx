import React, { useState } from 'react';
import { useAuth } from '@/src/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/src/lib/firebase';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

export function Login() {
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
      navigate('/');
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

    setLoading(true);
    const email = getEmail(username.trim().toLowerCase());
    
    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          toast.success("Đăng nhập thành công!");
          navigate('/');
        } catch (err: any) {
          if (username.toLowerCase() === 'lekimlam' && (err.message.includes('auth/invalid-credential') || err.message.includes('auth/user-not-found'))) {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              toast.success("Đã khởi tạo tài khoản Admin!");
              navigate('/');
              return;
            } catch (createErr: any) {
              throw createErr;
            }
          }
          throw err;
        }
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
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
    <div className="flex justify-center items-center py-16 h-full min-h-[500px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="p-8">
          <CardHeader className="text-center pb-6 px-0 pt-0">
            <CardTitle className="text-3xl font-black text-slate-800">
              {isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
            </CardTitle>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {isLogin ? "Đăng nhập để tiếp tục hành trình học tập." : "Gia nhập để luyện thi tiếng Anh 10."}
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tên đăng nhập</label>
                <Input 
                  placeholder="VD: lekimlam" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-50 border-slate-200 h-14"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200 h-14"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg rounded-xl mt-6 font-black" disabled={loading}>
                {loading ? "ĐANG XỬ LÝ..." : (isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ")}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Hoặc</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-14 text-lg rounded-xl font-bold flex items-center justify-center gap-3 border-2 border-slate-100 hover:bg-slate-50"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              Đăng nhập với Google
            </Button>
            
            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="font-bold text-indigo-600 hover:underline"
                disabled={loading}
              >
                {isLogin ? "Tạo ngay" : "Đăng nhập"}
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-sm text-amber-800">
              <p className="font-bold mb-1 flex items-center gap-2"><span className="text-lg">👑</span> Dành cho Admin:</p>
              <p className="font-medium">Hệ thống có tài khoản demo: <br/>username: <b className="font-bold">lekimlam</b> <br/> password: <b className="font-bold">16052011</b></p>
              <p className="mt-2 text-xs italic text-amber-600">
                (Lưu ý: Nếu bị lỗi, hãy đảm bảo bạn đã bật <b>Email/Password</b> trong Firebase Auth)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
