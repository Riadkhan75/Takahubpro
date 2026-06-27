import React, { useEffect, useState } from 'react';
import { HelpCircle, RefreshCw, Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { ref, get, update, push } from 'firebase/database';
import { UserData, GlobalSettings } from '../types';

interface MathSolveGameProps {
  userId: string;
  userData: UserData;
  globalSettings: GlobalSettings;
  onBalanceUpdate: () => void;
  addLiveToast: (message: string) => void;
}

export default function MathSolveGame({
  userId,
  userData,
  globalSettings,
  onBalanceUpdate,
  addLiveToast
}: MathSolveGameProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-' | '*'>('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'wrong' | 'submitting'>('idle');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const reward = Number(globalSettings.mathSolveReward ?? 1.0);
  const dailyLimit = Number(globalSettings.mathSolveDailyLimit ?? 10);
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
  const currentCount = (userData.lastMathSolveDate === todayStr) ? (userData.dailyMathSolveCount || 0) : 0;
  const limitLeft = Math.max(0, dailyLimit - currentCount);

  // Generate a new math problem
  const generateProblem = () => {
    const operators: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let n1 = 0;
    let n2 = 0;
    let ans = 0;

    if (op === '+') {
      n1 = Math.floor(Math.random() * 89) + 10; // 10 to 98
      n2 = Math.floor(Math.random() * 89) + 10;
      ans = n1 + n2;
    } else if (op === '-') {
      n1 = Math.floor(Math.random() * 89) + 10;
      n2 = Math.floor(Math.random() * (n1 - 5)) + 5; // Ensure positive result
      ans = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 12) + 2; // 2 to 13
      n2 = Math.floor(Math.random() * 10) + 2; // 2 to 11
      ans = n1 * n2;
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setCorrectAnswer(ans);
    setUserAnswer('');
    setStatus('idle');
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting' || status === 'success') return;

    if (userData.isBanned) {
      setMessage({ text: 'আপনার অ্যাকাউন্টটি ব্যান করা হয়েছে!', type: 'error' });
      return;
    }
    if (globalSettings.hideMathSolve) {
      setMessage({ text: 'এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে।', type: 'error' });
      return;
    }
    if (limitLeft <= 0) {
      setMessage({ text: 'আপনার আজকের লিমিট শেষ হয়ে গেছে!', type: 'error' });
      return;
    }

    const parsedAns = parseInt(userAnswer.trim());
    if (isNaN(parsedAns)) {
      setMessage({ text: 'দয়া করে একটি সঠিক সংখ্যা লিখুন।', type: 'error' });
      return;
    }

    if (parsedAns !== correctAnswer) {
      setStatus('wrong');
      setMessage({ text: 'ভুল উত্তর! আবার চেষ্টা করুন। ❌', type: 'error' });
      return;
    }

    // Correct Answer
    setStatus('submitting');
    setMessage(null);

    try {
      // Get fresh data to avoid concurrent race conditions
      const freshSnap = await get(ref(db, `users/${userId}`));
      const freshData = freshSnap.exists() ? freshSnap.val() as UserData : userData;

      const userCurrentCount = (freshData.lastMathSolveDate === todayStr) ? (freshData.dailyMathSolveCount || 0) : 0;
      if (userCurrentCount >= dailyLimit) {
        setMessage({ text: 'আপনার আজকের লিমিট শেষ হয়ে গেছে!', type: 'error' });
        setStatus('idle');
        return;
      }

      const nextBalance = Number((freshData.balance + reward).toFixed(2));
      const nextCount = userCurrentCount + 1;

      await update(ref(db, `users/${userId}`), {
        balance: nextBalance,
        lastMathSolveDate: todayStr,
        dailyMathSolveCount: nextCount
      });

      setStatus('success');
      setMessage({ text: `সঠিক উত্তর! আপনার ওয়ালেটে ৳${reward.toFixed(2)} যোগ করা হয়েছে। 🎉`, type: 'success' });
      onBalanceUpdate();

      const username = userData.username || 'ব্যবহারকারী';
      const toastMsg = `${username} ম্যাথ সলভ করে ৳${reward.toFixed(2)} আয় করেছেন! 🧮`;
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
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-2xs shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-800 text-sm sm:text-base">সহজ ম্যাথ সলভ টাস্ক</h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium">সহজ প্রশ্নের সঠিক উত্তর দিন এবং ব্যালেন্স যোগ করুন।</p>
          </div>
        </div>

        {/* Limit Badges */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-50/50 border border-amber-150 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-3xs">
            <Trophy size={13} className="text-amber-500 shrink-0" />
            <span className="text-[10px] font-black text-amber-700">পুরস্কার: ৳{reward.toFixed(2)}</span>
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
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <p className="font-extrabold text-stone-800 text-sm">আপনার আজকের দৈনিক লিমিট পূরণ হয়েছে!</p>
          <p className="text-stone-400 text-[10px] max-w-xs px-4">আগামীকাল আবার নতুন করে ম্যাথ সলভ খেলতে পারবেন। নতুন টাস্কের জন্য আমাদের সাথেই থাকুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Question Stage */}
          <div className="bg-gradient-to-b from-stone-50 to-stone-100/50 border border-stone-200/70 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center relative shadow-3xs">
            <div className="absolute top-2 left-2 text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">
              MATH QUESTION
            </div>
            
            <div className="flex items-center gap-4 py-4 select-none">
              <span className="text-3xl sm:text-4xl font-black text-stone-800 font-mono tracking-tight">{num1}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono">{operator === '*' ? '×' : operator}</span>
              <span className="text-3xl sm:text-4xl font-black text-stone-800 font-mono tracking-tight">{num2}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-400 font-mono">=</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono animate-pulse">?</span>
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              disabled={status === 'submitting' || status === 'success'}
              placeholder="আপনার উত্তরটি লিখুন..."
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                if (status === 'wrong') setStatus('idle');
              }}
              className="flex-1 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm font-black outline-none focus:border-amber-500 text-stone-800 transition shadow-3xs"
              required
            />
            {status === 'success' ? (
              <button
                type="button"
                onClick={generateProblem}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <RefreshCw size={15} />
                নতুন টাস্ক
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-sm hover:shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {status === 'submitting' ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
              </button>
            )}
          </form>

          {/* Tips Section */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/60 p-3.5 rounded-2xl">
            <HelpCircle size={15} className="text-stone-400 shrink-0" />
            <span className="text-[10px] text-stone-500 font-medium leading-relaxed">
              সঠিক উত্তর দিয়ে সাবমিট বাটনে ক্লিক করুন। ভুল উত্তর দিলে ব্যালেন্স কাটা যাবে না, আপনি পুনরায় সঠিক উত্তর দেওয়ার সুযোগ পাবেন।
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
