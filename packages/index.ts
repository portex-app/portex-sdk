import {
  SDKConfig,
  InviteOptions,
  InviteResult,
  PortexRequestOptions,
  PortexResponse,
  PortexResponseBody,
  VerifyResult,
  InvitePayloadResult,
  PaymentOptions,
  PaymentResult,
  InvoiceClosedResult,
  OrderResult
} from './core/types';
import WebApp from 'telegram-web-app';

import Game from './game/game';
import Payment from './payment/payment';
import Report from './report/report';
import Social from './social/social';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: typeof WebApp;
    };
  }
}

// Get global window object
const globalWindow = typeof window !== 'undefined' ? window : undefined;

/**
 * Portex SDK namespace
 */
export class Portex {
  readonly #social: Social;
  readonly #payment: Payment;
  readonly #report: Report;
  readonly #game: Game;

  /**
   * SDK init result
   */
  #initResult: VerifyResult | null = null;

  /**
   * endpoint url
   */
  readonly #endpoint: string; 

  /**
   * Telegram Web App
   */
  public webApp: WebApp;

  constructor(protected readonly config: SDKConfig = { environment: 'prod', appId: ''}) {
    this.#endpoint = (config.environment || 'prod') === 'dev'
      ? 'https://dev.api.portex.cloud'
      : 'https://api.portex.cloud';
    
    if (!globalWindow) {
      throw new Error('SDK must run in browser environment');
    }

    if (!globalWindow.Telegram || !globalWindow.Telegram.WebApp) {
      throw new Error('Telegram Web App not found, please ensure running in Telegram environment');
    }
    this.webApp = globalWindow.Telegram.WebApp;

    // 初始化模块
    this.#social = new Social(this);
    this.#payment = new Payment(this);
    this.#report = new Report(this);
    this.#game = new Game(this);
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
  public async call<T>(path: string, options: PortexRequestOptions = {}): Promise<PortexResponse<T>> {
    const {
      method = 'GET',
      data,
      headers = {}
    } = options;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Id': this.config.appId
    };

    // If there is initData, add it to the request headers
    if (this.webApp?.initData) {
      defaultHeaders['X-Tg-InitData'] = this.webApp.initData;
    }

    // Handle GET request query string
    let url = `${this.#endpoint}${path}`;
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

    // if (!response.ok) {
    //   throw new Error(`Request failed: ${response.statusText}`);
    // }

    let responseData: PortexResponseBody<T> | null = null;
    try {
      responseData = await response.json();
    } catch (e) {
      // If the response body is empty, responseData remains null
    }

    return {
      ok: response.ok,
      body: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  /**
   * Initialize SDK and verify user
   * @returns Initialization result
   */
  async init(): Promise<VerifyResult> {
    try {
      const resp = await this.call<any>('/v1/saveTgUser', {
        method: 'POST'
      });

      if (resp.ok) {
        this.#initResult = {
          status: 'ok',
          timestamp: Date.now()
        };
        return this.#initResult;
      } else {
        this.#initResult = {
          status: 'failed',
          timestamp: Date.now()
        };
        return this.#initResult;
      }
    } catch (error) {
      this.#initResult = {
        status: 'error',
        timestamp: Date.now()
      };
      throw this.#initResult;
    }
  }

  /**
   * Check if user is verified
   * @returns Whether user is verified
   */
  get isVerified(): boolean {
    return this.#initResult?.status === 'ok';
  }

  /**
   * Invite friends or groups
   * @param options - Invite options
   * @returns Invite result
   */
  async invite(options: InviteOptions): Promise<InviteResult> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#social.invite(options);
  }

  /**
   * Copy invite url
   * @param options - Invite options
   * @returns Invite result
   */
  async getInviteUrl(options: InviteOptions): Promise<InviteResult> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#social.getInviteUrl(options);
  }

  /**
   * Get start param from webapp
   * @returns Start param
   */
  getStartParam (): string {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }

    const url = new URL(window.location.href);
    return url.searchParams.get('tgWebAppStartParam') || '';
  }
  
  /**
   * Get invite payload
   * @param key - Invite key
   * @returns Invite payload result
   */
  async getInvitePayload(key: string): Promise<InvitePayloadResult> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#social.getInvitePayload(key);
  }

  /**
   * Initiate payment
   * @param options - Payment options
   * @returns Payment result
   */
  async pay(options: PaymentOptions,callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#payment.pay(options,callback);
  }

  /**
   * Query order
   * @param orderId - Order ID
   * @returns Payment result
   */
  async queryOrder(orderId: number): Promise<OrderResult> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#payment.queryOrder(orderId);
  }

  /**
   * Resume payment
   * @param callback - Payment result callback
   * @returns Payment result
   */
  async resumePayment(callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult | null> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#payment.resumePayment(callback);
  }

  /**
   * Whether there is a pending payment URL
   * @returns Whether there is a pending payment URL
   */
  hasPendingPayment(): boolean {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#payment.hasPendingPayment();
  }

    /**
   * Report user set
   * @param data - user data
   * @returns boolean - true if success
   * @throws Error - if failed to report user set
   */
  async reportUserSet(data: Object = {}): Promise<boolean> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#report.userSet(data);
  }
  
  /**
   * Report track
   * @param eventName - event name
   * @param data - report track data
   * @returns boolean - true if success
   * @throws Error - if failed to report track
   */
  async reportTrack(eventName: string, data: Object = {}): Promise<boolean> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#report.track(eventName, data);
  }
  
  /**
   * Save game record
   * @param record - game record
   * @returns boolean - true if success
   * @throws Error - if failed to save game record
   */
  async saveGameRecord(record: string): Promise<boolean> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#game.saveRecord(record);
  }

    /**
   * Get game record
   * @returns record - game record
   * @throws Error - if failed to get game record
   */
  async getGameRecord(): Promise<GameRecordResult> {
    if (!this.isVerified) {
      throw new Error('User not verified, please call init() method first');
    }
    return this.#game.getRecord();
  }
}

// Export type definitions
export {
  SDKConfig,
  InviteOptions,
  InviteResult,
  InvitePayloadResult,
} from './core/types';