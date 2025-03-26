import { InviteOptions, InviteResult,InvitePayloadResult, IPortex } from '../core/types';

/**
 * 社交模块实现
 * @internal
 */
export default class SocialModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * 邀请好友或群组
   * @param options - 邀请选项
   * @returns 邀请结果
   */
  async invite(options: InviteOptions): Promise<InviteResult> {
    // 实现邀请逻辑
    const resp = await this.portex.request<InviteResult>('/sdk/v1/tg/invite', {
      method: 'POST',
      data: {
        expire_seconds: options?.expire || 10 * 60,
        payload: options?.payload
      }
    });
    if (!resp.body) {
      throw new Error('Failed to get invite result');
    }
    const result = resp.body.result;
    const inviteUrl = result?.invite_url;
    if (!inviteUrl) {
      throw new Error('Failed to get invite url');
    }

    const url = new URL(inviteUrl);
    const key = url.searchParams.get('startapp');
    if (!key) {
      throw new Error('Failed to get key parameter');
    }

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      inviteUrl
    )}&text=${encodeURIComponent(options.text || "")}`;

    // 打开分享链接
    this.portex.webApp?.openTelegramLink(shareUrl);
    
    if (!result?.invite_url) {
      throw new Error('Failed to get invite url');
    }
    
    return {
      ...result,
      key
    };
  }

  /**
   * 查询邀请结果
   * @param key - payload key
   * @returns 邀请结果
   */
  async queryInvitePayload(key: string): Promise<InvitePayloadResult> {
    const resp = await this.portex.request<InvitePayloadResult>('/sdk/v1/tg/payload', {
      method: 'GET',
      data: { key }
    });
    if (!resp.ok) {
      throw new Error('Failed to get invite result');
    }
    const result = resp.body?.result;
    
    if (!result) {
      throw new Error('Failed to get invite result');
    }

    return result;
  }
} 