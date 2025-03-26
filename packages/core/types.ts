import WebApp from 'telegram-web-app';

/**
 * SDK 配置接口
 */
export interface SDKConfig {
  /** 应用 ID */
  appId: string;
  /** 环境（development/production） */
  environment: 'dev' | 'prod';
}

/**
 * 验证结果
 */
export interface VerifyResult {
  /** 验证状态 */
  status: 'ok' | 'failed' | 'error';
  /** 验证时间 */
  timestamp: number;
}

export interface InviteOptions {
  /** 过期时间 */
  expire: number;
  /** 分享文本 */
  text?: string;
  /** 负载 */
  payload?: string;
}

/**
 * 邀请结果
 */
export interface InviteResult {
  /** 邀请链接 */
  invite_url: string;
  /** 邀请 ID */
  key: string;
}

/**
 * 邀请负载结果
 */
export interface InvitePayloadResult {
  /** 邀请负载 */
  payload: string;
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

/**
 * 请求结果
 */
export interface PortexResponse<T> {
  ok: boolean;
  body: PortexResponseBody<T> | null;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface PortexResponseBody<T> {
  ok: boolean;
  is_dev: boolean;
  desc: string;
  result: T | null;
}

export interface PortexRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

/**
 * 请求接口
 */
export interface IPortex {
  request<T>(path: string, options?: PortexRequestOptions): Promise<PortexResponse<T>>;
  
  /**
   * Telegram Web App
   */
  webApp: WebApp;
}