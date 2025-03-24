/**
 * SDK 配置接口
 */
export interface SDKConfig {
  /** 应用 ID */
  appId: string;
  /** 应用密钥 */
  appSecret: string;
  /** 环境（development/production） */
  environment: 'development' | 'production';
}

export interface LoginResult {
  token: string;
  userId: string;
  username: string;
}

/**
 * 支付选项接口
 */
export interface PaymentOptions {
  /** 支付金额（单位：分） */
  amount: number;
  /** 货币类型 */
  currency: string;
  /** 商品 ID */
  productId: string;
  /** 商品名称 */
  productName: string;
}

/**
 * 支付结果接口
 */
export interface PaymentResult {
  /** 订单 ID */
  orderId: string;
  /** 支付状态 */
  status: 'success' | 'failed' | 'pending';
  /** 支付金额 */
  amount: number;
  /** 支付时间 */
  timestamp: number;
}

export interface InviteResult {
  inviteId: string;
  status: 'success' | 'failed';
  invitedUserId?: string;
} 