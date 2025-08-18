import type { Telegram } from 'telegram-web-app';

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

// 直接静态 import
import Social from './social/social';
import Payment from './payment/payment';
import Report from './report/report';
import Game from './game/game';
import Leaderboard from './leaderboard/leaderboard';

/**
 * Portex SDK
 */
export class Portex {
    readonly #endpoint: string;
    public webApp: Telegram['WebApp'];

    #initResult: VerifyResult | null = null;

    // 子模块实例
    private _social?: Social;
    private _payment?: Payment;
    private _report?: Report;
    private _game?: Game;
    private _leaderboard?: Leaderboard;
    constructor(protected readonly config: SDKConfig = { environment: 'prod', appId: '' }) {
        this.#endpoint = (config.environment || 'prod') === 'dev'
            ? 'https://dev.sdk.portex.cloud'
            : 'https://sdk.portex.cloud';

        if (!window?.Telegram?.WebApp) {
            throw new Error('Telegram Web App not found, please ensure running in Telegram environment');
        }
        this.webApp = window.Telegram.WebApp;
    }

    /** ============== 懒加载 getter ============== */

    public get social(): Social {
        if (!this._social) this._social = new Social(this);
        return this._social;
    }

    public get payment(): Payment {
        if (!this._payment) this._payment = new Payment(this);
        return this._payment;
    }

    public get report(): Report {
        if (!this._report) this._report = new Report(this);
        return this._report;
    }

    public get game(): Game {
        if (!this._game) this._game = new Game(this);
        return this._game;
    }

    public get leaderboard(): Leaderboard {
        if (!this._leaderboard) this._leaderboard = new Leaderboard(this);
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

    private checkVerified() {
        if (!this.isVerified) throw new Error('User not verified');
    }

    /** =================== 对外 API =================== */
    public getStartParam(): string {
        this.checkVerified();
        return new URL(window.location.href).searchParams.get('tgWebAppStartParam') || '';
    }
    public async invite(options: InviteOptions): Promise<InviteResult> {
        this.checkVerified();
        return this.social.invite(options);
    }

    public async getInviteUrl(options: InviteOptions): Promise<InviteResult> {
        this.checkVerified();
        return this.social.getInviteUrl(options);
    }

    public async getInvitePayload(key: string): Promise<InvitePayloadResult> {
        this.checkVerified();
        return this.social.getInvitePayload(key);
    }

    public async pay(options: PaymentOptions, callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult> {
        this.checkVerified();
        return this.payment.pay(options, callback);
    }

    public async queryOrder(orderId: number): Promise<OrderResult> {
        this.checkVerified();
        return this.payment.queryOrder(orderId);
    }

    public async resumePayment(callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult | null> {
        this.checkVerified();
        return this.payment.resumePayment(callback);
    }

    public async hasPendingPayment(): Promise<boolean> {
        this.checkVerified();
        return this.payment.hasPendingPayment();
    }

    public async reportUserSet(data: object = {}): Promise<boolean> {
        this.checkVerified();
        return this.report.userSet(data);
    }

    public async reportTrack(eventName: string, data: object = {}): Promise<boolean> {
        this.checkVerified();
        return this.report.track(eventName, data);
    }

    public async saveGameRecord(name: string, record: string): Promise<boolean> {
        this.checkVerified();
        return this.game.saveRecord(name, record);
    }

    public async getGameRecord(name: string): Promise<GameRecordResult> {
        this.checkVerified();
        return this.game.getRecord(name);
    }

    public async listGameRecordNames(): Promise<ListGameRecordNamesResult> {
        this.checkVerified();
        return this.game.listRecordNames();
    }

    public async getLeaderboardTopN(options: LeaderboardTopNOptions): Promise<LeaderboardTopNResult> {
        this.checkVerified();
        return this.leaderboard.getLeaderboardTopN(options);
    }

    public async getLeaderboardRank(options: LeaderboardRankOptions): Promise<LeaderboardRankResult> {
        this.checkVerified();
        return this.leaderboard.getLeaderboardRank(options);
    }

    public async updateUserLeaderboardScore(options: LeaderboardUpdateUserScoreOptions): Promise<void> {
        this.checkVerified();
        return this.leaderboard.updateUserLeaderboardScore(options);
    }
}
