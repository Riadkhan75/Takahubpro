import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, push, onValue, remove } from 'firebase/database';

// Initialize Firebase App with existing DB configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9t6ztUCfv_Rx-cNRjQE8dnShNZg2FaCQ",
  authDomain: "rkkhan-67ac1.firebaseapp.com",
  databaseURL: "https://rkkhan-67ac1-default-rtdb.firebaseio.com",
  projectId: "rkkhan-67ac1",
  storageBucket: "rkkhan-67ac1.firebasestorage.app",
  messagingSenderId: "1080011640502",
  appId: "1:1080011640502:web:a2970eaae2267df290e017",
  measurementId: "G-CC7LH7LFHD"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Create Express Server
const server = express();
const PORT = 3000;

server.use(express.json());

// Google Search Console Site Verification Endpoint
server.get('/google239b31422b7a7907.html', (req, res) => {
  res.send('google-site-verification: google239b31422b7a7907.html');
});

// TakaHub Pro Advanced Express Security headers middleware
server.use((req, res, next) => {
  // Prevent Content Sniffing (MIME-Spoofing mitigation)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Cross-Site Scripting (XSS) Filter protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Block Referral tracing to protect internal route schemas
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // HSTS (HTTP Strict Transport Security) - forces HTTPS for security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Custom Server masking header to hide technological stack details from automated scanner tools
  res.setHeader('X-Powered-By', 'TakaHub Secure Shield v2.4');
  
  next();
});

// Lightweight In-Memory API Rate Limiter
const apiRequestCounts = new Map<string, { count: number; resetTime: number }>();

server.use('/api/', (req: any, res: any, next: any) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxLimit = 120;   // Allow maximum 120 API requests per minute per IP
  
  const clientKey = String(ip);
  const record = apiRequestCounts.get(clientKey);
  
  if (!record || now > record.resetTime) {
    apiRequestCounts.set(clientKey, { count: 1, resetTime: now + windowMs });
    next();
  } else {
    record.count++;
    if (record.count > maxLimit) {
      console.warn(`[Security Alert] Rate-limit exceeded by suspended IP: ${clientKey}`);
      return res.status(429).json({ 
        error: 'Too Many Requests', 
        message: 'নিরাপত্তার স্বার্থে অনুরোধের সংখ্যা কমানো হয়েছে। অনুগ্রহ করে ১ মিনিট পর আবার ট্রাই করুন!' 
      });
    }
    next();
  }
});

// API route health-checks
server.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// User session storage for dynamic Chatbot Wizard state in Telegram Polling loop
const userSessions = new Map<number | string, { step: string; payload: any }>();

// State metrics to handle active updates for User Bot
let currentToken = '';
let pollingActive = false;
let offset = 0;

// State metrics to handle active updates for Admin Bot
let adminToken = '';
let adminPollingActive = false;
let adminOffset = 0;

// Listen to setting changes dynamically from FireBase database
onValue(ref(db, 'settings'), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    // 1. User Bot Token
    if (data.telegramBotToken) {
      const newToken = data.telegramBotToken.trim();
      if (newToken !== currentToken) {
        console.log('[Telegram User Bot] Loaded Token Update:', newToken.substring(0, 8) + '...');
        currentToken = newToken;
        if (!pollingActive && currentToken) {
          startTelegramPolling();
        }
      }
    }
    // 2. Admin Bot Token
    if (data.telegramAdminBotToken) {
      const newAdminToken = data.telegramAdminBotToken.trim();
      if (newAdminToken !== adminToken) {
        console.log('[Telegram Admin Bot] Loaded Token Update:', newAdminToken.substring(0, 8) + '...');
        adminToken = newAdminToken;
        if (!adminPollingActive && adminToken) {
          startTelegramAdminPolling();
        }
      }
    }
  }
});

// Polling loop logic for User Bot
async function startTelegramPolling() {
  if (pollingActive) return;
  pollingActive = true;
  console.log('[Telegram User Bot] Long-polling engine started safely.');

  while (pollingActive && currentToken) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${currentToken}/getUpdates?offset=${offset}&timeout=15`);
      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 409) {
          console.warn('[Telegram User Bot] Conflict (409): Another instance is already polling. Backing off for 30 seconds to avoid conflict loops...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
          console.warn(`[Telegram User Bot] Error HTTP ${response.status}:`, errText);
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
        continue;
      }

      const data = await response.json() as any;
      if (data.ok && data.result) {
        for (const updateItem of data.result) {
          offset = updateItem.update_id + 1;
          try {
            await handleTelegramUpdate(updateItem, false);
          } catch (updateErr) {
            console.error('[Telegram User Bot] Error handling update:', updateErr);
          }
        }
      }
    } catch (err) {
      console.error('[Telegram User Bot] Polling fetch error (retrying):', err);
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
  pollingActive = false;
}

// Polling loop logic for Admin Bot
async function startTelegramAdminPolling() {
  if (adminPollingActive) return;
  adminPollingActive = true;
  console.log('[Telegram Admin Bot] Long-polling engine started safely.');

  while (adminPollingActive && adminToken) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${adminToken}/getUpdates?offset=${adminOffset}&timeout=15`);
      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 409) {
          console.warn('[Telegram Admin Bot] Conflict (409): Another instance is already polling. Backing off for 30 seconds to avoid conflict loops...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
          console.warn(`[Telegram Admin Bot] Error HTTP ${response.status}:`, errText);
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
        continue;
      }

      const data = await response.json() as any;
      if (data.ok && data.result) {
        for (const updateItem of data.result) {
          adminOffset = updateItem.update_id + 1;
          try {
            await handleTelegramUpdate(updateItem, true);
          } catch (updateErr) {
            console.error('[Telegram Admin Bot] Error handling update:', updateErr);
          }
        }
      }
    } catch (err) {
      console.error('[Telegram Admin Bot] Polling fetch error (retrying):', err);
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
  adminPollingActive = false;
}

// Update handler function containing core website business logic ported to Telegram Bot wizard UI
async function handleTelegramUpdate(updateItem: any, isFromAdminBot = false) {
  const message = updateItem.message || updateItem.callback_query?.message;
  if (!message) return;

  const chat = message.chat;
  if (!chat) return;
  const chatId = chat.id;

  // Read message or callback data
  let text = '';
  if (updateItem.callback_query) {
    text = updateItem.callback_query.data || '';
  } else {
    text = message.text || '';
  }

  // Load chat user's association or verify credentials
  const settingsSnap = await get(ref(db, 'settings'));
  const settings = settingsSnap.exists() ? settingsSnap.val() : {};
  const currentAdminChatIdStr = settings.telegramAdminChatId ? String(settings.telegramAdminChatId).trim() : '';

  const assocSnap = await get(ref(db, `telegram_associations/${chatId}`));
  let userId = assocSnap.exists() ? assocSnap.val() : null;

  const isTargetAdminChatId = currentAdminChatIdStr && String(chatId) === currentAdminChatIdStr;

  // Auto-associate admin if chatId matches telegramAdminChatId and we don't have a userId yet
  if (isTargetAdminChatId && !userId) {
    const usersSnap = await get(ref(db, 'users'));
    const allUsers = usersSnap.exists() ? usersSnap.val() : {};
    let foundUid: string | null = null;
    
    for (const [key, val] of Object.entries(allUsers)) {
      const u = val as any;
      if (u.email && u.email.toLowerCase() === 'banglag215@gmail.com') {
        foundUid = key;
        break;
      }
    }

    if (!foundUid) {
      foundUid = 'admin_master';
      await update(ref(db, `users/${foundUid}`), {
        email: 'banglag215@gmail.com',
        displayName: 'System Admin',
        balance: 100000,
        isActive: true,
        telegramAdminChatId: String(chatId)
      });
    }

    userId = foundUid;
    // Set association
    await set(ref(db, `telegram_associations/${chatId}`), userId);
    await update(ref(db, `users/${userId}`), { telegramAdminChatId: String(chatId) });
  }

  let userData: any = null;
  if (userId) {
    const uSnap = await get(ref(db, `users/${userId}`));
    if (uSnap.exists()) {
      userData = uSnap.val();
      userData.uid = userId;
    } else {
      userId = null;
    }
  }

  // Determine if the registered user is system Admin (Strictly only permitted when interacting through the Admin Bot or matches admin chat ID)
  const isAdmin = isFromAdminBot && (
    (userData && userData.email && userData.email.toLowerCase() === 'banglag215@gmail.com') ||
    isTargetAdminChatId
  );

  // Fetch the current session state or create new
  let userSession = userSessions.get(chatId);
  if (!userSession) {
    userSession = { step: 'none', payload: { adminMode: isAdmin } };
    userSessions.set(chatId, userSession);
  }

  // Helper helper to send message back
  const sendMessage = async (msgText: string, extraOptions = {}) => {
    try {
      const activeRunningToken = isFromAdminBot ? adminToken : currentToken;
      await fetch(`https://api.telegram.org/bot${activeRunningToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: msgText,
          parse_mode: 'HTML',
          ...extraOptions
        })
      });
    } catch (e) {
      console.error('[Telegram Bot] SendMsg error:', e);
    }
  };

  // Main menu keyboard markup layout (dynamic: shows Admin Panel switcher for Admin users only)
  const mainKeyboard = {
    keyboard: isAdmin ? [
      [{ text: '👤 Profile / ব্যালেন্স' }, { text: '🎡 Spin (স্পিন করুন)' }],
      [{ text: '💼 Sell Accounts (কোম্পানি একাউন্ট বিক্রয়)' }, { text: '💰 Withdraw (টাকা উত্তোলন)' }],
      [{ text: '💸 Transfer Balance' }, { text: '❓ Help / নির্দেশনা' }],
      [{ text: '🔑 Switch to Admin Panel' }, { text: '🚪 Log Out (লগ আউট)' }]
    ] : [
      [{ text: '👤 Profile / ব্যালেন্স' }, { text: '🎡 Spin (স্পিন করুন)' }],
      [{ text: '💼 Sell Accounts (কোম্পানি একাউন্ট বিক্রয়)' }, { text: '💰 Withdraw (টাকা উত্তোলন)' }],
      [{ text: '💸 Transfer Balance' }, { text: '❓ Help / নির্দেশনা' }],
      [{ text: '🚪 Log Out (লগ আউট)' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };

  // Admin menu keyboard markup layout
  const adminKeyboard = {
    keyboard: isFromAdminBot ? [
      [{ text: '📊 Overview (পরিসংখ্যান)' }, { text: '💸 Pending Withdrawals' }],
      [{ text: '🛍️ Pending Account Sales' }, { text: '📢 Send Universal Notice' }],
      [{ text: '⚙️ Toggle Maintenance (মেইনটেন্যান্স)' }]
    ] : [
      [{ text: '📊 Overview (পরিসংখ্যান)' }, { text: '💸 Pending Withdrawals' }],
      [{ text: '🛍️ Pending Account Sales' }, { text: '📢 Send Universal Notice' }],
      [{ text: '⚙️ Toggle Maintenance (মেইনটেন্যান্স)' }, { text: '👤 Switch to User Mode' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };

  // Social account selling options submenu keyboard layout
  const sellKeyboard = {
    keyboard: [
      [{ text: '📧 Sell Gmail' }, { text: '👤 Sell Facebook' }],
      [{ text: '✈️ Sell Telegram' }, { text: '💬 Sell WhatsApp' }],
      [{ text: '🏠 Back to Menu' }]
    ],
    resize_keyboard: true
  };

  // Clear Telegram spinner wheel in callback queries if needed
  if (updateItem.callback_query) {
    try {
      const activeRunningToken = isFromAdminBot ? adminToken : currentToken;
      await fetch(`https://api.telegram.org/bot${activeRunningToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: updateItem.callback_query.id })
      });
    } catch (_) {}
  }

  // Handle All Callback Queries safely
  if (updateItem.callback_query) {
    const cbData = updateItem.callback_query.data || '';
    
    // Safety verification check: only allow admin 'banglag215@gmail.com' for admin actions
    if (!isAdmin) {
      await sendMessage('❌ ক্ষমা করবেন, আপনি এই সিস্টেমটির অ্যাডমিন নন!');
      return;
    }

    // 1. SETTINGS TOGGLES
    if (cbData === 'toggle_setting_spin') {
      try {
        const sRef = ref(db, 'settings');
        const sSnap = await get(sRef);
        const val = sSnap.exists() ? sSnap.val() : {};
        const nextVal = !val.spinMaintenanceEnabled;
        await update(sRef, { spinMaintenanceEnabled: nextVal });
        await sendMessage(`✅ স্পিন হুইল মেইনটেন্যান্স স্ট্যাটাস পরিবর্তন করে <b>${nextVal ? 'সক্রিয় (Under Maintenance)' : 'নিষ্ক্রিয় (Active)'}</b> করা হয়েছে!`);
      } catch (err: any) {
        await sendMessage(`❌ ডাটা আপডেটে সমস্যা: ${err.message}`);
      }
      return;
    }

    if (cbData === 'toggle_setting_emergency') {
      try {
        const sRef = ref(db, 'settings');
        const sSnap = await get(sRef);
        const val = sSnap.exists() ? sSnap.val() : {};
        const nextVal = !val.emergencyEnabled;
        await update(sRef, { emergencyEnabled: nextVal });
        await sendMessage(`✅ সাইট ইমারজেন্সি স্ট্যাটাস পরিবর্তন করে <b>${nextVal ? 'সক্রিয় (Emergency Lock Active)' : 'নিষ্ক্রিয় (Normal Status)'}</b> করা হয়েছে!`);
      } catch (err: any) {
        await sendMessage(`❌ ডাটা আপডেটে সমস্যা: ${err.message}`);
      }
      return;
    }

    // 2. WITHDRAWAL CALLS
    if (cbData.startsWith('wd_')) {
      const parts = cbData.split('_'); // wd_app_ID or wd_rej_ref_ID or wd_rej_ded_ID
      const actionType = parts[1]; // app or rej
      const isRejectRefund = parts[2] === 'ref';
      const isRejectDeduct = parts[2] === 'ded';
      const wdId = parts[2] === 'ref' || parts[2] === 'ded' ? parts[3] : parts[2];

      try {
        const wdRef = ref(db, `withdrawals/${wdId}`);
        const wdSnap = await get(wdRef);
        if (!wdSnap.exists()) {
          await sendMessage('⚠️ উইথড্র তথ্য খুঁজে পাওয়া যায়নি অথবা তা ইতিমধ্যে ডিলিট করা হয়েছে।');
          return;
        }

        const wdData = wdSnap.val();
        if (wdData.status !== 'pending') {
          await sendMessage(`⚠️ এই পেমেন্ট রিকোয়েস্টটি ইতিমধ্যে <b>${wdData.status}</b> হিসেবে চিহ্নিত করা আছে!`);
          return;
        }

        if (actionType === 'app') {
          // Approve (Paid)
          await update(wdRef, { status: 'approved' });
          await sendMessage(`✅ <b>পেমেন্ট আবেদন সফলভাবে এপ্রুভ ও পেইড হিসেবে চিহ্নিত করা হয়েছে!</b>\n\n• পরিমাণ: ৳${wdData.amount}\n• ইউজার: <code>${wdData.email}</code>`);

          // Notify user
          const userSnap = await get(ref(db, `users/${wdData.userId}`));
          if (userSnap.exists() && userSnap.val().telegramChatId) {
            try {
              await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: userSnap.val().telegramChatId,
                  text: `🎉 <b>উইথড্র এপ্রুভ হয়েছে!</b>\n\nআপনার <b>৳${wdData.amount.toFixed(2)}</b> টাকার উত্তোলনের পেমেন্টটি সফলভাবে সম্পন্ন করে আপনার সচল <b>${wdData.method}</b> নম্বরে পাঠিয়ে দেওয়া হয়েছে।`,
                  parse_mode: 'HTML'
                })
              });
            } catch (_) {}
          }
        } else if (isRejectRefund) {
          // Reject and Refund Balance
          const balanceField = wdData.balanceType === 'gmail' ? 'gmailBalance' :
                               wdData.balanceType === 'telegram' ? 'telegramBalance' :
                               wdData.balanceType === 'whatsapp' ? 'whatsappBalance' :
                               wdData.balanceType === 'facebook' ? 'facebookBalance' : 'balance';

          const userRef = ref(db, `users/${wdData.userId}`);
          const uSnap = await get(userRef);
          if (uSnap.exists()) {
            const uData = uSnap.val();
            const currentBal = uData[balanceField] || 0;
            const updatedData = {
              [balanceField]: currentBal + wdData.amount
            };
            await update(userRef, updatedData);
          }

          await update(wdRef, { status: 'rejected' });
          await sendMessage(`❌ <b>পেমেন্ট আবেদন রিজেক্ট ও সম্পূর্ণ ক্যাশ রিফান্ড করা হয়েছে!</b>\n\n• পরিমাণ: ৳${wdData.amount}\n• ইউজার: <code>${wdData.email}</code>`);

          // Notify user
          if (uSnap.exists() && uSnap.val().telegramChatId) {
            try {
              await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: uSnap.val().telegramChatId,
                  text: `🛑 <b>উইথড্র রিজেক্ট ও রিফান্ড হয়েছে!</b>\n\nআপনার <b>৳${wdData.amount.toFixed(2)}</b> টাকার উইথড্র আবেদনটি বাতিল করা হয়েছে এবং পুরো টাকা আপনার <code>${wdData.balanceType || 'main'}</code> ব্যালেন্স অ্যাকাউন্টে রিফান্ড করে দেওয়া হয়েছে।`,
                  parse_mode: 'HTML'
                })
              });
            } catch (_) {}
          }
        } else if (isRejectDeduct) {
          // Reject and Deduct / Keep deducted (No refund)
          await update(wdRef, { status: 'rejected_deduct' });
          await sendMessage(`🔥 <b>পেমেন্ট আবেদন রিজেক্ট ও টাকা কেটে রাখা (Deduct) হয়েছে!</b>\n\n• পরিমাণ: ৳${wdData.amount}\n• ইউজার: <code>${wdData.email}</code>\n• কোনো রিফান্ড ব্যালেন্স দেওয়া হয়নি।`);

          // Notify user
          const userSnap = await get(ref(db, `users/${wdData.userId}`));
          if (userSnap.exists() && userSnap.val().telegramChatId) {
            try {
              await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: userSnap.val().telegramChatId,
                  text: `🛑 <b>উইথড্র বাতিল করা হয়েছে!</b>\n\nআপনার <b>৳${wdData.amount.toFixed(2)}</b> টাকার উত্তোলনের পেমেন্ট রিকোয়েস্টটি এডমিন প্যানেল দ্বারা রিজেক্ট ও ব্যালেন্স পেনাল্টি আকারে কেটে নেওয়া হয়েছে।`,
                  parse_mode: 'HTML'
                })
              });
            } catch (_) {}
          }
        }
      } catch (err: any) {
        await sendMessage(`❌ প্রক্রিয়াটি সম্পন্ন করতে ব্যর্থ: ${err.message}`);
      }
      return;
    }

    // 3. ACCOUNT SALES BROWSING CATEGORIES
    if (cbData.startsWith('sells_cat_')) {
      const cat = cbData.replace('sells_cat_', ''); // gmail, facebook, telegram, whatsapp
      try {
        const salesSnap = await get(ref(db, `${cat}_sells`));
        let found = false;
        if (salesSnap.exists()) {
          const items = Object.values(salesSnap.val()) as any[];
          const pendings = items.filter(i => i.status === 'pending');
          if (pendings.length > 0) {
            found = true;
            await sendMessage(`📦 ${cat.toUpperCase()} ক্যাটাগরিতে মোট <b>${pendings.length}টি</b> পেন্ডিং আবেদন পাওয়া গেছে। প্রথম ৩টি নিচে দেওয়া হলো:`);
            const limit = Math.min(pendings.length, 3);
            for (let i = 0; i < limit; i++) {
              const item = pendings[i];
              let detailsStr = '';
              if (cat === 'gmail') {
                detailsStr = `📧 জিমেইল: <code>${item.email}</code>\n🔑 পাসওয়ার্ড: <code>${item.password}</code>`;
              } else if (cat === 'facebook') {
                detailsStr = `👤 অ্যাকাউন্ট: <code>${item.email}</code>\n🔑 পাসওয়ার্ড: <code>${item.password}</code>\n🔐 ২FA কোড: <code>${item.twoFactor || 'none'}</code>`;
              } else if (cat === 'telegram' || cat === 'whatsapp') {
                detailsStr = `📞 নম্বর: <code>${item.number}</code>\n👀 ডিটেইলস: <i>${item.details || 'N/A'}</i>`;
              }

              const itemMsg = `📦 <b>পেন্ডিং ${cat.toUpperCase()} সেল [${i+1}/${limit}]</b>\n\n` +
                `👤 ইউজার নাম: <b>${item.username}</b>\n` +
                detailsStr + `\n` +
                `🕒 সময়: <i>${new Date(item.timestamp).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}</i>`;

              // Inline payout shortcuts based on category
              const shortcuts = cat === 'gmail' ? [10, 15, 20, 30] :
                                cat === 'facebook' ? [20, 35, 50, 100] :
                                cat === 'telegram' ? [15, 25, 40, 60] : [15, 25, 40];

              const buttonRows = [];
              // Create action rows of size 2
              for (let r = 0; r < shortcuts.length; r += 2) {
                const subRow = [];
                subRow.push({ text: `৳${shortcuts[r]} Approve`, callback_data: `sell_app_${cat}_${shortcuts[r]}_${item.id}` });
                if (shortcuts[r+1]) {
                  subRow.push({ text: `৳${shortcuts[r+1]} Approve`, callback_data: `sell_app_${cat}_${shortcuts[r+1]}_${item.id}` });
                }
                buttonRows.push(subRow);
              }
              // Add Reject button row
              buttonRows.push([{ text: `❌ Reject / Decline`, callback_data: `sell_rej_${cat}_${item.id}` }]);

              await sendMessage(itemMsg, { reply_markup: { inline_keyboard: buttonRows } });
            }
          }
        }
        if (!found) {
          await sendMessage(`🎉 অভিনন্দন! ${cat.toUpperCase()} ক্যাটাগরিতে বর্তমানে কোনো পেন্ডিং সেল রিকোয়েস্ট নেই।`);
        }
      } catch (err: any) {
        await sendMessage(`❌ এরর: ${err.message}`);
      }
      return;
    }

    // 4. ACTIONING SALES DETAILS
    if (cbData.startsWith('sell_app_')) {
      const parts = cbData.split('_'); // sell_app_<cat>_<payAmt>_id
      const cat = parts[2];
      const payAmt = parseFloat(parts[3]);
      const sellId = parts[4];

      try {
        const itemRef = ref(db, `${cat}_sells/${sellId}`);
        const snap = await get(itemRef);
        if (!snap.exists()) {
          await sendMessage('⚠️ এই সেল রিকোয়েস্টটি অলরেডি এপ্রুভ অথবা ডিলেট হয়ে গেছে।');
          return;
        }

        const sellData = snap.val();

        // Target balance field representation
        const balanceField = cat === 'gmail' ? 'gmailBalance' :
                             cat === 'telegram' ? 'telegramBalance' :
                             cat === 'whatsapp' ? 'whatsappBalance' :
                             cat === 'facebook' ? 'facebookBalance' : 'balance';

        // Credit the User
        const userRef = ref(db, `users/${sellData.userId}`);
        const userSnap = await get(userRef);

        if (userSnap.exists()) {
          const uData = userSnap.val();
          const targetBalOld = uData[balanceField] || 0;
          await update(userRef, {
            [balanceField]: targetBalOld + payAmt
          });
        }

        // Remove the item from list
        await remove(itemRef);

        await sendMessage(`✅ <b>সফলভাবে ${cat.toUpperCase()} সেল আবেদন এপ্রুভ ও ওয়েরসাইট ব্যালেন্সে টাকা যুক্ত করা হয়েছে!</b>\n\n• ক্রেডিটেড: ৳<b>${payAmt.toFixed(2)}</b>\n• ইউজার মেইল/নাম: <b>${sellData.username}</b>`);

        // Notify user if Telegram Chat ID linked
        if (userSnap.exists() && userSnap.val().telegramChatId) {
          try {
            await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: userSnap.val().telegramChatId,
                text: `🎉 <b>আপনার সোশ্যাল অ্যাকাউন্ট বিক্রয় এপ্রুভ হয়েছে!</b>\n\nআপনার জমা দেওয়া <b>${cat.toUpperCase()}</b> ডিটেইলস মডারেটর গ্রহণ করেছেন এবং আপনার <code>${cat}</code> ব্যালেন্সে ৳<b>${payAmt.toFixed(2)}</b> টাকা সফলভাবে যোগ করে দেওয়া হয়েছে। ✨`,
                parse_mode: 'HTML'
              })
            });
          } catch (_) {}
        }
      } catch (err: any) {
        await sendMessage(`❌ এপ্রুভাল এরর: ${err.message}`);
      }
      return;
    }

    if (cbData.startsWith('sell_rej_')) {
      const parts = cbData.split('_'); // sell_rej_<cat>_<id>
      const cat = parts[2];
      const sellId = parts[3];

      try {
        const itemRef = ref(db, `${cat}_sells/${sellId}`);
        const snap = await get(itemRef);
        if (!snap.exists()) {
          await sendMessage('⚠️ উইথড্র বা সেল ডিটেইলস খুঁজে পাওয়া যায়নি।');
          return;
        }

        const sellData = snap.val();

        // Delete from node
        await remove(itemRef);

        await sendMessage(`❌ <b>হতাশাজনক! ${cat.toUpperCase()} সেল আবেদনটি ডিক্লাইন বা রিজেক্ট করা হয়েছে!</b>\n\n• আবেদনকারী নাম: <b>${sellData.username}</b>`);

        // Notify User
        const userSnap = await get(ref(db, `users/${sellData.userId}`));
        if (userSnap.exists() && userSnap.val().telegramChatId) {
          try {
            await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: userSnap.val().telegramChatId,
                text: `🛑 <b>আপনার অ্যাকাউন্ট বিক্রয় বাতিল করা হয়েছে!</b>\n\nআপনার সেল করা <b>${cat.toUpperCase()}</b> অ্যাকাউন্ট ডিটেইলস বা সাবমিশন ত্রুটির কারণে রিজেক্ট করা হলো। সঠিক তথ্য দিয়ে দয়া করে পুনরায় আবেদন করুন।`,
                parse_mode: 'HTML'
              })
            });
          } catch (_) {}
        }
      } catch (err: any) {
        await sendMessage(`❌ রিজেকশন প্রসেসিং এরর: ${err.message}`);
      }
      return;
    }
  }

  // --- ANONYMOUS SESSIONS (IF USER IS NOT REGISTERED OR ASSOCIATED YET) ---
  if (!userId) {
    const trimmedText = text.trim();

    // 1. Admin Bot Anonymous flows
    if (isFromAdminBot) {
      if (trimmedText.startsWith('/start')) {
        const welcomeMsg = `👮‍♂️ <b>টাকাহাব (TakaHub) এডমিন অটোমেশন কন্ট্রোল সেন্টারে স্বাগতম!</b>\n\nএই চ্যাটবটটি শুধুমাত্র সুরক্ষার স্বার্থে নিবন্ধিত সিস্টেম এডমিনের ব্যবহারের জন্য সংরক্ষিত।\n\n🔐 <b>সংযোগ পদ্ধতি:</b>\nআপনার রেজিস্টার্ড এডমিন জিমেইল ইমেইলটি নিচে লিখে পাঠান, অথবা সরাসরি <code>/login your_email@gmail.com</code> লিখন ব্যবহার করুন।`;
        await sendMessage(welcomeMsg);
        return;
      }

      if (trimmedText.startsWith('/login') || (trimmedText.includes('@') && trimmedText.includes('.'))) {
        const mailVal = trimmedText.replace('/login', '').trim();
        const extractedEmail = mailVal || trimmedText;
        if (extractedEmail.toLowerCase() !== 'banglag215@gmail.com') {
          await sendMessage('❌ <b>প্রবেশাধিকার সংরক্ষিত!</b>\n\nএই এডমিন বটটি কোনো সাধারণ ব্যবহারকারীর ব্যবহারের জন্য উন্মুক্ত নয়। শুধুমাত্র নিবন্ধিত এডমিন ইমেইল অ্যাকাউন্টের মাধ্যমেই এটি লিংক করা যাবে।');
          return;
        }
        await attemptLogin(extractedEmail);
        return;
      }

      await sendMessage('⚠️ <b>এডমিন অ্যাকাউন্ট লিংক করা হয়নি!</b>\n\nকন্ট্রোল অ্যাক্সেস পেতে দয়া করে আপনার ওয়েরসাইটের রেজিস্টার্ড এডমিন জিমেইল অ্যাড্রেসটি টাইপ করে পাঠান।\n\nযেমন: <code>banglag215@gmail.com</code>');
      return;
    }

    // 2. User Bot Anonymous flows
    if (trimmedText.startsWith('/start')) {
      const welcomeMsg = `👋 <b>টাকাহাব (TakaHub) অটোমেটেড চ্যাটবটে আপনাকে স্বাগতম!</b>\n\nওয়েবসাইটের সব সুবিধা টেলিগ্রাম বটের মাধ্যমেই উপভোগ করতে প্রথম আপনার অ্যাকাউন্টটি লিংক করে নিন।\n\n🔐 <b>অ্যাকাউন্ট লিংক করার পদ্ধতি:</b>\nআপনার ওয়েরসাইটের রেজিস্টার্ড ইমেইল অ্যাড্রেসটি এই বটে টেক্সট করে পাঠান, অথবা নিচের কম্যান্ড আকারে লিখুন:\n<code>/login your_email@gmail.com</code>\n\nওয়েবসাইটে কোনো অ্যাকাউন্ট না থাকলে প্রথমে ক্রোম ব্রাউজারে লিংক ওপেন করে রেজিস্টার করে নিন।`;
      await sendMessage(welcomeMsg);
      return;
    }

    if (trimmedText.startsWith('/login')) {
      const searchVal = trimmedText.replace('/login', '').trim();
      if (!searchVal) {
        await sendMessage('⚠️ অনুগ্রহ করে আপনার রেজিস্টার্ড ইমেইল প্রদান করুন। যেমন: <code>/login test@gmail.com</code>');
        return;
      }
      await attemptLogin(searchVal);
      return;
    }

    // Try handling natural email format submissions directly
    if (trimmedText.includes('@') && trimmedText.includes('.')) {
      await attemptLogin(trimmedText);
      return;
    }

    await sendMessage('⚠️ <b>টেলিগ্রাম আইডি লিংক করা হয়নি!</b>\n\nবটের কার্যক্রম পরিচালনা করতে দয়া করে আপনার ওয়েরসাইটের সঠিক জিমেইল অ্যাড্রেসটি টাইপ করে বটের মেসেজে পাঠান।\n\nযেমন: <code>demo@gmail.com</code>');
    return;

    async function attemptLogin(emailOrUid: string) {
      await sendMessage('🔍 আপনার অ্যাকাউন্ট ভেরিফাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');
      try {
        const usersSnap = await get(ref(db, 'users'));
        const allUsers = usersSnap.exists() ? usersSnap.val() : {};
        let foundUid: string | null = null;
        let foundUser: any = null;

        for (const [key, val] of Object.entries(allUsers)) {
          const u = val as any;
          if (
            (u.email && u.email.toLowerCase() === emailOrUid.toLowerCase()) ||
            key === emailOrUid ||
            (u.displayName && u.displayName.toLowerCase() === emailOrUid.toLowerCase())
          ) {
            foundUid = key;
            foundUser = u;
            break;
          }
        }

        if (!foundUid && emailOrUid.toLowerCase() === 'banglag215@gmail.com') {
          // Provision Admin account on the fly if missing
          foundUid = 'admin_master';
          foundUser = {
            email: 'banglag215@gmail.com',
            displayName: 'System Admin',
            balance: 100000,
            isActive: true,
            telegramAdminChatId: String(chatId)
          };
          await update(ref(db, `users/${foundUid}`), foundUser);
        }

        if (foundUid && foundUser) {
          // Associated this user
          await set(ref(db, `telegram_associations/${chatId}`), foundUid);
          if (isFromAdminBot) {
            await update(ref(db, `users/${foundUid}`), { telegramAdminChatId: String(chatId) });
            await update(ref(db, 'settings'), { telegramAdminChatId: String(chatId) });
          } else {
            await update(ref(db, `users/${foundUid}`), { telegramChatId: String(chatId) });
          }
          
          const userKeyboardMarkup = isFromAdminBot ? adminKeyboard : mainKeyboard;

          const successMsg = `🎉 <b>অ্যাকাউন্ট লিংকিং সফল হয়েছে!</b>\n\n👤 ইউজার নাম: <b>${foundUser.displayName || 'Unknown'}</b>\n📧 ইউজার মেইল: <code>${foundUser.email || 'N/A'}</code>\n💰 মোট ক্যাশ ব্যালেন্স: <b>৳${(foundUser.balance || 0).toFixed(2)}</b>\n\n` +
            (foundUser.isActive ? `এখন নিচের ড্যাশবোর্ড মেন্যু বাটনগুলো দিয়ে যেকোনো অ্যাকাউন্ট বিক্রয় ও উইথড্র উইজার্ড সম্পন্ন করতে পারবেন।` : `⚠️ <b>আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় (Inactive) রয়েছে।</b> বটের ফিচারগুলো ব্যবহার করতে দয়া করে আগে আমাদের ওয়েবসাইট থেকে আপনার অ্যাকাউন্টটি সক্রিয় করে নিন।`);
          await sendMessage(successMsg, { reply_markup: userKeyboardMarkup });
        } else {
          await sendMessage('❌ <b>দুঃখিত! অ্যাকাউন্ট পাওয়া যায়নি।</b>\n\nটাকাহাব ওয়েবসাইটে আপনার অ্যাকাউন্ট যে মেইল দিয়ে সাইন-ইন করা আছে, সেটি সঠিকভাবে পুনরায় লিখে সাবমিট করুন।');
        }
      } catch (err: any) {
        await sendMessage(`❌ সিস্টেমে ত্রুটি: ${err.message}`);
      }
    }
  }

  // --- LOGGED-IN SESSIONS CORE ACTIONS ---
  
  // Custom Log Out handler for User Bot
  if (text === '🚪 Log Out (লগ আউট)' || text === '/logout') {
    if (isFromAdminBot) {
      await sendMessage('⚠️ এডমিন বটে এই অপশন প্রযোজ্য নয়।');
      return;
    }
    await sendMessage('⏳ আপনাকে টাকাহাব সিস্টেম থেকে সফলভাবে লগ আউট করা হচ্ছে...');
    try {
      if (userId) {
        // Clear association in database
        await remove(ref(db, `telegram_associations/${chatId}`));
        // Clear chat id in user object
        await update(ref(db, `users/${userId}`), { telegramChatId: null });
      }
      // Delete local session
      userSessions.delete(chatId);
      
      const loggedOutKeyboard = {
        keyboard: [
          [{ text: '/start' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      };

      await sendMessage('🚪 <b>লগ আউট সফল হয়েছে!</b>\n\nআপনার টেলিগ্রাম অ্যাকাউন্টটি টাকাহাব সিস্টেম থেকে সফলভাবে অবমুক্ত করা হয়েছে। পুনরায় বটের ফিচারসমূহ ব্যবহার করতে ও নতুন অ্যাকাউন্ট লিংক করতে আপনার জিমেইল এড্রেসটি এখানে লিখে পাঠান বা <code>/start</code> লিখুন।', { reply_markup: loggedOutKeyboard });
    } catch (err: any) {
      await sendMessage(`❌ লগ আউট অপটিমাইজেশন সমস্যা: ${err.message}`);
    }
    return;
  }

  // Safety checks & Toggle modes

  // If this update came from the ADMIN BOT, perform administrative validation
  if (isFromAdminBot) {
    if (!isAdmin) {
      await sendMessage('❌ ক্ষমা করবেন, এই চ্যাটবটটি শুধুমাত্র সিস্টেম এডমিনের ব্যবহারের জন্য সংরক্ষিত। আপনি এই সিস্টেমের এডমিন নন!');
      return;
    }
    // Force adminMode to be active for Admin Bot
    userSession.payload.adminMode = true;
    userSessions.set(chatId, userSession);
  }

  // Active account check for players/users on the USER BOT
  if (!isFromAdminBot && !isAdmin) {
    if (userData && !userData.isActive) {
      // Allow only viewing PROFILE or HELP, intercept all other button clicks/actions/inputs
      if (text !== '👤 Profile / ব্যালেন্স' && text !== '/profile' && text !== '❓ Help / নির্দেশনা' && text !== '/help' && text !== '🏠 Back to Menu' && text !== '/menu') {
        const inactiveErrorMsg = `⚠️ <b>দুঃখিত! আপনার টাকাহাব অ্যাকাউন্টটি এখনও নিষ্ক্রিয় (Inactive)।</b>\n\nবটের কোনো সার্ভিস বা ফিচার (যেমন স্পিন, একাউন্ট বিক্রয়, ব্যালেন্স ট্রান্সফার বা উত্তোলন) ব্যবহার করতে আপনার অ্যাকাউন্টটি অবশ্যই সক্রিয় থাকা লাগবে।\n\n💡 <b>করণীয়:</b>\nঅনুগ্রহ করে এখনই আমাদের অফিশিয়াল ওয়েবসাইট থেকে আপনার অ্যাকাউন্টটি সক্রিয় করুন, তারপর বটের সব সুবিধা উপভোগ করুন।`;
        await sendMessage(inactiveErrorMsg, { reply_markup: mainKeyboard });
        return;
      }
    }
  }

  if (text === '🔑 Switch to Admin Panel') {
    if (!isAdmin) {
      await sendMessage('❌ ক্ষমা করবেন, আপনি এই সিস্টেমটির অ্যাডমিন নন!');
      return;
    }
    userSession.payload.adminMode = true;
    userSession.step = 'none';
    userSessions.set(chatId, userSession);
    await sendMessage('🔑 <b>এডমিন প্যানেলে স্বাগতম!</b>\n\nবটের মাধ্যমে সাইটের প্রয়োজনীয় কার্যকলাপ সম্পন্ন করতে নিচের এডমিন বাটনগুলো চাপুন:', { reply_markup: adminKeyboard });
    return;
  }

  if (text === '👤 Switch to User Mode') {
    if (isFromAdminBot) {
      await sendMessage('⚠️ <b>এই এডমিন বটের ভেতর ইউজার মোড সাপোর্ট করে না!</b>\nইউজার মোড ব্যবহারের জন্য দয়া করে আমাদের মেইন ইউজার বটের সাহায্য নিন।', { reply_markup: adminKeyboard });
      return;
    }
    userSession.payload.adminMode = false;
    userSession.step = 'none';
    userSessions.set(chatId, userSession);
    await sendMessage('👤 <b>ইউজার মোডে স্বাগতম!</b>\n\nআপনার মূল ইউজার ইন্টারফেস ড্যাশবোর্ড বাটনগুলো নিচে সচল করা হলো:', { reply_markup: mainKeyboard });
    return;
  }

  const adminMode = isAdmin && userSession.payload.adminMode;

  if (adminMode) {
    // --- ADMIN MODE HANDLERS OR STATE INPUTS ---

    // 1. Notice Text step handler
    if (userSession.step === 'admin_notice_text') {
      const noticeText = text.trim();
      userSession.step = 'none';
      userSessions.set(chatId, userSession);

      await sendMessage('⏳ নোটিশ প্রচার করা হচ্ছে, দয়া করে অপেক্ষা করুন...');
      try {
        // Push to global_notifications
        const gNotifRef = ref(db, 'global_notifications');
        const newNotifRef = push(gNotifRef);
        await set(newNotifRef, {
          id: newNotifRef.key,
          text: noticeText,
          timestamp: Date.now()
        });

        // Loop to broadcast to all Telegram users
        const usersSnap = await get(ref(db, 'users'));
        let broadcastCount = 0;
        if (usersSnap.exists()) {
          const allUsers = usersSnap.val();
          for (const [uid, uVal] of Object.entries(allUsers)) {
            const u = uVal as any;
            if (u.telegramChatId) {
              try {
                await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: u.telegramChatId,
                    text: `📢 <b>নতুন এডমিন নোটিশ:</b>\n\n${noticeText}`,
                    parse_mode: 'HTML'
                  })
                });
                broadcastCount++;
              } catch (_) {}
            }
          }
        }

        await sendMessage(`✅ <b>নোটিশ প্রচার সম্পন্ন হয়েছে!</b>\n\n• ওয়েরসাইটের নোটিশ বোর্ডে সেভ করা হয়েছে।\n• মোট <code>${broadcastCount}</code> জন সক্রিয় টেলিগ্রাম ইউজারের ইনবক্সে ব্রডকাস্ট পাঠানো হয়েছে।`, { reply_markup: adminKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ নোটিশ পাঠাতে ব্যর্থতা: ${err.message}`, { reply_markup: adminKeyboard });
      }
      return;
    }

    // Menu handlers
    if (text === '🏠 Back to Menu' || text === '/menu' || text === '/admin') {
      userSession.step = 'none';
      userSessions.set(chatId, userSession);
      await sendMessage('🏠 আপনি এডমিন প্যানেল মূল ইন্টারফেসে ফিরে এসেছেন। নিচে আপনার এডমিন নিয়ন্ত্রণসমূহ দেওয়া হলো:', { reply_markup: adminKeyboard });
      return;
    }

    if (text === '📊 Overview (পরিসংখ্যান)') {
      await sendMessage('📊 পরিসংখ্যান ডাটা লোড করা হচ্ছে...');
      try {
        const usersSnap = await get(ref(db, 'users'));
        const wSnap = await get(ref(db, 'withdrawals'));
        const gmailSnap = await get(ref(db, 'gmail_sells'));
        const fbSnap = await get(ref(db, 'facebook_sells'));
        const tgSnap = await get(ref(db, 'telegram_sells'));
        const waSnap = await get(ref(db, 'whatsapp_sells'));

        let totalUsers = 0;
        let activeUsers = 0;
        let bannedUsers = 0;
        let totalUserBalance = 0;

        if (usersSnap.exists()) {
          const users = usersSnap.val();
          for (const u of Object.values(users) as any[]) {
            totalUsers++;
            if (u.isActive) activeUsers++;
            if (u.isBanned) bannedUsers++;
            totalUserBalance += (u.balance || 0);
          }
        }

        let pendingWds = 0;
        let pendingWdAmt = 0;
        if (wSnap.exists()) {
          const wds = wSnap.val();
          for (const w of Object.values(wds) as any[]) {
            if (w.status === 'pending') {
              pendingWds++;
              pendingWdAmt += (w.amount || 0);
            }
          }
        }

        const countPending = (snap: any) => {
          if (!snap.exists()) return 0;
          return Object.values(snap.val()).filter((x: any) => x.status === 'pending' || !x.status).length;
        };

        const pendingGmails = countPending(gmailSnap);
        const pendingFbs = countPending(fbSnap);
        const pendingTgs = countPending(tgSnap);
        const pendingWas = countPending(waSnap);

        const statsMsg = `📊 <b>টাকাহাব সিস্টেম ড্যাশবোর্ড ও পরিসংখ্যান</b>\n\n` +
          `👥 <b>ইউজার ইনসাইটস:</b>\n` +
          `• মোট নিবন্ধিত ইউজার: <b>${totalUsers} জন</b>\n` +
          `• সচল/অ্যাক্টিভ ইউজার: <b>${activeUsers}</b> 🟢\n` +
          `• ব্লক/ব্যানড ইউজার: <b>${bannedUsers}</b> 🔴\n` +
          `• মোট ইউজার ওয়ালেট লায়াবিলিটি: ৳<b>${totalUserBalance.toFixed(2)}</b>\n\n` +
          `💸 <b>উইথড্র রিকোয়েস্ট:</b>\n` +
          `• পেন্ডিং উইথড্র আবেদন: <b>${pendingWds} টি</b>\n` +
          `• পেন্ডিং টাকার পরিমাণ: ৳<b>${pendingWdAmt.toFixed(2)}</b>\n\n` +
          `🛍️ <b>পেন্ডিং অ্যাকাউন্ট বিক্রয়সমূহ:</b>\n` +
          `• পেন্ডিং জিমেইল সেল: <b>${pendingGmails} টি</b>\n` +
          `• পেন্ডিং ফেসবুক সেল: <b>${pendingFbs} টি</b>\n` +
          `• পেন্ডিং টেলিগ্রাম সেল: <b>${pendingTgs} টি</b>\n` +
          `• পেন্ডিং হোয়াটসঅ্যাপ সেল: <b>${pendingWas} টি</b>`;

        await sendMessage(statsMsg, { reply_markup: adminKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ পরিসংখ্যান ডেটা লোড করতে সমস্যা: ${err.message}`, { reply_markup: adminKeyboard });
      }
      return;
    }

    if (text === '💸 Pending Withdrawals') {
      await sendMessage('🔍 পেন্ডিং উইথড্র ডাটা খোঁজা হচ্ছে...');
      try {
        const wSnap = await get(ref(db, 'withdrawals'));
        let foundPending = false;
        if (wSnap.exists()) {
          const wds = Object.values(wSnap.val()) as any[];
          const pendings = wds.filter(w => w.status === 'pending');
          if (pendings.length > 0) {
            foundPending = true;
            const limit = Math.min(pendings.length, 5);
            await sendMessage(`📋 মোট <b>${pendings.length}টি</b> পেন্ডিং উইথড্র আবেদন পাওয়া গেছে। প্রথম <b>${limit}টি</b> নিচে দেওয়া হলো:`);

            for (let i = 0; i < limit; i++) {
              const wd = pendings[i];
              const cardMsg = `💸 <b>উইথড্র আবেদন [${i+1}/${limit}]</b>\n\n` +
                `👤 ইউজার: <code>${wd.email}</code>\n` +
                `🏦 পেমেন্ট মেথড: <b>${wd.method}</b>\n` +
                `📞 পেমেন্ট নম্বর: <code>${wd.number}</code>\n` +
                `💰 পরিমাণ: ৳<b>${wd.amount.toFixed(2)}</b>\n` +
                `🌐 ব্যালেন্স সোর্স: <i>${wd.balanceType || 'main'}</i>\n` +
                `🕒 জমা দেওয়ার সময়: <i>${new Date(wd.timestamp).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}</i>`;

              const inlineKeyboard = {
                inline_keyboard: [
                  [
                    { text: '✅ Approve (Paid)', callback_data: `wd_app_${wd.id}` }
                  ],
                  [
                    { text: '💵 Reject & Refund', callback_data: `wd_rej_ref_${wd.id}` },
                    { text: '🔥 Reject & Deduct', callback_data: `wd_rej_ded_${wd.id}` }
                  ]
                ]
              };

              await sendMessage(cardMsg, { reply_markup: inlineKeyboard });
            }
          }
        }

        if (!foundPending) {
          await sendMessage('🎉 চমৎকার! বর্তমানে কোনো পেন্ডিং উইথড্র আবেদন নেই।', { reply_markup: adminKeyboard });
        }
      } catch (err: any) {
        await sendMessage(`❌ ডাটা লোড ব্যর্থ: ${err.message}`, { reply_markup: adminKeyboard });
      }
      return;
    }

    if (text === '🛍️ Pending Account Sales') {
      const catKeyboard = {
        inline_keyboard: [
          [
            { text: '📧 Gmail Sells', callback_data: 'sells_cat_gmail' },
            { text: '👤 Facebook Sells', callback_data: 'sells_cat_facebook' }
          ],
          [
            { text: '✈️ Telegram Sells', callback_data: 'sells_cat_telegram' },
            { text: '💬 WhatsApp Sells', callback_data: 'sells_cat_whatsapp' }
          ]
        ]
      };
      await sendMessage('🛍️ কোন বিভাগের পেন্ডিং অ্যাকাউন্ট বিক্রয় রিকোয়েস্ট দেখতে চান, নিচে থেকে চয়ন করুন:', { reply_markup: catKeyboard });
      return;
    }

    if (text === '📢 Send Universal Notice') {
      userSession.step = 'admin_notice_text';
      userSessions.set(chatId, userSession);
      await sendMessage('📢 <b>ইউনিভার্সাল নোটিশ ব্রডকাস্ট উইজার্ড</b>\n\nআপনি যে নোটিশটি প্রচার করতে চান তা টাইপ করে পরবর্তী টেক্সটে পাঠান। এটি সমস্ত ব্যবহারকারীর কাছে ব্রডকাস্ট হবে এবং হোমপেজে যুক্ত হবে:');
      return;
    }

    if (text === '⚙️ Toggle Maintenance (মেইনটেন্যান্স)') {
      try {
        const settingsSnap = await get(ref(db, 'settings'));
        const settings = settingsSnap.exists() ? settingsSnap.val() : {};

        const spinStatus = settings.spinMaintenanceEnabled ? '🔴 বন্ধ (Under Maintenance)' : '🟢 সচল (Active)';
        const siteStatus = settings.emergencyEnabled ? '🔴 ইমারজেন্সি বন্ধ (Emergency Lock Active)' : '🟢 সচল (Normal Status)';

        const settingsMsg = `⚙️ <b>টাকাহাব মেইনটেন্যান্স সেটিংস</b>\n\n` +
          `🎡 স্পিন হুইল স্ট্যাটাস: <b>${spinStatus}</b>\n` +
          `🛑 মেইন সাইট লক স্ট্যাটাস: <b>${siteStatus}</b>\n\n` +
          `নিচের বাটনগুলো ক্লিক করে তাৎক্ষণিকভাবে স্ট্যাটাস পরিবর্তন করতে পারবেন:`;

        const togglerKeyboard = {
          inline_keyboard: [
            [{ text: '🎡 Toggle Spin Wheel Maintenance', callback_data: 'toggle_setting_spin' }],
            [{ text: '🛑 Toggle Site Emergency Lock', callback_data: 'toggle_setting_emergency' }]
          ]
        };

        await sendMessage(settingsMsg, { reply_markup: togglerKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ সেটিংস লোড করতে সমস্যা: ${err.message}`, { reply_markup: adminKeyboard });
      }
      return;
    }

    // Default admin handler for unmatched input
    await sendMessage('💡 কাঙ্ক্ষিত এডমিন অ্যাকশন চয়ন করতে নিচের মেন্যু বাটনগুলো চাপুন অথবা টাইপ করুন।', { reply_markup: adminKeyboard });
    return;
  }

  // Handle Home Menu option for users
  if (text === '🏠 Back to Menu' || text === '/menu') {
    userSessions.delete(chatId);
    await sendMessage('🏠 আপনি মূল ইন্টারফেস ড্যাশবোর্ডে ফিরে এসেছেন। কাঙ্ক্ষিত কর্ম চয়ন করতে নিচের মেন্যু বাটন চাপুন:', { reply_markup: mainKeyboard });
    return;
  }

  // Handle states wizard processing active input collections
  if (userSession.step !== 'none') {
    // 1. SELL GMAIL ACCOUNT WIZARD
    if (userSession.step === 'sell_gmail_email') {
      userSession.payload.email = text.trim();
      userSession.step = 'sell_gmail_password';
      userSessions.set(chatId, userSession);
      await sendMessage('🔑 এবার এই জিমেইল অ্যাকাউন্টের সম্পূর্ণ অ্যাক্সেস পাসওয়ার্ডটি (Password) টাইপ করুন:');
      return;
    }
    if (userSession.step === 'sell_gmail_password') {
      const email = userSession.payload.email;
      const valPass = text.trim();
      userSessions.delete(chatId);

      await sendMessage('⏳ প্রসেসিং হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');
      try {
        const salesRef = ref(db, 'gmail_sells');
        const newSaleRef = push(salesRef);
        await set(newSaleRef, {
          id: newSaleRef.key,
          userId: userId,
          username: userData.username || userData.displayName || 'Telegram User',
          email: email,
          password: valPass,
          status: 'pending',
          timestamp: Date.now()
        });
        await sendMessage(`✅ <b>জিমেইল কোড জমা সম্পন্ন হয়েছে!</b>\n\n📧 ইমেইল: <code>${email}</code>\n🔑 পাসওয়ার্ড: <code>${valPass}</code>\n\nমডারেটর অতিসত্বর চেক করে আপনার জিমেইল সোর্স ওয়ালেটে টাকা ক্রেডিট করে দেবেন। ৩-২৪ ঘন্টা অপেক্ষা করুন।`, { reply_markup: mainKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ ব্যর্থ হয়েছে: ${err.message}`, { reply_markup: mainKeyboard });
      }
      return;
    }

    // 2. SELL FACEBOOK ACCOUNT WIZARD
    if (userSession.step === 'sell_fb_email') {
      userSession.payload.email = text.trim();
      userSession.step = 'sell_fb_password';
      userSessions.set(chatId, userSession);
      await sendMessage('🔑 এবার ফেসবুক অ্যাকাউন্টের সঠিক পাসওয়ার্ড দিন:');
      return;
    }
    if (userSession.step === 'sell_fb_password') {
      userSession.payload.password = text.trim();
      userSession.step = 'sell_fb_2fa';
      userSessions.set(chatId, userSession);
      await sendMessage('🔐 ফেসবুক মেম্বারশিপ এবং সিকিউরিটির অ্যাকাউন্টের 2-Factor key/code (দ্বি-স্তরের কোড) লিখুন (না থাকলে "none" বা স্পেস দিন):');
      return;
    }
    if (userSession.step === 'sell_fb_2fa') {
      const email = userSession.payload.email;
      const pass = userSession.payload.password;
      const twoFa = text.trim();
      userSessions.delete(chatId);

      await sendMessage('⏳ সাবমিট করা হচ্ছে, চেক করুন...');
      try {
        const salesRef = ref(db, 'facebook_sells');
        const newSaleRef = push(salesRef);
        await set(newSaleRef, {
          id: newSaleRef.key,
          userId: userId,
          username: userData.username || userData.displayName || 'Telegram User',
          email: email,
          password: pass,
          twoFactor: twoFa,
          status: 'pending',
          timestamp: Date.now()
        });
        await sendMessage(`✅ <b>আপনার ফেসবুক অ্যাকাউন্ট বিক্রয়ের রিকোয়েস্ট যোগ করা হয়েছে!</b>\n\n📧 ইমেইল: <code>${email}</code>\n🔑 পাসওয়ার্ড: <code>${pass}</code>\n🔐 ২-ফ্যাক্টর: <code>${twoFa}</code>\n\nএডমিন প্যানেলে আবেদন ভেরিফাই হওয়ার পর আপনার ক্যাশ ওয়ালেটে টাকা পৌঁছে যাবে।`, { reply_markup: mainKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ ব্যর্থ হয়েছে: ${err.message}`, { reply_markup: mainKeyboard });
      }
      return;
    }

    // 3. SELL TELEGRAM ACCOUNT WIZARD
    if (userSession.step === 'sell_tg_number') {
      userSession.payload.number = text.trim();
      userSession.step = 'sell_tg_details';
      userSessions.set(chatId, userSession);
      await sendMessage('📝 টেলিগ্রামের লগইন সম্পর্কিত অন্যান্য কোড বা টু-স্টেপ ভেরিফিকেশন পাসওয়ার্ড বিবরণ ও ডাটা থাকলে প্রদান করুন:');
      return;
    }
    if (userSession.step === 'sell_tg_details') {
      const num = userSession.payload.number;
      const det = text.trim();
      userSessions.delete(chatId);

      await sendMessage('⏳ টেলিগ্রাম জমা নেওয়া হচ্ছে...');
      try {
        const salesRef = ref(db, 'telegram_sells');
        const newSaleRef = push(salesRef);
        await set(newSaleRef, {
          id: newSaleRef.key,
          userId: userId,
          username: userData.username || userData.displayName || 'Telegram User',
          number: num,
          details: det,
          status: 'pending',
          timestamp: Date.now()
        });
        await sendMessage(`✅ <b>টেলিগ্রাম আইডি ডেটা সফলভাবে রিসিভ করা হয়েছে!</b>\n\n📞 নম্বর: <code>${num}</code>\n📝 বিবরণ: <i>${det}</i>\n\nএডমিন টিম ডাটা লগইন স্ক্রিন করার পর টাকা যোগ হয়ে যাবে।`, { reply_markup: mainKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ রিকোয়েস্ট ব্যর্থ: ${err.message}`, { reply_markup: mainKeyboard });
      }
      return;
    }

    // 4. SELL WHATSAPP ACCOUNT WIZARD
    if (userSession.step === 'sell_wa_number') {
      userSession.payload.number = text.trim();
      userSession.step = 'sell_wa_details';
      userSessions.set(chatId, userSession);
      await sendMessage('📝 হোয়াটসঅ্যাপ নম্বরের যাবতীয় ওয়ান-টাইম লগইন কোড ও অন্যান্য প্রয়োজনীয় বিবরণ প্রদান করুন:');
      return;
    }
    if (userSession.step === 'sell_wa_details') {
      const num = userSession.payload.number;
      const det = text.trim();
      userSessions.delete(chatId);

      await sendMessage('⏳ হোয়াটসঅ্যাপ কোড প্রসেস করা হচ্ছে...');
      try {
        const salesRef = ref(db, 'whatsapp_sells');
        const newSaleRef = push(salesRef);
        await set(newSaleRef, {
          id: newSaleRef.key,
          userId: userId,
          username: userData.username || userData.displayName || 'Telegram User',
          number: num,
          details: det,
          status: 'pending',
          timestamp: Date.now()
        });
        await sendMessage(`✅ <b>হোয়াটসঅ্যাপ অ্যাকাউন্ট বিক্রয়ের রিকোয়েস্ট জমা পড়েছে!</b>\n\n📞 নম্বর: <code>${num}</code>\n📎 বিবরণ: <i>${det}</i>\n\nসফলভাবে এডমিন চেক করার পর আপনার হোয়াটসঅ্যাপ ওয়ালেট ব্যালেন্সে টাকা চলে আসবে।`, { reply_markup: mainKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ ব্যর্থ হয়েছে: ${err.message}`, { reply_markup: mainKeyboard });
      }
      return;
    }

    // 5. WITHDRAW CHECKS FOR MAIN WALLET
    if (userSession.step === 'withdraw_amount') {
      const amt = parseFloat(text.trim());
      if (isNaN(amt) || amt <= 0) {
        await sendMessage('⚠️ অনুগ্রহ করে একটি সঠিক ধনাত্মক সংখ্যা লিখুন। যেমন: 100');
        return;
      }
      userSession.payload.amount = amt;
      userSession.step = 'withdraw_method';
      userSessions.set(chatId, userSession);
      await sendMessage('🏦 <b>উত্তোলন করার মাধ্যম নির্ধারণ করুন:</b>\n\nনিচের বক্সে টাইপ করুন: <b>Bkash</b> অথবা <b>Nagad</b>');
      return;
    }
    if (userSession.step === 'withdraw_method') {
      const method = text.trim();
      if (method.toLowerCase() !== 'bkash' && method.toLowerCase() !== 'nagad') {
        await sendMessage('⚠️ অনুগ্রহ করে শুধুমাত্র <b>Bkash</b> অথবা <b>Nagad</b> লিখে পাঠান।');
        return;
      }
      userSession.payload.method = method === 'Bkash' || method.toLowerCase() === 'bkash' ? 'Bkash' : 'Nagad';
      userSession.step = 'withdraw_number';
      userSessions.set(chatId, userSession);
      await sendMessage(`📞 এবার আপনার উত্তোলিত টাকা পাঠাতে মেথডটির সচল পার্সোনাল মোবাইল নম্বরটি লিখুন:`);
      return;
    }
    if (userSession.step === 'withdraw_number') {
      const number = text.trim();
      const amt = userSession.payload.amount;
      const method = userSession.payload.method;
      userSessions.delete(chatId);

      const availableBalance = userData.balance || 0;
      if (availableBalance < amt) {
        await sendMessage(`❌ আপনার মূল ক্যাশ ব্যালেন্সে পর্যাপ্ত টাকা নেই। বর্তমানে ব্যালেন্স: <b>৳${availableBalance.toFixed(2)}</b>`, { reply_markup: mainKeyboard });
        return;
      }

      await sendMessage('⏳ উত্তোলনের রিকোয়েস্ট জেনারেট হচ্ছে...');
      try {
        const withdrawListRef = ref(db, 'withdrawals');
        const newWithdrawRef = push(withdrawListRef);

        await set(newWithdrawRef, {
          id: newWithdrawRef.key,
          userId: userId,
          email: userData.email || 'tg-user',
          method: method,
          number: number,
          amount: amt,
          status: 'pending',
          timestamp: Date.now(),
          balanceType: 'main'
        });

        // Deduct from Main Balance
        await update(ref(db, `users/${userId}`), {
          balance: availableBalance - amt
        });

        await sendMessage(`🎉 <b>উইথড্র রিকোয়েস্ট সফলভাবে সিস্টেমে যুক্ত হয়েছে!</b>\n\n🏦 পেমেন্ট ব্যাংক: <b>${method}</b>\n📞 ক্যাশ নম্বর: <code>${number}</code>\n💰 পরিমাণ: <b>৳${amt.toFixed(2)}</b>\n\n২৪ ঘন্টার ভেতর এডমিন এটি পেমেন্ট এপ্রুভাল করে দেবে।`, { reply_markup: mainKeyboard });
      } catch (err: any) {
        await sendMessage(`❌ পেমেন্ট রিকোয়েস্ট তৈরিতে ত্রুটি: ${err.message}`, { reply_markup: mainKeyboard });
      }
      return;
    }

    // 6. BALANCE TRANSFER ENGINE
    if (userSession.step === 'transfer_email') {
      const trEmail = text.trim().toLowerCase();
      userSession.payload.trEmail = trEmail;
      userSession.step = 'transfer_amount';
      userSessions.set(chatId, userSession);
      await sendMessage('💰 এবার স্থানান্তরের জন্য টাকার পরিমাণটি লিখুন (যেমন: 100):');
      return;
    }
    if (userSession.step === 'transfer_amount') {
      const amt = parseFloat(text.trim());
      if (isNaN(amt) || amt <= 0) {
        await sendMessage('⚠️ দয়া করে সঠিক টাকার পরিমাণ লিখুন (উদাহরণ: 50)');
        return;
      }
      const targetEmail = userSession.payload.trEmail;
      userSessions.delete(chatId);

      const availableBalance = userData.balance || 0;
      if (availableBalance < amt) {
        await sendMessage(`❌ আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই! বর্তমানে মোট ক্যাশ ব্যালেন্স: <b>৳${availableBalance.toFixed(2)}</b>`, { reply_markup: mainKeyboard });
        return;
      }

      await sendMessage('⏳ যাচাই ও ট্রান্সফার প্রসেস রানিং...');
      try {
        const usersSnap = await get(ref(db, 'users'));
        if (usersSnap.exists()) {
          const allUsers = usersSnap.val();
          let targetUid: string | null = null;
          let targetData: any = null;

          for (const [key, val] of Object.entries(allUsers)) {
            const u = val as any;
            if (u.email && u.email.toLowerCase() === targetEmail.toLowerCase()) {
              targetUid = key;
              targetData = u;
              break;
            }
          }

          if (targetUid && targetData) {
            if (targetUid === userId) {
              await sendMessage('❌ আপনি নিজের ওয়েরসাইট আইডিতে নিজে টাকা স্থানান্তর করতে পারবেন না!', { reply_markup: mainKeyboard });
              return;
            }

            // Deduct sender & Credit target
            await update(ref(db, `users/${userId}`), {
              balance: availableBalance - amt
            });
            await update(ref(db, `users/${targetUid}`), {
              balance: (targetData.balance || 0) + amt
            });

            // Write logs transactions Node
            const txRef = ref(db, 'transactions');
            const newTxRef = push(txRef);
            await set(newTxRef, {
              id: newTxRef.key,
              senderId: userId,
              senderEmail: userData.email,
              receiverId: targetUid,
              receiverEmail: targetEmail,
              amount: amt,
              timestamp: Date.now()
            });

            // Send notification message if the target is linked to telegram
            if (targetData.telegramChatId) {
              try {
                await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: targetData.telegramChatId,
                    text: `🔔 <code>${userData.email}</code> আপনার অ্যাকাউন্ট ব্যালেন্সে ৳<b>${amt.toFixed(2)}</b> টাকা স্থানান্তর করেছেন।`,
                    parse_mode: 'HTML'
                  })
                });
              } catch (_) {}
            }

            await sendMessage(`✅ <b>ব্যালেন্স স্থানান্তর সফল হয়েছে!</b>\n\n👤 প্রাপক: <code>${targetEmail}</code>\n💰 পরিমাণ: ৳<b>${amt.toFixed(2)}</b>\n\nতাৎক্ষণিকভাবে প্রাপকের টাকাহাব ওয়ালেটে টাকা ব্যালেন্স যোগ করা হয়েছে।`, { reply_markup: mainKeyboard });

          } else {
            await sendMessage('❌ <b>দুঃখিত! এই ইমেইল আইডিযুক্ত কোনো টাকাহাব অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।</b>', { reply_markup: mainKeyboard });
          }
        } else {
          await sendMessage('❌ সিস্টেমে কোনো ইউজার ডাটা উপস্থিত নেই।');
        }
      } catch (err: any) {
        await sendMessage(`❌ স্থানান্তর ব্যর্থ হয়েছে: ${err.message}`, { reply_markup: mainKeyboard });
      }
      return;
    }
  }

  // --- BUTTON CLICKS ROUTER FOR SERVICES ---

  if (text === '👤 Profile / ব্যালেন্স' || text === '/profile') {
    const statusIcon = userData.isActive ? '🟢 সক্রিয় (Active)' : '🔴 নিষ্ক্রিয় (Inactive)';
    const balanceMsg = `💎 <b>আপনার টাকাহাব অ্যাকাউন্ট বিবরণী</b>\n\n` +
      `👤 ইউজার নেম: <b>${userData.displayName || 'N/A'}</b>\n` +
      `📧 ইমেইল: <code>${userData.email || 'N/A'}</code>\n` +
      `🛡️ অ্যাক্টিভেশন স্ট্যাটাস: <b>${statusIcon}</b>\n\n` +
      `💳 <b>আপনার সব ওয়ালেট ব্যালেন্স:</b>\n` +
      `• মূল ক্যাশ ব্যালেন্স: <b>৳${(userData.balance || 0).toFixed(2)}</b>\n` +
      `• জিমেইল ব্যালেন্স: <b>৳${(userData.gmailBalance || 0).toFixed(2)}</b>\n` +
      `• টেলিগ্রাম ব্যালেন্স: <b>৳${(userData.telegramBalance || 0).toFixed(2)}</b>\n` +
      `• হোয়াটসঅ্যাপ ব্যালেন্স: <b>৳${(userData.whatsappBalance || 0).toFixed(2)}</b>\n` +
      `• ফেসবুক ব্যালেন্স: <b>৳${(userData.facebookBalance || 0).toFixed(2)}</b>`;
    await sendMessage(balanceMsg);
    return;
  }

  if (text === '🎡 Spin (স্পিন করুন)' || text === '/spin') {
    const today = new Date().toISOString().split('T')[0];
    if (userData.lastSpinDate === today) {
      await sendMessage('❌ <b>আপনি আজ ইতিমধ্যে ফ্রি স্পিন ব্যবহার করে ফেলেছেন!</b>\n\nআগামীকাল নতুন স্পিন বোনাস রিডিম করতে পুনরায় সচল হোন। ⏳');
      return;
    }

    const settingsSnap = await get(ref(db, 'settings'));
    const settings = settingsSnap.exists() ? settingsSnap.val() : {};
    if (settings.spinMaintenanceEnabled) {
      await sendMessage(`⚠️ মেইনটেন্যান্স: ${settings.spinMaintenanceMessage || 'ফ্রি স্পিন সার্ভিসটি সাময়িকভাবে বন্ধ আছে।'}`);
      return;
    }

    const segments = (settings.spinRewards || '0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0').split(',').map(Number);
    const randomIndex = Math.floor(Math.random() * segments.length);
    const rewardVal = segments[randomIndex];

    await sendMessage('🎡 <i>টাকাহাব লাকি স্পিন হুইল ঘুরছে...</i> 🎯');
    
    setTimeout(async () => {
      try {
        const nextBal = (userData.balance || 0) + rewardVal;
        await update(ref(db, `users/${userData.uid}`), {
          balance: nextBal,
          lastSpinDate: today
        });
        await sendMessage(`🎉 <b>অভিনন্দন! আপনি স্পিন জয় করে পেয়েছেন ৳${rewardVal.toFixed(2)} টাকা!</b>\n\nএই রিওয়ার্ড আপনার টাকার মূল ব্যালেন্সে যুক্ত করে দেওয়া হয়েছে।`);
      } catch (err: any) {
        await sendMessage(`❌ রিওয়ার্ড ওয়ালেট ডেটা আপডেটে সমস্যা: ${err.message}`);
      }
    }, 2000);
    return;
  }

  if (text === '💼 Sell Accounts (কোম্পানি একাউন্ট বিক্রয়)' || text === '/sell') {
    await sendMessage('🛍️ <b>টাকাহাব সোশ্যাল অ্যাকাউন্ট ক্রয় পোর্টাল</b>\n\nআপনি কোন ক্যাটাগরির অ্যাকাউন্ট চ্যাটবটের মাধ্যমে সেল করে টাকা আয় করতে চান, নিচে থেকে নির্বাচন করুন:', { reply_markup: sellKeyboard });
    return;
  }

  if (text === '📧 Sell Gmail') {
    userSession.step = 'sell_gmail_email';
    userSessions.set(chatId, userSession);
    await sendMessage('📧 আপনি যে **জিমেইল অ্যাকাউন্টটি বিক্রি করতে চান**, সেটির ইমেইল আইডি সেন্ড করুন:');
    return;
  }

  if (text === '👤 Sell Facebook') {
    userSession.step = 'sell_fb_email';
    userSessions.set(chatId, userSession);
    await sendMessage('👤 আপনার বিক্রয়যোগ্য **ফেসবুক আইডি/ইমেইল/প্রাইভেট নম্বরটি** সেন্ড করুন:');
    return;
  }

  if (text === '✈️ Sell Telegram') {
    userSession.step = 'sell_tg_number';
    userSessions.set(chatId, userSession);
    await sendMessage('📞 কান্ট্রি কোড সহ আপনার বিক্রয়যোগ্য **টেলিগ্রাম নম্বরটি** টাইপ করে পাঠান (যেমন: +88017...):');
    return;
  }

  if (text === '💬 Sell WhatsApp') {
    userSession.step = 'sell_wa_number';
    userSessions.set(chatId, userSession);
    await sendMessage('📞 বিক্রয়যোগ্য **হোয়াটসঅ্যাপ নম্বরটি** প্রদান করুন (COUNTRY CODE সহ):');
    return;
  }

  if (text === '💰 Withdraw (টাকা উত্তোলন)' || text === '/withdraw') {
    // Check account status is active or inactive
    if (!userData.isActive) {
      await sendMessage('⚠️ <b>দুঃখিত! অনিবন্ধিত নিস্ক্রিয় অ্যাকাউন্ট।</b>\n\nউইথড্র আবেদন করতে আপনার অ্যাকাউন্টটি অবশ্যই সক্রিয় থাকা লাগবে। অনুগ্রহ করে সাইটে লগইন করে আপনার অ্যাকাউন্টটি সক্রিয় করুন।');
      return;
    }
    userSession.step = 'withdraw_amount';
    userSessions.set(chatId, userSession);
    await sendMessage('💰 আপনি কত টাকা উত্তোলন করতে চান? টাকার সঠিক পরিমাণ টাইপ করুন:');
    return;
  }

  if (text === '💸 Transfer Balance' || text === '/transfer') {
    userSession.step = 'transfer_email';
    userSessions.set(chatId, userSession);
    await sendMessage('💸 টাকাহাবের অন্য কোনো অ্যাকাউন্টে ব্যালেন্স পাঠাতে প্রাপকের **রেজিস্টার্ড ইমেইল অ্যাড্রেসটি** টাইপ করে সেন্ড করুন:');
    return;
  }

  if (text === '❓ Help / নির্দেশনা' || text === '/help') {
    const helpMsg = `📖 <b>টাকাহাব সিস্টেম বটে কাজের সাহায্য নির্দেশিকা:</b>\n\n` +
      `<b>১. অ্যাকাউন্ট সেল করুন সরাসরি চ্যাটেই:</b>\n` +
      `• চ্যাটে <code>📧 Sell Gmail</code> বা অন্যান্য ক্যাটাগরি সিলেক্ট করে নির্দেশনা অনুযায়ী অ্যাকাউন্ট ডিটেইলস দিন। এডমিন চেক করার পর নির্দিষ্ট ৫টি বিভাগীয় ওয়ালেটে আলাদা টাকা যোগ হবে।\n\n` +
      `<b>২. উইজার্ড ভিত্তিক উইথড্র পেমেন্ট:</b>\n` +
      `• জমানো ক্যাশ টাকা Bkash/Nagad পকেট ওয়ালেটে আনতে উইথড্র পদ্ধতি অনুসরণ করে নম্বর ও পরিমাণ দিন।\n\n` +
      `<b>৩. গতিশীল ব্যালেন্স ট্রান্সফার:</b>\n` +
      `• অন্য যেকোনো ইউজারের সঠিক জিমেইল অ্যাড্রেসে কোনো চার্জ ছাড়াই টাকা ট্রান্সফার করতে ব্যালেন্স ট্রান্সফার অপশন চাপুন।\n\n` +
      `<b>৪. প্রতিদিনের ফ্রি বোনাস স্পিন:</b>\n` +
      `• প্রতি ২৪ ঘন্টায় একবার সম্পূর্ণ ফ্রিতে স্পিন হুইল ঘুরিয়ে ক্যাশ টাকা জিতে নেওয়ার দারুণ সুযোগ!`;
    await sendMessage(helpMsg);
    return;
  }

  // Fallback default catch-all text
  await sendMessage('💡 আদেশটি বুঝতে পারিনি। সামাজিক অ্যাকাউন্ট সেল করতে বা উইথড্র রিওয়ার্ড অপশনগুলো চয়ন করতে নিচের বাটন মেনু চেপে কাজ করুন অথবা চ্যাটে /menu টাইপ করুন।', { reply_markup: mainKeyboard });
}

// ----------------- VITE DEVELOPMENT / PRODUCTION HANDLING WITH MIDDLEWARE -----------------

async function startAppServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    server.use(vite.middlewares);
    console.log('[App Setup] Mounting Vite developer server middleware.');
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    server.use(express.static(distPath));
    server.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[App Setup] Mounting static assets server for Production.');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[App Setup] Express server running seamlessly on http://localhost:${PORT}`);
  });
}

startAppServer();
