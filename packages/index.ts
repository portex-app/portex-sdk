import {
  SDKConfig,
  InitResult,
  InviteOptions,
  InviteResult,
  PayOptions,
  PayResult
} from './core/types';
import WebApp from 'telegram-web-app';

import { SocialModule } from './social/social';
import { PaymentModule } from './payment/payment';

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
  private readonly socialModule: SocialModule;
  private readonly paymentModule: PaymentModule;
  private readonly baseUrl: string;
  private initResult: InitResult | null = null;
  private webApp: WebApp;

  constructor(private readonly config: SDKConfig) {
    this.baseUrl = config.environment === 'prod' 
      ? 'https://api.portex.cloud'
      : 'https://dev.api.portex.cloud';
    
    this.socialModule = new SocialModule(config);
    this.paymentModule = new PaymentModule(config);

    if (!globalWindow) {
      throw new Error('SDK must run in browser environment');
    }

    if (!globalWindow.Telegram || !globalWindow.Telegram.WebApp) {
      throw new Error('Telegram Web App not found, please ensure running in Telegram environment');
    }
    this.webApp = globalWindow.Telegram.WebApp;
  }

  /**
   * 初始化SDK并验证用户
   * @returns 初始化结果
   */
  async init(): Promise<InitResult> {
    const initData = this.webApp.initData;
    // const user = this.webApp.initDataUnsafe.user;
   // console.log(this.webApp.initDataUnsafe.user);
    const response = await fetch(`${this.baseUrl}/sdk/v1/tg/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': this.config.appId,
        'X-Tg-InitData': initData
      }
    });

    if (!response.ok) {
      throw new Error(`Initialization failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 验证返回数据的结构
    if (!this.isValidInitResult(data)) {
      throw new Error('Invalid data format returned from server');
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
      throw new Error('User not verified, please call init() method first');
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
      throw new Error('User not verified, please call init() method first');
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
      throw new Error('User not verified, please call init() method first');
    }
    return this.paymentModule.queryOrder(orderId);
  }
}

// 导出类型定义
export * from './core/types'; 