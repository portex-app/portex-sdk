import WebApp from 'telegram-web-app';

/**
 * SDK Configuration Interface
 */
export interface SDKConfig {
  /** Application ID */
  appId: string;
  /** Environment (development/production) */
  environment: 'dev' | 'prod';
}

/**
 * Verification Result
 */
export interface VerifyResult {
  /** Verification status */
  status: 'ok' | 'failed' | 'error';
  /** Verification timestamp */
  timestamp: number;
}

export interface InviteOptions {
  /** Expiration time */
  expire: number;
  /** Share text */
  text?: string;
  /** Payload */
  payload?: string;
  /** Start param */
  start_param?: string;
}

/**
 * Invite Result
 */
export interface InviteResult {
  /** Invite URL */
  url: string;
  /** Invite ID */
  key?: string;
}

/**
 * Invite Payload Result
 */
export interface InvitePayloadResult {
  /** Invite payload */
  payload: string;
}

/**
 * Payment Options
 */
export interface PaymentOptions {
  /** Telegram User ID */
  tg_use_id: string;
  /** Payment amount (in cents)
   * @see https://core.telegram.org/bots/api#labeledprice
   */
  amount: number;
  /** Label 
   * @see https://core.telegram.org/bots/api#labeledprice
   */
  label: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Payload */
  payload?: string;
  /** Photo height */
  photo_height?: number;
  /** Photo width */
  photo_width?: number;
  /** Photo size */
  photo_size?: number;
  /** Photo URL */
  photo_url?: string;
  /** Callback URL */
  callback_url?: string;
}

/**
 * Payment Result
 */
export interface PaymentResult {
  /** Payment ID */
  tg_payment_id: number;
  /** Payment URL */
  tg_payment_url: string;
} 

/**
 * Payment Close Result invoiceClosed
 * - paid – invoice was paid successfully,
 * - cancelled – user closed this invoice without paying,
 * - failed – user tried to pay, but the payment was failed,
 * - pending – the payment is still processing. The bot will receive a service message about the payment status.
 * @see https://core.telegram.org/bots/webapps#events-available-for-mini-apps
 */
export interface InvoiceClosedResult  {
  orderId: number;
  status: 'paid' | 'cancelled' | 'failed' | 'pending';
};

export interface OrderResult {
  /** Amount */
  amount: number;
  /** Application ID */
  application_id: string;
  /** Description */
  description: string;
  /** Label */
  label: string;
  /** Payload */
  payload: string;
  /** Status */
  status: number;
  /** Status description */
  status_description: string;
  /** Payment ID */
  tg_payment_id: string;
  /** Telegram User ID */
  tg_use_id: string;
  /** Title */
  title: string;
}

/**
 * Game record result
 */
export interface GameRecordResult {
  /** Game record */
  record: string;
} 

/**
 * Request Result
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
 * Request Interface
 */
export interface IPortex {
  /**
   * Call API
   */
  call<T>(path: string, options?: PortexRequestOptions): Promise<PortexResponse<T>>;
  /**
   * Initialize
   */
  init(): Promise<VerifyResult>;
  /**
   * Get start param
   */
  getStartParam(): string;
  /**
   * Check if user is verified
   */
  readonly isVerified: boolean;
  /**
   * Telegram Web App
   * @see https://core.telegram.org/bots/webapps
   */
  webApp: WebApp;
}

export { default as WebApp } from 'telegram-web-app';

