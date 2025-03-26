import {
  SDKConfig,
  InviteOptions,
  InviteResult,
  VerifyResult,
  InvitePayloadResult,
  PayOptions,
  PayResult
} from './core/types';
import WebApp from 'telegram-web-app';

import Social from './social/social';
import Payment from './payment/payment';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: typeof WebApp;
    };
  }
}

// 获取全局window对象
const globalWindow = typeof window !== 'undefined' ? window : undefined;

/**
 * Portex SDK 命名空间
 */
export class Portex {
  private readonly social: Social;
  private readonly payment: Payment;

  /**
   * endpoint url
   */
  private readonly endpoint: string; 
  /**
   * SDK init result
   */
  private initResult: VerifyResult | null = null;
  /**
   * Telegram Web App
   */
  public webApp: WebApp;

  constructor(protected readonly config: SDKConfig = { environment: 'prod', appId: ''}) {
    this.endpoint = (config.environment || 'prod') === 'prod'
      ? 'https://api.portex.cloud'
      : 'https://dev.api.portex.cloud';
    
    if (!globalWindow) {
      throw new Error('SDK must run in browser environment');
    }

    if (!globalWindow.Telegram || !globalWindow.Telegram.WebApp) {
      throw new Error('Telegram Web App not found, please ensure running in Telegram environment');
    }
    this.webApp = globalWindow.Telegram.WebApp;

    // 初始化模块
    this.social = new Social(this);
    this.payment = new Payment(this);
  }

  /**
   * Send a request
   * @param path Request path
   * @param options Request options
   * @param options.method Request method
   * @param options.data Request data
   * @param options.headers Request headers
   * @returns Request result
   */
  public async request<T>(path: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
  } = {}): Promise<{
    data: T | null;
    status: number;
    statusText: string;
    headers: Headers;
  }> {
    const {
      method = 'GET',
      data,
      headers = {}
    } = options;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Id': this.config.appId
    };

    // 如果有 initData，添加到请求头
    if (this.webApp?.initData) {
      defaultHeaders['X-Tg-InitData'] = this.webApp.initData;
    }

    // 处理 GET 请求的 query string
    let url = `${this.endpoint}${path}`;
    if (method === 'GET' && data) {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers
      },
      ...(method !== 'GET' && data && { body: JSON.stringify(data) })
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    let responseData: T | null = null;
    try {
      responseData = await response.json();
    } catch (e) {
      // 如果响应体为空，responseData 保持为 null
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  /**
   * 初始化SDK并验证用户
   * @returns 初始化结果
   */
  async init(): Promise<VerifyResult> {
    try {
      const result = await this.request<any>('/sdk/v1/tg/user', {
        method: 'POST'
      });

      if (result.status === 201 || result.status === 200) {
        this.initResult = {
          status: 'ok',
          timestamp: Date.now()
        };
        return this.initResult;
      } else {
        this.initResult = {
          status: 'failed',
          timestamp: Date.now()
        };
        return this.initResult;
      }
    } catch (error) {
      console.log('Init error:', error);
      this.initResult = {
        status: 'failed',
        timestamp: Date.now()
      };
      throw this.initResult;
    }
  }

  /**
   * 检查用户是否已验证
   * @returns 是否已验证
   */
  isVerified(): boolean {
    return this.initResult?.status === 'ok';
  }

  /**
   * 邀请好友或群组
   * @param options - 邀请选项
   * @returns 邀请结果
   */
  async invite(options: InviteOptions): Promise<InviteResult> {
    if (this.initResult?.status !== 'ok') {
      throw new Error('User not verified, please call init() method first');
    }
    return this.social.invite(options);
  }

  async queryInvitePayload(key: string): Promise<InvitePayloadResult> {
    if (this.initResult?.status !== 'ok') {
      throw new Error('User not verified, please call init() method first');
    }
    return this.social.queryInvitePayload(key);
  }

  /**
   * 发起支付
   * @param options - 支付选项
   * @returns 支付结果
   */
  async pay(options: PayOptions): Promise<PayResult> {
    if (this.initResult?.status !== 'ok') {
      throw new Error('User not verified, please call init() method first');
    }
    return this.payment.pay(options);
  }

  /**
   * 查询订单
   * @param orderId - 订单 ID
   * @returns 支付结果
   */
  async queryOrder(orderId: string): Promise<PayResult> {
    if (this.initResult?.status !== 'ok') {
      throw new Error('User not verified, please call init() method first');
    }
    return this.payment.queryOrder(orderId);
  }
}

// 导出类型定义
export * from './core/types'; 