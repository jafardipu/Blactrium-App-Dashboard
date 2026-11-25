export type TInstrumentsData = {
  name: string;
  image: string;
};

export type TProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  sales: number;
  imageUrl: string;
};

export type TActivityItem = {
  id: string;
  type: "order" | "shipped" | "product" | "favorited" | "rated" | "discount" | "inquiry";
  activity: string;
  order_id?: string;
  product?: string;
  time_ago: string;
  details: string;
  color: string;
  icon: string;
};

import { JwtPayload } from "jwt-decode";

export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: TMeta;
};
export type TUserRole = "ADMIN" | "USER";

export type TTokenUser = { email: string; role: TUserRole; id: string } & JwtPayload;
export type TUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string;
  isDelete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
  loginCount: number;
  about: null | string;
  dealCount: number;
  salesCount: number;
  monthlyTarget: number;
  dealClosedCount: number;
  league: null | any;
  commission: number;
  monthlyTargetPercentage: number;
  avgDealAmount: number;
  rank: number;
  fcmToken?: string;
  myAchievements: TAchievement[];
  _count: {
    notifications: number;
  };
};

export type TMetaCount = {
  totalActiveUsers: number;
  totalUser: number;
  totalCloser: number;
  totalClient: number;
  totalRevenue: number;
  totalDealClosed: number;
  totalCommissionPaid: number;
  totalRevenueWithPaidCommission: number;
};

export interface TCloser {
  id: string;
  clientId: string;
  userId: string;
  proposition: string;
  dealDate: string;
  status: string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  client: TClient;
  closerDocuments: CloserDocument[];
  user: User;
}

export interface TClient {
  id: string;
  name: string;
  offer: string;
  userId: string;
  targetAudience: string;
  contact: string;
  location: string;
  revenueTarget: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  closer?: TCloser;
}

export interface CloserDocument {
  id: string;
  closerId: string;
  document: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  about: string;
  registeredId: string;
}

//export type TBadges = {
//  currentBadge: TBadge | null;
//  upComingBadge: TBadge | null;
//  progressToNext: number;
//  data: TBadge[];
//};

//export type TBadge = {
//  id: string;
//  name: string;
//  dealCount: number;
//  description: string;
//  icon: string;
//  iconPath: string;
//  createdAt: string;
//  updatedAt: string;
//};

//export type TLeague = {
//  id: string;
//  name: string;
//  dealAmount: number;
//  description: string;
//  createdAt: string;
//  updatedAt: string;
//};

export type TSettings = {
  id: string;
  privacy: string;
  terms: string;
  about: string;
};

export type TLegalContentType = "privacy" | "terms" | "about" | "mission";

export type TFaqStatus = "active" | "inactive";

export type TFaq = {
  _id: string;
  question: string;
  answer: string;
  status: TFaqStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TLegal = {
  _id: string;
  contentType: TLegalContentType;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: any;
  link: null | string;
  isRead: false;
  createdAt: string;
  updatedAt: string;
};

export type TAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  createdAt: string;
  updatedAt: string;
  achievement: {
    id: string;
    name: string;
    salesCount: number;
    dealCount: number;
    revenue: number;
    createdAt: string;
    updatedAt: string;
  };
};

export interface TPrize {
  id: string;
  name: string;
  month: number;
  year: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  entries: Entry[];
}

export type TSinglePrizeData = {
  id: string;
  name: string;
  month: number;
  year: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  entries: Entry[];

  topUsers: {
    id: string;
    name: string;
    profilePicture: string;
    salesCount: number;
    dealCount: number;
    dealClosedCount: number;
  }[];
};

export interface Entry {
  id: string;
  rank: number;
  name: string;
  icon: string;
  prizeId: string;
  createdAt: string;
  updatedAt: string;
}

export type TPromotion = {
  id: string;
  title: string;
  emails: string[];
  datetime: string;
  message: string;
  isTrigger: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TCurrencyEarning = {
  currency: string;
  amount: number;
  productSales?: number;
};

export type TEarningStats = {
  feePercent?: number;
  byCurrency?: Array<{
    currency: string;
    productSales: number;
    productEarnings: number;
    subscriptionEarnings: number;
    totalEarnings: number;
    orderCount: number;
  }>;
  productEarningsByCurrency?: TCurrencyEarning[];
  subscriptionEarningsByCurrency?: TCurrencyEarning[];
  totalProductSales?: number;
  subscriptionEarning?: number;
  primaryCurrency?: string;
};

export type TSubscriptionEarning = {
  _id: string;
  id: string;
  currency?: string;
  name: string;
  accountType?: string;
  planTier?: string;
  planName?: string;
  purchaseDate?: string;
  expireDate?: string;
  transactionDate?: string;
  paymentStatus?: string;
  status?: string;
  amount?: number;
  transactionAmount?: number;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    role?: string;
    accountStatus?: string;
    avatar?: string | null;
  };
};

export type TComplainType = "event" | "profile" | "product";
export type TComplainStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export type TComplain = {
  _id: string;
  type: TComplainType;
  targetId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: TComplainStatus;
  adminNote?: string | null;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    accountStatus: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type TCommissionEarning = {
  id: string;
  productId: string;
  currency: string;
  productName: string;
  productImage?: string | null;
  price: number;
  totalSales: number;
  totalEarnings: number;
  orderCount?: number;
  transactionDate?: string;
  paymentStatus?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export type TDashboardOverview = {
  totalActiveUsers: number;
  totalBusinesses: number;
  expiredSubscriptionAccounts?: number;
  productEarningsByCurrency?: TCurrencyEarning[];
  subscriptionEarningsByCurrency?: TCurrencyEarning[];
  feePercent?: number;
  totalEarning?: number;
  primaryCurrency?: string;
};

export type TDashboardCategory = {
  _id: string;
  categoryName: string;
  categoryImage: string;
  subCategoryCount: number;
};

export type TSubscribeEmail = {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscribedAt: string;
  status: string;
  avatar?: string | null;
};

export type TDashboardNewUser = {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  joinDate: string;
  status: string;
  avatar: string;
};

export type TDashboardData = {
  overview: TDashboardOverview;
  platformAnalytics: number[];
  categoryList: TDashboardCategory[];
  newUsers: TDashboardNewUser[];
};

export type TProductCategory = {
  _id: string;
  id?: string;
  categoryName: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TAdminUser = {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  avatar?: string | null;
  subscriptionStatus?: string | null;
  planTier?: string | null;
  subscriptionExpiresAt?: string | null;
  deactivationReason?: string | null;
};

export type TAdminProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  email: string;
  phone?: string | null;
  profileAvatar?: string | null;
  profileCover?: string | null;
  countryId?: {
    _id: string;
    countryName: string;
    countryCode: string;
    status: boolean;
  } | null;
  interest?: string[];
  role: string;
  businessProfileStatus?: string;
  businessProfileId?: string | null;
  subscribeToEmails?: boolean;
  isSubscribe?: boolean;
  isSubscribed?: boolean;
  emailUpdates?: boolean;
  fcmToken?: string | null;
};

export type TCountry = {
  _id: string;
  countryName: string;
  countryCode: string;
  status: boolean;
  role?: string[];
  flag?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TCategory = {
  _id: string;
  categoryName: string;
  categoryImage: string;
  isPopular?: boolean;
  status?: boolean;
  subCategoryCount?: number;
  businessCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TSubCategory = {
  _id: string;
  categoryId: {
    _id: string;
    categoryName: string;
  };
  subCategoryName: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TAdminUserSocialLink = {
  platform: string;
  url: string;
};

export type TAdminUserDetails = {
  _id?: string;
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string | null;
  contactNumber?: string | null;
  role: string;
  status: string;
  avatar?: string | null;
  isVerified?: boolean;
  isLegalTermsAccepted?: boolean;
  isBusinessProfileSetup?: boolean;
  subscribeToEmails?: boolean;
  businessOwnerType?: string | null;
  dateOfJoin?: string;
  country?: {
    id: string;
    name: string;
    code: string;
    flag?: string;
  } | null;
  socialLinks?: TAdminUserSocialLink[];
  profile?: {
    profileCover?: string | null;
    tagLine?: string | null;
    bio?: string | null;
    interest?: string[];
    location?: {
      lat?: number | null;
      lng?: number | null;
    };
  } | null;
  businessProfile?: {
    id: string;
    businessName: string;
    businessOwnerType?: string;
    businessType?: string;
    category?: string;
    subCategory?: string;
    phone?: string;
    website?: string;
    tagLine?: string | null;
    bio?: string | null;
    status?: string;
    socialLinks?: TAdminUserSocialLink[];
    location?: {
      lat?: number | null;
      lng?: number | null;
      address?: string[];
      country?: string;
    };
    avatar?: string | null;
    cover?: string | null;
  } | null;
  merchant?: unknown;
  subscription?: {
    id: string;
    status: string;
    planName: string;
    planTier?: string;
    isTrial?: boolean;
    platform?: string;
    purchasedAt?: string;
    expiresAt?: string;
  } | null;
};
