import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { BookOpen, HelpCircle, Edit3, Type, Loader2, CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export function Practice() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({
    'multiple_choice': 0,
    'fill_blank': 0,
    'listening': 0,
    'reading': 0
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        if (!topicId) {
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
        } else {
          const q = query(collection(db, 'questions'), where('type', '==', topicId));
          const snap = await getDocs(q);
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setQuestions(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [topicId]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
      toast.success("Chính xác!");
    } else {
      toast.error("Chưa đúng rồi!");
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Quiz Detail View
  if (topicId) {
    if (questions.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <p className="text-slate-500 font-bold">Chưa có câu hỏi nào cho mục này.</p>
          <Button onClick={() => navigate('/practice')}>QUAY LẠI</Button>
        </div>
      );
    }

    if (showResult) {
      return (
        <div className="max-w-xl mx-auto h-full flex items-center justify-center px-4">
          <Card className="w-full p-8 text-center bg-white border-2 border-slate-200 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-800 mb-2">Hoàn Thành Thử Thách!</h2>
            <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs">Kết quả rèn luyện của bồ</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 font-black">
                <div className="text-slate-400 text-[10px] mb-1">ĐÚNG</div>
                <div className="text-3xl text-emerald-500">{score}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 font-black">
                <div className="text-slate-400 text-[10px] mb-1">SAI</div>
                <div className="text-3xl text-red-500">{questions.length - score}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={resetQuiz} className="h-14 rounded-2xl bg-indigo-600 font-black text-lg shadow-[0_4px_0_#4338ca]">THỬ LẠI</Button>
              <Button variant="ghost" onClick={() => navigate('/practice')} className="h-14 rounded-2xl font-black text-slate-500">DANH MỤC KHÁC</Button>
            </div>
          </Card>
        </div>
      );
    }

    const currentQ = questions[currentIndex];
    
    return (
      <div className="max-w-2xl mx-auto h-full pt-4 px-4">
        <div className="flex justify-between items-center mb-8">
           <Button variant="ghost" onClick={() => navigate('/practice')} className="font-black text-slate-400">← THOÁT</Button>
           <div className="bg-white border border-slate-200 rounded-full px-4 py-1.5 font-black text-xs text-indigo-600 shadow-sm">
             CÂU {currentIndex + 1} / {questions.length}
           </div>
           <div className="font-black text-xs text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
             ĐIỂM: {score}
           </div>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card className="p-8 border-2 border-slate-200 rounded-[32px] bg-white shadow-xl">
             <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border-2 border-indigo-100">
                <HelpCircle className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 leading-snug mb-8">
               {currentQ.content}
             </h2>

             <div className="grid grid-cols-1 gap-4">
               {currentQ.options && (Array.isArray(currentQ.options) ? currentQ.options : currentQ.options.split(',')).map((opt: string) => {
                 let variant = "outline";
                 if (selectedAnswer === opt) {
                   variant = opt === currentQ.correctAnswer ? "success" : "destructive";
                 } else if (selectedAnswer && opt === currentQ.correctAnswer) {
                   variant = "success";
                 }

                 return (
                   <Button
                     key={opt}
                     disabled={selectedAnswer !== null}
                     // @ts-ignore
                     variant={variant}
                     onClick={() => handleAnswer(opt)}
                     className={`h-16 rounded-2xl text-lg font-bold justify-start px-8 border-2 ${selectedAnswer ? '' : 'hover:border-indigo-400 hover:bg-slate-50'}`}
                   >
                     {opt.trim()}
                   </Button>
                 );
               })}
             </div>

             {currentQ.type === 'fill_blank' && (
                <div className="flex flex-col gap-4">
                   <input 
                      placeholder="Nhập đáp án của bồ..."
                      className="h-14 bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 font-bold text-xl outline-none focus:border-indigo-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedAnswer === null) {
                          handleAnswer(e.currentTarget.value.trim());
                        }
                      }}
                   />
                </div>
             )}
          </Card>

          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Button 
                onClick={nextQuestion}
                className="h-14 px-10 rounded-2xl bg-slate-800 font-black text-lg gap-2 shadow-[0_4px_0_rgba(15,23,42,0.8)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(15,23,42,0.8)]"
              >
                CÂU TIẾP THEO <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Menu View (Remains similar but cleaned up)
  const topics = [
    { id: 'multiple_choice', title: 'Trắc nghiệm tổng hợp', description: 'Ôn tập từ vựng, ngữ pháp cơ bản', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-100', questions: counts['multiple_choice'] },
    { id: 'reading', title: 'Đọc hiểu', description: 'Các bài đọc bám sát đề thi thật', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', questions: counts['reading'] },
    { id: 'fill_blank', title: 'Điền từ vào chỗ trống', description: 'Kiểm tra ngữ pháp và từ vựng', icon: Type, color: 'text-blue-600', bg: 'bg-blue-100', questions: counts['fill_blank'] },
    { id: 'listening', title: 'Nghe hiểu', description: 'Luyện tập kỹ năng nghe cơ bản', icon: Edit3, color: 'text-amber-600', bg: 'bg-amber-100', questions: counts['listening'] },
  ];

  return (
    <div className="max-w-4xl mx-auto h-full pt-4 pb-20 md:pb-8 px-4 md:px-0">
      <div className="mb-8 p-6 md:p-8 rounded-[32px] bg-white border-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-white to-blue-50">
        <div>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block text-left">Trung tâm huấn luyện</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Luyện Tập Khắc Nghiệt</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base text-left">Bứt phá điểm số với các dạng bài thi chuẩn cấu trúc tuyển sinh lớp 10.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng cộng</span>
            <div className="text-2xl font-black text-emerald-500">{(Object.values(counts) as number[]).reduce((a, b) => a + b, 0)}<span className="text-slate-300 text-lg"> Câu</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {topics.map(topic => (
          <Link key={topic.id} to={`/practice/${topic.id}`}>
            <Card className="p-6 h-full hover:-translate-y-1 transition-transform group cursor-pointer border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl font-bold text-xl ${topic.bg} ${topic.color}`}>
                  <topic.icon className="w-8 h-8" />
                </div>
                <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  {topic.questions} Câu
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors text-left">{topic.title}</h3>
              <p className="text-slate-500 font-medium mb-6 text-left">{topic.description}</p>
              
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
