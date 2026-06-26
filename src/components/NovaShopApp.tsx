import React, { useState, useEffect } from 'react';
import { novaDb, novaAuth } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  getDoc, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  runTransaction,
  writeBatch,
  orderBy
} from 'firebase/firestore';
import { 
  ShoppingBag, 
  Wallet, 
  User, 
  ShoppingCart, 
  Headphones, 
  ChevronRight, 
  X, 
  Volume2, 
  FileText, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Share2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Swiper equivalent custom React Slider for premium feel
function CustomSlider({ sliders }: { sliders: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliders]);

  if (sliders.length === 0) {
    return (
      <div className="w-full h-40 bg-zinc-800 rounded-3xl animate-pulse flex items-center justify-center text-xs text-zinc-500">
        স্লাইডার লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[175px] rounded-[30px] overflow-hidden shadow-lg border border-zinc-200">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide}
          src={sliders[currentSlide]?.image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover"
          alt="Banner"
        />
      </AnimatePresence>
      {sliders.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {sliders.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-indigo-600 w-4' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NovaShopAppProps {
  userId: string;
  userEmail: string;
  onBackToEarning: () => void;
}

export default function NovaShopApp({ userId, userEmail, onBackToEarning }: NovaShopAppProps) {
  const [novaTab, setNovaTab] = useState<'home' | 'add-money' | 'cart' | 'profile'>('home');
  const [novaUser, setNovaUser] = useState<any>(null);
  const [productsGrouped, setProductsGrouped] = useState<{ courses: any[]; apps: any[] }>({ courses: [], apps: [] });
  const [sliders, setSliders] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // Cart Local state
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('stshop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Target item for detail popup overlay
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Manual payment UI state
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentTrx, setPaymentTrx] = useState('');
  const [autoAmount, setAutoAmount] = useState('');
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  // Modals state
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [successOrders, setSuccessOrders] = useState<any[] | null>(null);
  const [purchasedOrders, setPurchasedOrders] = useState<any[]>([]);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Status feedback alerts
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'err' } | null>(null);

  const showAlert = (text: string, type: 'success' | 'err' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('stshop_cart', JSON.stringify(cart));
  }, [cart]);

  // 1. Fetch Nova Shop database values
  useEffect(() => {
    // Nova User balance / profile listener
    const userDocRef = doc(novaDb, 'users', userId);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setNovaUser(snap.data());
      } else {
        // If the user doesn't exist in Nova Shop Firestore, automatically initialize their record!
        // This is extremely graceful and guarantees they never hit empty errors!
        runTransaction(novaDb, async (transaction) => {
          transaction.set(userDocRef, {
            name: userEmail.split('@')[0],
            email: userEmail,
            balance: 0,
            createdAt: new Date().toISOString()
          });
        }).then(() => {
          showAlert('নোভা শপে আপনার একাউন্ট শুরু হয়েছে!', 'success');
        });
      }
    });

    // Sliders
    const unsubSliders = onSnapshot(collection(novaDb, 'sliders'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSliders(list);
    });

    // Settings config
    const unsubConfig = onSnapshot(doc(novaDb, 'config', 'settings'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig(data);
        if (data.noticeText && !sessionStorage.getItem('nova_notice_shown')) {
          setNoticeModalOpen(true);
          sessionStorage.setItem('nova_notice_shown', 'true');
        }
      }
    });

    // Products query
    const unsubProducts = onSnapshot(collection(novaDb, 'products'), (snap) => {
      const courses: any[] = [];
      const apps: any[] = [];
      snap.forEach((docSnap) => {
        const p = { id: docSnap.id, ...docSnap.data() } as any;
        if (p.status === 'active') {
          if (p.type === 'course') courses.push(p);
          else if (p.type === 'app') apps.push(p);
        }
      });
      setProductsGrouped({ courses, apps });
    });

    // Payment history requests listener
    const qRequests = query(collection(novaDb, 'requests'), where('uid', '==', userId));
    const unsubPayments = onSnapshot(qRequests, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPaymentHistory(list);
    });

    return () => {
      unsubUser();
      unsubSliders();
      unsubConfig();
      unsubProducts();
      unsubPayments();
    };
  }, [userId, userEmail]);

  // Handle Cart addition
  const handleAddToCart = (product: any) => {
    if (cart.some((item) => item.id === product.id)) {
      showAlert('আইটেমটি ইতিমধ্যে কার্টে আছে!', 'err');
      return;
    }
    setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    showAlert('কার্টে যুক্ত করা হয়েছে!', 'success');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
    showAlert('কার্ট থেকে বাদ দেওয়া হয়েছে', 'success');
  };

  // Process checkout cart
  const handleCheckoutCart = () => {
    const total = cart.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const balance = novaUser?.balance || 0;

    if (balance < total) {
      showAlert('পর্যাপ্ত ব্যালেন্স নেই! অ্যাড মানি করুন।', 'err');
      setNovaTab('add-money');
      return;
    }

    setConfirmState({
      title: 'অর্ডার নিশ্চিতকরণ',
      message: `আপনি কি ৳${total} পেমেন্ট করে কার্টের এই অর্ডারটি নিশ্চিত করতে চান?`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(novaDb);
          const orderPayloads: any[] = [];

          cart.forEach((item) => {
            const orderRef = doc(collection(novaDb, 'orders'));
            const orderData = {
              uid: userId,
              productId: item.id,
              title: item.title,
              price: item.price,
              image: item.image,
              type: item.type,
              date: new Date()
            };
            batch.set(orderRef, orderData);
            orderPayloads.push({ ...orderData, id: orderRef.id });
          });

          // Deduct balance
          const userRef = doc(novaDb, 'users', userId);
          batch.update(userRef, { balance: balance - total });

          await batch.commit();

          setSuccessOrders(orderPayloads);
          setCart([]);
          showAlert('আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!', 'success');
        } catch (e: any) {
          showAlert('অর্ডার ক্র্যাশ করেছে: ' + e.message, 'err');
        }
      }
    });
  };

  // Instant single product Purchase
  const handleBuyNow = (product: any) => {
    const balance = novaUser?.balance || 0;
    if (balance < product.price) {
      showAlert('পর্যাপ্ত ব্যালেন্স নেই! অ্যাড মানি করুন।', 'err');
      setSelectedProduct(null);
      setNovaTab('add-money');
      return;
    }

    setConfirmState({
      title: 'প্রোডাক্ট ক্রয়ের নিশ্চিতকরণ',
      message: `আপনি কি ৳${product.price} পেমেন্ট করে "${product.title}" প্রোডাক্টটি ক্রয় করতে চান?`,
      onConfirm: async () => {
        try {
          const userDocRef = doc(novaDb, 'users', userId);
          const orderDocRef = doc(collection(novaDb, 'orders'));
          const orderData = {
            uid: userId,
            productId: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            type: product.type,
            date: new Date()
          };

          await runTransaction(novaDb, async (transaction) => {
            transaction.update(userDocRef, { balance: balance - product.price });
            transaction.set(orderDocRef, orderData);
          });

          setSelectedProduct(null);
          setSuccessOrders([{ ...orderData, id: orderDocRef.id }]);
          showAlert('ক্রয় সম্পন্ন হয়েছে!', 'success');
        } catch (e: any) {
          showAlert('ক্রয় করা যায়নি: ' + e.message, 'err');
        }
      }
    });
  };

  // Submit manual money request
  const submitManualPayment = async () => {
    if (isPaymentSubmitting) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt < 10) {
      showAlert('সর্বনিম্ন ১০ টাকা এড করুন', 'err');
      return;
    }
    if (!paymentTrx.trim()) {
      showAlert('Transaction ID লিখুন', 'err');
      return;
    }

    setIsPaymentSubmitting(true);
    try {
      await addDoc(collection(novaDb, 'requests'), {
        uid: userId,
        email: userEmail,
        amount: amt,
        trx: paymentTrx.trim(),
        method: selectedMethod,
        status: 'pending',
        time: new Date()
      });

      showAlert('টাকা জমা দেওয়ার অনুরোধ পাঠানো হয়েছে!', 'success');
      setPaymentAmount('');
      setPaymentTrx('');
      setSelectedMethod(null);
    } catch (e: any) {
      showAlert('ত্রুটি: ' + e.message, 'err');
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleCopyText = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    showAlert(msg, 'success');
  };

  // Retrieve downloads links of ordered items
  const openMyOrders = async () => {
    try {
      const qOrders = query(collection(novaDb, 'orders'), where('uid', '==', userId));
      onSnapshot(qOrders, (snapshot) => {
        const orderList = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        setPurchasedOrders(orderList);
        setOrdersModalOpen(true);
      });
    } catch (e: any) {
      showAlert('ত্রুটি: ' + e.message, 'err');
    }
  };

  const viewOrderDownloadLink = async (productId: string, title: string) => {
    try {
      const prodDoc = await getDoc(doc(novaDb, 'products', productId));
      if (prodDoc.exists()) {
        const item = prodDoc.data();
        setSuccessOrders([{ productId, title, link: item.link || 'লিংক যুক্ত নেই' }]);
      } else {
        showAlert('প্রোডাক্ট ডাটাবেজে পাওয়া যায়নি', 'err');
      }
    } catch (e: any) {
      showAlert('ভুল: ' + e.message, 'err');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-800 flex flex-col max-w-sm mx-auto shadow-2xl relative overflow-x-hidden border-x border-zinc-200 pb-20">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className={`fixed top-16 left-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 max-w-[90%] text-xs font-bold leading-normal ${
              alertMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
              : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}
          >
            <CheckCircle2 size={15} className={`${alertMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section styled exactly like the original gorgeous glassmorphism header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md px-4 py-3.5 flex justify-between items-center border-b border-zinc-200/50 shadow-xs">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.supaimg.com/8a4b3166-6833-4068-980b-15852314cb97/1299ea2f-376e-4591-861d-08335351fc4b.jpg" 
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 object-cover p-[2px] shadow-lg shadow-indigo-600/20" 
            alt="Logo"
          />
          <div>
            <h1 className="text-sm font-black text-violet-700 tracking-tight flex items-center gap-1">
              <span>Nᴏᴠᴀ Sʜᴏᴩ</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 py-0.5 px-1.5 rounded-full">Store</span>
            </h1>
            <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">Premium Files Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={onBackToEarning}
            className="text-[10px] font-black bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-sm transition"
          >
            <ChevronLeft size={12} />
            <span>আর্নিং ব্যাক</span>
          </button>
          
          <div className="bg-indigo-50 border border-indigo-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1 text-indigo-700 text-xs font-bold shadow-2xs">
            <Wallet size={12} />
            <span>৳{novaUser?.balance || 0}</span>
          </div>
        </div>
      </header>

      {/* Header news ticker / notice line */}
      {config?.ticker && (
        <div className="bg-zinc-950 text-white text-[11px] py-1.5 overflow-hidden border-b border-amber-500">
          <div className="whitespace-nowrap flex gap-8 animate-marquee">
            {config.ticker.map((txt: string, i: number) => (
              <span key={i} className="flex items-center gap-1 font-semibold text-zinc-300">
                <Volume2 size={12} className="text-amber-400 shrink-0" />
                <span>{txt}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Pages router body */}
      <main className="flex-grow p-4 space-y-4">

        {/* TAB 1: HOME PLATFORM VIEW */}
        {novaTab === 'home' && (
          <div className="space-y-5">
            {/* Custom Interactive banners sliders */}
            <CustomSlider sliders={sliders} />

            {/* Premium Courses/Websites Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} className="text-violet-600" />
                  <span>প্রিমিয়াম ওয়েবসাইট</span>
                </h3>
                <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-100">
                  {productsGrouped.courses.length} Items
                </span>
              </div>

              {productsGrouped.courses.length === 0 ? (
                <div className="text-center py-6 bg-white border border-dashed border-zinc-200 rounded-3xl text-xs text-zinc-400">
                  কোনো ওয়েবসাইট আইটেম যুক্ত নেই
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {productsGrouped.courses.map((p) => {
                    const reg = p.regularPrice || Math.round(p.price * 1.25);
                    return (
                      <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-xs flex flex-col justify-between group">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'} 
                          onClick={() => setSelectedProduct(p)}
                          className="w-full h-28 object-cover cursor-pointer hover:scale-105 transition duration-300" 
                          alt="Thumbnail" 
                        />
                        <div className="p-3 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-[#111827] text-xs leading-normal line-clamp-2 h-8">
                              {p.title}
                            </h4>
                            <div className="flex items-baseline gap-1.5 mt-2">
                              <span className="text-xs text-zinc-400 font-semibold line-through">৳{reg}</span>
                              <span className="text-xs font-black text-rose-600">৳{p.price}</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 mt-3 pt-2 border-t border-zinc-100">
                            <button 
                              onClick={() => handleAddToCart(p)}
                              className="bg-indigo-50 text-indigo-700 border border-indigo-100 p-2 rounded-xl"
                              title="কার্টে যোগ করুন"
                            >
                              <ShoppingCart size={13} />
                            </button>
                            <button 
                              onClick={() => setSelectedProduct(p)}
                              className="bg-violet-600 hover:bg-violet-700 text-white font-black py-2 rounded-xl text-[10px] flex-grow text-center transition"
                            >
                              কিনুন
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Premium Files/Apps Section */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone size={14} className="text-amber-500" />
                  <span>প্রিমিয়াম ফাইল / অ্যাপ</span>
                </h3>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-100">
                  {productsGrouped.apps.length} Items
                </span>
              </div>

              {productsGrouped.apps.length === 0 ? (
                <div className="text-center py-6 bg-white border border-dashed border-zinc-200 rounded-3xl text-xs text-zinc-400">
                  কোনো ফাইল বা অ্যাপ যুক্ত নেই
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {productsGrouped.apps.map((p) => {
                    const reg = p.regularPrice || Math.round(p.price * 1.25);
                    return (
                      <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-xs flex flex-col justify-between group">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'} 
                          onClick={() => setSelectedProduct(p)}
                          className="w-full h-28 object-cover cursor-pointer hover:scale-105 transition duration-300" 
                          alt="Thumbnail" 
                        />
                        <div className="p-3 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-[#111827] text-xs leading-normal line-clamp-2 h-8">
                              {p.title}
                            </h4>
                            <div className="flex items-baseline gap-1.5 mt-2">
                              <span className="text-xs text-zinc-400 font-semibold line-through">৳{reg}</span>
                              <span className="text-xs font-black text-rose-600">৳{p.price}</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 mt-3 pt-2 border-t border-zinc-100">
                            <button 
                              onClick={() => handleAddToCart(p)}
                              className="bg-indigo-50 text-indigo-700 border border-indigo-100 p-2 rounded-xl"
                            >
                              <ShoppingCart size={13} />
                            </button>
                            <button 
                              onClick={() => setSelectedProduct(p)}
                              className="bg-violet-600 hover:bg-violet-700 text-white font-black py-2 rounded-xl text-[10px] flex-grow text-center transition"
                            >
                              কিনুন
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD MONEY */}
        {novaTab === 'add-money' && (
          <div className="space-y-4">
            {!selectedMethod ? (
              <div className="space-y-5">
                <div className="text-center py-4">
                  <h3 className="text-base font-black text-zinc-800">অ্যাড ব্যালেন্স / টাকা</h3>
                  <p className="text-zinc-500 text-xs mt-1">পেমেন্ট মেথড সিলেক্ট করুন</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSelectedMethod('bkash')}
                    className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-xs transition hover:border-pink-500 text-center flex flex-col items-center gap-2"
                  >
                    <img src="https://i.ibb.co.com/ycVwrp2p/bkash.jpg" className="w-12 h-12 rounded-xl object-contain shadow-xs" alt="bKash" />
                    <span className="text-[11px] font-bold text-zinc-700">bKash</span>
                  </button>
                  <button 
                    onClick={() => setSelectedMethod('nagad')}
                    className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-xs transition hover:border-orange-500 text-center flex flex-col items-center gap-2"
                  >
                    <img src="https://i.ibb.co.com/TDxDJqM1/images.png" className="w-12 h-12 rounded-xl object-contain shadow-xs" alt="Nagad" />
                    <span className="text-[11px] font-bold text-zinc-700">Nagad</span>
                  </button>
                  <button 
                    onClick={() => setSelectedMethod('rocket')}
                    className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-xs transition hover:border-purple-600 text-center flex flex-col items-center gap-2"
                  >
                    <img src="https://i.ibb.co.com/SwFZGFNN/mobile-Banking-Billboard.jpg" className="w-12 h-12 rounded-xl object-contain shadow-xs" alt="Rocket" />
                    <span className="text-[11px] font-bold text-zinc-700">Rocket</span>
                  </button>
                </div>

                {/* Gateway simulated Add Pay auto */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                    <span>অটো পেমেন্ট গেটওয়ে</span>
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500">টাকার পরিমাণ (৳)</label>
                    <input 
                      type="number" 
                      placeholder="অটো টাকা জমা করুন"
                      value={autoAmount}
                      onChange={(e) => setAutoAmount(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-600 focus:bg-white transition"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!autoAmount) {
                        showAlert('টাকার পরিমাণ লিখুন', 'err');
                        return;
                      }
                      if (config?.autoPayBrandKey) {
                        showAlert('পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...', 'success');
                      } else {
                        showAlert('অটো পেমেন্ট বর্তমানে বন্ধ আছে', 'err');
                      }
                    }}
                    className="w-full bg-indigo-600 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition"
                  >
                    গেটওয়ে এগিয়ে যান
                  </button>
                </div>

                {/* Money History */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-zinc-750">পেমেন্ট ইতিহাস</h4>
                  {paymentHistory.length === 0 ? (
                    <p className="text-center py-6 text-xs text-zinc-400 bg-white border border-zinc-100 rounded-2xl">কোনো অ্যাড মানি রেকর্ড নেই</p>
                  ) : (
                    <div className="space-y-2">
                      {paymentHistory.map((item) => (
                        <div key={item.id} className="bg-white border border-zinc-100 p-3.5 rounded-xl flex justify-between items-center text-xs shadow-2xs">
                          <div>
                            <span className="font-extrabold uppercase text-indigo-700 text-[11px]">{item.method || 'Unknown'}</span>
                            <span className="text-[10px] text-zinc-400 font-mono block mt-1">Trx: {item.trx}</span>
                          </div>
                          <div className="text-right">
                            <strong className="text-zinc-800 font-extrabold font-mono">৳{item.amount}</strong>
                            <span className={`block text-[9px] font-black uppercase mt-1 ${
                              item.status === 'approved' ? 'text-emerald-600' : item.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'
                            }`}>
                              {item.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedMethod(null)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-3 rounded-lg text-xs space-x-1.5 flex items-center w-max transition"
                >
                  <ChevronLeft size={14} />
                  <span>মেথড পরিবর্তন</span>
                </button>

                <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-zinc-800">{selectedMethod.toUpperCase()} ম্যানুয়াল পেমেন্ট</h3>
                  
                  <div className="bg-zinc-50 border-2 border-dashed border-zinc-200/80 p-4 rounded-2xl text-center space-y-1 relative">
                    <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-widest block">পার্সোনাল নম্বর</span>
                    <strong className="text-zinc-800 text-lg font-black tracking-wider block font-mono select-all">
                      {config?.[selectedMethod] || '01XXXXXXXXX'}
                    </strong>
                    <button 
                      onClick={() => handleCopyText(config?.[selectedMethod] || '01XXXXXXXXX', 'নম্বর কপি করা হয়েছে')} 
                      className="bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 text-[10px] font-bold px-2.5 py-1 rounded-md font-sans mt-2 inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Copy size={11} /> কপি করুন
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-500">পাঠানো টাকার পরিমাণ (৳)</label>
                      <input 
                        type="number" 
                        placeholder="৳ 0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold outline-none font-mono focus:border-indigo-600 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-500">Transaction ID (TrxID)</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: 8NH7Y89S"
                        value={paymentTrx}
                        onChange={(e) => setPaymentTrx(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none font-bold font-mono focus:border-indigo-600 focus:bg-white uppercase tracking-wider"
                      />
                    </div>

                    <button 
                      onClick={submitManualPayment}
                      disabled={isPaymentSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl mt-3 text-xs shadow-md shadow-indigo-600/10 transition disabled:opacity-50"
                    >
                      {isPaymentSubmitting ? 'অনুরোধ পাঠানো হচ্ছে...' : 'পেমেন্ট ভেরিফাই করুন'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CART PREVIEW */}
        {novaTab === 'cart' && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-zinc-800 text-center py-2">আপনার শপিং কার্ট</h2>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-white border border-zinc-100 rounded-3xl space-y-3.5">
                <ShoppingCart className="text-zinc-300 mx-auto" size={54} />
                <p className="text-xs text-zinc-400 font-bold">আপনার কার্টটি সম্পূর্ণ খালি রয়েছে</p>
                <button 
                  onClick={() => setNovaTab('home')}
                  className="bg-indigo-600 text-white text-[11px] font-black px-4 py-2 rounded-xl"
                >
                  স্টোরে চলে যান
                </button>
              </div>
            ) : (
              <div className="space-y-3 pb-24">
                {cart.map((item, index) => (
                  <div key={index} className="bg-white border border-zinc-100 p-3 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="Item" />
                      <div>
                        <h4 className="font-extrabold text-[#111827] text-xs leading-normal line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-xs text-rose-500 font-black font-mono block mt-0.5">৳{item.price}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveFromCart(index)}
                      className="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Persistent bottom checkout bar */}
            {cart.length > 0 && (
              <div className="absolute bottom-[80px] left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center shadow-lg border border-zinc-100 z-10">
                <div>
                  <span className="text-[10px] text-zinc-450 block font-semibold">মোট পরিমাণ</span>
                  <strong className="text-zinc-800 font-black text-lg">৳{cart.reduce((a, b) => a + (b.price || 0), 0)}</strong>
                </div>
                <button 
                  onClick={handleCheckoutCart}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl transition shadow-md"
                >
                  অর্ডার প্লেস করুন
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE VIEW */}
        {novaTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-[30px] p-6 text-white text-center shadow-lg relative overflow-hidden">
              <div className="w-16 h-16 bg-white/20 border-2 border-white/40 rounded-full flex items-center justify-center mx-auto mb-3.5">
                <User size={30} />
              </div>
              <h2 className="text-base font-black truncate">{novaUser?.name || 'Nova Buyer'}</h2>
              <p className="text-[11px] text-indigo-100/80 font-mono tracking-wide mt-0.5">{userEmail}</p>

              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-xs font-bold font-mono">
                <Volume2 size={13} className="text-amber-400" />
                <span>৳ {novaUser?.balance || 0}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={openMyOrders}
                className="w-full bg-white border border-zinc-100 p-4 rounded-2xl shadow-xs text-left flex justify-between items-center hover:border-violet-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-800">আমার অর্ডারসমূহ</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">আপনার কেনাকাটা ডিস্ট্রিবিউশন</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-zinc-400" />
              </button>

              <button 
                onClick={() => setSupportModalOpen(true)}
                className="w-full bg-white border border-zinc-100 p-4 rounded-2xl shadow-xs text-left flex justify-between items-center hover:border-violet-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-800">হেল্প সেন্টার</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">টেলিগ্রাম এবং হোয়াটস্‌অ্যাপ সাপোর্ট</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-zinc-400" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Persistent platform toggle floating button / side tabs if they want to access TakaHub Pro */}
      <nav className="fixed bottom-0 left-0 right-0 py-2.5 max-w-sm mx-auto bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/60 flex justify-around items-center z-40 text-[10px] font-bold text-zinc-400">
        <button 
          onClick={() => setNovaTab('home')} 
          className={`flex flex-col items-center gap-1 w-[22%] transition ${novaTab === 'home' ? 'text-white' : 'hover:text-zinc-100'}`}
        >
          <ShoppingBag size={18} className={novaTab === 'home' ? 'text-violet-500' : ''} />
          <span>হোম</span>
        </button>

        <button 
          onClick={() => setNovaTab('add-money')} 
          className={`flex flex-col items-center gap-1 w-[22%] transition ${novaTab === 'add-money' ? 'text-white' : 'hover:text-zinc-100'}`}
        >
          <Wallet size={18} className={novaTab === 'add-money' ? 'text-violet-500' : ''} />
          <span>অ্যাড টাকা</span>
        </button>

        <button 
          onClick={() => setNovaTab('cart')} 
          className={`flex flex-col items-center gap-1 w-[22%] transition relative ${novaTab === 'cart' ? 'text-white' : 'hover:text-zinc-100'}`}
        >
          <ShoppingCart size={18} className={novaTab === 'cart' ? 'text-violet-500' : ''} />
          <span>কার্ট</span>
          {cart.length > 0 && (
            <span className="absolute -top-1.5 right-2 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] font-black font-sans">
              {cart.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setNovaTab('profile')} 
          className={`flex flex-col items-center gap-1 w-[22%] transition ${novaTab === 'profile' ? 'text-white' : 'hover:text-zinc-100'}`}
        >
          <User size={18} className={novaTab === 'profile' ? 'text-violet-500' : ''} />
          <span>প্রোফাইল</span>
        </button>
      </nav>

      {/* MODAL 1: Product detail preview overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
            <motion.div 
              initial={{ y: 200 }} 
              animate={{ y: 0 }} 
              exit={{ y: 200 }}
              className="bg-white rounded-t-[30px] p-6 max-w-sm w-full space-y-4 shadow-xl border-t border-zinc-200"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-[#111827] text-base leading-snug line-clamp-2 pr-4">{selectedProduct.title}</h3>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="bg-zinc-100 text-zinc-500 p-1.5 rounded-full"
                >
                  <X size={15} />
                </button>
              </div>

              <img src={selectedProduct.image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'} className="w-full h-36 object-cover rounded-2xl shadow-xs" alt="Item" />

              <div className="flex justify-between items-center pt-1.5">
                <span className="text-[11px] font-bold text-zinc-450 uppercase uppercase tracking-wider">পরিমাণমূল্য</span>
                <strong className="text-rose-600 font-extrabold text-lg select-all">৳ {selectedProduct.price}</strong>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl max-h-[140px] overflow-y-auto text-xs text-zinc-500 leading-relaxed">
                {selectedProduct.desc || 'কোনো বিবরণ দেওয়া নেই।'}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button 
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  কার্টে রাখুন +
                </button>
                <button 
                  onClick={() => handleBuyNow(selectedProduct)}
                  className="bg-indigo-600 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-600/10"
                >
                  এখনই কিনুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Notice popup on entry */}
      <AnimatePresence>
        {noticeModalOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              className="bg-white border p-6 rounded-[30px] w-full max-w-[90%] text-center space-y-4"
            >
              <h2 className="text-base font-black text-violet-700 flex justify-center items-center gap-1.5">
                <Info size={18} />
                <span>জরুরি নোটিশ</span>
              </h2>

              <p className="text-zinc-650 text-xs leading-relaxed font-semibold">
                {config?.noticeText || 'বর্তমানে কোনো নোটিশ নেই'}
              </p>

              <div className="flex flex-col gap-2 pt-2">
                {config?.noticeLink && (
                  <a 
                    href={config.noticeLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-violet-600 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md shadow-violet-600/10 hover:bg-violet-700 transition"
                  >
                    জয়েন টেলিগ্রাম চ্যানেল
                  </a>
                )}
                <button 
                  onClick={() => setNoticeModalOpen(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Order Success download display popouts */}
      <AnimatePresence>
        {successOrders && (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
              className="bg-white border p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-xl"
            >
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-black text-[#111827] text-base">অভিনন্দন! অর্ডার সফল হয়েছে</h3>
                <p className="text-[11px] text-zinc-400 font-medium">নিচে আপনার পেমেন্টকৃত ফাইলের ডাউনলোড লিংক দেওয়া হলো</p>
              </div>

              <div className="space-y-3.5 pt-2">
                {successOrders.map((order, i) => (
                  <div key={i} className="bg-zinc-50 border p-3.5 rounded-2xl space-y-2">
                    <span className="font-extrabold text-[#111827] text-xs block truncate">{order.title}</span>
                    <div className="flex gap-2">
                      <div className="bg-white border rounded-xl p-2.5 text-[10px] font-mono text-zinc-500 overflow-hidden text-ellipsis flex-grow leading-tight">
                        {order.link || 'ডাউনলোড লিংক তৈরি হচ্ছে...'}
                      </div>
                      <button 
                        onClick={() => {
                          if (order.link) {
                            handleCopyText(order.link, 'লিংক কপি করা হয়েছে');
                          } else {
                            getDoc(doc(novaDb, 'products', order.productId)).then((d: any) => {
                              if (d.exists()) {
                                handleCopyText(d.data().link || 'লিংক নেই', 'লিংক কপি করা হয়েছে');
                              }
                            });
                          }
                        }}
                        className="bg-violet-600 text-white p-2.5 rounded-xl shadow-xs"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSuccessOrders(null)}
                className="w-full bg-[#111827] text-white font-extrabold py-3 rounded-xl text-xs"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: MY ORDERS VIEW */}
      <AnimatePresence>
        {ordersModalOpen && (
          <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
              className="bg-white border p-5 rounded-[30px] w-full max-w-sm space-y-4 h-[75vh] flex flex-col justify-between"
            >
              <div className="space-y-3 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <h3 className="font-black text-[#111827] text-xs uppercase tracking-wider">আমার ক্রয় হিস্ট্রি</h3>
                  <button onClick={() => setOrdersModalOpen(false)} className="text-zinc-500"><X size={16} /></button>
                </div>

                {purchasedOrders.length === 0 ? (
                  <p className="text-center py-10 text-xs text-zinc-400 font-bold">আপনি এখনো কোনো আইটেম কিনেননি</p>
                ) : (
                  <div className="space-y-2">
                    {purchasedOrders.map((ord) => (
                      <div key={ord.id} className="bg-zinc-50 border p-3 rounded-xl flex items-center justify-between shadow-2xs gap-3">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-[#111827] text-[11px] truncate">{ord.title}</h4>
                          <span className="text-[9px] text-zinc-400 block font-mono mt-0.5">৳ {ord.price} / {ord.type}</span>
                        </div>
                        <button 
                          onClick={() => viewOrderDownloadLink(ord.productId, ord.title)}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-black text-[9px] py-1.5 px-3 rounded-lg shrink-0"
                        >
                          লিংক
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setOrdersModalOpen(false)}
                className="w-full bg-[#111827] text-white font-black py-3 rounded-xl text-xs mt-3 shrink-0"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: CUSTOMER SUPPORT LINKS */}
      <AnimatePresence>
        {supportModalOpen && (
          <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
              className="bg-white border p-5 rounded-[30px] w-full max-w-sm space-y-4 text-center"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-black text-zinc-800 text-xs tracking-wider">কাস্টমার টেক সাপোর্ট</h3>
                <button onClick={() => setSupportModalOpen(false)} className="text-zinc-500"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1.5">
                {config?.telegram && (
                  <a 
                    href={config.telegram} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:bg-sky-100"
                  >
                    <Share2 size={24} className="text-sky-500" />
                    <span className="text-xs font-bold text-sky-850">Telegram</span>
                  </a>
                )}
                {config?.whatsapp && (
                  <a 
                    href={config.whatsapp} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:bg-emerald-100"
                  >
                    <Headphones size={24} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-850">WhatsApp</span>
                  </a>
                )}
                {config?.facebook && (
                  <a 
                    href={config.facebook} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:bg-blue-100"
                  >
                    <Globe size={24} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-800">Facebook</span>
                  </a>
                )}
                {config?.youtube && (
                  <a 
                    href={config.youtube} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:bg-red-100"
                  >
                    <Volume2 size={24} className="text-red-500" />
                    <span className="text-xs font-bold text-red-850">YouTube</span>
                  </a>
                )}
              </div>

              <button 
                onClick={() => setSupportModalOpen(false)}
                className="w-full bg-[#111827] text-white font-black py-3 rounded-xl text-xs mt-3"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 shadow-xl"
            >
              <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                  <AlertTriangle size={18} />
                </span>
                {confirmState.title}
              </h3>
              <p className="text-xs text-zinc-650 mb-6 leading-relaxed bg-zinc-50/70 p-3 rounded-xl border border-zinc-150">
                {confirmState.message}
              </p>
              <div className="flex gap-3 justify-end font-sans">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black transition"
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
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/20 transition"
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
