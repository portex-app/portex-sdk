import { InviteOptions, InviteResult,InvitePayloadResult, IPortex } from '../core/types';
import { copyText } from '../lib/until';

/**
 * Social module implementation
 * @internal
 */
export default class SocialModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * Get invite url
   * @param options - Invite options
   * @returns Invite result
   */
  private async getInviteUrl(options: InviteOptions): Promise<InviteResult> {
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
    
    return {
      ...result,
      key
    };
  }

  /**
   * Invite friends or groups
   * @param options - Invite options
   * @returns Invite result
   */
  async invite(options: InviteOptions): Promise<InviteResult> {
    try {
      const result = await this.getInviteUrl(options);

      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        result.invite_url
      )}&text=${encodeURIComponent(options.text || "")}`;

      // Open share link
      this.portex.webApp?.openTelegramLink(shareUrl);

      return result;
    } catch (error) {
      throw new Error('Failed to invite friends or groups');
    }
  }

  /**
   * Copy invite url
   * @param options - Invite options
   * @returns Invite result
   */
  async copyInviteUrl(options: InviteOptions): Promise<InviteResult> {
    let result: InviteResult;
    try {
      result = await this.getInviteUrl(options);
    } catch (error) {
      throw new Error('Failed to get invite url');
    }

    // Copy invite url
    try {
      await copyText(result.invite_url);
    } catch (error) {
      throw new Error(JSON.stringify(result));
    }

    return result;
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