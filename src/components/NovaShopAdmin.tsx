import React, { useState, useEffect } from 'react';
import { novaDb } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  Plus, 
  Trash, 
  UserPlus, 
  Settings, 
  Box, 
  Layers, 
  Users, 
  FileText, 
  Check, 
  X, 
  ShieldAlert, 
  Coins, 
  ArrowLeftCircle, 
  HelpCircle,
  TrendingDown,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NovaShopAdminProps {
  onBackToTakahubAdmin: () => void;
}

export default function NovaShopAdmin({ onBackToTakahubAdmin }: NovaShopAdminProps) {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'requests' | 'products' | 'sliders' | 'users' | 'settings'>('dashboard');
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Dashboard Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pRegPrice, setPRegPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImage, setPImage] = useState('');
  const [pType, setPType] = useState('course');
  const [pLink, setPLink] = useState('');

  // Sliders state
  const [sliders, setSliders] = useState<any[]>([]);
  const [sImage, setSImage] = useState('');

  // Users state
  const [users, setUsers] = useState<any[]>([]);

  // Config settings state
  const [bkash, setBkash] = useState('');
  const [nagad, setNagad] = useState('');
  const [rocket, setRocket] = useState('');
  const [autoPayBrandKey, setAutoPayBrandKey] = useState('');
  
  const [noticeText, setNoticeText] = useState('');
  const [noticeLink, setNoticeLink] = useState('');

  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');

  const [tickerText, setTickerText] = useState('');

  // Toasts
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'err' } | null>(null);

  const showToast = (text: string, type: 'success' | 'err' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // 1. Fetch Nova Shop admin values
  useEffect(() => {
    // Users count
    const unsubUsers = onSnapshot(collection(novaDb, 'users'), (snap) => {
      setTotalUsers(snap.size);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    });

    // Products count & lists
    const unsubProducts = onSnapshot(collection(novaDb, 'products'), (snap) => {
      setTotalProducts(snap.size);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    });

    // Pending requests
    const qRequests = query(collection(novaDb, 'requests'), where('status', '==', 'pending'));
    const unsubRequests = onSnapshot(qRequests, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingRequests(list);
    });

    // Revenue calculator from orders
    const unsubRevenue = onSnapshot(collection(novaDb, 'orders'), (snap) => {
      let revenue = 0;
      snap.forEach((d) => {
        revenue += (d.data().price || 0);
      });
      setTotalRevenue(revenue);
    });

    // Sliders
    const unsubSliders = onSnapshot(collection(novaDb, 'sliders'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSliders(list);
    });

    // Config loaders
    onSnapshot(doc(novaDb, 'config', 'settings'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setBkash(d.bkash || '');
        setNagad(d.nagad || '');
        setRocket(d.rocket || '');
        setAutoPayBrandKey(d.autoPayBrandKey || '');
        setNoticeText(d.noticeText || '');
        setNoticeLink(d.noticeLink || '');
        setTelegram(d.telegram || '');
        setWhatsapp(d.whatsapp || '');
        setFacebook(d.facebook || '');
        setYoutube(d.youtube || '');
        if (d.ticker) setTickerText(d.ticker.join(', '));
      }
    });

    return () => {
      unsubUsers();
      unsubProducts();
      unsubRequests();
      unsubRevenue();
      unsubSliders();
    };
  }, []);

  // Approves deposit money request
  const handleApproveRequest = (item: any) => {
    setConfirmState({
      title: 'রিকোয়েস্ট অনুমোদন নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই ডিপোজিট রিকোয়েস্টটি অনুমোদন করতে চান?',
      onConfirm: async () => {
        try {
          // Fetch user profile to get previous balance
          const userDocRef = doc(novaDb, 'users', item.uid);
          const userSnap = await getDoc(userDocRef);

          const previousBalance = userSnap.exists() ? (userSnap.data().balance || 0) : 0;
          const newBalance = previousBalance + item.amount;

          // Update balance & set approval status
          await updateDoc(userDocRef, { balance: newBalance });
          await updateDoc(doc(novaDb, 'requests', item.id), { status: 'approved' });

          showToast('রিকোয়েস্ট অ্যাপ্রুভ করা হয়েছে!', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  // Rejects deposit money request
  const handleRejectRequest = (requestId: string) => {
    setConfirmState({
      title: 'রিকোয়েস্ট বাতিল নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই ডিপোজিট রিকোয়েস্টটি বাতিল করতে চান?',
      onConfirm: async () => {
        try {
          await updateDoc(doc(novaDb, 'requests', requestId), { status: 'rejected' });
          showToast('রিকোয়েস্ট বাতিল করা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ভুল: ' + e.message, 'err');
        }
      }
    });
  };

  // Adds a products
  const handleAddProduct = async () => {
    if (!pName || !pPrice || !pLink || !pDesc) {
      showToast('সব তথ্য দিন (নাম, অফার প্রাইজ, বিবরণ, ড্রাইভ লিংক)', 'err');
      return;
    }

    try {
      const parsedPrice = parseFloat(pPrice);
      const parsedRegPrice = pRegPrice ? parseFloat(pRegPrice) : parsedPrice * 1.25;

      await addDoc(collection(novaDb, 'products'), {
        title: pName.trim(),
        price: parsedPrice,
        regularPrice: parsedRegPrice,
        desc: pDesc.trim(),
        link: pLink.trim(),
        image: pImage.trim() || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pName),
        type: pType,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      showToast('প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে', 'success');
      setPName('');
      setPPrice('');
      setPRegPrice('');
      setPDesc('');
      setPImage('');
      setPLink('');
    } catch (e: any) {
      showToast('ভুল: ' + e.message, 'err');
    }
  };

  // Deletes simple records
  const handleDeleteRecord = (col: string, id: string) => {
    setConfirmState({
      title: 'রেকর্ড ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(novaDb, col, id));
          showToast('সফলভাবে ডিলিট করা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ডিলিট ব্যর্থ: ' + e.message, 'err');
        }
      }
    });
  };

  // Adds Image Slider Doc
  const handleAddSlider = async () => {
    if (!sImage.trim()) {
      showToast('ইমেজ লিংক দিন', 'err');
      return;
    }
    try {
      await addDoc(collection(novaDb, 'sliders'), {
        image: sImage.trim(),
        createdAt: new Date().toISOString()
      });
      showToast('স্লাইডার যুক্ত হয়েছে', 'success');
      setSImage('');
    } catch (e: any) {
      showToast('ব্যর্থ হয়েছে: ' + e.message, 'err');
    }
  };

  // Modify user balances via prompts
  const handleEditUserBalance = async (userItem: any) => {
    const amt = prompt('নতুন ব্যালেন্স পরিমাণ লিখুন (৳):', userItem.balance || 0);
    if (amt === null) return;

    const parsed = parseFloat(amt);
    if (isNaN(parsed)) {
      showToast('সঠিক ব্যালেন্স লিখুন', 'err');
      return;
    }

    try {
      await updateDoc(doc(novaDb, 'users', userItem.id), { balance: parsed });
      showToast('ইউজার ব্যালেন্স পরিবর্তন করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  // Save Settings Configs
  const handleSaveSettings = async (keys: { [key: string]: any }) => {
    try {
      const settingsRef = doc(novaDb, 'config', 'settings');
      await setDoc(settingsRef, keys, { merge: true });
      showToast('সেটিংস তথ্য সফলভাবে সেভ করা হয়েছে!', 'success');
    } catch (e: any) {
      showToast('সংরক্ষণ ব্যর্থ: ' + e.message, 'err');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col max-w-sm mx-auto shadow-2xl relative overflow-x-hidden border-x border-neutral-900 pb-20">
      
      {/* Toast Overlay */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-[85%] text-[11px] font-bold leading-normal border ${
              alert.type === 'success' 
              ? 'bg-emerald-950 border-emerald-900 text-emerald-300' 
              : 'bg-rose-950 border-rose-900 text-rose-300'
            }`}
          >
            <Check size={14} />
            <span>{alert.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <header className="bg-neutral-950 sticky top-0 z-40 p-4 border-b border-neutral-900 flex justify-between items-center bg-opacity-95 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white p-1 shadow-md shadow-violet-750">
            <Box size={16} />
          </div>
          <div>
            <h1 className="text-xs font-black text-violet-400 uppercase tracking-widest leading-none">NOVA ADMIN</h1>
            <span className="text-[9px] text-neutral-400 font-semibold tracking-wide">কন্ট্রোল মডিউল</span>
          </div>
        </div>

        <button 
          onClick={onBackToTakahubAdmin}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
        >
          <ArrowLeftCircle size={12} />
          <span>আর্নিং প্যানেল</span>
        </button>
      </header>

      {/* Admin tab bar selector */}
      <nav className="bg-neutral-900 p-2 border-b border-neutral-900 grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center text-neutral-400">
        <button 
          onClick={() => setActiveSection('dashboard')} 
          className={`py-1.5 rounded-lg transition ${activeSection === 'dashboard' ? 'bg-neutral-800 text-violet-400 shadow-2xs' : 'hover:bg-neutral-850'}`}
        >
          ড্যাশবোর্ড
        </button>
        <button 
          onClick={() => setActiveSection('requests')} 
          className={`py-1.5 rounded-lg transition relative ${activeSection === 'requests' ? 'bg-neutral-800 text-violet-400 shadow-2xs' : 'hover:bg-neutral-850'}`}
        >
          রিকোয়েস্ট
          {pendingRequests.length > 0 && (
            <span className="absolute top-1 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveSection('products')} 
          className={`py-1.5 rounded-lg transition ${activeSection === 'products' ? 'bg-neutral-800 text-violet-400 shadow-2xs' : 'hover:bg-neutral-850'}`}
        >
          পণ্য যোগ
        </button>
        <button 
          onClick={() => setActiveSection('sliders')} 
          className={`py-1.5 rounded-lg transition ${activeSection === 'sliders' ? 'bg-neutral-800 text-violet-400 shadow-2xs' : 'hover:bg-neutral-850'}`}
        >
          স্লাইডার
        </button>
        <button 
          onClick={() => setActiveSection('users')} 
          className={`py-1.5 rounded-lg transition ${activeSection === 'users' ? 'bg-neutral-800 text-violet-400 shadow-2xs' : 'hover:bg-neutral-850'}`}
        >
          ইউজার
        </button>
        <button 
          onClick={() => setActiveSection('settings')} 
          className={`py-1.5 rounded-lg transition ${activeSection === 'settings' ? 'bg-neutral-800 text-violet-400 shadow-2xs' : 'hover:bg-neutral-850'}`}
        >
          সেটিংস
        </button>
      </nav>

      {/* Main Pages content body */}
      <main className="p-4 space-y-5">

        {/* 1. SECTION: DASHBOARD STATS */}
        {activeSection === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-neutral-900 border border-neutral-900 rounded-3xl p-5 text-center relative overflow-hidden">
                <Users size={16} className="text-zinc-500 absolute top-3.5 right-3.5" />
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">মোট শপিং ইউজার</span>
                <strong className="block text-2xl font-black mt-2 tracking-tight text-white">{totalUsers}</strong>
              </div>

              <div className="bg-neutral-900 border border-neutral-900 rounded-3xl p-5 text-center relative overflow-hidden">
                <Box size={16} className="text-zinc-500 absolute top-3.5 right-3.5" />
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">মোট প্রোডাক্ট সংখ্যা</span>
                <strong className="block text-2xl font-black mt-2 tracking-tight text-white">{totalProducts}</strong>
              </div>

              <div className="bg-neutral-900 border border-neutral-900 rounded-3xl p-5 text-center relative overflow-hidden">
                <HelpCircle size={16} className="text-amber-500 absolute top-3.5 right-3.5" />
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-500">পেন্ডিং রিকুয়েস্ট</span>
                <strong className="block text-2xl font-black mt-2 tracking-tight text-amber-400">{pendingRequests.length}</strong>
              </div>

              <div className="bg-neutral-900 border border-neutral-900 rounded-3xl p-5 text-center relative overflow-hidden">
                <Coins size={16} className="text-violet-400 absolute top-3.5 right-3.5" />
                <span className="text-[10px] uppercase font-black tracking-wider text-violet-400">স্টোর মোট আয়</span>
                <strong className="block text-xl font-black mt-2 tracking-tight text-violet-300">৳{totalRevenue}</strong>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-900 rounded-3xl p-5 space-y-3.5">
              <h3 className="text-xs font-black text-rose-500 flex items-center gap-1">
                <ShieldAlert size={14} />
                <span>মডিউল সেটিংস নির্দেশনা</span>
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                ডান কোনা উপরে অবস্থিত 'আর্নিং প্যানেল' বাটনে ক্লিক করে TakaHub Pro এর অ্যাডমিন প্যানেলে ফিরতে পারবেন। এই মডিউলের মাধ্যমে Nova Shop Firestore ডাটাবেজ তথ্যগুলো পরিচালনা করা সম্ভব।
              </p>
            </div>
          </div>
        )}

        {/* 2. SECTION: MONEY REQUESTS APPROVALS */}
        {activeSection === 'requests' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-violet-400 uppercase tracking-widest pl-1">পেন্ডিং পেমেন্ট রিকুয়েস্ট ({pendingRequests.length})</h3>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-10 bg-neutral-900 border border-neutral-900 rounded-3xl text-zinc-500 text-xs font-bold shadow-xs">
                কোনো পেন্ডিং ব্যালেন্স রিকুয়েস্ট নেই
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingRequests.map((item) => (
                  <div key={item.id} className="bg-neutral-900 border border-neutral-900 p-4 rounded-2xl text-xs space-y-3 shadow-md relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-zinc-200 block truncate max-w-[200px] font-sans">{item.email}</strong>
                        <span className="text-[9px] text-zinc-550 block font-semibold mt-0.5">UID: {item.uid?.substring(0,8)}...</span>
                      </div>
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-amber-200 text-sm">৳ {item.amount}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] bg-neutral-950/40 p-2 rounded-xl">
                      <div>
                        <span className="text-zinc-500 font-bold uppercase tracking-wider block">Trx:</span>
                        <strong className="text-amber-300 font-mono text-[11px] tracking-wide select-all">{item.trx}</strong>
                      </div>
                      <span className="bg-zinc-800 text-zinc-350 px-2 py-0.5 rounded-md font-sans text-right capitalize font-bold">{item.method}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-sans font-bold text-[11px] text-center">
                      <button 
                        onClick={() => handleRejectRequest(item.id)}
                        className="bg-rose-950/80 hover:bg-rose-900 border border-rose-900/50 text-rose-350 py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <X size={13} />
                        <span>বাতিল</span>
                      </button>

                      <button 
                        onClick={() => handleApproveRequest(item)}
                        className="bg-emerald-900/80 hover:bg-emerald-850 border border-emerald-800/50 text-emerald-300 py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm shadow-emerald-900/10"
                      >
                        <Check size={13} />
                        <span>অ্যাপ্রুভ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. SECTION: ADD PRODUCTS */}
        {activeSection === 'products' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-900 p-5 rounded-[24px] space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-violet-400 border-b border-neutral-850 pb-2">নতুন প্রোডাক্ট যুক্ত করুন</h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block">প্রোডাক্ট টাইটেল*</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: প্রিমিয়াম থিম ফাইল"
                    value={pName} 
                    onChange={(e) => setPName(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">বিক্রয় মূল্য (৳)*</label>
                    <input 
                      type="number" 
                      placeholder="120"
                      value={pPrice} 
                      onChange={(e) => setPPrice(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 font-mono transition font-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">রেগুলার মূল্য (৳)</label>
                    <input 
                      type="number" 
                      placeholder="500"
                      value={pRegPrice} 
                      onChange={(e) => setPRegPrice(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 font-mono transition font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block">সংক্ষিপ্ত বিবরণ (Description)*</label>
                  <textarea 
                    rows={3}
                    placeholder="প্রোডাক্ট বা থিম সম্পর্কে বিবরণ লিখুন..."
                    value={pDesc} 
                    onChange={(e) => setPDesc(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 transition leading-relaxed font-semibold h-20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block">ইমেজ লিংক (URL)</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={pImage} 
                    onChange={(e) => setPImage(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block">প্রোডাক্ট ক্যাটাগরি</label>
                  <select 
                    value={pType} 
                    onChange={(e) => setPType(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 transition font-bold"
                  >
                    <option value="course">প্রিমিয়াম ওয়েবসাইট</option>
                    <option value="app">প্রিমিয়াম ফাইল</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block">ড্রাইভ বা ডাউনলোড লিংক*</label>
                  <input 
                    type="text" 
                    placeholder="https://drive.google.com/..."
                    value={pLink} 
                    onChange={(e) => setPLink(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-xs outline-none focus:border-violet-600 transition font-mono"
                  />
                </div>

                <button 
                  onClick={handleAddProduct}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-3 rounded-xl text-xs transition"
                >
                  পণ্য সেভ করুন
                </button>
              </div>
            </div>

            {/* List all stored products */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 pl-1">সকল রানিং পণ্য ({products.length})</h4>
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-900 p-3 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-extrabold text-zinc-200 block truncate">{p.title}</span>
                      <span className="text-[9px] text-zinc-500 font-mono tracking-wide mt-0.5">৳ {p.price} / {p.type === 'course' ? 'ওয়েবসাইট' : 'ফাইল'}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteRecord('products', p.id)}
                      className="text-rose-500 hover:bg-rose-950/20 p-2 rounded-lg"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. SECTION: SLIDERS */}
        {activeSection === 'sliders' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-900 p-5 rounded-3xl space-y-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase text-violet-400">নতুন ব্যানার স্লাইডার</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 block">ইমেজ লিংক (URL)</label>
                <input 
                  type="text" 
                  value={sImage} 
                  onChange={(e) => setSImage(e.target.value)} 
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded-xl text-xs outline-none font-mono text-zinc-300"
                />
              </div>
              <button 
                onClick={handleAddSlider} 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition"
              >
                যোগ করুন
              </button>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-neutral-400 pl-1">সকল যুক্ত ব্যানার</h4>
              {sliders.length === 0 ? (
                <p className="text-center py-6 text-xs text-neutral-500 font-semibold bg-neutral-900 border border-neutral-900 rounded-2xl">কোনো ব্যানার নেই</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {sliders.map((s) => (
                    <div key={s.id} className="bg-neutral-900 border border-neutral-900 p-3 rounded-2xl relative shadow-xs group">
                      <img src={s.image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'} className="w-full h-16 object-cover rounded-xl" alt="Slider Banner" />
                      <button 
                        onClick={() => handleDeleteRecord('sliders', s.id)}
                        className="absolute top-4 right-4 bg-neutral-950/80 backdrop-blur-md text-rose-500 hover:scale-105 transition p-1.5 rounded-lg border border-rose-900/35"
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SECTION: SHOPPERS / USERS PROFILE */}
        {activeSection === 'users' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-violet-400 pl-1">নিবন্ধনকৃত ক্রেতার তালিকা ({totalUsers})</h3>

            {users.length === 0 ? (
              <p className="text-center py-8 text-xs text-neutral-500 bg-neutral-900 border border-neutral-900 rounded-3xl font-bold">কোনো ইউজার ডাটা পাওয়া যায়নি</p>
            ) : (
              <div className="space-y-2">
                {users.map((item) => (
                  <div key={item.id} className="bg-neutral-900 border border-neutral-900 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                    <div className="min-w-0 pr-2 space-y-0.5">
                      <strong className="text-zinc-200 block truncate font-sans">{item.name || 'Shopper'}</strong>
                      <span className="text-[10px] text-zinc-500 block truncate font-mono">{item.email}</span>
                      <strong className="text-violet-400 text-[10px] font-mono block">ব্যালেন্স: ৳{item.balance || 0}</strong>
                    </div>

                    <button 
                      onClick={() => handleEditUserBalance(item)}
                      className="bg-zinc-800 hover:bg-violet-750 text-zinc-300 font-black py-1.5 px-3.5 rounded-lg transition text-[10px]"
                    >
                      সম্পাদনা
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. SECTION: SETTINGS PORTAL */}
        {activeSection === 'settings' && (
          <div className="space-y-4">
            
            {/* Notice / telegram channels */}
            <div className="bg-neutral-900 border border-neutral-900 p-4 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-black text-rose-500 uppercase tracking-wide flex items-center gap-1">
                <Volume2 size={13} />
                <span>জরুরি ওয়েলকাম নোটিশ</span>
              </h4>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold block">নোটিশ টেক্সট</label>
                <textarea 
                  rows={2}
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="নোটিশ বার্তা লিখুন..."
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded-lg text-xs leading-normal resize-none outline-none focus:border-violet-600 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold block">টেলিগ্রাম চ্যানেল লিংক</label>
                <input 
                  type="text"
                  value={noticeLink}
                  onChange={(e) => setNoticeLink(e.target.value)}
                  placeholder="https://t.me/channel"
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded-lg text-xs outline-none focus:border-violet-600 transition font-mono text-zinc-400"
                />
              </div>
              <button 
                onClick={() => handleSaveSettings({ noticeText, noticeLink })}
                className="w-full bg-violet-600 py-2 rounded-xl text-[10px] font-black"
              >
                নোটিশ সেভ করুন
              </button>
            </div>

            {/* Payment Numbers */}
            <div className="bg-neutral-900 border border-neutral-900 p-4 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest pl-1">ম্যানুয়াল পেমেন্ট নম্বর সেটিংস</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">বিকাশ</label>
                  <input type="text" value={bkash} onChange={(e) => setBkash(e.target.value)} className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg text-[10px] font-mono outline-none" placeholder="01XXXXXXXXX" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">নগদ</label>
                  <input type="text" value={nagad} onChange={(e) => setNagad(e.target.value)} className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg text-[10px] font-mono outline-none" placeholder="01XXXXXXXXX" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">রকেট</label>
                  <input type="text" value={rocket} onChange={(e) => setRocket(e.target.value)} className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg text-[10px] font-mono outline-none" placeholder="01XXXXXXXXX" />
                </div>
              </div>

              <div className="space-y-1 bg-zinc-950/40 p-3 rounded-xl border border-dashed border-neutral-800">
                <label className="text-[9px] text-amber-400 font-black tracking-widest uppercase block">Auto Pay Brand Key</label>
                <input 
                  type="text" 
                  value={autoPayBrandKey} 
                  onChange={(e) => setAutoPayBrandKey(e.target.value)} 
                  placeholder="ব্র্যান্ড পেমেন্ট কি লিখুন"
                  className="w-full bg-neutral-950 border border-neutral-850 p-2 mt-1 rounded-lg text-[10px] outline-none text-amber-200 uppercase font-mono tracking-wider focus:border-amber-500" 
                />
                <span className="text-[8px] text-neutral-500 font-semibold mt-1 block leading-tight">* ব্র্যান্ড کی বসালে অটো পেমেন্ট সক্রিয় হবে।</span>
              </div>

              <button 
                onClick={() => handleSaveSettings({ bkash, nagad, rocket, autoPayBrandKey })}
                className="w-full bg-violet-600 py-2 rounded-xl text-[10px] font-black"
              >
                পেমেন্ট নম্বর সেভ করুন
              </button>
            </div>

            {/* Support link channels */}
            <div className="bg-neutral-900 border border-neutral-900 p-4 rounded-2xl space-y-3 shadow-xs text-xs">
              <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest pl-1">সাপোর্ট চ্যানেল কো-অর্ডিনেটস</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">Telegram Group</label>
                  <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg font-mono text-[10px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">WhatsApp Line</label>
                  <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg font-mono text-[10px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">Facebook Page</label>
                  <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg font-mono text-[10px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold block">YouTube Link</label>
                  <input type="text" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-850 p-2 rounded-lg font-mono text-[10px]" />
                </div>
              </div>

              <button 
                onClick={() => handleSaveSettings({ telegram, whatsapp, facebook, youtube })}
                className="w-full bg-violet-600 py-2 rounded-xl text-[10px] font-black"
              >
                সাপোর্ট চ্যানেল সেভ করুন
              </button>
            </div>

            {/* Headline Ticker text */}
            <div className="bg-neutral-900 border border-neutral-900 p-4 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest pl-1">হেডলাইন টিকার স্ক্রল সেটিংস</h4>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold block">টিকার বার্তা (কমা দিয়ে আলাদা করুন)</label>
                <textarea 
                  rows={2}
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  placeholder="যেমন: ১ মিনিটে পেমেন্ট অ্যাড করুন, নতুন ফাইল রিলিজ হয়েছে..."
                  className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded-lg text-xs outline-none focus:border-violet-600 font-sans leading-normal resize-none"
                />
              </div>

              <button 
                onClick={() => {
                  const items = tickerText.split(',').map((x) => x.trim()).filter(Boolean);
                  handleSaveSettings({ ticker: items });
                }}
                className="w-full bg-violet-600 py-2 rounded-xl text-[10px] font-black"
              >
                টিকার সেভ করুন
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg animate-pulse">
                  <ShieldAlert size={18} />
                </span>
                {confirmState.title}
              </h3>
              <p className="text-xs text-zinc-300 mb-6 leading-relaxed bg-neutral-950/40 p-3 rounded-lg border border-neutral-850">
                {confirmState.message}
              </p>
              <div className="flex gap-3 justify-end font-sans">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-zinc-200 rounded-xl text-xs font-semibold signup-btn transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const action = confirmState.onConfirm;
                    setConfirmState(null);
                    await action();
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-550 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-650/20 transition"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
