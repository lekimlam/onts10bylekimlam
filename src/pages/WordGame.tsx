import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Shuffle, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, limit, query, updateDoc, doc, increment } from 'firebase/firestore';
import { useAuth } from '@/src/lib/auth-context';

export function WordGame() {
  const { user, refreshUser } = useAuth();
  const [words, setWords] = useState<any[]>([]);
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      const q = query(collection(db, 'flashcards'), limit(10));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWords(list);
      if (list.length > 0) setupGame(list[0]);
      setLoading(false);
    };
    fetchWords();
  }, []);

  const setupGame = (wordObj: any) => {
    setCurrentWord(wordObj);
    const chars = wordObj.word.toUpperCase().split('');
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    setScrambled(shuffled);
    setUserSelection([]);
  };

  const handleCharClick = (char: string, index: number) => {
    setUserSelection(prev => [...prev, char]);
    const newScrambled = [...scrambled];
    newScrambled.splice(index, 1);
    setScrambled(newScrambled);
  };

  const resetSelection = () => {
    const chars = currentWord.word.toUpperCase().split('');
    setScrambled([...chars].sort(() => Math.random() - 0.5));
    setUserSelection([]);
  };

  useEffect(() => {
    if (currentWord && userSelection.join('') === currentWord.word.toUpperCase()) {
      handleWin();
    }
  }, [userSelection]);

  const handleWin = async () => {
    setScore(prev => prev + 1);
    toast.success('Xếp chữ chính xác! +10 XP');
    
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { xp: increment(10) });
      refreshUser();
    }

    setTimeout(() => {
      const nextIdx = (words.indexOf(currentWord) + 1) % words.length;
      setupGame(words[nextIdx]);
    }, 1500);
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading game...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col items-center gap-8">
      <div className="w-full flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-900 shadow-[0_4px_0_#1e293b]">
        <h2 className="font-black text-slate-800 flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-indigo-600" /> GAME XẾP CHỮ
        </h2>
        <div className="bg-indigo-600 text-white px-4 py-1 rounded-full font-black text-sm">
          {score} ĐIỂM
        </div>
      </div>

      <Card className="w-full p-8 rounded-[3rem] border-2 border-slate-900 text-center shadow-[0_8px_0_#1e293b]">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Hãy xếp thành từ có nghĩa là:</span>
        <h3 className="text-4xl font-black text-slate-800 mb-8">{currentWord?.meaning}</h3>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12 min-h-[64px] border-b-4 border-slate-100 pb-4">
          <AnimatePresence>
            {userSelection.map((char, i) => (
              <motion.div
                key={`${char}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_4px_0_#3730a3]"
              >
                {char}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {scrambled.map((char, i) => (
            <motion.button
              key={`${char}-${i}`}
              whileHover={{ y: -4 }}
              whileActive={{ scale: 0.9 }}
              onClick={() => handleCharClick(char, i)}
              className="w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-800 font-black text-2xl shadow-[0_4px_0_#e2e8f0] hover:border-indigo-400"
            >
              {char}
            </motion.button>
          ))}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={resetSelection}
          className="h-14 px-8 rounded-2xl border-2 border-slate-900 font-black flex items-center gap-2 hover:bg-slate-50"
        >
          <RotateCcw className="w-5 h-5" /> LÀM LẠI
        </Button>
      </div>

      <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-200 text-amber-800 flex items-center gap-4">
        <Award className="w-10 h-10" />
        <div>
          <p className="font-black text-sm uppercase">Mẹo học tập</p>
          <p className="text-xs font-bold opacity-80">Game xếp chữ giúp bồ ghi nhớ chính xác thứ tự các ký tự trong từ vựng khó!</p>
        </div>
      </div>
    </div>
  );
}
