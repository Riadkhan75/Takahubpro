import React, { useState, useEffect, useRef } from 'react';
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
  get 
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
  SocialText
} from '../types';
import { 
  Wallet, 
  UserPlus, 
  ArrowLeftRight, 
  Gift, 
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
  Volume2,
  Facebook,
  Instagram,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  Globe,
  Award,
  Gamepad2,
  Grid,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IMGBB_API_KEY = '20525efceff3938cbfc52fa653e9f86a';

function AdsterraScriptBanner({ scriptCode }: { scriptCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scriptCode || !containerRef.current) return;
    
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

interface UserAppProps {
  userId: string;
  userEmail: string;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
  isAdminUser: boolean;
  onSwitchToNovaShop?: () => void;
}

export default function UserApp({ userId, userEmail, onLogout, onSwitchToAdmin, isAdminUser, onSwitchToNovaShop }: UserAppProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'refer' | 'transfer' | 'wallet' | 'mission' | 'all-jobs' | 'gmail-sell' | 'telegram-sell' | 'whatsapp-sell' | 'facebook-sell' | 'instagram-sell' | 'post-job' | 'job-details' | 'ads' | 'notifications' | 'support' | 'game' | 'investment-plans'>('home');
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

  // Drawer / Side menu state
  const [isSidelineOpen, setIsSidelineOpen] = useState(false);

  // Popup state
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  useEffect(() => {
    if (globalSettings.popupEnabled && globalSettings.popupTitle) {
      const seen = localStorage.getItem(`seen_popup_${globalSettings.popupTitle}`);
      if (seen) {
        setHasSeenPopup(true);
      } else {
        setHasSeenPopup(false);
      }
    }
  }, [globalSettings.popupEnabled, globalSettings.popupTitle]);

  const handleClosePopup = () => {
    if (globalSettings.popupTitle) {
      localStorage.setItem(`seen_popup_${globalSettings.popupTitle}`, 'true');
    }
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

  // Master password visibility states
  const [showGmailMasterPass, setShowGmailMasterPass] = useState(false);
  const [showTelegramMasterPass, setShowTelegramMasterPass] = useState(false);
  const [showWhatsappMasterPass, setShowWhatsappMasterPass] = useState(false);
  const [showFacebookMasterPass, setShowFacebookMasterPass] = useState(false);
  const [showInstagramMasterPass, setShowInstagramMasterPass] = useState(false);

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
          .filter((x: any) => x.userId === userId)
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
        } else if (result === 'loss') {
          setTttGameMessage({ text: `❌ আপনি ম্যাচটি হেরেছেন! আপনার বাজি ধরা ৳${betVal} কেটে নেওয়া হয়েছে।`, type: 'error' });
        } else {
          // Draw is also lost
          setTttGameMessage({ text: `🤝 ম্যাচ ড্র হয়েছে! নিয়ম অনুযায়ী আপনার বাজি ধরা ৳${betVal} কেটে নেওয়া হয়েছে।`, type: 'error' });
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

      await set(newWithdrawRef, {
        id: newWithdrawRef.key,
        userId: userId,
        email: userEmail,
        method: withdrawMethod,
        number: num,
        amount: amt,
        status: 'pending',
        timestamp: Date.now(),
        balanceType: withdrawBalanceType
      });

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

  // Calculations for micro job budget slotting previews
  const computedSlots = parseFloat(postJobReward) > 0 && parseFloat(postJobBudget) > 0 
    ? Math.floor(parseFloat(postJobBudget) / parseFloat(postJobReward)) 
    : 0;

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
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-2xl w-full max-w-xs text-xs flex flex-col"
            >
              {globalSettings.popupImageUrl && (
                <img src={globalSettings.popupImageUrl} className="w-full h-32 object-cover" alt="Announcement" referrerPolicy="no-referrer" />
              )}
              <div className="p-5 space-y-2.5">
                <h3 className="font-extrabold text-stone-800 text-sm leading-normal">{globalSettings.popupTitle || "গুরুত্বপূর্ণ নোটিশ"}</h3>
                <p className="text-stone-500 leading-normal text-[11px] whitespace-pre-line">{globalSettings.popupMessage}</p>
                <button 
                  onClick={handleClosePopup}
                  className="w-full mt-3 bg-[#764ba2] text-white py-3 rounded-2xl font-bold hover:bg-[#667eea] transition"
                >
                  বুঝেছি
                </button>
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
        <span className="text-xl font-bold bg-[#764ba2] bg-clip-text text-transparent tracking-wide font-sans">
          𝗧ᴀᴋᴀ𝗛ᴜʙ 𝗣ʀᴏ
        </span>
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
                <button 
                  onClick={() => handleCopy(userId, 'ইউজার আইডি কপি হয়েছে')}
                  className="mt-2 text-xs font-mono bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition text-white/95"
                >
                  <Copy size={10} />
                  <span>ID: {userId.substring(0, 10)}...</span>
                </button>
              </div>

              {/* Side Nav menu items */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <button onClick={() => switchTab('home')} className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition ${activeTab === 'home' ? 'bg-[#764ba2]/10 text-[#764ba2]' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Home size={18} />
                  <span>হোম</span>
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

            {/* Total Balance Card */}
            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-6 rounded-[30px] shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">মোট মেইন ব্যালেন্স</p>
              <h1 className="text-4.5xl font-black my-1 font-sans">
                ৳{(userData?.balance || 0).toFixed(2)}
              </h1>
              
              <div className="mt-3 flex justify-center">
                {(userData?.isActive || globalSettings.freeActivationEnabled) ? (
                  <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle size={12} className="text-emerald-300" />
                    <span>ভেরিফাইড মেম্বার</span>
                  </span>
                ) : (
                  <span className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200 text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                    <XCircle size={12} className="text-red-300" />
                    <span>ইনএকটিভ মেম্বার</span>
                  </span>
                )}
              </div>
            </div>

            {/* AI Platforms Income Balances Bento Box */}
            <div className="space-y-2 mt-4">
              <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block pl-2">সার্ভিস ভিত্তিক ইনকাম ব্যালেন্স (AI Platforms Income)</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {/* Gmail Balance Card */}
                <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-xs transition hover:shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-500 text-[10px] font-bold">Gmail Earnings</span>
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-800 font-sans">৳{(userData?.gmailBalance || 0).toFixed(2)}</h2>
                    <span className="text-[9px] text-teal-600 font-bold block mt-0.5">মিনিমাম উইথড্র: ৳{globalSettings.minWithdrawGmail || 50}</span>
                  </div>
                </div>

                {/* Telegram Balance Card */}
                <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-xs transition hover:shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-500 text-[10px] font-bold">Telegram Earnings</span>
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-800 font-sans">৳{(userData?.telegramBalance || 0).toFixed(2)}</h2>
                    <span className="text-[9px] text-sky-600 font-bold block mt-0.5">মিনিমাম উইথড্র: ৳{globalSettings.minWithdrawTelegram || 50}</span>
                  </div>
                </div>

                {/* WhatsApp Balance Card */}
                <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-xs transition hover:shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-500 text-[10px] font-bold">WhatsApp Earnings</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-800 font-sans">৳{(userData?.whatsappBalance || 0).toFixed(2)}</h2>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">মিনিমাম উইথড্র: ৳{globalSettings.minWithdrawWhatsapp || 50}</span>
                  </div>
                </div>

                {/* Facebook Balance Card */}
                <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-xs transition hover:shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-500 text-[10px] font-bold">Facebook Earnings</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-800 font-sans">৳{(userData?.facebookBalance || 0).toFixed(2)}</h2>
                    <span className="text-[9px] text-indigo-600 font-bold block mt-0.5">মিনিমাম উইথড্র: ৳{globalSettings.minWithdrawFacebook || 50}</span>
                  </div>
                </div>

                {/* Ads Balance Card */}
                <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-xs transition hover:shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-stone-500 text-[10px] font-bold">Ads Earnings</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-800 font-sans">৳{(userData?.adsBalance || 0).toFixed(2)}</h2>
                    <span className="text-[9px] text-amber-600 font-bold block mt-0.5">মিনিমাম উইথড্র: ৳{globalSettings.minWithdrawAds || 50}</span>
                  </div>
                </div>
              </div>
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

            {/* Nova Shop store gateway card */}
            {onSwitchToNovaShop && (
              <div 
                onClick={() => {
                  if (globalSettings.novashopMaintenanceEnabled) {
                    setIsNovaShopMaintModalOpen(true);
                  } else {
                    onSwitchToNovaShop();
                  }
                }}
                className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-4.5 rounded-[22px] flex items-center justify-between shadow-lg hover:from-violet-700 hover:to-indigo-800 cursor-pointer transition active:scale-[0.98] border border-violet-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shadow-inner shrink-0">
                    <ShoppingBag size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs.5 flex items-center gap-1.5 leading-normal">
                      <span>নোভা শপ (Nova Shop)</span>
                      <span className="text-[8px] bg-amber-450 text-neutral-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">PREMIUM</span>
                    </h3>
                    <p className="text-white/80 text-[11px] mt-0.5 leading-normal font-semibold">প্রিমিয়াম ওয়েবসাইট ও ফাইল স্টোর</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white shrink-0" />
              </div>
            )}

            {/* Dynamic Added Websites (NEW FEATURE: Dynamic custom shops/sites) */}
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
                className={`bg-gradient-to-r text-white p-4.5 rounded-[22px] flex items-center justify-between shadow-lg cursor-pointer transition active:scale-[0.98] border border-white/15 ${web.accentColor || 'from-violet-600 to-indigo-700'} hover:opacity-95`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shadow-inner shrink-0">
                    {web.iconName === 'ShoppingBag' && <ShoppingBag size={22} />}
                    {web.iconName === 'Globe' && <Globe size={22} />}
                    {web.iconName === 'Award' && <Award size={22} />}
                    {web.iconName === 'Smartphone' && <Smartphone size={22} />}
                    {web.iconName === 'Briefcase' && <Briefcase size={22} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] flex items-center gap-1.5 leading-normal">
                      <span>{web.name}</span>
                      <span className="text-[8px] bg-amber-400 text-neutral-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">STORE</span>
                    </h3>
                    <p className="text-white/80 text-[11px] mt-0.5 leading-normal font-semibold">{web.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white shrink-0" />
              </div>
            ))}

            {/* Micro Job Section Gateway card */}
            <div 
              onClick={() => switchTab('all-jobs')}
              className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-stone-300 cursor-pointer transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Briefcase size={22} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-sm">সব চলমান জব</h3>
                  <p className="text-stone-500 text-xs mt-0.5">সবচেয়ে বেশি রেট দিয়ে ক্যাম্পেইনে কাজ করুন</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </div>

            {/* Gmail Account Sell Gateway card */}
            <div 
              onClick={() => switchTab('gmail-sell')}
              className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-stone-300 cursor-pointer transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <PlusCircle size={22} className="text-rose-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm">জিমেইল জেনারেটর (Gmail Sell)</h3>
                    {globalSettings.gmailMaintenanceEnabled && (
                      <span className="bg-amber-100 text-amber-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">রক্ষণাবেক্ষণ</span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5">জিমেইল আইডি জমা দিন - প্রতি পিস ৳{globalSettings.gmailPrice}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </div>

            {/* Telegram Account Sell Gateway card */}
            <div 
              onClick={() => switchTab('telegram-sell')}
              className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-stone-300 cursor-pointer transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                  <Send size={22} className="text-sky-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm">টেলিগ্রাম নাম্বার বিক্রি (Telegram Sell)</h3>
                    {globalSettings.telegramMaintenanceEnabled && (
                      <span className="bg-amber-100 text-amber-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">রক্ষণাবেক্ষণ</span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5">টেলিগ্রাম আইডি বিক্রি করুন - প্রতি পিস ৳{globalSettings.telegramPrice || 20}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </div>

            {/* WhatsApp Account Sell Gateway card */}
            <div 
              onClick={() => switchTab('whatsapp-sell')}
              className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-stone-300 cursor-pointer transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <MessageSquare size={22} className="text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm">হোয়াটসঅ্যাপ নাম্বার বিক্রি (WhatsApp Sell)</h3>
                    {globalSettings.whatsappMaintenanceEnabled && (
                      <span className="bg-amber-100 text-amber-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">রক্ষণাবেক্ষণ</span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5">সহজ উপায়ে হোয়াটসঅ্যাপ বিক্রি - প্রতি পিস ৳{globalSettings.whatsappPrice || 30}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </div>

            {/* Facebook Account Sell Gateway card */}
            <div 
              onClick={() => switchTab('facebook-sell')}
              className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-stone-300 cursor-pointer transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Facebook size={22} className="text-indigo-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm">ফেসবুক আইডি বিক্রি (Facebook Sell)</h3>
                    {globalSettings.facebookMaintenanceEnabled && (
                      <span className="bg-amber-100 text-amber-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">রক্ষণাবেক্ষণ</span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5">যেকোনো পুরাতন ফেসবুক আইডি বিক্রি - প্রতি পিস ৳{globalSettings.facebookPrice || 25}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </div>

            {/* Instagram Account Sell Gateway card */}
            <div 
              onClick={() => switchTab('instagram-sell')}
              className="bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-stone-300 cursor-pointer transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <Instagram size={22} className="text-rose-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm">ইন্সটাগ্রাম আইডি বিক্রি (Instagram Sell)</h3>
                    {globalSettings.instagramMaintenanceEnabled && (
                      <span className="bg-amber-100 text-amber-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase leading-none">রক্ষণাবেক্ষণ</span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5">পুরাতন ইন্সটাগ্রাম আইডি বিক্রি - প্রতি পিস ৳{globalSettings.instagramPrice || 20}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </div>

            {/* Campaign Poster Creator Action gateway */}
            <div 
              onClick={() => switchTab('post-job')}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-md cursor-pointer transition hover:opacity-95 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center">
                  <Upload size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">নতুন জব পোস্ট করুন</h3>
                  <p className="text-white/90 text-xs mt-0.5">গ্রাহক বা ফলোয়ার বাড়াতে নতুন ক্যাম্পেইন চালু করুন</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </div>

            {/* Dynamic Watching Ads List (NEW FEATURE) with Adsterra integration */}
            {(ads.length > 0 || globalSettings.adsterraDirectLink) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-700 font-bold px-1 text-sm">
                  <Play size={16} className="text-[#764ba2]" />
                  <span>বিজ্ঞাপন থেকে বোনাস ইনকাম</span>
                </div>

                {globalSettings.adsterraDirectLink && (
                  <div className="bg-[#764ba2]/5 border border-[#764ba2]/10 p-4.5 rounded-[24px] relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-[-20px] left-[-20px] w-16 h-16 bg-[#764ba2]/10 rounded-full blur-lg"></div>
                    <div className="absolute bottom-[-20px] right-[-20px] w-16 h-16 bg-[#667eea]/10 rounded-full blur-lg"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Sponsor</span>
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

                {ads.length > 0 && (
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
                )}
              </div>
            )}

            {/* Admin configured shortcut Home Tasks shortcuts lists */}
            {homeTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-700 font-bold px-1 text-sm">
                  <TrendingUp size={16} className="text-[#764ba2]" />
                  <span>কুইক টাস্ক সমূহ</span>
                </div>
                <div className="space-y-2.5">
                  {homeTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-white border border-stone-150 p-3.5 rounded-2xl flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={task.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'} 
                          className="w-10 h-10 rounded-xl object-cover shrink-0" 
                          alt="TaskIcon" 
                        />
                        <span className="font-semibold text-stone-800 text-xs truncate">{task.name}</span>
                      </div>
                      <a 
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-stone-100 hover:bg-[#764ba2]/10 hover:text-[#764ba2] text-stone-600 font-bold text-[11px] py-2 px-4 rounded-xl transition shrink-0"
                      >
                        ফ্রি কাজের লিংক
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex bg-indigo-50/50 p-4 rounded-2xl items-center gap-3">
                <Coins size={20} className="text-[#764ba2] shrink-0" />
                <div className="text-xs leading-relaxed text-stone-700">
                  সর্বনিম্ন উইথড্র লিমিট: <strong className="text-[#764ba2]">৳{globalSettings.minWithdraw}</strong>. পেমেন্ট রিকোয়েস্ট দেওয়ার ২৪ ঘন্টার মধ্যে আপনার bKash/Nagad ওয়ালেটে টাকা পৌঁছে যাবে।
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">ওয়ালেট নির্বাচন করুন</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setWithdrawMethod('Bkash')}
                      className={`p-3.5 border-2 rounded-2xl text-center cursor-pointer font-bold text-xs transition ${withdrawMethod === 'Bkash' ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E]' : 'border-stone-200 text-stone-500'}`}
                    >
                      bKash (বিকাশ)
                    </div>
                    <div 
                      onClick={() => setWithdrawMethod('Nagad')}
                      className={`p-3.5 border-2 rounded-2xl text-center cursor-pointer font-bold text-xs transition ${withdrawMethod === 'Nagad' ? 'border-[#F7941D] bg-[#F7941D]/5 text-[#F7941D]' : 'border-stone-200 text-stone-500'}`}
                    >
                      Nagad (নগদ)
                    </div>
                  </div>
                </div>

                <div className="space-y-2 col-span-full">
                  <label className="text-xs font-bold text-stone-700 block pl-1">উৎস ব্যালেন্স নির্বাচন করুন (Withdrawal Fund Source)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {[
                      { type: 'main', label: 'Main Bal', bal: userData?.balance || 0, min: globalSettings.minWithdraw || 50 },
                      { type: 'gmail', label: 'Gmail', bal: userData?.gmailBalance || 0, min: globalSettings.minWithdrawGmail || 50 },
                      { type: 'telegram', label: 'Telegram', bal: userData?.telegramBalance || 0, min: globalSettings.minWithdrawTelegram || 50 },
                      { type: 'whatsapp', label: 'WhatsApp', bal: userData?.whatsappBalance || 0, min: globalSettings.minWithdrawWhatsapp || 50 },
                      { type: 'facebook', label: 'Facebook', bal: userData?.facebookBalance || 0, min: globalSettings.minWithdrawFacebook || 50 },
                      { type: 'instagram', label: 'Instagram', bal: userData?.instagramBalance || 0, min: globalSettings.minWithdrawInstagram || 50 },
                      { type: 'ads', label: 'Ads Bal', bal: userData?.adsBalance || 0, min: globalSettings.minWithdrawAds || 50 }
                    ].map((item) => (
                      <div 
                        key={item.type}
                        onClick={() => {
                          setWithdrawBalanceType(item.type as any);
                          setWithdrawAmount('');
                        }}
                        className={`p-2.5 border-2 rounded-2xl text-center cursor-pointer transition flex flex-col justify-between ${withdrawBalanceType === item.type ? 'border-[#764ba2] bg-[#764ba2]/5' : 'border-stone-150 bg-white hover:bg-stone-50'}`}
                      >
                        <span className="text-[10px] text-stone-500 font-extrabold block leading-none">{item.label}</span>
                        <strong className="text-xs font-black text-stone-850 block my-1">৳{item.bal.toFixed(1)}</strong>
                        <span className="text-[8px] text-stone-400 font-bold block leading-none">Min: ৳{item.min}</span>
                      </div>
                    ))}
                  </div>
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block pl-1">টাকার পরিমাণ (৳)</label>
                  <input 
                    type="number" 
                    placeholder={`মিনিমাম ৳${
                      withdrawBalanceType === 'gmail' ? (globalSettings.minWithdrawGmail || 50) : 
                      withdrawBalanceType === 'telegram' ? (globalSettings.minWithdrawTelegram || 50) : 
                      withdrawBalanceType === 'whatsapp' ? (globalSettings.minWithdrawWhatsapp || 50) : 
                      withdrawBalanceType === 'facebook' ? (globalSettings.minWithdrawFacebook || 50) : 
                      withdrawBalanceType === 'instagram' ? (globalSettings.minWithdrawInstagram || 50) : 
                      (globalSettings.minWithdraw || 50)
                    }`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                    required
                  />
                </div>

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

            {/* Withdrawal History Card */}
            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-xs font-black tracking-wider text-stone-500 uppercase flex items-center gap-1.5 pl-1">
                <History size={14} className="text-stone-400" />
                <span>আপনার উইথড্রয়াল ইতিহাস ও স্ট্যাটাস</span>
              </h3>
              
              {withdrawals.length === 0 ? (
                <div className="text-stone-400 text-xs font-semibold py-6 text-center border-2 border-dashed border-stone-150 rounded-2xl bg-stone-50/30">
                  এখনো পর্যন্ত কোনো উত্তোলনের রিকোয়েস্ট নেই।
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {withdrawals.map((item: any) => {
                    const date = item.timestamp ? new Date(item.timestamp).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }) : 'অজানা সময়';
                    const statusStr = item.status === 'Approved' ? 'সফল (Approved) ✅' : item.status === 'Rejected' ? 'বাতিল (Rejected) ❌' : 'অপেক্ষমান (Pending) ⏳';
                    const statusColor = item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-150' : 'bg-amber-50 text-amber-500 border-amber-150';
                    return (
                      <div key={item.id} className="p-3.5 border border-stone-150 rounded-2xl bg-stone-50/25 flex flex-col justify-between gap-2.5 transition hover:bg-stone-50/55">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <div className="text-[11px] font-black text-stone-750 flex items-center gap-1.5">
                              <span>৳{parseFloat(item.amount || '0').toFixed(2)}</span>
                              <span className="font-semibold text-[9px] text-[#764ba2] bg-[#764ba2]/5 px-1.5 py-0.5 rounded-md uppercase leading-none">{item.balanceType || 'main'}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 font-bold mt-1">পদ্ধতি: {item.method} ({item.number})</div>
                          </div>
                          <span className={`text-[9px] font-black tracking-wide border px-2.5 py-1.5 rounded-xl uppercase leading-none ${statusColor}`}>
                            {statusStr}
                          </span>
                        </div>
                        <div className="text-[9px] text-stone-400 font-medium font-mono text-right">{date}</div>
                        {item.adminRejectReason && (
                          <div className="bg-rose-100/50 border border-rose-200 text-rose-800 text-[10px] p-2 rounded-xl mt-1 leading-relaxed font-semibold">
                            ⚠️ বাতিলের কারণ: {item.adminRejectReason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>

            <h2 className="text-lg font-bold text-stone-800 tracking-tight">জিমেইল sell করে বোনাস ইনকাম</h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              {globalSettings.gmailMaintenanceEnabled ? (
                <div className="text-center py-6 flex flex-col items-center space-y-3">
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
                  <div className="text-center py-2 flex flex-col items-center">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3 shadow-sm font-bold text-lg">
                      G
                    </div>
                    <h4 className="font-extrabold text-stone-800 text-sm">জিমেইল একাউন্ট বিক্রি করুন</h4>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                      নিচে পাসওয়ার্ড দিয়ে আমাদের সিস্টেমে একাউন্ট ক্রিয়েট করে জমা দিন। প্রতি ভেরিফাইড ইমেইলের জন্য আপনি সাথে সাথে পাবেন:
                    </p>
                    <span className="mt-2 inline-block bg-red-50 text-red-650 font-black text-base px-4 py-1.5 rounded-full border border-red-100">
                      ৳{globalSettings.gmailPrice} (প্রতি পিস)
                    </span>
                    {globalSettings.gmailLastDate && (
                      <div className={`mt-4 w-full max-w-md p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.gmailLastDate) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <div className="flex items-center gap-1">
                          <span>🕒 সাবমিট করার শেষ সময়:</span>
                        </div>
                        <span className="font-extrabold text-sm leading-none pt-1">{formatDeadline(globalSettings.gmailLastDate)}</span>
                        {isDeadlinePassed(globalSettings.gmailLastDate) && <span className="text-[10px] text-red-600 font-extrabold pt-1">🚫 সময় শেষ হয়ে গেছে! আর জিমেইল আইডি সাবমিট করা যাবে না।</span>}
                      </div>
                    )}
                  </div>

                  {/* Password credentials to configure */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex justify-between items-start text-xs ANONYMOUS_PASS_CARD">
                      <div>
                        <span className="text-stone-500 font-semibold">মাস্টার পাসওয়ার্ড:</span>
                        <div className="font-bold text-stone-800 mt-0.5 text-sm font-mono" id="gmail-open-pass">
                          {showGmailMasterPass ? (globalSettings.gmailOpenPass || 'Shihab@2025#') : '••••••••••••'}
                        </div>
                        <p className="text-[10px] text-amber-700/90 font-bold mt-1">
                          এই পাসওয়ার্ডটি অ্যাকাউন্ট তৈরি করতে ব্যবহার করুন
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => setShowGmailMasterPass(!showGmailMasterPass)}
                          className="bg-white/80 hover:bg-white text-stone-700 p-1.5 rounded-lg border border-stone-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                          title={showGmailMasterPass ? "লুকিয়ে রাখুন" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showGmailMasterPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleCopy(globalSettings.gmailOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                          className="bg-[#764ba2] hover:bg-[#667eea] text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleGmailSell} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">জিমেইল ইমেইল এড্রেস</label>
                      <input 
                        type="email" 
                        placeholder="example@gmail.com"
                        value={gmailEmail}
                        onChange={(e) => setGmailEmail(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">জিমেইল পাসওয়ার্ড</label>
                      <input 
                        type="text" 
                        placeholder="জিমেইলের নিজস্ব পাসওয়ার্ডটি দিন"
                        value={gmailPassword}
                        onChange={(e) => setGmailPassword(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                        required
                      />
                    </div>

                    {gmailMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${gmailMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        {gmailMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{gmailMessage.text}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingGmail}
                      className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingGmail ? 'জমা হচ্ছে...' : 'বিক্রি করতে জমা দিন ✔'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: TELEGRAM SELL */}
        {activeTab === 'telegram-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>

            <h2 className="text-lg font-bold text-stone-800 tracking-tight">টেলিগ্রাম নাম্বার sell করে বোনাস ইনকাম</h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              {globalSettings.telegramMaintenanceEnabled ? (
                <div className="text-center py-6 flex flex-col items-center space-y-3">
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
                  <div className="text-center py-2 flex flex-col items-center">
                    <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mb-3 shadow-sm font-bold text-lg">
                      T
                    </div>
                    <h4 className="font-extrabold text-stone-800 text-sm">টেলিগ্রাম নাম্বার বিক্রি করুন</h4>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                      আপনার সচল টেলিগ্রাম নাম্বারটি নিচে দিন। এডমিন ভেরিফাই করে সফল হলে সাথে সাথে ব্যালেন্স যোগ হবে:
                    </p>
                    <span className="mt-2 inline-block bg-sky-50 text-sky-655 font-black text-base px-4 py-1.5 rounded-full border border-sky-100">
                      ৳{globalSettings.telegramPrice || 20} (প্রতি পিস)
                    </span>
                    {globalSettings.telegramLastDate && (
                      <div className={`mt-4 w-full max-w-md p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.telegramLastDate) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <div className="flex items-center gap-1">
                          <span>🕒 সাবমিট করার শেষ সময়:</span>
                        </div>
                        <span className="font-extrabold text-sm leading-none pt-1">{formatDeadline(globalSettings.telegramLastDate)}</span>
                        {isDeadlinePassed(globalSettings.telegramLastDate) && <span className="text-[10px] text-red-600 font-extrabold pt-1">🚫 সময় শেষ হয়ে গেছে! আর টেলিগ্রাম আইডি সাবমিট করা যাবে না।</span>}
                      </div>
                    )}
                  </div>

                  {/* Password credentials to configure */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex justify-between items-start text-xs ANONYMOUS_PASS_CARD">
                      <div>
                        <span className="text-stone-500 font-semibold">মাস্টার পাসওয়ার্ড:</span>
                        <div className="font-bold text-stone-800 mt-0.5 text-sm font-mono" id="telegram-open-pass">
                          {showTelegramMasterPass ? (globalSettings.telegramOpenPass || 'Shihab@2025#') : '••••••••••••'}
                        </div>
                        <p className="text-[10px] text-amber-700/90 font-bold mt-1">
                          এই পাসওয়ার্ডটি অ্যাকাউন্ট তৈরি করতে ব্যবহার করুন
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => setShowTelegramMasterPass(!showTelegramMasterPass)}
                          className="bg-white/80 hover:bg-white text-stone-700 p-1.5 rounded-lg border border-stone-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                          title={showTelegramMasterPass ? "লুকিয়ে রাখুন" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showTelegramMasterPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleCopy(globalSettings.telegramOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                          className="bg-[#764ba2] hover:bg-[#667eea] text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleTelegramSell} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">টেলিগ্রাম ফোন নাম্বার (+৮৮০ সহ)</label>
                      <input 
                        type="tel" 
                        placeholder="+88017XXXXXXXX"
                        value={telegramNumber}
                        onChange={(e) => setTelegramNumber(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">অতিরিক্ত তথ্য / ২-ফ্যাক্টর কোড / পাসওয়ার্ড (যদি থাকে)</label>
                      <textarea 
                        placeholder="পাসওয়ার্ড বা ওটিপি/টোকেন সংক্রান্ত বিশেষ কোনো নির্দেশ থাকলে এখানে লিখুন (বিকল্প)"
                        value={telegramDetails}
                        onChange={(e) => setTelegramDetails(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition resize-none font-medium leading-relaxed"
                        rows={3}
                      />
                    </div>

                    {telegramMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${telegramMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        {telegramMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{telegramMessage.text}</span>
                      </div>
                    )}

                    {/* Admin Guidelines / Custom Texts */}
                    {socialTexts.filter(t => t.platform === 'telegram').length > 0 && (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 mt-4 text-left">
                        <h5 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-sky-600 rounded-full"></span>
                          এডমিন নির্দেশাবলী (Admin Guidelines)
                        </h5>
                        <ul className="list-disc pl-4 text-stone-600 text-xs space-y-1 font-medium leading-relaxed">
                          {socialTexts.filter(t => t.platform === 'telegram').map(t => (
                            <li key={t.id}>{t.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingTelegram}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmittingTelegram ? 'জমা হচ্ছে...' : 'বিক্রি করতে জমা দিন ✔'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: WHATSAPP SELL */}
        {activeTab === 'whatsapp-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>

            <h2 className="text-lg font-bold text-stone-800 tracking-tight">হোয়াটসঅ্যাপ নাম্বার sell করে বোনাস ইনকাম</h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              {globalSettings.whatsappMaintenanceEnabled ? (
                <div className="text-center py-6 flex flex-col items-center space-y-3">
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
                  <div className="text-center py-2 flex flex-col items-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-sm font-bold text-lg">
                      W
                    </div>
                    <h4 className="font-extrabold text-stone-800 text-sm">হোয়াটসঅ্যাপ নাম্বার বিক্রি করুন</h4>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                      আপনার হোয়াটসঅ্যাপ নাম্বারটি নিজে ভেরিফাই করে জমা দিন। প্রতি সচল হোয়াটসঅ্যাপের জন্য আপনি পাবেন:
                    </p>
                    <span className="mt-2 inline-block bg-emerald-50 text-emerald-650 font-black text-base px-4 py-1.5 rounded-full border border-emerald-100">
                      ৳{globalSettings.whatsappPrice || 30} (প্রতি পিস)
                    </span>
                    {globalSettings.whatsappLastDate && (
                      <div className={`mt-4 w-full max-w-md p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.whatsappLastDate) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <div className="flex items-center gap-1">
                          <span>🕒 সাবমিট করার শেষ সময়:</span>
                        </div>
                        <span className="font-extrabold text-sm leading-none pt-1">{formatDeadline(globalSettings.whatsappLastDate)}</span>
                        {isDeadlinePassed(globalSettings.whatsappLastDate) && <span className="text-[10px] text-red-600 font-extrabold pt-1">🚫 সময় শেষ হয়ে গেছে! আর হোয়াটসঅ্যাপ আইডি সাবমিট করা যাবে না।</span>}
                      </div>
                    )}
                  </div>

                  {/* Password credentials to configure */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex justify-between items-start text-xs ANONYMOUS_PASS_CARD">
                      <div>
                        <span className="text-stone-500 font-semibold">মাস্টার পাসওয়ার্ড:</span>
                        <div className="font-bold text-stone-800 mt-0.5 text-sm font-mono" id="whatsapp-open-pass">
                          {showWhatsappMasterPass ? (globalSettings.whatsappOpenPass || 'Shihab@2025#') : '••••••••••••'}
                        </div>
                        <p className="text-[10px] text-amber-700/90 font-bold mt-1">
                          এই পাসওয়ার্ডটি অ্যাকাউন্ট তৈরি করতে ব্যবহার করুন
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => setShowWhatsappMasterPass(!showWhatsappMasterPass)}
                          className="bg-white/80 hover:bg-white text-stone-700 p-1.5 rounded-lg border border-stone-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                          title={showWhatsappMasterPass ? "লুকিয়ে রাখুন" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showWhatsappMasterPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleCopy(globalSettings.whatsappOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                          className="bg-[#764ba2] hover:bg-[#667eea] text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleWhatsappSell} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">হোয়াটসঅ্যাপ ফোন নাম্বার (+৮৮০ সহ)</label>
                      <input 
                        type="tel" 
                        placeholder="+88017XXXXXXXX"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block pl-1">২-ফ্যাক্টর পিন / অতিরিক্ত তথ্য</label>
                      <textarea 
                        placeholder="আপনার অ্যাকাউন্টের ২-ফ্যাক্টর পিন বা টু-স্টেপ ভেরিফিকেশন পিন থাকলে এখানে অবশ্যই লিখে দিন (অপশনাল)"
                        value={whatsappDetails}
                        onChange={(e) => setWhatsappDetails(e.target.value)}
                        className="w-full bg-stone-50 border-2 border-stone-150 focus:border-[#764ba2] rounded-2xl p-4 text-xs font-bold outline-none transition resize-none font-medium leading-relaxed"
                        rows={3}
                      />
                    </div>

                    {whatsappMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 ${whatsappMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        {whatsappMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{whatsappMessage.text}</span>
                      </div>
                    )}

                    {/* Admin Guidelines / Custom Texts */}
                    {socialTexts.filter(t => t.platform === 'whatsapp').length > 0 && (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 mt-4 text-left">
                        <h5 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                          এডমিন নির্দেশাবলী (Admin Guidelines)
                        </h5>
                        <ul className="list-disc pl-4 text-stone-600 text-xs space-y-1 font-medium leading-relaxed">
                          {socialTexts.filter(t => t.platform === 'whatsapp').map(t => (
                            <li key={t.id}>{t.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingWhatsapp}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg transition disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmittingWhatsapp ? 'জমা হচ্ছে...' : 'বিক্রি করতে জমা দিন ✔'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: FACEBOOK SELL */}
        {activeTab === 'facebook-sell' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>

            <h2 className="text-lg font-bold text-stone-800 tracking-tight">ফেসবুক আইডি sell করে বোনাস ইনকাম</h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              {globalSettings.facebookMaintenanceEnabled ? (
                <div className="text-center py-6 flex flex-col items-center space-y-3">
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
                  <div className="text-center py-2 flex flex-col items-center">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 shadow-sm font-bold text-lg">
                      F
                    </div>
                    <h4 className="font-extrabold text-stone-800 text-sm">পুরাতন ফেসবুক একাউন্ট বিক্রি করুন</h4>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                      নিচে সমস্ত সঠিক লগইন ক্রেডেনশিয়াল প্রদান করে জমা দিন। এডমিনের ভেরিফিকেশনের পর আপনি পাবেন:
                    </p>
                    <span className="mt-2 inline-block bg-indigo-50 text-indigo-650 font-black text-base px-4 py-1.5 rounded-full border border-indigo-100">
                      ৳{globalSettings.facebookPrice || 25} (প্রতি পিস)
                    </span>
                    {globalSettings.facebookLastDate && (
                      <div className={`mt-4 w-full max-w-md p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.facebookLastDate) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <div className="flex items-center gap-1">
                          <span>🕒 সাবমিট করার শেষ সময়:</span>
                        </div>
                        <span className="font-extrabold text-sm leading-none pt-1">{formatDeadline(globalSettings.facebookLastDate)}</span>
                        {isDeadlinePassed(globalSettings.facebookLastDate) && <span className="text-[10px] text-red-600 font-extrabold pt-1">🚫 সময় শেষ হয়ে গেছে! আর ফেসবুক আইডি সাবমিট করা যাবে না।</span>}
                      </div>
                    )}
                  </div>

                  {/* Password credentials to configure */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex justify-between items-start text-xs ANONYMOUS_PASS_CARD">
                      <div>
                        <span className="text-stone-500 font-semibold">মাস্টার পাসওয়ার্ড:</span>
                        <div className="font-bold text-stone-800 mt-0.5 text-sm font-mono" id="facebook-open-pass">
                          {showFacebookMasterPass ? (globalSettings.facebookOpenPass || 'Shihab@2025#') : '••••••••••••'}
                        </div>
                        <p className="text-[10px] text-amber-700/90 font-bold mt-1">
                          এই পাসওয়ার্ডটি অ্যাকাউন্ট তৈরি করতে ব্যবহার করুন
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => setShowFacebookMasterPass(!showFacebookMasterPass)}
                          className="bg-white/80 hover:bg-white text-stone-700 p-1.5 rounded-lg border border-stone-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                          title={showFacebookMasterPass ? "লুকিয়ে রাখুন" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showFacebookMasterPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleCopy(globalSettings.facebookOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                          className="bg-[#764ba2] hover:bg-[#667eea] text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleFacebookSell} className="space-y-4 pt-2">
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
            <button onClick={() => switchTab('home')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>

            <h2 className="text-lg font-bold text-stone-800 tracking-tight">ইন্সটাগ্রাম আইডি sell করে বোনাস ইনকাম</h2>

            <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-4">
              {globalSettings.instagramMaintenanceEnabled ? (
                <div className="text-center py-6 flex flex-col items-center space-y-3">
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
                  <div className="text-center py-2 flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#fa7e1e]/10 text-[#fa7e1e] rounded-full flex items-center justify-center mb-3 shadow-xs font-bold text-lg">
                      I
                    </div>
                    <h4 className="font-extrabold text-stone-800 text-sm">পুরাতন ইন্সটাগ্রাম একাউন্ট বিক্রি করুন</h4>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                      নিচে সমস্ত সঠিক লগইন ক্রেডেনশিয়াল প্রদান করে জমা দিন। এডমিনের ভেরিফিকেশনের পর আপনি পাবেন:
                    </p>
                    <span className="mt-2 inline-block bg-[#fa7e1e]/10 text-[#fa7e1e] font-black text-base px-4 py-1.5 rounded-full border border-[#fa7e1e]/20">
                      ৳{globalSettings.instagramPrice || 20} (প্রতি পিস)
                    </span>
                    {globalSettings.instagramLastDate && (
                      <div className={`mt-4 w-full max-w-md p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 text-center ${isDeadlinePassed(globalSettings.instagramLastDate) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <div className="flex items-center gap-1">
                          <span>🕒 সাবমিট করার শেষ সময়:</span>
                        </div>
                        <span className="font-extrabold text-sm leading-none pt-1">{formatDeadline(globalSettings.instagramLastDate)}</span>
                        {isDeadlinePassed(globalSettings.instagramLastDate) && <span className="text-[10px] text-red-600 font-extrabold pt-1">🚫 সময় শেষ হয়ে গেছে! আর ইন্সটাগ্রাম আইডি সাবমিট করা যাবে না।</span>}
                      </div>
                    )}
                  </div>

                  {/* Password credentials to configure */}
                  {!globalSettings.hideMasterPasswords && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex justify-between items-start text-xs ANONYMOUS_PASS_CARD">
                      <div>
                        <span className="text-stone-500 font-semibold">মাস্টার পাসওয়ার্ড:</span>
                        <div className="font-bold text-stone-800 mt-0.5 text-sm font-mono" id="instagram-open-pass">
                          {showInstagramMasterPass ? (globalSettings.instagramOpenPass || 'Shihab@2025#') : '••••••••••••'}
                        </div>
                        <p className="text-[10px] text-amber-700/90 font-bold mt-1">
                          এই পাসওয়ার্ডটি অ্যাকাউন্ট তৈরি করতে ব্যবহার করুন
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => setShowInstagramMasterPass(!showInstagramMasterPass)}
                          className="bg-white/80 hover:bg-white text-stone-700 p-1.5 rounded-lg border border-stone-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                          title={showInstagramMasterPass ? "লুকিয়ে রাখুন" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showInstagramMasterPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleCopy(globalSettings.instagramOpenPass || 'Shihab@2025#', 'পাসওয়ার্ড কপি হয়েছে')}
                          className="bg-[#764ba2] hover:bg-[#667eea] text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                  )}

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
                          className="w-full h-full object-cover" 
                          alt="Campaign" 
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
                  className="w-full h-full object-cover" 
                  alt="Job Banner" 
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
                    className="fixed inset-0 bg-black/60 z-55 backdrop-blur-xs"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-x-5 bottom-10 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 z-55 space-y-4"
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
                      <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-xs space-y-5 font-sans">
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
      </AnimatePresence>

    </div>
  );
}
