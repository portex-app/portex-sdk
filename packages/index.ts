import {
  SDKConfig,
  InitResult,
  InviteOptions,
  InviteResult,
  PayOptions,
  PayResult
} from './core/types';

import { SocialModule } from './social/social';
import { PaymentModule } from './payment/payment';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
      };
    };
  }
}

// 获取全局window对象
const globalWindow = typeof window !== 'undefined' ? window : undefined;

/**
 * Portex SDK 命名空间
 */
export class Portex {
  private readonly socialModule: SocialModule;
  private readonly paymentModule: PaymentModule;
  private readonly baseUrl: string;
  private initResult: InitResult | null = null;

  constructor(private readonly config: SDKConfig) {
    this.baseUrl = config.environment === 'prod' 
      ? 'https://api.portex.cloud'
      : 'https://dev.api.portex.cloud';
    
    this.socialModule = new SocialModule(config);
    this.paymentModule = new PaymentModule(config);
  }

  /**
   * 初始化SDK并验证用户
   * @returns 初始化结果
   */
  async init(): Promise<InitResult> {
    // 获取initData
    if (!globalWindow) {
      throw new Error('SDK必须在浏览器环境中运行');
    }

    const telegramWebApp = globalWindow.Telegram?.WebApp;
    if (!telegramWebApp) {
      throw new Error('未找到Telegram Web App，请确保在Telegram环境中运行');
    }

    const response = await fetch(`${this.baseUrl}/sdk/v1/tg/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        application_id: this.config.appId,
        telegram_init_data: telegramWebApp.initData
      })
    });

    if (!response.ok) {
      throw new Error(`初始化失败: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 验证返回数据的结构
    if (!this.isValidInitResult(data)) {
      throw new Error('服务器返回的数据格式不正确');
    }

    this.initResult = data;
    return data;
  }

  /**
   * 验证初始化结果的数据结构
   * @param data - 待验证的数据
   * @returns 是否为有效的初始化结果
   */
  private isValidInitResult(data: unknown): data is InitResult {
    return (
      typeof data === 'object' &&
      data !== null &&
      'userId' in data &&
      'verified' in data &&
      'token' in data &&
      'expireAt' in data &&
      typeof (data as InitResult).userId === 'string' &&
      typeof (data as InitResult).verified === 'boolean' &&
      typeof (data as InitResult).token === 'string' &&
      typeof (data as InitResult).expireAt === 'number'
    );
  }

  /**
   * 获取当前验证状态
   * @returns 验证状态
   */
  isVerified(): boolean {
    return this.initResult?.verified ?? false;
  }

  /**
   * 邀请好友或群组
   * @param options - 邀请选项
   * @returns 邀请结果
   */
  async invite(options: InviteOptions): Promise<InviteResult> {
    if (!this.initResult?.verified) {
      throw new Error('用户未验证，请先调用init()方法');
    }
    return this.socialModule.invite(options);
  }

  /**
   * 发起支付
   * @param options - 支付选项
   * @returns 支付结果
   */
  async pay(options: PayOptions): Promise<PayResult> {
    if (!this.initResult?.verified) {
      throw new Error('用户未验证，请先调用init()方法');
    }
    return this.paymentModule.pay(options);
  }

  /**
   * 查询订单
   * @param orderId - 订单 ID
   * @returns 支付结果
   */
  async queryOrder(orderId: string): Promise<PayResult> {
    if (!this.initResult?.verified) {
      throw new Error('用户未验证，请先调用init()方法');
    }
    return this.paymentModule.queryOrder(orderId);
  }
}

// 导出类型定义
export * from './core/types'; 