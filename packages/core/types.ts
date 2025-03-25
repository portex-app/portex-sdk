/**
 * SDK 配置接口
 */
export interface SDKConfig {
  /** 应用 ID */
  appId: string;
  /** Telegram 初始化数据 */
  initData: string;
  /** 环境（development/production） */
  environment: 'dev' | 'prod';
}

/**
 * SDK 初始化结果
 */
export interface InitResult {
  /** 用户 ID */
  userId: string;
  /** 是否验证通过 */
  verified: boolean;
  /** 访问令牌 */
  token: string;
  /** 令牌过期时间 */
  expireAt: number;
}

/**
 * 登录选项
 */
export interface LoginOptions {
  /** 登录类型 */
  type?: 'guest' | 'account' | 'wechat';
  /** 账号（当 type 为 account 时必填） */
  account?: string;
  /** 密码（当 type 为 account 时必填） */
  password?: string;
}

/**
 * 登录结果
 */
export interface LoginResult {
  /** 用户 ID */
  userId: string;
  /** 用户昵称 */
  nickname: string;
  /** 访问令牌 */
  token: string;
  /** 令牌过期时间 */
  expireAt: number;
}

/**
 * 邀请选项
 */
export interface InviteOptions {
  /** 邀请类型 */
  type: 'friend' | 'group';
  /** 邀请标题 */
  title?: string;
  /** 邀请描述 */
  description?: string;
  /** 邀请图片 URL */
  imageUrl?: string;
}

/**
 * 邀请结果
 */
export interface InviteResult {
  /** 邀请 ID */
  inviteId: string;
  /** 邀请链接 */
  inviteUrl: string;
  /** 邀请状态 */
  status: 'pending' | 'accepted' | 'rejected';
}

/**
 * 支付选项
 */
export interface PayOptions {
  /** 支付金额（单位：分） */
  amount: number;
  /** 货币类型 */
  currency: string;
  /** 商品 ID */
  productId: string;
  /** 商品名称 */
  productName: string;
  /** 支付渠道 */
  channel?: 'wechat' | 'alipay' | 'apple' | 'google';
}

/**
 * 支付结果
 */
export interface PayResult {
  /** 订单 ID */
  orderId: string;
  /** 支付状态 */
  status: 'success' | 'failed' | 'pending';
  /** 支付金额 */
  amount: number;
  /** 支付时间 */
  timestamp: number;
} 