import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Volume2, ArrowRight, CheckCircle2, XCircle, Award } from 'lucide-react';
import { useAuth } from '@/src/lib/auth-context';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

// Mock words since we don't have enough in DB yet
const mockFlashcards = [
  { id: '1', word: 'Environment', meaning: 'Môi trường', pronunciation: '/ɪnˈvaɪrənmənt/', example: 'We must protect the environment.' },
  { id: '2', word: 'Sustainable', meaning: 'Bền vững', pronunciation: '/səˈsteɪnəbl/', example: 'Sustainable development is crucial.' },
  { id: '3', word: 'Acknowledge', meaning: 'Công nhận, thừa nhận', pronunciation: '/əkˈnɒlɪdʒ/', example: 'He refused to acknowledge his mistake.' },
  { id: '4', word: 'Contribute', meaning: 'Đóng góp', pronunciation: '/kənˈtrɪbjuːt/', example: 'Everyone should contribute to the project.' }
];

export function Vocabulary() {
  const { user, refreshUser } = useAuth();
  const [cards, setCards] = useState(mockFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'pending' | 'correct' | 'incorrect'>('pending');
  const [checking, setChecking] = useState(false);

  const currentCard = cards[currentIndex];

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Trình duyệt của bạn không hỗ trợ đọc phát âm');
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      playAudio(currentCard.word);
    }
  };

  const checkAnswer = async () => {
    if (!userInput.trim()) return;
    setChecking(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are checking an English learner's answer. The English word is "${currentCard.word}" and its standard Vietnamese meaning is "${currentCard.meaning}".
      The user typed: "${userInput}". 
      Is the user's answer reasonably correct or close enough? Respond ONLY with "YES" or "NO".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const result = response.text?.trim().toUpperCase();
      const isCorrect = result?.includes('YES');

      setFeedback(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect && user) {
        // Award XP
        const xpEarned = 10;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          xp: increment(xpEarned)
        });
        toast.success(`+${xpEarned} XP! Làm tốt lắm!`);
        refreshUser();
      }
    } catch (error) {
      console.error(error);
      // Fallback manual check
      const isCorrect = userInput.toLowerCase().trim() === currentCard.meaning.toLowerCase().trim();
      setFeedback(isCorrect ? 'correct' : 'incorrect');
    } finally {
      setChecking(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setFeedback('pending');
    setUserInput('');
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="max-w-4xl mx-auto h-full pt-4 pb-20 md:pb-8 flex flex-col items-center justify-center px-4">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <span className="bg-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 inline-block text-slate-500 border border-slate-200">Flashcard Pro</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Học từ vựng</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Lật thẻ, nghe phát âm và luyện nhớ nghĩa từ vựng với AI.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-end self-end md:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tiến độ</span>
          <div className="text-xl md:text-2xl font-black text-blue-600 leading-none">{currentIndex + 1} <span className="text-slate-300 text-lg">/ {cards.length}</span></div>
        </div>
      </div>

      <div className="relative h-[400px] md:h-[450px] w-full max-w-2xl perspective-1000 mb-8" onClick={handleFlip}>
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Front */}
          <Card className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 border-0 shadow-2xl rounded-[32px] md:rounded-[40px] overflow-hidden p-6 text-center">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight z-10 break-words max-w-full">{currentCard.word}</h2>
            <div className="absolute inset-x-0 bottom-10 flex justify-center z-10 px-4 text-center">
              <span className="px-5 py-2 md:px-6 md:py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-bold uppercase tracking-widest text-[10px] md:text-sm animate-pulse border border-white/30 shadow-lg whitespace-nowrap">
                CHẠM ĐỂ LẬT THẺ
              </span>
            </div>
            {/* Background dekor */}
            <div className="absolute -right-20 -bottom-20 text-[250px] font-black text-white/10 pointer-events-none drop-shadow-2xl">{currentCard.word.charAt(0)}</div>
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 w-full h-full backface-hidden flex flex-col overflow-hidden bg-white border-2 border-slate-200 rounded-[32px] md:rounded-[40px] shadow-2xl" style={{ transform: 'rotateX(180deg)' }}>
            <div className="flex-1 flex justify-between p-6 md:p-8 flex-col relative w-full h-full">

              <div className="absolute top-0 left-0 w-full h-28 md:h-32 bg-indigo-50 rounded-b-[32px] md:rounded-b-[40px] border-b border-indigo-100 flex items-center justify-between px-6 md:px-8">
                  <div className="max-w-[70%]">
                    <h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-1 truncate">{currentCard.word}</h2>
                    <p className="text-base md:text-lg text-indigo-600 font-mono font-bold tracking-tight">{currentCard.pronunciation}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-2xl w-12 h-12 md:w-14 md:h-14 bg-white text-indigo-600 border border-indigo-100 shadow-[0_4px_0_#e0e7ff] hover:-translate-y-[2px] active:translate-y-[2px] active:shadow-[0_2px_0_#e0e7ff] transition-none"
                    onClick={(e) => { e.stopPropagation(); playAudio(currentCard.word); }}
                  >
                    <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                  </Button>
              </div>
            
              <div className="mt-28 pt-6 md:mt-32 md:pt-8 flex-1 w-full space-y-4 md:space-y-6">
                <div>
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Định nghĩa</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{currentCard.meaning}</p>
                </div>
                
                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Ví dụ</p>
                  <p className="text-base md:text-lg text-slate-600 font-medium italic">"{currentCard.example}"</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="w-full max-w-2xl px-4">
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 relative overflow-hidden"
            >
              <h3 className="font-black mb-6 text-slate-800 flex items-center gap-3 text-lg relative z-10">
                <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center border-2 border-amber-200">
                  <Award className="w-5 h-5" />
                </span>
                KIỂM TRA TRÍ NHỚ ĐỂ NHẬN 10 XP
              </h3>
              
              {feedback === 'pending' ? (
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <Input 
                    placeholder="Nhập nghĩa tiếng Việt của từ..." 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 h-14 bg-slate-50 border-slate-200 font-medium text-lg rounded-2xl"
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                  />
                  <Button onClick={checkAnswer} disabled={checking || !userInput.trim()} className="h-14 px-8 rounded-2xl font-black shadow-[0_4px_0_rgba(15,23,42,0.8)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(15,23,42,0.8)] transition-none bg-slate-800 text-white hover:bg-slate-900 border-0">
                    {checking ? "ĐANG XỬ LÝ..." : "KIỂM TRA NGHĨA"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 relative z-10">
                  <div className={`p-6 rounded-3xl flex items-start gap-4 border-2 ${feedback === 'correct' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`mt-1 bg-white p-2 rounded-xl shadow-sm border ${feedback === 'correct' ? 'border-emerald-100 text-emerald-500' : 'border-red-100 text-red-500'}`}>
                       {feedback === 'correct' ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                    </div>
                    <div>
                      <p className={`text-xl font-black mb-1 ${feedback === 'correct' ? 'text-emerald-800' : 'text-red-800'}`}>
                        {feedback === 'correct' ? 'CHÍNH XÁC! XUẤT SẮC LẮM.' : 'CHƯA CHÍNH XÁC.'}
                      </p>
                      {feedback === 'incorrect' && <p className="text-red-600 font-medium text-lg">Nghĩa đúng là: <span className="font-bold">{currentCard.meaning}</span></p>}
                    </div>
                  </div>
                  <Button onClick={nextCard} className="w-full h-16 text-xl rounded-2xl gap-3 font-black shadow-[0_4px_0_rgba(15,23,42,0.8)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(15,23,42,0.8)] transition-none bg-slate-800 text-white hover:bg-slate-900 border-0">
                     TỪ TIẾP THEO <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
