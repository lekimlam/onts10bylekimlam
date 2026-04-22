import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth-context';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { db } from '@/src/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Trophy, Zap, Flame, Target, Star, Calendar, User, Mail, Shield, Award, BookOpen, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Profile() {
  const { user: currentUser, refreshUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        if (currentUser) {
          setProfileUser({ ...currentUser, id: currentUser.uid });
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(db, 'users', userId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfileUser({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Không tìm thấy hồ sơ người dùng.");
          navigate('/');
        }
      } catch (err: any) {
        toast.error("Lỗi khi tải hồ sơ: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) return null;

  const isOwnProfile = currentUser?.uid === profileUser.id || !userId;
  const isAdminViewing = currentUser?.role === 'admin' && !isOwnProfile;

  const stats = [
    { label: 'Cấp độ', value: profileUser.level || 1, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'Tổng XP', value: profileUser.xp || 0, icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { label: 'Chuỗi học', value: `${profileUser.streak || 0} ngày`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100' },
    { label: 'Xếp hạng', value: profileUser.rank || 'Bronze', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];


  const validatePassword = (pass: string) => {
    // Chữ đầu phải viết hoa, có ký tự đặc biệt, có số, tối thiểu 8 ký tự
    const regex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{7,}$/;
    return regex.test(pass);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error("Mật khẩu chưa đủ mạnh: Chữ đầu viết hoa, tối thiểu 8 ký tự, có số và ký tự đặc biệt");
      return;
    }

    setIsChangingPassword(true);
    try {
      // 1. Verify old password from DB
      const userRef = doc(db, 'users', profileUser.id);
      const userSnap = await getDoc(userRef);
      const dbPassword = userSnap.data()?.password;

      if (dbPassword !== oldPassword) {
        toast.error("Mật khẩu cũ không chính xác");
        setIsChangingPassword(false);
        return;
      }

      // 2. Update to new password
      await setDoc(userRef, { password: newPassword }, { merge: true });
      toast.success("Đổi mật khẩu thành công!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };


  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error("Vui lòng nhập tên tài khoản mới");
      return;
    }

    if (newUsername.trim() === profileUser.username) {
      toast.error("Tên mới không được trùng với tên cũ");
      return;
    }

    setIsChangingUsername(true);
    try {
      const userRef = doc(db, 'users', profileUser.id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Constraints check (not for admin)
      if (currentUser?.role !== 'admin') {
        const changesCount = userData?.usernameChangesCount || 0;
        const lastChangeAt = userData?.lastUsernameChangeAt;

        if (changesCount >= 5) {
          if (lastChangeAt) {
            const lastDate = new Date(lastChangeAt);
            const oneWeekLater = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (new Date() < oneWeekLater) {
              const diffTime = oneWeekLater.getTime() - new Date().getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              toast.error(`Bạn đã đổi tên 5 lần. Vui lòng đợi ${diffDays} ngày nữa để đổi tiếp.`);
              setIsChangingUsername(false);
              return;
            }
          }
        }
      }

      // Update
      await setDoc(userRef, { 
        username: newUsername.trim(),
        usernameChangesCount: (userData?.usernameChangesCount || 0) + 1,
        lastUsernameChangeAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Đổi tên tài khoản thành công!");
      setNewUsername('');
      if (isOwnProfile) {
        await refreshUser();
      }
      // Update local state for immediate feedback
      setProfileUser((prev: any) => ({ ...prev, username: newUsername.trim() }));
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setIsChangingUsername(false);
    }
  };

  const recentBadges = [
    { name: 'Người mới', icon: '🐣', date: 'Vừa xong' },
    { name: 'Chăm chỉ', icon: '📚', date: 'Hôm qua' },
    { name: 'Chiến thần flashcard', icon: '⚡', date: '2 ngày trước' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {isAdminViewing && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold"
          >
            <ChevronLeft size={20} /> Quay lại Quản lý Người dùng
          </Button>
        </motion.div>
      )}

      {/* Header Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl">
           <Trophy size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-xl border-4 border-white/30 flex items-center justify-center text-5xl font-black shadow-2xl">
              {profileUser.username?.charAt(0).toUpperCase()}
           </div>
           <div className="text-center md:text-left">
              <h1 className="text-4xl font-black mb-2 tracking-tight">{profileUser.username}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                 <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold border border-white/10 flex items-center gap-2">
                    <Mail size={14} /> {profileUser.email}
                 </span>
                 <span className="px-4 py-1.5 bg-amber-400 text-amber-900 rounded-full text-sm font-black border border-amber-300 flex items-center gap-2 shadow-lg shadow-amber-900/20">
                    <Star size={14} fill="currentColor" /> HỌC VIÊN XUẤT SẮC
                 </span>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-2 border-slate-100 shadow-none hover:border-indigo-100 transition-colors rounded-3xl overflow-hidden">
               <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                     <stat.icon size={24} />
                  </div>
                  <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Activities */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="rounded-[32px] border-2 border-slate-100 shadow-none overflow-hidden">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Target className="text-indigo-600" /> Tiến độ học tập
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div className="text-sm font-bold text-slate-600">UNIT 10 - ENVIRONMENT (Đang học)</div>
                       <div className="text-sm font-black text-indigo-600">85%</div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                       />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <BookOpen size={14} /> Từ vựng đã học
                       </p>
                       <p className="text-2xl font-black text-slate-800">128 <span className="text-sm font-bold text-slate-400 text-indigo-100">/ 500</span></p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Flame size={14} /> Điểm trung bình thi thử
                       </p>
                       <p className="text-2xl font-black text-slate-800">8.5 <span className="text-sm font-bold text-slate-400">/ 10</span></p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {(isOwnProfile || isAdminViewing) && (
              <Card className="rounded-[32px] border-2 border-slate-100 shadow-none overflow-hidden mb-8">
                 <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                       <User className="text-indigo-600" /> Đổi tên tài khoản
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 pt-4">
                    <form onSubmit={handleUpdateUsername} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên tài khoản mới</label>
                          <div className="flex flex-col md:flex-row gap-4">
                             <Input 
                                placeholder="Nhập tên mới..."
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="bg-slate-50 border-slate-100 focus:border-indigo-500 h-12 rounded-2xl transition-all flex-1"
                             />
                             <Button 
                                type="submit" 
                                disabled={isChangingUsername}
                                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black px-8"
                             >
                                {isChangingUsername ? '...' : 'CẬP NHẬT TÊN'}
                             </Button>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium px-1">
                             Lưu ý: Bồ chỉ được đổi tên tối đa 5 lần. Nếu đã đổi 5 lần, bồ phải đợi 1 tuần để đổi tiếp. 
                             (Đã đổi: <span className="text-indigo-600 font-black">{profileUser.usernameChangesCount || 0}/5</span> lần)
                          </p>
                       </div>
                    </form>
                 </CardContent>
              </Card>
           )}

           {isOwnProfile && (
              <Card className="rounded-[32px] border-2 border-slate-100 shadow-none overflow-hidden">
                 <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                       <Shield className="text-emerald-600" /> Đổi mật khẩu
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 pt-4">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu cũ</label>
                             <Input 
                                type="password"
                                placeholder="••••••••"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="bg-slate-50 border-slate-100 focus:border-indigo-500 h-12 rounded-2xl transition-all"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu mới</label>
                             <Input 
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-slate-50 border-slate-100 focus:border-indigo-500 h-12 rounded-2xl transition-all"
                             />
                             <p className="text-[10px] text-slate-400 font-medium px-1">
                                Yêu cầu: Tối thiểu 8 ký tự, chữ đầu viết hoa, có số và ký tự đặc biệt (!@#...)
                             </p>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Xác nhận mật khẩu</label>
                             <Input 
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-slate-50 border-slate-100 focus:border-indigo-500 h-12 rounded-2xl transition-all"
                             />
                          </div>
                       </div>
                       <Button 
                          type="submit" 
                          disabled={isChangingPassword}
                          className="w-full md:w-fit px-12 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                       >
                          {isChangingPassword ? (
                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                             <>CẬP NHẬT MẬT KHẨU MỚI</>
                          )}
                       </Button>
                    </form>
                 </CardContent>
              </Card>
           )}
        </div>

        {/* Badges/Achivements */}
        <div className="space-y-8">
           <Card className="rounded-[32px] border-2 border-slate-100 shadow-none overflow-hidden h-fit">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Award className="text-amber-500" /> Huy hiệu
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                 <div className="space-y-6">
                    {recentBadges.map((badge, i) => (
                       <motion.div 
                          key={i} 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.8 + (i * 0.1) }}
                          className="flex items-center gap-4 group"
                        >
                          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-amber-50 group-hover:border-amber-100 transition-all">
                             {badge.icon}
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{badge.name}</p>
                             <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <Calendar size={12} /> {badge.date}
                             </p>
                          </div>
                       </motion.div>
                    ))}
                 </div>
                 <Button variant="ghost" className="w-full mt-8 rounded-2xl font-bold text-indigo-600 hover:bg-indigo-50">
                    Xem tất cả (12)
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
