import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
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

import { Volume2, ArrowRight, CheckCircle2, XCircle, Award, Loader2, Sparkles, BrainCircuit, Search, Book, Trophy, Zap, Shuffle, RotateCcw } from 'lucide-react';

export function Vocabulary() {
  const { user, refreshUser } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'pending' | 'correct' | 'incorrect'>('pending');
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenge' | 'notebook' | 'stats' | 'game'>('challenge');
  const [studyMode, setStudyMode] = useState<'en-vn' | 'vn-en'>('vn-en');
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Game specific state
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [gameScore, setGameScore] = useState(0);

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

        setAllCards(list);

        if (list.length > 0) {
          const dueCards = list.filter(c => isBefore(c.nextReview, new Date()) || !c.level);
          setCards(dueCards.length > 0 ? dueCards : list);
          setupGame(list[0]);
        } else {
          const defaults = [
            { id: '1', word: 'Environment', meaning: 'Môi trường', pronunciation: '/ɪnˈvaɪrənmənt/', example: 'We must protect the environment.', level: 0, nextReview: new Date() },
            { id: '2', word: 'Sustainable', meaning: 'Bền vững', pronunciation: '/səˈsteɪnəbl/', example: 'Sustainable development is crucial.', level: 0, nextReview: new Date() }
          ];
          setCards(defaults);
          setAllCards(defaults);
          setupGame(defaults[0]);
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
    if (activeTab !== 'challenge') return;
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
  }, [isFlipped, userInput, activeTab]);

  const topics = ['all', ...Array.from(new Set(allCards.map(c => c.topic).filter(Boolean))) as string[]];

  const filteredDueCards = cards.filter(c => selectedTopic === 'all' || c.topic === selectedTopic);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setUserInput('');
    setFeedback('pending');
  }, [selectedTopic]);

  const currentCard = filteredDueCards[currentIndex];

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
      await updateDoc(cardRef, { level: nextLevel, nextReview: Timestamp.fromDate(nextReview), lastReviewed: Timestamp.now() });
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

  const skipCard = () => { setStreak(0); nextCard(); toast.error('Đã bỏ qua câu này'); };

  const masterCard = async () => {
    if (!user || !currentCard) return;
    const { nextReview, nextLevel } = calculateNextReview(currentCard.level || 0, true);
    const cardRef = doc(db, 'flashcards', currentCard.id);
    await updateDoc(cardRef, { level: Math.max(nextLevel, 3), nextReview: Timestamp.fromDate(nextReview), lastReviewed: Timestamp.now() });
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
    if (filteredDueCards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredDueCards.length);
    }
  };

  // Game Logic
  const setupGame = (wordObj: any) => {
    if (!wordObj) return;
    const chars = wordObj.word.toUpperCase().split('');
    setScrambled([...chars].sort(() => Math.random() - 0.5));
    setUserSelection([]);
  };

  const handleCharClick = (char: string, index: number) => {
    const newSelection = [...userSelection, char];
    setUserSelection(newSelection);
    const newScrambled = [...scrambled];
    newScrambled.splice(index, 1);
    setScrambled(newScrambled);

    if (newSelection.join('') === currentCard.word.toUpperCase()) {
      handleGameWin();
    }
  };

  const resetSelection = () => setupGame(currentCard);

  const handleGameWin = async () => {
    setGameScore(prev => prev + 1);
    toast.success('Xếp chữ chính xác! +10 XP');
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { xp: increment(10) });
      refreshUser();
    }
    setTimeout(nextCard, 1500);
  };

  useEffect(() => {
    if (activeTab === 'game' && currentCard) setupGame(currentCard);
  }, [activeTab, currentIndex]);

  const filteredCards = allCards.filter(c => {
    const matchesSearch = c.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || c.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const masteredCount = allCards.filter(c => (c.level || 0) >= 3).length;

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-xl mx-auto h-full pt-4 pb-20 md:pb-8 flex flex-col items-center px-4 relative font-sans">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none -z-10" />

      {/* Topic Switcher */}
      {topics.length > 1 && (
        <div className="w-full flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2
                ${selectedTopic === topic 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
            >
              {topic === 'all' ? 'Tất cả' : topic}
            </button>
          ))}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="w-full flex bg-white/80 backdrop-blur-md rounded-2xl p-1 border border-slate-200 mb-6 shadow-sm overflow-x-auto no-scrollbar">
        {[
          { id: 'challenge', label: 'Học từ', icon: Zap },
          { id: 'notebook', label: 'Sổ tay', icon: Book },
          { id: 'game', label: 'Game', icon: Shuffle },
          { id: 'stats', label: 'Hạng', icon: Trophy }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[70px] flex flex-col md:flex-row items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] md:text-sm font-black transition-all relative
              ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl -z-10" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'challenge' && (
          <motion.div 
            key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center"
          >
            {filteredDueCards.length > 0 ? (
              <>
                <div className="w-full bg-white rounded-3xl border-2 border-slate-900 p-4 mb-6 shadow-[0_4px_0_#1e293b]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="bg-slate-100 rounded-full px-3 py-1 flex items-center gap-2 border border-slate-200">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Input</span>
                      <button onClick={() => setStudyMode(studyMode === 'vn-en' ? 'en-vn' : 'vn-en')} className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded-full shadow-sm">
                        {studyMode === 'vn-en' ? 'VN → EN' : 'EN → VN'}
                      </button>
                    </div>
                    <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase">
                      <button onClick={() => window.location.reload()} className="hover:text-indigo-600">Reset</button>
                      <button onClick={() => setActiveTab('stats')} className="hover:text-indigo-600">Stats</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 px-3 py-1.5 rounded-xl border-2 border-amber-200 text-amber-700 font-black text-xs">
                      💰 {sessionXp} XP
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-600">{currentIndex + 1}/{filteredDueCards.length}</span>
                      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${((currentIndex + 1) / filteredDueCards.length) * 100}%` }} className="h-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-[400px] w-full mb-6 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isFlipped ? 'back' : 'front'}
                      initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                      className={`w-full h-full rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-xl border-b-4
                        ${isFlipped ? 'bg-white border-indigo-100 text-slate-800' : 'bg-gradient-to-br from-indigo-500 to-indigo-700 border-indigo-900 text-white'}`}
                    >
                      {!isFlipped ? (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-6 bg-white/10 px-3 py-1 rounded-full">Guess the Word</span>
                          <h2 className="text-4xl font-black mb-6 leading-tight">{studyMode === 'vn-en' ? currentCard?.meaning : currentCard?.word}</h2>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-[220px]">
                            <p className="text-[10px] italic font-medium opacity-80 leading-relaxed uppercase">Exp: {currentCard?.example}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Answer</span>
                          <h2 className="text-4xl font-black text-slate-800 mb-2">{currentCard?.word}</h2>
                          <p className="text-base font-mono font-bold text-indigo-500 mb-4">{currentCard?.pronunciation}</p>
                          <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-50"><p className="text-sm font-bold text-slate-600">{currentCard?.meaning}</p></div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-2 mb-6">
                  <Input placeholder="Type answer..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} className="flex-1 h-11 px-4 rounded-xl shadow-sm font-bold" />
                  <Button onClick={checkAnswer} className="h-11 px-6 rounded-xl bg-emerald-500 text-white font-black">Check</Button>
                </div>

                <div className="w-full flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-100">
                  <Button onClick={() => setCurrentIndex(prev => (prev - 1 + filteredDueCards.length) % filteredDueCards.length)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400"><ArrowRight className="w-4 h-4 rotate-180" /></Button>
                  <div className="flex gap-2">
                    <Button onClick={() => playAudio(currentCard?.word)} className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-white"><Volume2 className="w-4 h-4" /></Button>
                    <Button onClick={skipCard} className="h-10 px-4 rounded-xl bg-orange-50 text-orange-600 font-black text-xs">Quên</Button>
                    <Button onClick={masterCard} className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs">Thuộc</Button>
                  </div>
                  <Button onClick={() => setCurrentIndex(prev => (prev + 1) % filteredDueCards.length)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400"><ArrowRight className="w-4 h-4" /></Button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 px-6 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/5">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">Đã xong hết rồi!</h3>
                <p className="text-slate-500 font-medium mb-8">Bồ không còn từ nào cần học trong chủ đề {selectedTopic === 'all' ? 'này' : `<${selectedTopic}>`} hôm nay. Tuyệt vời quá!</p>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => setSelectedTopic('all')} className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200">HỌC TẤT CẢ CHỦ ĐỀ</Button>
                  <Button onClick={() => setActiveTab('notebook')} variant="ghost" className="text-indigo-600 font-black">XEM LẠI SỔ TAY</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'notebook' && (
          <motion.div key="notebook" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
            <div className="relative mb-4"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search words..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 rounded-xl border-slate-200" /></div>
            <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              {filteredCards.map(card => (
                <div key={card.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{card.word} <span className="text-[10px] text-slate-400 uppercase ml-2">lv{card.level || 0}</span></h4>
                    <p className="text-[10px] text-slate-500 font-medium">{card.meaning}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => playAudio(card.word)} className="w-8 h-8 rounded-full"><Volume2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'game' && (
          <motion.div key="game" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-[0_4px_0_#1e293b] flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Arrange letters for:</span>
              <h3 className="text-3xl font-black text-slate-800 mb-8">{currentCard?.meaning}</h3>
              
              <div className="flex flex-wrap justify-center gap-1.5 mb-10 min-h-[48px] border-b-2 border-slate-100 pb-2">
                {userSelection.map((char, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-[0_2px_0_#312e81]">{char}</motion.div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {scrambled.map((char, i) => (
                  <Button key={i} onClick={() => handleCharClick(char, i)} className="w-10 h-10 bg-white border border-slate-200 text-slate-800 rounded-xl font-black shadow-sm hover:border-indigo-400">{char}</Button>
                ))}
              </div>

              <Button variant="outline" onClick={resetSelection} className="h-10 px-6 rounded-xl border-slate-200 text-xs font-black"><RotateCcw className="w-3 h-3 mr-2" /> RESET</Button>
            </div>
            <div className="mt-4 flex justify-center"><div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 text-[10px] font-black text-emerald-600">Game Score: {gameScore}</div></div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center"><p className="text-2xl font-black text-slate-800">{allCards.length}</p><p className="text-[10px] font-black text-slate-400 uppercase">Words</p></div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center"><p className="text-2xl font-black text-slate-800">{masteredCount}</p><p className="text-[10px] font-black text-slate-400 uppercase">Mastered</p></div>
            </div>
            <Card className="p-6 rounded-3xl border-2 border-slate-900 bg-white">
              <h4 className="text-xs font-black text-slate-800 uppercase mb-4">Journey to Mastery</h4>
              <div className="h-3 bg-slate-50 rounded-full border border-slate-200 overflow-hidden mb-2">
                <motion.div animate={{ width: `${(masteredCount / allCards.length) * 100}%` }} className="h-full bg-emerald-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 text-right">{Math.round((masteredCount / allCards.length) * 100)}% Complete</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
