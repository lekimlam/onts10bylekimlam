import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/auth-context';
import { Navigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Users, BookOpen, Settings, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { collection, query, getDocs, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export function Admin() {
  const { user } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  // Strict check: Only lekimlam account can see this
  if (!user || user.email !== 'lekimlam@eng10.pro') {
    return <Navigate to="/" />;
  }

  const adminCards = [
    { title: 'Người dùng', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12% tuần này' },
    { title: 'Bài học', value: '56', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: 'Mới cập nhật: Qúa khứ đơn' },
    { title: 'Lượt thi thử', value: '8,420', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+45% tháng này' },
  ];

  return (
    <div className="max-w-6xl mx-auto h-full pt-4 pb-8 space-y-8">
      {/* Header section */}
      <div className="p-8 rounded-[32px] bg-white border-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Khu vực quản trị</span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 size={12} /> Hệ thống ổn định
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800">Chào Admin lekimlam!</h1>
          <p className="text-slate-500 font-medium">Bảng điều khiển quản lý hệ thống luyện thi tiếng Anh 10.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold bg-white text-slate-700 border-2 border-slate-100 flex items-center gap-2">
            <Settings size={18} /> Cài đặt hệ thống
          </Button>
          <Button className="h-12 px-6 rounded-2xl font-bold bg-indigo-600 text-white shadow-none hover:bg-indigo-700">
            Tạo bài học mới
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
        {/* Recent updates */}
        <div className="bg-white p-8 rounded-[32px] border-2 border-slate-200 shadow-none">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
             <Clock className="text-indigo-600" /> Hoạt động gần đây
          </h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800">Cập nhật Unit {i + 5}: Grammer Practice</div>
                  <div className="text-sm text-slate-400 font-medium">15 phút trước • Người đăng: lekimlam</div>
                </div>
                <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-transparent px-2">Cập nhật</Button>
              </div>
            ))}
          </div>
        </div>

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
                <p className="text-sm font-medium">Lưu ý: Khi bật chế độ bảo trì, hệ thống sẽ hiện thông báo bảo trì cho mọi người dùng. Hãy cẩn thận khi sử dụng!</p>
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
      </div>
    </div>
  );
}
