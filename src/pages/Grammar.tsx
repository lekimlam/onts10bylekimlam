import React, { useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const tenses = [
  {
    id: 'present-simple',
    name: 'Hiện tại đơn (Present Simple)',
    formula: {
      affirmative: 'S + V(s/es) + O',
      negative: 'S + do/does + not + V + O',
      question: 'Do/Does + S + V + O?'
    },
    usage: 'Diễn tả hành động lặp đi lặp lại, thói quen, hoặc sự thật hiển nhiên.',
    signs: ['always', 'usually', 'often', 'sometimes', 'never', 'every...'],
    examples: [
      'I usually wake up at 6 AM.',
      'Water boils at 100 degrees Celsius.'
    ],
    quiz: {
      question: 'She _____ (go) to school everyday.',
      options: ['go', 'goes', 'going', 'is go'],
      correct: 'goes'
    }
  },
  {
    id: 'present-continuous',
    name: 'Hiện tại tiếp diễn (Present Continuous)',
    formula: {
      affirmative: 'S + am/is/are + V-ing + O',
      negative: 'S + am/is/are + not + V-ing + O',
      question: 'Am/Is/Are + S + V-ing + O?'
    },
    usage: 'Diễn tả hành động đang xảy ra tại thời điểm nói hoặc xung quanh thời điểm nói.',
    signs: ['now', 'at the moment', 'at present', 'Look!', 'Listen!'],
    examples: [
      'Look! It is raining.',
      'We are learning English right now.'
    ],
    quiz: {
      question: 'Listen! The bird _____ (sing).',
      options: ['sing', 'sings', 'is singing', 'are singing'],
      correct: 'is singing'
    }
  },
  {
    id: 'past-simple',
    name: 'Quá khứ đơn (Past Simple)',
    formula: {
      affirmative: 'S + V-ed / V2 + O',
      negative: 'S + did + not + V + O',
      question: 'Did + S + V + O?'
    },
    usage: 'Diễn tả hành động đã bắt đầu và kết thúc tại một thời điểm xác định trong quá khứ.',
    signs: ['yesterday', 'last night/week/month', '... ago', 'in 1990'],
    examples: [
      'I visited my grandparents yesterday.',
      'They did not go to the cinema last night.'
    ],
    quiz: {
      question: 'I _____ (see) a great movie last week.',
      options: ['see', 'saw', 'have seen', 'was seeing'],
      correct: 'saw'
    }
  },
  {
    id: 'future-simple',
    name: 'Tương lai đơn (Future Simple)',
    formula: {
      affirmative: 'S + will + V + O',
      negative: 'S + will + not + V + O',
      question: 'Will + S + V + O?'
    },
    usage: 'Diễn tả quyết định làm việc gì đó ngay tại thời điểm nói, hoặc lời hứa, dự đoán.',
    signs: ['tomorrow', 'next week/month/year', 'in the future', 'think', 'promise'],
    examples: [
      'I will help you with your homework.',
      'I think it will rain tomorrow.'
    ],
    quiz: {
      question: 'I promise I _____ (call) you tonight.',
      options: ['call', 'will call', 'am calling', 'called'],
      correct: 'will call'
    }
  }
];

export function Grammar() {
  const [activeTenseId, setActiveTenseId] = useState(tenses[0].id);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const activeTense = tenses.find(t => t.id === activeTenseId)!;

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple answers
    setSelectedAnswer(answer);
  };

  const isCorrect = selectedAnswer === activeTense.quiz.correct;

  return (
    <div className="max-w-6xl mx-auto h-full pt-4 max-h-[85vh]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-left">
        <div className="col-span-1 md:col-span-3 space-y-2 h-[80vh] overflow-y-auto pr-2 pb-8">
          <h1 className="text-xl font-black text-slate-800 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">Danh mục Ngữ pháp</h1>
          {tenses.map(tense => (
            <button
              key={tense.id}
              onClick={() => {
                setActiveTenseId(tense.id);
                setSelectedAnswer(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-2xl font-black transition-none overflow-hidden ${
                activeTenseId === tense.id
                  ? 'bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)]'
                  : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-500 border border-slate-200'
              }`}
            >
              <span className="block truncate">{tense.name}</span>
            </button>
          ))}
        </div>
        
        <div className="col-span-1 md:col-span-9 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTense.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] p-8 rounded-[32px] border-2 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Đang học phần</span>
                  <h1 className="text-4xl font-black mb-2">{activeTense.name}</h1>
                  <p className="text-indigo-100 text-lg max-w-md">{activeTense.usage}</p>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-20 text-[150px] font-black pointer-events-none drop-shadow-2xl">01</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-xl drop-shadow-sm">A+</div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Cấu trúc</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Công thức chính</h3>
                  <div className="space-y-3 font-mono text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black px-2 bg-blue-100 rounded">(+)</span> <span className="font-medium">{activeTense.formula.affirmative}</span></p>
                    <p className="flex items-start gap-2"><span className="text-red-500 font-black px-2 bg-red-100 rounded">(-)</span> <span className="font-medium">{activeTense.formula.negative}</span></p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black px-2 bg-emerald-100 rounded">(?)</span> <span className="font-medium">{activeTense.formula.question}</span></p>
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
                      {activeTense.signs.map(sign => (
                        <span key={sign} className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-lg font-black border border-amber-100 uppercase tracking-wide">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm italic font-medium text-slate-600 border border-slate-100">
                    “{activeTense.examples[0]}”
                  </div>
                </Card>
              </div>

              {/* Mini Quiz */}
              <Card className="p-6 bg-slate-800 text-white border-0 shadow-xl relative overflow-hidden">
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-indigo-300 text-sm tracking-widest uppercase items-center gap-2">
                      KIỂM TRA NHANH
                    </h3>
                  </div>
                  <p className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">{activeTense.quiz.question}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {activeTense.quiz.options.map((opt) => {
                      let btnState = 'outline';
                      if (selectedAnswer) {
                         if (opt === activeTense.quiz.correct) btnState = 'success';
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
                        {isCorrect ? 'Chính xác! Bạn đã nắm rõ cấu trúc.' : `Chưa đúng rồi. Đáp án đúng phải là: ${activeTense.quiz.correct}`}
                      </span>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
