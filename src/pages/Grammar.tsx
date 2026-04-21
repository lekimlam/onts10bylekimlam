import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export function Grammar() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, 'grammar'), orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (list.length > 0) {
          setLessons(list);
          setActiveLessonId(list[0].id);
        } else {
          // Initial lessons if empty
          setLessons([
            {
              id: 'initial-1',
              title: 'Hiện tại đơn (Present Simple)',
              description: 'Diễn tả hành động lặp đi lặp lại, thói quen, hoặc sự thật hiển nhiên.',
              structure: '(+) S + V(s/es)\n(-) S + do/does + not + V\n(?) Do/Does + S + V?',
              signs: ['always', 'usually', 'often'],
              quiz: {
                question: 'She _____ (go) to school everyday.',
                options: ['go', 'goes', 'going', 'is go'],
                correct: 'goes'
              }
            }
          ]);
          setActiveLessonId('initial-1');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || !activeLesson?.quiz) return;
    setSelectedAnswer(answer);
  };

  const isCorrect = activeLesson?.quiz && selectedAnswer === activeLesson.quiz.correct;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!activeLesson) return null;

  return (
    <div className="max-w-6xl mx-auto h-full pt-4 max-h-[85vh]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-left">
        <div className="col-span-1 md:col-span-3 space-y-2 h-[80vh] overflow-y-auto pr-2 pb-8 no-scrollbar">
          <h1 className="text-xl font-black text-slate-800 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-10">Danh mục Ngữ pháp</h1>
          {lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => {
                setActiveLessonId(lesson.id);
                setSelectedAnswer(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-2xl font-black transition-none overflow-hidden ${
                activeLessonId === lesson.id
                  ? 'bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)]'
                  : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-500 border border-slate-200'
              }`}
            >
              <span className="block truncate">{lesson.title}</span>
            </button>
          ))}
        </div>
        
        <div className="col-span-1 md:col-span-9 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLesson.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-[rgba(164,164,255,0.1)] backdrop-blur-[10px] p-8 rounded-[32px] border-2 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Đang học bản quyền của Admin</span>
                  <h1 className="text-4xl font-black mb-2">{activeLesson.title}</h1>
                  <p className="text-indigo-100 text-lg max-w-md">{activeLesson.description}</p>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-20 text-[150px] font-black pointer-events-none drop-shadow-2xl">⚡</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-xl drop-shadow-sm">A+</div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Công thức & Cấu trúc</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase mb-2">Công thức chính</h3>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 font-mono text-lg text-indigo-700 font-black">
                        {activeLesson.formula || 'Chưa cập nhật công thức'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase mb-2">Chi tiết cấu trúc</h3>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm whitespace-pre-wrap leading-relaxed text-slate-700 font-bold">
                        {activeLesson.structure}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl font-bold text-xl drop-shadow-sm">🔎</div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Ghi nhớ</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Dấu hiệu nhận biết</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(activeLesson.signs) ? (
                        activeLesson.signs.map((sign: string) => (
                          <span key={sign} className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-lg font-black border border-amber-100 uppercase tracking-wide">
                            {sign}
                          </span>
                        ))
                      ) : activeLesson.signs ? (
                        activeLesson.signs.split(',').map((sign: string) => (
                          <span key={sign.trim()} className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-lg font-black border border-amber-100 uppercase tracking-wide">
                            {sign.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-xs">Không có dấu hiệu đặc biệt</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm italic font-medium text-slate-600 border border-slate-100 space-y-2">
                    {Array.isArray(activeLesson.examples) ? (
                      activeLesson.examples.map((ex: string, idx: number) => (
                        <p key={idx}>“{ex}”</p>
                      ))
                    ) : (
                      <p>“{activeLesson.examples || activeLesson.example || 'Example sentence goes here...'}”</p>
                    )}
                  </div>
                </Card>
              </div>

              {activeLesson.quiz && (
                <Card className="p-6 bg-slate-800 text-white border-0 shadow-xl relative overflow-hidden">
                  <div className="relative z-10 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-indigo-300 text-sm tracking-widest uppercase items-center gap-2">
                        KIỂM TRA NHANH
                      </h3>
                    </div>
                    <p className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">{activeLesson.quiz.question}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {(activeLesson.quiz.options || []).map((opt: string) => {
                        let btnState = 'outline';
                        if (selectedAnswer) {
                           if (opt === activeLesson.quiz.correct) btnState = 'success';
                           else if (opt === selectedAnswer) btnState = 'danger';
                           else btnState = 'ghost';
                        }
                        
                        return (
                          <Button 
                            key={opt}
                            // @ts-ignore
                            variant={btnState}
                            onClick={() => handleSelectAnswer(opt)}
                            className={`h-14 text-md px-6 justify-start font-black ${selectedAnswer ? 'pointer-events-none' : ''}`}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {selectedAnswer && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
                          isCorrect ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' : 'bg-red-900/50 text-red-300 border border-red-800'
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
                        <span className="font-bold">
                          {isCorrect ? 'Chính xác! Bạn đã nắm rõ cấu trúc.' : `Chưa đúng rồi. Đáp án đúng phải là: ${activeLesson.quiz.correct}`}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
