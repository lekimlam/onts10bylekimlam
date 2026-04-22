import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { BookOpen, Trophy, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/lib/auth-context';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { day: 'T2', xp: 400 },
  { day: 'T3', xp: 300 },
  { day: 'T4', xp: 600 },
  { day: 'T5', xp: 800 },
  { day: 'T6', xp: 500 },
  { day: 'T7', xp: 900 },
  { day: 'CN', xp: 1200 },
];

export function Home() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snap) => {
      const topUsers = snap.docs.map((doc, i) => ({
        id: doc.id,
        rank: i + 1,
        ...doc.data()
      }));
      setLeaderboard(topUsers);
    });
    return () => unsubscribe();
  }, []);
  const features = [
    { icon: BookOpen, title: 'Ngữ pháp toàn diện', desc: 'Rèn luyện các chủ điểm ngữ pháp cốt lõi cho kỳ thi vào 10.', color: 'text-blue-500', bg: 'bg-blue-50/50' },
    { icon: Sparkles, title: 'Flashcard thông minh', desc: 'Học từ vựng hiệu quả với bộ flashcard lật 3D và ôn tập cách quãng.', color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
    { icon: Target, title: 'Luyện tập đa dạng', desc: 'Nhiều dạng bài tập bám sát cấu trúc đề thi thực tế.', color: 'text-amber-500', bg: 'bg-amber-50/50' },
    { icon: Trophy, title: 'Thi thử & Chấm điểm', desc: 'Trải nghiệm như thi thật, nhận kết quả và phân tích chi tiết.', color: 'text-purple-500', bg: 'bg-purple-50/50' },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent pb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-left max-w-6xl mx-auto w-full pt-4 px-4 md:px-0 relative z-10">
        
        {/* Main Hero Card */}
        <div className="col-span-1 border-0 md:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative overflow-hidden bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] p-6 md:p-8 rounded-[32px] border-2 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
          >
            <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 inline-block">Nền tảng ôn thi lớp 10</span>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Học tiếng Anh chuẩn <br className="hidden md:block" /> đỗ nguyện vọng 1</h1>
              <p className="text-indigo-100 text-base md:text-lg mb-8 max-w-md">
                Trải nghiệm học tập hiện đại, cá nhân hóa với hệ thống bài tập phong phú, flashcard tương tác và các bài thi thử như thật.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/practice">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-white text-indigo-600 shadow-[0_4px_0_#4f46e5] hover:-translate-y-[2px] active:translate-y-[2px] active:shadow-[0_2px_0_#4f46e5] border-0 transition-none">
                    BẮT ĐẦU HỌC NAY
                  </Button>
                </Link>
                <Link to="/vocabulary">
                   <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl bg-indigo-900/40 text-white border-0 shadow-[0_4px_0_rgba(49,46,129,0.5)] hover:-translate-y-[2px] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(49,46,129,0.5)] transition-none backdrop-blur-sm">
                     FLASHCARD
                   </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">💻</div>
                  <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Tối ưu cho Máy tính</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">📱</div>
                  <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Tương thích Điện thoại</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-16 opacity-20 text-[200px] font-black pointer-events-none">A+</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-indigo-600" /> THỐNG KÊ HỌC TẬP
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">XP tích lũy trong 7 ngày qua</p>
              </div>
              <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-2">
                 <span className="text-xl">🔥</span>
                 <span className="text-lg font-black text-indigo-600">7 Ngày liên tiếp</span>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorXp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Features Grid below hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="h-full bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:border-indigo-400/50 hover:-translate-y-1 transition-all group">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl font-bold text-xl ${feature.bg} ${feature.color} border border-indigo-100 group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Feature</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar/Ranking section on the right */}
        <div className="col-span-1 md:col-span-4 space-y-6 pb-20 md:pb-0">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span>🎯</span> MỤC TIÊU HÀNG NGÀY
            </h3>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 uppercase tracking-widest italic">Kinh nghiệm (XP)</span>
                  <span className="text-indigo-600">350 / 500</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 rounded-full w-[70%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 uppercase tracking-widest italic">Từ vựng mới</span>
                  <span className="text-emerald-600">12 / 20</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full w-[60%]" />
                </div>
              </div>
            </div>
            <Link to="/vocabulary">
              <Button className="w-full font-black text-sm bg-indigo-600 text-white shadow-[0_4px_0_#4338ca] hover:bg-indigo-700 transition-none active:translate-y-[2px] active:shadow-[0_2px_0_#4338ca] rounded-2xl h-12">
                TIẾP TỤC HỌC
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span>🏆</span> BẢNG XẾP HẠNG
            </h3>
            <div className="space-y-4">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, i) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-2xl border border-slate-100 ${user?.uid === item.id ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${i === 0 ? 'bg-amber-50 text-amber-500' : i === 1 ? 'bg-slate-100 text-slate-400' : i === 2 ? 'bg-orange-50 text-orange-400' : 'bg-slate-50 text-slate-400'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800 truncate max-w-[120px]">{item.displayName || 'Học viên ẩn danh'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.xp?.toLocaleString() || 0} XP</p>
                    </div>
                    {i === 0 && <span className="text-xl">👑</span>}
                    {user?.uid === item.id && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">BẠN</span>}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 font-bold italic text-sm">Đang tải bảng xếp hạng...</div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm border border-white/10">🤖</div>
                <h4 className="font-black italic uppercase tracking-wider text-sm">Gợi ý từ AI</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Bồ đang làm rất tốt phần <span className="text-white font-bold">Thì hiện tại đơn</span>. Hãy thử thách bản thân với <span className="text-white font-bold">Từ vựng Môi trường</span> để bứt phá điểm số nhé!
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:scale-110 transition-transform">✨</div>
          </div>
        </div>

      </div>
    </div>
  );
}
