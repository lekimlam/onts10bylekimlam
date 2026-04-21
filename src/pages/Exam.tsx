import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Trophy, Clock, FileText, ChevronRight, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { db } from '@/src/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export function Exam() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          setExams(list);
        } else {
          setExams([
            { id: 'mid-term-1', title: 'Đề thi giữa kỳ I - 2024', durationMinutes: 60, difficulty: 'Trung bình', description: 'Đề thi bám sát chương trình' },
            { id: 'final-term-1', title: 'Đề thi cuối kỳ I - 2024', durationMinutes: 90, difficulty: 'Khó', description: 'Đề thi thử thực tế' }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full pt-4 pb-20 md:pb-8 space-y-8 px-4 md:px-0">
      {/* Header section */}
      <div className="relative overflow-hidden p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-indigo-600 text-white shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
              <Star size={14} className="fill-amber-400 text-amber-400" /> Đấu trường đỉnh cao
            </div>
            <h1 className="text-5xl font-black mb-4">Thi Thử Tuyển Sinh</h1>
            <p className="text-indigo-100 text-lg font-medium max-w-lg">Cọ xát với ngân hàng đề thi được cập nhật liên tục bám sát ma trận đề thi tuyển sinh lớp 10 của Sở Giáo Dục.</p>
          </div>
          <div className="flex flex-col items-center bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
            <Trophy size={48} className="text-amber-400 mb-2" />
            <div className="text-3xl font-black mb-1">Top #1</div>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-200">Bảng xếp hạng tuần</div>
          </div>
        </div>
      </div>

      {/* Recommended for you */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-black text-slate-800">Đề thi khuyên dùng</h2>
          <Link to="/exam/history" className="text-indigo-600 font-bold hover:underline text-sm">Xem lịch sử thi</Link>
        </div>
        
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="group hover:border-indigo-600 transition-all border-2 border-slate-100 shadow-none hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText size={32} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-slate-800">{exam.title}</h3>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Sẵn sàng</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.durationMinutes} phút</span>
                    <span className="flex items-center gap-1.5 font-bold"><Star size={14} /> Độ khó: <span className={
                      exam.difficulty === 'hard' || exam.difficulty === 'Khó' ? 'text-red-500' : 'text-emerald-500'
                    }>{exam.difficulty}</span></span>
                  </div>
                </div>

                <Button className="h-12 px-8 rounded-xl font-black bg-slate-900 hover:bg-indigo-600 text-white transition-all scale-100 active:scale-95 flex items-center gap-2">
                  VÀO THI <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Info section */}
      <div className="p-8 rounded-[32px] bg-slate-50 border-2 border-slate-100 flex items-start gap-6">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
           <span className="text-2xl">💡</span>
        </div>
        <div>
           <h4 className="font-black text-slate-800 text-lg mb-1">Quy định phòng thi số</h4>
           <p className="text-slate-500 font-medium">Bấm "Vào thi" sẽ bắt đầu tính thời gian. Kết quả sẽ được lưu lại để phân tích điểm yếu của bạn. Chúc bạn làm bài tốt!</p>
        </div>
      </div>
    </div>
  );
}
