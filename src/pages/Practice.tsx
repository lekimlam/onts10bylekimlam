import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { BookOpen, HelpCircle, Edit3, Type, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { db } from '@/src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function Practice() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({
    'multiple_choice': 0,
    'fill_blank': 0,
    'listening': 0,
    'reading': 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const snap = await getDocs(collection(db, 'questions'));
        const newCounts: Record<string, number> = {
          'multiple_choice': 0,
          'fill_blank': 0,
          'listening': 0,
          'reading': 0
        };
        snap.forEach(doc => {
          const type = doc.data().type;
          if (newCounts[type] !== undefined) {
            newCounts[type]++;
          }
        });
        setCounts(newCounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const topics = [
    { id: 'multiple_choice', title: 'Trắc nghiệm tổng hợp', description: 'Ôn tập từ vựng, ngữ pháp cơ bản', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-100', questions: counts['multiple_choice'] },
    { id: 'reading', title: 'Đọc hiểu', description: 'Các bài đọc bám sát đề thi thật', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', questions: counts['reading'] },
    { id: 'fill_blank', title: 'Điền từ vào chỗ trống', description: 'Kiểm tra ngữ pháp và từ vựng', icon: Type, color: 'text-blue-600', bg: 'bg-blue-100', questions: counts['fill_blank'] },
    { id: 'listening', title: 'Nghe hiểu', description: 'Luyện tập kỹ năng nghe cơ bản', icon: Edit3, color: 'text-amber-600', bg: 'bg-amber-100', questions: counts['listening'] },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full pt-4 pb-20 md:pb-8 px-4 md:px-0">
      <div className="mb-8 p-6 md:p-8 rounded-[32px] bg-white border-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-white to-blue-50">
        <div>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Trung tâm huấn luyện</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Luyện Tập Khắc Nghiệt</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Bứt phá điểm số với các dạng bài thi chuẩn cấu trúc tuyển sinh lớp 10.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng cộng</span>
            <div className="text-2xl font-black text-emerald-500">{(Object.values(counts) as number[]).reduce((a, b) => a + b, 0)}<span className="text-slate-300 text-lg"> Câu</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map(topic => (
          <Link key={topic.id} to={`/practice/${topic.id}`}>
            <Card className="p-6 h-full hover:-translate-y-1 transition-transform group cursor-pointer border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl font-bold text-xl ${topic.bg} ${topic.color}`}>
                  <topic.icon className="w-8 h-8" />
                </div>
                <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200">
                  {topic.questions} Câu
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{topic.title}</h3>
              <p className="text-slate-500 font-medium mb-6">{topic.description}</p>
              
              <Button className="w-full h-12 rounded-xl font-black bg-slate-100 text-slate-700 shadow-none border border-slate-200 hover:bg-indigo-600 hover:text-white transition-none group-hover:shadow-[0_4px_0_#4338ca] group-hover:border-transparent">
                BẮT ĐẦU LUYỆN
              </Button>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
