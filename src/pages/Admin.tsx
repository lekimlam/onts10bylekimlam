import React, { useState, useEffect } from 'react';
import { useAuth, AppUser } from '@/src/lib/auth-context';
import { Navigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Users, BookOpen, Settings, AlertTriangle, CheckCircle2, Clock, Trash2, Key, Mail, Shield, User as UserIcon } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchMaintenance = async () => {
      const docRef = doc(db, 'settings', 'maintenance');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setIsMaintenance(snap.data().active || false);
      }
    };
    fetchMaintenance();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(list);
    } catch (err: any) {
      toast.error("Lỗi khi tải danh sách người dùng: " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const toggleMaintenance = async () => {
    setUpdating(true);
    try {
      const docRef = doc(db, 'settings', 'maintenance');
      await setDoc(docRef, { active: !isMaintenance }, { merge: true });
      setIsMaintenance(!isMaintenance);
      toast.success(`Đã ${!isMaintenance ? 'BẬT' : 'TẮT'} chế độ bảo trì`);
    } catch (err: any) {
      toast.error("Lỗi khi cập nhật bảo trì: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteUserAtAdmin = async (userId: string) => {
    if (!window.confirm("Bồ có chắc muốn xóa tài khoản này không? Thao tác này không thể hoàn tác!")) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsersList(prev => prev.filter(u => u.id !== userId));
      toast.success("Đã xóa tài khoản thành công khỏi dữ liệu!");
      toast.error("Lưu ý: Bạn cần vào Firebase Auth để xóa ID đăng nhập chính thức.");
    } catch (err: any) {
      toast.error("Lỗi khi xóa: " + err.message);
    }
  };

  // Strict check: Only admin account can see this
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const adminCards = [
    { title: 'Người dùng', value: usersList.length || 'Sẵn sàng', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Nhấn tab Người dùng để xem' },
    { title: 'Bài học', value: '56', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: 'Mới cập nhật: Qúa khứ đơn' },
    { title: 'Lượt thi thử', value: '8,420', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+45% tháng này' },
  ];

  return (
    <div className="max-w-6xl mx-auto h-full pt-4 pb-20 md:pb-8 space-y-8 px-4 md:px-0">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white border-2 border-slate-200 rounded-3xl w-full md:w-fit overflow-x-auto no-scrollbar whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Quản lý Người dùng
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Hệ thống
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Header section */}
          <div className="p-6 md:p-8 rounded-[32px] bg-white border-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">Khu vực quản trị</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={12} /> Hệ thống ổn định
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800">Chào Admin {user.username}!</h1>
              <p className="text-slate-500 font-medium text-sm md:text-base">Bảng điều khiển quản lý hệ thống luyện thi tiếng Anh 10.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button onClick={() => setActiveTab('settings')} variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-2xl font-bold bg-white text-slate-700 border-2 border-slate-100 flex items-center justify-center gap-2">
                <Settings size={18} /> Cài đặt
              </Button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminCards.map((card, i) => (
              <Card key={i} className="p-1 border-2 border-slate-100 shadow-none hover:border-slate-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                      <card.icon className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</div>
                  </div>
                  <div className="text-4xl font-black text-slate-800 mb-1">{card.value}</div>
                  <div className="text-sm font-medium text-slate-500">{card.trend}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[32px] border-2 border-slate-200 shadow-none">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                 <Clock className="text-indigo-600" /> Hoạt động gần đây
              </h2>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">Cập nhật Unit {i + 5}: {i===1 ? 'Quá khứ đơn' : i===2 ? 'Hiện tại tiếp diễn' : 'Tương lai gần'}</div>
                      <div className="text-sm text-slate-400 font-medium">15 phút trước • Người đăng: lekimlam</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Quản lý Người dùng</h2>
                <p className="text-slate-500 font-medium">Danh sách toàn bộ tài khoản học viên và quản trị viên.</p>
              </div>
              <Button onClick={fetchUsers} disabled={loadingUsers} className="rounded-2xl h-12 px-6 font-bold flex items-center gap-2">
                <Clock size={18} className={loadingUsers ? 'animate-spin' : ''} />
                {loadingUsers ? 'Đang tải...' : 'Làm mới dữ liệu'}
              </Button>
           </div>

           <div className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 text-xs uppercase tracking-widest">
                         <th className="px-6 py-5">Người dùng</th>
                         <th className="px-6 py-5">Định danh</th>
                         <th className="px-6 py-5">Vai trò</th>
                         <th className="px-6 py-5">Mật khẩu</th>
                         <th className="px-6 py-5">Ngày tạo</th>
                         <th className="px-6 py-5 text-right">Thao tác</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {usersList.length === 0 && !loadingUsers ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold italic">Chưa có người dùng nào được tạo.</td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800">{u.username}</div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{u.id.substring(0, 8)}...</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 mb-1">
                                    <Mail size={14} className="text-slate-400" /> {u.email}
                                  </div>
                                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                    <UserIcon size={12} /> {u.email?.split('@')[0]}
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                 <Shield size={10} /> {u.role === 'admin' ? 'Quản trị' : 'Thành viên'}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2 font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl w-fit border border-indigo-100">
                                  <Key size={14} className="text-indigo-400" /> {u.password || '••••••••'}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-400">
                               {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '---'}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button 
                                onClick={() => deleteUserAtAdmin(u.id)}
                                variant="ghost" 
                                className="w-10 h-10 p-0 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                disabled={u.role === 'admin'}
                               >
                                 <Trash2 size={18} />
                               </Button>
                            </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Maintenance Controls */}
           <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Settings size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                 <AlertTriangle className="text-amber-400" /> Hệ thống Bảo trì
              </h2>
              <p className="text-slate-400 font-medium mb-8">Tính năng này cho phép tạm đóng hệ thống để cập nhật hoặc sửa lỗi.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <div className="font-bold text-lg">Chế độ bảo trì</div>
                    <div className="text-sm text-slate-400">Ẩn toàn bộ tính năng và hiện thông báo bảo trì</div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div 
                      onClick={toggleMaintenance}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isMaintenance ? 'bg-amber-500' : 'bg-slate-700'}`}
                     >
                        <motion.div 
                          animate={{ x: isMaintenance ? 24 : 0 }}
                          className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                     </div>
                     <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                       {isMaintenance ? 'ON' : 'OFF'}
                     </span>
                  </div>
                </div>

                <div className="p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-200">
                  <p className="text-sm font-medium">Lưu ý: Khi bật chế độ bảo trì, người dùng sẽ không thể truy cập các trang học tập. Chỉ trang đăng nhập admin mới mở.</p>
                </div>

                <Button 
                  onClick={toggleMaintenance}
                  disabled={updating}
                  className="w-full h-14 rounded-2xl font-black bg-indigo-600 text-white shadow-none hover:bg-indigo-700 border-none"
                >
                  {updating ? 'ĐANG CẬP NHẬT...' : (isMaintenance ? 'TẮT CHẾ ĐỘ BẢO TRÌ' : 'BẬT CHẾ ĐỘ BẢO TRÌ')}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border-2 border-slate-200 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2">Hỗ trợ Cài đặt</h3>
             <p className="text-slate-500 font-medium mb-6">Liên hệ bộ phận kỹ thuật nếu bồ gặp vấn đề về bảo mật hoặc cấu hình.</p>
             <Button variant="outline" className="rounded-xl font-bold">Hỗ trợ ngay</Button>
          </div>
        </div>
      )}
    </div>
  );
}
