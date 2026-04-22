import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { BookOpen, GraduationCap, Globe, Briefcase, Star, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';

const categories = [
  { id: 'general', name: 'Tiếng Anh Giao Tiếp', icon: Globe, color: 'from-blue-500 to-indigo-600' },
  { id: 'academic', name: 'Học Thuật (IELTS/TOEFL)', icon: GraduationCap, color: 'from-purple-500 to-pink-600' },
  { id: 'business', name: 'Công Sở (TOEIC/Business)', icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
  { id: 'exam', name: 'Ôn Thi Lớp 10/THPT', icon: Star, color: 'from-orange-500 to-amber-600' },
];

const courses = [
  { id: 'toeic-600', title: '600 Từ vựng TOEIC Thiết yếu', category: 'business', words: 600, difficulty: 'Vừa', description: 'Các nhóm từ vựng thường xuất hiện nhất trong bài thi TOEIC.' },
  { id: 'ielts-master', title: 'IELTS Vocabulary Mastery', category: 'academic', words: 1200, difficulty: 'Khó', description: 'Từ vựng chuyên sâu cho các band 7.0+.' },
  { id: 'oxford-3000', title: 'Oxford 3000 Keywords', category: 'general', words: 3000, difficulty: 'Dễ', description: '3000 từ quan trọng nhất giúp bạn hiểu 90% các tình huống giao tiếp.' },
  { id: 'grade-10', title: 'Tiếng Anh 10 - Chương trình mới', category: 'exam', words: 450, difficulty: 'Vừa', description: 'Tổng hợp từ vựng theo từng Unit của sách giáo khoa lớp 10.' },
];

export function Library() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Thư viện Khóa học</h1>
          <p className="text-slate-500 font-medium italic">Chọn lộ trình phù hợp để bắt đầu chinh phục tiếng Anh ngay hôm nay.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input placeholder="Tìm nhanh khóa học..." className="h-12 pl-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:border-indigo-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {categories.map((cat) => (
          <Button 
            key={cat.id} 
            variant="ghost" 
            className="h-full py-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 hover:border-indigo-100 transition-all shadow-sm"
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase text-slate-600 tracking-wider text-center">{cat.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ y: -5 }}
            className="h-full"
          >
            <Card className="h-full p-8 rounded-[40px] border-2 border-slate-100 hover:border-indigo-200 transition-all flex flex-col shadow-sm group">
              <div className="flex justify-between items-start mb-6">
                 <div className="px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                   {course.difficulty}
                 </div>
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{course.words} Từ vựng</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{course.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 flex-1">{course.description}</p>
              
              <div className="flex gap-4 items-center">
                <Button 
                   onClick={() => navigate('/vocabulary')}
                   className="flex-1 h-16 rounded-2xl bg-indigo-600 font-black text-white shadow-[0_4px_0_#4338ca] active:translate-y-[2px] active:shadow-[0_2px_0_#4338ca] transition-all"
                >
                  BẮT ĐẦU HỌC
                </Button>
                <Button 
                   variant="outline"
                   className="h-16 w-16 rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  <Star className="w-6 h-6" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
