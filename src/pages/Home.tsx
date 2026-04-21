import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { BookOpen, Trophy, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router';

export function Home() {
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span>🏆</span> MỤC TIÊU CỦA BẠN
            </h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <span className="font-black text-indigo-600 w-4">🎯</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Hoàn thành Flashcard</p>
                  <p className="text-[10px] text-indigo-600 font-bold">50 TỪ VỰNG MỚI</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="font-black text-emerald-600 w-4">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Ôn tập Ngữ Pháp</p>
                  <p className="text-[10px] text-emerald-600 font-bold">THÌ HIỆN TẠI ĐƠN</p>
                </div>
              </div>
            </div>
            <Link to="/vocabulary">
              <Button className="w-full mt-4 font-bold text-sm bg-slate-800 text-white shadow-[0_4px_0_#0f172a] hover:bg-slate-900 transition-none active:translate-y-[2px] active:shadow-[0_2px_0_#0f172a] rounded-xl h-12">
                TIẾP TỤC HỌC
              </Button>
            </Link>
          </div>
          
          <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-700/80 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">🤖</div>
                <h4 className="font-bold">AI Gợi ý</h4>
              </div>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Hệ thống AI đề xuất bạn nên tập trung cải thiện <span className="text-white font-bold">kỹ năng ghi nhớ từ vựng</span> dựa trên kết quả gần đây của bạn!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
