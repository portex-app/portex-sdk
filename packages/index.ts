import WebApp from 'telegram-web-app';
import {
    GameRecordResult,
    InviteOptions,
    InvitePayloadResult,
    InviteResult,
    InvoiceClosedResult,
    ListGameRecordNamesResult,
    OrderResult,
    PaymentOptions,
    PaymentResult,
    PortexRequestOptions,
    PortexResponse,
    PortexResponseBody,
    LeaderboardRankOptions,
    LeaderboardRankResult,
    LeaderboardTopNOptions,
    LeaderboardTopNResult,
    LeaderboardUpdateUserScoreOptions,
    SDKConfig,
    VerifyResult
} from './core/types';

declare global {
    interface Window {
        Telegram?: {
            WebApp?: typeof WebApp;
        };
    }
}

/**
 * Portex SDK
 */
export class Portex {
    readonly #endpoint: string;
    public webApp: WebApp;

    #initResult: VerifyResult | null = null;

    // 子模块实例缓存
    private _social?: any;
    private _payment?: any;
    private _report?: any;
    private _game?: any;
    private _leaderboard?: any;

    constructor(protected readonly config: SDKConfig = { environment: 'prod', appId: '' }) {
        this.#endpoint = (config.environment || 'prod') === 'dev'
            ? 'https://dev.sdk.portex.cloud'
            : 'https://sdk.portex.cloud';

        if (!window?.Telegram?.WebApp) {
            throw new Error('Telegram Web App not found, please ensure running in Telegram environment');
        }
        this.webApp = window.Telegram.WebApp;
    }

    /** =================== 动态 import 子模块 =================== */

    private async getSocial(): Promise<any> {
        if (!this._social) {
            const { default: Social } = await import('./social/social');
            this._social = new Social(this);
        }
        return this._social;
    }

    private async getPayment(): Promise<any> {
        if (!this._payment) {
            const { default: Payment } = await import('./payment/payment');
            this._payment = new Payment(this);
        }
        return this._payment;
    }

    private async getReport(): Promise<any> {
        if (!this._report) {
            const { default: Report } = await import('./report/report');
            this._report = new Report(this);
        }
        return this._report;
    }

    private async getGame(): Promise<any> {
        if (!this._game) {
            const { default: Game } = await import('./game/game');
            this._game = new Game(this);
        }
        return this._game;
    }

    private async getLeaderboard(): Promise<any> {
        if (!this._leaderboard) {
            const { default: Leaderboard } = await import('./leaderboard/leaderboard');
            this._leaderboard = new Leaderboard(this);
        }
        return this._leaderboard;
    }

    /** =================== 核心方法 =================== */

    public async call<T>(path: string, options: PortexRequestOptions = {}): Promise<PortexResponse<T>> {
        const { method = 'GET', data = {}, headers = {} } = options;

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-App-Id': this.config.appId
        };

        if (this.webApp?.initData) {
            defaultHeaders['X-Tg-InitData'] = this.webApp.initData;
            defaultHeaders['X-Tg-Platform'] = this.webApp.platform || 'unknown';
            defaultHeaders['X-Tg-Version'] = this.webApp.version || 'unknown';
        }

        let url = `${this.#endpoint}${path}`;
        if (method === 'GET' && Object.keys(data).length > 0) {
            const params = new URLSearchParams();
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const value = (data as any)[key];
                    params.append(key, String(value));
                }
            }
            url += (url.includes('?') ? '&' : '?') + params.toString();
        }

        const response = await fetch(url, {
            method,
            headers: { ...defaultHeaders, ...headers },
            ...(method !== 'GET' && data && { body: JSON.stringify(data) })
        });

        let responseData: PortexResponseBody<T> | null = null;
        try { responseData = await response.json(); } catch { }

        return {
            ok: response.ok,
            body: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        };
    }

    async init(): Promise<VerifyResult> {
        try {
            const resp = await this.call<any>('/v1/saveTgUser', { method: 'POST' });
            this.#initResult = { status: resp.ok ? 'ok' : 'failed', timestamp: Date.now() };
            return this.#initResult;
        } catch {
            this.#initResult = { status: 'error', timestamp: Date.now() };
            throw this.#initResult;
        }
    }

    get isVerified(): boolean { return this.#initResult?.status === 'ok'; }

    getStartParam(): string {
        this.checkVerified();
        return new URL(window.location.href).searchParams.get('tgWebAppStartParam') || '';
    }


    private checkVerified() {
        if (!this.isVerified) throw new Error('User not verified');
    }

    /** =================== 对外 API =================== */

    async invite(options: InviteOptions): Promise<InviteResult> {
        this.checkVerified();
        return (await this.getSocial()).invite(options);
    }

    async getInviteUrl(options: InviteOptions): Promise<InviteResult> {
        this.checkVerified();
        return (await this.getSocial()).getInviteUrl(options);
    }

    async getInvitePayload(key: string): Promise<InvitePayloadResult> {
        this.checkVerified();
        return (await this.getSocial()).getInvitePayload(key);
    }

    async pay(options: PaymentOptions, callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult> {
        this.checkVerified();
        return (await this.getPayment()).pay(options, callback);
    }

    async queryOrder(orderId: number): Promise<OrderResult> {
        this.checkVerified();
        return (await this.getPayment()).queryOrder(orderId);
    }

    async resumePayment(callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult | null> {
        this.checkVerified();
        return (await this.getPayment()).resumePayment(callback);
    }

    async hasPendingPayment(): Promise<boolean> {
        this.checkVerified();
        return (await this.getPayment()).hasPendingPayment();
    }

    async reportUserSet(data: object = {}): Promise<boolean> {
        this.checkVerified();
        return (await this.getReport()).userSet(data);
    }

    async reportTrack(eventName: string, data: object = {}): Promise<boolean> {
        this.checkVerified();
        return (await this.getReport()).track(eventName, data);
    }

    async saveGameRecord(name: string, record: string): Promise<boolean> {
        this.checkVerified();
        return (await this.getGame()).saveRecord(name, record);
    }

    async getGameRecord(name: string): Promise<GameRecordResult> {
        this.checkVerified();
        return (await this.getGame()).getRecord(name);
    }

    async listGameRecordNames(): Promise<ListGameRecordNamesResult> {
        this.checkVerified();
        return (await this.getGame()).listRecordNames();
    }

    async getLeaderboardTopN(options: LeaderboardTopNOptions): Promise<LeaderboardTopNResult> {
        this.checkVerified();
        return (await this.getLeaderboard()).getLeaderboardTopN(options);
    }

    async getLeaderboardRank(options: LeaderboardRankOptions): Promise<LeaderboardRankResult> {
        this.checkVerified();
        return (await this.getLeaderboard()).getLeaderboardRank(options);
    }

    async updateUserLeaderboardScore(options: LeaderboardUpdateUserScoreOptions): Promise<void> {
        this.checkVerified();
        return (await this.getLeaderboard()).updateUserLeaderboardScore(options);
    }
}

// Export types
export {
    InviteOptions,
    InvitePayloadResult,
    InviteResult,
    SDKConfig
} from './core/types';
