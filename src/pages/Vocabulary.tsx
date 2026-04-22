import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Volume2, ArrowRight, CheckCircle2, XCircle, Award, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/src/lib/auth-context';
import { doc, updateDoc, increment, collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { toast } from 'react-hot-toast';
import { calculateNextReview } from '@/src/lib/srs';
import { isBefore } from 'date-fns';

interface CardData {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  level: number;
  nextReview: Date;
  topic?: string;
}

export function Vocabulary() {
  const { user, refreshUser } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'pending' | 'correct' | 'incorrect'>('pending');
  const [checking, setChecking] = useState(false);
  const [viewMode, setViewMode] = useState<'challenge' | 'list'>('challenge');
  const [studyMode, setStudyMode] = useState<'en-vn' | 'vn-en'>('vn-en');
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const q = query(collection(db, 'flashcards'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        let list = snap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          nextReview: d.data().nextReview?.toDate() || new Date(0)
        } as CardData));

        if (list.length > 0) {
          const dueCards = list.filter(c => isBefore(c.nextReview, new Date()) || !c.level);
          setCards(dueCards.length > 0 ? dueCards : list);
        } else {
          setCards([
            { id: '1', word: 'Environment', meaning: 'Môi trường', pronunciation: '/ɪnˈvaɪrənmənt/', example: 'We must protect the environment.', level: 0, nextReview: new Date() },
            { id: '2', word: 'Sustainable', meaning: 'Bền vững', pronunciation: '/səˈsteɪnəbl/', example: 'Sustainable development is crucial.', level: 0, nextReview: new Date() }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
      if (e.code === 'Enter' && userInput.trim()) {
        checkAnswer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, userInput]);

  const currentCard = cards[currentIndex];

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = async () => {
    if (!userInput.trim() || !currentCard) return;
    setChecking(true);
    
    const target = studyMode === 'vn-en' ? currentCard.word : currentCard.meaning;
    const isCorrect = userInput.toLowerCase().trim() === target.toLowerCase().trim();
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect && user) {
      const { nextReview, nextLevel } = calculateNextReview(currentCard.level || 0, true);
      const cardRef = doc(db, 'flashcards', currentCard.id);
      await updateDoc(cardRef, {
        level: nextLevel,
        nextReview: Timestamp.fromDate(nextReview),
        lastReviewed: Timestamp.now()
      });

      const xpEarned = 20;
      setSessionXp(prev => prev + xpEarned);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { xp: increment(xpEarned) });

      setStreak(prev => prev + 1);
      toast.success(`Chính xác! +${xpEarned} XP`);
      refreshUser();
      
      setTimeout(nextCard, 1000);
    } else {
      setStreak(0);
    }
    setChecking(false);
  };

  const skipCard = () => {
    setStreak(0);
    nextCard();
    toast.error('Đã bỏ qua câu này');
  };

  const masterCard = async () => {
    if (!user || !currentCard) return;
    const { nextReview, nextLevel } = calculateNextReview(currentCard.level || 0, true);
    const cardRef = doc(db, 'flashcards', currentCard.id);
    await updateDoc(cardRef, {
      level: Math.max(nextLevel, 3), // Set to at least level 3 for mastery
      nextReview: Timestamp.fromDate(nextReview),
      lastReviewed: Timestamp.now()
    });

    const xpEarned = 30;
    setSessionXp(prev => prev + xpEarned);
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { xp: increment(xpEarned) });

    toast.success('Đã đánh dấu thuộc! +30 XP');
    refreshUser();
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    setFeedback('pending');
    setUserInput('');
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!currentCard) return <div className="h-full flex items-center justify-center">Chưa có dữ liệu.</div>;

  return (
    <div className="max-w-xl mx-auto h-full pt-4 pb-20 md:pb-8 flex flex-col items-center px-4 relative font-sans">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none -z-10" />

      {/* Header Info */}
      <div className="w-full bg-white rounded-[2rem] border-2 border-slate-900 p-4 mb-6 shadow-[0_8px_0_#1e293b]">
        <div className="flex justify-between items-center mb-4">
          <div className="bg-slate-100 rounded-full px-4 py-1.5 flex items-center gap-2 border border-slate-200">
            <span className="text-xs font-black text-slate-500">Chế độ</span>
            <button 
              onClick={() => setStudyMode(studyMode === 'vn-en' ? 'en-vn' : 'vn-en')}
              className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm hover:scale-105 transition-transform"
            >
              {studyMode === 'vn-en' ? 'VN → EN' : 'EN → VN'}
            </button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="text-xs font-black text-slate-400 hover:text-indigo-600">Chơi lại</button>
            <button onClick={() => window.history.back()} className="text-xs font-black text-slate-400 hover:text-red-500">Thoát</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 px-4 py-2 rounded-2xl border-2 border-amber-200 text-amber-700 font-black text-sm whitespace-nowrap">
            💰 ~{sessionXp} GAME
          </div>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-sm font-black text-slate-600 italic whitespace-nowrap">{currentIndex + 1} / {cards.length}</span>
            <div className="h-3 flex-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
               <motion.div 
                animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                className="h-full bg-emerald-500" 
               />
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="relative h-[480px] w-full mb-8 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? 'back' : 'front'}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full h-full rounded-[3rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl border-b-8
              ${isFlipped ? 'bg-white border-indigo-200 text-slate-800' : 'bg-gradient-to-br from-cyan-400 to-indigo-500 border-indigo-600 text-white'}`}
          >
            {!isFlipped ? (
              <>
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-10">
                  {studyMode === 'vn-en' ? 'NGHĨA TIẾNG VIỆT' : 'TỪ TIẾNG ANH'}
                </span>
                <h2 className="text-5xl font-black mb-8 leading-tight drop-shadow-xl">
                  {studyMode === 'vn-en' ? currentCard.meaning : currentCard.word}
                </h2>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 max-w-[280px]">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Volume2 className="w-5 h-5 opacity-60" />
                    <p className="text-sm italic font-medium">"{currentCard.example}"</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-2 opacity-60 text-xs font-bold">
                  <span>👆</span> Nhấn Space hoặc click để lật lại
                </div>
              </>
            ) : (
              <>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-10">KẾT QUẢ</span>
                <h2 className="text-5xl font-black text-slate-800 mb-4">{currentCard.word}</h2>
                <p className="text-2xl font-mono font-bold text-indigo-500 mb-6">{currentCard.pronunciation}</p>
                <div className="bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100">
                  <p className="text-slate-600 font-bold text-lg">{currentCard.meaning}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <span>🔄</span> Đang xem mặt sau của thẻ
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Input Section */}
      <div className="w-full flex gap-3 mb-8">
        <Input 
          placeholder="Gõ đáp án..." 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          className="flex-1 h-16 rounded-[2rem] border-2 border-slate-200 bg-white px-6 font-bold text-lg shadow-sm focus:border-indigo-400 text-slate-700"
        />
        <Button 
          onClick={checkAnswer}
          className="h-16 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-[0_4px_0_#059669] active:translate-y-[2px] active:shadow-none transition-all"
        >
          Check
        </Button>
      </div>

      {/* Footer Controls */}
      <div className="w-full flex justify-between items-center px-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length)}
          className="rounded-full w-12 h-12 text-indigo-400 hover:bg-indigo-50"
        >
          <motion.div whileHover={{ x: -3 }}><ArrowRight className="w-6 h-6 rotate-180" /></motion.div>
        </Button>

        <div className="flex gap-4">
          <Button 
            onClick={() => playAudio(currentCard.word)}
            className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-[0_4px_0_#059669] active:translate-y-[2px]"
          >
            <Volume2 className="w-6 h-6" />
          </Button>
          <Button 
            onClick={skipCard}
            className="h-14 px-8 rounded-2xl bg-orange-500 text-white font-black shadow-[0_4px_0_#c2410c] active:translate-y-[2px]"
          >
            <XCircle className="w-5 h-5 mr-2" /> Quên
          </Button>
          <Button 
            onClick={masterCard}
            className="h-14 px-8 rounded-2xl bg-emerald-500 text-white font-black shadow-[0_4px_0_#059669] active:translate-y-[2px]"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Thuộc
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextCard}
          className="rounded-full w-12 h-12 text-indigo-400 hover:bg-indigo-50"
        >
          <motion.div whileHover={{ x: 3 }}><ArrowRight className="w-6 h-6" /></motion.div>
        </Button>
      </div>
    </div>
  );
}
