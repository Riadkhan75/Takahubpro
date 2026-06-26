import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, Star, Medal, Users } from 'lucide-react';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { UserData } from '../types';
import { getUserLevelAndBadge } from './UserApp';

interface LeaderboardProps {
  currentUserId: string;
}

interface LeaderboardUser {
  uid: string;
  username: string;
  totalAssets: number;
  badgeInfo: {
    level: number;
    label: string;
    badge: string;
    color: string;
  };
}

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, UserData>;
        const parsedUsers: LeaderboardUser[] = [];

        Object.entries(data).forEach(([uid, u]) => {
          if (u && !u.isBanned) {
            const totalAssets = (u.balance || 0) + 
                                (u.gmailBalance || 0) + 
                                (u.telegramBalance || 0) + 
                                (u.whatsappBalance || 0) + 
                                (u.facebookBalance || 0) + 
                                (u.instagramBalance || 0) + 
                                (u.adsBalance || 0);

            const badgeInfo = getUserLevelAndBadge(u);

            parsedUsers.push({
              uid,
              username: u.username || 'ব্যবহারকারী',
              totalAssets,
              badgeInfo
            });
          }
        });

        // Sort descending by total assets
        parsedUsers.sort((a, b) => b.totalAssets - a.totalAssets);
        setUsers(parsedUsers.slice(0, 100)); // Get top 100
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('লিডারবোর্ড লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-white border border-stone-200/70 rounded-[28px] p-5 sm:p-6 shadow-md space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Trophy className="stroke-[2.5px] animate-bounce" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-stone-850">সেরা আয়কারী লিডারবোর্ড</h2>
            <p className="text-[10px] text-stone-500 font-bold">চলতি মাসের সেরা ১০০ জন সফল ফ্রিল্যান্সার</p>
          </div>
        </div>
        <button 
          onClick={fetchLeaderboard}
          disabled={loading}
          className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition active:rotate-180 duration-500"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
          <span className="text-[10px] text-stone-400 font-bold">লিডারবোর্ড লোড করা হচ্ছে...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500 text-[10px] font-bold">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-stone-400 text-[10px] font-bold flex flex-col items-center gap-2">
          <Users size={20} />
          <span>কোনো তথ্য পাওয়া যায়নি</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {users.map((user, index) => {
            const isCurrentUser = user.uid === currentUserId;
            const rank = index + 1;

            return (
              <div 
                key={user.uid}
                className={`flex items-center justify-between p-3 rounded-2xl border transition duration-200 ${
                  isCurrentUser 
                    ? 'bg-amber-50/50 border-amber-200 shadow-xs' 
                    : 'bg-stone-50/40 border-stone-150 hover:bg-stone-50 hover:border-stone-200'
                }`}
              >
                {/* Left - Rank and User name */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    {rank === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-xs font-black font-mono text-stone-400">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=${isCurrentUser ? 'f59e0b' : '764ba2'}&color=fff&size=128`}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                      alt="avatar"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-extrabold truncate max-w-[120px] sm:max-w-[180px] ${
                          isCurrentUser ? 'text-amber-900 font-black' : 'text-stone-800'
                        }`}>
                          {user.username}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-amber-500 text-white font-extrabold text-[7px] px-1 rounded-sm uppercase tracking-wider leading-normal">YOU</span>
                        )}
                      </div>
                      
                      {/* Badge / Level info */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-bold text-stone-400">Lvl {user.badgeInfo.level}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm border ${user.badgeInfo.color.replace('text-', 'border-').replace('bg-', '')} ${user.badgeInfo.color.split(' ')[0]}`}>
                          {user.badgeInfo.badge} {user.badgeInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - Earnings */}
                <div className="text-right">
                  <span className="text-[9px] text-stone-400 font-bold block leading-none">সর্বমোট আয়</span>
                  <span className="text-xs font-black text-stone-850 font-mono">
                    ৳{user.totalAssets.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
