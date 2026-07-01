import React, { useState, useEffect, useRef } from 'react';
import ScratchCardGame from './ScratchCardGame';
import Leaderboard from './Leaderboard';
import MathSolveGame from './MathSolveGame';
import QuizPlayGame from './QuizPlayGame';
import { 
  auth, 
  db 
} from '../firebase';
import { 
  sanitizeInput, 
  isMaliciousInput, 
  logSecurityAlert 
} from '../utils/security';
import { 
  ref, 
  onValue, 
  set, 
  push, 
  update, 
  get,
  onChildAdded
} from 'firebase/database';
import { 
  UserData, 
  Job, 
  JobSubmission, 
  ReferralMission, 
  HomeTask, 
  GlobalSettings, 
  ActivationRequest, 
  AdCampaign,
  GlobalNotification,
  ExternalWebsite,
  InvestmentPlan,
  PurchasedPlan,
  SocialText,
  GiftCode
} from '../types';
import { 
  Wallet, 
  UserPlus, 
  ArrowLeftRight, 
  ArrowDown,
  ArrowUp,
  Gift, 
  Download,
  Home, 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Share2, 
  ChevronRight, 
  Lock, 
  Upload, 
  ExternalLink, 
  LogOut, 
  AlertCircle, 
  Smartphone, 
  Coins, 
  TrendingUp, 
  Menu,
  Briefcase,
  Play,
  LockKeyhole,
  ShoppingBag,
  Bell,
  HelpCircle,
  AlertOctagon,
  XOctagon,
  X,
  Check,
  Volume2,
  Facebook,
  Instagram,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  Globe,
  Award,
  Phone,
  Shield,
  Key,
  Gamepad2,
  Grid,
  History,
  Mail,
  Compass,
  User,
  Calendar,
  Edit3,
  MapPin,
  Save,
  ChevronDown,
  ArrowDownCircle,
  Sparkles,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IMGBB_API_KEY = '20525efceff3938cbfc52fa653e9f86a';

function AdsterraScriptBanner({ scriptCode }: { scriptCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scriptCode || !containerRef.current) return;
    
    // Track original methods
    const originalWindowAdd = window.addEventListener;
    const originalDocumentAdd = document.addEventListener;
    const originalBodyAdd = document.body ? document.body.addEventListener : null;

    // Keep track of added listeners so we can remove them on unmount
    const windowListeners: { type: string; listener: any; options?: any }[] = [];
    const documentListeners: { type: string; listener: any; options?: any }[] = [];
    const bodyListeners: { type: string; listener: any; options?: any }[] = [];

    // Track elements added to body / head during this time
    const addedElements: HTMLElement[] = [];

    // Intercept window.addEventListener
    window.addEventListener = function (type, listener, options) {
      windowListeners.push({ type, listener, options });
      return originalWindowAdd.call(window, type, listener, options);
    };

    // Intercept document.addEventListener
    document.addEventListener = function (type, listener, options) {
      documentListeners.push({ type, listener, options });
      return originalDocumentAdd.call(document, type, listener, options);
    };

    // Intercept document.body.addEventListener
    if (originalBodyAdd) {
      document.body.addEventListener = function (type, listener, options) {
        bodyListeners.push({ type, listener, options });
        return originalBodyAdd.call(document.body, type, listener, options);
      };
    }

    // Intercept element creation/appends to clean up elements added to document.body / document.head
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = function (child) {
      if (child instanceof HTMLElement) {
        addedElements.push(child);
      }
      return originalAppendChild.call(document.body, child);
    } as any;

    const originalHeadAppendChild = document.head.appendChild;
    document.head.appendChild = function (child) {
      if (child instanceof HTMLElement) {
        addedElements.push(child);
      }
      return originalHeadAppendChild.call(document.head, child);
    } as any;

    const originalInsertBefore = document.body.insertBefore;
    document.body.insertBefore = function (newChild, refChild) {
      if (newChild instanceof HTMLElement) {
        addedElements.push(newChild);
      }
      return originalInsertBefore.call(document.body, newChild, refChild);
    } as any;

    // Clear previous
    containerRef.current.innerHTML = '';
    
    try {
      const doc = document.createElement('div');
      doc.innerHTML = scriptCode;
      
      const scripts = doc.getElementsByTagName('script');
      Array.from(scripts).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
      
      containerRef.current.appendChild(doc);
    } catch (err) {
      console.error("Adsterra Script load error:", err);
    }

    return () => {
      // 1. Restore standard API methods
      window.addEventListener = originalWindowAdd;
      document.addEventListener = originalDocumentAdd;
      if (originalBodyAdd && document.body) {
        document.body.addEventListener = originalBodyAdd;
      }
      document.body.appendChild = originalAppendChild;
      document.head.appendChild = originalHeadAppendChild;
      document.body.insertBefore = originalInsertBefore;

      // 2. Remove all added event listeners
      windowListeners.forEach(({ type, listener, options }) => {
        window.removeEventListener(type, listener, options);
      });
      documentListeners.forEach(({ type, listener, options }) => {
        document.removeEventListener(type, listener, options);
      });
      bodyListeners.forEach(({ type, listener, options }) => {
        document.body.removeEventListener(type, listener, options);
      });

      // 3. Clear direct click overrides that ad scripts do to intercept page actions
      window.onclick = null;
      document.onclick = null;
      if (document.body) {
        document.body.onclick = null;
      }

      // 4. Remove elements created / appended to body or head during watch
      addedElements.forEach(el => {
        try {
          el.parentNode?.removeChild(el);
        } catch (_) {}
      });

      // 5. Clean up typical adsterra global properties in window
      const knownKeys = ['_atr', '_atrk', '_atrk_opts', 'Adsterra', 'p_atr', 'at_push', 'active_ad'];
      knownKeys.forEach(k => {
        try {
          delete (window as any)[k];
        } catch (_) {}
      });

      // 6. Direct DOM scan for script tags with external sources or frames and sweep them
      const extraneous = document.querySelectorAll('script, iframe, [id^="asg_"], [class^="asg_"]');
      extraneous.forEach(el => {
        const src = el.getAttribute('src') || '';
        // If it belongs to ad distribution / popunder systems, delete it
        if (src && !src.includes(window.location.host) && !src.startsWith('/') && !src.startsWith('./')) {
          try {
            el.parentNode?.removeChild(el);
          } catch (_) {}
        }
      });
    };
  }, [scriptCode]);

  if (!scriptCode) return null;

  return (
    <div className="bg-white border border-stone-150 p-3 rounded-2xl flex flex-col items-center justify-center my-4 overflow-hidden shadow-xs min-h-[60px] w-full">
      <span className="text-[9px] text-stone-400 font-bold mb-1 uppercase tracking-wider block">Sponsored Banner</span>
      <div ref={containerRef} className="w-full flex justify-center items-center" />
    </div>
  );
}

// --- SHOLO GUTI / BEAD 16 SYSTEM STUFFS ---
export interface GutiNode {
  id: number;
  x: number;
  y: number;
}

export interface SholoMove {
  from: number;
  to: number;
  isCapture: boolean;
  capturedNode?: number;
}

const buildSholoGutiSystem = () => {
  const nodes: GutiNode[] = [];
  
  // Top Triangle
  nodes.push({ id: 0, x: 4, y: 0 }); // Apex
  nodes.push({ id: 1, x: 3, y: 1 });
  nodes.push({ id: 2, x: 5, y: 1 });
  nodes.push({ id: 3, x: 2, y: 2 });
  nodes.push({ id: 4, x: 4, y: 2 });
  nodes.push({ id: 5, x: 6, y: 2 });
  
  // Grid 5x5
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      nodes.push({
        id: 6 + r * 5 + c,
        x: c * 2,
        y: 3 + r
      });
    }
  }
  
  // Bottom Triangle
  nodes.push({ id: 31, x: 2, y: 8 });
  nodes.push({ id: 32, x: 4, y: 8 });
  nodes.push({ id: 33, x: 6, y: 8 });
  nodes.push({ id: 34, x: 3, y: 9 });
  nodes.push({ id: 35, x: 5, y: 9 });
  nodes.push({ id: 36, x: 4, y: 10 });
  
  // Connect neighbors
  const adj: { [key: number]: number[] } = {};
  for (let i = 0; i < 37; i++) adj[i] = [];
  
  const addEdge = (u: number, v: number) => {
    if (!adj[u].includes(v)) adj[u].push(v);
    if (!adj[v].includes(u)) adj[v].push(u);
  };
  
  // Top Triangle edges
  addEdge(0, 1); addEdge(0, 2); addEdge(0, 4);
  addEdge(1, 2); addEdge(1, 3);
  addEdge(2, 5);
  addEdge(3, 4); addEdge(4, 5);
  addEdge(3, 6);
  addEdge(4, 8);
  addEdge(5, 10);
  
  addEdge(1, 4);
  addEdge(2, 4);
  
  // Grid internal edges
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const id = 6 + r * 5 + c;
      if (c < 4) addEdge(id, id + 1);
      if (r < 4) addEdge(id, id + 5);
      
      if ((r + c) % 2 === 0) {
        if (r < 4 && c < 4) addEdge(id, id + 6);
        if (r < 4 && c > 0) addEdge(id, id + 4);
      }
    }
  }
  
  addEdge(7, 3);
  addEdge(9, 5);
  
  // Bottom Triangle edges
  addEdge(36, 34); addEdge(36, 35); addEdge(36, 32);
  addEdge(34, 35); addEdge(34, 31);
  addEdge(35, 33);
  addEdge(31, 32); addEdge(32, 33);
  addEdge(31, 26);
  addEdge(32, 28);
  addEdge(33, 30);
  
  addEdge(31, 27);
  addEdge(33, 29);
  
  addEdge(34, 32);
  addEdge(35, 32);
  
  return { nodes, adj };
};

const SHOLO_SYSTEM = buildSholoGutiSystem();
export const SHOLO_NODES = SHOLO_SYSTEM.nodes;
export const SHOLO_ADJ = SHOLO_SYSTEM.adj;

// Predefined straight collinear directions of >= 3 nodes to ensure perfect jumps
const SHOLO_LINES = [
  // Verticals
  [0, 4, 8, 13, 18, 23, 28, 32, 36],
  [6, 11, 16, 21, 26],
  [7, 12, 17, 22, 27],
  [9, 14, 19, 24, 29],
  [10, 15, 20, 25, 30],

  // Horizontals
  [3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30],
  [31, 32, 33],

  // Diagonals / Triangles outer edges
  [0, 1, 3, 6],
  [0, 2, 5, 10],
  [36, 34, 31, 26],
  [36, 35, 33, 30],

  // Inside center 5x5 grid diagonals
  [6, 12, 18, 24, 30],
  [10, 14, 18, 22, 26],
  [8, 12, 16],
  [8, 14, 20],
  [16, 22, 28],
  [20, 24, 28]
];

const getSholoMoves = (board: (string | null)[], player: string): SholoMove[] => {
  const moves: SholoMove[] = [];
  const opponent = player === 'P' ? 'C' : 'P';
  
  for (let from = 0; from < 37; from++) {
    if (board[from] !== player) continue;
    
    // 1. Check normal adjacent moves
    const neighborList = SHOLO_ADJ[from] || [];
    for (const to of neighborList) {
      if (board[to] === null) {
        moves.push({ from, to, isCapture: false });
      }
    }
    
    // 2. Check capture jumps
    for (const line of SHOLO_LINES) {
      const idx = line.indexOf(from);
      if (idx === -1) continue;
      
      // Look forward
      if (idx + 2 < line.length) {
        const over = line[idx + 1];
        const to = line[idx + 2];
        if (board[over] === opponent && board[to] === null) {
          const neighborsFrom = SHOLO_ADJ[from] || [];
          const neighborsOver = SHOLO_ADJ[over] || [];
          if (neighborsFrom.includes(over) && neighborsOver.includes(to)) {
            moves.push({ from, to, isCapture: true, capturedNode: over });
          }
        }
      }
      
      // Look backward
      if (idx - 2 >= 0) {
        const over = line[idx - 1];
        const to = line[idx - 2];
        if (board[over] === opponent && board[to] === null) {
          const neighborsFrom = SHOLO_ADJ[from] || [];
          const neighborsOver = SHOLO_ADJ[over] || [];
          if (neighborsFrom.includes(over) && neighborsOver.includes(to)) {
            moves.push({ from, to, isCapture: true, capturedNode: over });
          }
        }
      }
    }
  }
  
  return moves;
};

const evaluateSholoBoard = (board: (string | null)[]): number => {
  let score = 0;
  for (let i = 0; i < 37; i++) {
    if (board[i] === 'C') {
      score += 100; // Material gain
      score += (5 - Math.abs(SHOLO_NODES[i].x - 4) - Math.abs(SHOLO_NODES[i].y - 5)) * 2.5; // Positioning bonus
    } else if (board[i] === 'P') {
      score -= 100;
      score -= (5 - Math.abs(SHOLO_NODES[i].x - 4) - Math.abs(SHOLO_NODES[i].y - 5)) * 2.5;
    }
  }
  return score;
};

const sholoMinimax = (
  board: (string | null)[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; move: SholoMove | null } => {
  const pCount = board.filter(x => x === 'P').length;
  const cCount = board.filter(x => x === 'C').length;
  
  if (pCount === 0) return { score: 10000 + depth, move: null };
  if (cCount === 0) return { score: -10000 - depth, move: null };
  
  if (depth === 0) {
    return { score: evaluateSholoBoard(board), move: null };
  }
  
  const currentTurn = isMaximizing ? 'C' : 'P';
  const allMoves = getSholoMoves(board, currentTurn);
  
  if (allMoves.length === 0) {
    return { score: isMaximizing ? -8000 + depth : 8000 - depth, move: null };
  }
  
  // Heuristic rule: Jump moves must be explored first due to instant high utility!
  const captures = allMoves.filter(m => m.isCapture);
  const movesToSearch = captures.length > 0 ? captures : allMoves;
  
  let bestMove: SholoMove | null = null;
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of movesToSearch) {
      const nextBoard = [...board];
      nextBoard[move.to] = 'C';
      nextBoard[move.from] = null;
      if (move.isCapture && move.capturedNode !== undefined) {
        nextBoard[move.capturedNode] = null;
      }
      
      const result = sholoMinimax(nextBoard, depth - 1, alpha, beta, false);
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of movesToSearch) {
      const nextBoard = [...board];
      nextBoard[move.to] = 'P';
      nextBoard[move.from] = null;
      if (move.isCapture && move.capturedNode !== undefined) {
        nextBoard[move.capturedNode] = null;
      }
      
      const result = sholoMinimax(nextBoard, depth - 1, alpha, beta, true);
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
};
// --- END OF SHOLO GUTI SYSTEM ---

// Confetti canvas particle system
const ConfettiCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Confetti particles
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height - 20,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
      velocity: {
        x: Math.random() * 3 - 1.5,
        y: Math.random() * 5 + 3,
      }
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.angle += p.rotationSpeed;
        p.x += p.velocity.x;
        p.y += p.velocity.y;

        // Reset particle if it goes out of screen
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.velocity.y = Math.random() * 5 + 3;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-x-0 top-0 bottom-0 w-full h-full pointer-events-none z-40" 
    />
  );
};

// Web Audio API Sound Synthesizers for Lucky Wheel
let audioCtx: AudioContext | null = null;

const playTickSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

const playWinSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx!.currentTime + start);
      
      gain.gain.setValueAtTime(0.12, audioCtx!.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx!.currentTime + start + duration);
      
      osc.start(audioCtx!.currentTime + start);
      osc.stop(audioCtx!.currentTime + start + duration);
    };

    // Happy win arpeggio (C Major chord)
    playTone(523.25, 0, 0.2);     // C5
    playTone(659.25, 0.12, 0.2);  // E5
    playTone(783.99, 0.24, 0.2);  // G5
    playTone(1046.50, 0.36, 0.4); // C6
  } catch (e) {
    console.warn('Audio win play failed:', e);
  }
};

export function getUserLevelAndBadge(userData: any) {
  if (!userData) return { level: 1, label: 'Bronze', badge: '🥉', color: 'text-orange-600 bg-orange-50 border-orange-100' };
  const totalAssets = (userData.balance || 0) + 
                      (userData.gmailBalance || 0) + 
                      (userData.telegramBalance || 0) + 
                      (userData.whatsappBalance || 0) + 
                      (userData.facebookBalance || 0) + 
                      (userData.instagramBalance || 0) + 
                      (userData.adsBalance || 0);

  if (totalAssets >= 10000) return { level: 5, label: 'Diamond', badge: '💎', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' };
  if (totalAssets >= 5000) return { level: 4, label: 'Platinum', badge: '👑', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
  if (totalAssets >= 2000) return { level: 3, label: 'Gold', badge: '🥇', color: 'text-amber-600 bg-amber-50 border-amber-100' };
  if (totalAssets >= 500) return { level: 2, label: 'Silver', badge: '🥈', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  return { level: 1, label: 'Bronze', badge: '🥉', color: 'text-orange-600 bg-orange-50 border-orange-100' };
}

interface UserAppProps {
  userId: string;
  userEmail: string;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
  isAdminUser: boolean;
  onSwitchToNovaShop?: () => void;
}

export default function UserApp({ userId, userEmail, onLogout, onSwitchToAdmin, isAdminUser, onSwitchToNovaShop }: UserAppProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'refer' | 'transfer' | 'wallet' | 'mission' | 'all-jobs' | 'gmail-sell' | 'telegram-sell' | 'whatsapp-sell' | 'facebook-sell' | 'instagram-sell' | 'post-job' | 'job-details' | 'ads' | 'notifications' | 'support' | 'game' | 'spin' | 'scratch' | 'investment-plans' | 'profile' | 'deposit' | 'leaderboard' | 'gift-code' | 'install-app'>('home');
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
  const supportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (supportContainerRef.current && !supportContainerRef.current.contains(event.target as Node)) {
        setSupportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [missions, setMissions] = useState<ReferralMission[]>([]);
  const [homeTasks, setHomeTasks] = useState<HomeTask[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [websites, setWebsites] = useState<ExternalWebsite[]>([]);
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [purchasedPlans, setPurchasedPlans] = useState<PurchasedPlan[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [socialTexts, setSocialTexts] = useState<SocialText[]>([]);
  const [liveToasts, setLiveToasts] = useState<Array<{ id: string; text: string }>>([]);

  const addLiveToast = (text: string) => {
    // Smart Live Status Notifications are turned off
  };

  // Log helper to write user activities to the Firebase Database
  const logUserActivity = async (actionText: string) => {
    try {
      const activitiesRef = ref(db, 'recent_activities');
      const name = userData?.username || userEmail?.split('@')[0] || 'ব্যবহারকারী';
      await push(activitiesRef, {
        username: name,
        message: `${name} ${actionText}`,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Error logging user activity:", e);
    }
  };

  useEffect(() => {
    // Smart Live Status Notifications are turned off as requested
  }, [userData]);

  // User Profile States
  const [profileName, setProfileName] = useState('');
  const [profileBirth, setProfileBirth] = useState('');
  const [profileJob, setProfileJob] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileSex, setProfileSex] = useState('Male');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');


  // Tic Tac Toe Game states
  const [tttBoard, setTttBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerX, setIsPlayerX] = useState<boolean>(true); // Player is 'X', CPU is 'O'
  const [tttGameMode, setTttGameMode] = useState<'free' | 'bet'>('free');
  const [tttBetInput, setTttBetInput] = useState<string>('5');
  const [tttStatusText, setTttStatusText] = useState<string>('');
  const [tttGameState, setTttGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [tttActiveBet, setTttActiveBet] = useState<number>(0);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [tttGameMessage, setTttGameMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | '' }>({ text: '', type: '' });

  // Game Hub selector state
  const [selectedGame, setSelectedGame] = useState<'menu' | 'ttt' | 'sholo'>('menu');
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);

  // Sholo Guti Game states
  const [sholoBoard, setSholoBoard] = useState<(string | null)[]>([]);
  const [sholoActiveTurn, setSholoActiveTurn] = useState<'player' | 'computer'>('player');
  const [sholoGameState, setSholoGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [sholoGameMode, setSholoGameMode] = useState<'free' | 'bet'>('free');
  const [sholoBetInput, setSholoBetInput] = useState<string>('15');
  const [sholoActiveBet, setSholoActiveBet] = useState<number>(0);
  const [sholoSelectedPiece, setSholoSelectedPiece] = useState<number | null>(null);
  const [sholoGameMessage, setSholoGameMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | '' }>({ text: '', type: '' });
  const [isSholoAiThinking, setIsSholoAiThinking] = useState<boolean>(false);

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    minWithdraw: 50,
    minWithdrawGmail: 50,
    minWithdrawTelegram: 50,
    minWithdrawWhatsapp: 50,
    minWithdrawFacebook: 50,
    referLink: window.location.origin,
    appDownloadLink: '',
    gmailOpenPass: 'Shihab@2025#',
    telegramOpenPass: 'Shihab@2025#',
    whatsappOpenPass: 'Shihab@2025#',
    facebookOpenPass: 'Shihab@2025#',
    gmailPrice: 15,
    telegramPrice: 20,
    whatsappPrice: 30,
    facebookPrice: 25,
  });

  // Active or selected items
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [previousTab, setPreviousTab] = useState<'home' | 'all-jobs'>('home');

  // Gift Code States
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [giftCodeError, setGiftCodeError] = useState<string | null>(null);
  const [giftCodeSuccess, setGiftCodeSuccess] = useState<string | null>(null);
  const [giftCodeSubmitting, setGiftCodeSubmitting] = useState(false);

  // PWA Install Prompt States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Drawer / Side menu state
  const [isSidelineOpen, setIsSidelineOpen] = useState(false);

  // Popup state
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  
  // Track last seen settings to re-trigger if admin modifies them
  const lastPopupEnabled = useRef(false);
  const lastPopupTitle = useRef('');
  const lastPopupMessage = useRef('');

  useEffect(() => {
    if (globalSettings.popupEnabled) {
      const title = globalSettings.popupTitle || '';
      const message = globalSettings.popupMessage || '';
      
      // If popup was just enabled, or title/message changed, show it again
      if (!lastPopupEnabled.current || lastPopupTitle.current !== title || lastPopupMessage.current !== message) {
        setHasSeenPopup(false);
      }
    }
    lastPopupEnabled.current = !!globalSettings.popupEnabled;
    lastPopupTitle.current = globalSettings.popupTitle || '';
    lastPopupMessage.current = globalSettings.popupMessage || '';
  }, [globalSettings.popupEnabled, globalSettings.popupTitle, globalSettings.popupMessage]);

  const handleClosePopup = () => {
    setHasSeenPopup(true);
  };

  // Spin Wheel State variables
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [showSpinResultModal, setShowSpinResultModal] = useState(false);

  // Verification fee activation modal
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isNovaShopMaintModalOpen, setIsNovaShopMaintModalOpen] = useState(false);
  const [activeWebMaint, setActiveWebMaint] = useState<ExternalWebsite | null>(null);
  const [selectedVerifyMethod, setSelectedVerifyMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [verificationTrx, setVerificationTrx] = useState('');
  const [verificationNumber, setVerificationNumber] = useState('');
  const [verificationMessage, setVerificationMessage] = useState({ text: '', type: '' });
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // Custom Deposit Modal States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNumber, setDepositNumber] = useState('');
  const [depositTrx, setDepositTrx] = useState('');
  const [depositMessage, setDepositMessage] = useState({ text: '', type: '' });
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Master password visibility states
  const [showGmailMasterPass, setShowGmailMasterPass] = useState(false);
  const [showTelegramMasterPass, setShowTelegramMasterPass] = useState(false);
  const [showWhatsappMasterPass, setShowWhatsappMasterPass] = useState(false);
  const [showFacebookMasterPass, setShowFacebookMasterPass] = useState(false);
  const [showInstagramMasterPass, setShowInstagramMasterPass] = useState(false);

  // Social Sell History states
  const [selectedHistoryPlatform, setSelectedHistoryPlatform] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Instagram Sell states
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramPassword, setInstagramPassword] = useState('');
  const [instagram2FA, setInstagram2FA] = useState('');
  const [instagramMessage, setInstagramMessage] = useState({ text: '', type: '' });
  const [isSubmittingInstagram, setIsSubmittingInstagram] = useState(false);

  // Form states
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [gmailMessage, setGmailMessage] = useState({ text: '', type: '' });
  const [isSubmittingGmail, setIsSubmittingGmail] = useState(false);

  // Telegram Sell states
  const [telegramNumber, setTelegramNumber] = useState('');
  const [telegramDetails, setTelegramDetails] = useState('');
  const [telegramMessage, setTelegramMessage] = useState({ text: '', type: '' });
  const [isSubmittingTelegram, setIsSubmittingTelegram] = useState(false);

  // WhatsApp Sell states
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappDetails, setWhatsappDetails] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState({ text: '', type: '' });
  const [isSubmittingWhatsapp, setIsSubmittingWhatsapp] = useState(false);

  // Facebook Sell states
  const [facebookEmail, setFacebookEmail] = useState('');
  const [facebookPassword, setFacebookPassword] = useState('');
  const [facebook2FA, setFacebook2FA] = useState('');
  const [facebookMessage, setFacebookMessage] = useState({ text: '', type: '' });
  const [isSubmittingFacebook, setIsSubmittingFacebook] = useState(false);

  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState({ text: '', type: '' });
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const [withdrawMethod, setWithdrawMethod] = useState<'Bkash' | 'Nagad'>('Bkash');
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDepMethodDropdownOpen, setIsDepMethodDropdownOpen] = useState(false);
  const [withdrawBalanceType, setWithdrawBalanceType] = useState<'main' | 'gmail' | 'telegram' | 'whatsapp' | 'facebook' | 'instagram'>('main');
  const [withdrawNumber, setWithdrawNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState({ text: '', type: '' });
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Micro-job posting state
  const [postJobTitle, setPostJobTitle] = useState('');
  const [postJobLink, setPostJobLink] = useState('');
  const [postJobDesc, setPostJobDesc] = useState('');
  const [postJobReward, setPostJobReward] = useState('0.50');
  const [postJobMaxProof, setPostJobMaxProof] = useState(1);
  const [postJobBudget, setPostJobBudget] = useState('');
  const [postJobExpiry, setPostJobExpiry] = useState('');
  const [postShowLink, setPostShowLink] = useState(true);
  const [postJobFiles, setPostJobFiles] = useState<FileList | null>(null);
  const [postJobPreview, setPostJobPreview] = useState<string[]>([]);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [postJobMessage, setPostJobMessage] = useState({ text: '', type: '' });

  // Job work submission state
  const [submitFeedback, setSubmitFeedback] = useState('');
  const [submitProofFiles, setSubmitProofFiles] = useState<FileList | null>(null);
  const [submitProofsPreview, setSubmitProofsPreview] = useState<string[]>([]);
  const [isSubmittingJobWork, setIsSubmittingJobWork] = useState(false);
  const [submitJobWorkMessage, setSubmitJobWorkMessage] = useState({ text: '', type: '' });

  // Simulated Web Ads view states
  const [currentActiveAd, setCurrentActiveAd] = useState<AdCampaign | null>(null);
  const [adCountdown, setAdCountdown] = useState(15);
  const [isAdWatching, setIsAdWatching] = useState(false);
  const [isAdsterraWatching, setIsAdsterraWatching] = useState(false);
  const [adsterraCountdown, setAdsterraCountdown] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Common Notification Toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Helper to send Telegram notifications (Always use User Bot and User Channel Chat ID for dashboard activity logs)
  const sendTelegramNotification = async (messageText: string) => {
    let token = globalSettings?.telegramBotToken ? globalSettings.telegramBotToken.trim() : '';
    let chatId = globalSettings?.telegramChatId ? globalSettings.telegramChatId.trim() : '';

    if (token.toLowerCase().startsWith('bot')) {
      token = token.slice(3).trim();
    }
    if (token && chatId) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'HTML'
          })
        });
      } catch (tgErr) {
        console.warn('Telegram message failed to send:', tgErr);
      }
    }
  };

  // Helper to send Admin-specific secure notifications directly to the Admin Bot control space
  const sendAdminTelegramNotification = async (messageText: string) => {
    let token = globalSettings?.telegramAdminBotToken ? globalSettings.telegramAdminBotToken.trim() : '';
    let chatId = globalSettings?.telegramAdminChatId ? globalSettings.telegramAdminChatId.trim() : '';

    // If Admin Bot details are not populated yet, safely fallback to the User Bot channel/recipient so we don't drop alerts
    if (!token || !chatId) {
      token = globalSettings?.telegramBotToken ? globalSettings.telegramBotToken.trim() : '';
      chatId = globalSettings?.telegramChatId ? globalSettings.telegramChatId.trim() : '';
    }

    if (token.toLowerCase().startsWith('bot')) {
      token = token.slice(3).trim();
    }
    if (token && chatId) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'HTML'
          })
        });
      } catch (tgErr) {
        console.warn('Telegram Admin notification failed:', tgErr);
      }
    }
  };

  // 1. Listen to Realtime Database User data
  useEffect(() => {
    const userRef = ref(db, `users/${userId}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData({
          ...data,
          uid: userId
        });
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 1b. Listen to User withdrawals history
  useEffect(() => {
    if (!userId) return;
    const withdrawalsRef = ref(db, 'withdrawals');
    const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          }))
          .filter((x: any) => x && x.userId === userId)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setWithdrawals(list);
      } else {
        setWithdrawals([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 2. Listen to Global Settings
  const [globalNotifications, setGlobalNotifications] = useState<GlobalNotification[]>([]);

  useEffect(() => {
    const notificationsRef = ref(db, 'global_notifications');
    const unsubNotify = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })).sort((a,b) => b.timestamp - a.timestamp);
        setGlobalNotifications(list);
      } else {
        setGlobalNotifications([]);
      }
    });

    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGlobalSettings({
          ...data,
          minWithdraw: data.minWithdraw || 50,
          minWithdrawGmail: data.minWithdrawGmail || 50,
          minWithdrawTelegram: data.minWithdrawTelegram || 50,
          minWithdrawWhatsapp: data.minWithdrawWhatsapp || 50,
          minWithdrawFacebook: data.minWithdrawFacebook || 50,
          minWithdrawInstagram: data.minWithdrawInstagram || 50,
          minWithdrawAds: data.minWithdrawAds || 50,
          referLink: data.referLink || window.location.origin,
          appDownloadLink: data.appDownloadLink || '',
          gmailOpenPass: data.gmailOpenPass || 'Shihab@2025#',
          telegramOpenPass: data.telegramOpenPass || 'Shihab@2025#',
          whatsappOpenPass: data.whatsappOpenPass || 'Shihab@2025#',
          facebookOpenPass: data.facebookOpenPass || 'Shihab@2025#',
          instagramOpenPass: data.instagramOpenPass || 'Shihab@2025#',
          gmailPrice: data.gmailPrice || 15,
          withdrawFeePercent: data.withdrawFeePercent || 0,
          depositFeePercent: data.depositFeePercent || 0,
          telegramPrice: data.telegramPrice || 20,
          whatsappPrice: data.whatsappPrice || 30,
          facebookPrice: data.facebookPrice || 25,
          instagramPrice: data.instagramPrice || 20,
          activationNumbers: data.activationNumbers || {
            bkash: '01727172701',
            nagad: '01934984690'
          },
          popupEnabled: data.popupEnabled ?? false,
          popupTitle: data.popupTitle || '',
          popupMessage: data.popupMessage || '',
          popupImageUrl: data.popupImageUrl || '',
          popupLink: data.popupLink || '',
          runningNotice: data.runningNotice || '',
          emergencyEnabled: data.emergencyEnabled ?? false,
          emergencyMessage: data.emergencyMessage || '',
          spinRewards: data.spinRewards || '0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0',
          gmailMaintenanceEnabled: data.gmailMaintenanceEnabled ?? false,
          gmailMaintenanceMessage: data.gmailMaintenanceMessage || '',
          telegramMaintenanceEnabled: data.telegramMaintenanceEnabled ?? false,
          telegramMaintenanceMessage: data.telegramMaintenanceMessage || '',
          whatsappMaintenanceEnabled: data.whatsappMaintenanceEnabled ?? false,
          whatsappMaintenanceMessage: data.whatsappMaintenanceMessage || '',
          facebookMaintenanceEnabled: data.facebookMaintenanceEnabled ?? false,
          facebookMaintenanceMessage: data.facebookMaintenanceMessage || '',
          instagramMaintenanceEnabled: data.instagramMaintenanceEnabled ?? false,
          instagramMaintenanceMessage: data.instagramMaintenanceMessage || '',
          jobsMaintenanceEnabled: data.jobsMaintenanceEnabled ?? false,
          jobsMaintenanceMessage: data.jobsMaintenanceMessage || '',
          postJobMaintenanceEnabled: data.postJobMaintenanceEnabled ?? false,
          postJobMaintenanceMessage: data.postJobMaintenanceMessage || '',
          postJobAdminFee: data.postJobAdminFee || 0,
          spinMaintenanceEnabled: data.spinMaintenanceEnabled ?? false,
          spinMaintenanceMessage: data.spinMaintenanceMessage || '',
          transferMaintenanceEnabled: data.transferMaintenanceEnabled ?? false,
          transferMaintenanceMessage: data.transferMaintenanceMessage || '',
          depositMaintenanceEnabled: data.depositMaintenanceEnabled ?? false,
          depositMaintenanceMessage: data.depositMaintenanceMessage || '',
          withdrawMaintenanceEnabled: data.withdrawMaintenanceEnabled ?? false,
          withdrawMaintenanceMessage: data.withdrawMaintenanceMessage || '',
          referMaintenanceEnabled: data.referMaintenanceEnabled ?? false,
          referMaintenanceMessage: data.referMaintenanceMessage || '',
          adsMaintenanceEnabled: data.adsMaintenanceEnabled ?? false,
          adsMaintenanceMessage: data.adsMaintenanceMessage || '',
          missionsMaintenanceEnabled: data.missionsMaintenanceEnabled ?? false,
          missionsMaintenanceMessage: data.missionsMaintenanceMessage || '',
          novashopMaintenanceEnabled: data.novashopMaintenanceEnabled ?? false,
          novashopMaintenanceMessage: data.novashopMaintenanceMessage || '',
          investmentMaintenanceEnabled: data.investmentMaintenanceEnabled ?? false,
          investmentMaintenanceMessage: data.investmentMaintenanceMessage || '',
          gameDailyLimit: data.gameDailyLimit || 5,
          gameFreeReward: data.gameFreeReward || 1,
          gameMaintenanceEnabled: data.gameMaintenanceEnabled ?? false,
          gameMaintenanceMessage: data.gameMaintenanceMessage || '',
          scratchCardPrice: data.scratchCardPrice || 5,
          scratchDailyLimit: data.scratchDailyLimit || 10,
          scratchRewards: data.scratchRewards || '0.5,1,2,5,10,0.2,0.25,1.5',
          scratchMaintenanceEnabled: data.scratchMaintenanceEnabled ?? false,
          scratchMaintenanceMessage: data.scratchMaintenanceMessage || '',
          supportTelegramChannel: data.supportTelegramChannel || '',
          supportTelegramGroup: data.supportTelegramGroup || '',
          supportTelegramAdmin: data.supportTelegramAdmin || '',
          supportFacebookPage: data.supportFacebookPage || '',
          supportWhatsAppNumber: data.supportWhatsAppNumber || '',
          telegramBotToken: data.telegramBotToken || '',
          telegramChatId: data.telegramChatId || '',
          activationPrice: data.activationPrice || 100,
          freeActivationEnabled: data.freeActivationEnabled ?? false,
          adsterraDirectLink: data.adsterraDirectLink || '',
          adsterraDirectReward: data.adsterraDirectReward || 0.15,
          adsterraScriptCode: data.adsterraScriptCode || '',
          adsterraDailyLimit: data.adsterraDailyLimit || 10,
          mathSolveReward: data.mathSolveReward ?? 1.0,
          mathSolveDailyLimit: data.mathSolveDailyLimit ?? 10,
          quizReward: data.quizReward ?? 1.0,
          quizDailyLimit: data.quizDailyLimit ?? 10,
          hideMathSolve: data.hideMathSolve ?? false,
          hideQuiz: data.hideQuiz ?? false,
          mathSolveMaintenanceEnabled: data.mathSolveMaintenanceEnabled ?? false,
          mathSolveMaintenanceMessage: data.mathSolveMaintenanceMessage || '',
          quizMaintenanceEnabled: data.quizMaintenanceEnabled ?? false,
          quizMaintenanceMessage: data.quizMaintenanceMessage || '',
          mathSolveUnlockFee: data.mathSolveUnlockFee ?? 0,
          quizUnlockFee: data.quizUnlockFee ?? 0,
        });
      }
    });

    // Make lastActive dynamic ping
    let pingInterval: any;
    if (userId) {
      const updatePing = async () => {
        try {
          await update(ref(db, `users/${userId}`), {
            lastActive: Date.now()
          });
        } catch (e) {
          console.log("Ping error:", e);
        }
      };
      updatePing();
      pingInterval = setInterval(updatePing, 40000);
    }

    return () => {
      unsubscribe();
      unsubNotify();
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [userId]);

  // 3. Listen to Micro-Jobs
  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jobsList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })).reverse();
        setJobs(jobsList);
      } else {
        setJobs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 4. Listen to Referral Missions
  useEffect(() => {
    const missionsRef = ref(db, 'missions');
    const unsubscribe = onValue(missionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const missionsList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setMissions(missionsList);
      } else {
        setMissions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 5. Listen to Shortcuts/Home Tasks
  useEffect(() => {
    const tasksRef = ref(db, 'home_tasks');
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setHomeTasks(tasksList);
      } else {
        setHomeTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 6. Listen to Web Ads
  useEffect(() => {
    const adsRef = ref(db, 'ads');
    const unsubscribe = onValue(adsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adsList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setAds(adsList);
      } else {
        setAds([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 6.5. Listen to External Websites
  useEffect(() => {
    const websRef = ref(db, 'websites');
    const unsubscribe = onValue(websRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const websList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })) as ExternalWebsite[];
        setWebsites(websList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } else {
        setWebsites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Custom Admin Social Texts
  useEffect(() => {
    const socialTextsRef = ref(db, 'social_texts');
    const unsubscribe = onValue(socialTextsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })) as SocialText[];
        setSocialTexts(list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } else {
        setSocialTexts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Investment Plans
  useEffect(() => {
    const plansRef = ref(db, 'investment_plans');
    const unsubscribe = onValue(plansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const plansList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })) as InvestmentPlan[];
        setInvestmentPlans(plansList.sort((a, b) => (a.cost || 0) - (b.cost || 0)));
      } else {
        setInvestmentPlans([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to User Purchased Investments
  useEffect(() => {
    if (!userId) return;
    const userInvestRef = ref(db, `user_investments/${userId}`);
    const unsubscribe = onValue(userInvestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })) as PurchasedPlan[];
        setPurchasedPlans(userList.sort((a, b) => (b.purchaseDate || 0) - (a.purchaseDate || 0)));
      } else {
        setPurchasedPlans([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Upload Helper to ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (e) {
      // Fallback: Generate custom static mock URL or use Base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Copy helper
  const handleCopy = async (text: string, titleMessage: string = 'কপি করা হয়েছে') => {
    try {
      await navigator.clipboard.writeText(text);
      triggerToast(titleMessage, 'success');
    } catch (e) {
      triggerToast('কপি করতে ব্যর্থ, দয়া করে আবার চেষ্টা করুন', 'error');
    }
  };

  // --- TIC TAC TOE GAME ENGINE & HELPER FUNCTIONS ---
  const checkTttWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
  };

  const evaluateTttBoard = (board: (string | null)[]) => {
    const winner = checkTttWinner(board);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    return 0;
  };

  const minimaxTtt = (board: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const score = evaluateTttBoard(board);
    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (!board.some(cell => cell === null)) return 0;

    if (isMaximizing) {
      let best = -1000;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          best = Math.max(best, minimaxTtt(board, depth + 1, false));
          board[i] = null;
        }
      }
      return best;
    } else {
      let best = 1000;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          best = Math.min(best, minimaxTtt(board, depth + 1, true));
          board[i] = null;
        }
      }
      return best;
    }
  };

  const findBestTttMove = (board: (string | null)[]): number => {
    let bestVal = -1000;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        let moveVal = minimaxTtt(board, 0, false);
        board[i] = null;
        if (moveVal > bestVal) {
          bestMove = i;
          bestVal = moveVal;
        }
      }
    }
    return bestMove;
  };

  // --- SHOLO GUTI GAME FUNCTIONS ---
  const startSholoGame = async (mode: 'free' | 'bet') => {
    if (!userData) return;
    if (!userData.isActive && !globalSettings.freeActivationEnabled) {
      setSholoGameMessage({ text: 'গেম খেলতে দয়া করে আগে আমাদের ওয়েবসাইট থেকে আপনার অ্যাকাউন্ট সক্রিয় (Activate) করে নিন।', type: 'error' });
      return;
    }

    setSholoGameMessage({ text: '', type: '' });

    if (mode === 'free') {
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
      const lastDate = userData.lastGameDate || '';
      const currentCount = (lastDate === todayStr) ? (userData.dailyGameCount || 0) : 0;
      const totalLimit = globalSettings.gameDailyLimit || 5;

      if (currentCount >= totalLimit) {
        setSholoGameMessage({ text: 'আপনার আজকের ফ্রী গেম খেলার লিমিট শেষ হয়ে গেছে!', type: 'error' });
        return;
      }

      setSholoActiveBet(0);
    } else {
      // Bet Mode
      const betVal = parseFloat(sholoBetInput);
      if (isNaN(betVal) || betVal < 5) {
        setSholoGameMessage({ text: 'ন্যূনতম বেটের পরিমাণ ৫ টাকা হতে হবে!', type: 'error' });
        return;
      }
      if (userData.balance < betVal) {
        setSholoGameMessage({ text: 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
        return;
      }

      // Deduct bet immediately
      try {
        const freshSnap = await get(ref(db, `users/${userId}`));
        const freshVal = freshSnap.exists() ? freshSnap.val() : null;
        const currentBal = freshVal ? (freshVal.balance || 0) : userData.balance;

        if (currentBal < betVal) {
          setSholoGameMessage({ text: 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
          return;
        }

        const nextBal = currentBal - betVal;
        await update(ref(db, `users/${userId}`), { balance: nextBal });
        setSholoActiveBet(betVal);
      } catch (err: any) {
        setSholoGameMessage({ text: `সার্ভারে ত্রুটি: ${err.message}`, type: 'error' });
        return;
      }
    }

    // Initialize board (16 for CPU, 5 empty, 16 for Player)
    const initialBoard = [...Array(16).fill('C'), ...Array(5).fill(null), ...Array(16).fill('P')];
    setSholoBoard(initialBoard);
    setSholoActiveTurn('player');
    setSholoGameMode(mode);
    setSholoGameState('playing');
    setSholoSelectedPiece(null);
    setSholoGameMessage({ text: '১৬ গুটি খেলা শুরু হয়েছে! আপনার চাল দিতে আপনার নীল গুটি সিলেক্ট করুন।', type: 'info' });
  };

  const executeSholoMove = async (move: SholoMove) => {
    if (!sholoBoard) return;
    const nextBoard = [...sholoBoard];
    
    // Move piece
    nextBoard[move.to] = 'P';
    nextBoard[move.from] = null;
    
    // Handle capture
    if (move.isCapture && move.capturedNode !== undefined) {
      nextBoard[move.capturedNode] = null;
    }
    playTickSound();
    
    setSholoBoard(nextBoard);
    setSholoSelectedPiece(null);
    
    // Check if player won
    const cPiecesRemaining = nextBoard.filter(x => x === 'C').length;
    if (cPiecesRemaining === 0) {
      await handleSholoGameEnd('win', nextBoard);
      return;
    }
    
    // Check if computer has valid moves
    const compMoves = getSholoMoves(nextBoard, 'C');
    if (compMoves.length === 0) {
      await handleSholoGameEnd('win', nextBoard);
      return;
    }
    
    // Set computer turn
    setSholoActiveTurn('computer');
    setIsSholoAiThinking(true);
    
    // Delay AI play to simulate human logic
    setTimeout(async () => {
      // Depth 3 alpha-beta pruning minimax
      const aiResult = sholoMinimax(nextBoard, 3, -Infinity, Infinity, true);
      const bestAiMove = aiResult.move;
      
      if (bestAiMove) {
        nextBoard[bestAiMove.to] = 'C';
        nextBoard[bestAiMove.from] = null;
        if (bestAiMove.isCapture && bestAiMove.capturedNode !== undefined) {
          nextBoard[bestAiMove.capturedNode] = null;
        }
        playTickSound();
        setSholoBoard(nextBoard);
        
        // Check if computer won
        const pPiecesRemaining = nextBoard.filter(x => x === 'P').length;
        if (pPiecesRemaining === 0) {
          await handleSholoGameEnd('loss', nextBoard);
          return;
        }
        
        // Check if player has valid moves
        const playerMoves = getSholoMoves(nextBoard, 'P');
        if (playerMoves.length === 0) {
          await handleSholoGameEnd('loss', nextBoard);
          return;
        }
      } else {
        // Computer has no moves left -> Player wins!
        await handleSholoGameEnd('win', nextBoard);
        return;
      }
      
      setIsSholoAiThinking(false);
      setSholoActiveTurn('player');
    }, 850);
  };

  const handleSholoGameEnd = async (result: 'win' | 'loss', boardState: (string | null)[]) => {
    setSholoGameState('ended');
    setSholoSelectedPiece(null);
    setIsSholoAiThinking(false);

    if (sholoGameMode === 'free') {
      // Consume 1 daily limit
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
      const lastDate = userData?.lastGameDate || '';
      const currentCount = (lastDate === todayStr) ? (userData?.dailyGameCount || 0) : 0;

      try {
        await update(ref(db, `users/${userId}`), {
          lastGameDate: todayStr,
          dailyGameCount: currentCount + 1
        });

        if (result === 'win') {
          playWinSound();
          const reward = globalSettings.gameFreeReward || 1;
          const freshSnap = await get(ref(db, `users/${userId}`));
          const freshBal = freshSnap.exists() ? (freshSnap.val().balance || 0) : (userData?.balance || 0);

          await update(ref(db, `users/${userId}`), {
            balance: freshBal + reward
          });
          setSholoGameMessage({ text: `🎉 অবিশ্বাস্য! আপনি কম্পিউটারকে পরাজিত করেছেন এবং ৳${reward} ক্লেইম করেছেন!`, type: 'success' });
        } else {
          setSholoGameMessage({ text: '❌ আপনি হেরে গেছেন! নতুন উদ্যোগে আবার চেষ্টা করুন।', type: 'error' });
        }
      } catch (err: any) {
        setSholoGameMessage({ text: `লিমিট ব্যবহারে সমস্যা: ${err.message}`, type: 'error' });
      }
    } else {
      // Bet Mode
      const betVal = sholoActiveBet;
      try {
        if (result === 'win') {
          playWinSound();
          const doubleReward = betVal * 2;
          const freshSnap = await get(ref(db, `users/${userId}`));
          const freshBal = freshSnap.exists() ? (freshSnap.val().balance || 0) : (userData?.balance || 0);

          await update(ref(db, `users/${userId}`), {
            balance: freshBal + doubleReward
          });
          setSholoGameMessage({ text: `💥 অসাধারণ জয়! আপনি বাজি ম্যাচটি জিতেছেন এবং ২ গুন বা ৳${doubleReward} বাজি প্রফিট ফেরত পেয়েছেন!`, type: 'success' });
        } else {
          setSholoGameMessage({ text: `❌ আপনি ম্যাচটি হেরে গেছেন! আপনার বাজি ধরা ৳${betVal} ওয়ালেট থেকে কাটা হয়েছে।`, type: 'error' });
        }
        setSholoActiveBet(0);
      } catch (err: any) {
        setSholoGameMessage({ text: `ব্যালেন্স কনফিগারেশনে সমস্যা: ${err.message}`, type: 'error' });
      }
    }
  };

  const startTttGame = async (mode: 'free' | 'bet') => {
    if (!userData) return;
    if (!userData.isActive && !globalSettings.freeActivationEnabled) {
      setTttGameMessage({ text: 'গেম খেলতে দয়া করে আগে আমাদের ওয়েবসাইট থেকে আপনার অ্যাকাউন্ট সক্রিয় (Activate) করে নিন।', type: 'error' });
      return;
    }

    setTttGameMessage({ text: '', type: '' });

    if (mode === 'free') {
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
      const lastDate = userData.lastGameDate || '';
      const currentCount = (lastDate === todayStr) ? (userData.dailyGameCount || 0) : 0;
      const totalLimit = globalSettings.gameDailyLimit || 5;

      if (currentCount >= totalLimit) {
        setTttGameMessage({ text: 'আপনার আজকের ফ্রী গেম খেলার লিমিট শেষ হয়ে গেছে!', type: 'error' });
        return;
      }

      setTttActiveBet(0);
    } else {
      // Bet Mode
      const betVal = parseFloat(tttBetInput);
      if (isNaN(betVal) || betVal < 5) {
        setTttGameMessage({ text: 'ন্যূনতম বেটের পরিমাণ ৫ টাকা হতে হবে!', type: 'error' });
        return;
      }
      if (userData.balance < betVal) {
        setTttGameMessage({ text: 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
        return;
      }

      // Deduct bet immediately
      try {
        const freshSnap = await get(ref(db, `users/${userId}`));
        const freshVal = freshSnap.exists() ? freshSnap.val() : null;
        const currentBal = freshVal ? (freshVal.balance || 0) : userData.balance;

        if (currentBal < betVal) {
          setTttGameMessage({ text: 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
          return;
        }

        const nextBal = currentBal - betVal;
        await update(ref(db, `users/${userId}`), { balance: nextBal });
        setTttActiveBet(betVal);
      } catch (err: any) {
        setTttGameMessage({ text: `সার্ভারে ত্রুটি: ${err.message}`, type: 'error' });
        return;
      }
    }

    // Initialize board
    setTttBoard(Array(9).fill(null));
    setIsPlayerX(true);
    setTttGameMode(mode);
    setTttGameState('playing');
    setTttStatusText('আপনার চাল দিন (X)');
    setTttGameMessage({ text: 'খেলা শুরু হয়েছে! আপনি X খেলছেন।', type: 'info' });
  };

  const handleTttCellClick = async (index: number) => {
    if (tttGameState !== 'playing' || !isPlayerX || tttBoard[index] !== null || isAiThinking) {
      return;
    }

    const newBoard = [...tttBoard];
    newBoard[index] = 'X';
    setTttBoard(newBoard);

    const winner = checkTttWinner(newBoard);
    if (winner === 'X') {
      await handleTttGameEnd('win', newBoard);
      return;
    } else if (winner === 'draw') {
      await handleTttGameEnd('draw', newBoard);
      return;
    }

    // AI's turn
    setIsAiThinking(true);
    setTttStatusText('কম্পিউটার ভাবছে...');

    setTimeout(async () => {
      const aiMoveIndex = findBestTttMove(newBoard);
      if (aiMoveIndex !== -1) {
        newBoard[aiMoveIndex] = 'O';
        setTttBoard(newBoard);
      }
      setIsAiThinking(false);

      const aiWinner = checkTttWinner(newBoard);
      if (aiWinner === 'O') {
        await handleTttGameEnd('loss', newBoard);
      } else if (aiWinner === 'draw') {
        await handleTttGameEnd('draw', newBoard);
      } else {
        setTttStatusText('আপনার চাল দিন (X)');
      }
    }, 600);
  };

  const handleTttGameEnd = async (result: 'win' | 'loss' | 'draw', boardState: (string | null)[]) => {
    setTttGameState('ended');
    setTttStatusText(result === 'win' ? 'বিজয় 🏆' : result === 'loss' ? 'পরাজয় ❌' : 'ম্যাচ ড্র 🤝');

    if (tttGameMode === 'free') {
      // Consume 1 daily limit
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
      const lastDate = userData?.lastGameDate || '';
      const currentCount = (lastDate === todayStr) ? (userData?.dailyGameCount || 0) : 0;

      try {
        await update(ref(db, `users/${userId}`), {
          lastGameDate: todayStr,
          dailyGameCount: currentCount + 1
        });

        if (result === 'win') {
          const reward = globalSettings.gameFreeReward || 1;
          const freshSnap = await get(ref(db, `users/${userId}`));
          const freshBal = freshSnap.exists() ? (freshSnap.val().balance || 0) : (userData?.balance || 0);

          await update(ref(db, `users/${userId}`), {
            balance: freshBal + reward
          });
          setTttGameMessage({ text: `🎉 অভিনন্দন! আপনি ফ্রী ম্যাচ জিতেছেন এবং ৳${reward} ক্লেইম করেছেন!`, type: 'success' });

          // Log real activity
          await logUserActivity(`টিক ট্যাক টো গেম খেলে ৳${reward} ক্লেইম করেছেন! 🎮`);
        } else if (result === 'loss') {
          setTttGameMessage({ text: '❌ আপনি হেরে গেছেন! চেষ্টা করুন যেন ড্র অন্তত করতে পারেন।', type: 'error' });
        } else {
          setTttGameMessage({ text: '🤝 খেলাটি ড্র হয়েছে! কোন পুরস্কার যোগ হয়নি।', type: 'info' });
        }
      } catch (err: any) {
        setTttGameMessage({ text: `লিমিট ব্যবহারে সমস্যা: ${err.message}`, type: 'error' });
      }
    } else {
      // Bet play mode
      const betVal = tttActiveBet;
      try {
        if (result === 'win') {
          const doubleReward = betVal * 2;
          const freshSnap = await get(ref(db, `users/${userId}`));
          const freshBal = freshSnap.exists() ? (freshSnap.val().balance || 0) : (userData?.balance || 0);

          await update(ref(db, `users/${userId}`), {
            balance: freshBal + doubleReward
          });
          setTttGameMessage({ text: `💥 চমত্কার! আপনি ম্যাচ জিতেছেন এবং ২ গুন বা ৳${doubleReward} প্রফিট ফেরত পেয়েছেন!`, type: 'success' });

          // Log real activity
          await logUserActivity(`টিক ট্যাক টো বাজি খেলায় ৳${doubleReward} জিতেছেন! 🎮`);
        } else if (result === 'loss') {
          setTttGameMessage({ text: `❌ আপনি ম্যাচটি হেরেছেন! আপনার বাজি ধরা ৳${betVal} কেটে নেওয়া হয়েছে।`, type: 'error' });
        } else {
          // Draw: refund the bet value
          const freshSnap = await get(ref(db, `users/${userId}`));
          const freshBal = freshSnap.exists() ? (freshSnap.val().balance || 0) : (userData?.balance || 0);
          const refundBal = Number((freshBal + betVal).toFixed(2));

          await update(ref(db, `users/${userId}`), {
            balance: refundBal
          });
          setTttGameMessage({ text: `🤝 ম্যাচ ড্র হয়েছে! আপনার বাজি ধরা ৳${betVal} ফেরত দেওয়া হয়েছে।`, type: 'info' });
        }
        setTttActiveBet(0);
      } catch (err: any) {
        setTttGameMessage({ text: `ব্যালেন্স কনফিগারেশনে সমস্যা: ${err.message}`, type: 'error' });
      }
    }
  };

  // Navigations
  const switchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidelineOpen(false);
    if (tab === 'profile' && userData) {
      setProfileName(userData.username || '');
      setProfileBirth(userData.birth || '');
      setProfileJob(userData.job || '');
      setProfileLocation(userData.location || '');
      setProfileSex(userData.sex || 'Male');
      setProfileSuccessMsg('');
      setProfileErrorMsg('');
    }
    if (tab === 'gmail-sell') updateSubmissionCount24h('gmail');
    else if (tab === 'telegram-sell') updateSubmissionCount24h('telegram');
    else if (tab === 'whatsapp-sell') updateSubmissionCount24h('whatsapp');
    else if (tab === 'facebook-sell') updateSubmissionCount24h('facebook');
    else if (tab === 'instagram-sell') updateSubmissionCount24h('instagram');
  };

  // Profile Update Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const cleanName = sanitizeInput(profileName.trim());
    const cleanBirth = sanitizeInput(profileBirth.trim());
    const cleanJob = sanitizeInput(profileJob.trim());
    const cleanLocation = sanitizeInput(profileLocation.trim());
    const cleanSex = sanitizeInput(profileSex.trim());

    if (!cleanName) {
      setProfileErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }

    if (
      isMaliciousInput(cleanName) ||
      isMaliciousInput(cleanBirth) ||
      isMaliciousInput(cleanJob) ||
      isMaliciousInput(cleanLocation) ||
      isMaliciousInput(cleanSex)
    ) {
      setProfileErrorMsg('⚠️ অননুমোদিত ক্যারেক্টার বা স্ক্রিপ্ট সনাক্ত হয়েছে!');
      logSecurityAlert(userId, userEmail, 'XSS Attempt on Profile Update Form', `Name: ${cleanName}`);
      return;
    }

    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        username: cleanName,
        birth: cleanBirth,
        job: cleanJob,
        location: cleanLocation,
        sex: cleanSex,
      });
      setProfileSuccessMsg('আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
    } catch (err: any) {
      setProfileErrorMsg(`আপডেট করতে সমস্যা হয়েছে: ${err.message}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Submit Trx Verification Request
  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = sanitizeInput(verificationNumber.trim());
    const cleanTrx = sanitizeInput(verificationTrx.trim().toUpperCase());

    if (isMaliciousInput(cleanNum) || isMaliciousInput(cleanTrx)) {
      setVerificationMessage({ text: '⚠️ অননুমোদিত ক্যারেক্টার বা স্ক্রিপ্ট সনাক্ত হয়েছে!', type: 'error' });
      logSecurityAlert(userId, userEmail, 'XSS Attempt on Activation Form', `Num: ${cleanNum}, Trx: ${cleanTrx}`);
      return;
    }

    if (!cleanTrx || !cleanNum) {
      setVerificationMessage({ text: 'বিকাশ/নগদ নম্বর এবং TrxID প্রদান করুন', type: 'error' });
      return;
    }

    setIsSubmittingVerification(true);
    setVerificationMessage({ text: '', type: '' });

    try {
      const activationRef = ref(db, 'activation_requests');
      const newRequestRef = push(activationRef);
      const requestPayload: ActivationRequest = {
        id: newRequestRef.key || Date.now().toString(),
        userId: userId,
        username: userData?.username || 'User',
        userEmail: userEmail,
        method: selectedVerifyMethod,
        number: cleanNum,
        trxId: cleanTrx,
        status: 'pending',
        timestamp: Date.now()
      };

      await set(newRequestRef, requestPayload);

      // Set user verificationStatus to pending
      await update(ref(db, `users/${userId}`), {
        verificationStatus: 'pending'
      });

      // Telegram activation alert automation
      const alertMsg = `💳 <b>নতুন একাউন্ট এক্টিভেশন আবেদন (New Account Activation)</b>\n\n👤 মেম্বার ইমেইল: <code>${userEmail}</code>\n💵 মেথড: <b>${selectedVerifyMethod.toUpperCase()}</b>\n🔢 প্রেরক নম্বর: <code>${verificationNumber}</code>\n🔑 ট্রানজেকশন আইডি (TrxID): <code>${verificationTrx.toUpperCase().trim()}</code>\n💰 এক্টিভেশন ফি: ৳<b>${globalSettings.activationPrice || 100}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে ভেরিফাই করতে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(alertMsg);

      setVerificationMessage({ text: 'আপনার ভেরিফিকেশন পাঠানো হয়েছে, অনুগ্রহ করে এডমিনের অনুমোদনের জন্য অপেক্ষা করুন! ✔', type: 'success' });
      setVerificationTrx('');
      setVerificationNumber('');
      triggerToast('অনুরোধ পাঠানো হয়েছে!', 'success');
      setTimeout(() => {
        setIsVerificationModalOpen(false);
        setVerificationMessage({ text: '', type: '' });
      }, 3000);
    } catch (err: any) {
      setVerificationMessage({ text: 'ব্যর্থ হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = sanitizeInput(depositNumber.trim());
    const cleanTrx = sanitizeInput(depositTrx.trim().toUpperCase());
    const amountVal = parseFloat(depositAmount.trim());

    if (isMaliciousInput(cleanNum) || isMaliciousInput(cleanTrx)) {
      setDepositMessage({ text: '⚠️ অননুমোদিত ক্যারেক্টার বা স্ক্রিপ্ট সনাক্ত হয়েছে!', type: 'error' });
      logSecurityAlert(userId, userEmail, 'XSS Attempt on Deposit Form', `Num: ${cleanNum}, Trx: ${cleanTrx}`);
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      setDepositMessage({ text: 'সঠিক ডিপোজিট পরিমাণ প্রদান করুন', type: 'error' });
      return;
    }

    if (!cleanNum || !cleanTrx) {
      setDepositMessage({ text: 'বিকাশ/নগদ নম্বর এবং TrxID প্রদান করুন', type: 'error' });
      return;
    }

    setIsSubmittingDeposit(true);
    setDepositMessage({ text: '', type: '' });

    const feePercent = globalSettings.depositFeePercent || 0;
    const feeAmount = parseFloat(((amountVal * feePercent) / 100).toFixed(2));
    const netAmount = parseFloat((amountVal - feeAmount).toFixed(2));

    try {
      const depositRef = ref(db, 'deposit_requests');
      const newRequestRef = push(depositRef);
      const requestPayload = {
        id: newRequestRef.key || Date.now().toString(),
        userId: userId,
        username: userData?.username || 'User',
        userEmail: userEmail,
        method: selectedDepositMethod,
        number: cleanNum,
        amount: amountVal,
        feePercent: feePercent,
        feeAmount: feeAmount,
        netAmount: netAmount,
        trxId: cleanTrx,
        status: 'pending',
        timestamp: Date.now()
      };

      await set(newRequestRef, requestPayload);

      // Log real activity
      await logUserActivity(`৳${amountVal} ডিপোজিটের অনুরোধ করেছেন। 💰`);

      // Telegram alert
      const alertMsg = `💰 <b>নতুন ডিপোজিট আবেদন (New Deposit Request)</b>\n\n👤 মেম্বার ইমেইল: <code>${userEmail}</code>\n💵 মেথড: <b>${selectedDepositMethod.toUpperCase()}</b>\n🔢 প্রেরক নম্বর: <code>${depositNumber}</code>\n🔑 ট্রানজেকশন আইডি (TrxID): <code>${depositTrx.toUpperCase().trim()}</code>\n💰 ডিপোজিট পরিমাণ: ৳<b>${amountVal.toFixed(1)}</b>\n💸 ডিপোজিট ফি (${feePercent}%): ৳<b>${feeAmount.toFixed(1)}</b>\n💎 মেম্বার পাবে (নিট): ৳<b>${netAmount.toFixed(1)}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে ভেরিফাই করতে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(alertMsg);

      setDepositMessage({ text: 'আপনার ডিপোজিট অনুরোধ পাঠানো হয়েছে, অনুগ্রহ করে এডমিনের অনুমোদনের জন্য অপেক্ষা করুন! ✔', type: 'success' });
      setDepositTrx('');
      setDepositNumber('');
      setDepositAmount('');
      triggerToast('ডিপোজিট অনুরোধ পাঠানো হয়েছে!', 'success');
      setTimeout(() => {
        switchTab('home');
        setDepositMessage({ text: '', type: '' });
      }, 3000);
    } catch (err: any) {
      setDepositMessage({ text: 'ব্যর্থ হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const isDeadlinePassed = (deadlineStr?: string) => {
    if (!deadlineStr) return false;
    const deadlineTime = new Date(deadlineStr).getTime();
    if (isNaN(deadlineTime)) return false;
    return Date.now() > deadlineTime;
  };

  const formatDeadline = (deadlineStr?: string) => {
    if (!deadlineStr) return '';
    const date = new Date(deadlineStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka'
    });
  };

  // Reusable Countdown Clock for Account Submission Deadlines
  const DeadlineCountdown = ({ deadlineStr }: { deadlineStr?: string }) => {
    const [timeLeft, setTimeLeft] = useState<{
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      isPassed: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });

    useEffect(() => {
      if (!deadlineStr) return;

      const calculateTimeLeft = () => {
        const deadlineTime = new Date(deadlineStr).getTime();
        const now = Date.now();
        const difference = deadlineTime - now;

        if (isNaN(deadlineTime) || difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }, [deadlineStr]);

    if (!deadlineStr) return null;
    if (timeLeft.isPassed) {
      return (
        <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-black select-none mt-1 animate-pulse">
          🚫 সময় শেষ হয়ে গেছে!আর সাবমিট করা যাবে না।
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-xl font-sans mt-2 shadow-xs">
        <span>⏰ আর বাকি আছে:</span>
        <span className="font-extrabold font-mono bg-sky-600 text-white px-2 py-0.5 rounded-lg text-sm tracking-wide">
          {timeLeft.days} দিন {timeLeft.hours} ঘণ্টা {timeLeft.minutes} মিনিট {timeLeft.seconds} সেকেন্ড
        </span>
      </div>
    );
  };

  // Social account sells history dynamic fetcher
  const handleFetchHistory = async (platform: string) => {
    setIsLoadingHistory(true);
    setSelectedHistoryPlatform(platform);
    try {
      if (platform === 'withdraw') {
        const historyRef = ref(db, 'withdrawals');
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data).filter((item: any) => item && item.userId === userId);
          list.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
          setHistoryList(list);
        } else {
          setHistoryList([]);
        }
        return;
      }
      if (platform === 'deposit') {
        const historyRef = ref(db, 'deposit_requests');
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data).filter((item: any) => item && item.userId === userId);
          list.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
          setHistoryList(list);
        } else {
          setHistoryList([]);
        }
        return;
      }
      const dbPath = `${platform}_sells`; // e.g. gmail_sells
      const activeSnapshot = await get(ref(db, dbPath));
      const archivedSnapshot = await get(ref(db, `all_sold_accounts_history/${userId}`));
      
      const merged: Record<string, any> = {};

      if (activeSnapshot.exists()) {
        const data = activeSnapshot.val();
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (val && val.userId === userId) {
            merged[key] = {
              ...val,
              platform,
              status: val.status || 'pending'
            };
          }
        });
      }

      if (archivedSnapshot.exists()) {
        const data = archivedSnapshot.val();
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (val && (val.platform || 'gmail').toLowerCase() === platform.toLowerCase()) {
            merged[key] = {
              ...val,
              platform: val.platform || platform,
              status: val.status || 'pending'
            };
          }
        });
      }

      const list = Object.values(merged);
      list.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      setHistoryList(list);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const [submittedCount24h, setSubmittedCount24h] = useState(0);

  const updateSubmissionCount24h = async (platform: string) => {
    try {
      const dbPath = `${platform}_sells`;
      const snapshot = await get(ref(db, dbPath));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userSubmissions = Object.values(data).filter((item: any) => item && item.userId === userId);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const count = userSubmissions.filter((item: any) => item && (item.timestamp || 0) >= oneDayAgo).length;
        setSubmittedCount24h(count);
      } else {
        setSubmittedCount24h(0);
      }
    } catch (err) {
      console.error("Error updating 24h count:", err);
      setSubmittedCount24h(0);
    }
  };

  // Submit Gmail Sell Request
  const handleGmailSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isDeadlinePassed(globalSettings.gmailLastDate)) {
      setGmailMessage({ text: `⚠️ দুঃখিত, জিমেইল সাবমিট করার শেষ সময় (${formatDeadline(globalSettings.gmailLastDate)}) অতিবাহিত হয়ে গেছে!`, type: 'error' });
      triggerToast('সাবমিটের সময় শেষ হয়ে গেছে!', 'error');
      return;
    }
    const cleanEmail = sanitizeInput(gmailEmail.trim());
    const cleanPass = sanitizeInput(gmailPassword.trim());

    if (isMaliciousInput(cleanEmail) || isMaliciousInput(cleanPass)) {
      setGmailMessage({ text: '⚠️ অননুমোদিত ক্যারেক্টার বা ক্ষতিকারক কোনো স্ক্রিপ্ট সনাক্ত হয়েছে!', type: 'error' });
      logSecurityAlert(userId, userEmail, 'XSS Attempt on Gmail Sale Form', `Email: ${cleanEmail}`);
      return;
    }

    if (!cleanEmail || !cleanPass) {
      setGmailMessage({ text: 'সব بক্সে সঠিক তথ্য দিন', type: 'error' });
      return;
    }

    setIsSubmittingGmail(true);
    setGmailMessage({ text: '', type: '' });

    try {
      const limit = globalSettings.gmailDailyLimit ?? 0;
      if (limit > 0) {
        const snapshot = await get(ref(db, 'gmail_sells'));
        let count = 0;
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userSubmissions = Object.values(data).filter((item: any) => item && item.userId === userId);
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          count = userSubmissions.filter((item: any) => item && (item.timestamp || 0) >= oneDayAgo).length;
        }
        if (count >= limit) {
          setGmailMessage({ text: `⚠️ দুঃখিত! আপনার দৈনিক লিমিট (${limit} টি) শেষ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।`, type: 'error' });
          triggerToast('দৈনিক সাবমিট লিমিট শেষ!', 'error');
          setIsSubmittingGmail(false);
          return;
        }
      }

      const salesRef = ref(db, 'gmail_sells');
      const newSaleRef = push(salesRef);
      await set(newSaleRef, {
        id: newSaleRef.key,
        userId: userId,
        username: userData?.username || 'Unknown User',
        email: cleanEmail,
        password: cleanPass,
        status: 'pending',
        timestamp: Date.now()
      });

      // Log real activity
      await logUserActivity(`একটি জিমেইল আইডি বিক্রির জন্য সাবমিট করেছেন! 📧`);

      // Telegram alert
      const tgGmailMessage = `📧 <b>নতুন জিমেইল বিক্রির আবেদন (New Gmail Sale)</b>\n\n👤 বিক্রেতা: <code>${userData?.username || 'Unknown User'}</code> (${userEmail})\n🔑 ইমেইল: <code>${cleanEmail}</code>\n🔒 পাসওয়ার্ড: <code>${cleanPass}</code>\n💰 সম্ভাব্য মূল্য: ৳<b>${globalSettings.gmailPrice || 15}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে এডমিন প্যানেল থেকে ওটিপি চেক করে ভেরিফাই করুন।`;
      sendAdminTelegramNotification(tgGmailMessage);

      setGmailMessage({ text: 'জিমেইল সফলভাবে বিক্রির জন্য পাঠানো হয়েছে! এডমিনের ভেরিফিকেশনের পর ব্যালেন্স এড হবে।', type: 'success' });
      setGmailEmail('');
      setGmailPassword('');
      triggerToast('জিমেইল জমা হয়েছে!', 'success');
    } catch (err: any) {
      setGmailMessage({ text: 'সমস্যা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingGmail(false);
    }
  };

  // Submit Telegram Sell Request
  const handleTelegramSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isDeadlinePassed(globalSettings.telegramLastDate)) {
      setTelegramMessage({ text: `⚠️ দুঃখিত, টেলিগ্রাম সাবমিট করার শেষ সময় (${formatDeadline(globalSettings.telegramLastDate)}) অতিবাহিত হয়ে গেছে!`, type: 'error' });
      triggerToast('সাবমিটের সময় শেষ হয়ে গেছে!', 'error');
      return;
    }
    if (!telegramNumber.trim()) {
      setTelegramMessage({ text: 'টেলিগ্রাম নাম্বারটি দিন।', type: 'error' });
      return;
    }

    setIsSubmittingTelegram(true);
    setTelegramMessage({ text: '', type: '' });

    try {
      const limit = globalSettings.telegramDailyLimit ?? 0;
      if (limit > 0) {
        const snapshot = await get(ref(db, 'telegram_sells'));
        let count = 0;
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userSubmissions = Object.values(data).filter((item: any) => item && item.userId === userId);
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          count = userSubmissions.filter((item: any) => item && (item.timestamp || 0) >= oneDayAgo).length;
        }
        if (count >= limit) {
          setTelegramMessage({ text: `⚠️ দুঃখিত! আপনার দৈনিক লিমিট (${limit} টি) শেষ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।`, type: 'error' });
          triggerToast('দৈনিক সাবমিট লিমিট শেষ!', 'error');
          setIsSubmittingTelegram(false);
          return;
        }
      }

      const salesRef = ref(db, 'telegram_sells');
      const newSaleRef = push(salesRef);
      await set(newSaleRef, {
        id: newSaleRef.key,
        userId: userId,
        username: userData?.username || 'Unknown User',
        number: telegramNumber.trim(),
        details: telegramDetails.trim(),
        status: 'pending',
        timestamp: Date.now()
      });

      // Log real activity
      await logUserActivity(`একটি টেলিগ্রাম একাউন্ট বিক্রির জন্য সাবমিট করেছেন! 🤖`);

      // Telegram alert
      const tgTelegramMessage = `🤖 <b>নতুন টেলিগ্রাম বিক্রির আবেদন (New Telegram Sale)</b>\n\n👤 বিক্রেতা: <code>${userData?.username || 'Unknown User'}</code> (${userEmail})\n🔢 নাম্বার: <code>${telegramNumber.trim()}</code>\n📝 বিবরণ: <i>${telegramDetails.trim() || 'নেই'}</i>\n💰 সম্ভাব্য মূল্য: ৳<b>${globalSettings.telegramPrice || 20}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(tgTelegramMessage);

      setTelegramMessage({ text: 'টেলিগ্রাম নাম্বার সফলভাবে বিক্রির জন্য পাঠানো হয়েছে! এডমিনের ভেরিফিকেশনের পর ব্যালেন্স এড হবে।', type: 'success' });
      setTelegramNumber('');
      setTelegramDetails('');
      triggerToast('টেলিগ্রাম নাম্বার জমা হয়েছে!', 'success');
    } catch (err: any) {
      setTelegramMessage({ text: 'সমস্যা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingTelegram(false);
    }
  };

  // Submit WhatsApp Sell Request
  const handleWhatsappSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isDeadlinePassed(globalSettings.whatsappLastDate)) {
      setWhatsappMessage({ text: `⚠️ দুঃখিত, হোয়াটসঅ্যাপ সাবমিট করার শেষ সময় (${formatDeadline(globalSettings.whatsappLastDate)}) অতিবাহিত হয়ে গেছে!`, type: 'error' });
      triggerToast('সাবমিটের সময় শেষ হয়ে গেছে!', 'error');
      return;
    }
    if (!whatsappNumber.trim()) {
      setWhatsappMessage({ text: 'হোয়াটসঅ্যাপ নাম্বারটি দিন।', type: 'error' });
      return;
    }

    setIsSubmittingWhatsapp(true);
    setWhatsappMessage({ text: '', type: '' });

    try {
      const limit = globalSettings.whatsappDailyLimit ?? 0;
      if (limit > 0) {
        const snapshot = await get(ref(db, 'whatsapp_sells'));
        let count = 0;
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userSubmissions = Object.values(data).filter((item: any) => item && item.userId === userId);
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          count = userSubmissions.filter((item: any) => item && (item.timestamp || 0) >= oneDayAgo).length;
        }
        if (count >= limit) {
          setWhatsappMessage({ text: `⚠️ দুঃখিত! আপনার দৈনিক লিমিট (${limit} টি) শেষ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।`, type: 'error' });
          triggerToast('দৈনিক সাবমিট লিমিট শেষ!', 'error');
          setIsSubmittingWhatsapp(false);
          return;
        }
      }

      const salesRef = ref(db, 'whatsapp_sells');
      const newSaleRef = push(salesRef);
      await set(newSaleRef, {
        id: newSaleRef.key,
        userId: userId,
        username: userData?.username || 'Unknown User',
        number: whatsappNumber.trim(),
        details: whatsappDetails.trim(),
        status: 'pending',
        timestamp: Date.now()
      });

      // Log real activity
      await logUserActivity(`একটি হোয়াটসঅ্যাপ একাউন্ট বিক্রির জন্য সাবমিট করেছেন! 💬`);

      // Telegram alert
      const tgWhatsappMessage = `💬 <b>নতুন হোয়াটসঅ্যাপ বিক্রির আবেদন (New WhatsApp Sale)</b>\n\n👤 বিক্রেতা: <code>${userData?.username || 'Unknown User'}</code> (${userEmail})\n🔢 নাম্বার: <code>${whatsappNumber.trim()}</code>\n📝 বিবরণ: <i>${whatsappDetails.trim() || 'নেই'}</i>\n💰 সম্ভাব্য মূল্য: ৳<b>${globalSettings.whatsappPrice || 30}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(tgWhatsappMessage);

      setWhatsappMessage({ text: 'হোয়াটসঅ্যাপ নাম্বার সফলভাবে বিক্রির জন্য পাঠানো হয়েছে! এডমিনের ভেরিফিকেশনের পর ব্যালেন্স এড হবে।', type: 'success' });
      setWhatsappNumber('');
      setWhatsappDetails('');
      triggerToast('হোয়াটসঅ্যাপ নাম্বার জমা হয়েছে!', 'success');
    } catch (err: any) {
      setWhatsappMessage({ text: 'সমস্যা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingWhatsapp(false);
    }
  };

  // Submit Facebook Sell Request
  const handleFacebookSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isDeadlinePassed(globalSettings.facebookLastDate)) {
      setFacebookMessage({ text: `⚠️ দুঃখিত, ফেসবুক সাবমিট করার শেষ সময় (${formatDeadline(globalSettings.facebookLastDate)}) অতিবাহিত হয়ে গেছে!`, type: 'error' });
      triggerToast('সাবমিটের সময় শেষ হয়ে গেছে!', 'error');
      return;
    }
    if (!facebookEmail.trim() || !facebookPassword.trim()) {
      setFacebookMessage({ text: 'লগইন ইমেইল/ফোন এবং পাসওয়ার্ড দিন।', type: 'error' });
      return;
    }

    setIsSubmittingFacebook(true);
    setFacebookMessage({ text: '', type: '' });

    try {
      const limit = globalSettings.facebookDailyLimit ?? 0;
      if (limit > 0) {
        const snapshot = await get(ref(db, 'facebook_sells'));
        let count = 0;
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userSubmissions = Object.values(data).filter((item: any) => item && item.userId === userId);
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          count = userSubmissions.filter((item: any) => item && (item.timestamp || 0) >= oneDayAgo).length;
        }
        if (count >= limit) {
          setFacebookMessage({ text: `⚠️ দুঃখিত! আপনার দৈনিক লিমিট (${limit} টি) শেষ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।`, type: 'error' });
          triggerToast('দৈনিক সাবমিট লিমিট শেষ!', 'error');
          setIsSubmittingFacebook(false);
          return;
        }
      }

      const salesRef = ref(db, 'facebook_sells');
      const newSaleRef = push(salesRef);
      await set(newSaleRef, {
        id: newSaleRef.key,
        userId: userId,
        username: userData?.username || 'Unknown User',
        email: facebookEmail.trim(),
        password: facebookPassword.trim(),
        twoFactor: facebook2FA.trim(),
        status: 'pending',
        timestamp: Date.now()
      });

      // Log real activity
      await logUserActivity(`একটি ফেসবুক আইডি বিক্রির জন্য সাবমিট করেছেন! 📧`);

      // Telegram alert
      const tgFacebookMessage = `👥 <b>নতুন ফেসবুক বিক্রির আবেদন (New Facebook Sale)</b>\n\n👤 বিক্রেতা: <code>${userData?.username || 'Unknown User'}</code> (${userEmail})\n📧 ইমেইল/ফোন: <code>${facebookEmail.trim()}</code>\n🔒 পাসওয়ার্ড: <code>${facebookPassword.trim()}</code>\n🔐 2FA কোড/কী: <code>${facebook2FA.trim() || 'নেই'}</code>\n💰 সম্ভাব্য মূল্য: ৳<b>${globalSettings.facebookPrice || 25}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(tgFacebookMessage);

      setFacebookMessage({ text: 'ফেসবুক আইডি সফলভাবে বিক্রির জন্য পাঠানো হয়েছে! এডমিনের ভেরিফিকেশনের পর ব্যালেন্স এড হবে।', type: 'success' });
      setFacebookEmail('');
      setFacebookPassword('');
      setFacebook2FA('');
      triggerToast('ফেসবুক আইডি জমা হয়েছে!', 'success');
    } catch (err: any) {
      setFacebookMessage({ text: 'সমস্যা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingFacebook(false);
    }
  };

  // Submit Instagram Sell Request
  const handleInstagramSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isDeadlinePassed(globalSettings.instagramLastDate)) {
      setInstagramMessage({ text: `⚠️ দুঃখিত, ইন্সটাগ্রাম সাবমিট করার শেষ সময় (${formatDeadline(globalSettings.instagramLastDate)}) অতিবাহিত হয়ে গেছে!`, type: 'error' });
      triggerToast('সাবমিটের সময় শেষ হয়ে গেছে!', 'error');
      return;
    }
    if (!instagramUsername.trim() || !instagramPassword.trim()) {
      setInstagramMessage({ text: 'ইউজারনেম/ইমেইল এবং পাসওয়ার্ড দিন।', type: 'error' });
      return;
    }

    setIsSubmittingInstagram(true);
    setInstagramMessage({ text: '', type: '' });

    try {
      const limit = globalSettings.instagramDailyLimit ?? 0;
      if (limit > 0) {
        const snapshot = await get(ref(db, 'instagram_sells'));
        let count = 0;
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userSubmissions = Object.values(data).filter((item: any) => item && item.userId === userId);
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          count = userSubmissions.filter((item: any) => item && (item.timestamp || 0) >= oneDayAgo).length;
        }
        if (count >= limit) {
          setInstagramMessage({ text: `⚠️ দুঃখিত! আপনার দৈনিক লিমিট (${limit} টি) শেষ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।`, type: 'error' });
          triggerToast('দৈনিক সাবমিট লিমিট শেষ!', 'error');
          setIsSubmittingInstagram(false);
          return;
        }
      }

      const salesRef = ref(db, 'instagram_sells');
      const newSaleRef = push(salesRef);
      await set(newSaleRef, {
        id: newSaleRef.key,
        userId: userId,
        username: userData?.username || 'Unknown User',
        email: instagramUsername.trim(),
        password: instagramPassword.trim(),
        twoFactor: instagram2FA.trim(),
        status: 'pending',
        timestamp: Date.now()
      });

      // Log real activity
      await logUserActivity(`একটি ইন্সটাগ্রাম আইডি বিক্রির জন্য সাবমিট করেছেন! 📸`);

      // Telegram alert
      const tgInstagramMessage = `📸 <b>নতুন ইন্সটাগ্রাম বিক্রির আবেদন (New Instagram Sale)</b>\n\n👤 বিক্রেতা: <code>${userData?.username || 'Unknown User'}</code> (${userEmail})\n📧 ইউজারনেম/ইমেইল: <code>${instagramUsername.trim()}</code>\n🔒 পাসওয়ার্ড: <code>${instagramPassword.trim()}</code>\n🔐 2FA কোড/কী: <code>${instagram2FA.trim() || 'নেই'}</code>\n💰 সম্ভাব্য মূল্য: ৳<b>${globalSettings.instagramPrice || 20}</b>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(tgInstagramMessage);

      setInstagramMessage({ text: 'ইন্সটাগ্রাম আইডি সফলভাবে বিক্রির জন্য পাঠানো হয়েছে! এডমিনের ভেরিফিকেশনের পর ব্যালেন্স এড হবে।', type: 'success' });
      setInstagramUsername('');
      setInstagramPassword('');
      setInstagram2FA('');
      triggerToast('ইন্সটাগ্রাম আইডি জমা হয়েছে!', 'success');
    } catch (err: any) {
      setInstagramMessage({ text: 'সমস্যা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingInstagram(false);
    }
  };

  // Handle Balance Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    const target = transferTargetId.trim();
    const amt = parseFloat(transferAmount);

    if (!target) {
      setTransferMessage({ text: 'টাকার আইডি (Receiver ID) লিখুন', type: 'error' });
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setTransferMessage({ text: 'সঠিক টাকার পরিমাণ দিন', type: 'error' });
      return;
    }
    if (target === userId) {
      setTransferMessage({ text: 'আপনি নিজেকে টাকা পাঠাতে পারবেন না!', type: 'error' });
      return;
    }
    if ((userData?.balance || 0) < amt) {
      setTransferMessage({ text: 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', type: 'error' });
      return;
    }

    setIsSubmittingTransfer(true);
    setTransferMessage({ text: '', type: '' });

    try {
      // Find receiver
      const receiverRef = ref(db, `users/${target}`);
      const receiverSnapshot = await get(receiverRef);

      if (!receiverSnapshot.exists()) {
        setTransferMessage({ text: 'এই আইডি দিয়ে কোনো ইউজার পাওয়া যায়নি!', type: 'error' });
        setIsSubmittingTransfer(false);
        return;
      }

      const receiverData = receiverSnapshot.val();

      // Atomically update
      await update(ref(db, `users/${userId}`), {
        balance: (userData?.balance || 0) - amt
      });

      await update(ref(db, `users/${target}`), {
        balance: (receiverData.balance || 0) + amt
      });

      // Record transaction
      const txRef = ref(db, 'transactions');
      await set(push(txRef), {
        from: userId,
        fromEmail: userEmail,
        to: target,
        toName: receiverData.username || 'Recipient',
        amount: amt,
        timestamp: Date.now()
      });

      setTransferMessage({ text: `সফলভাবে ৳${amt} পাঠানো হয়েছে!`, type: 'success' });
      setTransferAmount('');
      setTransferTargetId('');
      triggerToast('ট্রান্সফার সম্পন্ন!', 'success');
    } catch (err: any) {
      setTransferMessage({ text: 'সমস্যা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Withdraw requests
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    const num = withdrawNumber.trim();
    const amt = parseFloat(withdrawAmount);

    let minLimit = globalSettings.minWithdraw || 50;
    let availableBalance = userData?.balance || 0;
    let balanceField = 'balance';

    if (withdrawBalanceType === 'gmail') {
      minLimit = globalSettings.minWithdrawGmail || globalSettings.minWithdraw || 50;
      availableBalance = userData?.gmailBalance || 0;
      balanceField = 'gmailBalance';
    } else if (withdrawBalanceType === 'telegram') {
      minLimit = globalSettings.minWithdrawTelegram || globalSettings.minWithdraw || 50;
      availableBalance = userData?.telegramBalance || 0;
      balanceField = 'telegramBalance';
    } else if (withdrawBalanceType === 'whatsapp') {
      minLimit = globalSettings.minWithdrawWhatsapp || globalSettings.minWithdraw || 50;
      availableBalance = userData?.whatsappBalance || 0;
      balanceField = 'whatsappBalance';
    } else if (withdrawBalanceType === 'facebook') {
      minLimit = globalSettings.minWithdrawFacebook || globalSettings.minWithdraw || 50;
      availableBalance = userData?.facebookBalance || 0;
      balanceField = 'facebookBalance';
    } else if (withdrawBalanceType === 'instagram') {
      minLimit = globalSettings.minWithdrawInstagram || globalSettings.minWithdraw || 50;
      availableBalance = userData?.instagramBalance || 0;
      balanceField = 'instagramBalance';
    } else if (withdrawBalanceType === 'ads') {
      minLimit = globalSettings.minWithdrawAds || globalSettings.minWithdraw || 50;
      availableBalance = userData?.adsBalance || 0;
      balanceField = 'adsBalance';
    }

    if (!num) {
      setWithdrawMessage({ text: 'মোবাইল নম্বর দিন', type: 'error' });
      return;
    }
    if (isNaN(amt) || amt < minLimit) {
      setWithdrawMessage({ text: `সর্বনিম্ন ৳${minLimit} উইথড্র করতে হবে`, type: 'error' });
      return;
    }
    if (availableBalance < amt) {
      setWithdrawMessage({ text: 'আপনার অপর্যাপ্ত ব্যালেন্স!', type: 'error' });
      return;
    }

    setIsSubmittingWithdraw(true);
    setWithdrawMessage({ text: '', type: '' });

    try {
      // Create request in `/withdrawals`
      const withdrawListRef = ref(db, 'withdrawals');
      const newWithdrawRef = push(withdrawListRef);

      const feePercent = globalSettings.withdrawFeePercent || 0;
      const feeAmount = parseFloat(((amt * feePercent) / 100).toFixed(2));
      const netAmount = parseFloat((amt - feeAmount).toFixed(2));

      await set(newWithdrawRef, {
        id: newWithdrawRef.key,
        userId: userId,
        email: userEmail,
        method: withdrawMethod,
        number: num,
        amount: amt,
        feePercent: feePercent,
        feeAmount: feeAmount,
        netAmount: netAmount,
        status: 'pending',
        timestamp: Date.now(),
        balanceType: withdrawBalanceType
      });

      // Log real activity
      const bnMethod = withdrawMethod === 'Bkash' ? 'bKash' : 'Nagad';
      await logUserActivity(`সফলভাবে ৳${amt} ${bnMethod}-এ উইথড্র রিকোয়েস্ট করেছেন। 💸`);

      // Deduct balance
      await update(ref(db, `users/${userId}`), {
        [balanceField]: availableBalance - amt
      });

      // Telegram withdrawal alert automation
      const messageText = `🔔 <b>নতুন উইথড্র আবেদন (New Withdrawal Request)</b>\n\n👤 মেম্বার ইমেইল: <code>${userEmail}</code>\n💵 উত্তোলন পদ্ধতি: <b>${withdrawMethod}</b>\n🔢 নাম্বার: <code>${num}</code>\n💰 পরিমাণ: ৳<b>${amt.toFixed(2)}</b>\n🌐 ব্যালেন্সের ধরন: <i>${withdrawBalanceType}</i>\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 ভেরিফাই করতে এডমিন প্যানেল চেক করুন।`;
      sendAdminTelegramNotification(messageText);

      setWithdrawMessage({ text: 'উইথড্র রিকোয়েস্ট সফল হয়েছে! অনুগ্রহ করে ২৪ ঘন্টা অপেক্ষা করুন।', type: 'success' });
      setWithdrawNumber('');
      setWithdrawAmount('');
      triggerToast('রিকোয়েস্ট জমা হয়েছে!', 'success');
    } catch (err: any) {
      setWithdrawMessage({ text: 'ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Job Posting Handle Files
  const handlePostJobFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPostJobFiles(e.target.files);
      const filePreviews: string[] = [];
      Array.from(e.target.files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          filePreviews.push(reader.result as string);
          if (filePreviews.length === e.target.files?.length) {
            setPostJobPreview(filePreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Post Micro-job
  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    const reward = parseFloat(postJobReward);
    const budget = parseFloat(postJobBudget);
    const maxProof = postJobMaxProof;

    if (!postJobTitle.trim()) {
      setPostJobMessage({ text: 'জবের শিরোনাম দিন', type: 'error' });
      return;
    }
    if (!postJobLink.trim()) {
      setPostJobMessage({ text: 'কাজের লিংক দিন', type: 'error' });
      return;
    }
    if (!postJobDesc.trim()) {
      setPostJobMessage({ text: 'কাজের বিবরণ দিন', type: 'error' });
      return;
    }
    if (isNaN(reward) || reward <= 0) {
      setPostJobMessage({ text: 'প্রতি কাজের সঠিক বাজেট দিন', type: 'error' });
      return;
    }
    if (isNaN(budget) || budget <= 0) {
      setPostJobMessage({ text: 'মোট জবের বাজেট দিন', type: 'error' });
      return;
    }
    if (budget < reward) {
      setPostJobMessage({ text: 'মোট বাজেট অবশ্যই একক কাজের রিওয়ার্ড থেকে বেশি হবে', type: 'error' });
      return;
    }
    const adminFee = parseFloat(globalSettings.postJobAdminFee as any || '0');
    const totalCost = budget + adminFee;
    if ((userData?.balance || 0) < totalCost) {
      setPostJobMessage({ 
        text: `আপনার অপর্যাপ্ত ব্যালেন্স! জব পোস্ট করতে আপনার মোট বাজেট ৳${budget.toFixed(2)} এবং এডমিন ফি ৳${adminFee.toFixed(2)} (মোট: ৳${totalCost.toFixed(2)}) প্রয়োজন। আপনার বর্তমান ব্যালেন্স ৳${(userData?.balance || 0).toFixed(2)}।`, 
        type: 'error' 
      });
      return;
    }
    if (!postJobFiles || postJobFiles.length === 0) {
      setPostJobMessage({ text: 'দয়া করে কমপক্ষে ১টি উদাহরণের ছবি আপলোড করুন', type: 'error' });
      return;
    }

    setIsPostingJob(true);
    setPostJobMessage({ text: 'ছবি আপলোড ও কাজ প্রসেসিং হচ্ছে...', type: 'warning' });

    try {
      const uploadedImageUrls: string[] = [];
      for (let i = 0; i < postJobFiles.length; i++) {
        const url = await uploadToImgBB(postJobFiles[i]);
        uploadedImageUrls.push(url);
      }

      const jobsRef = ref(db, 'jobs');
      const newJobRef = push(jobsRef);
      const totalSlots = Math.floor(budget / reward);

      await set(newJobRef, {
        title: postJobTitle.trim(),
        link: postJobLink.trim(),
        description: postJobDesc.trim(),
        imageUrl: uploadedImageUrls[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500',
        exampleImages: uploadedImageUrls,
        totalBudget: budget,
        adminFee: adminFee,
        perTaskReward: reward,
        maxProofImages: maxProof,
        showLink: postShowLink,
        totalSlots: totalSlots,
        remainingSlots: totalSlots,
        posterId: userId,
        expiryDate: postJobExpiry || '',
        timestamp: Date.now()
      });

      // Deduct budget + admin fee
      await update(ref(db, `users/${userId}`), {
        balance: (userData?.balance || 0) - totalCost
      });

      setPostJobMessage({ text: 'ক্যাম্পেইন সফলভাবে পোস্ট করা হয়েছে!', type: 'success' });
      triggerToast('জব পোস্ট হয়েছে!', 'success');

      // Clear Form
      setPostJobTitle('');
      setPostJobLink('');
      setPostJobDesc('');
      setPostJobReward('0.50');
      setPostJobMaxProof(1);
      setPostJobBudget('');
      setPostJobFiles(null);
      setPostJobPreview([]);

      setTimeout(() => {
        switchTab('all-jobs');
        setPostJobMessage({ text: '', type: '' });
      }, 2000);
    } catch (err: any) {
      setPostJobMessage({ text: 'ব্যর্থ: ' + err.message, type: 'error' });
    } finally {
      setIsPostingJob(false);
    }
  };

  // Job work submissions
  const handleWorkerProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSubmitProofFiles(e.target.files);
      const previews: string[] = [];
      Array.from(e.target.files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === e.target.files?.length) {
            setSubmitProofsPreview(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleJobSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (!selectedJob) return;

    const requiredProofs = selectedJob.maxProofImages || 1;
    if (!submitProofFiles || submitProofFiles.length !== requiredProofs) {
      setSubmitJobWorkMessage({ text: `আপনাকে অবশ্যই ঠিক ${requiredProofs} টি ছবি প্রমাণ হিসেবে আপলোড করতে হবে`, type: 'error' });
      return;
    }
    if (!submitFeedback.trim()) {
      setSubmitJobWorkMessage({ text: 'দয়া করে কাজের বিবরণ বা ফিডব্যাক দিন', type: 'error' });
      return;
    }

    setIsSubmittingJobWork(true);
    setSubmitJobWorkMessage({ text: 'প্রমাণ ছবি সার্ভারে আপলোড হচ্ছে...', type: 'warning' });

    try {
      // 1. Check if slots are still open
      const freshJobSnapshot = await get(ref(db, `jobs/${selectedJob.id}`));
      const freshJobData = freshJobSnapshot.val();

      if (!freshJobData || freshJobData.remainingSlots <= 0) {
        setSubmitJobWorkMessage({ text: 'দুঃখিত! এই ক্যাম্পেইনের স্লট পূর্ণ হয়ে গিয়েছে!', type: 'error' });
        setIsSubmittingJobWork(false);
        return;
      }

      // 2. Upload proof screenshots
      const uploadedProofUrls: string[] = [];
      for (let i = 0; i < submitProofFiles.length; i++) {
        const url = await uploadToImgBB(submitProofFiles[i]);
        uploadedProofUrls.push(url);
      }

      // 3. Save submission `/job_submissions`
      const submissionsRef = ref(db, 'job_submissions');
      const newSubmissionRef = push(submissionsRef);
      await set(newSubmissionRef, {
        id: newSubmissionRef.key,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        jobImageUrl: selectedJob.imageUrl,
        jobRewardAmount: selectedJob.perTaskReward,
        jobMaxProof: selectedJob.maxProofImages,
        workerId: userId,
        workerName: userData?.username || 'Worker',
        proofImages: uploadedProofUrls,
        feedback: submitFeedback.trim(),
        status: 'pending',
        timestamp: Date.now()
      });

      // Log real activity
      await logUserActivity(`একটি মাইক্রো জব সম্পন্ন করে প্রমাণপত্র জমা দিয়েছেন! 📋`);

      // Telegram alert
      const tgJobMsg = `📋 <b>নতুন কাজ জমা (New Campaign Proof Submission)</b>\n\n📌 ক্যাম্পেইন: <b>${selectedJob.title}</b>\n👤 কর্মী: <code>${userData?.username || 'Worker'}</code> (${userEmail})\n📝 বিবরণ/ফিডব্যাক: <i>${submitFeedback.trim()}</i>\n💰 সম্ভাব্য আয়: ৳<b>${(selectedJob.perTaskReward || 0).toFixed(2)}</b>\n🖼️ প্রুফ ছবি: ${uploadedProofUrls.length} টি আপলোড হয়েছে\n🕒 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}\n\n🟢 অনুগ্রহ করে এডমিন প্যানেল চেক করে কাজ যাচাই করুন।`;
      sendAdminTelegramNotification(tgJobMsg);

      // 4. Update slots remaining
      await update(ref(db, `jobs/${selectedJob.id}`), {
        remainingSlots: freshJobData.remainingSlots - 1
      });

      // 5. Record completed local flag inside completedJobs dictionary
      await update(ref(db, `users/${userId}/completedJobs`), {
        [selectedJob.id]: true
      });

      setSubmitJobWorkMessage({ text: 'অসাধারণ! প্রমাণপত্র জমা হয়েছে, ভেরিফিকেশনের পর পেমেন্ট পাবেন।', type: 'success' });
      triggerToast('কাজ জমা হয়েছে!', 'success');

      // Clear Form state
      setSubmitFeedback('');
      setSubmitProofFiles(null);
      setSubmitProofsPreview([]);

      setTimeout(() => {
        switchTab('all-jobs');
        setSubmitJobWorkMessage({ text: '', type: '' });
      }, 2500);
    } catch (err: any) {
      setSubmitJobWorkMessage({ text: 'ব্যর্থ: ' + err.message, type: 'error' });
    } finally {
      setIsSubmittingJobWork(false);
    }
  };

  // Claims referral missions
  const claimMissionReward = async (mission: ReferralMission) => {
    if (userData?.missions?.[mission.id]) return; // Already claimed

    try {
      const isMet = (userData?.totalRefers || 0) >= mission.target;
      if (!isMet) {
        triggerToast('টার্গেট পূরণ হয়নি!', 'error');
        return;
      }

      // Record mission claim status and update balance
      await update(ref(db, `users/${userId}`), {
        balance: (userData?.balance || 0) + mission.reward,
        [`missions/${mission.id}`]: true
      });

      triggerToast('৳' + mission.reward + ' রিওয়ার্ড যুক্ত হয়েছে!', 'success');
    } catch (e: any) {
      triggerToast('সমস্যা হয়েছে: ' + e.message, 'error');
    }
  };

  // Watch dynamic ads logic
  const handleWatchAd = (ad: AdCampaign) => {
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isAdWatching) return;

    // Open target link when clicked, as requested by user
    if (ad.link) {
      const url = ad.link.trim();
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      try {
        window.open(targetUrl, '_blank');
      } catch (err) {
        console.warn('Could not launch ad link automatically:', err);
      }
    }

    setCurrentActiveAd(ad);
    setAdCountdown(15);
    setIsAdWatching(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinishAdWatching(ad);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishAdWatching = async (ad: AdCampaign) => {
    setIsAdWatching(false);
    setCurrentActiveAd(null);
    try {
      // Add money to user's balance
      const newBal = (userData?.balance || 0) + ad.reward;
      await update(ref(db, `users/${userId}`), {
        balance: newBal
      });
      triggerToast(`৳${ad.reward} ওয়ান-টাইম এডস বোনাস যোগ হয়েছে!`, 'success');

      // Log real activity
      await logUserActivity(`একটি এড দেখে ৳${ad.reward} বোনাস পেয়েছেন! 📺`);
    } catch (e: any) {
      triggerToast('ক্রেডিট যোগ করতে সমস্যা হয়েছে', 'error');
    }
  };

  // --- INVESTMENT PLANS HANDLERS ---
  const [investmentConfirm, setInvestmentConfirm] = useState<{
    plan: InvestmentPlan;
    show: boolean;
  } | null>(null);

  const handleBuyInvestmentPlan = async (plan: InvestmentPlan) => {
    if (!userId || !userData) {
      triggerToast('দয়া করে প্রথমে লগইন করুন', 'error');
      return;
    }

    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) {
        triggerToast('ইউজার ডাটা পাওয়া যায়নি', 'error');
        return;
      }
      const freshUser = userSnap.val();
      const currentBalance = freshUser.balance || 0;

      if (currentBalance < plan.cost) {
        triggerToast(`দুঃখিত! এই প্ল্যানটি কিনতে ৳${plan.cost} প্রয়োজন। আপনার বর্তমান ব্যালেন্স ৳${currentBalance}`, 'error');
        return;
      }

      setInvestmentConfirm({ plan, show: true });
    } catch (e: any) {
      triggerToast('ত্রুটি: ' + e.message, 'error');
    }
  };

  const handleConfirmBuyInvestment = async () => {
    if (!userId || !userData || !investmentConfirm) return;
    const plan = investmentConfirm.plan;
    setInvestmentConfirm(null);

    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) {
        triggerToast('ইউজার ডাটা পাওয়া যায়নি', 'error');
        return;
      }
      const freshUser = userSnap.val();
      const currentBalance = freshUser.balance || 0;

      if (currentBalance < plan.cost) {
        triggerToast(`দুঃখিত! এই প্ল্যানটি কিনতে ৳${plan.cost} প্রয়োজন। আপনার বর্তমান ব্যালেন্স ৳${currentBalance}`, 'error');
        return;
      }

      const nextBalance = currentBalance - plan.cost;
      const investRef = ref(db, `user_investments/${userId}`);
      const newInvestRef = push(investRef);
      const purchaseKey = newInvestRef.key;

      const purchasedPlanObj: PurchasedPlan = {
        id: purchaseKey || '',
        planId: plan.id,
        planName: plan.name,
        cost: plan.cost,
        totalReturn: plan.totalReturn,
        validityDays: plan.validityDays,
        dailyIncome: plan.totalReturn / plan.validityDays,
        purchaseDate: Date.now(),
        lastClaimDate: 0,
        totalClaimed: 0,
        claimsLeft: plan.validityDays,
        status: 'active'
      };

      await update(userRef, { balance: nextBalance });
      await set(newInvestRef, purchasedPlanObj);

      // Log real activity
      await logUserActivity(`'${plan.name}' ইনভেস্টমেন্ট প্ল্যান সচল করেছেন! 📈`);

      // Record in wallet history
      const historyRef = push(ref(db, `wallet_history/${userId}`));
      await set(historyRef, {
        id: historyRef.key,
        userId,
        amount: plan.cost,
        type: 'deduction',
        purpose: `'${plan.name}' ইনভেস্টমেন্ট প্ল্যান সচল`,
        timestamp: Date.now()
      });

      // push notification
      const notifRef = push(ref(db, `notification_history/${userId}`));
      await set(notifRef, {
        id: notifRef.key,
        userId,
        title: 'ইনভেস্টমেন্ট প্ল্যান সচল হয়েছে! 🎉',
        body: `অভিনন্দন! আপনার '${plan.name}' প্ল্যানটি সফলভাবে সচল করা হয়েছে। প্রতি ২৪ ঘণ্টা পর পর দৈনিক ইনকাম ক্লেইম করতে পারবেন।`,
        timestamp: Date.now(),
        read: false
      });

      triggerToast(`'${plan.name}' ইনভেস্টমেন্ট প্ল্যানটি সফলভাবে চালু হয়েছে!`, 'success');
    } catch (e: any) {
      triggerToast('ত্রুটি: ' + e.message, 'error');
    }
  };

  const handleClaimInvestmentPlan = async (purchased: PurchasedPlan) => {
    if (!userId || !userData) return;

    if (purchased.status !== 'active' || purchased.claimsLeft <= 0) {
      triggerToast('এই প্ল্যানের মেয়াদ শেষ অথবা এটি নিষ্ক্রিয় আছে', 'error');
      return;
    }

    const now = Date.now();
    const oneDayInMs = 23 * 60 * 60 * 1000; // 23 hours to let user claim comfortably
    
    if (purchased.lastClaimDate > 0 && (now - purchased.lastClaimDate < oneDayInMs)) {
      const msLeft = oneDayInMs - (now - purchased.lastClaimDate);
      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
      const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
      triggerToast(`পরবর্তী ক্লেইম করতে আরও ${hoursLeft} ঘণ্টা ${minsLeft} মিনিট অপেক্ষা করুন।`, 'error');
      return;
    }

    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) {
        triggerToast('ইউজার ডাটা খুজে পাওয়া যায়নি', 'error');
        return;
      }
      const freshUser = userSnap.val();
      const currentBalance = freshUser.balance || 0;

      const dailyAmt = purchased.dailyIncome;
      const nextBalance = currentBalance + dailyAmt;

      const updatedClaimsLeft = purchased.claimsLeft - 1;
      const nextClaimedAmount = (purchased.totalClaimed || 0) + dailyAmt;
      const nextStatus = updatedClaimsLeft <= 0 ? 'completed' : 'active';

      // Update purchased plan
      const planRef = ref(db, `user_investments/${userId}/${purchased.id}`);
      await update(planRef, {
        lastClaimDate: now,
        totalClaimed: nextClaimedAmount,
        claimsLeft: updatedClaimsLeft,
        status: nextStatus
      });

      // Update user balance
      await update(userRef, { balance: nextBalance });

      // Log real activity
      await logUserActivity(`'${purchased.planName}' প্ল্যান থেকে দৈনিক লভ্যাংশ ৳${dailyAmt.toFixed(2)} ক্লেইম করেছেন! 📈`);

      // Record in wallet history
      const historyRef = push(ref(db, `wallet_history/${userId}`));
      await set(historyRef, {
        id: historyRef.key,
        userId,
        amount: dailyAmt,
        type: 'earning',
        purpose: `'${purchased.planName}' প্ল্যান থেকে দৈনিক রিওয়ার্ড ক্লেইম`,
        timestamp: now
      });

      // Record in notification history
      const notifRef = push(ref(db, `notification_history/${userId}`));
      await set(notifRef, {
        id: notifRef.key,
        userId,
        title: 'দৈনিক রিটার্ন ক্লেইম সফল! ৳' + dailyAmt.toFixed(2),
        body: `'${purchased.planName}' প্ল্যান থেকে দৈনিক রিটার্ন ৳${dailyAmt.toFixed(2)} আপনার ব্যালেন্সে যোগ করা হয়েছে।`,
        timestamp: now,
        read: false
      });

      triggerToast(`আজকের দৈনিক রিটার্ন ৳${dailyAmt.toFixed(2)} সফলভাবে ক্লেইম করা হয়েছে!`, 'success');
    } catch (e: any) {
      triggerToast('ত্রুটি: ' + e.message, 'error');
    }
  };

  // Adsterra Direct Link Watch Ad handler
  const handleWatchAdsterraAd = () => {
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isAdWatching || isAdsterraWatching) return;
    if (!globalSettings.adsterraDirectLink) {
      triggerToast('দুঃখিত, কোনো এডস্টেরা এড লিংক সেটআপ করা নেই!', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastDate = userData?.lastAdsterraDate || '';
    const currentCount = (lastDate === todayStr) ? (userData?.dailyAdsterraCount || 0) : 0;
    const limit = globalSettings.adsterraDailyLimit || 10;

    if (currentCount >= limit) {
      triggerToast(`⚠️ আপনি আজকের অ্যাড লিমিট (${limit} টি) শেষ করেছেন! আগামীকাল আবার চেষ্টা করুন।`, 'error');
      return;
    }

    const url = globalSettings.adsterraDirectLink.trim();
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      window.open(targetUrl, '_blank');
    } catch (err) {
      console.warn('Could not launch ad link automatically:', err);
    }

    setIsAdsterraWatching(true);
    setAdsterraCountdown(15);

    const interval = setInterval(() => {
      setAdsterraCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishAdsterraWatching();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishAdsterraWatching = async () => {
    setIsAdsterraWatching(false);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastDate = userData?.lastAdsterraDate || '';
      const currentCount = (lastDate === todayStr) ? (userData?.dailyAdsterraCount || 0) : 0;

      const reward = parseFloat(globalSettings.adsterraDirectReward as any || '0.15');
      const newAdsBalance = (userData?.adsBalance || 0) + reward;

      await update(ref(db, `users/${userId}`), {
        adsBalance: newAdsBalance,
        lastAdsterraDate: todayStr,
        dailyAdsterraCount: currentCount + 1
      });
      triggerToast(`৳${reward.toFixed(2)} এডস্টেরা স্পন্সর এডস বোনাস আপনার এডস ব্যালেন্সে যোগ হয়েছে!`, 'success');
    } catch (e: any) {
      triggerToast('ক্রেডিট যোগ করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleStartSpin = async () => {
    if (!userData?.isActive && !isAdminUser && !globalSettings.freeActivationEnabled) {
      setIsVerificationModalOpen(true);
      triggerToast('⚠️ এই ফিচারটি ব্যবহার করার জন্য প্রথমে আপনার অ্যাকাউন্টটি সক্রিয় করা আবশ্যক!', 'error');
      return;
    }
    if (isSpinning) return;

    const today = new Date().toISOString().split('T')[0];
    if (userData?.lastSpinDate === today) {
      triggerToast('আপনি আজকের ফ্রি স্পিন করে ফেলেছেন! আগামীকাল আবার চেষ্টা করুন।', 'error');
      return;
    }

    const segments = (globalSettings.spinRewards || '0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0')
      .split(',')
      .map(Number);

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * segments.length);
    const degreePerSegment = 360 / segments.length;
    // Spin 5 circles + aligning to segment center
    const targetRot = (360 * 5) + (360 - (randomIndex * degreePerSegment)) - (degreePerSegment / 2);
    setSpinRotation(targetRot);

    // Play decelerating tick sounds during spin to simulate physically hitting standard pins
    let tickDelay = 60;
    const playTicks = () => {
      if (tickDelay > 550) return;
      playTickSound();
      tickDelay = tickDelay * 1.16;
      setTimeout(playTicks, tickDelay);
    };
    setTimeout(playTicks, 100);

    setTimeout(async () => {
      const rewardVal = segments[randomIndex];
      const nextBal = (userData?.balance || 0) + rewardVal;

      try {
        await update(ref(db, `users/${userId}`), {
          balance: nextBal,
          lastSpinDate: today
        });
        setSpinResult(rewardVal);
        setShowSpinResultModal(true);
        playWinSound();
        triggerToast(`অভিনন্দন! আপনি জিতেছেন ৳${rewardVal.toFixed(2)}`, 'success');

        // Log real activity
        await logUserActivity(`লাকি স্পিন হুইল থেকে ৳${rewardVal.toFixed(2)} জিতেছেন! 🎡`);
      } catch (err: any) {
        triggerToast('বোনাস যোগ করতে ত্রুটি হয়েছে: ' + err.message, 'error');
      } finally {
        setIsSpinning(false);
      }
    }, 4000);
  };

  // User Profile picture upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      triggerToast('প্রোফাইল আপলোড হচ্ছে...', 'success');
      try {
        const url = await uploadToImgBB(file);
        await update(ref(db, `users/${userId}`), {
          profileImage: url
        });
        triggerToast('প্রোফাইল ছবি সেভ হয়েছে!', 'success');
      } catch (err) {
        triggerToast('আপলোড ব্যর্থ হয়েছে', 'error');
      }
    }
  };

  // Claim Gift Code Handler
  const handleClaimGiftCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCodeInput.trim()) {
      setGiftCodeError('অনুগ্রহ করে একটি গিফট কোড লিখুন।');
      return;
    }

    setGiftCodeError(null);
    setGiftCodeSuccess(null);
    setGiftCodeSubmitting(true);

    try {
      const giftCodesRef = ref(db, 'gift_codes');
      const snapshot = await get(giftCodesRef);
      if (!snapshot.exists()) {
        setGiftCodeError('দুঃখিত, এই কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে।');
        setGiftCodeSubmitting(false);
        return;
      }

      const allCodes: Record<string, any> = snapshot.val();
      const codeKey = Object.keys(allCodes).find(
        key => allCodes[key]?.code?.trim().toLowerCase() === giftCodeInput.trim().toLowerCase()
      );

      if (!codeKey) {
        setGiftCodeError('দুঃখিত, এই কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে।');
        setGiftCodeSubmitting(false);
        return;
      }

      const codeData = allCodes[codeKey];

      if (codeData.expirationTime && Date.now() > codeData.expirationTime) {
        setGiftCodeError('দুঃখিত, এই কোডটির মেয়াদ শেষ হয়ে গেছে।');
        setGiftCodeSubmitting(false);
        return;
      }

      if (codeData.maxUses !== undefined && codeData.usedCount >= codeData.maxUses) {
        setGiftCodeError('দুঃখিত, এই কোডটি ব্যবহারের সর্বোচ্চ সীমা অতিক্রম করেছে।');
        setGiftCodeSubmitting(false);
        return;
      }

      if (codeData.redeemedUsers && codeData.redeemedUsers[userId]) {
        setGiftCodeError('আপনি ইতিমধ্যে এই গিফট কোডটি রিডিম বা ব্যবহার করেছেন!');
        setGiftCodeSubmitting(false);
        return;
      }

      const currentBalance = userData?.balance || 0;
      const reward = parseFloat(codeData.rewardAmount) || 0;
      const nextBal = currentBalance + reward;

      await update(ref(db, `users/${userId}`), { balance: nextBal });
      
      const nextUsedCount = (codeData.usedCount || 0) + 1;
      await update(ref(db, `gift_codes/${codeKey}`), {
        usedCount: nextUsedCount,
        [`redeemedUsers/${userId}`]: true
      });

      if (userData) {
        setUserData({
          ...userData,
          balance: nextBal
        });
      }

      setGiftCodeSuccess(`অভিনন্দন! আপনি সফলভাবে ৳${reward} গিফট বোনাস পেয়েছেন।`);
      setGiftCodeInput('');
      triggerToast(`৳${reward} গিফট বোনাস সফলভাবে যুক্ত হয়েছে!`, 'success');
    } catch (err) {
      console.error(err);
      setGiftCodeError('কোড রিডিম করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setGiftCodeSubmitting(false);
    }
  };

  // Calculations for micro job budget slotting previews
  const computedSlots = parseFloat(postJobReward) > 0 && parseFloat(postJobBudget) > 0 
    ? Math.floor(parseFloat(postJobBudget) / parseFloat(postJobReward)) 
    : 0;

  const activeSupports = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Support',
      icon: <MessageSquare size={16} className="text-emerald-500 animate-pulse shrink-0" />,
      url: globalSettings.supportWhatsAppNumber,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200/50 hover:border-emerald-300'
    },
    {
      id: 'tg_channel',
      name: 'Telegram Channel',
      icon: <Send size={16} className="text-sky-500 shrink-0" />,
      url: globalSettings.supportTelegramChannel,
      color: 'bg-sky-50 text-sky-700 hover:bg-sky-100/80 border-sky-200/50 hover:border-sky-300'
    },
    {
      id: 'tg_group',
      name: 'Telegram Group',
      icon: <Send size={16} className="text-blue-500 animate-pulse shrink-0" />,
      url: globalSettings.supportTelegramGroup,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border-blue-200/50 hover:border-blue-300'
    },
    {
      id: 'tg_admin',
      name: 'Telegram Admin',
      icon: <User size={16} className="text-indigo-500 shrink-0" />,
      url: globalSettings.supportTelegramAdmin,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50 hover:border-indigo-300'
    },
    {
      id: 'facebook',
      name: 'Facebook Page',
      icon: <Facebook size={16} className="text-blue-600 shrink-0" />,
      url: globalSettings.supportFacebookPage,
      color: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100/80 border-indigo-200/50 hover:border-indigo-300'
    }
  ].filter(item => item.url && item.url.trim() !== '');

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-stone-800 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-x-hidden border-x border-stone-200">
      
      {/* 1. Account suspended/banned lockout screen */}
      {userData?.isBanned && (
        <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 bg-red-600/10 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <XOctagon size={32} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">অ্যাকাউন্ট সাসপেন্ডেড!</h2>
          <p className="text-stone-400 text-xs mt-2 max-w-sm leading-relaxed">
            দুঃখিত, আপনার অ্যাকাউন্টটি আমাদের নিয়ম লঙ্ঘনের কারণে ব্যান বা সাময়িকভাবে সাসপেন্ড করা হয়েছে। আপনার কোনো প্রশ্ন থাকলে সাপোর্ট টিমের সাথে যোগাযোগ করুন।
          </p>
          <div className="text-[10px] text-stone-600 mt-4 leading-normal font-mono">
            ইউজার আইডি: {userId}
          </div>
        </div>
      )}

      {/* 2. Emergency Mode lock overlay */}
      {!isAdminUser && globalSettings.emergencyEnabled && (
        <div className="fixed inset-0 bg-stone-900 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20 animate-pulse">
            <AlertOctagon size={32} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">জরুরী নোটিশ / রক্ষণাবেক্ষণ</h2>
          <p className="text-stone-400 text-xs mt-2 max-w-xs leading-relaxed">
            {globalSettings.emergencyMessage || "আমাদের অ্যাপের জরুরি কাজ চলছে। সাময়িকভাবে অ্যাপটি বন্ধ রাখা হয়েছে। শীঘ্রই আমরা ফিরে আসব। ধন্যবাদ!"}
          </p>
        </div>
      )}

      {/* 2.5: Inactive Account Sticky/Floating Alert Bar */}
      {!isAdminUser && userData && !userData.isActive && !globalSettings.freeActivationEnabled && (
        <div 
          onClick={() => setIsVerificationModalOpen(true)}
          className="sticky top-0 z-40 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-4 py-2.5 flex items-center justify-between shadow-md cursor-pointer animate-pulse transition duration-350 shrink-0"
        >
          <div className="flex items-center gap-2">
            <Lock size={15} className="shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold leading-normal">
              আপনার অ্যাকাউন্ট নিষ্ক্রিয়! সক্রিয় করতে এখানে ক্লিক করুন ⚠️
            </span>
          </div>
          <button 
            type="button"
            className="bg-white/20 hover:bg-white/30 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full transition"
          >
            ACTIVE NOW
          </button>
        </div>
      )}

      {/* 3. Popup Announcement Modal */}
      <AnimatePresence>
        {globalSettings.popupEnabled && !hasSeenPopup && (
          <div className="fixed inset-0 bg-black/60 z-[55] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[340px] p-6 flex flex-col items-center text-center border border-stone-100"
            >
              {/* Close Button */}
              <button 
                onClick={handleClosePopup}
                className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 p-1.5 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} strokeWidth={2.5} />
              </button>

              {/* Concentric rings with Bell Icon */}
              <div className="relative flex items-center justify-center w-24 h-24 mb-4 mt-1">
                {/* Outer ring */}
                <div className="absolute inset-0 bg-sky-100/40 rounded-full border border-sky-100/50 flex items-center justify-center">
                  {/* Middle ring */}
                  <div className="w-18 h-18 bg-sky-100/80 rounded-full flex items-center justify-center border border-sky-200/20">
                    {/* Inner circle with light shadow */}
                    <div className="w-13 h-13 bg-sky-200/90 rounded-full flex items-center justify-center shadow-inner">
                      <Bell className="w-6 h-6 text-[#0284c7] fill-[#0284c7]/20" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-black text-stone-800 text-base leading-normal tracking-tight mb-2">
                {globalSettings.popupTitle || "জরুরী নোটিশ!"}
              </h3>

              {/* Message */}
              <p className="text-stone-500 leading-relaxed text-[11px] font-medium whitespace-pre-line mb-5 max-w-[280px]">
                {globalSettings.popupMessage || "আমাদের ওয়েবসাইটে কাজ করতে চাইলে অবশ্যই আমাদের টেলিগ্রাম চ্যানেলে জয়েন হন। সেখানে আমাদের ওয়েবসাইটের সকল আপডেট প্রতি মিনিটে মিনিটে দেওয়া হয়।"}
              </p>

              {/* Popup Optional Image */}
              {globalSettings.popupImageUrl && (
                <div className="w-full mb-4 rounded-2xl overflow-hidden border border-stone-100 shadow-xs">
                  <img 
                    src={globalSettings.popupImageUrl} 
                    className="w-full h-24 object-cover" 
                    alt="Announcement Media" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              )}

              {/* Main Join Link Button */}
              <a 
                href={globalSettings.popupLink || globalSettings.supportTelegramChannel || "https://t.me/yourchannel"}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#00a2ed] text-white py-3 px-6 rounded-full font-bold hover:bg-[#0091d4] active:scale-98 transition flex items-center justify-center gap-2 text-xs shadow-md shadow-sky-500/10 mb-4 cursor-pointer"
              >
                {/* Telegram Paperplane custom SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.24-.213-.054-.333-.373-.12l-6.87 4.326-2.962-.924c-.643-.201-.658-.643.136-.953l11.57-4.458c.536-.196.99.124.814.953z"/>
                </svg>
                <span>জয়েন করুন!</span>
              </a>

              {/* Divider: অথবা যুক্ত হন */}
              <div className="flex items-center gap-3 w-full text-stone-200 text-[10px] font-bold tracking-wide mb-4">
                <div className="h-[1px] bg-stone-150 flex-1"></div>
                <span className="text-stone-400 shrink-0 font-extrabold select-none">অথবা যুক্ত হন</span>
                <div className="h-[1px] bg-stone-150 flex-1"></div>
              </div>

              {/* Social Channels Row */}
              <div className="flex items-center justify-center gap-4">
                {/* Telegram */}
                <a 
                  href={globalSettings.supportTelegramChannel || globalSettings.supportTelegramGroup || globalSettings.popupLink || "https://t.me/yourchannel"} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-11 h-11 bg-[#0088cc] hover:bg-[#0077b3] text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  title="Telegram Channel"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.24-.213-.054-.333-.373-.12l-6.87 4.326-2.962-.924c-.643-.201-.658-.643.136-.953l11.57-4.458c.536-.196.99.124.814.953z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href={globalSettings.telegramTutorialUrl || "https://youtube.com"} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-11 h-11 bg-[#ff0000] hover:bg-[#e60000] text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  title="YouTube Tutorial"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a 
                  href={globalSettings.supportFacebookPage || "https://facebook.com"} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-11 h-11 bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  title="Facebook Page"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Spin Goal reward Success Modal */}
      <AnimatePresence>
        {showSpinResultModal && spinResult !== null && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5 overflow-hidden">
            <ConfettiCanvas />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-2xl text-center w-full max-w-xs space-y-4 relative z-50 animate-fade-in"
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 animate-bounce">
                <Gift size={32} />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-800 text-sm">অভিনন্দন!</h3>
                <p className="text-stone-500 text-xs mt-1">আপনি স্পিন হুইল থেকে পেয়েছেন</p>
                <div className="text-2xl font-black text-amber-600 font-sans mt-2">
                  ৳{spinResult.toFixed(2)}
                </div>
              </div>
              <button 
                onClick={() => setShowSpinResultModal(false)}
                className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white py-3 rounded-2xl font-extrabold text-xs transition shadow-md"
              >
                ঠিক আছে
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast System */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-sm">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`p-3 rounded-2xl flex items-center gap-3 shadow-xl text-sm ${
                t.type === 'success' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {t.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <span className="font-semibold">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Panel */}
      <header className="bg-white px-5 py-4 flex justify-between items-center z-40 sticky top-0 shadow-sm shrink-0">
        <button onClick={() => setIsSidelineOpen(true)} className="p-1 cursor-pointer transition text-stone-700 hover:text-stone-900 shrink-0">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-1.5">
          <img src="/app_logo.jpg" alt="Logo" className="w-6.5 h-6.5 rounded-lg object-cover shadow-xs border border-stone-150" />
          <span className="text-xl font-black bg-[#764ba2] bg-clip-text text-transparent tracking-wide font-sans">
            𝗧ᴀᴋᴀ𝗛ᴜʙ 𝗣ʀᴏ
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => switchTab('notifications')}
            className={`p-2 rounded-full relative transition shrink-0 ${activeTab === 'notifications' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
            title="নোটিফিকেশন"
          >
            <Bell size={16} />
            {globalNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] border-2 border-white shadow-xs">
                {globalNotifications.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => switchTab('wallet')}
            className="p-1 px-3 bg-[#764ba2]/10 hover:bg-[#764ba2]/20 text-[#764ba2] sm:text-sm text-xs font-bold rounded-full flex items-center gap-1.5 transition"
          >
            <Coins size={14} />
            <span>৳{(userData?.balance || 0).toFixed(2)}</span>
          </button>
        </div>
      </header>

      {/* Running notice marquee bar */}
      {globalSettings.runningNotice && (
        <div className="bg-amber-450/15 text-amber-700 px-4 py-1.5 text-[11px] font-bold overflow-hidden flex items-center gap-2 border-b border-amber-500/10 shrink-0">
          <Volume2 size={12} className="shrink-0 text-amber-500 animate-pulse" />
          <marquee className="flex-1" scrollamount="4">
            {globalSettings.runningNotice}
          </marquee>
        </div>
      )}

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidelineOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidelineOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            {/* Sidebar main body */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-6 text-white text-center rounded-b-[30px] flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3 group cursor-pointer">
                  <img 
                    src={userData?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.username || 'User')}&background=764ba2&color=fff&size=128`} 
                    className="w-full h-full rounded-full object-cover border-4 border-white/20" 
                    alt="UserProfile" 
                  />
                  <label className="absolute bottom-0 right-0 bg-white text-[#764ba2] w-6 h-6 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                    <PlusCircle size={14} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageChange} 
                    />
                  </label>
                </div>
                <h3 className="text-lg font-bold tracking-tight truncate max-w-full">
                  {userData?.username || 'সম্পূর্ণ নাম...'}
                </h3>
                {(() => {
                  const badgeInfo = getUserLevelAndBadge(userData);
                  return (
                    <div className="mt-1 flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black tracking-wide text-white">
                      <span>{badgeInfo.badge}</span>
                      <span className="uppercase">{badgeInfo.label} Badge</span>
                      <span className="opacity-60 font-medium">| Lvl {badgeInfo.level}</span>
                    </div>
                  );
                })()}
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleCopy(userId, 'ইউজার আইডি কপি হয়েছে')}
                    className="text-[10px] font-mono bg-black/20 hover:bg-black/30 px-2.5 py-1.5 rounded-full flex items-center gap-1 transition text-white/95"
                  >
                    <Copy size={9} />
                    <span>ID: {userId.substring(0, 10)}...</span>
                  </button>
                  <button 
                    onClick={() => switchTab('profile')}
                    className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded-full flex items-center gap-1 transition text-white border border-white/10"
                  >
                    <Edit3 size={9} />
                    <span>প্রোফাইল পরিবর্তন</span>
                  </button>
                </div>
              </div>

              {/* Side Nav menu items */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <button onClick={() => switchTab('home')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'home' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Home size={18} />
                  <span>হোম</span>
                </button>
                <button onClick={() => switchTab('profile')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'profile' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <User size={18} className="text-[#764ba2]" />
                  <span>আমার প্রোফাইল (Edit Profile)</span>
                </button>
                <button onClick={() => switchTab('all-jobs')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'all-jobs' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Briefcase size={18} />
                  <span>চলমান ক্যাম্পেইন</span>
                </button>
                <button onClick={() => switchTab('refer')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'refer' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <UserPlus size={18} />
                  <span>রেফার অ্যান্ড আর্ন</span>
                </button>
                <button onClick={() => switchTab('transfer')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'transfer' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <ArrowLeftRight size={18} />
                  <span>ব্যালেন্স ট্রান্সফার</span>
                </button>
                <button onClick={() => switchTab('wallet')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'wallet' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Wallet size={18} />
                  <span>টাকা উত্তোলন (Wallet)</span>
                </button>
                <button onClick={() => switchTab('deposit')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'deposit' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <ArrowDownCircle size={18} className="text-[#764ba2]" />
                  <span>অ্যাকাউন্ট ডিপোজিট (Deposit)</span>
                </button>
                <button onClick={() => switchTab('mission')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'mission' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Gift size={18} />
                  <span>ডেইলি মিশন</span>
                </button>
                <button onClick={() => switchTab('spin')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'spin' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Play size={18} className="text-amber-500" />
                  <span className="flex items-center gap-1.5">
                    <span>લાকি স্পিন হুইল</span>
                    <span className="bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">Free</span>
                  </span>
                </button>
                <button onClick={() => switchTab('game')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'game' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Gamepad2 size={18} className="text-fuchsia-500" />
                  <span className="flex items-center gap-1.5">
                    <span>টিক ট্যাক টো গেম</span>
                    <span className="bg-fuchsia-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">Play</span>
                  </span>
                </button>
                <button onClick={() => switchTab('scratch')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'scratch' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Sparkles size={18} className="text-teal-500 animate-pulse" />
                  <span className="flex items-center gap-1.5">
                    <span>લાকি স্ক্র্যাচ কার্ড</span>
                    <span className="bg-teal-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">Hot</span>
                  </span>
                </button>
                <button onClick={() => switchTab('notifications')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'notifications' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Bell size={18} className="text-rose-500" />
                  <span>বিজ্ঞপ্তি সমূহ</span>
                </button>

                <button onClick={() => switchTab('investment-plans')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'investment-plans' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <TrendingUp size={18} className="text-emerald-500" />
                  <span className="flex items-center gap-1.5">
                    <span>ইনভেস্টমেন্ট প্ল্যান</span>
                    <span className="bg-emerald-550 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">Income</span>
                  </span>
                </button>

                <button onClick={() => switchTab('support')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'support' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <HelpCircle size={18} className="text-[#764ba2]" />
                  <span>সাহায্য ও সাপোর্ট</span>
                </button>

                {onSwitchToNovaShop && (
                  <button 
                    onClick={() => {
                      setIsSidelineOpen(false);
                      if (globalSettings.novashopMaintenanceEnabled) {
                        setIsNovaShopMaintModalOpen(true);
                      } else {
                        onSwitchToNovaShop();
                      }
                    }}
                    className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition border border-violet-150/50"
                  >
                    <ShoppingBag size={18} className="text-violet-600" />
                    <span>নোভা শপ (Nova Shop) 𒀭</span>
                  </button>
                )}


                {isAdminUser && onSwitchToAdmin && (
                  <div className="pt-4 border-t border-stone-100">
                    <button 
                      onClick={() => {
                        setIsSidelineOpen(false);
                        onSwitchToAdmin();
                      }}
                      className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                    >
                      <LockKeyhole size={18} />
                      <span>এডমিন প্যানেলে যান</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-stone-100">
                <button 
                  onClick={onLogout}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-bold p-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition"
                >
                  <LogOut size={16} />
                  <span>লগআউট করুন</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main body with content switches */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28">
        
        {/* VIEW 1: HOME */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            {/* App updates slider / notice */}
            {globalSettings.appDownloadLink && (
              <div className="bg-[#764ba2] text-white p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="shrink-0" />
                  <span className="font-semibold">আমাদের অফিসিয়াল মোবাইল অ্যাপ ডাউনলোড করুন!</span>
                </div>
                <a 
                  href={globalSettings.appDownloadLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-[#764ba2] hover:bg-white/95 px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 text-[10px]"
                >
                  다운/ডাউনলোড <ExternalLink size={10} />
                </a>
              </div>
            )}

            {/* Total Balance Card exactly matching the visual mockup */}
            <div className="bg-gradient-to-r from-[#8a33f5] via-[#ca28e0] to-[#f92bb4] text-white p-6.5 rounded-[28px] shadow-lg relative overflow-hidden flex flex-col justify-between">
              {/* Backglow decor circles for fluid layout */}
              <div className="absolute top-[-25px] right-[-25px] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-[-35px] left-[-35px] w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
              
              {/* Top balance section */}
              <div className="flex justify-between items-start w-full relative z-10">
                <div className="space-y-1.5">
                  <span className="text-white/80 text-xs font-bold tracking-normal block">সর্বমোট ব্যালেন্স (All combined)</span>
                  <div className="text-white text-4.5xl font-black font-sans leading-none flex items-center">
                    ৳{((userData?.balance || 0) + 
                       (userData?.gmailBalance || 0) + 
                       (userData?.telegramBalance || 0) + 
                       (userData?.whatsappBalance || 0) + 
                       (userData?.facebookBalance || 0) + 
                       (userData?.instagramBalance || 0) + 
                       (userData?.adsBalance || 0)).toFixed(2)}
                  </div>
                </div>

                {/* Translucent circled Wallet Icon wrapper */}
                <div 
                  onClick={() => switchTab('wallet')}
                  className="flex items-center justify-center w-14 h-14 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition cursor-pointer shadow-inner shrink-0"
                >
                  <Wallet size={24} className="text-white" />
                </div>
              </div>

              {/* Bento sub-grid for each individual sub-balance inside the card */}
              <div className="mt-4.5 bg-white/10 border border-white/15 rounded-2xl p-3 grid grid-cols-3 gap-2.5 relative z-10 font-sans">
                <div className="space-y-0.5">
                  <span className="text-white/60 text-[9px] font-bold block leading-none">মূল ব্যালেন্স</span>
                  <span className="font-extrabold text-[11px] block text-white">৳{(userData?.balance || 0).toFixed(1)}</span>
                </div>
                <div className="space-y-0.5 border-l border-white/10 pl-1.5">
                  <span className="text-white/60 text-[9px] font-bold block leading-none">জিমেইল</span>
                  <span className="font-extrabold text-[11px] block text-white">৳{(userData?.gmailBalance || 0).toFixed(1)}</span>
                </div>
                <div className="space-y-0.5 border-l border-white/10 pl-1.5">
                  <span className="text-white/60 text-[9px] font-bold block leading-none">টেলিগ্রাম</span>
                  <span className="font-extrabold text-[11px] block text-white">৳{(userData?.telegramBalance || 0).toFixed(1)}</span>
                </div>
                <div className="space-y-0.5 pt-1.5 border-t border-white/10">
                  <span className="text-white/60 text-[9px] font-bold block leading-none">হোয়াটসঅ্যাপ</span>
                  <span className="font-extrabold text-[11px] block text-white">৳{(userData?.whatsappBalance || 0).toFixed(1)}</span>
                </div>
                <div className="space-y-0.5 pt-1.5 border-t border-l border-white/10 pl-1.5">
                  <span className="text-white/60 text-[9px] font-bold block leading-none">ফেসবুক</span>
                  <span className="font-extrabold text-[11px] block text-white">৳{(userData?.facebookBalance || 0).toFixed(1)}</span>
                </div>
                <div className="space-y-0.5 pt-1.5 border-t border-l border-white/10 pl-1.5">
                  <span className="text-white/60 text-[9px] font-bold block leading-none">ইনস্টাগ্রাম</span>
                  <span className="font-extrabold text-[11px] block text-white">৳{(userData?.instagramBalance || 0).toFixed(1)}</span>
                </div>
                <div className="space-y-0.5 pt-2 border-t border-white/10 col-span-3">
                  <div className="flex justify-between items-center px-1 font-bold">
                    <span className="text-white/70 text-[9.5px]">বিজ্ঞাপন ব্যালেন্স:</span>
                    <span className="text-amber-300 text-[11.5px] font-black">৳{(userData?.adsBalance || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom twin button actions */}
              <div className="grid grid-cols-2 gap-3.5 mt-4.5 relative z-10">
                <button 
                  onClick={() => {
                    if (globalSettings.depositMaintenanceEnabled) {
                      triggerToast(globalSettings.depositMaintenanceMessage || 'ডিপোজিট এবং এক্টিভেশন সংক্রান্ত পেমেন্ট গেটওয়ে আপগ্রেড হচ্ছে।', 'error');
                    } else {
                      switchTab('deposit');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 border border-white/20 bg-white/10 hover:bg-white/25 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-2xl transition cursor-pointer backdrop-blur-xs shadow-xs"
                >
                  <ArrowDown size={14} className="stroke-[3px]" />
                  <span>DEPOSIT</span>
                </button>

                <button 
                  onClick={() => {
                    switchTab('wallet');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 border border-white/20 bg-white/10 hover:bg-white/25 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-2xl transition cursor-pointer backdrop-blur-xs shadow-xs"
                >
                  <ArrowUp size={14} className="stroke-[3px]" />
                  <span>WITHDRAW</span>
                </button>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="flex justify-center mt-1 -mb-1">
              {(userData?.isActive || globalSettings.freeActivationEnabled) ? (
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle size={11} className="text-emerald-500" />
                  <span>ভেরিফাইড মেম্বার (Verified Member)</span>
                </span>
              ) : (
                <span className="bg-rose-50/80 border border-rose-200 text-rose-600 text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                  <XCircle size={11} className="text-rose-500" />
                  <span>ইনএকটিভ মেম্বার (একাউন্ট সচল করুন)</span>
                </span>
              )}
            </div>

            {/* Inactive verification notice box */}
            {!userData?.isActive && !globalSettings.freeActivationEnabled && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl shadow-xs">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 shrink-0" size={20} />
                  <div>
                    <h4 className="text-red-900 font-bold text-sm">একাউন্ট এক্টিভ করুন</h4>
                    <p className="text-red-700 text-xs mt-1 leading-relaxed">
                      অনলিমিটেড টাকা উত্তোলন, রেফার অপশন চালু এবং ক্যাম্পেইনে কাজ সাবমিট করার জন্য {globalSettings.activationPrice || 100} টাকা এক্টিভেশন ফি পাঠিয়ে একাউন্ট ভেরিফাই করুন।
                    </p>
                    <button 
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                    >
                      এখনই একটিভ করুন
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AMADER SEBASUMUH GRID SECTION EXACTLY MATCHING THE MOCKUP */}
            <div className="space-y-4">
              <div className="px-1 mt-5 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-[6px] h-[22px] bg-[#764ba2] rounded-full"></div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight font-sans">আমাদের সেবাসমূহ (Our Services)</h2>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 font-extrabold pl-3.5 font-sans leading-relaxed">
                  আপনার কাঙ্খিত সেবাটি বেছে নিন এবং বিশ্বস্ততার সাথে অনলাইন থেকে নিশ্চিত আর্নিং শুরু করুন।
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 select-none">
                {/* 1. Combined Account Sell Card (Full Width in Grid) */}
                {([
                  !globalSettings.hideGmailSell,
                  !globalSettings.hideTelegramSell,
                  !globalSettings.hideWhatsappSell,
                  !globalSettings.hideFacebookSell,
                  !globalSettings.hideInstagramSell
                ].filter(Boolean).length > 0) && (
                  <div className="col-span-3 sm:col-span-4 bg-gradient-to-br from-[#764ba2]/5 via-indigo-50/20 to-purple-50/30 border border-[#764ba2]/15 rounded-[28px] p-4.5 space-y-3.5 shadow-3xs">
                    <div className="flex justify-between items-center px-1">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-stone-850 text-xs sm:text-[13px] font-sans flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-[#764ba2] rounded-full animate-pulse"></span>
                          সোশ্যাল একাউন্ট বিক্রি করুন (Social Account Sell)
                        </h3>
                        <p className="text-[10px] text-stone-500 font-bold font-sans">১০০% বিশ্বস্ততা ও অটোমেটিক ইনস্ট্যান্ট পেমেন্ট সুবিধা</p>
                      </div>
                      <span className="text-[9px] bg-[#764ba2]/15 text-[#764ba2] px-2 py-0.5 rounded-full font-black uppercase tracking-wider font-mono">HOT SERVICE</span>
                    </div>

                    <div className={`grid gap-1.5 sm:gap-2 ${
                      [
                        !globalSettings.hideGmailSell,
                        !globalSettings.hideTelegramSell,
                        !globalSettings.hideWhatsappSell,
                        !globalSettings.hideFacebookSell,
                        !globalSettings.hideInstagramSell
                      ].filter(Boolean).length === 5 ? 'grid-cols-5' :
                      [
                        !globalSettings.hideGmailSell,
                        !globalSettings.hideTelegramSell,
                        !globalSettings.hideWhatsappSell,
                        !globalSettings.hideFacebookSell,
                        !globalSettings.hideInstagramSell
                      ].filter(Boolean).length === 4 ? 'grid-cols-4' :
                      [
                        !globalSettings.hideGmailSell,
                        !globalSettings.hideTelegramSell,
                        !globalSettings.hideWhatsappSell,
                        !globalSettings.hideFacebookSell,
                        !globalSettings.hideInstagramSell
                      ].filter(Boolean).length === 3 ? 'grid-cols-3' :
                      [
                        !globalSettings.hideGmailSell,
                        !globalSettings.hideTelegramSell,
                        !globalSettings.hideWhatsappSell,
                        !globalSettings.hideFacebookSell,
                        !globalSettings.hideInstagramSell
                      ].filter(Boolean).length === 2 ? 'grid-cols-2' :
                      'grid-cols-1'
                    }`}>
                      {/* Gmail Sell */}
                      {!globalSettings.hideGmailSell && (
                        <div 
                          onClick={() => switchTab('gmail-sell')}
                          className="bg-white hover:bg-rose-50 border border-stone-200/60 hover:border-rose-200 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-4xs"
                        >
                          <div className="w-8 h-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-rose-500/10 rounded-xl blur-3xs"></div>
                            <svg className="w-5 h-5 z-10" viewBox="0 0 24 24" fill="none">
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#EA4335" />
                              <path d="M22 6l-10 7L2 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[8.5px] sm:text-[10px] text-stone-800 leading-none block">Gmail</span>
                            <span className="text-[8px] sm:text-[9px] text-[#764ba2] font-black leading-none block">৳{globalSettings.gmailPrice || 5.0}</span>
                          </div>
                        </div>
                      )}

                      {/* Telegram Sell */}
                      {!globalSettings.hideTelegramSell && (
                        <div 
                          onClick={() => switchTab('telegram-sell')}
                          className="bg-white hover:bg-sky-50 border border-stone-200/60 hover:border-sky-200 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-4xs"
                        >
                          <div className="w-8 h-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-sky-500/10 rounded-xl blur-3xs"></div>
                            <svg className="w-5 h-5 z-10" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="6" fill="#229ED9" />
                              <path d="M18.8 6.4c-.1-.1-.3-.1-.4 0l-13.6 5.2c-.3.1-.3.5 0 .6l3.1 1 7.2-4.5c.1-.1.2.1.1.2l-5.8 5.3-.2 2.6c0 .3.4.4.6.1l1.7-1.6 3.4 2.5c.2.1.5 0 .6-.2l3.4-11c0-.1 0-.2-.1-.2z" fill="#fff" />
                            </svg>
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[8.5px] sm:text-[10px] text-stone-800 leading-none block">Telegram</span>
                            <span className="text-[8px] sm:text-[9px] text-[#764ba2] font-black leading-none block">৳{globalSettings.telegramPrice || 20}</span>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp Sell */}
                      {!globalSettings.hideWhatsappSell && (
                        <div 
                          onClick={() => switchTab('whatsapp-sell')}
                          className="bg-white hover:bg-emerald-50 border border-stone-200/60 hover:border-emerald-200 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-4xs"
                        >
                          <div className="w-8 h-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-3xs"></div>
                            <svg className="w-5 h-5 z-10" viewBox="0 0 24 24" fill="none">
                              <rect width="24" height="24" rx="6" fill="#25D366" />
                              <path d="M12.01 5c-3.86 0-7 3.14-7 7 0 1.42.42 2.74 1.14 3.86l-.75 2.25 2.33-.73c1.07.65 2.3 1.02 3.63 1.02 3.86 0 7-3.14 7-7s-3.14-7-7-7zm2.4 9.17c-.15.42-.77.78-1.2.83-.37.05-.85-.14-2.43-.79-1.92-.79-3.16-2.75-3.26-2.88-.1-.13-.78-1.04-.78-1.98 0-.94.49-1.4 1.34-1.4.19 0 .34.01.46.01.12 0 .28-.05.44.34.16.39.56 1.37.61 1.47.05.1.08.22.01.35-.07.13-.19.28-.3.4l-.18.15c-.1.1-.21.21-.09.4.52.88 1.29 1.58 2.2 1.94.13.05.25.07.35-.05.12-.15.52-.61.66-.82.14-.2.28-.17.47-.1.19.07 1.2.56 1.4.67.21.11.35.16.4.25.05.09.05.52-.1.94z" fill="#fff" />
                            </svg>
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[8.5px] sm:text-[10px] text-stone-800 leading-none block">WhatsApp</span>
                            <span className="text-[8px] sm:text-[9px] text-[#764ba2] font-black leading-none block">৳{globalSettings.whatsappPrice || 35}</span>
                          </div>
                        </div>
                      )}

                      {/* Facebook Sell */}
                      {!globalSettings.hideFacebookSell && (
                        <div 
                          onClick={() => switchTab('facebook-sell')}
                          className="bg-white hover:bg-blue-50 border border-stone-200/60 hover:border-blue-200 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-4xs"
                        >
                          <div className="w-8 h-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-blue-600/10 rounded-xl blur-3xs"></div>
                            <svg className="w-5 h-5 z-10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                            </svg>
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[8.5px] sm:text-[10px] text-stone-800 leading-none block">Facebook</span>
                            <span className="text-[8px] sm:text-[9px] text-[#764ba2] font-black leading-none block">৳{globalSettings.facebookPrice || 25}</span>
                          </div>
                        </div>
                      )}

                      {/* Instagram Sell */}
                      {!globalSettings.hideInstagramSell && (
                        <div 
                          onClick={() => switchTab('instagram-sell')}
                          className="bg-white hover:bg-pink-50 border border-stone-200/60 hover:border-pink-200 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-4xs"
                        >
                          <div className="w-8 h-8 flex items-center justify-center relative overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] opacity-15"></div>
                            <svg className="w-5 h-5 z-10" viewBox="0 0 24 24" fill="none">
                              <defs>
                                <radialGradient id="ig-grad-seba-card" cx="30%" cy="107%" r="130%">
                                  <stop offset="0%" stopColor="#fdf497" />
                                  <stop offset="5%" stopColor="#fdf497" />
                                  <stop offset="45%" stopColor="#fd5949" />
                                  <stop offset="60%" stopColor="#d6249f" />
                                  <stop offset="100%" stopColor="#285AEB" />
                                </radialGradient>
                              </defs>
                              <rect width="24" height="24" rx="6" fill="url(#ig-grad-seba-card)" />
                              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8.2c-1.77 0-3.2-1.43-3.2-3.2s1.43-3.2 3.2-3.2 3.2 1.43 3.2 3.2-1.43 3.2-3.2 3.2zm5.3-8.82c0-.64.52-1.16 1.16-1.16s1.16.52 1.16 1.16-.52 1.16-1.16 1.16-1.16-.52-1.16-1.16z" fill="#fff" />
                            </svg>
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[8.5px] sm:text-[10px] text-stone-800 leading-none block">Instagram</span>
                            <span className="text-[8px] sm:text-[9px] text-[#764ba2] font-black leading-none block">৳{globalSettings.instagramPrice || 20}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Micro Job */}
                <div 
                  onClick={() => switchTab('all-jobs')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Briefcase className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Micro Job</span>
                    <span className="text-[8.5px] text-stone-400 font-bold leading-none block">কাজ করুন</span>
                  </div>
                </div>

                {/* 7. Job Post */}
                <div 
                  onClick={() => switchTab('post-job')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <PlusCircle className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Job Post</span>
                    <span className="text-[8.5px] text-stone-400 font-bold leading-none block">পোস্ট করুন</span>
                  </div>
                </div>

                {/* 8. Lucky Spin */}
                <div 
                  onClick={() => switchTab('spin')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Compass className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Spin & Earn</span>
                    <span className="text-[8.5px] text-purple-600 font-black leading-none block">LUCKY</span>
                  </div>
                </div>

                {/* 9. Tic Tac Toe Game */}
                <div 
                  onClick={() => switchTab('game')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-fuchsia-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Gamepad2 className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Game Zone</span>
                    <span className="text-[8.5px] text-fuchsia-600 font-bold leading-none block">খেলে আয়</span>
                  </div>
                </div>

                {/* 9b. Lucky Scratch Card */}
                <div 
                  onClick={() => switchTab('scratch')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-teal-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Sparkles className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Lucky Scratch</span>
                    <span className="text-[8.5px] text-teal-600 font-black leading-none block">৳{globalSettings.scratchCardPrice || 5}</span>
                  </div>
                </div>

                {/* 9c. Math Solve Game */}
                {!globalSettings.hideMathSolve && (
                  <div 
                    onClick={() => switchTab('math-solve')}
                    className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-12 h-12 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-xs"></div>
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                          <svg className="w-5 h-5 stroke-[2.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Math Solve</span>
                      <span className="text-[8.5px] text-amber-600 font-black leading-none block">৳{(globalSettings.mathSolveReward ?? 1).toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* 9d. Quiz Play Game */}
                {!globalSettings.hideQuiz && (
                  <div 
                    onClick={() => switchTab('quiz-play')}
                    className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-12 h-12 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xs"></div>
                        <div className="w-10 h-10 bg-cyan-550 rounded-xl flex items-center justify-center text-white shadow-xs">
                          <svg className="w-5 h-5 stroke-[2.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Quiz Play</span>
                      <span className="text-[8.5px] text-cyan-600 font-black leading-none block">৳{(globalSettings.quizReward ?? 1).toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* 10. Investment Plans */}
                <div 
                  onClick={() => switchTab('investment-plans')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <TrendingUp className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Investment</span>
                    <span className="text-[8.5px] text-emerald-600 font-bold leading-none block">আয় বৃদ্ধি</span>
                  </div>
                </div>

                {/* 11. Refer & Earn */}
                <div 
                  onClick={() => switchTab('refer')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-[#764ba2] rounded-xl flex items-center justify-center text-white shadow-xs">
                        <UserPlus className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Refer</span>
                    <span className="text-[8.5px] text-[#764ba2] font-black leading-none block">৳{globalSettings.referBonusAmount !== undefined ? globalSettings.referBonusAmount : 10} বোনাস</span>
                  </div>
                </div>

                {/* 12. Daily Mission */}
                <div 
                  onClick={() => switchTab('mission')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-rose-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Gift className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Daily Task</span>
                    <span className="text-[8.5px] text-rose-500 font-bold leading-none block">মিশন</span>
                  </div>
                </div>

                {/* 13. Balance Transfer */}
                <div 
                  onClick={() => switchTab('transfer')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-cyan-550 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <ArrowLeftRight className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Transfer</span>
                    <span className="text-[8.5px] text-cyan-600 font-semibold leading-none block">পাঠান</span>
                  </div>
                </div>

                {/* 14. Wallet / Withdraw */}
                <div 
                  onClick={() => switchTab('wallet')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-teal-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-teal-550 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Wallet className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">My Wallet</span>
                    <span className="text-[8.5px] text-teal-600 font-bold leading-none block">টাকা উত্তোলন</span>
                  </div>
                </div>

                {/* 14.5 Watch Ads (Ads Income) */}
                <div 
                  onClick={() => switchTab('ads')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Play className="stroke-[2.5px] fill-white" size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Watch Ads</span>
                    <span className="text-[8.5px] text-red-600 font-bold leading-none block">বিজ্ঞাপন আয়</span>
                  </div>
                </div>

                {/* 14.6 Help & Customer Support */}
                <div 
                  onClick={() => switchTab('support')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <HelpCircle className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Support</span>
                    <span className="text-[8.5px] text-blue-600 font-bold leading-none block">সার্ভিস সাপোর্ট</span>
                  </div>
                </div>

                {/* 15. Nova Shop Gateway (if available) */}
                {onSwitchToNovaShop && (
                  <div 
                    onClick={() => {
                      if (globalSettings.novashopMaintenanceEnabled) {
                        setIsNovaShopMaintModalOpen(true);
                      } else {
                        onSwitchToNovaShop();
                      }
                    }}
                    className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-12 h-12 flex items-center justify-center relative rounded-2xl">
                        <div className="absolute inset-0 bg-violet-600/10 rounded-2xl blur-xs"></div>
                        <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-xs">
                          <ShoppingBag className="stroke-[2.5px]" size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Nova Shop</span>
                      <span className="text-[8.5px] text-violet-600 font-black leading-none block">PREMIUM</span>
                    </div>
                  </div>
                )}

                {/* Quick Task Custom Menu button */}
                <div 
                  onClick={() => switchTab('quick-tasks')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <TrendingUp className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5 font-sans">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Quick Task</span>
                    <span className="text-[8.5px] text-amber-600 font-black leading-none block">ফ্রি টাস্ক</span>
                  </div>
                </div>

                {/* Other Sites Custom Menu button */}
                <div 
                  onClick={() => switchTab('other-sites')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Globe className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5 font-sans">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Other Sites</span>
                    <span className="text-[8.5px] text-indigo-600 font-black leading-none block">অন্যান্য সাইট</span>
                  </div>
                </div>

                {/* Leaderboard Custom Menu button */}
                <div 
                  onClick={() => switchTab('leaderboard')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Trophy className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5 font-sans">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Leaderboard</span>
                    <span className="text-[8.5px] text-yellow-600 font-black leading-none block">সেরা আর্নার্স</span>
                  </div>
                </div>

                {/* Gift Code Custom Menu button */}
                <div 
                  onClick={() => switchTab('gift-code')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-rose-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Gift className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5 font-sans">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Gift Code</span>
                    <span className="text-[8.5px] text-rose-500 font-black leading-none block">গিফট কোড</span>
                  </div>
                </div>

                {/* Install App Custom Menu button */}
                <div 
                  onClick={() => switchTab('install-app')}
                  className="bg-white border border-stone-200/50 shadow-xs hover:border-stone-300 hover:shadow-xs rounded-[24px] p-3 flex flex-col items-center justify-between text-center gap-2 aspect-square cursor-pointer active:scale-95 transition-all"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xs"></div>
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-xs">
                        <Download className="stroke-[2.5px]" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5 font-sans">
                    <span className="font-extrabold text-[10.5px] sm:text-xs text-stone-850 tracking-tight leading-none block">Install App</span>
                    <span className="text-[8.5px] text-indigo-500 font-black leading-none block">ডাউনলোড করুন</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserPlus size={18} />
                </div>
                <span className="text-xl font-bold text-stone-800 font-sans">{userData?.totalRefers || 0}</span>
                <p className="text-stone-500 text-[11px] font-semibold mt-0.5">মোট রেফার</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wallet size={18} />
                </div>
                <span className="text-xl font-bold text-stone-800 font-sans">
                  ৳{globalSettings.minWithdraw}
                </span>
                <p className="text-stone-500 text-[11px] font-semibold mt-0.5">মিনিমাম পেমেন্ট</p>
              </div>
            </div>

            {(isAdsterraWatching || isAdWatching) && (
              <AdsterraScriptBanner scriptCode={globalSettings.adsterraScriptCode || ''} />
            )}

          </motion.div>
        )}

        {/* VIEW 2: REFER AND EARN */}
        {activeTab === 'refer' && (globalSettings.referMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <UserPlus size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.referMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের রেফারাল প্রোগ্রামটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <UserPlus className="text-[#764ba2]" size={20} />
              <span>রেফার করে আয় করুন (৳১০ বোনাস)</span>
            </h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-around bg-stone-50 p-4 rounded-2xl">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-[#764ba2] font-sans">{userData?.totalRefers || 0}</h3>
                  <p className="text-stone-500 text-xs">আপনার মোট রেফার</p>
                </div>
                <div className="w-px bg-stone-200 my-auto h-8"></div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-emerald-600 font-sans">৳১০</h3>
                  <p className="text-stone-500 text-xs">প্রতি রেফারে পুরস্কার</p>
                </div>
              </div>

              {(userData?.isActive || globalSettings.freeActivationEnabled) ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600 block pl-1">আপনার রেফার কোড:</label>
                    <div 
                      onClick={() => handleCopy(userData?.referCode || '', 'রেফার কোড কপি করা হয়েছে')}
                      className="border-2 border-dashed border-stone-300 hover:border-[#764ba2] p-4 rounded-2xl flex justify-between items-center bg-stone-50/50 cursor-pointer transition active:scale-[0.99]"
                    >
                      <span className="font-extrabold text-[#764ba2] text-lg font-mono">{userData?.referCode}</span>
                      <Copy size={16} className="text-[#764ba2]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600 block pl-1">রেফারেল রেজিস্ট্রেশন লিংক:</label>
                    <div 
                      onClick={() => handleCopy(`${globalSettings.referLink}?ref=${userData?.referCode || ''}`, 'লিংক কপি করা হয়েছে')}
                      className="border border-stone-200 p-4 rounded-2xl flex justify-between items-center bg-stone-50 cursor-pointer transition hover:bg-stone-100"
                    >
                      <span className="text-stone-500 text-xs truncate max-w-[80%] font-mono">
                        {globalSettings.referLink}?ref={userData?.referCode}
                      </span>
                      <Copy size={16} className="text-stone-400 shrink-0" />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const shareData = {
                        title: 'TakaHub Pro',
                        text: 'TakaHub Pro অ্যাপে জয়েন করে ক্যাম্পেইন টাস্ক সম্পন্ন করে প্রতিদিন টাকা আয় করুন!',
                        url: `${globalSettings.referLink}?ref=${userData?.referCode || ''}`
                      };
                      if (navigator.share) {
                        navigator.share(shareData).catch(() => {});
                      } else {
                        handleCopy(shareData.url, 'লিংক কপি করা হয়েছে');
                      }
                    }}
                    className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-bold py-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Share2 size={16} />
                    <span>বন্ধুদের সাথে শেয়ার করুন</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-6 bg-red-50/50 rounded-2xl border border-red-100 p-4">
                  <Lock size={28} className="text-red-500 mx-auto mb-2" />
                  <p className="text-stone-700 font-bold text-sm">রেফারিং লক করা আছে!</p>
                  <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                    রেফার করে আনলিমিটেড টাকা ইনকাম শুরু করতে প্রথমে আপনার একাউনটি {globalSettings.activationPrice || 100} টাকা ভেরিফিকেশন পেমেন্ট দিয়ে একটিভেট করুন।
                  </p>
                  <button 
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="mt-4 bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition"
                  >
                    এখনই একটিভ করুন
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* VIEW 3: BALANCE TRANSFER */}
        {activeTab === 'transfer' && (globalSettings.transferMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <ArrowLeftRight size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.transferMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ব্যালেন্স ট্রান্সফার সার্ভিসটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="text-[#764ba2]" size={20} />
              <span>ব্যালেন্স ট্রান্সফার</span>
            </h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="text-center py-2">
                <p className="text-stone-500 text-xs">আপনার ফোনে টাকা ট্রান্সফার করতে বলুন:</p>
                <div 
                  onClick={() => handleCopy(userId, 'ইউজার আইডি কপি হয়েছে')}
                  className="bg-[#764ba2]/5 hover:bg-[#764ba2]/10 p-3 rounded-2xl my-2 inline-flex items-center gap-2 cursor-pointer border border-[#764ba2]/15 transition active:scale-95"
                >
                  <span className="font-bold text-xs text-[#764ba2]">{userId}</span>
                  <Copy size={12} className="text-[#764ba2]" />
                </div>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">রিসিভারের আইডি (Receiver Full ID)</label>
                  <input 
                    type="text" 
                    placeholder="রিসিভারের আইডি এখানে পেস্ট করুন"
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold font-mono outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">টাকার পরিমাণ (৳)</label>
                  <input 
                    type="number" 
                    placeholder="সর্বনিম্ন ৫ টাকা পাঠান"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                    required
                  />
                </div>

                {transferMessage.text && (
                  <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${transferMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    {transferMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{transferMessage.text}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-2xl transition disabled:opacity-55 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingTransfer ? 'প্রসেসিং হচ্ছে...' : '৳ ব্যালেন্স পাঠান'}
                </button>
              </form>
            </div>
          </motion.div>
        ))}

        {/* VIEW 4: WALLET / MONEY WITHDRAWAL */}
        {activeTab === 'wallet' && (globalSettings.withdrawMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <Wallet size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.withdrawMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ওয়ালেট উইথড্রয়াল পেমেন্ট সার্ভিসটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <Wallet className="text-[#764ba2]" size={20} />
              <span>টাকা উত্তোলন (পেমেন্ট রিকোয়েস্ট)</span>
            </h2>

            {/* Main Balance Display Card above withdrawal system */}
            <div className="bg-gradient-to-r from-[#764ba2] to-[#5a3b80] p-5 rounded-3xl text-white shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-purple-200 block">আপনার মূল ব্যালেন্স (Main Balance)</span>
                <span className="text-3xl font-black font-mono">৳{(userData?.balance || 0).toFixed(2)}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <Coins size={22} className="text-white shrink-0 animate-pulse" />
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex bg-indigo-50/50 p-4 rounded-2xl items-center gap-3">
                <Coins size={20} className="text-[#764ba2] shrink-0" />
                <div className="text-xs leading-relaxed text-stone-700">
                  সর্বনিম্ন উইথড্র লিমিট: <strong className="text-[#764ba2]">৳{globalSettings.minWithdraw}</strong>. পেমেন্ট রিকোয়েস্ট দেওয়ার ২৪ ঘন্টার মধ্যে আপনার bKash/Nagad ওয়ালেটে টাকা পৌঁছে যাবে।
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* 1. Withdraw Method Dropdown Box */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-stone-700 block pl-1">ওয়ালেট নির্বাচন করুন (Select Wallet)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMethodDropdownOpen(!isMethodDropdownOpen);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="w-full bg-stone-50 border-2 border-stone-150 rounded-2xl p-4 font-bold text-left text-xs text-stone-700 transition flex items-center justify-between cursor-pointer hover:bg-stone-100/50"
                  >
                    <div className="flex items-center gap-2">
                      {withdrawMethod === 'Bkash' ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
                          <span className="font-extrabold text-[#E2136E]">bKash (বিকাশ)</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
                          <span className="font-extrabold text-[#F7941D]">Nagad (নগদ)</span>
                        </>
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-stone-400 transition-transform duration-200 ${isMethodDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMethodDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="absolute z-30 w-full mt-1 bg-white border-2 border-stone-150 rounded-2xl shadow-md p-2 space-y-1"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawMethod('Bkash');
                          setIsMethodDropdownOpen(false);
                        }}
                        className={`w-full p-3.5 rounded-xl cursor-pointer text-left text-xs font-bold transition flex items-center gap-3.5 ${withdrawMethod === 'Bkash' ? 'bg-[#E2136E]/10 text-[#E2136E]' : 'text-stone-605 text-stone-600 hover:bg-stone-50'}`}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#E2136E]" />
                        bKash (বিকাশ)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawMethod('Nagad');
                          setIsMethodDropdownOpen(false);
                        }}
                        className={`w-full p-3.5 rounded-xl cursor-pointer text-left text-xs font-bold transition flex items-center gap-3.5 ${withdrawMethod === 'Nagad' ? 'bg-[#F7941D]/10 text-[#F7941D]' : 'text-stone-605 text-stone-600 hover:bg-stone-50'}`}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#F7941D]" />
                        Nagad (নগদ)
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* 2. Balance Category Dropdown Box */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-stone-700 block pl-1">উৎস ব্যালেন্স নির্বাচন করুন (Select Balance Category)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                      setIsMethodDropdownOpen(false);
                    }}
                    className="w-full bg-stone-50 border-2 border-stone-150 rounded-2xl p-4 font-bold text-left text-xs text-stone-700 transition flex items-center justify-between cursor-pointer hover:bg-stone-100/50 font-sans"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="font-extrabold capitalize text-stone-800">
                        {
                          withdrawBalanceType === 'main' ? 'Main balance (মূল ব্যালেন্স)' :
                          withdrawBalanceType === 'gmail' ? 'Gmail Balance' :
                          withdrawBalanceType === 'telegram' ? 'Telegram Balance' :
                          withdrawBalanceType === 'whatsapp' ? 'WhatsApp Balance' :
                          withdrawBalanceType === 'facebook' ? 'Facebook Balance' :
                          withdrawBalanceType === 'instagram' ? 'Instagram Balance' :
                          'Ads/Adsterra Balance'
                        }
                      </span>
                      <span className="text-indigo-600 font-extrabold text-[10.5px] bg-indigo-50 px-2.5 py-0.5 rounded-md font-mono">
                        ৳{
                          withdrawBalanceType === 'main' ? (userData?.balance || 0).toFixed(2) :
                          withdrawBalanceType === 'gmail' ? (userData?.gmailBalance || 0).toFixed(2) :
                          withdrawBalanceType === 'telegram' ? (userData?.telegramBalance || 0).toFixed(2) :
                          withdrawBalanceType === 'whatsapp' ? (userData?.whatsappBalance || 0).toFixed(2) :
                          withdrawBalanceType === 'facebook' ? (userData?.facebookBalance || 0).toFixed(2) :
                          withdrawBalanceType === 'instagram' ? (userData?.instagramBalance || 0).toFixed(2) :
                          (userData?.adsBalance || 0).toFixed(2)
                        }
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-stone-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="absolute z-20 w-full mt-1 bg-white border-2 border-stone-150 rounded-2xl shadow-md p-2 space-y-1 max-h-64 overflow-y-auto font-sans"
                    >
                      {[
                        { type: 'main', label: 'Main balance (মূল ব্যালেন্স)', bal: userData?.balance || 0, min: globalSettings.minWithdraw || 50 },
                        { type: 'gmail', label: 'Gmail Balance', bal: userData?.gmailBalance || 0, min: globalSettings.minWithdrawGmail || 50 },
                        { type: 'telegram', label: 'Telegram Balance', bal: userData?.telegramBalance || 0, min: globalSettings.minWithdrawTelegram || 50 },
                        { type: 'whatsapp', label: 'WhatsApp Balance', bal: userData?.whatsappBalance || 0, min: globalSettings.minWithdrawWhatsapp || 50 },
                        { type: 'facebook', label: 'Facebook Balance', bal: userData?.facebookBalance || 0, min: globalSettings.minWithdrawFacebook || 50 },
                        { type: 'instagram', label: 'Instagram Balance', bal: userData?.instagramBalance || 0, min: globalSettings.minWithdrawInstagram || 50 },
                        { type: 'ads', label: 'Ads/Adsterra Balance', bal: userData?.adsBalance || 0, min: globalSettings.minWithdrawAds || 50 }
                      ].map((item) => (
                        <button 
                          key={item.type}
                          type="button"
                          onClick={() => {
                            setWithdrawBalanceType(item.type as any);
                            setWithdrawAmount('');
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl cursor-pointer text-left text-xs transition flex justify-between items-center ${withdrawBalanceType === item.type ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'text-stone-600 hover:bg-stone-50 font-bold'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="block truncate text-stone-750">{item.label}</span>
                            <span className="text-[9px] text-stone-400 font-semibold bg-stone-100 rounded px-1.5 py-0.5 leading-none">Min: ৳{item.min}</span>
                          </div>
                          <strong className="text-stone-850 font-mono text-xs">৳{item.bal.toFixed(2)}</strong>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">মোবাইল নম্বর</label>
                  <input 
                    type="number" 
                    placeholder="017xxxxxxxx"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-extrabold outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-stone-700 block pl-1">টাকার পরিমাণ (৳)</label>
                  <input 
                    type="number" 
                    placeholder={`মিনিমাম ৳${
                      withdrawBalanceType === 'gmail' ? (globalSettings.minWithdrawGmail || 50) : 
                      withdrawBalanceType === 'telegram' ? (globalSettings.minWithdrawTelegram || 50) : 
                      withdrawBalanceType === 'whatsapp' ? (globalSettings.minWithdrawWhatsapp || 50) : 
                      withdrawBalanceType === 'facebook' ? (globalSettings.minWithdrawFacebook || 50) : 
                      withdrawBalanceType === 'instagram' ? (globalSettings.minWithdrawInstagram || 50) : 
                      withdrawBalanceType === 'ads' ? (globalSettings.minWithdrawAds || 50) :
                      (globalSettings.minWithdraw || 50)
                    }`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                    required
                  />
                </div>

                {/* Real-time Withdrawal Fee Calculation Screen details */}
                {parseFloat(withdrawAmount) > 0 && !isNaN(parseFloat(withdrawAmount)) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-stone-50 border-2 border-dashed border-stone-200/80 p-4 rounded-2xl space-y-2 font-sans overflow-hidden"
                  >
                    <div className="flex justify-between text-xs font-bold text-stone-500">
                      <span>উত্তোলন টোটাল :</span>
                      <span className="font-mono text-stone-750">৳{parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                    {globalSettings.withdrawFeePercent ? (
                      <div className="flex justify-between text-xs font-semibold text-stone-500">
                        <span>উইথড্র চার্জ ফি ({globalSettings.withdrawFeePercent}%):</span>
                        <span className="font-mono text-red-500">-৳{((parseFloat(withdrawAmount) * globalSettings.withdrawFeePercent) / 100).toFixed(2)}</span>
                      </div>
                    ) : null}
                    <div className="border-t border-stone-150 pt-2.5 mt-1 flex justify-between text-xs font-black text-stone-850">
                      <span>আপনি পাবেন (নিট পেমেন্ট):</span>
                      <span className="font-mono text-emerald-600 text-sm">৳{(parseFloat(withdrawAmount) - ((parseFloat(withdrawAmount) * (globalSettings.withdrawFeePercent || 0)) / 100)).toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}

                {withdrawMessage.text && (
                  <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${withdrawMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    {withdrawMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{withdrawMessage.text}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingWithdraw ? 'পাঠানো হচ্ছে...' : '৳ উইথড্র রিকোয়েস্ট পাঠাবো'}
                </button>
              </form>
            </div>

            {/* Withdrawal History Card to behave like Gmail Sell History */}
            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <button 
                type="button"
                onClick={() => handleFetchHistory('withdraw')}
                className="w-full bg-white hover:bg-stone-50 text-stone-700 border-2 border-stone-150 font-bold py-3 rounded-2xl shadow-2xs transition flex items-center justify-center gap-1.5 text-xs font-sans cursor-pointer"
              >
                <History size={13} />
                <span>উইথড্র হিস্টোরি (লগ)</span>
              </button>
            </div>
          </motion.div>
        ))}

        {/* VIEW 5: DAILY MISSION */}
        {activeTab === 'mission' && (globalSettings.missionsMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <Gift size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.missionsMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ডেইলি মিশন সার্ভিসটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <Gift className="text-[#764ba2]" size={20} />
              <span>ডেইলি মিশন টাস্ক</span>
            </h2>

            {missions.length === 0 ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl text-center shadow-xs">
                <Gift className="text-stone-300 mx-auto mb-2" size={36} />
                <p className="text-stone-500 text-sm">বর্তমানে কোনো একটিভ মিশন এড করা নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {missions.map(m => {
                  const isClaimed = userData?.missions?.[m.id];
                  const progress = userData?.totalRefers || 0;
                  const isCompleted = progress >= m.target;

                  return (
                    <div key={m.id} className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-extrabold text-stone-800 text-sm">{m.title}</h4>
                          <span className="text-xs text-stone-500 font-semibold block mt-1">
                            টার্গেট: {m.target} জন রেফার (বর্তমান: {progress})
                          </span>
                        </div>
                        <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-3 py-1 rounded-full">
                          +৳{m.reward}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-4">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((progress / m.target) * 100, 100)}%` }}
                        ></div>
                      </div>

                      {isClaimed ? (
                        <button disabled className="w-full bg-stone-100 text-stone-400 py-3 rounded-2xl text-xs font-bold cursor-not-allowed">
                          রিওয়ার্ড অলরেডি সংগ্রহ করেছেন ✔
                        </button>
                      ) : isCompleted ? (
                        <button 
                          onClick={() => claimMissionReward(m)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-extrabold shadow-md transition"
                        >
                          ৳{m.reward} মিশন বোনাস নিই
                        </button>
                      ) : (
                        <button disabled className="w-full bg-stone-50 text-stone-400 py-3 border border-stone-150 rounded-2xl text-xs font-bold cursor-not-allowed">
                          {m.target - progress} জন রেফার প্রয়োজন
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ))}

        {/* VIEW 6: GMAIL SELL */}
        {activeTab === 'gmail-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-black text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">Gmail Sell Option</span>
            </div>

            {/* Top Announcement notice */}
            <div className="bg-[#ea4335] text-white font-black text-[10.5px] py-1.5 px-3 rounded-xl text-center shadow-2xs select-none leading-relaxed flex items-center justify-center gap-1.5">
              <span>📢 আপনার জিমেইল আইডি কালেক্ট হওয়ার ১৫-৩০ ঘণ্টা মধ্যে রিপোর্ট & পেমেন্ট পাবেন, ইনশাআল্লাহ।</span>
            </div>

            {/* Tutorial Badge button resembling screenshot */}
            <div className="flex justify-center mt-1">
              <a 
                href={globalSettings.gmailTutorialUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!globalSettings.gmailTutorialUrl) {
                    e.preventDefault();
                    triggerToast('⚠️ দুঃখিত, এখনও কোনো টিউটোরিয়াল ভিডিও যুক্ত করা হয়নি!', 'error');
                  }
                }}
                className="bg-[#ea4335]/15 border border-[#ea4335]/25 px-5 py-2 rounded-full flex items-center gap-2 shadow-2xs cursor-pointer hover:bg-[#ea4335]/20 transition-all font-sans"
              >
                <img src="https://img.icons8.com/color/48/gmail-new.png" className="w-5 h-5 shrink-0" alt="gmail icon" />
                <span className="text-[10px] text-[#ea4335] font-black">জিআইএমইএল সেল টিউটোরিয়াল!</span>
                <div className="bg-red-600 p-1 rounded-full text-white flex items-center justify-center w-4 h-4 shadow-sm animate-pulse">
                  <Play size={8} className="fill-white text-white translate-x-[0.5px]" />
                </div>
              </a>
            </div>

            <div className="space-y-4">
              {globalSettings.gmailMaintenanceEnabled ? (
                <div className="bg-white border border-stone-200 p-8 rounded-[28px] text-center py-6 flex flex-col items-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                    <AlertOctagon size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h4>
                  <p className="text-stone-600 text-xs text-center font-medium bg-amber-50 border border-amber-200/55 p-3 rounded-xl max-w-sm leading-relaxed">
                    {globalSettings.gmailMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের জিমেইল বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Gmail Gradient Card */}
                  <div className="bg-gradient-to-r from-[#ea4335] to-[#c5221f] text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                    <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-center mb-1">
                      <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner">
                        <Mail size={20} className="text-white" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                      <Mail size={13} /> Gmail Sell
                    </h3>
                    <p className="text-white/85 text-[10.5px] font-bold mt-1">সহজেই জিমেইল সেল করে টাকা আয় করুন</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center">
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Rate</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">৳{(globalSettings.gmailPrice || 16.0).toFixed(2)}</strong>
                      </div>
                      <div className="border-x border-white/15">
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Limit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">
                          {globalSettings.gmailDailyLimit && globalSettings.gmailDailyLimit > 0 ? globalSettings.gmailDailyLimit : 'Unlimit'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Submit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">{submittedCount24h}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Today's Password Section */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-white border-2 border-stone-150 rounded-[22px] p-4 flex justify-between items-center relative shadow-3xs overflow-hidden">
                      <div className="text-left">
                        <span className="text-[10px] text-stone-500 font-extrabold block">Today's Password:</span>
                        <span className="font-sans font-black text-sm text-[#ea4335] select-all mt-0.5 block tracking-wide">
                          {globalSettings.gmailOpenPass || 'Shihab@2025#'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(globalSettings.gmailOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                        className="bg-[#ea4335] hover:bg-red-800 text-white text-[9.5px] font-black py-2 px-3.5 rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy size={9} /> Copy Password
                      </button>
                    </div>
                  )}

                  {/* Gmail Sell Form and History Wrapper */}
                  <div className="bg-white border border-stone-200/80 p-5 rounded-[28px] shadow-sm space-y-4">
                    <form onSubmit={handleGmailSell} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-stone-700 block pl-1">জিমেইল এড্রেস (Registered Gmail)</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-stone-400">
                            <Mail size={15} />
                          </span>
                          <input 
                            type="email" 
                            placeholder="example@gmail.com"
                            value={gmailEmail}
                            onChange={(e) => setGmailEmail(e.target.value)}
                            className="w-full bg-stone-50/70 border-2 border-stone-150 focus:border-[#ea4335] focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none transition shadow-2xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-stone-700 block pl-1">পাসওয়ার্ড (Gmail Password)</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-stone-400">
                            <Lock size={15} />
                          </span>
                          <input 
                            type="text" 
                            placeholder="আপনার জিমেইল পাসওয়ার্ড লিখুন"
                            value={gmailPassword}
                            onChange={(e) => setGmailPassword(e.target.value)}
                            className="w-full bg-stone-50/70 border-2 border-stone-150 focus:border-[#ea4335] focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none transition shadow-2xs"
                            required
                          />
                        </div>
                      </div>

                      {/* Warning box */}
                      <div className="bg-rose-50 border border-rose-150/70 p-3 rounded-2xl text-[10px] text-rose-700 font-semibold flex items-center gap-2">
                        <AlertCircle size={14} className="text-[#ea4335] shrink-0" />
                        <span>রিপোর্ট টাইম: ১৫-৩০ ঘণ্টা</span>
                      </div>

                      {globalSettings.gmailLastDate && (
                        <div className={`p-3 rounded-2xl border text-[10.5px] font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.gmailLastDate) ? 'bg-red-50 border-red-250 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                          <span className="text-[9.5px] text-slate-500">🕒 সাবমিট করার শেষ সময়:</span>
                          <span className="font-extrabold text-[11px] leading-none text-slate-800">{formatDeadline(globalSettings.gmailLastDate)}</span>
                          <DeadlineCountdown deadlineStr={globalSettings.gmailLastDate} />
                        </div>
                      )}

                      {gmailMessage.text && (
                        <div className={`p-3.5 rounded-2xl text-[10px] font-bold leading-relaxed flex items-center gap-2 ${gmailMessage.type === 'success' ? 'bg-emerald-50 text-emerald-850 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                          {gmailMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                          <span>{gmailMessage.text}</span>
                        </div>
                      )}

                      {/* Admin Guidelines / Custom Texts */}
                      {socialTexts.filter(t => t.platform === 'gmail').length > 0 && (
                        <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 space-y-2 text-left">
                          <h5 className="font-extrabold text-stone-850 text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#ea4335] rounded-full"></span>
                            বিশেষ নির্দেশাবলী:
                          </h5>
                          <ul className="list-disc pl-4 text-stone-600 text-[11px] space-y-1 font-semibold leading-relaxed">
                            {socialTexts.filter(t => t.platform === 'gmail').map(t => (
                              <li key={t.id}>{t.text}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isSubmittingGmail}
                        className="w-full bg-[#ea4335] hover:bg-[#c5221f] text-white font-extrabold py-3.5 rounded-2xl shadow-md transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
                      >
                        {isSubmittingGmail ? 'জমা হচ্ছে...' : 'Submit Gmail Account'}
                      </button>
                    </form>

                    <button 
                      type="button"
                      onClick={() => handleFetchHistory('gmail')}
                      className="w-full bg-white hover:bg-stone-50 text-stone-700 border-2 border-stone-150 font-bold py-3 rounded-2xl shadow-2xs transition flex items-center justify-center gap-1.5 text-xs font-sans cursor-pointer"
                    >
                      <History size={13} />
                      <span>Gmail Sell History (লগ)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: TELEGRAM SELL */}
        {activeTab === 'telegram-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">Telegram Sell Option</span>
            </div>

            {/* Tutorial Badge button resembling screenshot */}
            <div className="flex justify-center mt-1">
              <a 
                href={globalSettings.telegramTutorialUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!globalSettings.telegramTutorialUrl) {
                    e.preventDefault();
                    triggerToast('⚠️ দুঃখিত, এখনও কোনো টিউটোরিয়াল ভিডিও যুক্ত করা হয়নি!', 'error');
                  }
                }}
                className="bg-[#0088cc]/15 border border-[#0088cc]/25 px-5 py-2 rounded-full flex items-center gap-2 shadow-3xs cursor-pointer hover:bg-[#0088cc]/20 transition-all font-sans"
              >
                <img src="https://img.icons8.com/color/48/telegram-app.png" className="w-5 h-5 shrink-0" alt="telegram icon" />
                <span className="text-[10px] text-[#0088cc] font-black">টেলিগ্রাম সেল টিউটোরিয়াল!</span>
                <div className="bg-[#0088cc] p-1 rounded-full text-white flex items-center justify-center w-4 h-4 shadow-sm animate-pulse">
                  <Play size={8} className="fill-white text-white translate-x-[0.5px]" />
                </div>
              </a>
            </div>

            <div className="space-y-4">
              {globalSettings.telegramMaintenanceEnabled ? (
                <div className="bg-white border border-stone-200 p-8 rounded-[28px] text-center py-6 flex flex-col items-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                    <AlertOctagon size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h4>
                  <p className="text-stone-600 text-xs text-center font-medium bg-amber-50 border border-amber-200/55 p-3 rounded-xl max-w-sm leading-relaxed">
                    {globalSettings.telegramMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের টেলিগ্রাম বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Telegram Gradient Card */}
                  <div className="bg-gradient-to-r from-[#0088cc] to-[#229ed9] text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                    <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-center mb-1">
                      <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner">
                        <Send size={20} className="text-white rotate-45 -translate-x-[1px] translate-y-[1px]" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                      Telegram Sell
                    </h3>
                    <p className="text-white/85 text-[10.5px] font-bold mt-1">টেলিগ্রাম নাম্বার বিক্রি করে সহজে আয় করুন</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center">
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Rate</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">৳{(globalSettings.telegramPrice || 20.0).toFixed(2)}</strong>
                      </div>
                      <div className="border-x border-white/15">
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Limit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">
                          {globalSettings.telegramDailyLimit && globalSettings.telegramDailyLimit > 0 ? globalSettings.telegramDailyLimit : 'Unlimit'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Submit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">{submittedCount24h}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Today's Password Section */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-white border-2 border-stone-150 rounded-[22px] p-4 flex justify-between items-center relative shadow-3xs overflow-hidden">
                      <div className="text-left">
                        <span className="text-[10px] text-stone-500 font-extrabold block">Today's Password:</span>
                        <span className="font-sans font-black text-sm text-[#0088cc] select-all mt-0.5 block tracking-wide">
                          {globalSettings.telegramOpenPass || 'Shihab@2025#'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(globalSettings.telegramOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                        className="bg-[#0088cc] hover:bg-[#0077b5] text-white text-[9.5px] font-black py-2 px-3.5 rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy size={9} /> Copy Password
                      </button>
                    </div>
                  )}

                  {/* Telegram Sell Form and History Wrapper */}
                  <div className="bg-white border border-stone-200/80 p-5 rounded-[28px] shadow-sm space-y-4">
                    <form onSubmit={handleTelegramSell} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-stone-700 block pl-1">টেলিগ্রাম ফোন নাম্বার (+৮৮০ সহ)</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-stone-400">
                            <Phone size={15} />
                          </span>
                          <input 
                            type="tel" 
                            placeholder="+88017XXXXXXXX"
                            value={telegramNumber}
                            onChange={(e) => setTelegramNumber(e.target.value)}
                            className="w-full bg-stone-50/70 border-2 border-stone-150 focus:border-[#0088cc] focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none transition shadow-2xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-stone-700 block pl-1">অতিরিক্ত তথ্য / ২FA / পাসওয়ার্ড</label>
                        <div className="relative flex items-start">
                          <textarea 
                            placeholder="অ্যাকাউন্টের ২-ফ্যাক্টর পাসওয়ার্ড বা অতিরিক্ত নির্দেশাবলী এখানে লিখুন (বিকল্প)"
                            value={telegramDetails}
                            onChange={(e) => setTelegramDetails(e.target.value)}
                            className="w-full bg-stone-50/70 border-2 border-stone-150 focus:border-[#0088cc] focus:bg-white rounded-2xl p-4 text-xs font-bold outline-none transition shadow-2xs resize-none"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Warning box */}
                      <div className="bg-rose-50 border border-rose-150/70 p-3 rounded-2xl text-[10px] text-rose-700 font-black flex items-center gap-2">
                        <AlertCircle size={14} className="text-[#0088cc] shrink-0" />
                        <span>রিপোর্ট টাইম: ১৫-৩০ ঘণ্টা</span>
                      </div>

                      {globalSettings.telegramLastDate && (
                        <div className={`p-3 rounded-2xl border text-[10.5px] font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.telegramLastDate) ? 'bg-red-50 border-red-250 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                          <span className="text-[9px] text-slate-500">🕒 সাবমিট করার শেষ সময়:</span>
                          <span className="font-extrabold text-[11px] leading-none text-slate-800">{formatDeadline(globalSettings.telegramLastDate)}</span>
                          <DeadlineCountdown deadlineStr={globalSettings.telegramLastDate} />
                        </div>
                      )}

                      {telegramMessage.text && (
                        <div className={`p-3.5 rounded-2xl text-[10px] font-bold leading-relaxed flex items-center gap-2 ${telegramMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                          {telegramMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                          <span>{telegramMessage.text}</span>
                        </div>
                      )}

                      {/* Admin Guidelines / Custom Texts */}
                      {socialTexts.filter(t => t.platform === 'telegram').length > 0 && (
                        <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 space-y-2 text-left">
                          <h5 className="font-extrabold text-stone-850 text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#0088cc] rounded-full"></span>
                            বিশেষ নির্দেশাবলী:
                          </h5>
                          <ul className="list-disc pl-4 text-stone-600 text-[11px] space-y-1 font-semibold leading-relaxed">
                            {socialTexts.filter(t => t.platform === 'telegram').map(t => (
                              <li key={t.id}>{t.text}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isSubmittingTelegram}
                        className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold py-3.5 rounded-2xl shadow-md transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
                      >
                        {isSubmittingTelegram ? 'জমা হচ্ছে...' : 'Submit Telegram Account'}
                      </button>
                    </form>

                    <button 
                      type="button"
                      onClick={() => handleFetchHistory('telegram')}
                      className="w-full bg-white hover:bg-stone-50 text-stone-700 border-2 border-stone-150 font-bold py-3 rounded-2xl shadow-2xs transition flex items-center justify-center gap-1.5 text-xs font-sans cursor-pointer"
                    >
                      <History size={13} />
                      <span>Telegram Sell History (লগ)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: WHATSAPP SELL JUNK */}
        {activeTab === 'whatsapp-sell-junk' && (
          <div className="hidden">
          </div>
        )}

        {/* VIEW: WHATSAPP SELL */}
        {activeTab === 'whatsapp-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">WhatsApp Sell Option</span>
            </div>

            {/* Tutorial Badge button resembling screenshot */}
            <div className="flex justify-center mt-1">
              <a 
                href={globalSettings.whatsappTutorialUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!globalSettings.whatsappTutorialUrl) {
                    e.preventDefault();
                    triggerToast('⚠️ দুঃখিত, এখনও কোনো টিউটোরিয়াল ভিডিও যুক্ত করা হয়নি!', 'error');
                  }
                }}
                className="bg-[#25D366]/15 border border-[#25D366]/25 px-5 py-2 rounded-full flex items-center gap-2 shadow-3xs cursor-pointer hover:bg-[#25D366]/20 transition-all font-sans"
              >
                <img src="https://img.icons8.com/color/48/whatsapp.png" className="w-5 h-5 shrink-0" alt="whatsapp icon" />
                <span className="text-[10px] text-[#128C7E] font-black">হোয়াটসঅ্যাপ সেল টিউটোরিয়াল!</span>
                <div className="bg-[#25D366] p-1 rounded-full text-white flex items-center justify-center w-4 h-4 shadow-sm animate-pulse">
                  <Play size={8} className="fill-white text-white translate-x-[0.5px]" />
                </div>
              </a>
            </div>

            <div className="space-y-4">
              {globalSettings.whatsappMaintenanceEnabled ? (
                <div className="bg-white border border-stone-200 p-8 rounded-[28px] text-center py-6 flex flex-col items-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                    <AlertOctagon size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h4>
                  <p className="text-stone-600 text-xs text-center font-medium bg-amber-50 border border-amber-200/55 p-3 rounded-xl max-w-sm leading-relaxed">
                    {globalSettings.whatsappMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের হোয়াটসঅ্যাপ বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                  </p>
                </div>
              ) : (
                <>
                  {/* WhatsApp Gradient Card */}
                  <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                    <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-center mb-1">
                      <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                      WhatsApp Sell
                    </h3>
                    <p className="text-white/85 text-[10.5px] font-bold mt-1">হোয়াটসঅ্যাপ নাম্বার বিক্রি করে সহজে আয় করুন</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center">
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Rate</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">৳{(globalSettings.whatsappPrice || 35.0).toFixed(2)}</strong>
                      </div>
                      <div className="border-x border-white/15">
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Limit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">
                          {globalSettings.whatsappDailyLimit && globalSettings.whatsappDailyLimit > 0 ? globalSettings.whatsappDailyLimit : 'Unlimit'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Submit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">{submittedCount24h}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Today's Password Section */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-white border-2 border-stone-150 rounded-[22px] p-4 flex justify-between items-center relative shadow-3xs overflow-hidden">
                      <div className="text-left">
                        <span className="text-[10px] text-stone-500 font-extrabold block">Today's Password:</span>
                        <span className="font-sans font-black text-sm text-[#128C7E] select-all mt-0.5 block tracking-wide">
                          {globalSettings.whatsappOpenPass || 'Shihab@2025#'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(globalSettings.whatsappOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                        className="bg-[#2a9d8f] hover:bg-[#128c7e] text-white text-[9.5px] font-black py-2 px-3.5 rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy size={9} /> Copy Password
                      </button>
                    </div>
                  )}

                  {/* WhatsApp Sell Form and History Wrapper */}
                  <div className="bg-white border border-stone-200/80 p-5 rounded-[28px] shadow-sm space-y-4">
                    <form onSubmit={handleWhatsappSell} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-stone-700 block pl-1">হোয়াটসঅ্যাপ ফোন নাম্বার (+৮৮০ সহ)</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-stone-400">
                            <Phone size={15} />
                          </span>
                          <input 
                            type="tel" 
                            placeholder="+88017XXXXXXXX"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            className="w-full bg-stone-50/70 border-2 border-stone-150 focus:border-[#128C7E] focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none transition shadow-2xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-stone-700 block pl-1">অেরিরিক্ত তথ্য / ২FA / পাসওয়ার্ড</label>
                        <div className="relative flex items-start">
                          <textarea 
                            placeholder="অ্যাকাউন্টের ২-ফ্যাক্টর পাসওয়ার্ড বা অতিরিক্ত নির্দেশাবলী এখানে লিখুন (বিকল্প)"
                            value={whatsappDetails}
                            onChange={(e) => setWhatsappDetails(e.target.value)}
                            className="w-full bg-stone-50/70 border-2 border-stone-150 focus:border-[#128C7E] focus:bg-white rounded-2xl p-4 text-xs font-bold outline-none transition shadow-2xs resize-none"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Warning box */}
                      <div className="bg-rose-50 border border-rose-150/70 p-3 rounded-2xl text-[10px] text-rose-700 font-black flex items-center gap-2">
                        <AlertCircle size={14} className="text-[#128C7E] shrink-0" />
                        <span>রিপোর্ট টাইম: ১৫-৩০ ঘণ্টা</span>
                      </div>

                      {globalSettings.whatsappLastDate && (
                        <div className={`p-3 rounded-2xl border text-[10.5px] font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.whatsappLastDate) ? 'bg-red-50 border-red-250 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                          <span className="text-[9px] text-slate-500">🕒 সাবমিট করার শেষ সময়:</span>
                          <span className="font-extrabold text-[11px] leading-none text-slate-800">{formatDeadline(globalSettings.whatsappLastDate)}</span>
                          <DeadlineCountdown deadlineStr={globalSettings.whatsappLastDate} />
                        </div>
                      )}

                      {whatsappMessage.text && (
                        <div className={`p-3.5 rounded-2xl text-[10px] font-bold leading-relaxed flex items-center gap-2 ${whatsappMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                          {whatsappMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                          <span>{whatsappMessage.text}</span>
                        </div>
                      )}

                      {/* Admin Guidelines / Custom Texts */}
                      {socialTexts.filter(t => t.platform === 'whatsapp').length > 0 && (
                        <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 space-y-2 text-left">
                          <h5 className="font-extrabold text-stone-850 text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#128C7E] rounded-full"></span>
                            বিশেষ নির্দেশাবলী:
                          </h5>
                          <ul className="list-disc pl-4 text-stone-600 text-[11px] space-y-1 font-semibold leading-relaxed">
                            {socialTexts.filter(t => t.platform === 'whatsapp').map(t => (
                              <li key={t.id}>{t.text}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isSubmittingWhatsapp}
                        className="w-full bg-[#128C7E] hover:bg-[#0f7367] text-white font-extrabold py-3.5 rounded-2xl shadow-md transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
                      >
                        {isSubmittingWhatsapp ? 'জমা হচ্ছে...' : 'Submit WhatsApp Account'}
                      </button>
                    </form>

                    <button 
                      type="button"
                      onClick={() => handleFetchHistory('whatsapp')}
                      className="w-full bg-white hover:bg-stone-50 text-stone-700 border-2 border-stone-150 font-bold py-3 rounded-2xl shadow-2xs transition flex items-center justify-center gap-1.5 text-xs font-sans cursor-pointer"
                    >
                      <History size={13} />
                      <span>WhatsApp Sell History (লগ)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: FACEBOOK SELL */}
        {activeTab === 'facebook-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">Facebook Sell Option</span>
            </div>

            {/* Tutorial Badge button resembling screenshot */}
            <div className="flex justify-center mt-1">
              <a 
                href={globalSettings.facebookTutorialUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!globalSettings.facebookTutorialUrl) {
                    e.preventDefault();
                    triggerToast('⚠️ দুঃখিত, এখনও কোনো টিউটোরিয়াল ভিডিও যুক্ত করা হয়নি!', 'error');
                  }
                }}
                className="bg-[#1877F2]/15 border border-[#1877F2]/25 px-5 py-2 rounded-full flex items-center gap-2 shadow-2xs cursor-pointer hover:bg-[#1877F2]/20 transition-all"
              >
                <img src="https://img.icons8.com/color/48/facebook-new.png" className="w-5 h-5 shrink-0" alt="facebook icon" />
                <span className="text-[10px] text-[#1877F2] font-black">ফেসবুক সেল টিউটোরিয়াল!</span>
                <div className="bg-[#1877F2] p-1 rounded-full text-white flex items-center justify-center w-4 h-4 shadow-sm animate-pulse">
                  <Play size={8} className="fill-white text-white translate-x-[0.5px]" />
                </div>
              </a>
            </div>

            <div className="space-y-4">
              {globalSettings.facebookMaintenanceEnabled ? (
                <div className="bg-white border border-stone-200 p-8 rounded-[28px] text-center py-6 flex flex-col items-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                    <AlertOctagon size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h4>
                  <p className="text-stone-600 text-xs text-center font-medium bg-amber-50 border border-amber-200/55 p-3 rounded-xl max-w-sm leading-relaxed">
                    {globalSettings.facebookMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ফেসবুক বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Facebook Gradient Card */}
                  <div className="bg-gradient-to-r from-[#1877F2] to-[#3b5998] text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                    <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-center mb-1">
                      <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner font-sans font-black text-xl">
                        F
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                      Facebook Sell
                    </h3>
                    <p className="text-white/85 text-[10.5px] font-bold mt-1">ফেসবুক একাউন্ট বিক্রি করে সহজে আয় করুন</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center">
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Rate</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">৳{(globalSettings.facebookPrice || 25.0).toFixed(2)}</strong>
                      </div>
                      <div className="border-x border-white/15">
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Limit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">
                          {globalSettings.facebookDailyLimit && globalSettings.facebookDailyLimit > 0 ? globalSettings.facebookDailyLimit : 'Unlimit'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Submit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">{submittedCount24h}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Today's Password Section */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-white border-2 border-stone-150 rounded-[22px] p-4 flex justify-between items-center relative shadow-3xs overflow-hidden">
                      <div className="text-left">
                        <span className="text-[10px] text-stone-500 font-extrabold block">Today's Password:</span>
                        <span className="font-sans font-black text-sm text-[#1877F2] select-all mt-0.5 block tracking-wide">
                          {globalSettings.facebookOpenPass || 'Shihab@2025#'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(globalSettings.facebookOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                        className="bg-[#1877F2] hover:bg-blue-800 text-white text-[9.5px] font-black py-2 px-3.5 rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy size={9} /> Copy Password
                      </button>
                    </div>
                  )}

                  {/* Facebook Sell Form and History Wrapper */}
                  <form onSubmit={handleFacebookSell} className="bg-white border border-stone-200/80 p-5 rounded-[28px] shadow-sm space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">ফেববুক লগইন ইমেইল / ফোন নাম্বার</label>
                      <input 
                        type="text" 
                        placeholder="example@gmail.com or Phone Number"
                        value={facebookEmail}
                        onChange={(e) => setFacebookEmail(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">ফেসবুক পাসওয়ার্ড</label>
                      <input 
                        type="text" 
                        placeholder="ফেসবুক অ্যাকাউন্টের সঠিক পাসওয়ার্ড দিন"
                        value={facebookPassword}
                        onChange={(e) => setFacebookPassword(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">২-ফ্যাক্টর ব্যাকআপ ওটিপি / কোড (2FA Code / Backup Code)</label>
                      <input 
                        type="text" 
                        placeholder="2FA 6-digit backup code (বাধ্যতামূলক ও অত্যন্ত জরুরি)"
                        value={facebook2FA}
                        onChange={(e) => setFacebook2FA(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition font-mono font-extrabold"
                        required
                      />
                    </div>

                    {facebookMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${facebookMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        {facebookMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{facebookMessage.text}</span>
                      </div>
                    )}

                    {/* Admin Guidelines / Custom Texts */}
                    {socialTexts.filter(t => t.platform === 'facebook').length > 0 && (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 mt-4 text-left">
                        <h5 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                          এডমিন নির্দেশাবলী (Admin Guidelines)
                        </h5>
                        <ul className="list-disc pl-4 text-stone-600 text-xs space-y-1 font-medium leading-relaxed">
                          {socialTexts.filter(t => t.platform === 'facebook').map(t => (
                            <li key={t.id}>{t.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingFacebook}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmittingFacebook ? 'জমা হচ্ছে...' : 'বিক্রি করতে জমা দিন ✔'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: INSTAGRAM SELL */}
        {activeTab === 'instagram-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">Instagram Sell Option</span>
            </div>

            {/* Tutorial Badge button resembling screenshot */}
            <div className="flex justify-center mt-1">
              <a 
                href={globalSettings.instagramTutorialUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!globalSettings.instagramTutorialUrl) {
                    e.preventDefault();
                    triggerToast('⚠️ দুঃখিত, এখনও কোনো টিউটোরিয়াল ভিডিও যুক্ত করা হয়নি!', 'error');
                  }
                }}
                className="bg-rose-500/15 border border-rose-500/25 px-5 py-2 rounded-full flex items-center gap-2 shadow-2xs cursor-pointer hover:bg-rose-500/20 transition-all font-sans"
              >
                <img src="https://img.icons8.com/color/48/instagram-new.png" className="w-5 h-5 shrink-0" alt="instagram icon" />
                <span className="text-[10px] text-rose-600 font-black">ইন্সটাগ্রাম সেল টিউটোরিয়াল!</span>
                <div className="bg-rose-500 p-1 rounded-full text-white flex items-center justify-center w-4 h-4 shadow-sm animate-pulse">
                  <Play size={8} className="fill-white text-white translate-x-[0.5px]" />
                </div>
              </a>
            </div>

            <div className="space-y-4">
              {globalSettings.instagramMaintenanceEnabled ? (
                <div className="bg-white border border-stone-200 p-8 rounded-[28px] text-center py-6 flex flex-col items-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                    <AlertOctagon size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h4>
                  <p className="text-stone-600 text-xs text-center font-medium bg-amber-50 border border-amber-200/55 p-3 rounded-xl max-w-sm leading-relaxed">
                    {globalSettings.instagramMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ইন্সটাগ্রাম বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Instagram Gradient Card */}
                  <div className="bg-gradient-to-r from-[#fa7e1e] via-[#d62976] to-[#962fbf] text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                    <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-center mb-1">
                      <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner font-sans font-black text-xl">
                        I
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                      Instagram Sell
                    </h3>
                    <p className="text-white/85 text-[10.5px] font-bold mt-1">ইন্সটাগ্রাম একাউন্ট বিক্রি করে সহজে আয় করুন</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center">
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Rate</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">৳{(globalSettings.instagramPrice || 20.0).toFixed(2)}</strong>
                      </div>
                      <div className="border-x border-white/15">
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Limit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">
                          {globalSettings.instagramDailyLimit && globalSettings.instagramDailyLimit > 0 ? globalSettings.instagramDailyLimit : 'Unlimit'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">Submit</span>
                        <strong className="text-xs font-sans font-black block mt-0.5">{submittedCount24h}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Today's Password Section */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-white border-2 border-stone-150 rounded-[22px] p-4 flex justify-between items-center relative shadow-3xs overflow-hidden">
                      <div className="text-left">
                        <span className="text-[10px] text-stone-500 font-extrabold block">Today's Password:</span>
                        <span className="font-sans font-black text-sm text-[#fa7e1e] select-all mt-0.5 block tracking-wide">
                          {globalSettings.instagramOpenPass || 'Shihab@2025#'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(globalSettings.instagramOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                        className="bg-gradient-to-r from-[#fa7e1e] to-[#d62976] text-white text-[9.5px] font-black py-2 px-3.5 rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy size={9} /> Copy Password
                      </button>
                    </div>
                  )}

                  {/* Instagram Sell Form and History Wrapper */}
                  <div className="bg-white border border-stone-200/80 p-5 rounded-[28px] shadow-sm space-y-4">
                    <form onSubmit={handleInstagramSell} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">ইন্সটাগ্রাম ইউজারনেম / লগইন ইমেইল</label>
                      <input 
                        type="text" 
                        placeholder="example_username or Email Address"
                        value={instagramUsername}
                        onChange={(e) => setInstagramUsername(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">ইন্সটাগ্রাম পাসওয়ার্ড</label>
                      <input 
                        type="text" 
                        placeholder="ইন্সটাগ্রাম অ্যাকাউন্টের সঠিক পাসওয়ার্ড দিন"
                        value={instagramPassword}
                        onChange={(e) => setInstagramPassword(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">২-ফ্যাক্টর ব্যাকআপ ওটিপি / কোড (2FA Code / Backup Code)</label>
                      <input 
                        type="text" 
                        placeholder="2FA 6-digit backup code (বাধ্যতামূলক ও অত্যন্ত জরুরি)"
                        value={instagram2FA}
                        onChange={(e) => setInstagram2FA(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition font-mono font-extrabold"
                        required
                      />
                    </div>

                    {instagramMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${instagramMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        {instagramMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{instagramMessage.text}</span>
                      </div>
                    )}

                    {/* Admin Guidelines / Custom Texts */}
                    {socialTexts.filter(t => t.platform === 'instagram').length > 0 && (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 mt-4 text-left">
                        <h5 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#fa7e1e] rounded-full"></span>
                          এডমিন নির্দেশাবলী (Admin Guidelines)
                        </h5>
                        <ul className="list-disc pl-4 text-stone-600 text-xs space-y-1 font-medium leading-relaxed">
                          {socialTexts.filter(t => t.platform === 'instagram').map(t => (
                            <li key={t.id}>{t.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingInstagram}
                      className="w-full bg-gradient-to-r from-[#fa7e1e] to-[#d62976] hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmittingInstagram ? 'জমা হচ্ছে...' : 'বিক্রি করতে জমা দিন ✔'}
                    </button>
                  </form>
                </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 7: NEW CAMP-JOB POSTING */}
        {activeTab === 'post-job' && (globalSettings.postJobMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <AlertOctagon size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.postJobMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের নতুন জব পোস্টিং সার্ভিসটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>

            <h2 className="text-lg font-bold text-stone-800 tracking-tight">নতুন ক্যাম্পেইন (Micro Job) পোস্ট করুন</h2>

            {parseFloat(globalSettings.postJobAdminFee as any || '0') > 0 ? (
              <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 font-semibold leading-relaxed">
                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>প্রতিটি ক্যাম্পেইন (Micro Job) সফলভাবে পোস্ট করার জন্য এডমিন চার্জ/ফি ৳{parseFloat(globalSettings.postJobAdminFee as any || '0').toFixed(2)} প্রযোজ্য।</p>
                  <p className="text-[10px] text-amber-700/80 font-medium">আপনার একাউন্ট ব্যালেন্স থেকে জবের মোট বাজেট এবং এডমিন ফি কাটা হবে। পর্যাপ্ত ব্যালেন্স না থাকলে ক্যাম্পেইনটি পোস্ট করতে পারবেন না।</p>
                </div>
              </div>
            ) : null}

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <form onSubmit={handlePostJobSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">ছবি আপলোড করুন (Screenshots/Samples)</label>
                  <label className="border-2 border-dashed border-stone-200 hover:border-[#764ba2] rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition relative overflow-hidden text-center">
                    <Upload size={24} className="text-[#764ba2] mb-1" />
                    <span className="text-xs text-stone-500 font-bold block">ছবি নির্বাচন করুন (একাধিক সম্ভব)</span>
                    <span className="text-[10px] text-stone-400 mt-1 block">কাজের উদাহরণ হিসেবে ১ বা একাধিক ছবি দিন</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handlePostJobFilesChange} 
                    />
                  </label>

                  {postJobPreview.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {postJobPreview.map((src, index) => (
                        <img 
                          key={index} 
                          src={src} 
                          className="w-full h-14 object-cover rounded-xl border border-stone-200 shadow-xs" 
                          alt="preview" 
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">ক্যাম্পেইনের টাইটেল / শিরোনাম</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: YouTube Subscribe & Screenshots"
                    value={postJobTitle}
                    onChange={(e) => setPostJobTitle(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">কাজের ওয়েবসাইট বা ভিডিও লিংক</label>
                  <input 
                    type="url" 
                    placeholder="https://youtube.com/..."
                    value={postJobLink}
                    onChange={(e) => setPostJobLink(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                    required
                  />
                </div>

                {/* Show details link button toggle switch */}
                <div className="flex justify-between items-center p-3.5 bg-stone-50/50 border border-stone-150 rounded-2xl text-xs font-bold">
                  <span className="text-stone-700">কাজের লিংক বাটন সচল রাখবেন?</span>
                  <button 
                    type="button"
                    onClick={() => setPostShowLink(!postShowLink)}
                    className={`relative w-11 h-6 rounded-full transition duration-300 ${postShowLink ? 'bg-[#764ba2]' : 'bg-stone-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${postShowLink ? 'translate-x-5' : ''}`}></span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">বিস্তারিত কাজের বিবরণ ও নির্দেশাবলী</label>
                  <textarea 
                    rows={4}
                    placeholder="কাজটি কিভাবে সম্পন্ন করতে হবে তা সুন্দর করে লিখে দিন..."
                    value={postJobDesc}
                    onChange={(e) => setPostJobDesc(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition resize-none"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block pl-1">প্রতি কাজের পুরস্কার (৳)</label>
                    <input 
                      type="number" 
                      placeholder="যেমন: 0.50"
                      step="0.01"
                      value={postJobReward}
                      onChange={(e) => setPostJobReward(e.target.value)}
                      className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block pl-1">প্রয়োজনীয় প্রমাণ ছবি (১-১০)</label>
                    <select
                      value={postJobMaxProof}
                      onChange={(e) => setPostJobMaxProof(parseInt(e.target.value))}
                      className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition appearance-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} টি স্ক্রিনশট</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">আপনার মোট বাজেট (৳)</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: ৫০"
                    value={postJobBudget}
                    onChange={(e) => setPostJobBudget(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                    required
                  />
                  <div className="space-y-1 pl-1 text-[11px] font-bold">
                    {computedSlots > 0 && (
                      <span className="block text-[#764ba2]">
                        ৳{postJobReward} রেট দিয়ে মোট {computedSlots} জন লোক কাজ করতে পারবে।
                      </span>
                    )}
                    <span className="block text-amber-600">
                      এডমিন পোস্টিং ফি: ৳{parseFloat(globalSettings.postJobAdminFee as any || '0').toFixed(2)}
                    </span>
                    {parseFloat(postJobBudget || '0') > 0 && (
                      <span className="block text-stone-600">
                        মোট কাটা হবে: ৳{(parseFloat(postJobBudget || '0') + parseFloat(globalSettings.postJobAdminFee as any || '0')).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">ক্যাম্পেইনের লাস্ট মেয়াদের তারিখ (ঐচ্ছিক)</label>
                  <input 
                    type="date" 
                    value={postJobExpiry}
                    onChange={(e) => setPostJobExpiry(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                  />
                </div>

                {postJobMessage.text && (
                  <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${
                    postJobMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 
                    postJobMessage.type === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {postJobMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{postJobMessage.text}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isPostingJob}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPostingJob ? 'প্রসেসিং হচ্ছে...' : '৳ ক্যাম্পেন সেভ অ্যান্ড লঞ্চ'}
                </button>
              </form>
            </div>
          </motion.div>
        ))}
        {activeTab === 'all-jobs' && (globalSettings.jobsMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <Briefcase size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.jobsMaintenanceMessage || 'সাময়িক কাজ আপডেট করার জন্য অল জবস মেইনটেন্যান্সে রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-stone-800 tracking-tight">সব চলমান ক্যাম্পেইন সমূহ</h2>
              <button 
                onClick={() => switchTab('post-job')}
                className="bg-[#764ba2] hover:bg-[#667eea] text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shadow-sm"
              >
                <PlusCircle size={14} /> পোস্ট করুন
              </button>
            </div>

            {(() => {
              const activeJobs = jobs.filter(job => {
                if (job.expiryDate) {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const exp = new Date(job.expiryDate);
                  exp.setHours(23,59,59,999); // Active until end of expiry day
                  if (exp < today) return false;
                }
                return true;
              });

              if (activeJobs.length === 0) {
                return (
                  <div className="bg-white border border-stone-200 p-8 rounded-3xl text-center shadow-xs">
                    <Briefcase size={36} className="text-stone-300 mx-auto mb-2" />
                    <p className="text-stone-500 text-sm">বর্তমানে কোনো চাকরি বা ক্যাম্পেইন সক্রিয় নেই।</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {activeJobs.map(job => {
                    const alreadyDone = userData?.completedJobs?.[job.id] || false;
                    const isCreator = job.posterId === userId;

                    return (
                    <div key={job.id} className="bg-white border border-stone-200 rounded-[25px] overflow-hidden shadow-xs relative">
                      <div className="h-44 bg-stone-100 relative">
                        <img 
                          src={job.imageUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500'} 
                          className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition duration-200" 
                          alt="Campaign" 
                          onClick={() => setFullscreenImageUrl(job.imageUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500')}
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-stone-150/50">
                          <span className="text-xs font-black text-amber-600">৳{(job.perTaskReward || 0.50).toFixed(2)}</span>
                        </div>
                        {alreadyDone && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                            <span className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-xs shadow-md">
                              সম্পন্ন হয়েছে ✔
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-extrabold text-stone-800 text-base leading-snug">{job.title}</h3>
                          <p className="text-stone-500 text-xs mt-1 truncate">{job.description}</p>
                        </div>

                        <div className="flex justify-between items-center text-xs py-1.5 border-y border-stone-100">
                          <span className="text-stone-500 font-bold">স্ক্রিনশট ছবি: {job.maxProofImages || 1} টি</span>
                          <span className="text-stone-500 font-bold">
                            অবশিষ্ট: <strong className="text-amber-600 font-sans">{job.remainingSlots}</strong> / {job.totalSlots} জন
                          </span>
                        </div>

                        {!alreadyDone && (
                          <button 
                            onClick={() => {
                              setSelectedJob(job);
                              setPreviousTab('all-jobs');
                              switchTab('job-details');
                            }}
                            className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white py-3.5 rounded-2xl text-xs font-extrabold transition shadow-md cursor-pointer active:scale-[0.98]"
                          >
                            {isCreator ? 'আমার জব ডিটেইলস দেখুন' : 'কাজটি শুরু করুন'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          </motion.div>
        ))}

        {/* VIEW 9: JOB WORK APPLICATION DETAILS */}
        {activeTab === 'job-details' && selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button 
              onClick={() => switchTab(previousTab)}
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              <ChevronRight size={14} className="rotate-180" /> ফিরে যান
            </button>

            <div className="bg-white border border-stone-200 rounded-[30px] overflow-hidden shadow-xs">
              <div className="h-48 bg-stone-50 relative">
                <img 
                  src={selectedJob.imageUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500'} 
                  className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition duration-200" 
                  alt="Job Banner" 
                  onClick={() => setFullscreenImageUrl(selectedJob.imageUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500')}
                />
                <div className="absolute top-3 left-3 bg-white/95 p-2 px-4 rounded-xl border border-stone-150 shadow-xs">
                  <span className="text-stone-500 text-xs font-bold">পুরস্কার:</span>
                  <span className="font-extrabold text-amber-600 text-sm block">৳{selectedJob.perTaskReward.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg leading-snug">{selectedJob.title}</h3>
                  <div className="mt-2 text-stone-500 font-bold text-xs">
                    মোট স্লট: {selectedJob.totalSlots} জন | অবশিষ্ট: {selectedJob.remainingSlots} জন
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150">
                  <span className="text-xs font-extrabold text-stone-700 block mb-1">কাজের নির্দেশাবলী:</span>
                  <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {selectedJob.showLink && (
                  <a 
                    href={selectedJob.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#764ba2] text-white font-extrabold py-3.5 rounded-full shadow-md hover:bg-[#667eea] transition flex items-center justify-center gap-2 text-xs text-center"
                  >
                    <span>কাজের লিংকে যান (Open Link)</span>
                    <ExternalLink size={14} />
                  </a>
                )}

                <hr className="border-stone-100" />

                {/* Proof submitting form */}
                {selectedJob.posterId === userId ? (
                  <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl text-center">
                    <span className="text-xs font-extrabold text-amber-800 block">আপনার নিজের ক্যাম্পেইন!</span>
                    <p className="text-stone-600 text-xs mt-1">আপনি এই নিজে পোস্ট করা কাজের জন্য প্রুফ জমা দিতে পারবেন না।</p>
                  </div>
                ) : (!userData?.isActive && !globalSettings.freeActivationEnabled) ? (
                  <div className="bg-red-50 border border-red-200/60 p-4 rounded-2xl text-center">
                    <Lock size={20} className="text-red-500 mx-auto mb-1" />
                    <span className="text-xs font-extrabold text-red-800 block">কাজ জমা লক করা আছে!</span>
                    <p className="text-stone-600 text-xs mt-1">প্রমাণ জমা দিতে প্রথমে {globalSettings.activationPrice || 100} টাকা পেমেন্ট দিয়ে একাউন্ট একটিভ করুন।</p>
                    <button 
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="mt-3 bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] py-1.5 px-4 rounded-lg transition"
                    >
                      এখনই এক্টিভ করুন
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleJobSubmitWork} className="space-y-4">
                    <h4 className="font-bold text-stone-850 text-xs pl-0.5">কাজের প্রমাণপত্র জমা দিন</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-600 block pl-1">
                        স্ক্রিনশট আপলোড করুন (বাধ্যতামূলক: {selectedJob.maxProofImages || 1} টি ছবি)
                      </label>
                      <label className="border-2 border-dashed border-stone-200 hover:border-[#764ba2] bg-stone-50/50 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition">
                        <Upload size={20} className="text-stone-400 mb-1" />
                        <span className="text-xs text-stone-500 font-bold">স্ক্রিনশট নির্বাচন করুন</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          onChange={handleWorkerProofChange} 
                        />
                      </label>

                      {submitProofsPreview.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {submitProofsPreview.map((src, index) => (
                            <img 
                              key={index} 
                              src={src} 
                              className="w-full h-14 object-cover rounded-xl border border-stone-200 shadow-xs" 
                              alt="preview_proof" 
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-600 block pl-1">ফিডব্যাক বা কাজের অতিরিক্ত বিবরণ</label>
                      <textarea 
                        rows={2}
                        placeholder="আপনার bKash নম্বর, TrxID বা কাজের বিবরণ লিখুন..."
                        value={submitFeedback}
                        onChange={(e) => setSubmitFeedback(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition resize-none"
                        required
                      ></textarea>
                    </div>

                    {submitJobWorkMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${
                        submitJobWorkMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 
                        submitJobWorkMessage.type === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {submitJobWorkMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{submitJobWorkMessage.text}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingJobWork}
                      className="w-full bg-stone-850 hover:bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-md transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingJobWork ? 'প্রসেসিং হচ্ছে...' : 'কাজের প্রুফ জমা দিন ✔'}
                    </button>
                  </form>
                )}

              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'spin' && (globalSettings.spinMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4 w-full">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <AlertOctagon size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.spinMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের স্পিন হুইল গেমটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col items-center">
            <div className="bg-white p-6 rounded-[2.5rem] border border-stone-200 shadow-xs w-full space-y-4 text-center">
              <div>
                <h2 className="text-lg font-extrabold text-stone-800">লাকি স্পিন হুইল</h2>
                <p className="text-stone-500 text-xs mt-1">প্রতিদিন সম্পূর্ণ ফ্রিতে স্পিন করুন এবং জিতে নিন নগদ টাকা!</p>
              </div>

              {/* Infinite Spinner Wheel container */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center pt-2">
                {/* Center Pin Indicator */}
                <div className="absolute top-0 z-30 text-[#764ba2] flex flex-col items-center -mt-3 drop-shadow-md">
                  <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-md animate-bounce"></div>
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-red-600 mt-[-4px]"></div>
                </div>

                {/* Visual Carnival Light Borders */}
                <div className="absolute w-[15.5rem] h-[15.5rem] rounded-full border-4 border-amber-400/30 flex items-center justify-center pointer-events-none z-10">
                  {/* Flashing bulbs */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 360) / 12;
                    return (
                      <div 
                        key={i}
                        className={`absolute w-2 h-2 rounded-full shadow-md transition-all duration-500 ${i % 2 === 0 ? 'bg-yellow-300 shadow-yellow-400 animate-pulse' : 'bg-orange-400 shadow-orange-500 opacity-80'}`}
                        style={{
                          transform: `rotate(${angle}deg) translateY(-119px)`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Rotating Wheel body */}
                <div 
                  className="w-56 h-56 rounded-full border-8 border-stone-800 shadow-xl relative flex items-center justify-center overflow-hidden z-20"
                  style={{ 
                    background: 'conic-gradient(from 0deg, #f59e0b 0deg 45deg, #ef4444 45deg 90deg, #10b981 90deg 135deg, #3b82f6 135deg 180deg, #8b5cf6 180deg 225deg, #ec4899 225deg 270deg, #06b6d4 270deg 315deg, #f43f5e 315deg 360deg)',
                    transform: `rotate(${spinRotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
                  }}
                >
                  {/* Text and Divider lines on Wheel sectors */}
                  {(() => {
                    const rewards = (globalSettings.spinRewards || '0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0').split(',');
                    return rewards.map((val, idx) => {
                      const rotation = idx * 45 + 22.5;
                      return (
                        <div key={idx}>
                          {/* Segment Sector Border Line */}
                          <div 
                            className="absolute w-0.5 h-1/2 bg-white/25 origin-bottom"
                            style={{
                              transform: `rotate(${idx * 45}deg)`,
                              transformOrigin: '50% 100%',
                              bottom: '50%',
                              left: 'calc(50% - 1px)',
                            }}
                          />
                          {/* Text label */}
                          <div 
                            className="absolute text-[10px] font-black text-white font-sans origin-bottom h-24"
                            style={{ 
                              transform: `rotate(${rotation}deg)`,
                              transformOrigin: '50% 100%',
                              bottom: '50%',
                            }}
                          >
                            ৳{val}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Small Center Hub Decor */}
                <div className="absolute w-12 h-12 bg-white rounded-full border-4 border-stone-800 shadow-md z-30 flex items-center justify-center">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-[#764ba2] rounded-full animate-ping opacity-35 absolute"></div>
                  <div className="w-4 h-4 bg-[#764ba2] rounded-full z-10 border border-purple-400"></div>
                </div>
              </div>

              {/* Active trigger state check */}
              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const alreadySpun = userData?.lastSpinDate === today;

                return (
                  <div className="space-y-3 pt-2">
                    {alreadySpun ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-bold leading-normal">
                        আপনি আজকের ফ্রি স্পিন বোনাস রিওয়ার্ড সংগ্রহ করে ফেলেছেন! আগামীকাল আবার ট্রাই করুন।
                      </div>
                    ) : (
                      <button
                        onClick={handleStartSpin}
                        disabled={isSpinning}
                        className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white py-4 rounded-2xl font-extrabold text-xs transition shadow-xs disabled:bg-stone-300 disabled:text-stone-500 cursor-pointer"
                      >
                        {isSpinning ? 'স্পিন হচ্ছে...' : 'হুইল স্পিন করুন 🎯'}
                      </button>
                    )}
                  </div>
                );
              })()}


            </div>
          </motion.div>
        ))}
        {activeTab === 'scratch' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-stone-800">লাকি স্ক্র্যাচ কার্ড গেম</h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition flex items-center gap-1 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs"
              >
                হোমে ফিরুন
              </button>
            </div>

            {globalSettings.scratchMaintenanceEnabled ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4 w-full">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                  <AlertCircle size={28} />
                </div>
                <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
                <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                  {globalSettings.scratchMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের স্ক্র্যাচ কার্ড গেমটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                </p>
              </div>
            ) : (
              userData && (
                <ScratchCardGame 
                  userId={userId}
                  userData={userData}
                  globalSettings={globalSettings}
                  onBalanceUpdate={() => {}}
                  addLiveToast={addLiveToast}
                />
              )
            )}
          </motion.div>
        )}
        {activeTab === 'math-solve' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-stone-800">ম্যাথ সলভ গেম</h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition flex items-center gap-1 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer"
              >
                হোমে ফিরুন
              </button>
            </div>

            {globalSettings.hideMathSolve || globalSettings.mathSolveMaintenanceEnabled ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4 w-full">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                  <AlertCircle size={28} />
                </div>
                <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
                <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                  {globalSettings.mathSolveMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ম্যাথ সলভ গেমটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                </p>
              </div>
            ) : (
              userData && (
                (globalSettings.mathSolveUnlockFee && globalSettings.mathSolveUnlockFee > 0 && !userData.mathSolveUnlocked) ? (
                  <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4 w-full">
                    <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                      <Lock size={28} className="animate-pulse" />
                    </div>
                    <h3 className="font-black text-stone-850 text-base">ম্যাথ সলভ গেম আনলক করুন</h3>
                    <p className="text-stone-500 text-xs text-center max-w-xs leading-relaxed">
                      ম্যাথ সলভ গেম খেলে দৈনিক টাকা ইনকাম করতে পারবেন। এটি একবার আনলক করতে আপনার মেইন ব্যালেন্স থেকে ফি কাটা হবে।
                    </p>
                    
                    <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 w-full max-w-xs space-y-2">
                      <div className="flex justify-between items-center text-xs text-stone-600 font-bold">
                        <span>আনলক ফি (Unlock Fee):</span>
                        <span className="text-amber-600 font-black">৳{globalSettings.mathSolveUnlockFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-stone-600 font-bold border-t border-stone-200/50 pt-2">
                        <span>আপনার ব্যালেন্স:</span>
                        <span className="text-emerald-600 font-black">৳{userData.balance.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const fee = globalSettings.mathSolveUnlockFee || 0;
                        if (userData.balance < fee) {
                          addLiveToast('⚠️ দুঃখিত! আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই। দয়া করে ব্যালেন্স রিচার্জ/ডিপোজিট করুন।');
                          return;
                        }
                        try {
                          const nextBal = parseFloat((userData.balance - fee).toFixed(2));
                          await update(ref(db, `users/${userId}`), {
                            balance: nextBal,
                            mathSolveUnlocked: true
                          });
                          addLiveToast('🎉 অভিনন্দন! ম্যাথ সলভ গেম সফলভাবে আনলক হয়েছে।');
                        } catch (err) {
                          addLiveToast('❌ আনলক করতে সমস্যা হয়েছে। দয়া করে আবার ট্রাই করুন।');
                        }
                      }}
                      className="w-full max-w-xs bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3.5 rounded-2xl text-xs transition duration-200 shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      আনলক করতে ক্লিক করুন (৳{globalSettings.mathSolveUnlockFee.toFixed(2)})
                    </button>
                  </div>
                ) : (
                  <MathSolveGame 
                    userId={userId}
                    userData={userData}
                    globalSettings={globalSettings}
                    onBalanceUpdate={() => {}}
                    addLiveToast={addLiveToast}
                  />
                )
              )
            )}
          </motion.div>
        )}
        {activeTab === 'quiz-play' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-stone-800">দৈনিক কুইজ খেলুন</h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition flex items-center gap-1 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer"
              >
                হোমে ফিরুন
              </button>
            </div>

            {globalSettings.hideQuiz || globalSettings.quizMaintenanceEnabled ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4 w-full">
                <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center shadow-xs">
                  <AlertCircle size={28} />
                </div>
                <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
                <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                  {globalSettings.quizMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের কুইজ গেমটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                </p>
              </div>
            ) : (
              userData && (
                (globalSettings.quizUnlockFee && globalSettings.quizUnlockFee > 0 && !userData.quizUnlocked) ? (
                  <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4 w-full">
                    <div className="w-16 h-16 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center shadow-xs">
                      <Lock size={28} className="animate-pulse" />
                    </div>
                    <h3 className="font-black text-stone-850 text-base">কুইজ গেম আনলক করুন</h3>
                    <p className="text-stone-500 text-xs text-center max-w-xs leading-relaxed">
                      দৈনিক কুইজ খেলে টাকা ইনকাম করতে পারবেন। এটি একবার আনলক করতে আপনার মেইন ব্যালেন্স থেকে ফি কাটা হবে।
                    </p>
                    
                    <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 w-full max-w-xs space-y-2">
                      <div className="flex justify-between items-center text-xs text-stone-600 font-bold">
                        <span>আনলক ফি (Unlock Fee):</span>
                        <span className="text-cyan-600 font-black">৳{globalSettings.quizUnlockFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-stone-600 font-bold border-t border-stone-200/50 pt-2">
                        <span>আপনার ব্যালেন্স:</span>
                        <span className="text-emerald-600 font-black">৳{userData.balance.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const fee = globalSettings.quizUnlockFee || 0;
                        if (userData.balance < fee) {
                          addLiveToast('⚠️ দুঃখিত! আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই। দয়া করে ব্যালেন্স রিচার্জ/ডিপোজিট করুন।');
                          return;
                        }
                        try {
                          const nextBal = parseFloat((userData.balance - fee).toFixed(2));
                          await update(ref(db, `users/${userId}`), {
                            balance: nextBal,
                            quizUnlocked: true
                          });
                          addLiveToast('🎉 অভিনন্দন! কুইজ গেম সফলভাবে আনলক হয়েছে।');
                        } catch (err) {
                          addLiveToast('❌ আনলক করতে সমস্যা হয়েছে। দয়া করে আবার ট্রাই করুন।');
                        }
                      }}
                      className="w-full max-w-xs bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold py-3.5 rounded-2xl text-xs transition duration-200 shadow-md shadow-cyan-500/10 cursor-pointer"
                    >
                      আনলক করতে ক্লিক করুন (৳{globalSettings.quizUnlockFee.toFixed(2)})
                    </button>
                  </div>
                ) : (
                  <QuizPlayGame 
                    userId={userId}
                    userData={userData}
                    globalSettings={globalSettings}
                    onBalanceUpdate={() => {}}
                    addLiveToast={addLiveToast}
                  />
                )
              )
            )}
          </motion.div>
        )}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-stone-800">বিজ্ঞপ্তি ও নোটিশ সেন্টার</h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition"
              >
                হোমে ফিরুন
              </button>
            </div>

            {globalNotifications.length === 0 ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl text-center shadow-xs">
                <Bell size={36} className="text-stone-300 mx-auto mb-2 animate-bounce" />
                <p className="text-stone-500 text-xs leading-normal font-medium">বর্তমানে কোনো গুরুত্বপূর্ণ বিজ্ঞপ্তি পাওয়া যায়নি। নতুন বিজ্ঞপ্তি প্রকাশ হলে এখানে তালিকা দেখতে পাবেন।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {globalNotifications.map(notification => (
                  <div key={notification.id} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-xs space-y-1.5 hover:border-[#764ba2]/50 transition">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-stone-800 text-[13px] leading-snug">{notification.title}</h3>
                      <span className="text-[9px] text-stone-400 font-sans shrink-0 font-bold bg-stone-100 px-2 py-0.5 rounded-md">
                        {new Date(notification.timestamp).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed whitespace-pre-line font-medium">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'support' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-[#764ba2] flex items-center gap-1.5 font-sans">
                <HelpCircle size={19} className="text-[#764ba2]" />
                <span>হেল্প ও কাস্টমার সাপোর্ট সেন্টার</span>
              </h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition"
              >
                হোমে ফিরুন
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-5 rounded-3xl shadow-md space-y-2">
              <h3 className="font-extrabold text-sm">যেকোনো জিজ্ঞাসা বা সমস্যায় আমরা আপনার সাথে আছি!</h3>
              <p className="text-[11px] text-white/90 leading-relaxed font-semibold">
                টাস্ক ভেরিফিকেশন, পেমেন্ট সংক্রান্ত ইস্যু, নোভা শপ অথবা রেফার নিয়ে যেকোনো প্রশ্ন থাকলে নিচের অফিশিয়াল চ্যানেল সমূহে যোগাযোগ করুন।
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold block">✓ ২৪/৭ একটিভ সাপোর্ট</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold block">✓ ১০০% বিশ্বস্ত ও নিরাপদ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-24">
              
              {/* CHANNEL CARD */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl shrink-0">
                    <Send size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-stone-800 text-xs font-black block">অফিসিয়াল টেলিগ্রাম চ্যানেল</h4>
                    <p className="text-stone-500 text-[10px] mt-1 font-semibold leading-relaxed">সকল নতুন ধামাকা অফার, আপডেট নোটিশ এবং পেমেন্ট প্রুফ সবার আগে দেখতে চ্যানেলটি সাবস্ক্রাইব করুন।</p>
                  </div>
                </div>
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Active 📢</span>
                  {globalSettings.supportTelegramChannel ? (
                    <a 
                      href={globalSettings.supportTelegramChannel} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>চ্যানেল জয়েন করুন</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <button disabled className="bg-stone-100 text-stone-400 font-bold text-[11px] px-4 py-2 rounded-xl">লিংক নেই</button>
                  )}
                </div>
              </div>

              {/* GROUP CARD */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-cyan-50 text-cyan-500 p-3 rounded-2xl shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-stone-800 text-xs font-black block">টেলিগ্রাম মেম্বারস গ্রুপ</h4>
                    <p className="text-stone-500 text-[10px] mt-1 font-semibold leading-relaxed">অন্যান্য সকল ইউজারদের সাথে সরাসরি আলাপ করুন এবং অ্যাডমিনের কাছে প্রশ্ন করতে পারেন।</p>
                  </div>
                </div>
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Active 👥</span>
                  {globalSettings.supportTelegramGroup ? (
                    <a 
                      href={globalSettings.supportTelegramGroup} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>গ্রুপে জয়েন করুন</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <button disabled className="bg-stone-100 text-stone-400 font-bold text-[11px] px-4 py-2 rounded-xl">লিংক নেই</button>
                  )}
                </div>
              </div>

              {/* ADMIN PM CARD */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-[#764ba2]/5 text-[#764ba2] p-3 rounded-2xl shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-stone-800 text-xs font-black block">সরাসরি এডমিন ইনবক্স</h4>
                    <p className="text-stone-500 text-[10px] mt-1 font-semibold leading-relaxed">ভেরিফিকেশন চার্জ বা পেমেন্ট সংক্রান্ত যেকোনো জটিল সমস্যায় সরাসরি এডমিনের সাথে যোগাযোগ করুন।</p>
                  </div>
                </div>
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Personal Support 🔐</span>
                  {globalSettings.supportTelegramAdmin ? (
                    <a 
                      href={globalSettings.supportTelegramAdmin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#764ba2] hover:bg-[#667eea] text-white font-bold text-[11px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>মেসেজ দিন</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <button disabled className="bg-stone-100 text-stone-400 font-bold text-[11px] px-4 py-2 rounded-xl">লিংক নেই</button>
                  )}
                </div>
              </div>

              {/* FACEBOOK CARD */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-indigo-50 text-indigo-500 p-3 rounded-2xl shrink-0">
                    <Facebook size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-stone-800 text-xs font-black block">অফিসিয়াল ফেসবুক পেজ</h4>
                    <p className="text-stone-500 text-[10px] mt-1 font-semibold leading-relaxed">আমাদের অফিশিয়াল ফেসবুক পেজ লাইক দিন এবং চমৎকার সব কুইজ আর অফারে অংশ নিন।</p>
                  </div>
                </div>
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Active 👍</span>
                  {globalSettings.supportFacebookPage ? (
                    <a 
                      href={globalSettings.supportFacebookPage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>পেজ ভিজিট করুন</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <button disabled className="bg-stone-100 text-stone-400 font-bold text-[11px] px-4 py-2 rounded-xl">লিংক নেই</button>
                  )}
                </div>
              </div>

              {/* WHATSAPP CARD */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-emerald-50 text-emerald-500 p-3 rounded-2xl shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-stone-800 text-xs font-black block">হোয়াটসঅ্যাপ হেল্পলাইন</h4>
                    <p className="text-stone-500 text-[10px] mt-1 font-semibold leading-relaxed">ফোনে সরাসরি চ্যাটের মাধ্যমে সাহায্য নিতে হোয়াটসঅ্যাপ নম্বরে নক দিন।</p>
                  </div>
                </div>
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Active 💬</span>
                  {globalSettings.supportWhatsAppNumber ? (
                    <a 
                      href={globalSettings.supportWhatsAppNumber} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>হোয়াটসঅ্যাপ মেসেজ</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <button disabled className="bg-stone-100 text-stone-400 font-bold text-[11px] px-4 py-2 rounded-xl">লিংক নেই</button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === 'deposit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24 font-sans">
            <div className="flex justify-between items-center mb-1 bg-white border border-stone-150 p-3.5 rounded-2xl shadow-2xs">
              <button 
                onClick={() => switchTab('home')} 
                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronRight size={14} className="rotate-180" /> ফিরে যান
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono flex items-center gap-1">
                <ArrowDownCircle size={14} className="text-[#764ba2]" />
                ডিপোজিট ফান্ড (Add Fund)
              </span>
            </div>

            {/* Current Balance Indicator */}
            <div className="bg-gradient-to-r from-teal-500/10 to-[#764ba2]/10 border border-[#764ba2]/15 p-4.5 rounded-3xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-stone-500 font-bold block">আপনার মূল অ্যাকাউন্ট ব্যালেন্স:</span>
                <span className="text-xl font-black text-stone-800 font-mono">৳{(userData?.balance || 0).toFixed(2)}</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-2xl text-[#764ba2] shadow-xs">
                <Wallet size={20} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Instructions box */}
            <div className="bg-white border border-stone-150 rounded-3xl p-5 space-y-3.5 shadow-sm">
              <h3 className="font-extrabold text-xs text-stone-800 flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <span>১. ডিপোজিট করার নিয়মাবলী</span>
              </h3>
              <p className="text-stone-600 text-[11px] leading-relaxed font-semibold">
                নিচের যেকোনো বিকাশ বা নগদ পার্সোনাল নম্বরে আপনার ইচ্ছামত পরিমাণ টাকা ক্যাশআউট বা সেন্ডমানি করুন। এরপর নিচে সঠিক মাধ্যম নির্বাচন করে পেমেন্ট বিবরণী এবং ট্রানজেকশন আইডি (TrxID) দিয়ে আবেদন সাবমিট করুন।
              </p>
            </div>

            {/* Form Section */}
            <div className="bg-white border border-stone-150 rounded-3xl p-5 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-xs text-stone-800 border-b border-stone-100 pb-2 flex items-center justify-between">
                <span>২. পেমেন্ট ফর্ম ও গেটওয়ে</span>
                {globalSettings.depositFeePercent !== undefined && globalSettings.depositFeePercent > 0 && (
                  <span className="bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] px-2.5 py-0.5 rounded-full font-extrabold font-mono">
                    চার্জ ফি: {globalSettings.depositFeePercent}%
                  </span>
                )}
              </h3>

              <div className="space-y-4">
                {/* Method Select */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-stone-700 pl-1 block">পেমেন্ট মেথড সিলেক্ট করুন (Method)</label>
                  
                  {/* Select button */}
                  <div 
                    onClick={() => setIsDepMethodDropdownOpen(!isDepMethodDropdownOpen)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex justify-between items-center cursor-pointer hover:border-stone-300 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedDepositMethod === 'bkash' ? 'bg-[#E2136E]' : 'bg-[#F7941D]'}`} />
                      <span className="text-xs font-bold text-stone-800 uppercase">
                        {selectedDepositMethod === 'bkash' ? 'bKash (বিকাশ পার্সোনাল)' : 'Nagad (নগদ পার্সোনাল)'}
                      </span>
                    </div>
                    <ChevronDown size={15} className={`text-stone-400 transition-transform duration-200 ${isDepMethodDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Options list of all methods */}
                  {isDepMethodDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-250 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                      <div 
                        onClick={() => {
                          setSelectedDepositMethod('bkash');
                          setIsDepMethodDropdownOpen(false);
                        }}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition ${selectedDepositMethod === 'bkash' ? 'bg-[#E2136E]/5 text-[#E2136E]' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-[12px] uppercase">bKash (বিকাশ)</span>
                        </div>
                        {selectedDepositMethod === 'bkash' && <span className="text-xs font-black">✓</span>}
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedDepositMethod('nagad');
                          setIsDepMethodDropdownOpen(false);
                        }}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition ${selectedDepositMethod === 'nagad' ? 'bg-[#F7941D]/5 text-[#F7941D]' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-[12px] uppercase">Nagad (নগদ)</span>
                        </div>
                        {selectedDepositMethod === 'nagad' && <span className="text-xs font-black">✓</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Receiver Payment number */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wide block">
                    {selectedDepositMethod.toUpperCase()} পেমেন্ট রিসিভার নম্বর:
                  </span>
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-base font-black text-stone-800 font-mono tracking-wider">
                      {selectedDepositMethod === 'bkash' 
                        ? (globalSettings.activationNumbers?.bkash || '01727172701') 
                        : (globalSettings.activationNumbers?.nagad || '01934984690')
                      }
                    </span>
                    <button 
                      onClick={() => handleCopy(
                        selectedDepositMethod === 'bkash' 
                          ? globalSettings.activationNumbers?.bkash || '01727172701' 
                          : globalSettings.activationNumbers?.nagad || '01934984690', 
                        'নম্বর কপি হয়েছে'
                      )}
                      className="p-1 hover:bg-stone-200/60 rounded-md text-[#764ba2] transition cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  {/* Amount input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 pl-1 block">ডিপোজিটের পরিমাণ (টাকা)</label>
                    <input 
                      type="number" 
                      placeholder="যেমন: ৫০০"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#764ba2] font-semibold transition"
                      required
                      min="1"
                    />
                  </div>

                  {/* Real-time deposit fee calculations */}
                  {parseFloat(depositAmount) > 0 && (
                    <div className="bg-[#764ba2]/5 border border-[#764ba2]/10 rounded-2xl p-4.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-stone-600 font-semibold">
                        <span>মোট ডিপোজিট পরিমাণ:</span>
                        <span className="font-mono text-stone-800">৳{parseFloat(depositAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-stone-600 font-semibold">
                        <span>ডিপোজিট ফি চার্জ ({(globalSettings.depositFeePercent || 0)}%):</span>
                        <span className="font-mono text-red-500 font-bold">
                          -৳{((parseFloat(depositAmount) * (globalSettings.depositFeePercent || 0)) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-stone-200/60 pt-2 flex justify-between items-center text-stone-900 font-extrabold">
                        <span className="text-[#764ba2]">আপনার ব্যালেন্সে যোগ হবে (নিট):</span>
                        <span className="font-mono text-[#10b981] text-sm font-black">
                          ৳{(parseFloat(depositAmount) - ((parseFloat(depositAmount) * (globalSettings.depositFeePercent || 0)) / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sender full number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 pl-1 block">যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile)</label>
                    <input 
                      type="number" 
                      placeholder="017xxxxxxxx"
                      value={depositNumber}
                      onChange={(e) => setDepositNumber(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#764ba2] font-semibold transition"
                      required
                    />
                  </div>

                  {/* Trx ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 pl-1 block">আপনার TrxID (Transaction ID)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: 8HK7C9M2D5"
                      value={depositTrx}
                      onChange={(e) => setDepositTrx(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#764ba2] font-mono font-bold uppercase tracking-wider transition"
                      required
                    />
                  </div>

                  {depositMessage.text && (
                    <div className={`p-3.5 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2 ${depositMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                      {depositMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      <span className="flex-1">{depositMessage.text}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmittingDeposit}
                    className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-55 cursor-pointer flex justify-center items-center gap-1"
                  >
                    {isSubmittingDeposit ? 'অনুরোধ পাঠানো হচ্ছে...' : 'ডিপোজিট বিবরণী সাবমিট করুন ✔'}
                  </button>
                </form>
              </div>
            </div>

            {/* Deposit History Card */}
            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <button 
                type="button"
                onClick={() => handleFetchHistory('deposit')}
                className="w-full bg-white hover:bg-stone-50 text-stone-700 border-2 border-stone-150 font-bold py-3 rounded-2xl shadow-2xs transition flex items-center justify-center gap-1.5 text-xs font-sans cursor-pointer"
              >
                <History size={13} />
                <span>ডিপোজিট হিস্টোরি (লগ)</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW: QUICK TASKS */}
        {activeTab === 'quick-tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">কুইক টাস্ক (Quick Task)</span>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                
                <div className="flex justify-center mb-1">
                  <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                </div>
                <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                  Quick Tasks
                </h3>
                <p className="text-white/85 text-[10.5px] font-bold mt-1">সব কুইক টাস্ক সম্পূর্ণ করে সহজে বোনাস সংগ্রহ করুন</p>
              </div>

              {homeTasks.length === 0 ? (
                <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center shadow-xs">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">কোনো কুইক টাস্ক নেই</h4>
                  <p className="text-stone-500 text-xs">এই মুহূর্তে কোনো কুইক টাস্ক উপলব্ধ নেই। দ্রুত নতুন টাস্ক যোগ করা হবে!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {homeTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-white border border-stone-150 p-4 rounded-2xl flex items-center justify-between shadow-xs transition hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={task.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'} 
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-100" 
                          alt="TaskIcon" 
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-stone-850 text-xs.5 block truncate">{task.name}</span>
                          <span className="text-[9px] text-amber-600 font-extrabold block mt-0.5">সহজ কাজ</span>
                        </div>
                      </div>
                      <a 
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10.5px] py-2 px-4.5 rounded-xl transition shrink-0 shadow-xs"
                      >
                        কাজ করুন
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: OTHER SITES */}
        {activeTab === 'other-sites' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">অন্যান্য সাইট (Other Sites)</span>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-5 rounded-[24px] relative overflow-hidden text-center shadow-md">
                <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                
                <div className="flex justify-center mb-1">
                  <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shadow-inner">
                    <Globe size={20} className="text-white" />
                  </div>
                </div>
                <h3 className="font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 ml-0.5 uppercase">
                  Other Sites
                </h3>
                <p className="text-white/85 text-[10.5px] font-bold mt-1">আমাদের সহযোগী ও অন্যান্য দরকারী সাইট সমূহ ভিজিট করুন</p>
              </div>

              {websites.length === 0 ? (
                <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center shadow-xs">
                    <Globe size={24} />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">কোনো সাইট নেই</h4>
                  <p className="text-stone-500 text-xs">এই মুহূর্তে কোনো অতিরিক্ত ওয়েবসাইট উপলব্ধ নেই।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {websites.map(web => (
                    <div 
                      key={web.id}
                      onClick={() => {
                        if (web.maintenanceEnabled) {
                          setActiveWebMaint(web);
                        } else {
                          window.open(web.url, '_blank');
                        }
                      }}
                      className="bg-white border border-stone-150 p-4 rounded-2xl flex items-center justify-between shadow-xs transition hover:shadow-sm cursor-pointer hover:border-indigo-200 active:scale-95"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                          {web.iconName === 'ShoppingBag' && <ShoppingBag size={20} />}
                          {web.iconName === 'Globe' && <Globe size={20} />}
                          {web.iconName === 'Award' && <Award size={20} />}
                          {web.iconName === 'Smartphone' && <Smartphone size={20} />}
                          {web.iconName === 'Briefcase' && <Briefcase size={20} />}
                          {!['ShoppingBag', 'Globe', 'Award', 'Smartphone', 'Briefcase'].includes(web.iconName || '') && <Globe size={18} />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-stone-850 text-xs.5 block truncate">{web.name}</span>
                          <span className="text-[9px] text-indigo-505 font-extrabold block mt-0.5">ওয়েবসাইট</span>
                        </div>
                      </div>
                      <div className="text-stone-400">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">লিডারবোর্ড (Leaderboard)</span>
            </div>

            <div className="space-y-4">
              <Leaderboard currentUserId={userId} />
            </div>
          </motion.div>
        )}

        {/* VIEW: GIFT CODE */}
        {activeTab === 'gift-code' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button 
                onClick={() => {
                  switchTab('home');
                  setGiftCodeError(null);
                  setGiftCodeSuccess(null);
                  setGiftCodeInput('');
                }} 
                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">গিফট কোড (Gift Code)</span>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-5">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center relative shadow-xs">
                <div className="absolute inset-0 bg-rose-500/10 rounded-3xl blur-md"></div>
                <Gift className="stroke-[2.5px] relative" size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-stone-850 text-base">গিফট কোড রিডিম করুন</h3>
                <p className="text-stone-500 text-xs px-4 leading-relaxed">
                  আপনার প্রাপ্ত স্পেশাল প্রমোশনাল গিফট কোডটি নিচের ঘরে বসিয়ে বোনাস রিওয়ার্ডটি সরাসরি আপনার মেইন ব্যালেন্সে যোগ করে নিন।
                </p>
              </div>

              <form onSubmit={handleClaimGiftCode} className="w-full max-w-xs space-y-4 pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={giftCodeInput}
                    onChange={(e) => setGiftCodeInput(e.target.value)}
                    placeholder="কোডটি এখানে লিখুন (যেমন: BONUS100)"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-2xl px-4 py-3.5 text-center font-black text-sm tracking-widest text-stone-900 uppercase focus:outline-hidden transition-all shadow-2xs placeholder:text-stone-400 placeholder:font-bold placeholder:tracking-normal"
                    disabled={giftCodeSubmitting}
                  />
                </div>

                {giftCodeError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#e11d48] text-xs font-bold bg-rose-50 border border-rose-100 p-3 rounded-xl leading-relaxed">
                    {giftCodeError}
                  </motion.div>
                )}

                {giftCodeSuccess && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 p-3 rounded-xl leading-relaxed">
                    {giftCodeSuccess}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={giftCodeSubmitting}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {giftCodeSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ভেরিফাই হচ্ছে...
                    </span>
                  ) : (
                    <>
                      <Check size={14} className="stroke-[3px]" />
                      বোনাস ক্লেম করুন
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* VIEW: INSTALL APP */}
        {activeTab === 'install-app' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
            <div className="flex justify-between items-center bg-white border border-stone-150 p-3 rounded-2xl shadow-2xs">
              <button 
                onClick={() => switchTab('home')} 
                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 border border-stone-200 bg-stone-50 hover:bg-stone-100 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <span className="text-[11px] text-stone-500 font-extrabold font-mono">অ্যাপ ডাউনলোড (PWA Install)</span>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-5">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center relative shadow-xs">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-md"></div>
                <Download className="stroke-[2.5px] relative animate-bounce" size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-stone-850 text-base font-sans">টি-শার্ট ও মোবাইল অ্যাপের মত ব্যবহার করুন</h3>
                <p className="text-stone-500 text-xs px-4 leading-relaxed font-sans">
                  TakaHub Pro এখন আপনি কোনো ঝামেলা ছাড়াই সরাসরি আপনার ফোনে ডাউনলোড ও ইনস্টল করে ব্যবহার করতে পারবেন।
                </p>
              </div>

              {/* Status or direct download button */}
              {isAppInstalled ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-4 rounded-2xl leading-relaxed w-full max-w-xs font-sans">
                  🎉 অভিনন্দন! আপনি ইতিমধ্যেই অ্যাপটি আপনার ফোনের হোম স্ক্রিনে ইনস্টল করে ব্যবহার করছেন।
                </div>
              ) : (
                <div className="w-full max-w-xs space-y-4">
                  {deferredPrompt ? (
                    <button
                      onClick={async () => {
                        if (deferredPrompt) {
                          deferredPrompt.prompt();
                          const { outcome } = await deferredPrompt.userChoice;
                          if (outcome === 'accepted') {
                            setIsAppInstalled(true);
                            setDeferredPrompt(null);
                          }
                        }
                      }}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs py-4 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Download size={14} className="stroke-[3px]" />
                      অ্যাপটি সরাসরি ইনস্টল করুন
                    </button>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 text-stone-600 text-xs font-bold p-4 rounded-2xl leading-relaxed font-sans">
                      💡 সরাসরি ইনস্টল বাটন দেখা না গেলে নিচের সহজ গাইডটি অনুসরণ করে ১ সেকেন্ডে ডাউনলোড করে নিন।
                    </div>
                  )}
                </div>
              )}

              {/* Installation Guide Cards */}
              <div className="w-full text-left space-y-4 pt-2">
                <h4 className="font-extrabold text-stone-850 text-xs tracking-wider uppercase border-b border-stone-150 pb-2 font-sans">ইনস্টলেশন গাইড (Installation Guide)</h4>
                
                {/* Android / Chrome */}
                <div className="bg-stone-50 hover:bg-stone-100/50 border border-stone-150 p-4 rounded-2xl space-y-2 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center rounded-full font-mono">১</span>
                    <span className="font-extrabold text-stone-850 text-xs font-sans">অ্যান্ড্রয়েড ফোন (Android / Chrome)</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-stone-500 space-y-1 font-bold font-sans">
                    <li>ডানদিকের উপরে থাকা <strong className="text-stone-800">৩টি ডট (Menu)</strong> আইকনে ক্লিক করুন।</li>
                    <li>সেখান থেকে <strong className="text-stone-800">"Install app"</strong> অথবা <strong className="text-stone-800">"Add to Home screen"</strong> অপশনে ক্লিক করুন।</li>
                    <li>কয়েক সেকেন্ডের মধ্যে অ্যাপটি আপনার ফোনের হোম স্ক্রিনে চলে আসবে!</li>
                  </ul>
                </div>

                {/* iPhone / Safari */}
                <div className="bg-stone-50 hover:bg-stone-100/50 border border-stone-150 p-4 rounded-2xl space-y-2 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center rounded-full font-mono">২</span>
                    <span className="font-extrabold text-stone-850 text-xs font-sans">আইফোন (iPhone / iPad / Safari)</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-stone-500 space-y-1 font-bold font-sans">
                    <li>সাফারি ব্রাউজারের নিচে থাকা <strong className="text-stone-800">Share (শেয়ার)</strong> বাটনে ক্লিক করুন।</li>
                    <li>একটু নিচের দিকে স্ক্রোল করে <strong className="text-stone-800">"Add to Home Screen"</strong> অপশনটিতে ক্লিক করুন।</li>
                    <li>ডানদিকের কোণায় <strong className="text-stone-800">Add</strong> বাটনে ক্লিক করুন। এখন এটি আপনার আইফোনের স্ক্রিনে অ্যাপ হিসেবে কাজ করবে!</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-[#764ba2] flex items-center gap-1.5 font-sans">
                <Play className="text-[#764ba2] fill-[#764ba2]" size={19} />
                <span>বিজ্ঞাপন দেখে আনলিমিটেড ইনকাম</span>
              </h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition"
              >
                হোমে ফিরুন
              </button>
            </div>

            {globalSettings.adsMaintenanceEnabled ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                  <AlertOctagon size={28} />
                </div>
                <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
                <p className="text-stone-500 text-xs leading-relaxed max-w-sm">
                  {globalSettings.adsMaintenanceMessage || 'বিজ্ঞাপন সার্ভারের কাজ চলছে। খুব শীঘ্রই এই সেবাটি পুনরায় চালু করা হবে।'}
                </p>
                <button 
                  onClick={() => switchTab('home')}
                  className="bg-stone-900 text-white font-bold text-xs py-2 px-5 rounded-xl transition"
                >
                  হোমে যান
                </button>
              </div>
            ) : (
              <>
                {/* Premium Ads Balance Card */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-5 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-[-15px] right-[-15px] w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                  <div className="space-y-1 z-10 relative">
                    <span className="text-white/80 text-[10px] uppercase font-black tracking-wider block">আপনার বিজ্ঞাপন ব্যালেন্স</span>
                    <h2 className="text-3xl font-black font-sans leading-none">
                      ৳{(userData?.adsBalance || 0).toFixed(2)}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-stone-700 font-bold px-1 text-sm">
                    <Play size={16} className="text-[#764ba2]" />
                    <span>চলতি বিজ্ঞাপন সমূহ</span>
                  </div>

                  {/* Adsterra Sponsor Link Block */}
                  {globalSettings.adsterraDirectLink && (
                    <div className="bg-[#764ba2]/5 border border-[#764ba2]/10 p-5 rounded-[24px] relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-[-20px] left-[-20px] w-16 h-16 bg-[#764ba2]/10 rounded-full blur-lg"></div>
                      <div className="absolute bottom-[-20px] right-[-20px] w-16 h-16 bg-[#667eea]/10 rounded-full blur-lg"></div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Sponsor Ad</span>
                          <span className="bg-indigo-100 text-[#764ba2] text-[8px] font-bold px-2 py-0.5 rounded-full">এডস্টেরা স্পেশাল</span>
                        </div>
                        <span className="text-xs font-black text-rose-600 font-sans">
                          ৳{parseFloat(globalSettings.adsterraDirectReward as any || '0.15').toFixed(2)}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-stone-800 mb-1">স্পেশাল বিজ্ঞাপন দেখে ৳{globalSettings.adsterraDirectReward || '0.15'} আয় করুন!</h4>
                      {(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const lastDate = userData?.lastAdsterraDate || '';
                        const currentCount = (lastDate === todayStr) ? (userData?.dailyAdsterraCount || 0) : 0;
                        const limit = globalSettings.adsterraDailyLimit || 10;
                        return (
                          <div className="text-[10px] text-[#764ba2] font-black mb-2 bg-[#764ba2]/10 px-2.5 py-1 rounded-lg w-fit inline-block">
                            আজকের লিমিট: {currentCount} / {limit} টি বিজ্ঞাপন
                          </div>
                        );
                      })()}
                      <p className="text-stone-500 text-[10px] leading-relaxed mb-3">
                        নিচের বাটনে ক্লিক করে বিজ্ঞাপনটি স্ক্রিনে ১৫ সেকেন্ড লোড রাখুন এবং ক্লেইম বোনাস সম্পন্ন করুন।
                      </p>
                      <button 
                        onClick={handleWatchAdsterraAd}
                        disabled={isAdWatching || isAdsterraWatching}
                        className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white text-[11px] font-bold py-2.5 rounded-xl transition disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Play size={10} className="fill-white" />
                        {isAdsterraWatching ? `অপেক্ষা করুন... ${adsterraCountdown}S` : 'স্পেশাল এড দেখুন'}
                      </button>
                    </div>
                  )}

                  {/* Standard Ads Block */}
                  {ads.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {ads.map(ad => (
                        <div 
                          key={ad.id} 
                          className="bg-white border border-stone-200 p-3.5 rounded-2xl flex flex-col justify-between shadow-xs text-center"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-stone-800 truncate mb-1">{ad.title}</h4>
                            <span className="inline-block bg-indigo-50 text-xs font-bold text-indigo-600 px-2 py-0.5 rounded-md mb-3">
                              ৳{(ad.reward || 0.1).toFixed(2)}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleWatchAd(ad)}
                            disabled={isAdWatching}
                            className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white text-[11px] font-bold py-2 rounded-xl transition disabled:bg-stone-300 disabled:cursor-not-allowed"
                          >
                            {isAdWatching && currentActiveAd?.id === ad.id ? `${adCountdown}S অপেক্ষা...` : 'ভিডিও দেখুন'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !globalSettings.adsterraDirectLink && (
                      <div className="bg-white border border-stone-200 p-8 rounded-3xl text-center shadow-xs">
                        <Play size={32} className="text-stone-300 mx-auto mb-2" />
                        <p className="text-stone-500 text-xs leading-normal font-medium">বর্তমানে কোনো বিজ্ঞাপন ক্যাম্পেইন পেন্ডিং নেই।</p>
                      </div>
                    )
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 mt-4">
                  <h4 className="text-xs font-extrabold text-stone-850">⚠️ বিজ্ঞাপন দেখার নিয়মাবলি:</h4>
                  <ul className="text-[10px] text-stone-500 list-disc list-inside space-y-1 font-semibold leading-relaxed">
                    <li>বিজ্ঞাপনটি চালু করার পর নির্ধারিত সময় সম্পূর্ণ না হওয়া পর্যন্ত স্ক্রিন বন্ধ করবেন না।</li>
                    <li>একটি বিজ্ঞাপন দেখার পর বিজ্ঞাপন ব্যালেন্স সরাসরি যুক্ত হয়ে যাবে।</li>
                    <li>বিজ্ঞাপন ব্যালেন্স আলাদাভাবে টাকা উত্তোলনে গিয়ে উত্তোলন করতে পারবেন।</li>
                    <li>ভুল উপায়ে বিজ্ঞাপন স্কিপ করার চেষ্টা করলে একাউন্ট বন্ধ করা হতে পারে।</li>
                  </ul>
                </div>
              </>
            )}

            {(isAdsterraWatching || isAdWatching) && (
              <AdsterraScriptBanner scriptCode={globalSettings.adsterraScriptCode || ''} />
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24 font-sans">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-extrabold text-[#764ba2] flex items-center gap-1.5">
                <User size={19} className="text-[#764ba2]" />
                <span>আমার প্রোফাইল (My Profile)</span>
              </h2>
              <button 
                onClick={() => switchTab('home')}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition"
              >
                হোমে ফিরুন
              </button>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-6">
              {/* Profile Avatar & Header */}
              <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-sm uppercase">
                  {(userData?.username || 'U')[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#764ba2] text-sm leading-tight">{userData?.username || 'ইউজার প্রোফাইল'}</h3>
                  <span className="text-[10px] text-stone-400 font-mono tracking-tight block mt-0.5">আইডি: {userId}</span>
                  <div className="flex items-center gap-1 mt-1 text-[9.5px] text-[#764ba2] font-semibold bg-[#764ba2]/5 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle size={9.5} className="text-[#764ba2] fill-transparent" />
                    <span>নিবন্ধিত ব্যবহারকারী</span>
                  </div>
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs py-3 px-4 rounded-xl font-bold">
                    ✓ {profileSuccessMsg}
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="bg-rose-50 border border-rose-200/60 text-rose-600 text-xs py-3 px-4 rounded-xl font-bold">
                    ⚠️ {profileErrorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-stone-600 text-xs font-bold block">সম্পূর্ণ নাম (Full Name)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <User size={14} />
                      </span>
                      <input 
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                        className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-stone-850 placeholder-stone-400 focus:outline-none focus:border-[#764ba2] focus:bg-white transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Gmail (Read Only) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-stone-600 text-xs font-bold">জিমেইল এড্রেস (Registered Gmail)</label>
                      <span className="text-[9px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">পরিবর্তনযোগ্য নয়</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Mail size={14} />
                      </span>
                      <input 
                        type="email"
                        value={userEmail || ''}
                        disabled
                        className="w-full bg-stone-100 border border-stone-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-stone-500 cursor-not-allowed"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                        <Lock size={12} />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Birth Date */}
                    <div className="space-y-1">
                      <label className="text-stone-600 text-xs font-bold block">জন্ম তারিখ (Birth Date)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Calendar size={14} />
                        </span>
                        <input 
                          type="text"
                          value={profileBirth}
                          onChange={(e) => setProfileBirth(e.target.value)}
                          placeholder="দিন/মাস/বছর"
                          className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-stone-850 placeholder-stone-400 focus:outline-none focus:border-[#764ba2] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Sex / Gender Select */}
                    <div className="space-y-1">
                      <label className="text-stone-600 text-xs font-bold block">লিঙ্গ (Gender)</label>
                      <select 
                        value={profileSex}
                        onChange={(e) => setProfileSex(e.target.value)}
                        className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl py-2.5 px-3 text-xs font-semibold text-stone-850 focus:outline-none focus:border-[#764ba2] focus:bg-white transition"
                      >
                        <option value="Male">পুরুষ (Male)</option>
                        <option value="Female">মহিলা (Female)</option>
                        <option value="Other">অন্যান্য (Other)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Job / Occupation */}
                    <div className="space-y-1">
                      <label className="text-stone-600 text-xs font-bold block">পেশা (Occupation)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Briefcase size={14} />
                        </span>
                        <input 
                          type="text"
                          value={profileJob}
                          onChange={(e) => setProfileJob(e.target.value)}
                          placeholder="ছাত্র, চাকুরীজীবী..."
                          className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-stone-850 placeholder-stone-400 focus:outline-none focus:border-[#764ba2] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="text-stone-600 text-xs font-bold block">ঠিকানা (Location)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <MapPin size={14} />
                        </span>
                        <input 
                          type="text"
                          value={profileLocation}
                          onChange={(e) => setProfileLocation(e.target.value)}
                          placeholder="যেমন: ঢাকা"
                          className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-stone-850 placeholder-stone-400 focus:outline-none focus:border-[#764ba2] focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{isUpdatingProfile ? 'তথ্য সংরক্ষণ করা হচ্ছে...' : 'প্রোফাইল সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* --- CARD TAB: INVESTMENT PLANS --- */}
        {activeTab === 'investment-plans' && (globalSettings.investmentMaintenanceEnabled ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24 font-sans">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              Back
            </button>
            <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <AlertOctagon size={28} />
              </div>
              <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
              <p className="text-[#e11d48] text-xs text-center font-medium bg-rose-50 border border-rose-200/55 p-4 rounded-xl max-w-sm leading-relaxed">
                {globalSettings.investmentMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ইনভেস্টমেন্ট সিস্টেম বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24 font-sans">
            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-6 rounded-3xl text-white shadow-lg space-y-2">
              <h2 className="text-lg font-black flex items-center gap-2">
                <TrendingUp size={22} className="text-emerald-300" />
                <span>ইনভেস্টমেন্ট ও দৈনিক প্রফিট আর্নিং</span>
              </h2>
              <p className="text-white/80 text-[11px] leading-relaxed font-semibold">
                আপনার পছন্দের ইনভেস্টমেন্ট প্ল্যান কিনে প্রতিদিন নিশ্চিত ইনকাম উপার্জন শুরু করুন। আপনার কেনা সমস্ত প্ল্যান থেকে প্রতি ২৪ ঘণ্টায় একবার করে দৈনিক রিওয়ার্ড ক্লেইম করুন যা সরাসরি আপনার মূল ব্যালেন্সে যোগ হবে!
              </p>
            </div>

            {/* SECTION 1: USER'S ACTIVE PLANS */}
            <div className="bg-stone-50 p-4 rounded-3xl border border-stone-150 space-y-4">
              <h3 className="text-stone-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-2">
                <Coins size={14} className="text-amber-500" />
                <span>আমার ইনভেস্টমেন্ট ট্র্যাকার ({purchasedPlans.length})</span>
              </h3>

              {purchasedPlans.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500 text-xs py-10 font-bold space-y-1">
                  <p>আপনার কোনো সক্রিয় ইনভেস্টমেন্ট প্ল্যান নেই।</p>
                  <p className="text-[10px] text-stone-400 font-medium">নিচের তালিকা থেকে একটি উপযুক্ত প্ল্যান বেছে নিয়ে সচল করুন এবং দৈনিক উপার্জন করুন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {purchasedPlans.map((purchased) => {
                    const daily = purchased.dailyIncome || (purchased.dailyReturn) || 0;
                    const canClaim = purchased.status === 'active' && purchased.claimsLeft > 0;
                    
                    // Time checking
                    const now = Date.now();
                    const oneDayInMs = 23 * 60 * 60 * 1000;
                    const elapsed = now - purchased.lastClaimDate;
                    const isTimeReady = purchased.lastClaimDate === 0 || elapsed >= oneDayInMs;

                    let claimStatusText = '';
                    let claimSubText = '';
                    if (purchased.status === 'completed' || purchased.claimsLeft <= 0) {
                      claimStatusText = 'মেয়াদ শেষ 🔒';
                      claimSubText = 'সমস্ত রিওয়ার্ড ক্লেইম করা হয়েছে।';
                    } else if (!isTimeReady) {
                      const msLeft = oneDayInMs - elapsed;
                      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
                      const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
                      claimStatusText = `${hoursLeft}ঘণ্টা ${minsLeft}মি. পর ক্লেইম`;
                      claimSubText = `২৪ ঘণ্টা পর পরবর্তী দৈনিক প্রফিট সচল হবে।`;
                    } else {
                      claimStatusText = 'ক্লেইম করুন 💰';
                      claimSubText = `ক্লিক করে ৳${daily.toFixed(2)} ব্যালেন্সে যুক্ত করুন!`;
                    }

                    return (
                      <div key={purchased.id} className="bg-white border border-stone-150 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start border-b border-stone-100 pb-2">
                            <div>
                              <h4 className="font-extrabold text-[#764ba2] text-sm">{purchased.planName}</h4>
                              <p className="text-[9px] text-stone-400 font-mono">আইডি: {purchased.id.substring(0, 8)}...</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold shadow-2xs ${
                              purchased.status === 'active' ? 'bg-[#764ba2]/5 text-[#764ba2] border border-[#764ba2]/20' : 'bg-stone-100 text-stone-400'
                            }`}>
                              {purchased.status === 'active' ? 'চলমান' : 'সম্পন্ন'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-sans">
                            <div className="bg-stone-50 p-2 rounded-xl">
                              <span className="text-stone-400 block mb-0.5">মূল্য</span>
                              <span className="font-bold text-stone-700">৳{purchased.cost}</span>
                            </div>
                            <div className="bg-stone-50 p-2 rounded-xl">
                              <span className="text-stone-400 block mb-0.5">মোট প্রাপ্তি</span>
                              <span className="font-bold text-emerald-600">৳{purchased.totalReturn}</span>
                            </div>
                            <div className="bg-stone-50 p-2 rounded-xl">
                              <span className="text-stone-400 block mb-0.5">দৈনিক প্রফিট</span>
                              <span className="font-bold text-emerald-600">৳{daily.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] font-medium text-stone-600">
                            <div className="flex justify-between">
                              <span>মোট ক্লেইমকৃত টাকা:</span>
                              <span className="font-bold text-stone-850">৳{(purchased.totalClaimed || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>মোট ক্লেইমের মেয়াদ:</span>
                              <span className="font-bold text-slate-800">{purchased.validityDays} দিন</span>
                            </div>
                            <div className="flex justify-between">
                              <span>আজ পর্যন্ত ক্লেইম:</span>
                              <span className="font-black text-rose-550">{purchased.validityDays - purchased.claimsLeft} বার</span>
                            </div>
                            <div className="flex justify-between">
                              <span>অবশিষ্ট ক্লেইম:</span>
                              <span className="font-black text-emerald-550">{purchased.claimsLeft} বার</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100">
                          {purchased.status === 'active' && purchased.claimsLeft > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleClaimInvestmentPlan(purchased)}
                              disabled={!isTimeReady}
                              className={`w-full py-3 rounded-xl text-xs font-black tracking-wide transition shadow-sm cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                isTimeReady 
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                  : 'bg-stone-100 text-stone-400 border border-stone-150/40 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-[11px]">{claimStatusText}</span>
                              <span className={`text-[9px] font-medium leading-none ${isTimeReady ? 'text-white/80' : 'text-stone-400/80'}`}>{claimSubText}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2.5 bg-stone-100/60 border border-stone-150 text-stone-400 rounded-xl text-[10px] font-bold"
                            >
                              এই প্ল্যানের মেয়াদ উত্তীর্ণ হয়েছে 🔒
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: AVAILABLE INVESTMENT PLANS */}
            <div className="space-y-4">
              <h3 className="text-stone-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 pb-2">
                <TrendingUp size={14} className="text-[#764ba2]" />
                <span>উপলব্ধ সেরা ইনভেস্টমেন্ট প্ল্যানসমূহ ({investmentPlans.length})</span>
              </h3>

              {investmentPlans.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-500 text-xs font-medium">
                  বর্তমানে নতুন কোনো ইনভেস্টমেন্ট প্ল্যান উপলব্ধ নেই। এডমিন নতুন প্ল্যান যোগ করলে এখানে দেখতে পাবেন।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {investmentPlans.map((plan) => {
                    const daily = plan.totalReturn / plan.validityDays;
                    const costString = plan.cost.toFixed(0);
                    return (
                      <div key={plan.id} className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all relative overflow-hidden group">
                        {/* Golden corner badge */}
                        <div className="absolute top-0 right-0 bg-[#764ba2] text-white text-[9px] font-extrabold px-3 py-1.5 rounded-bl-xl leading-none uppercase shadow-sm">
                          HOT 🔥
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h4 className="text-stone-800 text-sm font-black tracking-tight">{plan.name}</h4>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-[#764ba2]">৳{costString}</span>
                              <span className="text-[10px] text-stone-400 font-bold">অ্যাক্টিভেশন ফি</span>
                            </div>
                          </div>

                          <div className="bg-[#764ba2]/5 p-3 rounded-2xl border border-[#764ba2]/10 space-y-1.5 text-xs text-stone-700 font-medium font-sans">
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500 text-[11px]">মোট রিটার্ন রিওয়ার্ড:</span>
                              <span className="font-extrabold text-emerald-650">৳{plan.totalReturn}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500 text-[11px]">দৈনিক ক্লেইম প্রফিট:</span>
                              <span className="font-extrabold text-emerald-650">৳{daily.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500 text-[11px]">মেয়াদকাল:</span>
                              <span className="font-black text-slate-800">{plan.validityDays} দিন (Days)</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-stone-400 leading-normal text-center bg-stone-50 px-2 py-1.5 rounded-xl font-medium">
                            ৳{costString} দিয়ে সচল করলে প্রতিদিন ৳{daily.toFixed(1)} লাভ সহ মেয়াদকাল ধরে সর্বমোট ৳{plan.totalReturn} ফেরত আসবে।
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => handleBuyInvestmentPlan(plan)}
                            className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Coins size={14} />
                            <span>প্ল্যানটি চালু করুন 🛒</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CONFIRMATION POPUP OVERLAY */}
            <AnimatePresence>
              {investmentConfirm?.show && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setInvestmentConfirm(null)}
                    className="fixed inset-0 bg-black/60 z-[55] backdrop-blur-xs"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-x-5 bottom-10 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 z-[55] space-y-4"
                  >
                    <div className="bg-[#764ba2]/5 text-[#764ba2] w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                      <TrendingUp size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-stone-850 font-black text-sm">ইনভেস্টমেন্ট প্ল্যান নিশ্চিতকরণ</h4>
                      <p className="text-stone-500 text-xs leading-relaxed font-semibold">
                        আপনি কি নিশ্চিতভাবে <span className="text-[#764ba2] font-black">৳{investmentConfirm.plan.cost}</span> ফি দিয়ে <span className="text-slate-800 font-extrabold">'{investmentConfirm.plan.name}'</span> ইনভেস্টমেন্ট প্ল্যানটি চালু করতে চান?
                      </p>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl space-y-1 border border-stone-150/60 text-xs text-stone-600 font-medium">
                      <div className="flex justify-between">
                        <span>মোট রিটার্ন প্রফিট:</span>
                        <span className="font-extrabold text-emerald-600">৳{investmentConfirm.plan.totalReturn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>মেয়াদকাল:</span>
                        <span className="font-bold text-slate-800">{investmentConfirm.plan.validityDays} দিন</span>
                      </div>
                      <div className="flex justify-between">
                        <span>দৈনিক আয়:</span>
                        <span className="font-bold text-emerald-600">৳{(investmentConfirm.plan.totalReturn / investmentConfirm.plan.validityDays).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setInvestmentConfirm(null)}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        বাতিল করুন
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBuyInvestment}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-sm"
                      >
                        হ্যাঁ, সচল করুন ✔
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {activeTab === 'game' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
            <div className="flex justify-between items-center mb-1 font-sans">
              <h2 className="text-base font-extrabold text-[#764ba2] flex items-center gap-1.5 font-sans">
                <Gamepad2 size={19} className="text-[#764ba2]" />
                <span>
                  {selectedGame === 'menu' && 'গেম এন্ড আর্ন জোন 🎮'}
                  {selectedGame === 'ttt' && 'টিক ট্যাক টো খেলা'}
                  {selectedGame === 'sholo' && '১৬ গুটি খেলা (Bead 16)'}
                </span>
              </h2>
              <button 
                onClick={() => {
                  if (selectedGame !== 'menu') {
                    setSelectedGame('menu');
                  } else {
                    switchTab('home');
                  }
                }}
                className="text-stone-500 hover:text-[#764ba2] text-xs font-bold transition font-sans"
              >
                {selectedGame !== 'menu' ? 'গেম মেনু' : 'হোমে ফিরুন'}
              </button>
            </div>

            {globalSettings.gameMaintenanceEnabled ? (
              <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xs text-center flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-fuchsia-50 text-fuchsia-500 rounded-full flex items-center justify-center shadow-xs">
                  <Gamepad2 size={24} />
                </div>
                <h3 className="font-extrabold text-stone-850 text-base">দুঃখিত! এই গেম সার্ভিসটি সাময়িকভাবে বন্ধ আছে</h3>
                <p className="text-fuchsia-600 text-xs text-center font-medium bg-fuchsia-50/50 border border-fuchsia-250 p-4 rounded-xl max-w-sm leading-relaxed">
                  {globalSettings.gameMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের খেলা ও ইনকাম সেবা বর্তমানে বন্ধ রয়েছে। দ্রুতই চালু করা হবে।'}
                </p>
              </div>
            ) : (
              <div>
                {selectedGame === 'menu' && (
                  <div className="space-y-4 font-sans">
                    {/* Game Introduction Hub */}
                    <div className="bg-gradient-to-br from-[#764ba2]/10 to-[#667eea]/10 border border-[#764ba2]/20 p-5 rounded-3xl space-y-2">
                      <span className="text-[10px] text-fuchsia-600 font-extrabold tracking-wider uppercase block">WELCOME TO GAME HUB</span>
                      <h3 className="text-sm font-extrabold text-stone-850 leading-tight">পছন্দের গেম খেলে সরাসরি ওয়ালেট ব্যালেন্স আর্ন করুন!</h3>
                      <p className="text-xs text-stone-600 font-medium leading-relaxed">
                        আপনি ফ্রী খেলে বা বাজি নিয়ে আমাদের গেম জোনে খেলে দ্বিগুণ রিওয়ার্ড জিততে পারবেন। আজই আপনার পছন্দের খেলায় ক্লিক করুন।
                      </p>
                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 gap-4 font-sans">
                      {/* Tic-Tac-Toe Menu Card */}
                      <div 
                        onClick={() => setSelectedGame('ttt')}
                        className="bg-white border-2 border-stone-150 hover:border-[#764ba2] p-5 rounded-3xl cursor-pointer shadow-xs hover:shadow-md transition duration-200 flex items-center justify-between group"
                      >
                        <div className="space-y-2 max-w-[70%] text-left">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-0.5 rounded-full">Classic 3x3</span>
                          </div>
                          <h4 className="font-black text-stone-850 text-sm group-hover:text-[#764ba2] transition">টিক ট্যাক টো (Tic Tac Toe)</h4>
                          <p className="text-xs text-stone-500 font-medium leading-relaxed">কম্পিউটারের সাথে বুদ্ধির লড়াইয়ে ফ্রী বা বাজি ধরে ইনস্ট্যান্ট উইনিং রিওয়ার্ড অর্জন করুন।</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition duration-200 shrink-0">
                          <Grid size={24} />
                        </div>
                      </div>

                      {/* Sholo Guti Menu Card */}
                      <div 
                        onClick={() => setSelectedGame('sholo')}
                        className="bg-white border-2 border-stone-150 hover:border-[#764ba2] p-5 rounded-3xl cursor-pointer shadow-xs hover:shadow-md transition duration-200 flex items-center justify-between group"
                      >
                        <div className="space-y-2 max-w-[70%] text-left">
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2.5 py-0.5 rounded-full">Bead 16 / ১৬ গুটি</span>
                          </div>
                          <h4 className="font-black text-stone-850 text-sm group-hover:text-[#764ba2] transition">১৬ গুটি খেলা (Sholo Guti)</h4>
                          <p className="text-xs text-stone-500 font-medium leading-relaxed">ঐতিহ্যবাহী ১৬ গুতি বোর্ডের রোমাঞ্চকর স্ট্র্যাটেজি গেম। ফ্রী বা বড় বাজি ধরে খেলুন!</p>
                        </div>
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition duration-200 shrink-0">
                          <Gamepad2 size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tic Tac Toe game screen */}
                {selectedGame === 'ttt' && (
                  <div className="space-y-4">
                    {/* Intro Rules */}
                    <div className="bg-white border border-stone-200 p-4 rounded-3xl space-y-2 font-sans">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-fuchsia-500 font-extrabold tracking-wider uppercase block">ইনস্ট্রাকশন ও নিয়মাবলী</span>
                        <button onClick={() => setSelectedGame('menu')} className="text-xs text-[#764ba2] font-black">← অন্য গেম খেলুন</button>
                      </div>
                      <div className="text-xs text-stone-600 space-y-1 bg-stone-50/50 p-3 rounded-2xl leading-relaxed font-semibold font-sans text-left">
                        <div>🎮 <strong className="text-[#764ba2]">Free খেললে:</strong> দৈনিক লিমিট <strong className="text-fuchsia-500">{globalSettings.gameDailyLimit || 5} বার</strong>। ম্যাচে জিতলে <strong className="text-emerald-600">৳{globalSettings.gameFreeReward || 1}</strong> প্রফিট।</div>
                        <div>🔥 <strong className="text-[#764ba2]">Bet খেললে:</strong> সর্বনিম্ন বাজি <strong className="text-rose-600">৳৫</strong>। জিতলে সরাসরি বাজি ব্যালেন্স <strong className="text-emerald-500">২ গুন (2x)</strong> ক্যাশব্যাক!</div>
                      </div>
                    </div>

                    {tttGameState === 'idle' ? (
                      <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-5 font-sans font-sans">
                        <div className="flex bg-stone-100 p-1 rounded-2xl">
                          <button 
                            onClick={() => { setTttGameMode('free'); setTttGameMessage({ text: '', type: '' }); }}
                            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${tttGameMode === 'free' ? 'bg-white text-[#764ba2] shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                          >
                            ফ্রী গেম (Free Mode)
                          </button>
                          <button 
                            onClick={() => { setTttGameMode('bet'); setTttGameMessage({ text: '', type: '' }); }}
                            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${tttGameMode === 'bet' ? 'bg-white text-[#764ba2] shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                          >
                            বাজি গেম (Bet Mode)
                          </button>
                        </div>

                        {tttGameMode === 'free' ? (
                          <div className="space-y-4 text-center">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                              <span className="text-[11px] font-bold text-amber-700">আজকের অবশিষ্ট ফ্রী লিমিট</span>
                              <strong className="text-lg font-black text-amber-900">
                                {(() => {
                                  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
                                  const lastDate = userData?.lastGameDate || '';
                                  const currentCount = (lastDate === todayStr) ? (userData?.dailyGameCount || 0) : 0;
                                  const limit = globalSettings.gameDailyLimit || 5;
                                  return Math.max(0, limit - currentCount);
                                })()} / {globalSettings.gameDailyLimit || 5} ম্যাচ
                              </strong>
                            </div>
                            <button 
                              onClick={() => startTttGame('free')}
                              className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white py-3.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                            >
                              <Gamepad2 size={16} />
                              <span>ফ্রী ম্যাচ শুরু করুন (৳{globalSettings.gameFreeReward || 1} পুরষ্কার)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-4 flex justify-between items-center">
                              <span className="text-xs font-bold text-fuchsia-800">আপনার বর্তমান ব্যালেন্স:</span>
                              <strong className="text-base font-black text-fuchsia-900">৳{(userData?.balance || 0).toFixed(2)}</strong>
                            </div>

                            <div className="space-y-2 text-left">
                              <label className="text-xs font-bold text-stone-700 block pl-1">আপনার বাজির পরিমাণ (৳)</label>
                              <input 
                                type="number"
                                min="5"
                                placeholder="যেমন: ৫, ১০, ২০ টাকা"
                                value={tttBetInput}
                                onChange={(e) => setTttBetInput(e.target.value)}
                                className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-3.5 text-xs font-extrabold outline-none transition"
                              />
                              <p className="text-[9px] text-stone-400 font-bold pl-1">বাজি ধরে জিতলে আপনি পাবেন দ্বিগুণ টাকা (2x Payout)!</p>
                            </div>

                            <button 
                              onClick={() => startTttGame('bet')}
                              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                            >
                              <Gamepad2 size={16} />
                              <span>৳ইন্সট্যান্ট বাজি ধরে খেলা শুরু করুন</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs text-center space-y-5 font-sans">
                        <div className="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-150 text-xs">
                          <div className="text-left font-semibold">
                            <span className="text-[10px] text-stone-400 font-bold uppercase block leading-none">মোড: {tttGameMode === 'free' ? 'ফ্রী ম্যাচ' : 'বাজি ম্যাচ'}</span>
                            {tttGameMode === 'bet' && (
                              <span className="text-xs font-black text-fuchsia-600 block mt-1 leading-none">বাজি পরিমাণ: ৳{tttActiveBet}</span>
                            )}
                          </div>
                          <span className={`font-extrabold px-3 py-1.5 rounded-full ${isAiThinking ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-emerald-50 text-emerald-700'}`}>
                            {tttStatusText}
                          </span>
                        </div>

                        <div className="flex justify-center py-2">
                          <div className="grid grid-cols-3 gap-3 bg-stone-100 p-3 rounded-2xl">
                            {tttBoard.map((val, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleTttCellClick(idx)}
                                disabled={tttGameState !== 'playing' || isAiThinking || val !== null}
                                className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-black transition-all cursor-pointer shadow-xs ${
                                  val === 'X' 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                                    : val === 'O' 
                                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                      : 'bg-white border-2 border-stone-200 hover:bg-stone-50 active:scale-95 text-transparent'
                                }`}
                              >
                                {val || ''}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {tttGameMessage.text && (
                      <div className={`p-4 rounded-3xl text-center space-y-3.5 border font-sans ${
                        tttGameMessage.type === 'success' ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]' : 
                        tttGameMessage.type === 'error' ? 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239]' : 'bg-[#e0f2fe] border-[#bae6fd] text-[#075985]'
                      }`}>
                        <div className="text-xs font-bold leading-relaxed">{tttGameMessage.text}</div>
                        {tttGameState === 'ended' && (
                          <button
                            onClick={() => {
                              setTttGameState('idle');
                              setTttBoard(Array(9).fill(null));
                              setTttGameMessage({ text: '', type: '' });
                            }}
                            className="bg-stone-850 hover:bg-stone-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs animate-pulse"
                          >
                            নতুন খেলা শুরু করুন
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sholo Guti Game Screen */}
                {selectedGame === 'sholo' && (
                  <div className="space-y-4 font-sans">
                    {/* Intro Rules */}
                    <div className="bg-white border border-stone-200 p-4 rounded-3xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-fuchsia-500 font-extrabold tracking-wider uppercase block">১৬ গুটির নিয়ম কানুন</span>
                        <button onClick={() => setSelectedGame('menu')} className="text-xs text-[#764ba2] font-black">← অন্য গেম খেলুন</button>
                      </div>
                      <div className="text-xs text-stone-600 space-y-1 bg-stone-50/50 p-3 rounded-2xl leading-relaxed font-semibold font-sans text-left font-sans">
                        <div>🏆 <strong className="text-[#764ba2]">Free খেললে:</strong> দৈনিক লিমিট <strong className="text-fuchsia-500">{globalSettings.gameDailyLimit || 5} বার</strong>। ম্যাচে জিতলে <strong className="text-emerald-600">৳{globalSettings.gameFreeReward || 1}</strong> প্রফিট।</div>
                        <div>🔥 <strong className="text-[#764ba2]">Bet খেললে:</strong> সর্বনিম্ন বাজি <strong className="text-rose-600">৳৫</strong>। জিতলে সরাসরি বাজি ব্যালেন্স <strong className="text-emerald-500">২ গুন (2x)</strong> ক্যাশব্যাক!</div>
                        <div>♟️ গুটি চালতে প্রথমে সিলেক্ট করুন এবং সংলগ্ন খালি বৃত্তগুলোর উপরে ছুয়ে দিন। প্রতিপক্ষের গুটি টপকে ক্যাপচার করুন!</div>
                      </div>
                    </div>

                    {sholoGameState === 'idle' ? (
                      <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-5 font-sans">
                        <div className="flex bg-stone-100 p-1 rounded-2xl font-sans">
                          <button 
                            onClick={() => { setSholoGameMode('free'); setSholoGameMessage({ text: '', type: '' }); }}
                            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${sholoGameMode === 'free' ? 'bg-white text-[#764ba2] shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                          >
                            ফ্রী গেম (Free Mode)
                          </button>
                          <button 
                            onClick={() => { setSholoGameMode('bet'); setSholoGameMessage({ text: '', type: '' }); }}
                            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${sholoGameMode === 'bet' ? 'bg-white text-[#764ba2] shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                          >
                            বাজি গেম (Bet Mode)
                          </button>
                        </div>

                        {sholoGameMode === 'free' ? (
                          <div className="space-y-4 text-center font-sans">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                              <span className="text-[11px] font-bold text-amber-700">আজকের অবশিষ্ট ফ্রী লিমিট</span>
                              <strong className="text-lg font-black text-amber-900 font-sans">
                                {(() => {
                                  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
                                  const lastDate = userData?.lastGameDate || '';
                                  const currentCount = (lastDate === todayStr) ? (userData?.dailyGameCount || 0) : 0;
                                  const limit = globalSettings.gameDailyLimit || 5;
                                  return Math.max(0, limit - currentCount);
                                })()} / {globalSettings.gameDailyLimit || 5} ম্যাচ
                              </strong>
                            </div>
                            <button 
                              onClick={() => startSholoGame('free')}
                              className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white py-3.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                            >
                              <Gamepad2 size={16} />
                              <span>১৬ গুটি ফ্রী ম্যাচ শুরু করুন (৳{globalSettings.gameFreeReward || 1} পুরষ্কার)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 font-sans">
                            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-4 flex justify-between items-center text-left">
                              <span className="text-xs font-bold text-fuchsia-800">আপনার বর্তমান ব্যালেন্স:</span>
                              <strong className="text-base font-black text-fuchsia-900">৳{(userData?.balance || 0).toFixed(2)}</strong>
                            </div>

                            <div className="space-y-2 text-left">
                              <label className="text-xs font-bold text-stone-700 block pl-1">আপনার বাজির পরিমাণ (৳)</label>
                              <input 
                                type="number"
                                min="5"
                                placeholder="যেমন: ৫, ১০, ২০ টাকা"
                                value={sholoBetInput}
                                onChange={(e) => setSholoBetInput(e.target.value)}
                                className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-3.5 text-xs font-extrabold outline-none transition"
                              />
                              <p className="text-[9px] text-stone-400 font-bold pl-1">বাজি ধরে জিতলে আপনি পাবেন দ্বিগুণ টাকা (2x Payout)!</p>
                            </div>

                            <button 
                              onClick={() => startSholoGame('bet')}
                              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                            >
                              <Gamepad2 size={16} />
                              <span>৳ইন্সট্যান্ট বাজি নিয়ে ১৬ গুটি খেলা শুরু করুন</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-stone-200 p-4 rounded-3xl shadow-xs text-center space-y-4 font-sans">
                        {/* Sholo board status header */}
                        <div className="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-150 text-[11px] font-sans">
                          <div className="text-left font-bold text-stone-700">
                            <span className="text-[10px] text-stone-400 font-extrabold uppercase block leading-none">কোড: {sholoGameMode === 'free' ? 'ফ্রী ম্যাচ' : 'বাজি ম্যাচ'}</span>
                            {sholoGameMode === 'bet' && (
                              <span className="text-[11px] font-black text-[#764ba2] block mt-1 leading-none">বাজি: ৳{sholoActiveBet}</span>
                            )}
                          </div>
                          
                          {/* Live remaining pieces counter */}
                          <div className="flex items-center gap-1.5 font-sans">
                            <span className="bg-blue-50 text-blue-700 font-extrabold px-2 py-1 rounded-md text-[10px]">আপনার: {sholoBoard.filter(x => x === 'P').length}</span>
                            <span className="bg-rose-50 text-rose-700 font-extrabold px-2 py-1 rounded-md text-[10px]">কম্পিউটার: {sholoBoard.filter(x => x === 'C').length}</span>
                          </div>

                          <span className={`font-black px-2.5 py-1.5 rounded-full text-[10px] leading-none ${isSholoAiThinking ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-emerald-50 text-emerald-700'}`}>
                            {isSholoAiThinking ? 'কম্পিউটার ভাবছে...' : 'আপনার চাল'}
                          </span>
                        </div>

                        {/* Beautiful interactive SVG board */}
                        <div className="flex justify-center items-center py-1">
                          <svg 
                            className="w-full max-w-[340px] aspect-[5/6] mx-auto bg-stone-50 border border-stone-200 rounded-[28px] p-2 shadow-inner select-none transition" 
                            viewBox="5 0 90 120"
                          >
                            <defs>
                              <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
                                <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodOpacity="0.18" />
                              </filter>
                              <radialGradient id="playerGrad" cx="35%" cy="35%" r="55%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="65%" stopColor="#1d4ed8" />
                                <stop offset="100%" stopColor="#1e3a8a" />
                              </radialGradient>
                              <radialGradient id="cpuGrad" cx="35%" cy="35%" r="55%">
                                <stop offset="0%" stopColor="#f43f5e" />
                                <stop offset="65%" stopColor="#be123c" />
                                <stop offset="100%" stopColor="#881337" />
                              </radialGradient>
                            </defs>

                            {/* Connection Lines of Guti Board */}
                            {(() => {
                              const lines: React.ReactNode[] = [];
                              const addedPair = new Set<string>();
                              for (let u = 0; u < 37; u++) {
                                const uNode = SHOLO_NODES[u];
                                const neighbors = SHOLO_ADJ[u] || [];
                                for (const v of neighbors) {
                                  const pairStr = u < v ? `${u}-${v}` : `${v}-${u}`;
                                  if (!addedPair.has(pairStr)) {
                                    addedPair.add(pairStr);
                                    const vNode = SHOLO_NODES[v];
                                    lines.push(
                                      <line 
                                        key={pairStr} 
                                        x1={10 + uNode.x * 10} 
                                        y1={10 + uNode.y * 10} 
                                        x2={10 + vNode.x * 10} 
                                        y2={10 + vNode.y * 10} 
                                        stroke="#cbd5e1" 
                                        strokeWidth="1.75" 
                                        strokeLinecap="round" 
                                      />
                                    );
                                  }
                                }
                              }
                              return lines;
                            })()}

                            {/* Render Interactive Nodes, Hover Layers & Guti beads */}
                            {SHOLO_NODES.map(node => {
                              const cx = 10 + node.x * 10;
                              const cy = 10 + node.y * 10;
                              const piece = sholoBoard[node.id];
                              
                              const isSelected = sholoSelectedPiece === node.id;
                              
                              // Check if node is valid landing target for the selected piece
                              const playerValidMoves = sholoSelectedPiece !== null ? getSholoMoves(sholoBoard, 'P') : [];
                              const targetMove = playerValidMoves.find(m => m.from === sholoSelectedPiece && m.to === node.id);
                              const isTarget = !!targetMove;
                              
                              const handleNodeClick = () => {
                                if (sholoGameState !== 'playing' || isSholoAiThinking || sholoActiveTurn !== 'player') return;
                                
                                if (isTarget && targetMove) {
                                  executeSholoMove(targetMove);
                                } else if (piece === 'P') {
                                  setSholoSelectedPiece(node.id === sholoSelectedPiece ? null : node.id);
                                } else {
                                  setSholoSelectedPiece(null);
                                }
                              };

                              return (
                                <g 
                                  key={node.id} 
                                  onClick={handleNodeClick} 
                                  className="cursor-pointer group"
                                >
                                  {/* Transparent giant clickable shell */}
                                  <circle cx={cx} cy={cy} r={4.5} fill="transparent" />
                                  
                                  {/* Point/Base center intersection marker */}
                                  <circle cx={cx} cy={cy} r={1.2} fill="#94a3b8" />

                                  {/* Selection indicator glows */}
                                  {isSelected && (
                                    <circle 
                                      cx={cx} 
                                      cy={cy} 
                                      r={3.8} 
                                      fill="none" 
                                      stroke="#3b82f6" 
                                      strokeWidth="1.2" 
                                      className="animate-pulse" 
                                    />
                                  )}

                                  {/* Destination Targets static indicator */}
                                  {isTarget && (
                                    <circle 
                                      cx={cx} 
                                      cy={cy} 
                                      r={2.6} 
                                      fill="#22c55e" 
                                      fillOpacity="0.4" 
                                      stroke="#15803d" 
                                      strokeWidth="1"
                                    />
                                  )}

                                  {/* Render beautiful beads player/cpu */}
                                  {piece === 'P' && (
                                    <g filter="url(#shadow)">
                                      <circle cx={cx} cy={cy} r={3.3} fill="url(#playerGrad)" stroke="#1d4ed8" strokeWidth="0.5" />
                                      <circle cx={cx} cy={cy - 0.6} r={1.2} fill="#ffffff" fillOpacity="0.25" />
                                      <circle cx={cx} cy={cy} r={1.0} fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                                    </g>
                                  )}
                                  
                                  {piece === 'C' && (
                                    <g filter="url(#shadow)">
                                      <circle cx={cx} cy={cy} r={3.3} fill="url(#cpuGrad)" stroke="#be123c" strokeWidth="0.5" />
                                      <circle cx={cx} cy={cy - 0.6} r={1.2} fill="#ffffff" fillOpacity="0.25" />
                                      <circle cx={cx} cy={cy} r={1.0} fill="none" stroke="#fb7185" strokeWidth="0.5" />
                                    </g>
                                  )}
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>
                    )}

                    {sholoGameMessage.text && (
                      <div className={`p-4 rounded-3xl text-center space-y-3.5 border font-sans ${
                        sholoGameMessage.type === 'success' ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]' : 
                        sholoGameMessage.type === 'error' ? 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239]' : 'bg-[#e0f2fe] border-[#bae6fd] text-[#075985]'
                      }`}>
                        <div className="text-xs font-bold leading-relaxed">{sholoGameMessage.text}</div>
                        {sholoGameState === 'ended' && (
                          <button
                            onClick={() => {
                              setSholoGameState('idle');
                              setSholoBoard([]);
                              setSholoGameMessage({ text: '', type: '' });
                            }}
                            className="bg-stone-850 hover:bg-stone-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs animate-pulse"
                          >
                            নতুন খেলা শুরু করুন
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* Footer Navigation Bar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/95 backdrop-blur-md rounded-3xl py-2 px-3 shadow-xl border border-stone-150 z-40 flex justify-between items-center">
        <button 
          onClick={() => switchTab('home')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${activeTab === 'home' ? 'text-[#764ba2]' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Home size={18} />
          <span className="text-[10px] font-bold mt-1">হোম</span>
        </button>
        
        <button 
          onClick={() => switchTab('all-jobs')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${activeTab === 'all-jobs' ? 'text-[#764ba2]' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Briefcase size={18} />
          <span className="text-[10px] font-bold mt-1">সব জব</span>
        </button>

        <button 
          onClick={() => switchTab('refer')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${activeTab === 'refer' ? 'text-[#764ba2]' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <UserPlus size={18} />
          <span className="text-[10px] font-bold mt-1">রেফার</span>
        </button>

        <button 
          onClick={() => switchTab('transfer')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${activeTab === 'transfer' ? 'text-[#764ba2]' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <ArrowLeftRight size={18} />
          <span className="text-[10px] font-bold mt-1">ট্রান্সফার</span>
        </button>

        <button 
          onClick={() => switchTab('wallet')}
          className={`flex flex-col items-center flex-1 py-1 transition cursor-pointer ${activeTab === 'wallet' ? 'text-[#764ba2]' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Wallet size={18} />
          <span className="text-[10px] font-bold mt-1">ওয়ালেট</span>
        </button>
      </nav>

      {/* Verification Activation Dialog Modal */}
      <AnimatePresence>
        {isVerificationModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVerificationModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-extrabold text-stone-800">একাউন্ট এক্টিভেশন</h3>
                  <button 
                    onClick={() => setIsVerificationModalOpen(false)}
                    className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <p className="text-stone-500 text-xs leading-relaxed mb-4">
                  নিচের যেকোনো বিকাশ বা নগদ পার্সোনাল নম্বরে <strong>৳{globalSettings.activationPrice || 100}</strong> ক্যাশআউট বা সেন্ডমানি করে আপনার মোবাইল নম্বর এবং TrxID দিয়ে ভেরিফাই করুন:
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div 
                    onClick={() => setSelectedVerifyMethod('bkash')}
                    className={`p-3 border-2 rounded-2xl text-center cursor-pointer font-bold text-xs transition ${
                      selectedVerifyMethod === 'bkash' 
                        ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E]' 
                        : 'border-stone-150 text-stone-500'
                    }`}
                  >
                    bKash (বিকাশ)
                  </div>
                  <div 
                    onClick={() => setSelectedVerifyMethod('nagad')}
                    className={`p-3 border-2 rounded-2xl text-center cursor-pointer font-bold text-xs transition ${
                      selectedVerifyMethod === 'nagad' 
                        ? 'border-[#F7941D] bg-[#F7941D]/5 text-[#F7941D]' 
                        : 'border-stone-150 text-stone-500'
                    }`}
                  >
                    Nagad (নগদ)
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center space-y-1 mb-4">
                  <span className="text-[10px] font-bold text-stone-400 capitalize block">
                    {selectedVerifyMethod} পেমেন্ট নম্বর:
                  </span>
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-lg font-black text-stone-800 font-mono tracking-wider">
                      {selectedVerifyMethod === 'bkash' ? globalSettings.activationNumbers?.bkash : globalSettings.activationNumbers?.nagad}
                    </span>
                    <button 
                      onClick={() => handleCopy(
                        selectedVerifyMethod === 'bkash' 
                          ? globalSettings.activationNumbers?.bkash || '01727172701' 
                          : globalSettings.activationNumbers?.nagad || '01934984690', 
                        'নম্বর কপি হয়েছে'
                      )}
                      className="p-1 text-[#764ba2] hover:bg-[#764ba2]/15 rounded-md transition"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleActivationSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 pl-1 block">যে নম্বর থেকে টাকা পাঠিয়েছেন</label>
                    <input 
                      type="number" 
                      placeholder="017xxxxxxxx"
                      value={verificationNumber}
                      onChange={(e) => setVerificationNumber(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#764ba2] font-semibold transition"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 pl-1 block">আপনার TrxID (Transaction ID)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: 8HK7C9M2D5"
                      value={verificationTrx}
                      onChange={(e) => setVerificationTrx(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#764ba2] font-mono font-bold uppercase tracking-wider transition"
                      required
                    />
                  </div>

                  {verificationMessage.text && (
                    <div className={`p-3.5 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2 ${verificationMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                      {verificationMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      <span className="flex-1">{verificationMessage.text}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmittingVerification}
                    className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-55"
                  >
                    {isSubmittingVerification ? 'প্রসেসিং হচ্ছে...' : 'পেমেন্ট যাচাই করুন ✔'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}



        {/* Nova Shop premium maintenance modal */}
        {isNovaShopMaintModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNovaShopMaintModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[32px] w-full max-w-sm p-6.5 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative background accent */}
                <div className="absolute top-[-40px] right-[-40px] w-28 h-28 bg-violet-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-[-40px] left-[-40px] w-28 h-28 bg-indigo-500/10 rounded-full blur-xl"></div>

                <div className="flex justify-between items-center mb-5.5 relative z-10">
                  <h3 className="text-sm font-extrabold text-violet-950 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <ShoppingBag size={17} className="text-violet-600" />
                    <span>নোভা শপ মেইনটেন্যান্স</span>
                  </h3>
                  <button 
                    onClick={() => setIsNovaShopMaintModalOpen(false)}
                    className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition"
                  >
                    <XCircle size={19} />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4.5 mb-2 relative z-10">
                  <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-[22px] flex items-center justify-center shadow-xs border border-violet-100 animate-pulse">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm.5">দুঃখিত! স্টোরটি সাময়িকভাবে বন্ধ আছে</h4>
                    <p className="text-stone-500 text-xs mt-1 px-1">শীঘ্রই আমাদের ডেভেলপার টিম শপটির মেইনটেন্যান্স শেষ করে সচল করে দেবে।</p>
                  </div>
                  
                  <div className="bg-red-50/60 border border-red-100 p-4.5 rounded-2xl w-full">
                    <p className="text-red-700 text-xs font-semibold leading-relaxed">
                      {globalSettings.novashopMaintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের নোভা শপ সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                    </p>
                  </div>

                  <button 
                    onClick={() => setIsNovaShopMaintModalOpen(false)}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition active:scale-[0.98] text-xs font-sans mt-2 cursor-pointer"
                  >
                    ঠিক আছে ✔
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Dynamic Website maintenance modal */}
        {activeWebMaint && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveWebMaint(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[32px] w-full max-w-sm p-6.5 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative background accent */}
                <div className="absolute top-[-40px] right-[-40px] w-28 h-28 bg-violet-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-[-40px] left-[-40px] w-28 h-28 bg-indigo-500/10 rounded-full blur-xl"></div>

                <div className="flex justify-between items-center mb-5.5 relative z-10 w-full">
                  <h3 className="text-sm font-extrabold text-violet-950 uppercase tracking-wider flex items-center gap-1.5 font-sans truncate mr-2">
                    {activeWebMaint.iconName === 'ShoppingBag' && <ShoppingBag size={17} className="text-violet-600 shrink-0" />}
                    {activeWebMaint.iconName === 'Globe' && <Globe size={17} className="text-violet-600 shrink-0" />}
                    {activeWebMaint.iconName === 'Award' && <Award size={17} className="text-violet-600 shrink-0" />}
                    {activeWebMaint.iconName === 'Smartphone' && <Smartphone size={17} className="text-violet-600 shrink-0" />}
                    {activeWebMaint.iconName === 'Briefcase' && <Briefcase size={17} className="text-violet-600 shrink-0" />}
                    <span className="truncate">{activeWebMaint.name} মেইনটেন্যান্স</span>
                  </h3>
                  <button 
                    onClick={() => setActiveWebMaint(null)}
                    className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition shrink-0"
                  >
                    <XCircle size={19} />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4.5 mb-2 relative z-10">
                  <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-[22px] flex items-center justify-center shadow-xs border border-violet-100 animate-pulse">
                    {activeWebMaint.iconName === 'ShoppingBag' && <ShoppingBag size={28} />}
                    {activeWebMaint.iconName === 'Globe' && <Globe size={28} />}
                    {activeWebMaint.iconName === 'Award' && <Award size={28} />}
                    {activeWebMaint.iconName === 'Smartphone' && <Smartphone size={28} />}
                    {activeWebMaint.iconName === 'Briefcase' && <Briefcase size={28} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm.5">দুঃখিত! সেবামূলক ওয়েবসাইটটি সাময়িকভাবে বন্ধ আছে</h4>
                    <p className="text-stone-500 text-xs mt-1 px-1">শীঘ্রই আমাদের টিম মেইনটেন্যান্স শেষ করে সাইটটি সচল করে দেবে।</p>
                  </div>
                  
                  <div className="bg-red-50/60 border border-red-100 p-4.5 rounded-2xl w-full">
                    <p className="text-red-700 text-xs font-semibold leading-relaxed">
                      {activeWebMaint.maintenanceMessage || 'সাময়িক রক্ষণাবেক্ষণের কারণে সেবাটি সাময়িকভাবে বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।'}
                    </p>
                  </div>

                  <button 
                    onClick={() => setActiveWebMaint(null)}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition active:scale-[0.98] text-xs font-sans mt-2 cursor-pointer"
                  >
                    ঠিক আছে ✔
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Social Sell History Modal overlay */}
        {selectedHistoryPlatform && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] font-sans">
            <div className="bg-white border border-stone-200/80 rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History size={18} />
                  <div>
                    <h3 className="font-extrabold text-[#ffffff] text-xs.5 uppercase tracking-wider">
                      {selectedHistoryPlatform === 'withdraw' 
                        ? 'উইথড্র হিস্টোরি (লগ)' 
                        : selectedHistoryPlatform === 'deposit' 
                        ? 'ডিপোজিট হিস্টোরি (লগ)' 
                        : `${selectedHistoryPlatform} অ্যাকাউন্ট সেল হিস্ট্রি`}
                    </h3>
                    <span className="text-[9.5px] opacity-80 font-semibold block mt-0.5">
                      {selectedHistoryPlatform === 'withdraw' 
                        ? 'আপনার সমস্ত উইথড্রয়াল স্টেটমেন্ট' 
                        : selectedHistoryPlatform === 'deposit'
                        ? 'আপনার সমস্ত ডিপোজিট স্টেটমেন্ট'
                        : 'আপনার পাঠানো সমস্ত আবেদনপত্র'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedHistoryPlatform(null)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-full transition font-black text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-stone-50/50">
                {isLoadingHistory ? (
                  <div className="text-center py-12 space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#764ba2] border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-stone-500 text-xs font-bold">লোড হচ্ছে, অপেক্ষা করুন...</p>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 space-y-2">
                    <History size={36} className="mx-auto text-stone-300" />
                    <p className="text-xs font-bold">কোনো হিস্ট্রি পাওয়া যায়নি!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyList.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border border-stone-150 p-4 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          {selectedHistoryPlatform === 'withdraw' ? (
                            <div className="truncate flex-1">
                              <span className="text-[9px] text-stone-400 font-bold block mb-0.5">উইথড্রয়াল রিকোয়েস্ট (লগ)</span>
                              <span className="text-stone-850 text-xs font-bold truncate block">
                                ৳{parseFloat(item.amount || '0').toFixed(2)} ({item.balanceType || 'main'}) via {item.method}
                              </span>
                            </div>
                          ) : selectedHistoryPlatform === 'deposit' ? (
                            <div className="truncate flex-1">
                              <span className="text-[9px] text-stone-400 font-bold block mb-0.5">ডিপোজিট রিকোয়েস্ট (লগ)</span>
                              <span className="text-stone-850 text-xs font-bold truncate block">
                                ৳{parseFloat(item.amount || '0').toFixed(2)} via {item.method}
                              </span>
                            </div>
                          ) : (
                            <div className="truncate flex-1">
                              <span className="text-[9px] text-stone-400 font-bold block mb-0.5">লগইন আইডি/ফোন</span>
                              <span className="text-stone-850 text-xs font-mono font-bold truncate block">
                                {item.email || item.number || item.username || item.id}
                              </span>
                            </div>
                          )}
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 uppercase tracking-wider ${
                            item.status === 'accepted' || item.status === 'approved' || item.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                              : item.status === 'rejected' || item.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-600 border border-rose-150'
                              : 'bg-amber-50 text-amber-700 border border-amber-150'
                          }`}>
                            {item.status === 'accepted' || item.status === 'approved' || item.status === 'Approved' ? 'গৃহীত' : item.status === 'rejected' || item.status === 'Rejected' ? 'বাতিল' : 'পেন্ডিং'}
                          </span>
                        </div>

                        <div className="text-[10px] text-stone-500 space-y-1 bg-stone-50 p-2.5 rounded-xl font-medium">
                          {selectedHistoryPlatform === 'withdraw' && (
                            <>
                              <div className="flex justify-between gap-1">
                                <span>ফোন নাম্বার:</span>
                                <strong className="font-mono text-stone-800 break-all">{item.number}</strong>
                              </div>
                              <div className="flex justify-between gap-1">
                                <span>ব্যালেন্স টাইপ:</span>
                                <strong className="text-stone-800 capitalize">{item.balanceType || 'main'}</strong>
                              </div>
                            </>
                          )}
                          {selectedHistoryPlatform === 'deposit' && (
                            <>
                              <div className="flex justify-between gap-1">
                                <span>প্রেরক নাম্বার:</span>
                                <strong className="font-mono text-stone-800 break-all">{item.number}</strong>
                              </div>
                              <div className="flex justify-between gap-1">
                                <span>ট্রানজেকশন ID:</span>
                                <strong className="font-mono text-stone-800 break-all select-all font-bold text-[#764ba2]">{item.trxId}</strong>
                              </div>
                              <div className="flex justify-between gap-1">
                                <span>ডিপোজিট ফি ({item.feePercent || 0}%):</span>
                                <strong className="font-mono text-red-500 font-bold">-৳{parseFloat(item.feeAmount || '0').toFixed(2)}</strong>
                              </div>
                              <div className="flex justify-between gap-1 border-t border-dashed border-stone-200 pt-1 mt-1">
                                <span className="font-bold text-stone-700">ব্যালেন্স যোগ (নিট):</span>
                                <strong className="font-mono text-emerald-600 font-black">৳{parseFloat(item.netAmount !== undefined ? item.netAmount : item.amount || '0').toFixed(2)}</strong>
                              </div>
                            </>
                          )}
                          {item.password && (
                            <div className="flex justify-between gap-1">
                              <span>পাসওয়ার্ড:</span>
                              <strong className="font-mono text-stone-800 break-all">{item.password}</strong>
                            </div>
                          )}
                          {item.details && (
                            <div className="flex flex-col gap-0.5">
                              <span>অতিরিক্ত বিবরণ:</span>
                              <strong className="text-stone-850 font-semibold text-[9.5px] leading-relaxed break-words">{item.details}</strong>
                            </div>
                          )}
                          {item.facebook2FA && (
                            <div className="flex justify-between gap-1">
                              <span>2FA Key / Code:</span>
                              <strong className="font-mono text-stone-800 break-all">{item.facebook2FA}</strong>
                            </div>
                          )}
                          {item.instagram2FA && (
                            <div className="flex justify-between gap-1">
                              <span>2FA Key / Code:</span>
                              <strong className="font-mono text-stone-800 break-all">{item.instagram2FA}</strong>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-stone-400 mt-2.5 pt-2 border-t border-stone-100">
                          <span>{new Date(item.timestamp || Date.now()).toLocaleString()}</span>
                          {item.status === 'rejected' && item.rejectReason && (
                            <span className="text-rose-600 font-extrabold max-w-[180px] truncate" title={item.rejectReason}>
                              কারণ: {item.rejectReason}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
                <button 
                  onClick={() => setSelectedHistoryPlatform(null)}
                  className="bg-stone-500 hover:bg-stone-600 text-white font-bold text-xs py-2 px-5 rounded-xl transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Lightbox Modal */}
      <AnimatePresence>
        {fullscreenImageUrl && (
          <div 
            className="fixed inset-0 bg-black/90 z-[55] flex flex-col items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setFullscreenImageUrl(null)}
          >
            <div className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <motion.img 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={fullscreenImageUrl} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
              alt="Fullscreen Preview"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
            <span className="text-white/60 text-xs mt-4 font-bold select-none">ট্যাপ করে বন্ধ করুন</span>
          </div>
        )}
      </AnimatePresence>

      {/* Live Status Notifications Toasts */}
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-40 space-y-2 pointer-events-none">
        <AnimatePresence>
          {liveToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="bg-stone-900/95 text-white border border-stone-800 shadow-xl px-4 py-3 rounded-2xl pointer-events-auto flex items-center gap-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 text-[10.5px] font-bold leading-relaxed">
                {toast.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Support Button & Animated Menu */}
      <div 
        ref={supportContainerRef}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end gap-3"
      >
        <AnimatePresence>
          {supportMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/95 backdrop-blur-md border border-stone-200/85 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 w-52 mb-1"
            >
              <div className="px-2.5 py-1.5 border-b border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider font-sans">আমাদের সাপোর্ট (Support)</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              
              {activeSupports.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {activeSupports.map((item, index) => (
                    <motion.a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSupportMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition duration-200 cursor-pointer ${item.color}`}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      <span className="truncate">{item.name}</span>
                    </motion.a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-stone-400 text-[10px] font-bold">
                  কোনো সাপোর্ট অপশন নেই
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setSupportMenuOpen(!supportMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-tr from-[#764ba2] to-[#667eea] text-white p-3.5 rounded-full shadow-2xl transition duration-300 relative flex items-center justify-center cursor-pointer hover:shadow-indigo-500/20"
        >
          {/* Animated pulsing outer ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
          
          <motion.div
            animate={{ rotate: supportMenuOpen ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {supportMenuOpen ? <X size={20} /> : <HelpCircle size={20} />}
          </motion.div>
        </motion.button>
      </div>

    </div>
  );
}
