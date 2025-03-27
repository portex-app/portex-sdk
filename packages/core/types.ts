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
export interface PaymentOptions {
  /** 支付金额（单位：分） */
  amount: number;
  /** 回调 URL */
  callback_url: string;
  /** 描述 */
  description: string;
  /** 标签 */
  label: string;
  /** 负载 */
  payload: string;
  /** 图片高度 */
  photo_height: number;
  /** 图片宽度 */
  photo_width: number;
  /** 图片大小 */
  photo_size: number;
  /** 图片 URL */
  photo_url: string;
  /** Telegram 用户 ID */
  tg_use_id: string;
  /** 标题 */
  title: string;
}

/**
 * 支付结果
 */
export interface PaymentResult {
  /** 支付 ID */
  tg_payment_id: number;
  /** 支付 URL */
  tg_payment_url: string;
} 

export interface OrderResult {
  /** 金额 */
  amount: number;
  /** 应用 ID */
  application_id: string;
  /** 描述 */
  description: string;
  /** 标签 */
  label: string;
  /** 负载 */
  payload: string;
  /** 状态 */
  status: number;
  /** 状态描述 */
  status_description: string;
  /** 支付 ID */
  tg_payment_id: string;
  /** Telegram 用户 ID */
  tg_use_id: string;
  /** 标题 */
  title: string;
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
  result: T | null;
  is_dev?: boolean;
  desc?: string;
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
  /**
   * 请求api
   */
  call<T>(path: string, options?: PortexRequestOptions): Promise<PortexResponse<T>>;
  /**
   * 初始化
   */
  init(): Promise<VerifyResult>;
  /**
   * 检查用户是否已验证
   */
  readonly isVerified: boolean;
  /**
   * Telegram Web App
   * @see https://core.telegram.org/bots/webapps
   */
  webApp: WebApp;
}