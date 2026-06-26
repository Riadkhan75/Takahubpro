import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw, Trophy, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { ref, get, update, push } from 'firebase/database';
import { UserData, GlobalSettings } from '../types';

interface ScratchCardGameProps {
  userId: string;
  userData: UserData;
  globalSettings: GlobalSettings;
  onBalanceUpdate: () => void;
  addLiveToast: (message: string) => void;
}

export default function ScratchCardGame({
  userId,
  userData,
  globalSettings,
  onBalanceUpdate,
  addLiveToast
}: ScratchCardGameProps) {
  const [gameState, setGameState] = useState<'idle' | 'purchased' | 'revealed'>('idle');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isRevealedRef = useRef(false);

  const price = globalSettings.scratchCardPrice ?? 5;
  const dailyLimit = globalSettings.scratchDailyLimit ?? 10;
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
  const currentCount = (userData.lastScratchDate === todayStr) ? (userData.dailyScratchCount || 0) : 0;
  const limitLeft = Math.max(0, dailyLimit - currentCount);

  // Parse rewards
  const rewardsList = (globalSettings.scratchRewards || '0.5,1,2,5,10,0.2,0.25,1.5')
    .split(',')
    .map(r => parseFloat(r.trim()))
    .filter(r => !isNaN(r));

  const handleBuyCard = async () => {
    if (userData.isBanned) {
      setMessage({ text: 'আপনার অ্যাকাউন্টটি ব্যান করা হয়েছে!', type: 'error' });
      return;
    }
    if (globalSettings.scratchMaintenanceEnabled) {
      setMessage({ text: globalSettings.scratchMaintenanceMessage || 'গেমটি সাময়িক রক্ষণাবেক্ষণের জন্য বন্ধ আছে।', type: 'error' });
      return;
    }
    if (limitLeft <= 0) {
      setMessage({ text: 'আপনার আজকের স্ক্র্যাচ লিমিট শেষ হয়ে গেছে!', type: 'error' });
      return;
    }
    if (userData.balance < price) {
      setMessage({ text: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
      return;
    }

    setMessage(null);
    setGameState('idle');
    setScratchPercent(0);
    isRevealedRef.current = false;

    // Determine random reward
    let selectedReward = 0;
    if (rewardsList.length > 0) {
      selectedReward = rewardsList[Math.floor(Math.random() * rewardsList.length)];
    } else {
      selectedReward = 1;
    }

    try {
      // Deduct card price immediately
      const freshSnap = await get(ref(db, `users/${userId}`));
      const freshData = freshSnap.exists() ? freshSnap.val() as UserData : userData;
      
      if (freshData.balance < price) {
        setMessage({ text: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
        return;
      }

      const nextBalance = Number((freshData.balance - price).toFixed(2));
      const nextCount = (freshData.lastScratchDate === todayStr) ? (freshData.dailyScratchCount || 0) + 1 : 1;

      await update(ref(db, `users/${userId}`), {
        balance: nextBalance,
        lastScratchDate: todayStr,
        dailyScratchCount: nextCount
      });

      setRewardAmount(selectedReward);
      setGameState('purchased');
      onBalanceUpdate();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'অপারেশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন।', type: 'error' });
    }
  };

  // Initialize Canvas
  useEffect(() => {
    if (gameState !== 'purchased' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Draw scratchable silver cover
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, '#E2E8F0'); // Light slate
    grad.addColorStop(0.5, '#CBD5E1'); // Slate gray
    grad.addColorStop(1, '#94A3B8'); // Dark slate
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add metallic pattern details
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < rect.width; i += 8) {
      ctx.fillRect(i, 0, 1.5, rect.height);
    }

    // Add text instructions
    ctx.fillStyle = '#334155';
    ctx.font = '900 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ঘষে পুরস্কার উন্মোচন করুন ✨', rect.width / 2, rect.height / 2);
    
    ctx.font = '500 9px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('SCRATCH AREA', rect.width / 2, (rect.height / 2) + 22);

    // Helper to calculate scratched percentage
    const checkScratchPercentage = () => {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let cleared = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) cleared++;
      }
      const pct = Math.round((cleared / (pixels.length / 4)) * 100);
      setScratchPercent(pct);

      if (pct > 40 && !isRevealedRef.current) {
        isRevealedRef.current = true;
        handleRevealSuccess();
      }
    };

    // Events
    const scratch = (clientX: number, clientY: number) => {
      const box = canvas.getBoundingClientRect();
      const x = clientX - box.left;
      const y = clientY - box.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();

      checkScratchPercentage();
    };

    const onMouseDown = () => setIsScratching(true);
    const onMouseUp = () => setIsDraggingFalse();
    const onMouseMove = (e: MouseEvent) => {
      if (isScratching) {
        scratch(e.clientX, e.clientY);
      }
    };

    const setIsDraggingFalse = () => setIsScratching(false);

    // Touch
    const onTouchStart = () => setIsScratching(true);
    const onTouchEnd = () => setIsDraggingFalse();
    const onTouchMove = (e: TouchEvent) => {
      if (isScratching && e.touches[0]) {
        scratch(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    canvas.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchmove', onTouchMove);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);

      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [gameState, isScratching]);

  // Handle successful scratch reveal
  const handleRevealSuccess = async () => {
    setGameState('revealed');
    try {
      const freshSnap = await get(ref(db, `users/${userId}`));
      const freshData = freshSnap.exists() ? freshSnap.val() as UserData : userData;
      
      const nextBalance = Number((freshData.balance + rewardAmount).toFixed(2));

      await update(ref(db, `users/${userId}`), {
        balance: nextBalance
      });

      onBalanceUpdate();

      const username = userData.username || 'ব্যবহারকারী';
      const msg = `${username} লাকি স্ক্র্যাচ কার্ড থেকে ৳${rewardAmount.toFixed(2)} জিতেছেন! ✨`;
      try {
        await push(ref(db, 'recent_activities'), {
          username: username,
          message: msg,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn("Failed to log scratch activity:", err);
        // Fallback to local toast if DB log fails
        addLiveToast(msg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-stone-200/60 shadow-md rounded-[28px] p-5 sm:p-6 space-y-5 max-w-md mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
            <Sparkles className="stroke-[2.5px] animate-pulse" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-stone-850">লাকি স্ক্র্যাচ কার্ড</h2>
            <p className="text-[10px] text-stone-500 font-bold">ঘষে ভাগ্য পরিবর্তন করুন!</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block font-bold">আজকের লিমিট</span>
          <span className="text-xs font-black text-stone-800 font-mono">
            {limitLeft} / {dailyLimit}
          </span>
        </div>
      </div>

      {/* GAME AREA */}
      <div className="relative">
        {gameState === 'idle' && (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
              <Trophy size={28} className="stroke-[2px]" />
            </div>
            <div>
              <h3 className="text-xs font-black text-stone-800">স্ক্র্যাচ কার্ড কিনুন</h3>
              <p className="text-[10px] text-stone-500 max-w-[240px] mx-auto mt-1 leading-relaxed">
                প্রতিটি কার্ডের মূল্য মাত্র <span className="font-bold text-teal-600">৳{price}</span>। প্রতিটি স্ক্র্যাচে আকর্ষণীয় নগদ পুরস্কার জয়ের সুযোগ রয়েছে।
              </p>
            </div>
            <button
              onClick={handleBuyCard}
              disabled={limitLeft <= 0}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                limitLeft <= 0 
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/10'
              }`}
            >
              <Sparkles size={14} />
              <span>কার্ড কিনুন (৳{price})</span>
            </button>
          </div>
        )}

        {(gameState === 'purchased' || gameState === 'revealed') && (
          <div className="relative overflow-hidden border border-stone-200/80 rounded-2xl shadow-xs bg-slate-900 aspect-video flex flex-col items-center justify-center">
            {/* UNDERLAY (THE REVEALED REWARD) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-teal-950/20 via-slate-950 to-teal-950/20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-1.5"
              >
                <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto text-teal-400 border border-teal-500/20">
                  <Trophy size={24} />
                </div>
                <div className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest">আপনি পেয়েছেন</div>
                <div className="text-3xl font-black text-white font-mono drop-shadow-md">
                  ৳{rewardAmount.toFixed(2)}
                </div>
                {gameState === 'revealed' && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-emerald-400 font-bold"
                  >
                    আপনার ব্যালেন্সে যোগ করা হয়েছে! 🎉
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* OVERLAY CANVAS */}
            {gameState === 'purchased' && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
              />
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {gameState === 'revealed' && (
        <button
          onClick={() => setGameState('idle')}
          className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={13} />
          <span>পরবর্তী স্ক্র্যাচ করুন</span>
        </button>
      )}

      {message && (
        <div className={`p-3 rounded-xl flex items-start gap-2.5 ${
          message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
        }`}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold leading-relaxed">{message.text}</p>
        </div>
      )}

      <div className="bg-stone-50 rounded-2xl p-4.5 space-y-2.5 border border-stone-150">
        <div className="flex items-center gap-1.5 text-stone-700">
          <HelpCircle size={13} className="text-teal-600" />
          <span className="text-[10px] font-extrabold">নিয়মাবলী ও নির্দেশিকা</span>
        </div>
        <ul className="list-disc pl-4 text-[9px] text-stone-500 font-medium space-y-1">
          <li>প্রতিটি কার্ডের মূল্য <span className="font-bold">৳{price}</span> যা আপনার মূল ব্যালেন্স থেকে কাটা হবে।</li>
          <li>প্রতিদিন সর্বোচ্চ <span className="font-bold">{dailyLimit}টি</span> কার্ড স্ক্র্যাচ করতে পারবেন।</li>
          <li>স্ক্র্যাচ এরিয়ায় কমপক্ষে <span className="font-bold">৪০% ঘষলে</span> পুরস্কারটি স্বয়ংক্রিয়ভাবে উন্মোচিত হবে ও ব্যালেন্সে জমা হবে।</li>
          <li>কোনো কারণে গেম চলাকালীন পেজ রিফ্রেশ দিলে বা বন্ধ করলে কার্ডের মূল্য ফেরত পাওয়া যাবে না।</li>
        </ul>
      </div>
    </div>
  );
}
