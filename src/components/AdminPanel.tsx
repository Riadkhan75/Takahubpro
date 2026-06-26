import React, { useState, useEffect } from 'react';
import { 
  db 
} from '../firebase';
import { 
  ref, 
  onValue, 
  set, 
  push, 
  update, 
  remove, 
  get 
} from 'firebase/database';
import { 
  UserData, 
  WithdrawalRequest, 
  GmailSellRequest, 
  TelegramSellRequest,
  WhatsappSellRequest,
  FacebookSellRequest,
  InstagramSellRequest,
  SocialText,
  ReferralMission, 
  HomeTask, 
  AdCampaign, 
  GlobalSettings, 
  JobSubmission, 
  ActivationRequest,
  DepositRequest,
  Job,
  ExternalWebsite,
  InvestmentPlan,
  PurchasedPlan
} from '../types';
import { 
  Home, 
  Users, 
  CheckCheck, 
  Mail, 
  Megaphone, 
  Phone, 
  Link, 
  DollarSign, 
  ListOrdered, 
  Award, 
  Settings, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  Check, 
  X, 
  Eye, 
  ArrowLeft, 
  UserX,
  CreditCard,
  User,
  ShieldCheck,
  Smartphone,
  Briefcase,
  Facebook,
  Send,
  MessageSquare,
  Instagram,
  AlertCircle,
  Globe,
  ShoppingBag,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Common Admin Panel
interface AdminPanelProps {
  adminEmail: string;
  onLogout: () => void;
  onSwitchToUser: () => void;
  onSwitchToNovaAdmin?: () => void;
}

export default function AdminPanel({ adminEmail, onLogout, onSwitchToUser, onSwitchToNovaAdmin }: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'stats' | 'users' | 'sells' | 'job-submissions' | 'activations' | 'deposits' | 'ads' | 'tasks' | 'withdraws' | 'missions' | 'settings' | 'campaigns' | 'plans' | 'admins'>('stats');
  const [sellSubTab, setSellSubTab] = useState<'gmail' | 'telegram' | 'whatsapp' | 'facebook' | 'instagram'>('gmail');

  // Investment Plans States
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [planCost, setPlanCost] = useState('');
  const [planTotalReturn, setPlanTotalReturn] = useState('');
  const [planValidityDays, setPlanValidityDays] = useState('');

  // Database Data States
  const [dbUsers, setDbUsers] = useState<UserData[]>([]);
  const [sells, setSells] = useState<GmailSellRequest[]>([]);
  const [telegramSells, setTelegramSells] = useState<TelegramSellRequest[]>([]);
  const [whatsappSells, setWhatsappSells] = useState<WhatsappSellRequest[]>([]);
  const [facebookSells, setFacebookSells] = useState<FacebookSellRequest[]>([]);
  const [instagramSells, setInstagramSells] = useState<InstagramSellRequest[]>([]);
  const [socialTexts, setSocialTexts] = useState<SocialText[]>([]);
  const [jobSubmissions, setJobSubmissions] = useState<JobSubmission[]>([]);
  const [activations, setActivations] = useState<ActivationRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdraws, setWithdraws] = useState<WithdrawalRequest[]>([]);
  const [missions, setMissions] = useState<ReferralMission[]>([]);
  const [homeTasks, setHomeTasks] = useState<HomeTask[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    minWithdraw: 50,
    referLink: window.location.origin,
    appDownloadLink: '',
    gmailOpenPass: 'Shihab@2025#',
    gmailPrice: 15,
    activationNumbers: {
      bkash: '01727172701',
      nagad: '01934984690'
    }
  });

  // Modal / Detail States
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userBalanceChangeInput, setUserBalanceChangeInput] = useState('');
  const [userBalanceTypeToEdit, setUserBalanceTypeToEdit] = useState<'main' | 'gmail' | 'telegram' | 'whatsapp' | 'facebook' | 'ads'>('main');
  
  const [selectedSubmission, setSelectedSubmission] = useState<JobSubmission | null>(null);
  const [reviewRewardInput, setReviewRewardInput] = useState('');

  const [selectedSell, setSelectedSell] = useState<GmailSellRequest | null>(null);
  const [sellPaymentInput, setSellPaymentInput] = useState('');

  const [selectedTelegramSell, setSelectedTelegramSell] = useState<TelegramSellRequest | null>(null);
  const [telegramSellPaymentInput, setTelegramSellPaymentInput] = useState('');

  const [selectedWhatsappSell, setSelectedWhatsappSell] = useState<WhatsappSellRequest | null>(null);
  const [whatsappSellPaymentInput, setWhatsappSellPaymentInput] = useState('');

  const [selectedFacebookSell, setSelectedFacebookSell] = useState<FacebookSellRequest | null>(null);
  const [facebookSellPaymentInput, setFacebookSellPaymentInput] = useState('');

  const [selectedInstagramSell, setSelectedInstagramSell] = useState<InstagramSellRequest | null>(null);
  const [instagramSellPaymentInput, setInstagramSellPaymentInput] = useState('');

  // Creation form states
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdReward, setNewAdReward] = useState('0.50');

  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskLink, setNewTaskLink] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('https://img.icons8.com/color/96/youtube-play.png');

  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionTarget, setNewMissionTarget] = useState('10');
  const [newMissionReward, setNewMissionReward] = useState('50');

  const [setMinWithdrawLimit, setSetMinWithdrawLimit] = useState('50');
  const [withdrawFeePercentState, setWithdrawFeePercentState] = useState('0');
  const [depositFeePercentState, setDepositFeePercentState] = useState('0');
  const [setMinWithdrawGmailLimit, setSetMinWithdrawGmailLimit] = useState('50');
  const [setMinWithdrawTelegramLimit, setSetMinWithdrawTelegramLimit] = useState('50');
  const [setMinWithdrawWhatsappLimit, setSetMinWithdrawWhatsappLimit] = useState('50');
  const [setMinWithdrawFacebookLimit, setSetMinWithdrawFacebookLimit] = useState('50');
  const [setMinWithdrawInstagramLimit, setSetMinWithdrawInstagramLimit] = useState('50');
  const [setMinWithdrawAdsLimit, setSetMinWithdrawAdsLimit] = useState('50');
  const [setAppDownloadUrl, setSetAppDownloadUrl] = useState('');
  const [setGmailBuyPrice, setSetGmailBuyPrice] = useState('15');
  const [setGmailOpenPassword, setSetGmailOpenPassword] = useState('Shihab@2025#');
  const [setTelegramOpenPassword, setSetTelegramOpenPassword] = useState('Shihab@2025#');
  const [setWhatsappOpenPassword, setSetWhatsappOpenPassword] = useState('Shihab@2025#');
  const [setFacebookOpenPassword, setSetFacebookOpenPassword] = useState('Shihab@2025#');
  const [setInstagramOpenPassword, setSetInstagramOpenPassword] = useState('Shihab@2025#');
  const [setTelegramBuyPrice, setSetTelegramBuyPrice] = useState('20');
  const [setWhatsappBuyPrice, setSetWhatsappBuyPrice] = useState('30');
  const [setFacebookBuyPrice, setSetFacebookBuyPrice] = useState('25');
  const [setInstagramBuyPrice, setSetInstagramBuyPrice] = useState('20');

  // Daily submit limits
  const [gmailDailyLimit, setGmailDailyLimit] = useState('0');
  const [telegramDailyLimit, setTelegramDailyLimit] = useState('0');
  const [whatsappDailyLimit, setWhatsappDailyLimit] = useState('0');
  const [facebookDailyLimit, setFacebookDailyLimit] = useState('0');
  const [instagramDailyLimit, setInstagramDailyLimit] = useState('0');

  // Tutorial Video URLs
  const [gmailTutorialUrl, setGmailTutorialUrl] = useState('');
  const [telegramTutorialUrl, setTelegramTutorialUrl] = useState('');
  const [whatsappTutorialUrl, setWhatsappTutorialUrl] = useState('');
  const [facebookTutorialUrl, setFacebookTutorialUrl] = useState('');
  const [instagramTutorialUrl, setInstagramTutorialUrl] = useState('');

  const [signupBonusEnabled, setSignupBonusEnabled] = useState(false);
  const [signupBonusAmount, setSignupBonusAmount] = useState('0');

  const [gmailMaintEnabled, setGmailMaintEnabled] = useState(false);
  const [gmailMaintMsg, setGmailMaintMsg] = useState('');
  const [telegramMaintEnabled, setTelegramMaintEnabled] = useState(false);
  const [telegramMaintMsg, setTelegramMaintMsg] = useState('');
  const [whatsappMaintEnabled, setWhatsappMaintEnabled] = useState(false);
  const [whatsappMaintMsg, setWhatsappMaintMsg] = useState('');
  const [facebookMaintEnabled, setFacebookMaintEnabled] = useState(false);
  const [facebookMaintMsg, setFacebookMaintMsg] = useState('');
  const [instagramMaintEnabled, setInstagramMaintEnabled] = useState(false);
  const [instagramMaintMsg, setInstagramMaintMsg] = useState('');

  // Additional single maintenance states
  const [jobsMaintEnabled, setJobsMaintEnabled] = useState(false);
  const [jobsMaintMsg, setJobsMaintMsg] = useState('');
  const [postJobMaintEnabled, setPostJobMaintEnabled] = useState(false);
  const [postJobMaintMsg, setPostJobMaintMsg] = useState('');
  const [postJobAdminFee, setPostJobAdminFee] = useState('0');
  const [spinMaintEnabled, setSpinMaintEnabled] = useState(false);
  const [spinMaintMsg, setSpinMaintMsg] = useState('');
  const [transferMaintEnabled, setTransferMaintEnabled] = useState(false);
  const [transferMaintMsg, setTransferMaintMsg] = useState('');
  const [depositMaintEnabled, setDepositMaintEnabled] = useState(false);
  const [depositMaintMsg, setDepositMaintMsg] = useState('');
  const [withdrawMaintEnabled, setWithdrawMaintEnabled] = useState(false);
  const [withdrawMaintMsg, setWithdrawMaintMsg] = useState('');
  const [referMaintEnabled, setReferMaintEnabled] = useState(false);
  const [referMaintMsg, setReferMaintMsg] = useState('');
  const [adsMaintEnabled, setAdsMaintEnabled] = useState(false);
  const [adsMaintMsg, setAdsMaintMsg] = useState('');
  const [missionsMaintEnabled, setMissionsMaintEnabled] = useState(false);
  const [missionsMaintMsg, setMissionsMaintMsg] = useState('');
  const [novashopMaintEnabled, setNovashopMaintEnabled] = useState(false);
  const [novashopMaintMsg, setNovashopMaintMsg] = useState('');
  const [investmentMaintEnabled, setInvestmentMaintEnabled] = useState(false);
  const [investmentMaintMsg, setInvestmentMaintMsg] = useState('');
  const [gameDailyLimit, setGameDailyLimit] = useState('5');
  const [gameFreeReward, setGameFreeReward] = useState('1');
  const [gameMaintEnabled, setGameMaintEnabled] = useState(false);
  const [gameMaintMsg, setGameMaintMsg] = useState('');
  const [scratchCardPrice, setScratchCardPrice] = useState('5');
  const [scratchDailyLimit, setScratchDailyLimit] = useState('10');
  const [scratchRewards, setScratchRewards] = useState('0.5,1,2,5,10,0.2,0.25,1.5');
  const [scratchMaintEnabled, setScratchMaintEnabled] = useState(false);
  const [scratchMaintMsg, setScratchMaintMsg] = useState('');
  const [hideMasterPasswords, setHideMasterPasswords] = useState(false);
  const [siteMaintenanceEnabled, setSiteMaintenanceEnabled] = useState(false);
  const [siteMaintenanceMessage, setSiteMaintenanceMessage] = useState('');
  const [setBkashNumber, setSetBkashNumber] = useState('01727172701');
  const [setNagadNumber, setSetNagadNumber] = useState('01934984690');
  const [activationPrice, setActivationPrice] = useState('100');
  const [setReferralRootLink, setSetReferralRootLink] = useState(window.location.origin);

  const [setGmailLastDate, setSetGmailLastDate] = useState('');
  const [setTelegramLastDate, setSetTelegramLastDate] = useState('');
  const [setWhatsappLastDate, setSetWhatsappLastDate] = useState('');
  const [setFacebookLastDate, setSetFacebookLastDate] = useState('');
  const [setInstagramLastDate, setSetInstagramLastDate] = useState('');

  // Sub-Admins Management states
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [newSubAdminEmail, setNewSubAdminEmail] = useState('');
  const [newSubAdminName, setNewSubAdminName] = useState('');
  const [newSubAdminPermissions, setNewSubAdminPermissions] = useState({
    users: true,
    sells: true,
    jobSubmissions: true,
    activations: true,
    deposits: true,
    withdraws: true,
    settings: true,
    gmailPriceSecurity: true,
    telegramPriceSecurity: true,
    whatsappPriceSecurity: true,
    facebookPriceSecurity: true,
    instagramPriceSecurity: true,
  });

  // Multi-Admin Permission Resolution
  const isSuperAdmin = adminEmail.toLowerCase().trim() === 'banglag215@gmail.com' || adminEmail.toLowerCase().trim() === 'nazrulpost75@gmail.com';
  const currentAdminSecretRecord = subAdmins.find(
    (sa) => sa.email && sa.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()
  );

  const permissions = isSuperAdmin 
    ? { 
        users: true, 
        sells: true, 
        jobSubmissions: true, 
        activations: true, 
        deposits: true,
        withdraws: true, 
        settings: true,
        gmailPriceSecurity: true,
        telegramPriceSecurity: true,
        whatsappPriceSecurity: true,
        facebookPriceSecurity: true,
        instagramPriceSecurity: true,
      }
    : (currentAdminSecretRecord?.permissions || {
        users: false,
        sells: false,
        jobSubmissions: false,
        activations: false,
        deposits: false,
        withdraws: false,
        settings: false,
        gmailPriceSecurity: false,
        telegramPriceSecurity: false,
        whatsappPriceSecurity: false,
        facebookPriceSecurity: false,
        instagramPriceSecurity: false,
      });

  // CSV Export Modal Fallback state
  const [csvPreviewData, setCsvPreviewData] = useState<string>('');
  const [csvPreviewTitle, setCsvPreviewTitle] = useState<string>('');
  const [csvPreviewOpen, setCsvPreviewOpen] = useState<boolean>(false);

  // New States inside AdminPanel
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupImageUrl, setPopupImageUrl] = useState('');
  const [popupLink, setPopupLink] = useState('');
  const [runningNotice, setRunningNotice] = useState('');
  const [emergencyEnabled, setEmergencyEnabled] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [spinRewards, setSpinRewards] = useState('0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0');

  // Support Options States
  const [supportTelegramChannel, setSupportTelegramChannel] = useState('');
  const [supportTelegramGroup, setSupportTelegramGroup] = useState('');
  const [supportTelegramAdmin, setSupportTelegramAdmin] = useState('');
  const [supportFacebookPage, setSupportFacebookPage] = useState('');
  const [supportWhatsAppNumber, setSupportWhatsAppNumber] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [freeActivationEnabled, setFreeActivationEnabled] = useState(false);
  const [adsterraDirectLink, setAdsterraDirectLink] = useState('');
  const [adsterraDirectReward, setAdsterraDirectReward] = useState('0.15');
  const [adsterraScriptCode, setAdsterraScriptCode] = useState('');
  const [adsterraDailyLimit, setAdsterraDailyLimit] = useState('10');
  const [telegramAdminBotToken, setTelegramAdminBotToken] = useState('');
  const [telegramAdminChatId, setTelegramAdminChatId] = useState('');
  
  // Telegram Bot Test Connection flow
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isTestingAdminTelegram, setIsTestingAdminTelegram] = useState(false);
  const [adminTelegramTestResult, setAdminTelegramTestResult] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Push notifications form
  const [notifHeader, setNotifHeader] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // External Websites Management States
  const [websites, setWebsites] = useState<ExternalWebsite[]>([]);
  const [webName, setWebName] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [webDescription, setWebDescription] = useState('');
  const [webIconName, setWebIconName] = useState('ShoppingBag');
  const [webAccentColor, setWebAccentColor] = useState('from-violet-600 to-indigo-700');
  const [webMaintEnabled, setWebMaintEnabled] = useState(false);
  const [webMaintMsg, setWebMaintMsg] = useState('');
  const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);

  // Missions Schedule and Category
  const [missionCategory, setMissionCategory] = useState<'referral' | 'task' | 'spin' | 'special'>('referral');
  const [missionStartDate, setMissionStartDate] = useState('');
  const [missionEndDate, setMissionEndDate] = useState('');
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  // Fullscreen Image preview State
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Withdrawal rejection option state
  const [withdrawalToReject, setWithdrawalToReject] = useState<WithdrawalRequest | null>(null);

  // Notification Toast state
  const [adminToasts, setAdminToasts] = useState<{ id: string; msg: string; status: 'success' | 'err' }[]>([]);

  const showToast = (message: string, status: 'success' | 'err' = 'success') => {
    const id = Date.now().toString();
    setAdminToasts(prev => [...prev, { id, msg: message, status }]);
    setTimeout(() => {
      setAdminToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // 1. Fetch DB lists inside Admin Panels
  useEffect(() => {
    // Sub-Admins listener
    onValue(ref(db, 'sub_admins'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adminList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })).reverse();
        setSubAdmins(adminList);
      } else {
        setSubAdmins([]);
      }
    });

    // Users
    onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.entries(data).map(([key, val]: [string, any]) => ({
          uid: key,
          ...val
        })).reverse();
        setDbUsers(usersList);
      } else {
        setDbUsers([]);
      }
    });

    // Gmail Sells
    onValue(ref(db, 'gmail_sells'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sellsList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setSells(sellsList);
      } else {
        setSells([]);
      }
    });

    // Telegram Sells
    onValue(ref(db, 'telegram_sells'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sellsList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setTelegramSells(sellsList);
      } else {
        setTelegramSells([]);
      }
    });

    // WhatsApp Sells
    onValue(ref(db, 'whatsapp_sells'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sellsList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setWhatsappSells(sellsList);
      } else {
        setWhatsappSells([]);
      }
    });

    // Facebook Sells
    onValue(ref(db, 'facebook_sells'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sellsList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setFacebookSells(sellsList);
      } else {
        setFacebookSells([]);
      }
    });

    // Instagram Sells
    onValue(ref(db, 'instagram_sells'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sellsList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setInstagramSells(sellsList);
      } else {
        setInstagramSells([]);
      }
    });

    // Custom Admin Social Texts
    onValue(ref(db, 'social_texts'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })).reverse();
        setSocialTexts(list as SocialText[]);
      } else {
        setSocialTexts([]);
      }
    });

    // Micro-job Submissions
    onValue(ref(db, 'job_submissions'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setJobSubmissions(subList);
      } else {
        setJobSubmissions([]);
      }
    });

    // Activation requests
    onValue(ref(db, 'activation_requests'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const actList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setActivations(actList);
      } else {
        setActivations([]);
      }
    });

    // Deposit requests
    onValue(ref(db, 'deposit_requests'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const depList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setDeposits(depList);
      } else {
        setDeposits([]);
      }
    });

    // Withdraw requests
    onValue(ref(db, 'withdrawals'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const wList = Object.entries(data)
          .filter(([, val]: [string, any]) => val && val.status === 'pending')
          .map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          })).reverse();
        setWithdraws(wList);
      } else {
        setWithdraws([]);
      }
    });

    // Missions
    onValue(ref(db, 'missions'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setMissions(mList);
      } else {
        setMissions([]);
      }
    });

    // Home external task shortcuts
    onValue(ref(db, 'home_tasks'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const hList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setHomeTasks(hList);
      } else {
        setHomeTasks([]);
      }
    });

    // Viewing Ads
    onValue(ref(db, 'ads'), (snapshot) => {
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

    // Micro-jobs
    onValue(ref(db, 'jobs'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setJobs(jList);
      } else {
        setJobs([]);
      }
    });

    // External Dynamic Websites
    onValue(ref(db, 'websites'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const webList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })) as ExternalWebsite[];
        setWebsites(webList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } else {
        setWebsites([]);
      }
    });

    // Investment Plans
    onValue(ref(db, 'investment_plans'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const planList = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })) as InvestmentPlan[];
        setInvestmentPlans(planList.sort((a, b) => (a.cost || 0) - (b.cost || 0)));
      } else {
        setInvestmentPlans([]);
      }
    });

    // Settings
    onValue(ref(db, 'settings'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGlobalSettings({
          minWithdraw: data.minWithdraw || 50,
          referLink: data.referLink || window.location.origin,
          appDownloadLink: data.appDownloadLink || '',
          gmailOpenPass: data.gmailOpenPass || 'Shihab@2025#',
          gmailPrice: data.gmailPrice || 15,
          telegramPrice: data.telegramPrice || 20,
          whatsappPrice: data.whatsappPrice || 30,
          facebookPrice: data.facebookPrice || 25,
          activationNumbers: data.activationNumbers || {
            bkash: '01727172701',
            nagad: '01934984690'
          },
          activationPrice: data.activationPrice || 100,
          popupEnabled: data.popupEnabled || false,
          popupTitle: data.popupTitle || '',
          popupMessage: data.popupMessage || '',
          popupImageUrl: data.popupImageUrl || '',
          runningNotice: data.runningNotice || '',
          emergencyEnabled: data.emergencyEnabled || false,
          emergencyMessage: data.emergencyMessage || '',
          siteMaintenanceEnabled: data.siteMaintenanceEnabled || false,
          siteMaintenanceMessage: data.siteMaintenanceMessage || '',
          spinRewards: data.spinRewards || '0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0',
          gmailMaintenanceEnabled: data.gmailMaintenanceEnabled || false,
          gmailMaintenanceMessage: data.gmailMaintenanceMessage || '',
          telegramMaintenanceEnabled: data.telegramMaintenanceEnabled || false,
          telegramMaintenanceMessage: data.telegramMaintenanceMessage || '',
          whatsappMaintenanceEnabled: data.whatsappMaintenanceEnabled || false,
          whatsappMaintenanceMessage: data.whatsappMaintenanceMessage || '',
          facebookMaintenanceEnabled: data.facebookMaintenanceEnabled || false,
          facebookMaintenanceMessage: data.facebookMaintenanceMessage || '',
          jobsMaintenanceEnabled: data.jobsMaintenanceEnabled || false,
          jobsMaintenanceMessage: data.jobsMaintenanceMessage || '',
          postJobMaintenanceEnabled: data.postJobMaintenanceEnabled || false,
          postJobMaintenanceMessage: data.postJobMaintenanceMessage || '',
          postJobAdminFee: data.postJobAdminFee || 0,
          spinMaintenanceEnabled: data.spinMaintenanceEnabled || false,
          spinMaintenanceMessage: data.spinMaintenanceMessage || '',
          transferMaintenanceEnabled: data.transferMaintenanceEnabled || false,
          transferMaintenanceMessage: data.transferMaintenanceMessage || '',
          depositMaintenanceEnabled: data.depositMaintenanceEnabled || false,
          depositMaintenanceMessage: data.depositMaintenanceMessage || '',
          withdrawMaintenanceEnabled: data.withdrawMaintenanceEnabled || false,
          withdrawMaintenanceMessage: data.withdrawMaintenanceMessage || '',
          referMaintenanceEnabled: data.referMaintenanceEnabled || false,
          referMaintenanceMessage: data.referMaintenanceMessage || '',
          adsMaintenanceEnabled: data.adsMaintenanceEnabled || false,
          adsMaintenanceMessage: data.adsMaintenanceMessage || '',
          missionsMaintenanceEnabled: data.missionsMaintenanceEnabled || false,
          missionsMaintenanceMessage: data.missionsMaintenanceMessage || '',
          supportTelegramChannel: data.supportTelegramChannel || '',
          supportTelegramGroup: data.supportTelegramGroup || '',
          supportTelegramAdmin: data.supportTelegramAdmin || '',
          supportFacebookPage: data.supportFacebookPage || '',
          supportWhatsAppNumber: data.supportWhatsAppNumber || '',
          hideMasterPasswords: data.hideMasterPasswords || false,
          gameDailyLimit: data.gameDailyLimit || 5,
          gameFreeReward: data.gameFreeReward || 1,
          withdrawFeePercent: data.withdrawFeePercent || 0,
          depositFeePercent: data.depositFeePercent || 0,
          gameMaintenanceEnabled: data.gameMaintenanceEnabled || false,
          gameMaintenanceMessage: data.gameMaintenanceMessage || '',
          freeActivationEnabled: data.freeActivationEnabled || false,
          adsterraDirectLink: data.adsterraDirectLink || '',
          adsterraDirectReward: data.adsterraDirectReward || 0.15,
          adsterraScriptCode: data.adsterraScriptCode || '',
          adsterraDailyLimit: data.adsterraDailyLimit || 10,
          minWithdrawAds: data.minWithdrawAds || 50,
          gmailLastDate: data.gmailLastDate || '',
          telegramLastDate: data.telegramLastDate || '',
          whatsappLastDate: data.whatsappLastDate || '',
          facebookLastDate: data.facebookLastDate || '',
          instagramLastDate: data.instagramLastDate || '',
          gmailDailyLimit: data.gmailDailyLimit || 0,
          telegramDailyLimit: data.telegramDailyLimit || 0,
          whatsappDailyLimit: data.whatsappDailyLimit || 0,
          facebookDailyLimit: data.facebookDailyLimit || 0,
          instagramDailyLimit: data.instagramDailyLimit || 0,
          gmailTutorialUrl: data.gmailTutorialUrl || '',
          telegramTutorialUrl: data.telegramTutorialUrl || '',
          whatsappTutorialUrl: data.whatsappTutorialUrl || '',
          facebookTutorialUrl: data.facebookTutorialUrl || '',
          instagramTutorialUrl: data.instagramTutorialUrl || '',
        });

        // Seed inputs
        setSetMinWithdrawLimit(String(data.minWithdraw || 50));
        setWithdrawFeePercentState(String(data.withdrawFeePercent || 0));
        setDepositFeePercentState(String(data.depositFeePercent || 0));
        setSetMinWithdrawGmailLimit(String(data.minWithdrawGmail || 50));
        setSetMinWithdrawTelegramLimit(String(data.minWithdrawTelegram || 50));
        setSetMinWithdrawWhatsappLimit(String(data.minWithdrawWhatsapp || 50));
        setSetMinWithdrawFacebookLimit(String(data.minWithdrawFacebook || 50));
        setSetMinWithdrawInstagramLimit(String(data.minWithdrawInstagram || 50));
        setSetMinWithdrawAdsLimit(String(data.minWithdrawAds || 50));
        setSetAppDownloadUrl(data.appDownloadLink || '');
        setSetGmailBuyPrice(String(data.gmailPrice || 15));
        setSetGmailOpenPassword(data.gmailOpenPass || 'Shihab@2025#');
        setSetTelegramOpenPassword(data.telegramOpenPass || 'Shihab@2025#');
        setSetWhatsappOpenPassword(data.whatsappOpenPass || 'Shihab@2025#');
        setSetFacebookOpenPassword(data.facebookOpenPass || 'Shihab@2025#');
        setSetInstagramOpenPassword(data.instagramOpenPass || 'Shihab@2025#');
        setSetTelegramBuyPrice(String(data.telegramPrice || 20));
        setSetWhatsappBuyPrice(String(data.whatsappPrice || 30));
        setSetFacebookBuyPrice(String(data.facebookPrice || 25));
        setSetInstagramBuyPrice(String(data.instagramPrice || 20));

        setGmailDailyLimit(String(data.gmailDailyLimit || 0));
        setTelegramDailyLimit(String(data.telegramDailyLimit || 0));
        setWhatsappDailyLimit(String(data.whatsappDailyLimit || 0));
        setFacebookDailyLimit(String(data.facebookDailyLimit || 0));
        setInstagramDailyLimit(String(data.instagramDailyLimit || 0));

        setGmailTutorialUrl(data.gmailTutorialUrl || '');
        setTelegramTutorialUrl(data.telegramTutorialUrl || '');
        setWhatsappTutorialUrl(data.whatsappTutorialUrl || '');
        setFacebookTutorialUrl(data.facebookTutorialUrl || '');
        setInstagramTutorialUrl(data.instagramTutorialUrl || '');

        setSignupBonusEnabled(data.signupBonusEnabled || false);
        setSignupBonusAmount(String(data.signupBonusAmount || 0));

        setGameDailyLimit(String(data.gameDailyLimit || 5));
        setGameFreeReward(String(data.gameFreeReward || 1));
        setScratchCardPrice(String(data.scratchCardPrice || 5));
        setScratchDailyLimit(String(data.scratchDailyLimit || 10));
        setScratchRewards(data.scratchRewards || '0.5,1,2,5,10,0.2,0.25,1.5');
        setScratchMaintEnabled(data.scratchMaintenanceEnabled || false);
        setScratchMaintMsg(data.scratchMaintenanceMessage || '');

        // Seed support options
        setSupportTelegramChannel(data.supportTelegramChannel || '');
        setSupportTelegramGroup(data.supportTelegramGroup || '');
        setSupportTelegramAdmin(data.supportTelegramAdmin || '');
        setSupportFacebookPage(data.supportFacebookPage || '');
        setSupportWhatsAppNumber(data.supportWhatsAppNumber || '');
        setTelegramBotToken(data.telegramBotToken || '');
        setTelegramChatId(data.telegramChatId || '');
        setTelegramAdminBotToken(data.telegramAdminBotToken || '');
        setTelegramAdminChatId(data.telegramAdminChatId || '');

        setGmailMaintEnabled(data.gmailMaintenanceEnabled || false);
        setGmailMaintMsg(data.gmailMaintenanceMessage || '');
        setTelegramMaintEnabled(data.telegramMaintenanceEnabled || false);
        setTelegramMaintMsg(data.telegramMaintenanceMessage || '');
        setWhatsappMaintEnabled(data.whatsappMaintenanceEnabled || false);
        setWhatsappMaintMsg(data.whatsappMaintenanceMessage || '');
        setFacebookMaintEnabled(data.facebookMaintenanceEnabled || false);
        setFacebookMaintMsg(data.facebookMaintenanceMessage || '');
        setInstagramMaintEnabled(data.instagramMaintenanceEnabled || false);
        setInstagramMaintMsg(data.instagramMaintenanceMessage || '');

        setJobsMaintEnabled(data.jobsMaintenanceEnabled || false);
        setJobsMaintMsg(data.jobsMaintenanceMessage || '');
        setPostJobMaintEnabled(data.postJobMaintenanceEnabled || false);
        setPostJobMaintMsg(data.postJobMaintenanceMessage || '');
        setPostJobAdminFee(String(data.postJobAdminFee || 0));
        setSpinMaintEnabled(data.spinMaintenanceEnabled || false);
        setSpinMaintMsg(data.spinMaintenanceMessage || '');
        setTransferMaintEnabled(data.transferMaintenanceEnabled || false);
        setTransferMaintMsg(data.transferMaintenanceMessage || '');
        setDepositMaintEnabled(data.depositMaintenanceEnabled || false);
        setDepositMaintMsg(data.depositMaintenanceMessage || '');
        setWithdrawMaintEnabled(data.withdrawMaintenanceEnabled || false);
        setWithdrawMaintMsg(data.withdrawMaintenanceMessage || '');
        setReferMaintEnabled(data.referMaintenanceEnabled || false);
        setReferMaintMsg(data.referMaintenanceMessage || '');
        setAdsMaintEnabled(data.adsMaintenanceEnabled || false);
        setAdsMaintMsg(data.adsMaintenanceMessage || '');
        setMissionsMaintEnabled(data.missionsMaintenanceEnabled || false);
        setMissionsMaintMsg(data.missionsMaintenanceMessage || '');
        setNovashopMaintEnabled(data.novashopMaintenanceEnabled || false);
        setNovashopMaintMsg(data.novashopMaintenanceMessage || '');
        setInvestmentMaintEnabled(data.investmentMaintenanceEnabled || false);
        setInvestmentMaintMsg(data.investmentMaintenanceMessage || '');
        setGameMaintEnabled(data.gameMaintenanceEnabled || false);
        setGameMaintMsg(data.gameMaintenanceMessage || 'গেম সাময়িক রক্ষণাবেক্ষণের কারণে বন্ধ আছে।');

        setSetReferralRootLink(data.referLink || window.location.origin);
        setActivationPrice(String(data.activationPrice || 100));
        if (data.activationNumbers) {
          setSetBkashNumber(data.activationNumbers.bkash || '01727172701');
          setSetNagadNumber(data.activationNumbers.nagad || '01934984690');
        }

        // Seed new admin inputs
        setPopupEnabled(data.popupEnabled || false);
        setPopupTitle(data.popupTitle || '');
        setPopupMessage(data.popupMessage || '');
        setPopupImageUrl(data.popupImageUrl || '');
        setPopupLink(data.popupLink || '');
        setRunningNotice(data.runningNotice || '');
        setEmergencyEnabled(data.emergencyEnabled || false);
        setEmergencyMessage(data.emergencyMessage || '');
        setSiteMaintenanceEnabled(data.siteMaintenanceEnabled || false);
        setSiteMaintenanceMessage(data.siteMaintenanceMessage || '');
        setSpinRewards(data.spinRewards || '0.5,1.0,2.0,5.0,10.0,0.1,0.25,0.0');
        setHideMasterPasswords(data.hideMasterPasswords || false);
        setFreeActivationEnabled(data.freeActivationEnabled || false);
        setAdsterraDirectLink(data.adsterraDirectLink || '');
        setAdsterraDirectReward(String(data.adsterraDirectReward ?? '0.15'));
        setAdsterraScriptCode(data.adsterraScriptCode || '');
        setAdsterraDailyLimit(String(data.adsterraDailyLimit || 10));

        setSetGmailLastDate(data.gmailLastDate || '');
        setSetTelegramLastDate(data.telegramLastDate || '');
        setSetWhatsappLastDate(data.whatsappLastDate || '');
        setSetFacebookLastDate(data.facebookLastDate || '');
        setSetInstagramLastDate(data.instagramLastDate || '');
      }
    });
  }, []);

  // --- EXPORT DEAL DATABASES TO CSV SPREADSHEET ---
  const handleExportSellsCSV = (platform: 'gmail' | 'telegram' | 'whatsapp' | 'facebook' | 'instagram' | 'users' | 'withdraws') => {
    let dataToExport: any[] = [];
    let headers: string[] = [];
    let rowMapper: (item: any) => string[] = () => [];
    let title = '';

    const formatDate = (ts: number) => {
      if (!ts) return '';
      return new Date(ts).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });
    };

    if (platform === 'gmail') {
      title = 'TakaHub_Gmail_Sells';
      dataToExport = sells;
      headers = ['ID', 'User ID', 'Seller Username', 'Gmail Account Email', 'Password', 'Status', 'Timestamp'];
      rowMapper = (item: GmailSellRequest) => [
        item.id || '',
        item.userId || '',
        item.username || '',
        item.email || '',
        item.password || '',
        item.status || 'pending',
        formatDate(item.timestamp)
      ];
    } else if (platform === 'telegram') {
      title = 'TakaHub_Telegram_Sells';
      dataToExport = telegramSells;
      headers = ['ID', 'User ID', 'Seller Username', 'Telegram Number', 'Extra Details/Credentials', 'Status', 'Timestamp'];
      rowMapper = (item: TelegramSellRequest) => [
        item.id || '',
        item.userId || '',
        item.username || '',
        item.number || '',
        item.details || '',
        item.status || 'pending',
        formatDate(item.timestamp)
      ];
    } else if (platform === 'whatsapp') {
      title = 'TakaHub_WhatsApp_Sells';
      dataToExport = whatsappSells;
      headers = ['ID', 'User ID', 'Seller Username', 'WhatsApp Number', 'Extra Details/Credentials', 'Status', 'Timestamp'];
      rowMapper = (item: WhatsappSellRequest) => [
        item.id || '',
        item.userId || '',
        item.username || '',
        item.number || '',
        item.details || '',
        item.status || 'pending',
        formatDate(item.timestamp)
      ];
    } else if (platform === 'facebook') {
      title = 'TakaHub_Facebook_Sells';
      dataToExport = facebookSells;
      headers = ['ID', 'User ID', 'Seller Username', 'FaceBook Email/ID', 'Password', '2FA Backup Key', 'Status', 'Timestamp'];
      rowMapper = (item: FacebookSellRequest) => [
        item.id || '',
        item.userId || '',
        item.username || '',
        item.email || '',
        item.password || '',
        item.twoFactor || '',
        item.status || 'pending',
        formatDate(item.timestamp)
      ];
    } else if (platform === 'instagram') {
      title = 'TakaHub_Instagram_Sells';
      dataToExport = instagramSells;
      headers = ['ID', 'User ID', 'Seller Username', 'Instagram Email/Username', 'Password', '2FA Backup Key/Recovery', 'Status', 'Timestamp'];
      rowMapper = (item: InstagramSellRequest) => [
        item.id || '',
        item.userId || '',
        item.username || '',
        item.email || '',
        item.password || '',
        item.twoFactor || '',
        item.status || 'pending',
        formatDate(item.timestamp)
      ];
    } else if (platform === 'users') {
      title = 'TakaHub_Active_Users';
      dataToExport = dbUsers;
      headers = ['UID', 'Username', 'Email', 'Main Balance', 'Gmail Balance', 'Telegram Balance', 'WhatsApp Balance', 'Facebook Balance', 'Ads Balance', 'Is Active', 'Refer Code', 'Total Refers', 'Device ID', 'Is Banned'];
      rowMapper = (item: UserData) => [
        item.uid || '',
        item.username || '',
        item.email || '',
        String(item.balance || 0),
        String(item.gmailBalance || 0),
        String(item.telegramBalance || 0),
        String(item.whatsappBalance || 0),
        String(item.facebookBalance || 0),
        String(item.adsBalance || 0),
        item.isActive ? 'Yes' : 'No',
        item.referCode || '',
        String(item.totalRefers || 0),
        item.deviceId || '',
        item.isBanned ? 'Yes' : 'No'
      ];
    } else if (platform === 'withdraws') {
      title = 'TakaHub_Withdrawals';
      dataToExport = withdraws;
      headers = ['ID', 'User ID', 'User Email', 'Mobile Bank Method', 'Recipient Number', 'Amount (BDT)', 'Status', 'Balance Type', 'Timestamp'];
      rowMapper = (item: WithdrawalRequest) => [
        item.id || '',
        item.userId || '',
        item.email || '',
        item.method || '',
        item.number || '',
        String(item.amount || 0),
        item.status || '',
        item.balanceType || 'main',
        formatDate(item.timestamp)
      ];
    }

    if (dataToExport.length === 0) {
      showToast('ডাউনলোড করার মত কোনো রেকর্ড পাওয়া যায়নি!', 'err');
      return;
    }

    const content = [
      headers.join(','),
      ...dataToExport.map(item => rowMapper(item).map(val => {
        const stringVal = String(val === undefined || val === null ? '' : val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(','))
    ].join('\n');

    try {
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${title}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct file download blocked or failed, fallback copy dialogue is opening:", err);
    }

    setCsvPreviewData(content);
    setCsvPreviewTitle(`${title}_${new Date().toISOString().split('T')[0]}.csv`);
    setCsvPreviewOpen(true);
    showToast('স্প্রেডশিট ডাউনলোড করা হয়েছে! কপি করার উইন্ডোও খোলা হয়েছে।', 'success');
  };

  // --- SUB-ADMIN CONTROL CRUD HANDLERS ---
  const handleAddSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('শুধুমাত্র সুপার এডমিন নতুন এডমিন নিয়োগ করতে পারবে!', 'err');
      return;
    }

    const email = newSubAdminEmail.trim().toLowerCase();
    const name = newSubAdminName.trim();

    if (!email || !name) {
      showToast('সব বক্সে সঠিক তথ্য দিন', 'err');
      return;
    }

    // Verify sub-admin does not already exist with this email
    const exists = subAdmins.some(sa => sa.email.toLowerCase().trim() === email);
    if (exists) {
      showToast('এই এডমিন ইতিপূর্বেই নিযুক্ত আছেন!', 'err');
      return;
    }

    try {
      const subAdminRef = ref(db, 'sub_admins');
      const newAdminRef = push(subAdminRef);
      
      await set(newAdminRef, {
        id: newAdminRef.key,
        email,
        name,
        permissions: newSubAdminPermissions,
        addedAt: Date.now()
      });

      showToast('নতুন এডমিন সফলভাবে নিযুক্ত করা হয়েছে!', 'success');
      setNewSubAdminEmail('');
      setNewSubAdminName('');
      setNewSubAdminPermissions({
        users: true,
        sells: true,
        jobSubmissions: true,
        activations: true,
        withdraws: true,
        settings: true,
        gmailPriceSecurity: true,
        telegramPriceSecurity: true,
        whatsappPriceSecurity: true,
        facebookPriceSecurity: true,
        instagramPriceSecurity: true,
      });
    } catch (err) {
      console.error(err);
      showToast('এডমিন নিয়োগে ত্রুটি হয়েছে', 'err');
    }
  };

  const handleToggleSubAdminPermission = async (adminId: string, permissionName: keyof typeof newSubAdminPermissions) => {
    if (!isSuperAdmin) {
      showToast('শুধুমাত্র সুপার এডমিন পারমিশন পরিবর্তন করতে পারবে!', 'err');
      return;
    }

    const target = subAdmins.find(sa => sa.id === adminId);
    if (!target) return;

    try {
      const updatedPermissions = {
        ...target.permissions,
        [permissionName]: !target.permissions[permissionName]
      };

      await set(ref(db, `sub_admins/${adminId}/permissions`), updatedPermissions);
      showToast('পারমিশন সফলভাবে আপডেট করা হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('পারমিশন পরিবর্তনে ত্রুটি হয়েছে', 'err');
    }
  };

  const handleDeleteSubAdmin = async (adminId: string) => {
    if (!isSuperAdmin) {
      showToast('শুধুমাত্র সুপার এডমিন সাব-এডমিন অপসারণ করতে পারবে!', 'err');
      return;
    }

    try {
      await remove(ref(db, `sub_admins/${adminId}`));
      showToast('সাব-এডমিন সফলভাবে অপসারণ করা হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('এডমিন অপসারণে ত্রুটি হয়েছে', 'err');
    }
  };

  // --- ACTIVATE/APPROVE TRx USER ACTIVATION REQUESTS ---
  const handleApproveActivation = async (request: ActivationRequest) => {
    try {
      // 1. Mark requesting user as active = true
      const userRef = ref(db, `users/${request.userId}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        showToast('ইউজার ডেটাবেজে পাওয়া যায়নি', 'err');
        return;
      }

      const userData: UserData = userSnapshot.val();

      await update(userRef, {
        isActive: true,
        verificationStatus: 'approved'
      });

      // 2. Clear activation request
      await remove(ref(db, `activation_requests/${request.id}`));

      // 3. Referral processing fee structure: Credit sender ৳10
      if (userData.referredBy) {
        // Query users table to find who owns this referral code
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          const allUsers = usersSnapshot.val();
          const referrerEntry = Object.entries(allUsers).find(
            ([, u]: [string, any]) => u.referCode === userData.referredBy
          );

          if (referrerEntry) {
            const referrerUid = referrerEntry[0];
            const referrerData = referrerEntry[1] as UserData;
            
            // Add ৳10 rewards, increment referred counts
            await update(ref(db, `users/${referrerUid}`), {
              balance: (referrerData.balance || 0) + 10,
              totalRefers: (referrerData.totalRefers || 0) + 1
            });

            showToast('মেম্বার একটিভ হয়েছে এবং রেফার বোনাস প্রদান করা হয়েছে!', 'success');
            return;
          }
        }
      }

      showToast('মেম্বার সফলভাবে একটিভেট করা হয়েছে!', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleRejectActivation = async (request: ActivationRequest) => {
    try {
      await update(ref(db, `users/${request.userId}`), {
        verificationStatus: 'rejected'
      });
      await remove(ref(db, `activation_requests/${request.id}`));
      showToast('একটিভেশন অনুরোধ বাতিল করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  // --- ACTIVATE/APPROVE DEPOSIT REQUESTS ---
  const handleApproveDeposit = async (request: DepositRequest) => {
    try {
      const userRef = ref(db, `users/${request.userId}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        showToast('ইউজার ডেটাবেজে পাওয়া যায়নি', 'err');
        return;
      }

      const userData: UserData = userSnapshot.val();
      const feePercent = request.feePercent !== undefined ? request.feePercent : (globalSettings.depositFeePercent || 0);
      const creditAmount = request.netAmount !== undefined 
        ? request.netAmount 
        : (request.amount - ((request.amount * feePercent) / 100));

      // Update user main balance
      await update(userRef, {
        balance: (userData.balance || 0) + creditAmount
      });

      // Update status of deposit request to approved instead of removing
      await update(ref(db, `deposit_requests/${request.id}`), {
        status: 'approved'
      });

      // Record in wallet history
      const historyRef = push(ref(db, `wallet_history/${request.userId}`));
      await set(historyRef, {
        id: historyRef.key,
        userId: request.userId,
        amount: creditAmount,
        type: 'deposit',
        purpose: request.netAmount !== undefined && request.feeAmount && request.feeAmount > 0 
          ? `ডিপোজিট সফলভাবে সম্পন্ন হয়েছে (ফি বাদে ৳${creditAmount.toFixed(1)})`
          : 'ডিপোজিট সফলভাবে সম্পন্ন হয়েছে (এডমিন অনুমোদিত)',
        timestamp: Date.now()
      });

      // Push notification history
      const notifRef = push(ref(db, `notification_history/${request.userId}`));
      await set(notifRef, {
        id: notifRef.key,
        userId: request.userId,
        title: 'ডিপোজিট সফল হয়েছে! 🎉',
        body: request.netAmount !== undefined && request.feeAmount && request.feeAmount > 0
          ? `অভিনন্দন! আপনার ৳${request.amount} ডিপোজিট অনুরোধটি অনুমোদন করা হয়েছে এবং ফি বাদে ৳${creditAmount.toFixed(1)} আপনার মূল ব্যালেন্সে যোগ করা হয়েছে।`
          : `অভিনন্দন! আপনার ৳${request.amount} ডিপোজিট অনুরোধটি সফলভাবে অনমোদন করা হয়েছে এবং মূল ব্যালেন্সে যোগ করা হয়েছে।`,
        timestamp: Date.now(),
        read: false
      });

      showToast('ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে এবং ব্যালেন্স যোগ করা হয়েছে!', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleRejectDeposit = async (request: DepositRequest) => {
    try {
      await update(ref(db, `deposit_requests/${request.id}`), {
        status: 'rejected'
      });

      // Push notification history for refusal
      const notifRef = push(ref(db, `notification_history/${request.userId}`));
      await set(notifRef, {
        id: notifRef.key,
        userId: request.userId,
        title: 'ডিপোজিট অনুরোধ বাতিল করা হয়েছে ❌',
        body: `দুঃখিত! আপনার ৳${request.amount} ডিপোজিট অনুরোধটি বাতিল করা হয়েছে। সঠিক তথ্য প্রদান করে পুনরায় চেষ্টা করুন।`,
        timestamp: Date.now(),
        read: false
      });

      showToast('ডিপোজিট অনুরোধ বাতিল করা হয়েছে!', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  // --- MANUAL USER BALANCE UPDATE ---
  const handleUpdateBalance = async (action: 'add' | 'deduct') => {
    if (!selectedUser || !selectedUser.uid) return;
    const value = parseFloat(userBalanceChangeInput);
    if (isNaN(value) || value <= 0) {
      showToast('সঠিক ব্যালেন্স লিখুন', 'err');
      return;
    }

    try {
      const field = userBalanceTypeToEdit === 'gmail' ? 'gmailBalance'
                  : userBalanceTypeToEdit === 'telegram' ? 'telegramBalance'
                  : userBalanceTypeToEdit === 'whatsapp' ? 'whatsappBalance'
                  : userBalanceTypeToEdit === 'facebook' ? 'facebookBalance'
                  : userBalanceTypeToEdit === 'ads' ? 'adsBalance'
                  : 'balance';

      const currentBalance = (selectedUser as any)[field] || 0;
      let newBalance = currentBalance;
      if (action === 'add') {
        newBalance += value;
      } else {
        newBalance = Math.max(0, currentBalance - value);
      }

      await update(ref(db, `users/${selectedUser.uid}`), {
        [field]: newBalance
      });

      setSelectedUser(prev => prev ? { ...prev, [field]: newBalance } : null);
      setUserBalanceChangeInput('');
      showToast('ব্যালেন্স পরিবর্তন সফল হয়েছে!', 'success');
    } catch (e: any) {
      showToast('ব্যর্থতা: ' + e.message, 'err');
    }
  };

  const handleToggleBan = async () => {
    if (!selectedUser || !selectedUser.uid) return;
    try {
      const nextBanStatus = !selectedUser.isBanned;
      await update(ref(db, `users/${selectedUser.uid}`), {
        isBanned: nextBanStatus
      });
      setSelectedUser(prev => prev ? { ...prev, isBanned: nextBanStatus } : null);
      showToast(nextBanStatus ? 'ইউজার সফলভাবে ব্যান করা হয়েছে।' : 'ইউজার সফলভাবে আনব্যান করা হয়েছে।', 'success');
    } catch (e: any) {
      showToast('ব্যর্থতা: ' + e.message, 'err');
    }
  };

  // --- GMAIL REWARDS PAYOUTS ---
  const handleApproveGmailSell = async () => {
    if (!selectedSell) return;
    const payAmt = parseFloat(sellPaymentInput);
    if (isNaN(payAmt) || payAmt <= 0) {
      showToast('সঠিক টাকা প্রদান করুন', 'err');
      return;
    }

    try {
      // 1. Look up user account
      const userRef = ref(db, `users/${selectedSell.userId}`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.val();
        await update(userRef, {
          gmailBalance: (uData.gmailBalance || 0) + payAmt
        });
      }

      // 2. Remove selling requests
      await remove(ref(db, `gmail_sells/${selectedSell.id}`));

      // 3. Clear modal state
      setSelectedSell(null);
      setSellPaymentInput('');
      showToast(`জিমেইল সফলভাবে কেনা হয়েছে! ৳${payAmt} ইউজারকে দেওয়া হয়েছে।`, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeclineGmailSell = async () => {
    if (!selectedSell) return;
    try {
      await remove(ref(db, `gmail_sells/${selectedSell.id}`));
      setSelectedSell(null);
      showToast('জিমেইল বিক্রয় অনুরোধ বাতিল করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleApproveTelegramSell = async () => {
    if (!selectedTelegramSell) return;
    const payAmt = parseFloat(telegramSellPaymentInput);
    if (isNaN(payAmt) || payAmt <= 0) {
      showToast('সঠিক টাকা প্রদান করুন', 'err');
      return;
    }

    try {
      const userRef = ref(db, `users/${selectedTelegramSell.userId}`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.val();
        await update(userRef, {
          telegramBalance: (uData.telegramBalance || 0) + payAmt
        });
      }

      await remove(ref(db, `telegram_sells/${selectedTelegramSell.id}`));
      setSelectedTelegramSell(null);
      setTelegramSellPaymentInput('');
      showToast(`টেলিগ্রাম সফলভাবে কেনা হয়েছে! ৳${payAmt} ইউজারকে দেওয়া হয়েছে।`, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeclineTelegramSell = async () => {
    if (!selectedTelegramSell) return;
    try {
      await remove(ref(db, `telegram_sells/${selectedTelegramSell.id}`));
      setSelectedTelegramSell(null);
      showToast('টেলিগ্রাম বিক্রয় অনুরোধ বাতিল করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleApproveWhatsappSell = async () => {
    if (!selectedWhatsappSell) return;
    const payAmt = parseFloat(whatsappSellPaymentInput);
    if (isNaN(payAmt) || payAmt <= 0) {
      showToast('সঠিক টাকা প্রদান করুন', 'err');
      return;
    }

    try {
      const userRef = ref(db, `users/${selectedWhatsappSell.userId}`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.val();
        await update(userRef, {
          whatsappBalance: (uData.whatsappBalance || 0) + payAmt
        });
      }

      await remove(ref(db, `whatsapp_sells/${selectedWhatsappSell.id}`));
      setSelectedWhatsappSell(null);
      setWhatsappSellPaymentInput('');
      showToast(`হোয়াটসঅ্যাপ সফলভাবে কেনা হয়েছে! ৳${payAmt} ইউজারকে দেওয়া হয়েছে।`, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeclineWhatsappSell = async () => {
    if (!selectedWhatsappSell) return;
    try {
      await remove(ref(db, `whatsapp_sells/${selectedWhatsappSell.id}`));
      setSelectedWhatsappSell(null);
      showToast('হোয়াটসঅ্যাপ বিক্রয় অনুরোধ বাতিল করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleApproveFacebookSell = async () => {
    if (!selectedFacebookSell) return;
    const payAmt = parseFloat(facebookSellPaymentInput);
    if (isNaN(payAmt) || payAmt <= 0) {
      showToast('সঠিক টাকা প্রদান করুন', 'err');
      return;
    }

    try {
      const userRef = ref(db, `users/${selectedFacebookSell.userId}`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.val();
        await update(userRef, {
          facebookBalance: (uData.facebookBalance || 0) + payAmt
        });
      }

      await remove(ref(db, `facebook_sells/${selectedFacebookSell.id}`));
      setSelectedFacebookSell(null);
      setFacebookSellPaymentInput('');
      showToast(`ফেসবুক সফলভাবে কেনা হয়েছে! ৳${payAmt} ইউজারকে দেওয়া হয়েছে।`, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeclineFacebookSell = async () => {
    if (!selectedFacebookSell) return;
    try {
      await remove(ref(db, `facebook_sells/${selectedFacebookSell.id}`));
      setSelectedFacebookSell(null);
      showToast('ফেসবুক বিক্রয় অনুরোধ বাতিল করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleApproveInstagramSell = async () => {
    if (!selectedInstagramSell) return;
    const payAmt = parseFloat(instagramSellPaymentInput);
    if (isNaN(payAmt) || payAmt <= 0) {
      showToast('সঠিক টাকা প্রদান করুন', 'err');
      return;
    }

    try {
      const userRef = ref(db, `users/${selectedInstagramSell.userId}`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.val();
        await update(userRef, {
          instagramBalance: (uData.instagramBalance || 0) + payAmt
        });
      }

      await remove(ref(db, `instagram_sells/${selectedInstagramSell.id}`));
      setSelectedInstagramSell(null);
      setInstagramSellPaymentInput('');
      showToast(`ইন্সটাগ্রাম সফলভাবে কেনা হয়েছে! ৳${payAmt} ইউজারকে দেওয়া হয়েছে।`, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeclineInstagramSell = async () => {
    if (!selectedInstagramSell) return;
    try {
      await remove(ref(db, `instagram_sells/${selectedInstagramSell.id}`));
      setSelectedInstagramSell(null);
      showToast('ইন্সটাগ্রাম বিক্রয় অনুরোধ বাতিল করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  // --- SUBMISSIONS WORK CHECKS ---
  const handleApproveSubmission = async () => {
    if (!selectedSubmission) return;
    const rewardAmt = parseFloat(reviewRewardInput);
    if (isNaN(rewardAmt) || rewardAmt <= 0) {
      showToast('সঠিক পুরস্কার দিন', 'err');
      return;
    }

    try {
      // Add money to worker balance
      const workerRef = ref(db, `users/${selectedSubmission.workerId}`);
      const s = await get(workerRef);
      if (s.exists()) {
        const wData = s.val();
        await update(workerRef, {
          balance: (wData.balance || 0) + rewardAmt
        });
      }

      // Clear from job_submissions list
      await remove(ref(db, `job_submissions/${selectedSubmission.id}`));
      setSelectedSubmission(null);
      setReviewRewardInput('');
      showToast(`জব সাবমিশনটি এপ্রুভ হয়েছে এবং ৳${rewardAmt} দেওয়া হয়েছে!`, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeclineSubmission = async () => {
    if (!selectedSubmission) return;
    try {
      await remove(ref(db, `job_submissions/${selectedSubmission.id}`));
      setSelectedSubmission(null);
      showToast('সাবমিশন রিজেক্ট ও ডিলিট করা হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  // --- CAMPAIGNS & SHORTCUTS ADDERS ---
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdLink.trim()) {
      showToast('সব তথ্য দিন', 'err');
      return;
    }

    try {
      const adsRef = ref(db, 'ads');
      const newAdRef = push(adsRef);
      await set(newAdRef, {
        id: newAdRef.key,
        title: newAdTitle.trim(),
        link: newAdLink.trim(),
        reward: parseFloat(newAdReward) || 0.50,
        timestamp: Date.now()
      });

      setNewAdTitle('');
      setNewAdLink('');
      setNewAdReward('0.50');
      showToast('বিজ্ঞাপন সফলভাবে যোগ হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeleteAd = (id: string) => {
    setConfirmState({
      title: 'বিজ্ঞাপন ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই বিজ্ঞাপনটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await remove(ref(db, `ads/${id}`));
          showToast('বিজ্ঞাপন মুছে ফেলা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  const handleDeleteJob = (id: string) => {
    setConfirmState({
      title: 'মাইক্রো জব ক্যাম্পেইন ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই মাইক্রো জব ক্যাম্পেইনটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await remove(ref(db, `jobs/${id}`));
          showToast('ক্যাম্পেইন সফলভাবে ডিলিট করা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  const handleAddTaskShort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !newTaskLink.trim()) {
      showToast('মেম্বার কাজের বিবরণ দিন', 'err');
      return;
    }

    try {
      const tasksRef = ref(db, 'home_tasks');
      const newTaskRef = push(tasksRef);
      await set(newTaskRef, {
        id: newTaskRef.key,
        icon: newTaskIcon,
        name: newTaskName.trim(),
        link: newTaskLink.trim()
      });

      setNewTaskName('');
      setNewTaskLink('');
      showToast('কাজ সফলভাবে হোমপেজে যুক্ত হয়েছে', 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeleteTaskShort = (id: string) => {
    setConfirmState({
      title: 'কাজ ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই কাজটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await remove(ref(db, `home_tasks/${id}`));
          showToast('কাজটি মুছে ফেলা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  const handleAddMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim()) {
      showToast('মিশন টাইটেল দিন', 'err');
      return;
    }

    try {
      if (editingMissionId) {
        // Edit existing mission representation
        await set(ref(db, `missions/${editingMissionId}`), {
          id: editingMissionId,
          title: newMissionTitle.trim(),
          target: parseInt(newMissionTarget) || 10,
          reward: parseFloat(newMissionReward) || 50,
          category: missionCategory,
          startDate: missionStartDate || '',
          endDate: missionEndDate || ''
        });
        setEditingMissionId(null);
        showToast('মিশন আপডেট সম্পূর্ণ হয়েছে!', 'success');
      } else {
        // Create new mission record
        const missionsRef = ref(db, 'missions');
        const newMRef = push(missionsRef);
        await set(newMRef, {
          id: newMRef.key,
          title: newMissionTitle.trim(),
          target: parseInt(newMissionTarget) || 10,
          reward: parseFloat(newMissionReward) || 50,
          category: missionCategory,
          startDate: missionStartDate || '',
          endDate: missionEndDate || ''
        });
        showToast('মিশন তৈরি হয়েছে!', 'success');
      }

      setNewMissionTitle('');
      setNewMissionTarget('10');
      setNewMissionReward('50');
      setMissionCategory('referral');
      setMissionStartDate('');
      setMissionEndDate('');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleDeleteMission = (id: string) => {
    setConfirmState({
      title: 'মিশন ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই মিশনটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await remove(ref(db, `missions/${id}`));
          showToast('মিশনটি মুছে ফেলা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  // --- EXTERNAL WEBSITES MANAGEMENT HANDLERS ---
  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webName.trim() || !webUrl.trim() || !webDescription.trim()) {
      showToast('সব তথ্য দিন (নাম, ইউআরএল ও বিবরণ বাধ্যতামূলক)', 'err');
      return;
    }

    try {
      if (editingWebsiteId) {
        // Edit Mode
        const webRef = ref(db, `websites/${editingWebsiteId}`);
        await update(webRef, {
          name: webName.trim(),
          url: webUrl.trim(),
          description: webDescription.trim(),
          iconName: webIconName,
          accentColor: webAccentColor,
          maintenanceEnabled: webMaintEnabled,
          maintenanceMessage: webMaintMsg.trim(),
        });
        showToast('সাইট সফলভাবে হালনাগাদ করা হয়েছে', 'success');
        setEditingWebsiteId(null);
      } else {
        // Add Mode
        const websRef = ref(db, 'websites');
        const newWebRef = push(websRef);
        await set(newWebRef, {
          id: newWebRef.key,
          name: webName.trim(),
          url: webUrl.trim(),
          description: webDescription.trim(),
          iconName: webIconName,
          accentColor: webAccentColor,
          maintenanceEnabled: webMaintEnabled,
          maintenanceMessage: webMaintMsg.trim(),
          timestamp: Date.now()
        });
        showToast('নতুন সাইট সফলভাবে যোগ করা হয়েছে', 'success');
      }

      // Reset form states
      setWebName('');
      setWebUrl('');
      setWebDescription('');
      setWebIconName('ShoppingBag');
      setWebAccentColor('from-violet-600 to-indigo-700');
      setWebMaintEnabled(false);
      setWebMaintMsg('');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleEditWebsite = (web: ExternalWebsite) => {
    setEditingWebsiteId(web.id);
    setWebName(web.name);
    setWebUrl(web.url);
    setWebDescription(web.description);
    setWebIconName(web.iconName || 'ShoppingBag');
    setWebAccentColor(web.accentColor || 'from-violet-600 to-indigo-700');
    setWebMaintEnabled(web.maintenanceEnabled || false);
    setWebMaintMsg(web.maintenanceMessage || '');
  };

  const handleDeleteWebsite = (id: string) => {
    setConfirmState({
      title: 'সাইট ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই সাইটটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await remove(ref(db, `websites/${id}`));
          showToast('সাইটটি সফলভাবে মুছে ফেলা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  // --- INVESTMENT PLANS MANAGEMENT HANDLERS ---
  const handleSaveInvestmentPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = planName.trim();
    const cost = parseFloat(planCost);
    const totalReturn = parseFloat(planTotalReturn);
    const validityDays = parseInt(planValidityDays, 10);

    if (!name || isNaN(cost) || isNaN(totalReturn) || isNaN(validityDays) || cost <= 0 || totalReturn <= 0 || validityDays <= 0) {
      showToast('সব তথ্য সঠিকভাবে দিন (নাম, মূল্য, মোট আয় এবং মেয়াদ)', 'err');
      return;
    }

    try {
      if (editingPlanId) {
        // Edit Mode
        const planRef = ref(db, `investment_plans/${editingPlanId}`);
        await update(planRef, {
          name,
          cost,
          totalReturn,
          validityDays
        });
        showToast('ইনভেস্টমেন্ট প্ল্যান সফলভাবে আপডেট করা হয়েছে', 'success');
        setEditingPlanId(null);
      } else {
        // Add Mode
        const plansRef = ref(db, 'investment_plans');
        const newPlanRef = push(plansRef);
        await set(newPlanRef, {
          id: newPlanRef.key,
          name,
          cost,
          totalReturn,
          validityDays,
          timestamp: Date.now()
        });
        showToast('নতুন ইনভেস্টমেন্ট প্ল্যান সফলভাবে যোগ করা হয়েছে', 'success');
      }

      // Reset Form
      setPlanName('');
      setPlanCost('');
      setPlanTotalReturn('');
      setPlanValidityDays('');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  const handleEditInvestmentPlan = (plan: InvestmentPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanCost(String(plan.cost));
    setPlanTotalReturn(String(plan.totalReturn));
    setPlanValidityDays(String(plan.validityDays));
  };

  const handleDeleteInvestmentPlan = (id: string) => {
    setConfirmState({
      title: 'প্ল্যান ডিলিট নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত এই ইনভেস্টমেন্ট প্ল্যানটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await remove(ref(db, `investment_plans/${id}`));
          showToast('ইনভেস্টমেন্ট প্ল্যানটি সফলভাবে মুছে ফেলা হয়েছে', 'success');
        } catch (e: any) {
          showToast('ত্রুটি: ' + e.message, 'err');
        }
      }
    });
  };

  // --- CASH WITHDRAW PENDING BILL APPROVALS ---
  const handleProcessWithdraw = async (item: WithdrawalRequest, action: 'approved' | 'rejected' | 'rejected_deduct') => {
    try {
      if (action === 'rejected') {
        // Refund cash to User's balance Account back (Refund Mode)
        const userRef = ref(db, `users/${item.userId}`);
        const userSnap = await get(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.val();
          const balType = item.balanceType || 'main';
          if (balType === 'gmail') {
            await update(userRef, { gmailBalance: (uData.gmailBalance || 0) + item.amount });
          } else if (balType === 'telegram') {
            await update(userRef, { telegramBalance: (uData.telegramBalance || 0) + item.amount });
          } else if (balType === 'whatsapp') {
            await update(userRef, { whatsappBalance: (uData.whatsappBalance || 0) + item.amount });
          } else if (balType === 'facebook') {
            await update(userRef, { facebookBalance: (uData.facebookBalance || 0) + item.amount });
          } else if (balType === 'instagram') {
            await update(userRef, { instagramBalance: (uData.instagramBalance || 0) + item.amount });
          } else if (balType === 'ads') {
            await update(userRef, { adsBalance: (uData.adsBalance || 0) + item.amount });
          } else {
            await update(userRef, { balance: (uData.balance || 0) + item.amount });
          }
        }
      }

      await update(ref(db, `withdrawals/${item.id}`), {
        status: action
      });

      const succMsg = action === 'approved' 
        ? 'উইথড্র সফলভাবে এপ্রুভড হয়েছে!' 
        : action === 'rejected_deduct'
          ? 'উইথড্র রিজেক্ট ও ব্যালেন্স স্থায়ীভাবে কেটে নেওয়া হয়েছে!'
          : 'উইথড্র রিজেক্ট ও সম্পূর্ণ ব্যালেন্স রিফান্ড করা হয়েছে!';

      showToast(succMsg, 'success');
    } catch (e: any) {
      showToast('ত্রুটি: ' + e.message, 'err');
    }
  };

  // --- MASS CUSTOM SETTINGS SUBMISSIONS ---
  const handleSaveGlobalConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const minW = parseFloat(setMinWithdrawLimit);
      const minWgmail = parseFloat(setMinWithdrawGmailLimit);
      const minWtele = parseFloat(setMinWithdrawTelegramLimit);
      const minWwhat = parseFloat(setMinWithdrawWhatsappLimit);
      const minWfb = parseFloat(setMinWithdrawFacebookLimit);
      const minWig = parseFloat(setMinWithdrawInstagramLimit);
      const minWads = parseFloat(setMinWithdrawAdsLimit);
      const gmailPr = parseFloat(setGmailBuyPrice);
      const telegramPr = parseFloat(setTelegramBuyPrice);
      const whatsappPr = parseFloat(setWhatsappBuyPrice);
      const facebookPr = parseFloat(setFacebookBuyPrice);
      const instagramPr = parseFloat(setInstagramBuyPrice);
      const actPr = parseFloat(activationPrice);
      const gDailyLim = parseInt(gameDailyLimit);
      const gFreeRew = parseFloat(gameFreeReward);
      const adsterraDLim = parseInt(adsterraDailyLimit);
      const feePercent = parseFloat(withdrawFeePercentState);
      const depFeePercent = parseFloat(depositFeePercentState);

      await update(ref(db, 'settings'), {
        minWithdraw: isNaN(minW) ? 50 : minW,
        withdrawFeePercent: isNaN(feePercent) ? 0 : feePercent,
        depositFeePercent: isNaN(depFeePercent) ? 0 : depFeePercent,
        minWithdrawGmail: isNaN(minWgmail) ? 50 : minWgmail,
        minWithdrawTelegram: isNaN(minWtele) ? 50 : minWtele,
        minWithdrawWhatsapp: isNaN(minWwhat) ? 50 : minWwhat,
        minWithdrawFacebook: isNaN(minWfb) ? 50 : minWfb,
        minWithdrawInstagram: isNaN(minWig) ? 50 : minWig,
        minWithdrawAds: isNaN(minWads) ? 50 : minWads,
        activationPrice: isNaN(actPr) ? 100 : actPr,
        appDownloadLink: setAppDownloadUrl.trim(),
        gmailPrice: isNaN(gmailPr) ? 15 : gmailPr,
        gmailOpenPass: setGmailOpenPassword.trim(),
        telegramOpenPass: setTelegramOpenPassword.trim(),
        whatsappOpenPass: setWhatsappOpenPassword.trim(),
        facebookOpenPass: setFacebookOpenPassword.trim(),
        instagramOpenPass: setInstagramOpenPassword.trim(),
        telegramPrice: isNaN(telegramPr) ? 20 : telegramPr,
        whatsappPrice: isNaN(whatsappPr) ? 30 : whatsappPr,
        facebookPrice: isNaN(facebookPr) ? 25 : facebookPr,
        instagramPrice: isNaN(instagramPr) ? 20 : instagramPr,
        gameDailyLimit: isNaN(gDailyLim) ? 5 : gDailyLim,
        gameFreeReward: isNaN(gFreeRew) ? 1 : gFreeRew,
        gameMaintenanceEnabled: gameMaintEnabled,
        gameMaintenanceMessage: gameMaintMsg.trim(),
        scratchCardPrice: isNaN(parseFloat(scratchCardPrice)) ? 5 : parseFloat(scratchCardPrice),
        scratchDailyLimit: isNaN(parseInt(scratchDailyLimit)) ? 10 : parseInt(scratchDailyLimit),
        scratchRewards: scratchRewards.trim(),
        scratchMaintenanceEnabled: scratchMaintEnabled,
        scratchMaintenanceMessage: scratchMaintMsg.trim(),
        gmailMaintenanceEnabled: gmailMaintEnabled,
        gmailMaintenanceMessage: gmailMaintMsg.trim(),
        telegramMaintenanceEnabled: telegramMaintEnabled,
        telegramMaintenanceMessage: telegramMaintMsg.trim(),
        whatsappMaintenanceEnabled: whatsappMaintEnabled,
        whatsappMaintenanceMessage: whatsappMaintMsg.trim(),
        facebookMaintenanceEnabled: facebookMaintEnabled,
        facebookMaintenanceMessage: facebookMaintMsg.trim(),
        instagramMaintenanceEnabled: instagramMaintEnabled,
        instagramMaintenanceMessage: instagramMaintMsg.trim(),
        jobsMaintenanceEnabled: jobsMaintEnabled,
        jobsMaintenanceMessage: jobsMaintMsg.trim(),
        postJobMaintenanceEnabled: postJobMaintEnabled,
        postJobMaintenanceMessage: postJobMaintMsg.trim(),
        postJobAdminFee: isNaN(parseFloat(postJobAdminFee)) ? 0 : parseFloat(postJobAdminFee),
        spinMaintenanceEnabled: spinMaintEnabled,
        spinMaintenanceMessage: spinMaintMsg.trim(),
        transferMaintenanceEnabled: transferMaintEnabled,
        transferMaintenanceMessage: transferMaintMsg.trim(),
        depositMaintenanceEnabled: depositMaintEnabled,
        depositMaintenanceMessage: depositMaintMsg.trim(),
        withdrawMaintenanceEnabled: withdrawMaintEnabled,
        withdrawMaintenanceMessage: withdrawMaintMsg.trim(),
        referMaintenanceEnabled: referMaintEnabled,
        referMaintenanceMessage: referMaintMsg.trim(),
        adsMaintenanceEnabled: adsMaintEnabled,
        adsMaintenanceMessage: adsMaintMsg.trim(),
        missionsMaintenanceEnabled: missionsMaintEnabled,
        missionsMaintenanceMessage: missionsMaintMsg.trim(),
        novashopMaintenanceEnabled: novashopMaintEnabled,
        novashopMaintenanceMessage: novashopMaintMsg.trim(),
        investmentMaintenanceEnabled: investmentMaintEnabled,
        investmentMaintenanceMessage: investmentMaintMsg.trim(),
        referLink: setReferralRootLink.trim(),
        activationNumbers: {
          bkash: setBkashNumber.trim(),
          nagad: setNagadNumber.trim()
        },
        popupEnabled: popupEnabled,
        popupTitle: popupTitle.trim(),
        popupMessage: popupMessage.trim(),
        popupImageUrl: popupImageUrl.trim(),
        popupLink: popupLink.trim(),
        runningNotice: runningNotice.trim(),
        emergencyEnabled: emergencyEnabled,
        emergencyMessage: emergencyMessage.trim(),
        spinRewards: spinRewards.trim(),
        supportTelegramChannel: supportTelegramChannel.trim(),
        supportTelegramGroup: supportTelegramGroup.trim(),
        supportTelegramAdmin: supportTelegramAdmin.trim(),
        supportFacebookPage: supportFacebookPage.trim(),
        supportWhatsAppNumber: supportWhatsAppNumber.trim(),
        telegramBotToken: telegramBotToken.trim(),
        telegramChatId: telegramChatId.trim(),
        telegramAdminBotToken: telegramAdminBotToken.trim(),
        telegramAdminChatId: telegramAdminChatId.trim(),
        hideMasterPasswords: hideMasterPasswords,
        siteMaintenanceEnabled: siteMaintenanceEnabled,
        siteMaintenanceMessage: siteMaintenanceMessage.trim(),
        freeActivationEnabled: freeActivationEnabled,
        adsterraDirectLink: adsterraDirectLink.trim(),
        adsterraDirectReward: isNaN(parseFloat(adsterraDirectReward)) ? 0.15 : parseFloat(adsterraDirectReward),
        adsterraScriptCode: adsterraScriptCode.trim(),
        adsterraDailyLimit: isNaN(adsterraDLim) ? 10 : adsterraDLim,
        gmailLastDate: setGmailLastDate.trim(),
        telegramLastDate: setTelegramLastDate.trim(),
        whatsappLastDate: setWhatsappLastDate.trim(),
        facebookLastDate: setFacebookLastDate.trim(),
        instagramLastDate: setInstagramLastDate.trim(),
        gmailDailyLimit: isNaN(parseInt(gmailDailyLimit)) ? 0 : parseInt(gmailDailyLimit),
        telegramDailyLimit: isNaN(parseInt(telegramDailyLimit)) ? 0 : parseInt(telegramDailyLimit),
        whatsappDailyLimit: isNaN(parseInt(whatsappDailyLimit)) ? 0 : parseInt(whatsappDailyLimit),
        facebookDailyLimit: isNaN(parseInt(facebookDailyLimit)) ? 0 : parseInt(facebookDailyLimit),
        instagramDailyLimit: isNaN(parseInt(instagramDailyLimit)) ? 0 : parseInt(instagramDailyLimit),
        gmailTutorialUrl: gmailTutorialUrl.trim(),
        telegramTutorialUrl: telegramTutorialUrl.trim(),
        whatsappTutorialUrl: whatsappTutorialUrl.trim(),
        facebookTutorialUrl: facebookTutorialUrl.trim(),
        instagramTutorialUrl: instagramTutorialUrl.trim(),
        signupBonusEnabled: signupBonusEnabled,
        signupBonusAmount: isNaN(parseFloat(signupBonusAmount)) ? 0 : parseFloat(signupBonusAmount),
      });

      showToast('সব গ্লোবাল সেটিংস আপডেট করা হয়েছে!', 'success');
    } catch (e: any) {
      showToast('ব্যর্থ: ' + e.message, 'err');
    }
  };

  const handleTestTelegramBot = async () => {
    if (!telegramBotToken.trim() || !telegramChatId.trim()) {
      setTelegramTestResult({ text: 'টোকেন এবং চ্যাট আইডি দুটোই লিখুন!', type: 'error' });
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestResult(null);

    let token = telegramBotToken.trim();
    if (token.toLowerCase().startsWith('bot')) {
      token = token.slice(3).trim();
    }
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: `🧪 <b>টেলিগ্রাম বট টেস্ট মেসেজ (Test Connection Success)</b>\n\nআপনার ট্রাস্টেড অ্যাপের সাথে টেলিগ্রাম বটটি সফলভাবে টেস্ট মেসেজ সম্পন্ন করেছে! 🥳\n\n🕒 সময়: ${new Date().toLocaleString()}`,
          parse_mode: 'HTML'
        })
      });
      
      const resData = await response.json();
      if (resData.ok) {
        setTelegramTestResult({ text: 'সফল! টেলিগ্রাম চ্যানেলে টেস্ট মেসেজ পাঠানো হয়েছে। চ্যাট চেক করুন। 🥳', type: 'success' });
      } else {
        setTelegramTestResult({ 
          text: `ব্যর্থ হয়েছে! টেলিগ্রাম রেসপন্স: ${resData.description || 'Unknown error'} (কোড: ${response.status})`, 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setTelegramTestResult({ text: 'সার্ভার সংযোগ ক্রাশ হয়েছে বা ব্লক করা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleTestAdminTelegramBot = async () => {
    if (!telegramAdminBotToken.trim() || !telegramAdminChatId.trim()) {
      setAdminTelegramTestResult({ text: 'এডমিন বট টোকেন এবং চ্যাট আইডি দুটোই লিখুন!', type: 'error' });
      return;
    }
    setIsTestingAdminTelegram(true);
    setAdminTelegramTestResult(null);

    let token = telegramAdminBotToken.trim();
    if (token.toLowerCase().startsWith('bot')) {
      token = token.slice(3).trim();
    }
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramAdminChatId.trim(),
          text: `🧪 <b>টেলিগ্রাম এডমিন বট টেস্ট মেসেজ (Test Connection Success)</b>\n\nটাকাহাব সিস্টেমের সাথে আপনার এডমিন কন্ট্রোল বটটি সফলভাবে টেস্ট কানেক্ট হয়েছে! 👮‍♂️\n\n🕒 সময়: ${new Date().toLocaleString()}`,
          parse_mode: 'HTML'
        })
      });
      
      const resData = await response.json();
      if (resData.ok) {
        setAdminTelegramTestResult({ text: 'সফল! এডমিন টেলিগ্রাম চ্যাটে টেস্ট মেসেজ পাঠানো হয়েছে। চ্যাট চেক করুন। 🥳', type: 'success' });
      } else {
        setAdminTelegramTestResult({ 
          text: `ব্যর্থ হয়েছে! টেলিগ্রাম রেসপন্স: ${resData.description || 'Unknown error'} (কোড: ${response.status})`, 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setAdminTelegramTestResult({ text: 'সার্ভার সংযোগ ক্রাশ হয়েছে বা ব্লক করা হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setIsTestingAdminTelegram(false);
    }
  };

  const handleSendGlobalNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifHeader.trim() || !notifBody.trim()) {
      showToast('বিজ্ঞপ্তি টাইটেল এবং মূল মেসেজ উভয়ই দিন।', 'err');
      return;
    }

    try {
      const gNotifRef = ref(db, 'global_notifications');
      const newNotifRef = push(gNotifRef);
      await set(newNotifRef, {
        id: newNotifRef.key,
        title: notifHeader.trim(),
        message: notifBody.trim(),
        timestamp: Date.now()
      });

      // Optional telegram bot notification broadcast
      if (telegramBotToken && telegramChatId) {
        try {
          let token = telegramBotToken.trim();
          if (token.toLowerCase().startsWith('bot')) {
            token = token.slice(3).trim();
          }
          const messageText = `📢 <b>${notifHeader.trim()}</b>\n\n${notifBody.trim()}`;
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegramChatId.trim(),
              text: messageText,
              parse_mode: 'HTML'
            })
          });
        } catch (tgErr) {
          console.warn('Telegram notice broadcast failed:', tgErr);
        }
      }

      setNotifHeader('');
      setNotifBody('');
      showToast('সব ইউজারদের নোটিফিকেশন পাঠানো হয়েছে!', 'success');
    } catch (err: any) {
      showToast('বিজ্ঞপ্তি পাঠাতে ত্রুটি: ' + err.message, 'err');
    }
  };

  // Quick statistics computation
  const pendingPaymentsSum = withdraws.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-xl mx-auto shadow-2xl relative overflow-x-hidden border-x border-slate-800">
      
      {/* Toast Messages */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-sm">
        <AnimatePresence>
          {adminToasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3.5 rounded-xl shadow-xl border text-xs font-bold leading-normal flex items-center gap-3 ${
                t.status === 'success' ? 'bg-emerald-650 text-emerald-100 border-emerald-500/20' : 'bg-red-650 text-red-100 border-red-500/20'
              }`}
            >
              {t.status === 'success' ? <Check size={16} /> : <X size={16} />}
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Admin Panel Header */}
      <header className="bg-slate-950 px-5 py-4 flex justify-between items-center border-b border-slate-800">
        <div>
          <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
            <UserCheck size={14} /> 
            <span>এডমিন প্যানেল</span>
          </h3>
          <span className="text-xs text-slate-400">ম্যানেজমেন্ট কনসোল</span>
        </div>
        <div className="flex gap-2">
          {onSwitchToNovaAdmin && (
            <button 
              onClick={onSwitchToNovaAdmin}
              className="text-xs font-bold bg-violet-600 hover:bg-violet-750 text-white py-2 px-3 rounded-md transition flex items-center gap-1.5"
            >
              <span>নোভা সেটিংস 𒀭</span>
            </button>
          )}
          <button 
            onClick={onSwitchToUser}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-md transition flex items-center gap-1"
          >
            <User size={13} />
            <span>ইউজার ভিউ</span>
          </button>
          <button onClick={onLogout} className="bg-slate-850 hover:bg-slate-800 p-2 text-slate-400 rounded-md transition" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Admin Dashboard tabs selectors */}
      <nav className="flex bg-slate-950 overflow-x-auto whitespace-nowrap border-b border-slate-800 text-xs px-2 scrollbar-none py-1.5 gap-1.5 shrink-0">
        <button onClick={() => setAdminTab('stats')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'stats' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
          <Home size={13} />
          <span>ড্যাশবোর্ড</span>
        </button>
        {permissions.users && (
          <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'users' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <Users size={13} />
            <span>ইউজার ({dbUsers.length})</span>
          </button>
        )}
        {permissions.activations && (
          <button onClick={() => setAdminTab('activations')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 relative ${adminTab === 'activations' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <ShieldCheck size={13} />
            <span>এক্টিভেশন</span>
            {activations.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
        {permissions.deposits && (
          <button onClick={() => setAdminTab('deposits')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 relative ${adminTab === 'deposits' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <DollarSign size={13} />
            <span>ডিপোজিট</span>
            {deposits.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
        {permissions.sells && (
          <button onClick={() => setAdminTab('sells')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 relative ${adminTab === 'sells' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <Mail size={13} />
            <span>জিমেইল সেল</span>
            {sells.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
        {permissions.jobSubmissions && (
          <button onClick={() => setAdminTab('job-submissions')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 relative ${adminTab === 'job-submissions' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <CheckCheck size={13} />
            <span>জব রিভিউ</span>
            {jobSubmissions.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
        {permissions.withdraws && (
          <button onClick={() => setAdminTab('withdraws')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 relative ${adminTab === 'withdraws' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <CreditCard size={13} />
            <span>টাকা উত্তোলন</span>
            {withdraws.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
        {permissions.settings && (
          <>
            <button onClick={() => setAdminTab('ads')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'ads' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Megaphone size={13} />
              <span>বিজ্ঞপ্তি-Ads</span>
            </button>
            <button onClick={() => setAdminTab('campaigns')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'campaigns' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Briefcase size={13} />
              <span>ক্যাম্পেইন ({jobs.length})</span>
            </button>
            <button onClick={() => setAdminTab('tasks')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'tasks' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Smartphone size={13} />
              <span>হোম কাজ</span>
            </button>
            <button onClick={() => setAdminTab('missions')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'missions' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Award size={13} />
              <span>মিশন</span>
            </button>
            <button onClick={() => setAdminTab('websites')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'websites' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
              <Globe size={13} />
              <span>অন্যান্য সাইট ({websites.length})</span>
            </button>
            <button onClick={() => setAdminTab('plans')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'plans' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
              <TrendingUp size={13} />
              <span>ইনভেস্টমেন্ট প্ল্যান ({investmentPlans.length})</span>
            </button>
          </>
        )}
        {(permissions.settings || 
          permissions.gmailPriceSecurity || 
          permissions.telegramPriceSecurity || 
          permissions.whatsappPriceSecurity || 
          permissions.facebookPriceSecurity || 
          permissions.instagramPriceSecurity) && (
          <button onClick={() => setAdminTab('settings')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'settings' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <Settings size={13} />
            <span>সেটিংস</span>
          </button>
        )}
        {isSuperAdmin && (
          <button onClick={() => setAdminTab('admins')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${adminTab === 'admins' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>
            <UserCheck size={13} />
            <span>এডমিন নিয়ন্ত্রণ ({subAdmins.length})</span>
          </button>
        )}
      </nav>

      {/* Main Admin Section Body */}
      <main className="flex-1 overflow-y-auto p-4 pb-16 text-slate-300">
        
        {/* VIEW 1: STATS OVERVIEWS */}
        {adminTab === 'stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <Users size={24} className="text-rose-500 mx-auto mb-2 animate-pulse" />
                <h2 className="text-3xl font-black font-mono text-white">
                  {dbUsers.filter(u => u.lastActive && (Date.now() - u.lastActive < 120000)).length}
                </h2>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">অনলাইন ইউজার (২ মিনিট)</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <Users size={24} className="text-rose-550 mx-auto mb-2" />
                <h2 className="text-3xl font-black font-mono text-white">{dbUsers.length}</h2>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">মোট রেজিস্টার্ড ইউজার</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <CreditCard size={24} className="text-rose-500 mx-auto mb-2" />
                <h2 className="text-3xl font-black font-mono text-white">{withdraws.length}</h2>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">পেন্ডিং উইথড্র</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                <CheckCheck size={24} className="text-rose-500 mx-auto mb-2" />
                <h2 className="text-3xl font-black font-mono text-white">{jobSubmissions.length}</h2>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">পেন্ডিং জব রিভিউ</p>
              </div>
            </div>

            {/* Quick Action cards triggers */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3.5">
              <h4 className="font-extrabold text-white text-xs tracking-wide uppercase border-b border-slate-800 pb-2">দ্রুত নেভিগেশন</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setAdminTab('activations')} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left font-semibold text-xs transition flex justify-between items-center">
                  <span>ভেরিফিকেশন চেক</span>
                  <span className="bg-rose-550 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">{activations.length}</span>
                </button>
                <button onClick={() => setAdminTab('deposits')} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left font-semibold text-xs transition flex justify-between items-center">
                  <span>ডিপোজিট চেক</span>
                  <span className="bg-rose-550 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">{deposits.length}</span>
                </button>
                <button onClick={() => setAdminTab('sells')} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left font-semibold text-xs transition flex justify-between items-center">
                  <span>জিমেইল সেল চেক</span>
                  <span className="bg-rose-550 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">{sells.length}</span>
                </button>
                <button onClick={() => setAdminTab('job-submissions')} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left font-semibold text-xs transition flex justify-between items-center">
                  <span>জব প্রমাণ রিভিউ</span>
                  <span className="bg-rose-550 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">{jobSubmissions.length}</span>
                </button>
                <button onClick={() => setAdminTab('withdraws')} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left font-semibold text-xs transition flex justify-between items-center">
                  <span>পেমেন্ট উইথড্র</span>
                  <span className="bg-rose-550 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold">{withdraws.length}</span>
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* VIEW 2: ACTIVATIONS REQUEST APPR VAL */}
        {adminTab === 'activations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-base font-bold text-white tracking-wide">১টিভি ১৫ টাকা ফি চেক ও ভেরিফিকেশন</h2>

            {activations.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                <ShieldCheck className="text-slate-700 mx-auto mb-2" size={32} />
                <p className="text-slate-500 text-xs">কোনো পেমেন্ট ভেরিফিকেশন পেন্ডিং নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activations.map(act => (
                  <div key={act.id} className="bg-slate-950 border border-slate-800 p-4.5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-xs">{act.username}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{act.userEmail}</span>
                      </div>
                      <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[9px] uppercase font-bold">
                        Pending
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">অপারেটর মেথড:</span>
                        <strong className="text-rose-450 uppercase font-bold">{act.method}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">প্রেরক নম্বর:</span>
                        <strong className="text-white font-semibold font-mono">{act.number}</strong>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Transaction ID:</span>
                        <strong className="text-yellow-400 font-black font-mono tracking-wider text-sm select-all">
                          {act.trxId}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <button 
                        onClick={() => handleApproveActivation(act)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-xl transition flex justify-center items-center gap-1"
                      >
                        <Check size={14} /> এপ্রুভ করুন
                      </button>
                      <button 
                        onClick={() => handleRejectActivation(act)}
                        className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/30 font-bold p-2.5 rounded-xl transition flex justify-center items-center gap-1"
                      >
                        <X size={14} /> রিজেক্ট করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2.5: DEPOSITS REQUEST APPR VAL */}
        {adminTab === 'deposits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-base font-bold text-white tracking-wide">ইউজার ডিপোজিট ভেরিফিকেশন ও এপ্রুভাল</h2>

            {deposits.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                <DollarSign className="text-slate-700 mx-auto mb-2" size={32} />
                <p className="text-slate-500 text-xs">কোনো ডিপোজিট অনুরোধ পেন্ডিং নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deposits.map(dep => (
                  <div key={dep.id} className="bg-slate-950 border border-slate-800 p-4.5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-xs">{dep.username}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{dep.userEmail}</span>
                      </div>
                      <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[9px] uppercase font-bold">
                        Pending
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/60 grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">অপারেটর মেথড:</span>
                        <strong className="text-rose-455 uppercase font-bold">{dep.method}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">প্রেরক নম্বর:</span>
                        <strong className="text-white font-semibold font-mono">{dep.number}</strong>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Transaction ID:</span>
                        <strong className="text-yellow-400 font-black font-mono tracking-wider select-all block">
                          {dep.trxId}
                        </strong>
                      </div>
                      <div className="pt-2 border-t border-slate-800 col-span-2 mt-1">
                        <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-lg text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[10px] font-bold">মোট ডিপোজিট পরিমাণ:</span>
                            <strong className="text-white font-black font-mono">৳{(dep.amount || 0).toFixed(2)}</strong>
                          </div>
                          {(dep.feeAmount !== undefined || dep.feePercent !== undefined) && (
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="text-[10px] font-medium font-sans">ডিপোজিট ফি চার্জ:</span>
                              <span className="font-mono text-red-400 text-[10.5px]">
                                -৳{(dep.feeAmount || 0).toFixed(2)} ({dep.feePercent || 0}%)
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center border-t border-slate-800/40 pt-1.5 mt-1">
                            <span className="text-teal-400 text-[10px] font-black uppercase font-sans">নিট ক্রেডিট (ব্যালেন্সে পাবে):</span>
                            <strong className="text-[#10b981] font-black font-mono text-sm">
                              ৳{(dep.netAmount !== undefined ? dep.netAmount : dep.amount).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <button 
                        onClick={() => handleApproveDeposit(dep)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-xl transition flex justify-center items-center gap-1"
                      >
                        <Check size={14} /> এপ্রুভ করুন
                      </button>
                      <button 
                        onClick={() => handleRejectDeposit(dep)}
                        className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/30 font-bold p-2.5 rounded-xl transition flex justify-center items-center gap-1"
                      >
                        <X size={14} /> রিজেক্ট করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 3: USER LISTS MANAGEMENTS */}
        {adminTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base font-bold text-white tracking-wide">রেজিস্টার্ড ইউজার তালিকা ({dbUsers.length})</h2>
              <button
                onClick={() => handleExportSellsCSV('users')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-md cursor-pointer"
              >
                <TrendingUp size={11} className="rotate-90" />
                <span>ইউজার লিস্ট (.CSV)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {dbUsers.map(u => (
                <div 
                  key={u.uid} 
                  onClick={() => {
                    setSelectedUser(u);
                    setUserBalanceChangeInput('');
                  }}
                  className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'User')}&background=rose&color=fff&size=100`} 
                      className="w-10 h-10 rounded-full object-cover shrink-0" 
                      alt="Avatar" 
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-100 text-xs truncate leading-normal">{u.username || 'No Name'}</h4>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">{u.email}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[#10b981] font-black text-xs block">৳{(u.balance || 0).toFixed(2)}</span>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {u.isActive ? 'একটিভ' : 'নিস্ক্রিয়'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Individual user modal manages */}
            <AnimatePresence>
              {selectedUser && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-white text-sm">ইউজার ডিটেইলস ও ব্যালেন্স এডজাস্ট</h3>
                      <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-2 border-b border-slate-800 pb-3 leading-normal">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">নাম:</span>
                        <span className="text-white font-extrabold">{selectedUser.username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">ইমেইল:</span>
                        <span className="text-white font-mono">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">ডিভাইস আইডি (DeviceId):</span>
                        <span className="text-rose-450 font-mono font-bold truncate max-w-[150px]">{selectedUser.deviceId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">রেফারাল কোড:</span>
                        <span className="text-amber-500 font-black font-mono">{selectedUser.referCode || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">মোট রেফার করেছে:</span>
                        <span className="text-indigo-400 font-black font-sans">
                          {dbUsers.filter(u => u.referredBy === selectedUser.referCode).length} জন
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">অবস্থা (Status):</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${selectedUser.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedUser.isBanned ? 'ব্যানড ❌' : 'সক্রিয় ✔'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">বর্তমান ব্যালেন্স:</span>
                        <span className="text-emerald-400 font-black text-sm">৳{(selectedUser.balance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                        <span className="text-slate-500 font-semibold">Gmail Balance:</span>
                        <span className="text-teal-400 font-bold">৳{(selectedUser.gmailBalance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                        <span className="text-slate-500 font-semibold">Telegram Balance:</span>
                        <span className="text-sky-400 font-bold">৳{(selectedUser.telegramBalance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                        <span className="text-slate-500 font-semibold">WhatsApp Balance:</span>
                        <span className="text-emerald-400 font-bold">৳{(selectedUser.whatsappBalance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                        <span className="text-slate-500 font-semibold">Facebook Balance:</span>
                        <span className="text-indigo-400 font-bold">৳{(selectedUser.facebookBalance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                        <span className="text-slate-500 font-semibold">Ads Balance:</span>
                        <span className="text-amber-400 font-bold">৳{(selectedUser.adsBalance || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <button 
                        onClick={handleToggleBan}
                        className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                          selectedUser.isBanned 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {selectedUser.isBanned ? ' আনব্যান করুন (Remove Ban) ✔' : ' ব্যান করুন (Ban User) ❌'}
                      </button>

                      <div className="space-y-1.5 pt-2 border-t border-slate-900">
                        <label className="text-slate-400 font-bold block pl-1">ব্যালেন্স এডিট ক্যাটাগরি</label>
                        <select 
                          value={userBalanceTypeToEdit} 
                          onChange={(e: any) => setUserBalanceTypeToEdit(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        >
                          <option value="main">Main Balance</option>
                          <option value="gmail">Gmail Balance</option>
                          <option value="telegram">Telegram Balance</option>
                          <option value="whatsapp">WhatsApp Balance</option>
                          <option value="facebook">Facebook Balance</option>
                          <option value="ads">Ads Balance</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold block pl-1">ব্যালেন্স এডিট (৳)</label>
                        <input 
                          type="number" 
                          placeholder="টাকার পরিমাণ যেমন: ৫০"
                          value={userBalanceChangeInput}
                          onChange={(e) => setUserBalanceChangeInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl p-3 outline-none text-white font-bold font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleUpdateBalance('add')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition"
                        >
                          ৳ ব্যালেন্স যোগ
                        </button>
                        <button 
                          onClick={() => handleUpdateBalance('deduct')}
                          className="bg-red-600 hover:bg-red-750 text-white font-bold py-2.5 rounded-xl transition"
                        >
                          ৳ ব্যালেন্স বিয়োগ
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 4: SELLS MANAGEMENT */}
        {adminTab === 'sells' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-base font-bold text-white tracking-wide">অ্যাকাউন্ট ক্রয়-বিক্রয় ডিলস</h2>

            {/* Sub-tab navigation */}
            <div className="flex flex-wrap gap-2 border-b border-slate-805 pb-3">
              <button
                onClick={() => setSellSubTab('gmail')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sellSubTab === 'gmail' ? 'bg-[#764ba2] text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <span>জিমেইল ডিলস</span>
                {sells.length > 0 && (
                  <span className="bg-red-550 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold shadow-sm">{sells.length}</span>
                )}
              </button>
              <button
                onClick={() => setSellSubTab('telegram')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sellSubTab === 'telegram' ? 'bg-sky-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <span>টেলিগ্রাম ডিলস</span>
                {telegramSells.length > 0 && (
                  <span className="bg-red-550 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold shadow-sm">{telegramSells.length}</span>
                )}
              </button>
              <button
                onClick={() => setSellSubTab('whatsapp')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sellSubTab === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <span>হোয়াটসঅ্যাপ ডিলস</span>
                {whatsappSells.length > 0 && (
                  <span className="bg-red-550 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold shadow-sm">{whatsappSells.length}</span>
                )}
              </button>
              <button
                onClick={() => setSellSubTab('facebook')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sellSubTab === 'facebook' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <span>ফেসবুক ডিলস</span>
                {facebookSells.length > 0 && (
                  <span className="bg-red-550 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold shadow-sm">{facebookSells.length}</span>
                )}
              </button>
              <button
                onClick={() => setSellSubTab('instagram')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sellSubTab === 'instagram' ? 'bg-rose-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <span>ইন্সটাগ্রাম ডিলস</span>
                {instagramSells.length > 0 && (
                  <span className="bg-red-550 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold shadow-sm">{instagramSells.length}</span>
                )}
              </button>
            </div>

            {/* CSV Spreadsheet downloader quick action button */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
              <div className="text-left">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">একাউন্ট ডাউনলোড জোন</span>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">রিয়েল-টাইম পেন্ডিং একাউন্টের এক্সেল স্প্রেডশিট ডাউনলোড করুন</p>
              </div>
              <button
                onClick={() => handleExportSellsCSV(sellSubTab)}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all duration-200"
              >
                <TrendingUp size={14} className="rotate-90" />
                <span>স্প্রেডশিট ডাউনলোড (.CSV)</span>
              </button>
            </div>

            {/* GMAIL DEALS */}
            {sellSubTab === 'gmail' && (
              <div className="space-y-4 font-sans text-xs">
                {sells.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                    <Mail className="text-slate-700 mx-auto mb-2" size={32} />
                    <p className="text-slate-500 text-xs">কোনো জিমেইল সেল পেন্ডিং নেই</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sells.map(sell => (
                      <div key={sell.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-xs">বিক্রেতা: {sell.username}</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {sell.userId}</span>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2 select-all font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <strong className="text-rose-400">{sell.email}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Password:</span>
                            <strong className="text-rose-450">{sell.password}</strong>
                          </div>
                        </div>

                        <div className="pt-1.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedSell(sell);
                              setSellPaymentInput(String(globalSettings.gmailPrice));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            কিনে নিন (পেমেন্ট করুন)
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmState({
                                title: 'রিকোয়েস্ট ডিলিট নিশ্চিতকরণ',
                                message: 'আপনি কি নিশ্চিত এই জিমেইল রিকোয়েস্টটি ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  try {
                                    await remove(ref(db, `gmail_sells/${sell.id}`));
                                    showToast('রিকোয়েস্ট রিমুভ করা হয়েছে', 'success');
                                  } catch (err: any) {
                                    showToast('ত্রুটি: ' + err.message, 'err');
                                  }
                                }
                              });
                            }}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 p-2 border border-slate-800 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TELEGRAM DEALS */}
            {sellSubTab === 'telegram' && (
              <div className="space-y-4 font-sans text-xs">
                {telegramSells.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                    <Send className="text-slate-700 mx-auto mb-2" size={32} />
                    <p className="text-slate-500 text-xs">কোনো টেলিগ্রাম সেল পেন্ডিং নেই</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {telegramSells.map(sell => (
                      <div key={sell.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-xs">বিক্রেতা: {sell.username}</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {sell.userId}</span>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2 select-all font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Telegram Number:</span>
                            <strong className="text-sky-400">{sell.number}</strong>
                          </div>
                          {sell.details && (
                            <div className="pt-2 border-t border-slate-800 mt-1">
                              <span className="text-slate-500 block mb-0.5">অতিরিক্ত তথ্য:</span>
                              <p className="text-slate-350 text-xs font-semibold leading-relaxed whitespace-pre-wrap">{sell.details}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-1.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedTelegramSell(sell);
                              setTelegramSellPaymentInput(String(globalSettings.telegramPrice || 20));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            কিনে নিন (পেমেন্ট করুন)
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmState({
                                title: 'টেলিগ্রাম রিকোয়েস্ট ডিলিট নিশ্চিতকরণ',
                                message: 'আপনি কি নিশ্চিত এই টেলিগ্রাম রিকোয়েস্টটি ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  try {
                                    await remove(ref(db, `telegram_sells/${sell.id}`));
                                    showToast('রিকোয়েস্ট রিমুভ করা হয়েছে', 'success');
                                  } catch (err: any) {
                                    showToast('ত্রুটি: ' + err.message, 'err');
                                  }
                                }
                              });
                            }}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 p-2 border border-slate-800 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WHATSAPP DEALS */}
            {sellSubTab === 'whatsapp' && (
              <div className="space-y-4 font-sans text-xs">
                {whatsappSells.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                    <MessageSquare className="text-slate-700 mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-slate-500 text-xs">কোনো হোয়াটসঅ্যাপ সেল পেন্ডিং নেই</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {whatsappSells.map(sell => (
                      <div key={sell.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-xs">বিক্রেতা: {sell.username}</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {sell.userId}</span>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2 select-all font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-505">WhatsApp Number:</span>
                            <strong className="text-emerald-400">{sell.number}</strong>
                          </div>
                          {sell.details && (
                            <div className="pt-2 border-t border-slate-800 mt-1">
                              <span className="text-slate-500 block mb-0.5">অতিরিক্ত তথ্য:</span>
                              <p className="text-slate-350 text-xs font-semibold leading-relaxed whitespace-pre-wrap">{sell.details}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-1.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedWhatsappSell(sell);
                              setWhatsappSellPaymentInput(String(globalSettings.whatsappPrice || 30));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            কিনে নিন (পেমেন্ট করুন)
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmState({
                                title: 'হোয়াটসঅ্যাপ রিকোয়েস্ট ডিলিট নিশ্চিতকরণ',
                                message: 'আপনি কি নিশ্চিত এই হোয়াটসঅ্যাপ রিকোয়েস্টটি ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  try {
                                    await remove(ref(db, `whatsapp_sells/${sell.id}`));
                                    showToast('রিকোয়েস্ট রিমুভ করা হয়েছে', 'success');
                                  } catch (err: any) {
                                    showToast('ত্রুটি: ' + err.message, 'err');
                                  }
                                }
                              });
                            }}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 p-2 border border-slate-800 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FACEBOOK DEALS */}
            {sellSubTab === 'facebook' && (
              <div className="space-y-4 font-sans text-xs">
                {facebookSells.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                    <Facebook className="text-slate-700 mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-slate-500 text-xs">কোনো ফেসবুক সেল পেন্ডিং নেই</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {facebookSells.map(sell => (
                      <div key={sell.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-xs">বিক্রেতা: {sell.username}</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {sell.userId}</span>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2 select-all font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-mono">FB Email/Phone:</span>
                            <strong className="text-indigo-400 font-mono">{sell.email}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-mono font-bold">FB Password:</span>
                            <strong className="text-indigo-400 font-mono">{sell.password}</strong>
                          </div>
                          <div className="flex justify-between items-center bg-indigo-950/40 p-2 rounded-lg border border-indigo-900/30 mt-1">
                            <span className="text-indigo-300 font-bold font-mono">Backup Code / Two Factor (2FA):</span>
                            <strong className="text-indigo-200 tracking-wider text-sm select-all font-mono">{sell.twoFactor}</strong>
                          </div>
                        </div>

                        <div className="pt-1.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedFacebookSell(sell);
                              setFacebookSellPaymentInput(String(globalSettings.facebookPrice || 25));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            কিনে নিন (পেমেন্ট করুন)
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmState({
                                title: 'ফেসবুক রিকোয়েস্ট ডিলিট নিশ্চিতকরণ',
                                message: 'আপনি কি নিশ্চিত এই ফেসবুক রিকোয়েস্টটি ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  try {
                                    await remove(ref(db, `facebook_sells/${sell.id}`));
                                    showToast('রিকোয়েস্ট রিমুভ করা হয়েছে', 'success');
                                  } catch (err: any) {
                                    showToast('ত্রুটি: ' + err.message, 'err');
                                  }
                                }
                              });
                            }}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 p-2 border border-slate-800 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INSTAGRAM DEALS */}
            {sellSubTab === 'instagram' && (
              <div className="space-y-4 font-sans text-xs">
                {instagramSells.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                    <Instagram className="text-slate-700 mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-slate-500 text-xs">কোনো ইন্সটাগ্রাম সেল পেন্ডিং নেই</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {instagramSells.map(sell => (
                      <div key={sell.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-xs">বিক্রেতা: {sell.username}</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {sell.userId}</span>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2 select-all font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-mono">Instagram Username/Email:</span>
                            <strong className="text-rose-400 font-mono">{sell.email || sell.username}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-mono">Password:</span>
                            <strong className="text-rose-450 font-mono">{sell.password}</strong>
                          </div>
                          <div className="flex justify-between items-center bg-rose-950/20 p-2 rounded-lg border border-rose-900/10 mt-1">
                            <span className="text-rose-300 font-bold font-mono">Backup Code / Two Factor (2FA):</span>
                            <strong className="text-rose-200 tracking-wider text-sm select-all font-mono">{sell.twoFactor || 'N/A'}</strong>
                          </div>
                        </div>

                        <div className="pt-1.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedInstagramSell(sell);
                              setInstagramSellPaymentInput(String(globalSettings.instagramPrice || 20));
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            কিনে নিন (পেমেন্ট করুন)
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmState({
                                title: 'ইন্সটাগ্রাম রিকোয়েস্ট ডিলিট নিশ্চিতকরণ',
                                message: 'আপনি কি নিশ্চিত এই ইন্সটাগ্রাম রিকোয়েস্টটি ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  try {
                                    await remove(ref(db, `instagram_sells/${sell.id}`));
                                    showToast('রিকোয়েস্ট রিমুভ করা হয়েছে', 'success');
                                  } catch (err: any) {
                                    showToast('ত্রুটি: ' + err.message, 'err');
                                  }
                                }
                              });
                            }}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 p-2 border border-slate-800 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FACEBOOK DEALS */}
            {sellSubTab === 'facebook' && (
              <div className="space-y-4 font-sans text-xs">
                {facebookSells.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                    <Facebook className="text-slate-700 mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-slate-500 text-xs">কোনো ফেসবুক সেল পেন্ডিং নেই</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {facebookSells.map(sell => (
                      <div key={sell.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-xs">বিক্রেতা: {sell.username}</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {sell.userId}</span>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2 select-all font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">FB Email/Phone:</span>
                            <strong className="text-indigo-400">{sell.email}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">FB Password:</span>
                            <strong className="text-indigo-455">{sell.password}</strong>
                          </div>
                          <div className="flex justify-between items-center bg-indigo-950/40 p-2 rounded-lg border border-indigo-900/30 mt-1">
                            <span className="text-indigo-300 font-bold font-mono">Backup Code / Two Factor (2FA):</span>
                            <strong className="text-indigo-200 tracking-wider text-sm select-all font-mono">{sell.twoFactor}</strong>
                          </div>
                        </div>

                        <div className="pt-1.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedFacebookSell(sell);
                              setFacebookSellPaymentInput(String(globalSettings.facebookPrice || 25));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            কিনে নিন (পেমেন্ট করুন)
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmState({
                                title: 'ফেসবুক রিকোয়েস্ট ডিলিট নিশ্চিতকরণ',
                                message: 'আপনি কি নিশ্চিত এই ফেসবুক রিকোয়েস্টটি ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  try {
                                    await remove(ref(db, `facebook_sells/${sell.id}`));
                                    showToast('রিকোয়েস্ট রিমুভ করা হয়েছে', 'success');
                                  } catch (err: any) {
                                    showToast('ত্রুটি: ' + err.message, 'err');
                                  }
                                }
                              });
                            }}
                            className="bg-slate-850 hover:bg-slate-800 text-slate-400 p-2 border border-slate-800 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GMAIL MODAL */}
            <AnimatePresence>
              {selectedSell && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs font-sans text-slate-200"
                  >
                    <div className="flex justify-between items-center border-b border-slate-805 pb-3 mb-4">
                      <h3 className="font-bold text-white text-sm">জিমেইল পেমেন্ট বোনাস যুক্ত করুন</h3>
                      <button onClick={() => setSelectedSell(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        বিক্রেতা: <strong className="text-white">{selectedSell.username}</strong><br />
                        আইডি: <strong className="font-mono text-slate-400">{selectedSell.email}</strong>
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">কত টাকা বোনাস যুক্ত করবেন? (৳)</label>
                        <input 
                          type="number" 
                          value={sellPaymentInput}
                          onChange={(e) => setSellPaymentInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <button 
                          onClick={handleApproveGmailSell}
                          className="bg-emerald-605 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                        >
                          এপ্রুভ ও পেমেন্ট
                        </button>
                        <button 
                          onClick={handleDeclineGmailSell}
                          className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30 font-bold py-3 rounded-xl transition cursor-pointer"
                        >
                          রিজেক্ট করুন
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* TELEGRAM MODAL */}
            <AnimatePresence>
              {selectedTelegramSell && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs font-sans text-slate-200"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
                      <h3 className="font-bold text-white text-sm">টেলিগ্রাম পেমেন্ট বোনাস যুক্ত করুন</h3>
                      <button onClick={() => setSelectedTelegramSell(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        বিক্রেতা: <strong className="text-white">{selectedTelegramSell.username}</strong><br />
                        নাম্বার: <strong className="font-mono text-sky-400">{selectedTelegramSell.number}</strong>
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">কত টাকা বোনাস যুক্ত করবেন? (৳)</label>
                        <input 
                          type="number" 
                          value={telegramSellPaymentInput}
                          onChange={(e) => setTelegramSellPaymentInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <button 
                          onClick={handleApproveTelegramSell}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                        >
                          এপ্রুভ ও পেমেন্ট
                        </button>
                        <button 
                          onClick={handleDeclineTelegramSell}
                          className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30 font-bold py-3 rounded-xl transition cursor-pointer"
                        >
                          রিজেক্ট করুন
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* WHATSAPP MODAL */}
            <AnimatePresence>
              {selectedWhatsappSell && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs font-sans text-slate-200"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
                      <h3 className="font-bold text-white text-sm">হোয়াটসঅ্যাপ পেমেন্ট বোনাস যুক্ত করুন</h3>
                      <button onClick={() => setSelectedWhatsappSell(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        বিক্রেতা: <strong className="text-white">{selectedWhatsappSell.username}</strong><br />
                        নাম্বার: <strong className="font-mono text-emerald-400">{selectedWhatsappSell.number}</strong>
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">কত টাকা বোনাস যুক্ত করবেন? (৳)</label>
                        <input 
                          type="number" 
                          value={whatsappSellPaymentInput}
                          onChange={(e) => setWhatsappSellPaymentInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <button 
                          onClick={handleApproveWhatsappSell}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                        >
                          এপ্রুভ ও পেমেন্ট
                        </button>
                        <button 
                          onClick={handleDeclineWhatsappSell}
                          className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30 font-bold py-3 rounded-xl transition cursor-pointer"
                        >
                          রিজেক্ট করুন
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* FB MODAL */}
            <AnimatePresence>
              {selectedFacebookSell && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs font-sans text-slate-200"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
                      <h3 className="font-bold text-white text-sm">ফেসবুক পেমেন্ট বোনাস যুক্ত করুন</h3>
                      <button onClick={() => setSelectedFacebookSell(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        বিক্রেতা: <strong className="text-white">{selectedFacebookSell.username}</strong><br />
                        কার্ড: <strong className="font-mono text-indigo-400">{selectedFacebookSell.email}</strong>
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">কত টাকা বোনাস যুক্ত করবেন? (৳)</label>
                        <input 
                          type="number" 
                          value={facebookSellPaymentInput}
                          onChange={(e) => setFacebookSellPaymentInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <button 
                          onClick={handleApproveFacebookSell}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                        >
                          এপ্রুভ ও পেমেন্ট
                        </button>
                        <button 
                          onClick={handleDeclineFacebookSell}
                          className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30 font-bold py-3 rounded-xl transition cursor-pointer"
                        >
                          রিজেক্ট করুন
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* INSTAGRAM MODAL */}
            <AnimatePresence>
              {selectedInstagramSell && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs font-sans text-slate-200"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
                      <h3 className="font-bold text-white text-sm">ইন্সটাগ্রাম পেমেন্ট বোনাস যুক্ত করুন</h3>
                      <button onClick={() => setSelectedInstagramSell(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        বিক্রেতা: <strong className="text-white">{selectedInstagramSell.username}</strong><br />
                        কার্ড Username: <strong className="font-mono text-rose-400">{selectedInstagramSell.email || selectedInstagramSell.username}</strong>
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">কত টাকা বোনাস যুক্ত করবেন? (৳)</label>
                        <input 
                          type="number" 
                          value={instagramSellPaymentInput}
                          onChange={(e) => setInstagramSellPaymentInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <button 
                          onClick={handleApproveInstagramSell}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                        >
                          এপ্রুভ ও পেমেন্ট
                        </button>
                        <button 
                          onClick={handleDeclineInstagramSell}
                          className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30 font-bold py-3 rounded-xl transition cursor-pointer"
                        >
                          রিজেক্ট করুন
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 5: WORK APPLICATION REVIEW SUBMITTALS */}
        {adminTab === 'job-submissions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-base font-bold text-white tracking-wide">কাজের সাবমিশন ও স্ক্রিনশট রিভিউ</h2>

            {jobSubmissions.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                <CheckCheck className="text-slate-700 mx-auto mb-2" size={32} />
                <p className="text-slate-500 text-xs">কোনো কাজের প্রমাণপত্র পেন্ডিং নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobSubmissions.map(sub => (
                  <div key={sub.id} className="bg-slate-950 border border-slate-800 p-4.5 rounded-2xl space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-white text-xs">টাস্ক: {sub.jobTitle}</h4>
                        <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">কর্মী: {sub.workerName} (ID: {sub.workerId.substring(0, 8)}...)</span>
                      </div>
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[9px] uppercase font-bold">
                        Pending
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/60 font-medium text-xs leading-relaxed">
                      <span className="text-slate-500 block text-[10px] mb-1">কর্মী প্রদত্ত ফিডব্যাক বিবরণ:</span>
                      <p className="text-slate-300 font-semibold">{sub.feedback}</p>
                    </div>

                    {/* Screenshot images grids */}
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[10px] font-bold">কর্মী প্রদত্ত প্রমাণ ছবি সমূহ (ক্লিক টু ফুলস্ক্রীন):</span>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {sub.proofImages?.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            onClick={() => setFullscreenImage(url)}
                            className="w-full h-14 object-cover rounded-xl border border-slate-800 cursor-zoom-in active:scale-95 transition" 
                            alt="proof" 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setReviewRewardInput(String(sub.jobRewardAmount || 0.50));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
                      >
                        রিভিউ করুন (এপ্রুভ/রিজেক্ট)
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmState({
                            title: 'সাবমিশন রিজেক্ট নিশ্চিতকরণ',
                            message: 'আপনি কি নিশ্চিত এই সাবমিশনটি সরাসরি রিজেক্ট করতে চান?',
                            onConfirm: async () => {
                              try {
                                await remove(ref(db, `job_submissions/${sub.id}`));
                                showToast('সাবমিশন সরাসরি রিজেক্ট করা হয়েছে', 'success');
                              } catch (err: any) {
                                showToast('ত্রুটি: ' + err.message, 'err');
                              }
                            }
                          });
                        }}
                        className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/30 p-2.5 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submission approval modal */}
            <AnimatePresence>
              {selectedSubmission && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0.9 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-xs"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                      <h3 className="font-bold text-white text-sm">টাস্ক সাবমিশন চেক</h3>
                      <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="leading-relaxed text-slate-300">
                        কাজের টাইটেল: <strong className="text-white">{selectedSubmission.jobTitle}</strong><br />
                        কর্মী: <strong className="text-slate-400">{selectedSubmission.workerName}</strong>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-450 font-bold">কর্মী কত টাকা পুরস্কার পাবে? (৳)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={reviewRewardInput}
                          onChange={(e) => setReviewRewardInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button 
                          onClick={handleApproveSubmission}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition"
                        >
                          এপ্রুভ করুন ✔
                        </button>
                        <button 
                          onClick={handleDeclineSubmission}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
                        >
                          বাতিল ও রিজেক্ট
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 6: WITHDRAW APPROVALS */}
        {adminTab === 'withdraws' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base font-bold text-white tracking-wide">টাকা উত্তোলনের পেমেন্ট রিকোয়েস্ট</h2>
              <button
                onClick={() => handleExportSellsCSV('withdraws')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-md cursor-pointer animate-pulse"
              >
                <TrendingUp size={11} className="rotate-90" />
                <span>উত্তোলন রিকোয়েস্ট লিস্ট (.CSV)</span>
              </button>
            </div>

            {withdraws.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800">
                <CreditCard className="text-slate-700 mx-auto mb-2" size={32} />
                <p className="text-slate-500 text-xs">কোনো পেমেন্ট রিকোয়েস্ট পেন্ডিং নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdraws.map(item => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 p-4.5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-white text-xs">{item.email}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ইউজার আইডি: {item.userId}</span>
                      </div>
                      <span className="bg-orange-600/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-md text-[9px] uppercase font-bold">
                        Pending
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">পেমেন্ট মেথড:</span>
                        <span className={`font-black uppercase tracking-wide ${item.method === 'Bkash' ? 'text-pink-500' : 'text-amber-500'}`}>
                          {item.method}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">মোবাইল নম্বর:</span>
                        <strong className="text-white font-mono select-all text-sm">{item.number}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">উৎস (Source):</span>
                        <span className="bg-rose-500/20 text-rose-300 font-black px-1.5 py-0.5 rounded text-[9px] uppercase font-mono block w-fit">
                          {item.balanceType || 'main'}
                        </span>
                      </div>
                      <div className="col-span-3 pt-2 border-t border-slate-800 space-y-1 bg-slate-950/20 p-2.5 rounded-lg mt-1 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-[10px] font-bold">উত্তোলন মোট পরিমাণ:</span>
                          <strong className="text-white font-black font-mono">৳{(item.amount || 0).toFixed(2)}</strong>
                        </div>
                        {((item as any).feeAmount !== undefined || (item as any).feePercent !== undefined) && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="text-[10px] font-medium">উইথড্র ফি:</span>
                            <span className="font-mono text-red-400 text-[10.5px]">
                              -৳{((item as any).feeAmount || 0).toFixed(2)} ({((item as any).feePercent || 0)}%)
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-t border-slate-800/40 pt-1.5 mt-1">
                          <span className="text-teal-400 text-[10px] font-black uppercase">নিট পেমেন্ট (পাবে):</span>
                          <strong className="text-[#10b981] font-black font-mono text-sm">
                            ৳{((item as any).netAmount !== undefined ? (item as any).netAmount : ((item as any).amount - ((item as any).feeAmount || 0))).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5 text-xs font-bold">
                      <button 
                        onClick={() => handleProcessWithdraw(item, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition flex justify-center items-center gap-1"
                      >
                        <Check size={14} /> এপ্রুভ করুন (Paid)
                      </button>
                      <button 
                        onClick={() => setWithdrawalToReject(item)}
                        className="bg-red-950 hover:bg-red-900 text-red-500 hover:text-red-400 border border-red-900/30 p-2.5 rounded-xl transition flex justify-center items-center gap-1 cursor-pointer"
                      >
                        <X size={14} /> রিজেক্ট করুন ⚡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Reject Modal with 2 Options (Refund vs Deduct) */}
            <AnimatePresence>
              {withdrawalToReject && (
                <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-sm text-xs space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-sans">
                        <AlertCircle className="text-red-500" size={16} />
                        <span>উইথড্র রিজেক্ট অপশন নির্বাচন</span>
                      </h3>
                      <button onClick={() => setWithdrawalToReject(null)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-1.5 text-slate-300">
                        <div>ইউজার: <strong className="text-white font-sans">{withdrawalToReject.email}</strong></div>
                        <div>উত্তোলন মাধ্যম: <strong className="text-white select-all font-sans">{withdrawalToReject.method} ({withdrawalToReject.number})</strong></div>
                        <div>পরিমাণ: <strong className="text-emerald-500 font-mono font-black">৳{withdrawalToReject.amount.toFixed(2)}</strong></div>
                        <div>ব্যালেন্সের ধরন: <strong className="text-rose-455 font-mono uppercase">{withdrawalToReject.balanceType || 'main'}</strong></div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10.5px] text-slate-400 font-bold leading-relaxed">
                          পেমেন্ট রিজেক্ট করার পদ্ধতি এবং ইউজারের ব্যালেন্সের বিষয়ে সিদ্ধান্ত নিন:
                        </p>

                        {/* Option 1: Reject & Refund Balance */}
                        <button 
                          type="button"
                          onClick={async () => {
                            await handleProcessWithdraw(withdrawalToReject, 'rejected');
                            setWithdrawalToReject(null);
                          }}
                          className="w-full bg-slate-900 hover:bg-[#764ba2] text-slate-300 hover:text-white border border-slate-800 hover:border-violet-650 p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition cursor-pointer"
                        >
                          <span className="font-extrabold text-[12px] flex items-center gap-1">
                            💵 রিফান্ড সহ রিজেক্ট (Refund)
                          </span>
                          <span className="text-[10px] text-slate-400 leading-tight">
                            পেমেন্ট রিজেক্ট হবে এবং সম্পূর্ণ টাকা ইউজারের ব্যালেন্সে ফেরত চলে যাবে।
                          </span>
                        </button>

                        {/* Option 2: Reject & Keep deducted Balance */}
                        <button 
                          type="button"
                          onClick={async () => {
                            await handleProcessWithdraw(withdrawalToReject, 'rejected_deduct');
                            setWithdrawalToReject(null);
                          }}
                          className="w-full bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition cursor-pointer"
                        >
                          <span className="font-extrabold text-[12px] flex items-center gap-1 text-rose-500">
                            🔥 ব্যালেন্স কেটে নিয়ে রিজেক্ট (Deduct)
                          </span>
                          <span className="text-[10px] text-slate-400 leading-tight">
                            পেমেন্ট রিজেক্ট হবে এবং এই উত্তোলিত টাকা আর ফেরত দেওয়া হবে না (কেটে নেওয়া হবে)।
                          </span>
                        </button>
                      </div>

                      <button 
                        type="button"
                        onClick={() => setWithdrawalToReject(null)} 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white py-2.5 rounded-xl font-bold transition text-center cursor-pointer text-xs"
                      >
                        বন্ধ করুন
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 7: VIEW AD CAMPAIGNS ADDER PANEL */}
        {adminTab === 'ads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            <form onSubmit={handleAddAd} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                বিজ্ঞাপন যোগ করুন (মালিকানা বা Sponsored Ads)
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">বিজ্ঞাপনের শিরোনাম</label>
                <input 
                  type="text" 
                  placeholder="যেমন: স্পিন খেলে প্রতিদিন ৫০০ টাকা"
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">বিজ্ঞাপনের টার্গেট লিংক (URL)</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={newAdLink}
                  onChange={(e) => setNewAdLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">প্রতি দর্শনে উপহার ব্যালেন্স (৳)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="যেমন: ০.৫০"
                  value={newAdReward}
                  onChange={(e) => setNewAdReward(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-1.5"
              >
                <Plus size={16} />
                <span>বিজ্ঞাপন যোগ করুন</span>
              </button>
            </form>

            {/* Ads Lists Section */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-semibold text-white pl-1 text-xs uppercase tracking-wider">সক্রিয় বিজ্ঞাপনসমূহ:</h4>
              {ads.length === 0 ? (
                <p className="text-slate-500 text-xs pl-1">কোনো বিজ্ঞাপন ক্যাম্পেইন পাওয়া যায়নি</p>
              ) : (
                <div className="space-y-2">
                  {ads.map(ad => (
                    <div key={ad.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-4">
                        <strong className="text-white text-xs block truncate leading-normal">{ad.title}</strong>
                        <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">{ad.link}</span>
                        <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-2">
                          রিওয়ার্ড: ৳{ad.reward.toFixed(2)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="bg-red-950 text-red-500 hover:bg-red-900 p-2 border border-red-800/30 rounded-xl transition shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* VIEW 8: ADD QUICK TASKS Shortcuts */}
        {adminTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            <form onSubmit={handleAddTaskShort} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                হোম কাজ বা প্রচার প্রচারণা লিংক এড করুন
              </h3>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">কাজের আইকন ছবির লিংক (Icon Real URL)</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={newTaskIcon}
                  onChange={(e) => setNewTaskIcon(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">কাজের শিরোনাম / নাম</label>
                <input 
                  type="text" 
                  placeholder="যেমন: টেলিগ্রাম চ্যানেলে জয়েন হউন"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">টার্গেট লিংক (URL)</label>
                <input 
                  type="url" 
                  placeholder="https://t.me/..."
                  value={newTaskLink}
                  onChange={(e) => setNewTaskLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-1.5"
              >
                <Plus size={16} />
                <span>ফ্রি কাজের শর্টকাট এড করুন</span>
              </button>
            </form>

            {/* Existing tasks lists */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-semibold text-white pl-1 text-xs uppercase tracking-wider">বিদ্যমান প্রচার কাজসমূহ:</h4>
              {homeTasks.length === 0 ? (
                <p className="text-slate-500 text-xs pl-1">কোনো হোম প্রচার কাজ পাওয়া যায়নি</p>
              ) : (
                <div className="space-y-2">
                  {homeTasks.map(task => (
                    <div key={task.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-4 flex items-center gap-3">
                        <img src={task.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="Icon" />
                        <div className="min-w-0">
                          <strong className="text-white text-xs block truncate">{task.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">{task.link}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTaskShort(task.id)}
                        className="bg-red-950 text-red-500 hover:bg-red-900 p-2 border border-red-800/30 rounded-xl transition shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* VIEW 9: DAILY MILSTONE MISSIONS ADDER */}
        {adminTab === 'missions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            <form onSubmit={handleAddMission} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  {editingMissionId ? 'মিশন সংশোধন / সম্পাদনা' : 'নতুন ডেইলি মিশন যোগ করুন'}
                </h3>
                {editingMissionId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingMissionId(null);
                      setNewMissionTitle('');
                      setNewMissionTarget('10');
                      setNewMissionReward('50');
                      setMissionCategory('referral');
                      setMissionStartDate('');
                      setMissionEndDate('');
                    }}
                    className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded"
                  >
                    সম্পাদনা বাতিল করুন
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">মিশনের নাম / বিবরণ</label>
                <input 
                  type="text" 
                  placeholder="যেমন: ৫০ জন সফল রেফার পূর্ণ করুন"
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">টার্গেট পূরণ সংখ্যা</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: ৫০"
                    value={newMissionTarget}
                    onChange={(e) => setNewMissionTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">বোনাস রিওয়ার্ড (৳)</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: ২০০"
                    value={newMissionReward}
                    onChange={(e) => setNewMissionReward(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">ক্যাটেগরি (Category)</label>
                  <select 
                    value={missionCategory}
                    onChange={(e) => setMissionCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-550"
                  >
                    <option value="referral">👥 রেফারাল (Referral)</option>
                    <option value="task">💼 জব টাস্ক (Task)</option>
                    <option value="spin">🎯 স্পিন হুইল (Spin)</option>
                    <option value="special">✨ স্পেশাল (Special)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">শুরুর তারিখ </label>
                  <input 
                    type="date" 
                    value={missionStartDate}
                    onChange={(e) => setMissionStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-550 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">শেষের তারিখ </label>
                  <input 
                    type="date" 
                    value={missionEndDate}
                    onChange={(e) => setMissionEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-550 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-1.5 cursor-pointer text-xs"
              >
                <Plus size={16} />
                <span>{editingMissionId ? 'মিশন আপডেট করুন ✔' : 'মিশন সংরক্ষণ করুন 💾'}</span>
              </button>
            </form>

            {/* List existing milestones */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-semibold text-white pl-1 text-xs uppercase tracking-wider">বিদ্যমান মিশন তালিকা:</h4>
              {missions.length === 0 ? (
                <p className="text-slate-500 text-xs pl-1">কোনো একটিভ রিওয়ার্ড মিশন পাওয়া যায়নি</p>
              ) : (
                <div className="space-y-2">
                  {missions.map(m => (
                    <div key={m.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-xs block leading-normal">{m.title}</strong>
                          <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[8px] uppercase font-black">{m.category || 'referral'}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-normal mt-1">
                          টার্গেট: {m.target} বার | রিওয়ার্ড: ৳{m.reward}
                          {m.startDate && ` | মেয়াদ: ${m.startDate} হতে ${m.endDate || 'চলমান'}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setEditingMissionId(m.id);
                            setNewMissionTitle(m.title);
                            setNewMissionTarget(String(m.target));
                            setNewMissionReward(String(m.reward));
                            setMissionCategory(m.category || 'referral');
                            setMissionStartDate(m.startDate || '');
                            setMissionEndDate(m.endDate || '');
                          }}
                          className="bg-slate-800 text-blue-400 hover:bg-slate-700 p-2.5 border border-slate-700 rounded-xl transition cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Settings size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMission(m.id)}
                          className="bg-red-950 text-red-500 hover:bg-red-900 p-2.5 border border-red-800/30 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* VIEW 11: CAMPAIGNS LIST & DELETION */}
        {adminTab === 'campaigns' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-1">
                সক্রিয় কাজের ক্যাম্পেইনসমূহ (Active Job Campaigns)
              </h3>
              <p className="text-slate-500 text-[11px] mb-0">ইউজার বা এডমিন দ্বারা পোস্ট করা সকল মাইক্রো জব ক্যাম্পেইন এখানে দেখছেন। আপনি চাইলে যেকোনো ক্যাম্পেইন ডিলিট করতে পারেন।</p>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl text-center">
                  <Briefcase size={28} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs">কোনো ক্যাম্পেইন পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-1">
                  {jobs.map(job => (
                    <div key={job.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4 justify-between items-start">
                      <div className="flex gap-3 items-start min-w-0 flex-1">
                        <img 
                          src={job.imageUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100'} 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" 
                          alt="Campaign Thumbnail" 
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white text-xs font-bold leading-snug line-clamp-1">{job.title}</h4>
                          <p className="text-slate-400 text-[10px] mt-1 line-clamp-2 leading-relaxed">{job.description}</p>
                          
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              প্রতি টাস্ক: ৳{(job.perTaskReward || 0).toFixed(2)}
                            </span>
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                              বাজেট: ৳{(job.totalBudget || 0).toFixed(2)}
                            </span>
                            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                              স্লট: {job.remainingSlots}/{job.totalSlots}
                            </span>
                          </div>
                          
                          <div className="text-[9px] text-slate-500 font-mono mt-1.5 truncate">
                            পোস্টার আইডি: {job.posterId || 'Admin'}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-950/70 text-red-500 hover:bg-red-900 border border-red-800/20 hover:text-white p-2.5 rounded-xl transition shrink-0"
                        title="Delete Campaign"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 9.5: EXTERNAL WEBSITES MANAGEMENT (NEW FEATURE) */}
        {adminTab === 'websites' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            {/* Add/Edit Website Form Card */}
            <form onSubmit={handleAddWebsite} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800 font-sans flex items-center justify-between">
                <span>{editingWebsiteId ? '🔧 ওয়েবসাইট কনফিগারেশন আপডেট করুন' : '➕ নতুন ওয়েবসাইট (Nova Shop-এর মতো) যোগ করুন'}</span>
                {editingWebsiteId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingWebsiteId(null);
                      setWebName('');
                      setWebUrl('');
                      setWebDescription('');
                      setWebIconName('ShoppingBag');
                      setWebAccentColor('from-violet-600 to-indigo-700');
                      setWebMaintEnabled(false);
                      setWebMaintMsg('');
                    }}
                    className="text-stone-400 hover:text-white font-bold text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl transition"
                  >
                    নতুন যোগ করতে ফিরে যান
                  </button>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">ওয়েবসাইটের নাম (Website Name) *</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: Nova Shop Premium, Top Earning Guide"
                    value={webName}
                    onChange={(e) => setWebName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">ওয়েবসাইট লিঙ্ক / URL *</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">সংক্ষিপ্ত বিবরণ (Description) *</label>
                <input 
                  type="text" 
                  placeholder="যেমন: এখানে আপনি প্রিমিয়াম থিম, সোর্স কোড ও ফাইল পাবেন"
                  value={webDescription}
                  onChange={(e) => setWebDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Preset Accent Color Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">অ্যাকসেন্ট রঙের থিম (Gradient Accent Vibe)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { class: 'from-violet-600 to-indigo-700', label: 'Indigo' },
                      { class: 'from-emerald-650 to-teal-700', label: 'Teal' },
                      { class: 'from-amber-500 to-rose-600', label: 'Sunset' },
                      { class: 'from-rose-600 to-red-700', label: 'Red' },
                      { class: 'from-pink-600 to-purple-700', label: 'Magenta' },
                      { class: 'from-slate-700 to-stone-900', label: 'Slate' }
                    ].map(theme => (
                      <button
                        key={theme.class}
                        type="button"
                        onClick={() => setWebAccentColor(theme.class)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-r text-white transition border ${
                          webAccentColor === theme.class ? 'border-amber-300 scale-105 shadow-md shadow-amber-300/10' : 'border-transparent opacity-80 hover:opacity-100'
                        } ${theme.class}`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Icon Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">আইকন Preset</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'ShoppingBag', label: 'ব্যাগ' },
                      { key: 'Globe', label: 'গ্লোব' },
                      { key: 'Award', label: 'স্টার' },
                      { key: 'Smartphone', label: 'লিঙ্ক' },
                      { key: 'Briefcase', label: 'জব' }
                    ].map(icon => (
                      <button
                        key={icon.key}
                        type="button"
                        onClick={() => setWebIconName(icon.key)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-bold transition border ${
                          webIconName === icon.key 
                            ? 'bg-rose-600 text-white border-rose-500' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        {icon.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Maintenance Control */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">রক্ষণাবেক্ষণ মোড (Maintenance Mode)</h4>
                    <p className="text-[10.5px] text-slate-500">এই সাইটটির অ্যাক্সেস বন্ধ রেখে রক্ষণাবেক্ষণ মেসেজ দেখান</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setWebMaintEnabled(!webMaintEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition ${webMaintEnabled ? 'bg-amber-600 text-right' : 'bg-slate-800 text-left'}`}
                  >
                    <span className="inline-block w-5 h-5 bg-white rounded-full shadow-md"></span>
                  </button>
                </div>

                {webMaintEnabled && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block pl-0.5">রক্ষণাবেক্ষণ বার্তা (Maintenance Message)</label>
                    <input 
                      type="text" 
                      placeholder="সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের এই সেবাটি বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।"
                      value={webMaintMsg}
                      onChange={(e) => setWebMaintMsg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-600 transition"
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold tracking-wider transition text-xs shadow-md cursor-pointer"
              >
                {editingWebsiteId ? 'হালনাগাদ সম্পন্ন করুন ✔' : 'নভাশপের মতো নতুন ওয়েবসাইট যুক্ত করুন ✔'}
              </button>
            </form>

            {/* Websites Table List */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800 font-sans mb-4">
                সংযুক্ত ওয়েবসাইটসমূহ ({websites.length})
              </h3>

              {websites.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  এখন পর্যন্ত কোনো অতিরিক্ত ওয়েবসাইট যোগ করা হয়নি। উপরে ফরমটি ব্যবহার করে প্রথম সাইট যোগ করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {websites.map(web => {
                    return (
                      <div 
                        key={web.id} 
                        className={`p-4 border rounded-2xl flex items-start justify-between shadow-xs transition hover:scale-[1.005] ${
                          web.maintenanceEnabled 
                            ? 'border-amber-900 bg-amber-950/10' 
                            : 'border-slate-800 bg-slate-900/40'
                        }`}
                      >
                        <div className="flex gap-3 items-start truncate mr-1.5 flex-1">
                          <div className={`p-2.5 rounded-xl text-white shrink-0 bg-gradient-to-tr ${web.accentColor || 'from-violet-600 to-indigo-700'}`}>
                            {web.iconName === 'ShoppingBag' && <ShoppingBag size={18} />}
                            {web.iconName === 'Globe' && <Globe size={18} />}
                            {web.iconName === 'Award' && <Award size={18} />}
                            {web.iconName === 'Smartphone' && <Smartphone size={18} />}
                            {web.iconName === 'Briefcase' && <Briefcase size={18} />}
                          </div>
                          <div className="truncate flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <h4 className="font-bold text-white text-[13px] truncate leading-tight">{web.name}</h4>
                              {web.maintenanceEnabled && (
                                <span className="bg-amber-500/20 text-amber-200 border border-amber-500/30 font-black text-[7.5px] px-1.5 py-0.5 rounded-full uppercase leading-none shrink-0 scale-90">রক্ষণাবেক্ষণ</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-tight truncate">{web.description}</p>
                            <a 
                              href={web.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-mono hover:underline truncate mt-1 leading-normal"
                            >
                              <span>{web.url}</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => handleEditWebsite(web)}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-rose-500 hover:text-white p-2 rounded-xl transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteWebsite(web.id)}
                            className="bg-red-950/50 border border-red-900/30 hover:bg-red-900 text-red-400 hover:text-white p-2 rounded-xl transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* VIEW 10: SETTINGS CONFIGS MANAGEMENT */}
        {adminTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            <form onSubmit={handleSaveGlobalConfigs} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800 font-sans">
                সিস্টেম গ্লোবাল প্যারামিটার কনফিগারেশনসমূহ
              </h3>

              {/* 3x3 Bento-Grid for Admin Global Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* CARD 1: উইথড্রয়াল লিমিটসমূহ */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-teal-400 font-black tracking-wider uppercase block mb-1">উইথড্রয়াল মিনিমাম লিমিটসমূহ</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">প্রতিটি অ্যাকাউন্টের ব্যালেন্স উত্তোলনের জন্য সর্বনিম্ন সীমা এটি।</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">Main Bal (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawLimit}
                          onChange={(e) => setSetMinWithdrawLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">Gmail (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawGmailLimit}
                          onChange={(e) => setSetMinWithdrawGmailLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">Telegram (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawTelegramLimit}
                          onChange={(e) => setSetMinWithdrawTelegramLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">WhatsApp (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawWhatsappLimit}
                          onChange={(e) => setSetMinWithdrawWhatsappLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">Facebook (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawFacebookLimit}
                          onChange={(e) => setSetMinWithdrawFacebookLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">Instagram (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawInstagramLimit}
                          onChange={(e) => setSetMinWithdrawInstagramLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">Ads/Adsterra (৳)</label>
                        <input 
                          type="number" 
                          value={setMinWithdrawAdsLimit}
                          onChange={(e) => setSetMinWithdrawAdsLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3.5 border-t border-slate-805/40">
                      <label className="text-teal-400 text-[10.5px] font-black tracking-wide block">উইথড্র ফি চার্জ পার্সেন্ট (Withdraw Fee %)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="0"
                          value={withdrawFeePercentState}
                          onChange={(e) => setWithdrawFeePercentState(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pr-8 text-xs outline-none focus:border-teal-500 font-extrabold font-mono text-white"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500">%</span>
                      </div>
                      <p className="text-[8px] text-slate-500 leading-normal">টাকা উইথড্র করার সময এডমিন চার্জ হিসেবে এই পারসেন্ট কেটে রাখা হবে।</p>
                    </div>

                    <div className="space-y-1.5 pt-3.5 border-t border-slate-805/40">
                      <label className="text-teal-400 text-[10.5px] font-black tracking-wide block">ডিপোজিট ফি চার্জ পার্সেন্ট (Deposit Fee %)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="0"
                          value={depositFeePercentState}
                          onChange={(e) => setDepositFeePercentState(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pr-8 text-xs outline-none focus:border-teal-500 font-extrabold font-mono text-white"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500">%</span>
                      </div>
                      <p className="text-[8px] text-slate-500 leading-normal">ইউজার ডিপোজিট করার সময এডমিন চার্জ হিসেবে এই পারসেন্ট কেটে রাখা হবে।</p>
                    </div>
                  </div>
                </div>

                 {/* CARD 2: জিমেইল সিকিউরিটি ও প্রাইস */}
                {(isSuperAdmin || permissions.settings || permissions.gmailPriceSecurity) && (
                  <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-sky-400 font-black tracking-wider uppercase block mb-1">জিমেইল সিকিউরিটি ও প্রাইস</span>
                      <p className="text-slate-500 text-[9px] leading-relaxed mb-3">জিমেইল ক্রিয়েশন সাবমিটের ক্রয় মূল্য এবং একাউন্ট রিট্রিভাল মাস্টার পাসওয়ার্ড।</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">ক্রয় মূল্য (৳)</label>
                          <input 
                            type="number" 
                            value={setGmailBuyPrice}
                            onChange={(e) => setSetGmailBuyPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-bold font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">মাস্টার পাসওয়ার্ড (Open Pass)</label>
                          <input 
                            type="text" 
                            value={setGmailOpenPassword}
                            onChange={(e) => setSetGmailOpenPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-bold text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">সাবমিট করার শেষ সময় ও তারিখ (Deadline)</label>
                          <input 
                            type="datetime-local" 
                            value={setGmailLastDate}
                            onChange={(e) => setSetGmailLastDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-bold text-white font-sans"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">দৈনিক লিমিট (০=আনলিমিটেড)</label>
                            <input 
                              type="number" 
                              value={gmailDailyLimit}
                              onChange={(e) => setGmailDailyLimit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-bold font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">টিউটোরিয়াল ভিডিও লিংক (URL)</label>
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={gmailTutorialUrl}
                              onChange={(e) => setGmailTutorialUrl(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-bold text-white font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD 3: টেলিগ্রাম সিকিউরিটি ও প্রাইস */}
                {(isSuperAdmin || permissions.settings || permissions.telegramPriceSecurity) && (
                  <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-sky-450 font-black tracking-wider uppercase block mb-1">টেলিগ্রাম সিকিউরিটি ও প্রাইস</span>
                      <p className="text-slate-500 text-[9px] leading-relaxed mb-3">টেলিগ্রাম নাম্বার সাবমিটের ক্রয়মূল্য এবং একাউন্ট রিট্রিভাল মাস্টার পাসওয়ার্ড।</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">ক্রয় মূল্য (৳)</label>
                          <input 
                            type="number" 
                            value={setTelegramBuyPrice}
                            onChange={(e) => setSetTelegramBuyPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-450 font-bold font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">মাস্টার পাসওয়ার্ড (Open Pass)</label>
                          <input 
                            type="text" 
                            value={setTelegramOpenPassword}
                            onChange={(e) => setSetTelegramOpenPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-450 font-bold text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">সাবমিট করার শেষ সময় ও তারিখ (Deadline)</label>
                          <input 
                            type="datetime-local" 
                            value={setTelegramLastDate}
                            onChange={(e) => setSetTelegramLastDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-450 font-bold text-white font-sans"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">দৈনিক লিমিট (০=আনলিমিটেড)</label>
                            <input 
                              type="number" 
                              value={telegramDailyLimit}
                              onChange={(e) => setTelegramDailyLimit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-450 font-bold font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">টিউটোরিয়াল ভিডিও লিংক (URL)</label>
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={telegramTutorialUrl}
                              onChange={(e) => setTelegramTutorialUrl(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-450 font-bold text-white font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD 4: হোয়াটসঅ্যাপ সিকিউরিটি ও প্রাইস */}
                {(isSuperAdmin || permissions.settings || permissions.whatsappPriceSecurity) && (
                  <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase block mb-1">হোয়াটসঅ্যাপ সিকিউরিটি ও প্রাইস</span>
                      <p className="text-slate-500 text-[9px] leading-relaxed mb-3">হোয়াটসঅ্যাপ নাম্বার সাবমিটের ক্রয়মূল্য এবং একাউন্ট রিট্রিভাল মাস্টার পাসওয়ার্ড।</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">ক্রয় মূল্য (৳)</label>
                          <input 
                            type="number" 
                            value={setWhatsappBuyPrice}
                            onChange={(e) => setSetWhatsappBuyPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-bold font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">মাস্টার পাসওয়ার্ড (Open Pass)</label>
                          <input 
                            type="text" 
                            value={setWhatsappOpenPassword}
                            onChange={(e) => setSetWhatsappOpenPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-bold text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">সাবমিট করার শেষ সময় ও তারিখ (Deadline)</label>
                          <input 
                            type="datetime-local" 
                            value={setWhatsappLastDate}
                            onChange={(e) => setSetWhatsappLastDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-bold text-white font-sans"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">দৈনিক লিমিট (০=আনলিমিটেড)</label>
                            <input 
                              type="number" 
                              value={whatsappDailyLimit}
                              onChange={(e) => setWhatsappDailyLimit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-bold font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">টিউটোরিয়াল ভিডিও লিংক (URL)</label>
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={whatsappTutorialUrl}
                              onChange={(e) => setWhatsappTutorialUrl(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-bold text-white font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD 5: ফেসবুক সিকিউরিটি ও প্রাইস */}
                {(isSuperAdmin || permissions.settings || permissions.facebookPriceSecurity) && (
                  <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase block mb-1">ফেসবুক সিকিউরিটি ও প্রাইস</span>
                      <p className="text-slate-500 text-[9px] leading-relaxed mb-3">ফেসবুক একাউন্ট সাবমিটের ক্রয়মূল্য এবং একাউন্ট রিট্রিভাল মাস্টার পাসওয়ার্ড।</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">ক্রয় মূল্য (৳)</label>
                          <input 
                            type="number" 
                            value={setFacebookBuyPrice}
                            onChange={(e) => setSetFacebookBuyPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-bold font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">মাস্টার পাসওয়ার্ড (Open Pass)</label>
                          <input 
                            type="text" 
                            value={setFacebookOpenPassword}
                            onChange={(e) => setSetFacebookOpenPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-bold text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">সাবমিট করার শেষ সময় ও তারিখ (Deadline)</label>
                          <input 
                            type="datetime-local" 
                            value={setFacebookLastDate}
                            onChange={(e) => setSetFacebookLastDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-bold text-white font-sans"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">দৈনিক লিমিট (০=আনলিমিটেড)</label>
                            <input 
                              type="number" 
                              value={facebookDailyLimit}
                              onChange={(e) => setFacebookDailyLimit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-bold font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">টিউটোরিয়াল ভিডিও লিংক (URL)</label>
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={facebookTutorialUrl}
                              onChange={(e) => setFacebookTutorialUrl(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-bold text-white font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD: ইন্সটাগ্রাম সিকিউরিটি ও প্রাইস */}
                {(isSuperAdmin || permissions.settings || permissions.instagramPriceSecurity) && (
                  <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase block mb-1">ইন্সটাগ্রাম সিকিউরিটি ও প্রাইস</span>
                      <p className="text-slate-500 text-[9px] leading-relaxed mb-3">ইন্সটাগ্রাম একাউন্ট সাবমিটের ক্রয়মূল্য এবং একাউন্ট রিট্রিভাল মাস্টার পাসওয়ার্ড।</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">ক্রয় মূল্য (৳)</label>
                          <input 
                            type="number" 
                            value={setInstagramBuyPrice}
                            onChange={(e) => setSetInstagramBuyPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500 font-bold font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">মাস্টার পাসওয়ার্ড (Open Pass)</label>
                          <input 
                            type="text" 
                            value={setInstagramOpenPassword}
                            onChange={(e) => setSetInstagramOpenPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500 font-bold text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] font-bold">সাবমিট করার শেষ সময় ও তারিখ (Deadline)</label>
                          <input 
                            type="datetime-local" 
                            value={setInstagramLastDate}
                            onChange={(e) => setSetInstagramLastDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500 font-bold text-white font-sans"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">দৈনিক লিমিট (০=আনলিমিটেড)</label>
                            <input 
                              type="number" 
                              value={instagramDailyLimit}
                              onChange={(e) => setInstagramDailyLimit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500 font-bold font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[9px] font-bold">টিউটোরিয়াল ভিডিও লিংক (URL)</label>
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={instagramTutorialUrl}
                              onChange={(e) => setInstagramTutorialUrl(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500 font-bold text-white font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD 6: রুট ডোমেন ও অ্যাপ্লিকেশন ডাউনলোড লিংক */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-purple-400 font-black tracking-wider uppercase block mb-1">ডোমেন ও মোবাইল অ্যাপ্লিকেশন লিংক</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">রেফারাল প্রোগ্রামের শেয়ারেবল বেস ডোমেন এবং ইউজারদের অ্যাপ ডাউনলোডের জন্য কাঙ্ক্ষিত APK লিংক।</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">রেফারাল রুট ডোমেন URL</label>
                        <input 
                          type="text" 
                          value={setReferralRootLink}
                          onChange={(e) => setSetReferralRootLink(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">মোবাইল অ্যাপ APK ডাউনলোড URL</label>
                        <input 
                          type="url" 
                          placeholder="https://..."
                          value={setAppDownloadUrl}
                          onChange={(e) => setSetAppDownloadUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500 font-bold font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD: টিক ট্যাক টো গেম ও ইনকাম সেটিংস */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-fuchsia-400 font-black tracking-wider uppercase block mb-1">টিক ট্যাক টো গেম ও ইনকাম সেটিংস</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">টিক ট্যাক টো গেমের জন্য দৈনিক ফ্রী খেলার লিমিট এবং জয়ের রিওয়ার্ড রেট ঠিক করুন।</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">দৈনিক ফ্রী খেলার লিমিট (ম্যাচ সংখ্যা)</label>
                        <input 
                          type="number" 
                          value={gameDailyLimit}
                          onChange={(e) => setGameDailyLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-fuchsia-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">ফ্রী ম্যাচে জয়ের পুরস্কার (৳)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={gameFreeReward}
                          onChange={(e) => setGameFreeReward(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-fuchsia-500 font-bold font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD: লাকি স্ক্র্যাচ কার্ড গেম সেটিংস */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-teal-400 font-black tracking-wider uppercase block mb-1">লাকি স্ক্র্যাচ কার্ড গেম সেটিংস</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">স্ক্র্যাচ কার্ড গেমের জন্য কার্ডের মূল্য, দৈনিক লিমিট, পুরস্কার এবং রক্ষণাবেক্ষণ মোড কনফিগার করুন।</p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">প্রতি কার্ডের মূল্য (৳)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={scratchCardPrice}
                            onChange={(e) => setScratchCardPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">দৈনিক খেলার লিমিট</label>
                          <input 
                            type="number" 
                            value={scratchDailyLimit}
                            onChange={(e) => setScratchDailyLimit(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9px] font-bold">সম্ভাব্য পুরস্কারের তালিকা (কমা দিয়ে লিখুন)</label>
                        <input 
                          type="text" 
                          value={scratchRewards}
                          onChange={(e) => setScratchRewards(e.target.value)}
                          placeholder="যেমন: 0.5,1,2,5,10,0.2"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-teal-500 font-bold font-mono text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          type="checkbox" 
                          id="scratchMaintEnabled"
                          checked={scratchMaintEnabled}
                          onChange={(e) => setScratchMaintEnabled(e.target.checked)}
                          className="rounded text-teal-500 focus:ring-teal-500 bg-slate-950 border-slate-800"
                        />
                        <label htmlFor="scratchMaintEnabled" className="text-slate-300 text-[10px] font-bold cursor-pointer">রক্ষণাবেক্ষণ (Maintenance) চালু করুন</label>
                      </div>

                      {scratchMaintEnabled && (
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">রক্ষণাবেক্ষণ বার্তা</label>
                          <input 
                            type="text" 
                            value={scratchMaintMsg}
                            onChange={(e) => setScratchMaintMsg(e.target.value)}
                            placeholder="সাময়িক রক্ষণাবেক্ষণ চলছে..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs outline-none focus:border-teal-500 text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD 7: গেটওয়ে নম্বরসমূহ */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-amber-500 font-black tracking-wider uppercase block mb-1">একাউন্ট এক্টিভেশন ও গেটওয়ে নম্বর সমূহ</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">নতুন ইউজারদের একাউন্ট ভেরিফাই এক্টিভেশন চার্জ এবং পেমেন্ট রিসিভ করার নম্বরসমূহ কনফিগার করুন।</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">একাউন্ট এক্টিভেশন ফি (৳)</label>
                        <input 
                          type="number" 
                          value={activationPrice}
                          onChange={(e) => setActivationPrice(e.target.value)}
                          placeholder="100"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] outline-none focus:border-amber-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">বিকাশ পার্সোনাল নম্বর</label>
                        <input 
                          type="text" 
                          value={setBkashNumber}
                          onChange={(e) => setSetBkashNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-amber-500 font-bold font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">নগদ পার্সোনাল নম্বর</label>
                        <input 
                          type="text" 
                          value={setNagadNumber}
                          onChange={(e) => setSetNagadNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-amber-500 font-bold font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 8: লাকি স্পিন ও স্ক্রলিং রানিং নোটিশ */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-pink-400 font-black tracking-wider uppercase block mb-1">লাকি স্পিন হুইল ও রানিং মারকুই নোটিশ</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">স্পিন গেমের পুরষ্কার তালিকা এবং হোম পেজের স্ক্রলিং নির্দেশনা বার।</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">স্পিন রিওয়ার্ড সিকোয়েন্স (Comma list)</label>
                        <input 
                          type="text" 
                          value={spinRewards}
                          onChange={(e) => setSpinRewards(e.target.value)}
                          placeholder="0.10,0.25,0.50,0.00,1.50,3.00,5.00,10.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-pink-500 font-bold font-mono tracking-wider text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">হোম স্ক্রীন স্ক্রলিং নোটিশ মেসেজ</label>
                        <input 
                          type="text" 
                          value={runningNotice}
                          onChange={(e) => setRunningNotice(e.target.value)}
                          placeholder="যেমন: স্বাগতম! আজকে জিমেইল ক্রিয়েশন প্রতি কাজে বোনাস..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-pink-500 font-bold text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 9: পপআপ প্রমোশন ও ইমার্জেন্সি অ্যাপ লকার */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-rose-450 font-black tracking-wider uppercase block">পপআপ খবর ও লকডাউন স্টেট</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={popupEnabled} 
                          onChange={(e) => setPopupEnabled(e.target.checked)} 
                          className="sr-only"
                        />
                        <div className={`w-8 h-4 rounded-full transition-colors relative mr-1.5 ${popupEnabled ? 'bg-rose-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${popupEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="ml-1 text-[8px] font-bold text-slate-400">{popupEnabled ? 'পপআপ অন' : 'পপআপ অফ'}</span>
                      </label>
                    </div>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-2.5">ইউজার হোম পেজে পপআপ খবর শো করা এবং সমগ্র অ্যাপ ব্লক বা লক করার গ্লোবাল কিলার সুইচ।</p>
                    
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">পপআপ শিরোনাম</label>
                          <input 
                            type="text" 
                            value={popupTitle}
                            onChange={(e) => setPopupTitle(e.target.value)}
                            placeholder="যেমন: ধামাকা অফার!"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] outline-none text-white focus:border-rose-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">ইমেজ URL</label>
                          <input 
                            type="text" 
                            value={popupImageUrl}
                            onChange={(e) => setPopupImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] outline-none text-white focus:border-rose-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">পপআপ মেসেজ</label>
                          <input 
                            type="text" 
                            value={popupMessage}
                            onChange={(e) => setPopupMessage(e.target.value)}
                            placeholder="পপআপ বিবরণ লিখুন"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] outline-none text-white focus:border-rose-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9px] font-bold">পপআপ লিংক (Popup Link)</label>
                          <input 
                            type="text" 
                            value={popupLink}
                            onChange={(e) => setPopupLink(e.target.value)}
                            placeholder="যেমন: https://t.me/yourchannel"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] outline-none text-white focus:border-rose-500"
                          />
                        </div>
                      </div>

                      {/* Global Lockdown with red high-trust warning */}
                      <div className="pt-2 border-t border-slate-850 flex flex-col gap-1.5 bg-rose-950/20 p-2 rounded-xl border border-rose-900/30">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-rose-500 font-extrabold flex items-center gap-1">🚨 ইমার্জেন্সি অ্যাপ লকডাউন</span>
                          <label className="relative inline-flex items-center cursor-pointer font-sans">
                            <input 
                              type="checkbox" 
                              checked={emergencyEnabled} 
                              onChange={(e) => setEmergencyEnabled(e.target.checked)} 
                              className="sr-only peer"
                            />
                            <div className="w-7 h-3.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-red-650"></div>
                            <span className="ml-1 text-[8px] font-bold text-red-500">{emergencyEnabled ? 'সচল' : 'বন্ধ'}</span>
                          </label>
                        </div>
                        <input 
                          type="text" 
                          value={emergencyMessage}
                          onChange={(e) => setEmergencyMessage(e.target.value)}
                          placeholder="সাময়িক মেইনটেন্যান্স চলছে..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-[9px] outline-none text-white focus:border-red-500 font-sans"
                        />
                      </div>

                      {/* Hide Master Passwords state */}
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between bg-indigo-950/20 p-2 rounded-xl border border-indigo-900/30">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-indigo-400 font-extrabold flex items-center gap-1">🤫 মাস্টার পাসওয়ার্ড হাইড করুন?</span>
                          <span className="text-[7.5px] text-slate-400">সচল করলে ইউজাররা মাস্টার পাসওয়ার্ড দেখতে পারবে না</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer font-sans">
                          <input 
                            type="checkbox" 
                            checked={hideMasterPasswords} 
                            onChange={(e) => setHideMasterPasswords(e.target.checked)} 
                            className="sr-only"
                          />
                          <div className={`w-8 h-4 rounded-full transition-colors relative mr-1.5 ${hideMasterPasswords ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${hideMasterPasswords ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                          <span className="ml-1 text-[8px] font-bold text-indigo-400">{hideMasterPasswords ? 'হাইড' : 'শো'}</span>
                        </label>
                      </div>

                      {/* Full Site Maintenance state */}
                      <div className="pt-2 border-t border-slate-850 flex flex-col gap-1.5 bg-amber-950/20 p-2 rounded-xl border border-amber-900/30">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-amber-500 font-extrabold flex items-center gap-1">🚧 ফুল সাইট মেইনটেন্যান্স  (Full Site Maintenance)</span>
                            <span className="text-[7px] text-slate-400">সচল করলে শুধু এডমিন সাইটে ঢুকতে পারবেন। সাধারণ মেম্বার লকআউট হবে।</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer font-sans">
                            <input 
                              type="checkbox" 
                              checked={siteMaintenanceEnabled} 
                              onChange={(e) => setSiteMaintenanceEnabled(e.target.checked)} 
                              className="sr-only"
                            />
                            <div className={`w-8 h-4 rounded-full transition-colors relative mr-1.5 ${siteMaintenanceEnabled ? 'bg-amber-600' : 'bg-slate-800'}`}>
                              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${siteMaintenanceEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="ml-1 text-[8px] font-bold text-amber-500">{siteMaintenanceEnabled ? 'অন' : 'অফ'}</span>
                          </label>
                        </div>
                        <input 
                          type="text" 
                          value={siteMaintenanceMessage}
                          onChange={(e) => setSiteMaintenanceMessage(e.target.value)}
                          placeholder="রক্ষণাবেক্ষণের নোটিশ লিখুন (যেমন: সিস্টেম আপগ্রেড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...)"
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-[9px] outline-none text-white focus:border-amber-500 font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 9.5: সাইনআপ বোনাস কন্ট্রোল */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase block">সাইনআপ বোনাস সিস্টেম</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={signupBonusEnabled} 
                          onChange={(e) => setSignupBonusEnabled(e.target.checked)} 
                          className="sr-only"
                        />
                        <div className={`w-8 h-4 rounded-full transition-colors relative mr-1.5 ${signupBonusEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${signupBonusEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="ml-1 text-[8px] font-bold text-slate-400">{signupBonusEnabled ? 'বোনাস অন' : 'বোনাস অফ'}</span>
                      </label>
                    </div>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-2.5">নতুন ইউজার রেজিস্ট্রেশন বা সাইনআপ করার পর স্বয়ংক্রিয়ভাবে অ্যাকাউন্ট ব্যালেন্সে বোনাস ক্রেডিট ট্রানজেকশন যোগ করার অফার ইন্টিগ্রেশন।</p>
                    
                    <div className="space-y-2.5 flex-1 flex flex-col justify-end">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">বোনাস অ্যামাউন্ট (৳ Price)</label>
                        <input 
                          type="number" 
                          value={signupBonusAmount}
                          onChange={(e) => setSignupBonusAmount(e.target.value)}
                          placeholder="যেমন: ১০ বা ২০"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs outline-none text-white focus:border-emerald-500 font-sans font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 10: সাপোর্ট টিম অপশনসমূহ ও লিংক */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase block mb-1">কাস্টমার সাপোর্ট ও হেল্পডেস্ক লিংক</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">ইউজার মেন্যু এবং ট্রাস্ট জোনে দেখানোর জন্য অফিশিয়াল সাপোর্ট লিংক ও সোশ্যাল মিডিয়া হ্যান্ডেলসমূহ।</p>
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">টেলিগ্রাম চ্যানেল লিংক (Telegram Channel)</label>
                        <input 
                          type="text" 
                          value={supportTelegramChannel}
                          onChange={(e) => setSupportTelegramChannel(e.target.value)}
                          placeholder="https://t.me/yourchannel"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">টেলিগ্রাম গ্রুপ লিংক (Telegram Group)</label>
                        <input 
                          type="text" 
                          value={supportTelegramGroup}
                          onChange={(e) => setSupportTelegramGroup(e.target.value)}
                          placeholder="https://t.me/yourgroup"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">টেলিগ্রাম এডমিন আইডি (Admin User/Link)</label>
                        <input 
                          type="text" 
                          value={supportTelegramAdmin}
                          onChange={(e) => setSupportTelegramAdmin(e.target.value)}
                          placeholder="https://t.me/your_admin"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">ফেসবুক পেজ লিংক (Facebook Page)</label>
                        <input 
                          type="text" 
                          value={supportFacebookPage}
                          onChange={(e) => setSupportFacebookPage(e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">হোয়াটসঅ্যাপ নাম্বার বা লিংক (WhatsApp Link)</label>
                        <input 
                          type="text" 
                          value={supportWhatsAppNumber}
                          onChange={(e) => setSupportWhatsAppNumber(e.target.value)}
                          placeholder="https://wa.me/8801700000000"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 11: টেলিগ্রাম বট অটোমেশন সেটিংস */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-sky-400 font-black tracking-wider uppercase block mb-1">🤖 টেলিগ্রাম ইউজার বট অটোমেশন (User Bot)</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">সাধারণ গ্রাহকদের ব্যবহারের জন্য চ্যাটবট কনফিগার করুন। ইউজাররা এই বটের মাধ্যমে ব্যালেন্স, স্পিন, একাউন্ট বিক্রয় ইত্যাদি করতে পারবেন।</p>
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">ইউজার বট টোকেন (User Bot Token)</label>
                        <input 
                          type="text" 
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-mono text-white text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">ইউজার ড্যাশবোর্ড চ্যানেল আইডি (Channel ID)</label>
                        <input 
                          type="text" 
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="-100XXXXXXXXXX89"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-sky-500 font-mono text-white text-[10px]"
                        />
                        <p className="text-[8.5px] text-slate-400 italic leading-snug">Note: বটটিকে অবশ্যই আপনার চ্যানেলে বা গ্রুপে <b>Admin</b> হিসেবে যুক্ত করুন মেসেজ সেন্ড করার পূর্বে।</p>
                      </div>

                      {/* Live connection testing action */}
                      <div className="pt-1.5 border-t border-slate-800/40 mt-1">
                        <button
                          type="button"
                          onClick={handleTestTelegramBot}
                          disabled={isTestingTelegram}
                          className="w-full bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white font-extrabold text-[10.5px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          {isTestingTelegram ? (
                            'টেস্ট মেসেজ পাঠানো হচ্ছে...'
                          ) : (
                            <>
                              <span>⚙ টেস্ট ইউজার বট (Test User Bot)</span>
                            </>
                          )}
                        </button>

                        {telegramTestResult && (
                          <div className={`mt-2 p-2.5 rounded-xl text-[9.5px] font-bold leading-normal ${
                            telegramTestResult.type === 'success' 
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' 
                              : 'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                          }`}>
                            {telegramTestResult.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 11B: টেলিগ্রাম এডমিন বট অটোমেশন সেটিংস */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-violet-400 font-black tracking-wider uppercase block mb-1">👮‍♂️ টেলিগ্রাম এডমিন বট সেটিংস (Admin Bot)</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">শুধুমাত্র সিস্টেম এডমিনের ব্যবহারের জন্য দ্বিতীয় একটি চ্যাটবট কনফিগার করুন। এডমিন এই বটের মাধ্যমে নোটিশ, উইথড্র ও অ্যাকাউন্ট সেল নিয়ন্ত্রণ করবেন।</p>
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">এডমিন বট টোকেন (Admin Bot Token)</label>
                        <input 
                          type="text" 
                          value={telegramAdminBotToken}
                          onChange={(e) => setTelegramAdminBotToken(e.target.value)}
                          placeholder="987654321:XYZabcDefGHIjklMNOpQrStUvw"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 font-mono text-white text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">এডমিন চ্যাট/চ্যানেল আইডি (Admin Chat ID)</label>
                        <input 
                          type="text" 
                          value={telegramAdminChatId}
                          onChange={(e) => setTelegramAdminChatId(e.target.value)}
                          placeholder="-100XXXXXXXXXX89"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 font-mono text-white text-[10px]"
                        />
                        <p className="text-[8.5px] text-slate-400 italic leading-snug">Note: এডমিন বটটি সেটআপ করলে তা দিয়ে আপনি সরাসরি বটের ইনবক্সে বসেই নোটিশ ও যাবতীয় অনুমোদন করতে পারবেন।</p>
                      </div>

                      {/* Live connection testing action */}
                      <div className="pt-1.5 border-t border-slate-800/40 mt-1">
                        <button
                          type="button"
                          onClick={handleTestAdminTelegramBot}
                          disabled={isTestingAdminTelegram}
                          className="w-full bg-slate-950 border border-violet-500/30 hover:border-violet-500 text-violet-400 hover:text-white font-extrabold text-[10.5px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          {isTestingAdminTelegram ? (
                            'এডমিন টেস্ট মেসেজ পাঠানো হচ্ছে...'
                          ) : (
                            <>
                              <span>⚙ টেস্ট এডমিন বট (Test Admin Bot)</span>
                            </>
                          )}
                        </button>

                        {adminTelegramTestResult && (
                          <div className={`mt-2 p-2.5 rounded-xl text-[9.5px] font-bold leading-normal ${
                            adminTelegramTestResult.type === 'success' 
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' 
                              : 'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                          }`}>
                            {adminTelegramTestResult.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 12: ফ্রী অ্যাকাউন্ট এক্টিভেশন কন্ট্রোল (Free Account Activation) */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase block">ফ্রী অ্যাকাউন্ট এক্টিভেশন সেটিংস</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={freeActivationEnabled} 
                          onChange={(e) => setFreeActivationEnabled(e.target.checked)} 
                          className="sr-only"
                        />
                        <div className={`w-8 h-4 rounded-full transition-colors relative mr-1.5 ${freeActivationEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${freeActivationEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="ml-1 text-[8px] font-bold text-slate-400">{freeActivationEnabled ? 'ফ্রী সচল' : 'ফি সচল'}</span>
                      </label>
                    </div>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">
                      বন্ধ (OFF) থাকলে ইউজারদের অ্যাকাউন্ট একটিভ করতে ডিপোজিট/ভেরিফিকেশন ফি দিতে হবে। সচল (ON) করলে সরাসরি ফ্রিতে একটিভ হয়ে যাবে।
                    </p>
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl text-emerald-400 text-[9px] font-bold">
                      {freeActivationEnabled ? 'বর্তমানে মেম্বারদের জন্য একাউন্ট একটিভ করা সম্পূর্ণ ফ্রী!' : 'বর্তমানে মেম্বারদের একাউন্ট একটিভ করতে অ্যাক্টিভেশন ফি লাগবে।'}
                    </div>
                  </div>
                </div>

                {/* CARD 13: এডস্টেরা (Adsterra) বিজ্ঞাপন কনফিগারেশন */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm col-span-1 md:col-span-2">
                  <div>
                    <span className="text-[10px] text-amber-500 font-black tracking-wider uppercase block mb-1">এডস্টেরা বিজ্ঞাপন সেটিংস (Adsterra Ads Configuration)</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">
                      আপনার Adsterra একাউন্টের Direct Link এবং ব্যানার বিজ্ঞাপন স্ক্রিপ্ট কোডটি এখানে বসিয়ে সেভ করুন।
                    </p>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9.5px] font-bold">Adsterra Direct Link VIP URL</label>
                          <input 
                            type="text" 
                            value={adsterraDirectLink}
                            onChange={(e) => setAdsterraDirectLink(e.target.value)}
                            placeholder="https://www.example.com/direct_link"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-amber-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9.5px] font-bold">ডিরেক্ট লিংক ভিউ রিওয়ার্ড (৳)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={adsterraDirectReward}
                            onChange={(e) => setAdsterraDirectReward(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-amber-500 font-mono font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[9.5px] font-bold">দৈনিক অ্যাড ভিউ লিমিট (টি)</label>
                          <input 
                            type="number" 
                            value={adsterraDailyLimit}
                            onChange={(e) => setAdsterraDailyLimit(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-amber-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[9.5px] font-bold">Adsterra HTML Script Tag / Integration Code (ব্যানার বিজ্ঞাপন)</label>
                        <textarea 
                          rows={3}
                          value={adsterraScriptCode}
                          onChange={(e) => setAdsterraScriptCode(e.target.value)}
                          placeholder="<!-- adsterra banner code script tag -->"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[10px] outline-none text-white focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 14: মাইক্রো জবস সেটিংস (Micro Jobs Settings) */}
                <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-amber-500 font-black tracking-wider uppercase block mb-1">মাইক্রো জব অ্যাডমিন ফি সেটিংস (Micro Job Admin Fee Settings)</span>
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-3">
                      ইউজাররা নতুন ক্যাম্পেইন (Micro Job) পোস্ট করার সময় কত টাকা এডমিন ফি হিসেবে কাটা যাবে তা নির্ধারণ করুন। এই ফি না থাকলে তারা কাজ পোস্ট করতে পারবে না।
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] font-bold">জব পোস্টিং এডমিন ফি (৳)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={postJobAdminFee}
                          onChange={(e) => setPostJobAdminFee(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] outline-none focus:border-amber-500 font-bold font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION: SINGLE BY SINGLE FEATURE MAINTENANCE OPTIONS */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <span className="text-[11px] font-extrabold uppercase text-rose-500 tracking-wider">সার্ভিস ভিত্তিক রক্ষণাবেক্ষণ সেটিংস (Individual Feature Maintenance)</span>
                <p className="text-slate-500 text-[10px]">এখানে আপনি এককভাবে ওয়েবসাইটের সকল আলাদা ফিচার সচল বা মেইনটেন্যান্স মুডে রাখতে পারবেন এবং কাস্টম নোটিশ দিয়ে রাখতে পারবেন।</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'gmail', label: 'জিমেইল বিক্রয় (Gmail Sell)', enabled: gmailMaintEnabled, setEnabled: setGmailMaintEnabled, msg: gmailMaintMsg, setMsg: setGmailMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের জিমেইল বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                    { id: 'telegram', label: 'টেলিগ্রাম বিক্রয় (Telegram Sell)', enabled: telegramMaintEnabled, setEnabled: setTelegramMaintEnabled, msg: telegramMaintMsg, setMsg: setTelegramMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের টেলিগ্রাম বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                    { id: 'whatsapp', label: 'হোয়াটসঅ্যাপ বিক্রয় (WhatsApp Sell)', enabled: whatsappMaintEnabled, setEnabled: setWhatsappMaintEnabled, msg: whatsappMaintMsg, setMsg: setWhatsappMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের হোয়াটসঅ্যাপ বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                    { id: 'facebook', label: 'ফেসবুক বিক্রয় (Facebook Sell)', enabled: facebookMaintEnabled, setEnabled: setFacebookMaintEnabled, msg: facebookMaintMsg, setMsg: setFacebookMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ফেসবুক বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                    { id: 'jobs', label: 'মাইক্রো জবস (Micro Jobs / All Jobs)', enabled: jobsMaintEnabled, setEnabled: setJobsMaintEnabled, msg: jobsMaintMsg, setMsg: setJobsMaintMsg, defaultMsg: 'সামযিক কাজ আপডেট করার জন্য অল জবস মেইনটেন্যান্সে রয়েছে।' },
                    { id: 'postjob', label: 'জব পোস্ট করুন (Post New Job)', enabled: postJobMaintEnabled, setEnabled: setPostJobMaintEnabled, msg: postJobMaintMsg, setMsg: setPostJobMaintMsg, defaultMsg: 'নতুন জব পোস্টিং সার্ভিসটি সাময়িক বন্ধ রয়েছে।' },
                    { id: 'spin', label: 'স্পিন হুইল (Spin Game)', enabled: spinMaintEnabled, setEnabled: setSpinMaintEnabled, msg: spinMaintMsg, setMsg: setSpinMaintMsg, defaultMsg: 'স্পিন গেমটি মেইন্টেন্যান্সে রয়েছে।' },
                    { id: 'transfer', label: 'ব্যালেন্স ট্রান্সফার (Transfer Balance)', enabled: transferMaintEnabled, setEnabled: setTransferMaintEnabled, msg: transferMaintMsg, setMsg: setTransferMaintMsg, defaultMsg: 'ব্যালেন্স ট্রান্সফার করা সাময়িকভাবে বন্ধ আছে।' },
                    { id: 'deposit', label: 'ডিপোজিট / এক্টিভেশন (Deposit / Activation)', enabled: depositMaintEnabled, setEnabled: setDepositMaintEnabled, msg: depositMaintMsg, setMsg: setDepositMaintMsg, defaultMsg: 'ডিপোজিট এবং এক্টিভেশন সংক্রান্ত পেমেন্ট গেটওয়ে আপগ্রেড হচ্ছে।' },
                    { id: 'withdraw', label: 'টাকা উত্তোলন (Withdraw/Payment Requests)', enabled: withdrawMaintEnabled, setEnabled: setWithdrawMaintEnabled, msg: withdrawMaintMsg, setMsg: setWithdrawMaintMsg, defaultMsg: 'পেমেন্ট উইথড্র সিস্টেম আপগ্রেড হওয়ার কারণে উইথড্র বন্ধ আছে।' },
                    { id: 'refer', label: 'রেফারাল প্রোগ্রাম (Refer & Earn)', enabled: referMaintEnabled, setEnabled: setReferMaintEnabled, msg: referMaintMsg, setMsg: setReferMaintMsg, defaultMsg: 'রেফারাল ক্যাম্পেইন সাময়িকভাবে বন্ধ রয়েছে।' },
                    { id: 'ads', label: 'ভিডিও বিজ্ঞাপন (Video Ads Rewards)', enabled: adsMaintEnabled, setEnabled: setAdsMaintEnabled, msg: adsMaintMsg, setMsg: setAdsMaintMsg, defaultMsg: 'নতুন বিজ্ঞাপনের কাজ আপলোড করা হচ্ছে, তাই সাময়িকভাবে লিমিট রয়েছে।' },
                    { id: 'missions', label: 'ডেইলি মিশনস (Daily Missions)', enabled: missionsMaintEnabled, setEnabled: setMissionsMaintEnabled, msg: missionsMaintMsg, setMsg: setMissionsMaintMsg, defaultMsg: 'ডেইলি মিশন ট্র্যাকার রিফ্রেশ করা হচ্ছে।' },
                    { id: 'novashop', label: 'নোভা শপ (Nova Shop Premium)', enabled: novashopMaintEnabled, setEnabled: setNovashopMaintEnabled, msg: novashopMaintMsg, setMsg: setNovashopMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের নোভা শপ সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                    { id: 'game', label: 'গেম ও ইনকাম (Tic Tac Toe Game)', enabled: gameMaintEnabled, setEnabled: setGameMaintEnabled, msg: gameMaintMsg, setMsg: setGameMaintMsg, defaultMsg: 'গেম সাময়িক রক্ষণাবেক্ষণের কারণে বন্ধ আছে।' },
                    { id: 'investment', label: 'ইনভেস্টমেন্ট প্ল্যান (Investment Plans)', enabled: investmentMaintEnabled, setEnabled: setInvestmentMaintEnabled, msg: investmentMaintMsg, setMsg: setInvestmentMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ইনভেস্টমেন্ট সিস্টেম বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                    { id: 'instagram', label: 'ইন্সটাগ্রাম বিক্রয় (Instagram Sell)', enabled: instagramMaintEnabled, setEnabled: setInstagramMaintEnabled, msg: instagramMaintMsg, setMsg: setInstagramMaintMsg, defaultMsg: 'সাময়িক রক্ষণাবেক্ষণের কারণে আমাদের ইন্সটাগ্রাম বিক্রয় সেবা বন্ধ রয়েছে। দ্রুতই পুনরায় চালু করা হবে।' },
                  ].map((feat) => (
                    <div key={feat.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="text-[10px] font-extrabold text-slate-300">{feat.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={feat.enabled} 
                            onChange={(e) => feat.setEnabled(e.target.checked)} 
                            className="sr-only"
                          />
                          <div className={`w-8 h-4 rounded-full transition-colors relative mr-1.5 ${feat.enabled ? 'bg-rose-500' : 'bg-slate-800'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${feat.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                          <span className="ml-1.5 text-[9px] font-bold text-slate-400">{feat.enabled ? 'ব্লকড 🔒' : 'সচল 🔓'}</span>
                        </label>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-slate-500 text-[9px] font-bold">মেইনটেন্যান্স নোটিশ (Notice Message)</label>
                        <input 
                          type="text" 
                          value={feat.msg}
                          onChange={(e) => feat.setMsg(e.target.value)}
                          placeholder={feat.defaultMsg}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:border-rose-500 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: SPIN REWARDS CONFIG */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-extrabold uppercase text-rose-500 tracking-wider">স্পিন হুইল রিওয়ার্ড মাননসমূহ (Spin Wheel Prizes)</span>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-slate-400 text-[10px] font-bold">টাকার পরিমাণ (কমা দিয়ে লিখুন যেমন: 0.10,0.50,1.00,0.00,2.00,5.00)</label>
                  <input 
                    type="text" 
                    value={spinRewards}
                    onChange={(e) => setSpinRewards(e.target.value)}
                    placeholder="0.10,0.25,0.50,0.00,1.50,3.00,5.00,10.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500 font-mono tracking-wider font-extrabold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition cursor-pointer text-xs uppercase tracking-wide"
              >
                সব সিস্টেম সেটিংস সেভ করুন ✔
              </button>
            </form>

            {/* SECONDARY STANDALONE FORM: SEND NOTIFICATION TO ALL USERS */}
            <form onSubmit={handleSendGlobalNotification} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Megaphone size={14} className="text-rose-500" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
                  সব ইউজারদের পুশ নোটিফিকেশন পাঠান (Broadcast Notification)
                </h3>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-slate-400 text-[10px] font-bold">নোটিফিকেশন হেডার / শিরোনাম</label>
                <input 
                  type="text" 
                  value={notifHeader}
                  onChange={(e) => setNotifHeader(e.target.value)}
                  placeholder="যেমন: পেমেন্ট অপশন চালু হয়েছে!"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-slate-400 text-[10px] font-bold">বিজ্ঞপ্তির মূল বার্তা (Message Body)</label>
                <textarea 
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="এখানে আপনার সম্পূর্ণ নোটিফিকেশন বার্তাটি লিখুন যা সকল ইউজারদের নোটিফিকেশন হিস্টরিতে জমা হবে।"
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-rose-500 border border-rose-550/20 font-extrabold py-3 rounded-xl transition cursor-pointer text-xs"
              >
                📢 নোটিফিকেশন ব্রডকাস্ট করুন (Send To All)
              </button>
            </form>

          </motion.div>
        )}

        {/* CARD ADMIN TAB: INVESTMENT PLANS */}
        {adminTab === 'plans' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 shadow-sm">
            {/* Add/Edit Plan Form Card */}
            <form onSubmit={handleSaveInvestmentPlan} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800 font-sans flex items-center justify-between">
                <span>{editingPlanId ? '🔧 ইনভেস্টমেন্ট প্ল্যান সংশোধন করুন' : '➕ নতুন ইনভেস্টমেন্ট প্ল্যান যুক্ত করুন'}</span>
                {editingPlanId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingPlanId(null);
                      setPlanName('');
                      setPlanCost('');
                      setPlanTotalReturn('');
                      setPlanValidityDays('');
                    }}
                    className="text-stone-400 hover:text-white font-bold text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl transition"
                  >
                    নতুন যোগ করতে ফিরে যান
                  </button>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">প্ল্যানের নাম (Plan Name) *</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: Silver Plan, Golden Spark, Diamond Return"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">প্ল্যান অ্যাক্টিভেশন মূল্য (Cost in ৳) *</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: 500"
                    value={planCost}
                    onChange={(e) => setPlanCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">মোট রিটার্ন / ইনকাম (Total Return in ৳) *</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: 700"
                    value={planTotalReturn}
                    onChange={(e) => setPlanTotalReturn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">প্ল্যানের মেয়াদ (Validity in Days) *</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: 15"
                    value={planValidityDays}
                    onChange={(e) => setPlanValidityDays(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-medium">
                রিয়েল টাইম ক্যালকুলেশন: ইউজার এই প্ল্যানটি অ্যাক্টিভ করলে প্রতিদিন <span className="text-emerald-400 font-bold font-mono">৳{(parseFloat(planTotalReturn) && parseFloat(planValidityDays)) ? (parseFloat(planTotalReturn) / parseFloat(planValidityDays)).toFixed(2) : '0.00'}</span> করে মোট <span className="text-white font-bold">{planValidityDays || '0'} দিন</span> ধরে মোট <span className="text-emerald-400 font-bold font-mono">৳{planTotalReturn || '0.00'}</span> ক্লেইম করতে পারবেন।
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold tracking-wider transition text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{editingPlanId ? 'হালনাগাদ সম্পন্ন করুন ✔' : 'নতুন ইনভেস্টমেন্ট প্ল্যান যুক্ত করুন ✔'}</span>
              </button>
            </form>

            {/* Plans List Table */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800 font-sans mb-4">
                সচল ইনভেস্টমেন্ট প্ল্যানসমূহ ({investmentPlans.length})
              </h3>

              {investmentPlans.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  এখন পর্যন্ত কোনো ইনভেস্টমেন্ট প্ল্যান তৈরি করা হয়নি। উপরে ফরমটি ব্যবহার করে প্রথম প্ল্যান যোগ করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investmentPlans.map(plan => {
                    const daily = (plan.totalReturn / plan.validityDays).toFixed(2);
                    return (
                      <div key={plan.id} className="p-4 border border-slate-800 bg-slate-900/40 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start border-b border-slate-800/60 pb-2">
                            <div>
                              <h4 className="font-extrabold text-white text-[14px]">{plan.name}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">আইডি: {plan.id}</p>
                            </div>
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-1 rounded-full text-[11px] font-black font-mono">৳{plan.cost}</span>
                          </div>

                          <div className="space-y-1.5 pt-1 text-[11px] text-slate-300 font-sans">
                            <div className="flex justify-between">
                              <span className="text-slate-500">মোট রিটার্ন:</span>
                              <span className="font-black text-emerald-400">৳{plan.totalReturn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">মেয়াদকাল:</span>
                              <span className="font-bold text-white">{plan.validityDays} দিন</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">দৈনিক আয়:</span>
                              <span className="font-bold text-emerald-400">৳{daily}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-800/60 pt-3 mt-4">
                          <button 
                            type="button"
                            onClick={() => handleEditInvestmentPlan(plan)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-[10px] transition flex items-center justify-center gap-1"
                          >
                            <Edit size={12} />
                            <span>এডিট করুন</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteInvestmentPlan(plan.id)}
                            className="bg-rose-950/30 hover:bg-rose-900/30 border border-rose-500/20 text-rose-400 font-bold p-2 rounded-xl text-[10px] transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 13: SUB-ADMIN MANAGEMENT PANEL (Super Admin Only) */}
        {adminTab === 'admins' && isSuperAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 font-sans">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <UserCheck size={18} className="text-rose-500" />
                <span>নতুন এডমিন যুক্ত করুন (Create Sub-Admin)</span>
              </h2>
              <form onSubmit={handleAddSubAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">এডমিনের নাম</label>
                    <input 
                      type="text" 
                      required
                      value={newSubAdminName}
                      onChange={(e) => setNewSubAdminName(e.target.value)}
                      placeholder="যেমন: সাকিব হাসান"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-rose-500 text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">এডমিন ইমেইল</label>
                    <input 
                      type="email" 
                      required
                      value={newSubAdminEmail}
                      onChange={(e) => setNewSubAdminEmail(e.target.value)}
                      placeholder="যেমন: sakib@gmail.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-rose-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10.5px] text-slate-300 font-extrabold block mb-2.5 uppercase tracking-wide">এডমিন পারমিশন দিন (Assign Roles & Permissions)</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pr-2">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.users}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, users: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">ইউজার নিয়ন্ত্রণ (Users Balance/Ban)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pr-2">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.sells}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, sells: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">জিমেইল-সোশ্যাল ডিলস (Sells Approval)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pr-2">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.jobSubmissions}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, jobSubmissions: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">মাইক্রো জব প্রুফ (Job Review)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pr-2">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.activations}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, activations: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">ইউজার অ্যাক্টিভেশন (Activation Trx)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pr-2">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.deposits}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, deposits: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">ইউজার ডিপোজিট (Deposit Request)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pr-2 col-span-2 sm:col-span-1">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.withdraws}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, withdraws: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">টাকা উত্তোলন (Withdraw Appr.)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold col-span-2 sm:col-span-1">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.settings}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, settings: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-slate-200">সেটিংস ও ক্যাম্পেইন (Global Settings)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold col-span-2 sm:col-span-1 border-t border-slate-800/50 pt-1">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.gmailPriceSecurity}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, gmailPriceSecurity: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-rose-400">জিমেইল প্রাইস ও সিকিউরিটি</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold col-span-2 sm:col-span-1 border-t border-slate-800/50 pt-1">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.telegramPriceSecurity}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, telegramPriceSecurity: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-sky-450">টেলিগ্রাম প্রাইস ও সিকিউরিটি</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold col-span-2 sm:col-span-1 border-t border-slate-800/50 pt-1">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.whatsappPriceSecurity}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, whatsappPriceSecurity: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-emerald-400">হোয়াটসঅ্যাপ প্রাইস ও সিকিউরিটি</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold col-span-2 sm:col-span-1 border-t border-slate-800/50 pt-1">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.facebookPriceSecurity}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, facebookPriceSecurity: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-indigo-400">ফেসবুক প্রাইস ও সিকিউরিটি</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold col-span-2 sm:col-span-1 border-t border-slate-800/50 pt-1 col-span-2">
                      <input 
                        type="checkbox"
                        checked={newSubAdminPermissions.instagramPriceSecurity}
                        onChange={(e) => setNewSubAdminPermissions(prev => ({ ...prev, instagramPriceSecurity: e.target.checked }))}
                        className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500/20 w-4 h-4"
                      />
                      <span className="text-fuchsia-400">ইন্সটাগ্রাম প্রাইস ও সিকিউরিটি</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-950/20 cursor-pointer"
                >
                  নিযুক্ত করুন / সচল করুন (Assign Role)
                </button>
              </form>
            </div>

            <div className="space-y-3.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">বর্তমানে নিযুক্ত সাব-এডমিন তালিকা ({subAdmins.length})</h3>
              
              {subAdmins.length === 0 ? (
                <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800">
                  <User size={32} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs">কোনো অতিরিক্ত সাব-এডমিন যোগ করা নেই</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subAdmins.map((item: any) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.name}</h4>
                          <span className="text-xs text-slate-400 font-mono block mt-0.5">{item.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('আপনি কি নিশ্চিত যে এই সাব-এডমিনকে অপসারন করতে চান?')) {
                              handleDeleteSubAdmin(item.id);
                            }
                          }}
                          className="bg-red-950/30 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white font-bold p-1.5 rounded-lg text-xs transition"
                          title="অপসারণ"
                        >
                          অপসারণ 🗑
                        </button>
                      </div>

                      <div className="border-t border-slate-800/60 pt-3.5">
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-2">নির্দিষ্ট পারমিশন টগল (Toggle Permissions)</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { name: 'users', label: 'ইউজার নিয়ন্ত্রণ' },
                            { name: 'sells', label: 'জিমেইল-সোশ্যাল ডিলস' },
                            { name: 'jobSubmissions', label: 'জব রিভিউ' },
                            { name: 'activations', label: 'ইউজার অ্যাক্টিভেশন' },
                            { name: 'deposits', label: 'ইউজার ডিপোজিট' },
                            { name: 'withdraws', label: 'টাকা উত্তোলন' },
                            { name: 'settings', label: 'সেটিংস ও ক্যাম্পেইন' },
                            { name: 'gmailPriceSecurity', label: 'জিমেইল প্রাইস/সিকিউরিটি' },
                            { name: 'telegramPriceSecurity', label: 'টেলিগ্রাম প্রাইস/সিকিউরিটি' },
                            { name: 'whatsappPriceSecurity', label: 'হোয়াটসঅ্যাপ প্রাইস/সিকিউরিটি' },
                            { name: 'facebookPriceSecurity', label: 'ফেসবুক প্রাইস/সিকিউরিটি' },
                            { name: 'instagramPriceSecurity', label: 'ইন্সটাগ্রাম প্রাইস/সিকিউরিটি' },
                          ].map(perm => (
                            <button
                              key={perm.name}
                              type="button"
                              onClick={() => handleToggleSubAdminPermission(item.id, perm.name as any)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10.5px] transition flex items-center justify-between border ${
                                item.permissions?.[perm.name]
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-900 text-slate-500 border-slate-810'
                              }`}
                            >
                              <span>{perm.label}</span>
                              <span className="text-[9px]">{item.permissions?.[perm.name] ? 'সক্রিয়' : 'বন্ধ'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </main>

      {/* Fullscreen review screenshots overlays */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 bg-slate-950/95 z-[55] flex flex-col justify-center items-center p-4 cursor-zoom-out"
          >
            <div className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-850 p-2 rounded-full">
              <X size={24} />
            </div>
            <img 
              src={fullscreenImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-slate-800 shadow-2xl" 
              alt="proof-expanded" 
            />
            <span className="text-slate-500 text-xs mt-3 select-none">স্ক্রিনশট Expansion Viewer - বন্ধ করতে ট্যাপ করুন</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg animate-pulse">
                  <AlertCircle size={18} />
                </span>
                {confirmState.title}
              </h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                {confirmState.message}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-650/20 transition"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Export & Data Fallback Modal */}
      <AnimatePresence>
        {csvPreviewOpen && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">স্প্রেডশিট রিসিভ উইন্ডো</h3>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{csvPreviewTitle}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setCsvPreviewOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 leading-relaxed font-semibold">
                ℹ️ <strong>টিপস:</strong> মোবাইল বা ব্রাউজার যদি সিকিউরিটি কারণে সরাসরি <b>.CSV</b> ফাইল ডাউনলোড করতে বাধা দেয়, তাহলে নিচের <b>"সব কপি করুন"</b> বাটনটিতে টাচ করে পুরো ডাটা কপি করতে পারবেন এবং ফোনে বা কম্পিউটারে এক্সেল ফাইলে বসাতে পারেন।
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block pl-1">ফাইল ডেটা ভিউ (CSV Data View)</span>
                <textarea 
                  readOnly 
                  value={csvPreviewData} 
                  className="w-full h-48 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono text-slate-300 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvPreviewData], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", csvPreviewTitle);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    showToast('ফাইল ডাউনলোড রি-এটেম্পট করা হয়েছে!', 'success');
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  📥 পুনরায় ডাউনলোডের চেষ্টা করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(csvPreviewData);
                    showToast('সব ডেটা ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
                  }}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-950/20"
                >
                  📋 সব ডেটা কপি করুন (Copy Data)
                </button>
                <button
                  type="button"
                  onClick={() => setCsvPreviewOpen(false)}
                  className="px-3 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
