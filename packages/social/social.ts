import { InviteOptions, InviteResult,InvitePayloadResult, IPortex } from '../core/types';

/**
 * Social module implementation
 * @internal
 */
export default class SocialModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * Invite friends or groups
   * @param options - Invite options
   * @returns Invite result
   */
  async invite(options: InviteOptions): Promise<InviteResult> {
    // Implement invite logic
    const resp = await this.portex.call<InviteResult>('/sdk/v1/tg/invite', {
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

    // Open share link
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
   * Query invite result
   * @param key - Payload key
   * @returns Invite result
   */
  async getInvitePayload(key: string): Promise<InvitePayloadResult> {
    const resp = await this.portex.call<InvitePayloadResult>('/sdk/v1/tg/payload', {
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