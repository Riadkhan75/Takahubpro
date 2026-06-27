export interface UserData {
  uid?: string;
  username: string;
  email: string;
  balance: number;
  gmailBalance?: number;
  telegramBalance?: number;
  whatsappBalance?: number;
  facebookBalance?: number;
  instagramBalance?: number;
  adsBalance?: number;
  isActive: boolean;
  referCode: string;
  referredBy?: string | null;
  totalRefers: number;
  profileImage?: string;
  deviceId: string;
  completedJobs?: Record<string, boolean>;
  missions?: Record<string, boolean>;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  isBanned?: boolean;
  lastActive?: number;
  lastSpinDate?: string;
  lastGameDate?: string;
  dailyGameCount?: number;
  lastAdsterraDate?: string;
  dailyAdsterraCount?: number;
  lastScratchDate?: string;
  dailyScratchCount?: number;
  lastMathSolveDate?: string;
  dailyMathSolveCount?: number;
  lastQuizPlayDate?: string;
  dailyQuizPlayCount?: number;
  birth?: string;
  job?: string;
  location?: string;
  sex?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  email: string;
  method: 'Bkash' | 'Nagad';
  number: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  balanceType?: 'main' | 'gmail' | 'telegram' | 'whatsapp' | 'facebook' | 'instagram' | 'ads';
}

export interface GmailSellRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  password: string;
  status: 'pending';
  timestamp: number;
}

export interface TelegramSellRequest {
  id: string;
  userId: string;
  username: string;
  number: string;
  details: string;
  status: 'pending';
  timestamp: number;
}

export interface WhatsappSellRequest {
  id: string;
  userId: string;
  username: string;
  number: string;
  details: string;
  status: 'pending';
  timestamp: number;
}

export interface FacebookSellRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  password: string;
  twoFactor: string;
  status: 'pending';
  timestamp: number;
}

export interface InstagramSellRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  password: string;
  twoFactor: string;
  status: 'pending';
  timestamp: number;
}

export interface ReferralMission {
  id: string;
  title: string;
  target: number;
  reward: number;
  category?: 'referral' | 'task' | 'spin' | 'special';
  startDate?: string;
  endDate?: string;
}

export interface Job {
  id: string;
  title: string;
  link: string;
  description: string;
  imageUrl: string;
  exampleImages?: string[];
  totalBudget: number;
  perTaskReward: number;
  maxProofImages: number;
  showLink: boolean;
  totalSlots: number;
  remainingSlots: number;
  posterId: string;
  timestamp: number;
  expiryDate?: string;
}

export interface JobSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  jobImageUrl: string;
  jobExampleImages?: string[];
  workerId: string;
  workerName: string;
  proofImages: string[];
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface ActivationRequest {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  method: 'bkash' | 'nagad';
  number: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  method: 'bkash' | 'nagad';
  number: string;
  amount: number;
  trxId: string;
  feePercent?: number;
  feeAmount?: number;
  netAmount?: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface AdCampaign {
  id: string;
  title: string;
  link: string;
  reward: number;
  timestamp: number;
}

export interface HomeTask {
  id: string;
  icon: string;
  name: string;
  link: string;
}

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export interface GlobalSettings {
  minWithdraw: number;
  minWithdrawGmail?: number;
  minWithdrawTelegram?: number;
  minWithdrawWhatsapp?: number;
  minWithdrawFacebook?: number;
  minWithdrawInstagram?: number;
  minWithdrawAds?: number;
  referLink: string;
  appDownloadLink: string;
  gmailOpenPass: string;
  telegramOpenPass?: string;
  whatsappOpenPass?: string;
  facebookOpenPass?: string;
  instagramOpenPass?: string;
  gmailPrice: number;
  telegramPrice?: number;
  whatsappPrice?: number;
  facebookPrice?: number;
  instagramPrice?: number;
  activationNumbers?: {
    bkash: string;
    nagad: string;
  };
  activationPrice?: number;
  popupEnabled?: boolean;
  popupTitle?: string;
  popupMessage?: string;
  popupImageUrl?: string;
  popupLink?: string;
  runningNotice?: string;
  emergencyEnabled?: boolean;
  emergencyMessage?: string;
  spinRewards?: string; // comma-separated amounts like: 0.5,1,2,5,10,0.1,0.25,0
  gmailMaintenanceEnabled?: boolean;
  gmailMaintenanceMessage?: string;
  telegramMaintenanceEnabled?: boolean;
  telegramMaintenanceMessage?: string;
  whatsappMaintenanceEnabled?: boolean;
  whatsappMaintenanceMessage?: string;
  facebookMaintenanceEnabled?: boolean;
  facebookMaintenanceMessage?: string;
  // Additional single-by-single maintenance options
  jobsMaintenanceEnabled?: boolean;
  jobsMaintenanceMessage?: string;
  postJobMaintenanceEnabled?: boolean;
  postJobMaintenanceMessage?: string;
  postJobAdminFee?: number;
  spinMaintenanceEnabled?: boolean;
  spinMaintenanceMessage?: string;
  transferMaintenanceEnabled?: boolean;
  transferMaintenanceMessage?: string;
  depositMaintenanceEnabled?: boolean;
  depositMaintenanceMessage?: string;
  withdrawMaintenanceEnabled?: boolean;
  withdrawMaintenanceMessage?: string;
  referMaintenanceEnabled?: boolean;
  referMaintenanceMessage?: string;
  adsMaintenanceEnabled?: boolean;
  adsMaintenanceMessage?: string;
  missionsMaintenanceEnabled?: boolean;
  missionsMaintenanceMessage?: string;
  hideMasterPasswords?: boolean;
  siteMaintenanceEnabled?: boolean;
  siteMaintenanceMessage?: string;
  novashopMaintenanceEnabled?: boolean;
  novashopMaintenanceMessage?: string;
  supportTelegramChannel?: string;
  supportTelegramGroup?: string;
  supportTelegramAdmin?: string;
  supportFacebookPage?: string;
  supportWhatsAppNumber?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramAdminBotToken?: string;
  telegramAdminChatId?: string;
  gameDailyLimit?: number;
  gameFreeReward?: number;
  gameMaintenanceEnabled?: boolean;
  gameMaintenanceMessage?: string;
  freeActivationEnabled?: boolean;
  adsterraDirectLink?: string;
  adsterraDirectReward?: number;
  adsterraScriptCode?: string;
  adsterraDailyLimit?: number;
  investmentMaintenanceEnabled?: boolean;
  investmentMaintenanceMessage?: string;
  instagramMaintenanceEnabled?: boolean;
  instagramMaintenanceMessage?: string;
  gmailLastDate?: string;
  telegramLastDate?: string;
  whatsappLastDate?: string;
  facebookLastDate?: string;
  instagramLastDate?: string;
  gmailDailyLimit?: number;
  telegramDailyLimit?: number;
  whatsappDailyLimit?: number;
  facebookDailyLimit?: number;
  instagramDailyLimit?: number;
  gmailTutorialUrl?: string;
  telegramTutorialUrl?: string;
  whatsappTutorialUrl?: string;
  facebookTutorialUrl?: string;
  instagramTutorialUrl?: string;
  signupBonusEnabled?: boolean;
  signupBonusAmount?: number;
  withdrawFeePercent?: number;
  depositFeePercent?: number;
  scratchCardPrice?: number;
  scratchDailyLimit?: number;
  scratchRewards?: string;
  scratchMaintenanceEnabled?: boolean;
  scratchMaintenanceMessage?: string;
  hideGmailSell?: boolean;
  hideTelegramSell?: boolean;
  hideWhatsappSell?: boolean;
  hideFacebookSell?: boolean;
  hideInstagramSell?: boolean;
  referBonusAmount?: number;
  mathSolveReward?: number;
  mathSolveDailyLimit?: number;
  quizReward?: number;
  quizDailyLimit?: number;
  hideMathSolve?: boolean;
  hideQuiz?: boolean;
}

export interface ExternalWebsite {
  id: string;
  name: string;
  url: string;
  description: string;
  iconName?: string;
  accentColor?: string;
  maintenanceEnabled?: boolean;
  maintenanceMessage?: string;
  timestamp: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  cost: number;
  totalReturn: number;
  validityDays: number;
  timestamp?: number;
}

export interface PurchasedPlan {
  id: string;
  planId: string;
  planName: string;
  name?: string;
  cost: number;
  totalReturn: number;
  validityDays: number;
  dailyIncome: number;
  dailyReturn?: number;
  purchaseDate: number;
  lastClaimDate: number;
  lastClaimedDate?: string | number;
  totalClaimed: number;
  claimsLeft: number;
  daysClaimed?: number;
  status: 'active' | 'completed';
}

export interface SocialText {
  id: string;
  platform: 'facebook' | 'instagram' | 'telegram' | 'whatsapp';
  text: string;
  timestamp: number;
}

export interface GiftCode {
  id: string;
  code: string;
  rewardAmount: number;
  expirationTime?: number;
  maxUses?: number;
  usedCount: number;
  redeemedUsers?: Record<string, boolean>;
  timestamp: number;
}

