import React, { useEffect, useState } from 'react';
import { HelpCircle, RefreshCw, Trophy, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { ref, get, update, push } from 'firebase/database';
import { UserData, GlobalSettings } from '../types';

interface QuizPlayGameProps {
  userId: string;
  userData: UserData;
  globalSettings: GlobalSettings;
  onBalanceUpdate: () => void;
  addLiveToast: (message: string) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "বাংলাদেশের জাতীয় ফল কোনটি?",
    options: ["আম", "কাঁঠাল", "লিচু", "নারকেল"],
    answerIndex: 1
  },
  {
    id: 2,
    question: "বাংলাদেশের রাজধানীর নাম কি?",
    options: ["সিলেট", "চট্টগ্রাম", "ঢাকা", "রাজশাহী"],
    answerIndex: 2
  },
  {
    id: 3,
    question: "বাংলাদেশের জাতীয় কবি কে?",
    options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জসীমউদ্দীন", "জীবনানন্দ দাশ"],
    answerIndex: 1
  },
  {
    id: 4,
    question: "বিশ্বের সবচেয়ে বড় ম্যানগ্রোভ বনের নাম কি?",
    options: ["সুন্দরবন", "আমাজন বন", "ভাওয়ালের গড়", "শালবন"],
    answerIndex: 0
  },
  {
    id: 5,
    question: "পদ্মা সেতুর দৈর্ঘ্য কত কিলোমিটার?",
    options: ["৫.১৫ কিঃমিঃ", "৬.১৫ কিঃমিঃ", "৭.১৫ কিঃমিঃ", "৪.১৫ কিঃমিঃ"],
    answerIndex: 1
  },
  {
    id: 6,
    question: "কোন দেশকে উদীয়মান সূর্যের দেশ বলা হয়?",
    options: ["চীন", "জাপান", "যুক্তরাজ্য", "নরওয়ে"],
    answerIndex: 1
  },
  {
    id: 7,
    question: "কোন গ্রহকে লাল গ্রহ (Red Planet) বলা হয়?",
    options: ["শুক্র", "মঙ্গল", "বৃহস্পতি", "বুধ"],
    answerIndex: 1
  },
  {
    id: 8,
    question: "জলের রাসায়নিক সংকেত কোনটি?",
    options: ["CO2", "O2", "H2O", "NaCl"],
    answerIndex: 2
  },
  {
    id: 9,
    question: "কোনটি কম্পিউটারের মস্তিষ্ক (Brain of Computer) হিসেবে পরিচিত?",
    options: ["র‍্যাম (RAM)", "সিপিইউ (CPU)", "হার্ডডিস্ক (HDD)", "মনিটর"],
    answerIndex: 1
  },
  {
    id: 10,
    question: "আমাদের সৌরজগতে মোট কয়টি গ্রহ আছে?",
    options: ["৭টি", "৮টি", "৯টি", "১০টি"],
    answerIndex: 1
  },
  {
    id: 11,
    question: "পৃথিবীর সবচেয়ে ছোট পাখির নাম কি?",
    options: ["হামিংবার্ড", "চড়ুই", "টুনটুনি", "দোয়েল"],
    answerIndex: 0
  },
  {
    id: 12,
    question: "বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?",
    options: ["চর্যাপদ", "শ্রীকৃষ্ণকীর্তন", "গীতাঞ্জলি", "পদ্মা মেঘনা যমুনা"],
    answerIndex: 0
  },
  {
    id: 13,
    question: "কোন স্তন্যপায়ী প্রাণী উড়তে পারে?",
    options: ["পেঙ্গুইন", "বাদুড়", "তিমি", "কাঠবিড়ালি"],
    answerIndex: 1
  },
  {
    id: 14,
    question: "ইউটিউব (YouTube) কত সালে প্রতিষ্ঠিত হয়?",
    options: ["২০০৩ সালে", "২০০৪ সালে", "২০০৫ সালে", "২০০৬ সালে"],
    answerIndex: 2
  },
  {
    id: 15,
    question: "বিশ্বে ইন্টারনেট প্রথম চালু হয় কোন সংস্থার মাধ্যমে?",
    options: ["ARPANET", "NASA", "CERN", "Google"],
    answerIndex: 0
  }
];

export default function QuizPlayGame({
  userId,
  userData,
  globalSettings,
  onBalanceUpdate,
  addLiveToast
}: QuizPlayGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'wrong' | 'submitting'>('idle');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const reward = Number(globalSettings.quizReward ?? 1.0);
  const dailyLimit = Number(globalSettings.quizDailyLimit ?? 10);
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
  const currentCount = (userData.lastQuizPlayDate === todayStr) ? (userData.dailyQuizPlayCount || 0) : 0;
  const limitLeft = Math.max(0, dailyLimit - currentCount);

  // Pick a random quiz question different from current if possible
  const loadNewQuestion = () => {
    let available = QUIZ_QUESTIONS;
    if (currentQuestion) {
      available = QUIZ_QUESTIONS.filter(q => q.id !== currentQuestion.id);
    }
    const randomQ = available[Math.floor(Math.random() * available.length)];
    setCurrentQuestion(randomQ);
    setSelectedOption(null);
    setStatus('idle');
    setMessage(null);
  };

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const handleOptionClick = (idx: number) => {
    if (status === 'submitting' || status === 'success' || status === 'wrong') return;
    setSelectedOption(idx);
    setMessage(null);
  };

  const handleSkipQuestion = async () => {
    if (status === 'submitting' || status === 'success' || status === 'wrong') return;
    if (userData.isBanned) {
      setMessage({ text: 'আপনার অ্যাকাউন্টটি ব্যান করা হয়েছে!', type: 'error' });
      return;
    }
    if (globalSettings.hideQuiz) {
      setMessage({ text: 'এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে।', type: 'error' });
      return;
    }
    if (limitLeft <= 0) {
      setMessage({ text: 'আপনার আজকের লিমিট শেষ হয়ে গেছে!', type: 'error' });
      return;
    }

    setStatus('submitting');
    setMessage(null);

    try {
      const freshSnap = await get(ref(db, `users/${userId}`));
      const freshData = freshSnap.exists() ? freshSnap.val() as UserData : userData;

      const userCurrentCount = (freshData.lastQuizPlayDate === todayStr) ? (freshData.dailyQuizPlayCount || 0) : 0;
      if (userCurrentCount >= dailyLimit) {
        setMessage({ text: 'আপনার আজকের লিমিট শেষ হয়ে গেছে!', type: 'error' });
        setStatus('idle');
        return;
      }

      const nextCount = userCurrentCount + 1;

      await update(ref(db, `users/${userId}`), {
        lastQuizPlayDate: todayStr,
        dailyQuizPlayCount: nextCount
      });

      setStatus('wrong');
      const correctOpt = currentQuestion ? currentQuestion.options[currentQuestion.answerIndex] : '';
      setMessage({ 
        text: `টাস্কটি বাদ দেওয়া হয়েছে এবং ১টি লিমিট কাটা গিয়েছে। সঠিক উত্তর ছিল: "${correctOpt}"। ❌`, 
        type: 'error' 
      });
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setMessage({ text: 'অপারেশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।', type: 'error' });
    }
  };

  const handleVerifyAnswer = async () => {
    if (currentQuestion === null || selectedOption === null) return;
    if (status === 'submitting' || status === 'success' || status === 'wrong') return;

    if (userData.isBanned) {
      setMessage({ text: 'আপনার অ্যাকাউন্টটি ব্যান করা হয়েছে!', type: 'error' });
      return;
    }
    if (globalSettings.hideQuiz) {
      setMessage({ text: 'এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে।', type: 'error' });
      return;
    }
    if (limitLeft <= 0) {
      setMessage({ text: 'আপনার আজকের লিমিট শেষ হয়ে গেছে!', type: 'error' });
      return;
    }

    setStatus('submitting');
    setMessage(null);

    try {
      const freshSnap = await get(ref(db, `users/${userId}`));
      const freshData = freshSnap.exists() ? freshSnap.val() as UserData : userData;

      const userCurrentCount = (freshData.lastQuizPlayDate === todayStr) ? (freshData.dailyQuizPlayCount || 0) : 0;
      if (userCurrentCount >= dailyLimit) {
        setMessage({ text: 'আপনার আজকের লিমিট শেষ হয়ে গেছে!', type: 'error' });
        setStatus('idle');
        return;
      }

      const nextCount = userCurrentCount + 1;

      if (selectedOption !== currentQuestion.answerIndex) {
        // Wrong Answer: Deduct 1 limit, no reward
        await update(ref(db, `users/${userId}`), {
          lastQuizPlayDate: todayStr,
          dailyQuizPlayCount: nextCount
        });

        setStatus('wrong');
        const correctOpt = currentQuestion.options[currentQuestion.answerIndex];
        setMessage({ 
          text: `ভুল উত্তর! আপনার ১টি দৈনিক লিমিট কাটা গিয়েছে। সঠিক উত্তর ছিল: "${correctOpt}"। ❌`, 
          type: 'error' 
        });
        return;
      }

      // Correct Answer
      const nextBalance = Number((freshData.balance + reward).toFixed(2));

      await update(ref(db, `users/${userId}`), {
        balance: nextBalance,
        lastQuizPlayDate: todayStr,
        dailyQuizPlayCount: nextCount
      });

      setStatus('success');
      setMessage({ text: `অসাধারণ! সঠিক উত্তর দেওয়ার জন্য ৳${reward.toFixed(2)} পুরস্কার পেয়েছেন। 🎉`, type: 'success' });
      onBalanceUpdate();

      const username = userData.username || 'ব্যবহারকারী';
      const toastMsg = `${username} কুইজ খেলে ৳${reward.toFixed(2)} জয় করেছেন! 🧠`;
      try {
        await push(ref(db, 'recent_activities'), {
          username: username,
          message: toastMsg,
          timestamp: Date.now()
        });
      } catch (err) {
        addLiveToast(toastMsg);
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setMessage({ text: 'অপারেশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।', type: 'error' });
    }
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 select-none relative overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shadow-2xs shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-800 text-sm sm:text-base">দৈনিক কুইজ খেলুন</h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium">সাধারণ জ্ঞানের প্রশ্নের সঠিক উত্তর দিন এবং পুরস্কার জিতুন।</p>
          </div>
        </div>

        {/* Limit Badges */}
        <div className="flex items-center gap-2">
          <div className="bg-cyan-50/50 border border-cyan-150 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-3xs">
            <Trophy size={13} className="text-cyan-500 shrink-0" />
            <span className="text-[10px] font-black text-cyan-700">পুরস্কার: ৳{reward.toFixed(2)}</span>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-3xs">
            <HelpCircle size={13} className="text-stone-500 shrink-0" />
            <span className="text-[10px] font-black text-stone-700">বাকি: {limitLeft} / {dailyLimit} বার</span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-150/60'
                : 'bg-rose-50 text-rose-800 border border-rose-150/60'
            }`}
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {limitLeft <= 0 ? (
        <div className="py-8 text-center flex flex-col items-center space-y-3 bg-stone-50 rounded-3xl border border-stone-200/50">
          <div className="w-12 h-12 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <p className="font-extrabold text-stone-800 text-sm">আপনার আজকের কুইজ খেলার লিমিট পূরণ হয়েছে!</p>
          <p className="text-stone-400 text-[10px] max-w-xs px-4">আগামীকাল আবার নতুন করে সাধারণ জ্ঞান কুইজ খেলতে পারবেন। ধন্যবাদ আমাদের সাথে থাকার জন্য।</p>
        </div>
      ) : (
        currentQuestion && (
          <div className="space-y-5">
            {/* Question Stage */}
            <div className="bg-gradient-to-b from-stone-50 to-stone-100/30 border border-stone-200/70 p-5 sm:p-6 rounded-3xl relative shadow-3xs">
              <div className="absolute top-2 left-2.5 text-[8.5px] font-extrabold text-stone-400 uppercase tracking-widest">
                QUIZ QUESTION
              </div>
              <p className="text-stone-800 font-extrabold text-sm sm:text-base mt-2 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Option Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.answerIndex;
                let btnStyle = "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700";
                
                if (status === 'success') {
                  if (isSelected) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900";
                  }
                } else if (status === 'wrong') {
                  if (isSelected) {
                    btnStyle = "bg-rose-50 border-rose-500 text-rose-950";
                  } else if (isCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900";
                  }
                } else {
                  if (isSelected) {
                    btnStyle = "bg-cyan-50/70 border-cyan-500 text-cyan-900";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={status === 'submitting' || status === 'success' || status === 'wrong'}
                    onClick={() => handleOptionClick(idx)}
                    className={`border-2 rounded-2xl p-3.5 text-xs sm:text-sm font-bold transition-all text-left flex items-center justify-between shadow-3xs cursor-pointer active:scale-[0.99] ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {status === 'success' && isSelected && (
                      <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    )}
                    {status === 'wrong' && isSelected && (
                      <span className="text-rose-600 font-extrabold shrink-0 text-xs">❌</span>
                    )}
                    {status === 'wrong' && isCorrect && (
                      <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              {status === 'success' || status === 'wrong' ? (
                <button
                  type="button"
                  onClick={loadNewQuestion}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                >
                  <RefreshCw size={15} />
                  পরবর্তী কুইজ
                </button>
              ) : (
                <div className="flex gap-2 w-full justify-end">
                  <button
                    type="button"
                    onClick={handleSkipQuestion}
                    disabled={status === 'submitting'}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xs active:scale-95 transition cursor-pointer"
                  >
                    পারি না (বাদ দিন)
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyAnswer}
                    disabled={selectedOption === null || status === 'submitting'}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    {status === 'submitting' ? 'যাচাই করা হচ্ছে...' : 'উত্তর সাবমিট করুন'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
