import { InviteOptions, InvitePayloadResult, InviteResult, IPortex } from '../core/types';

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
  async getInviteUrl(options: InviteOptions): Promise<InviteResult> {
    // Implement invite logic
    const resp = await this.portex.call<InviteResult>('/v1/generateTgInvitationUrl', {
      method: 'POST',
      data: {
        expire_seconds: options?.expire || 10 * 60,
        ...(options?.start_param ? {} : { payload: options?.payload })
      }
    });

    if (!resp.body) {
      throw new Error('Failed to get invite result');
    }
    const result = resp.body.result;
    const inviteUrl = result?.url;
    if (!inviteUrl) {
      throw new Error('Failed to get invite url');
    }

    const url = new URL(inviteUrl);

    
    if (options?.suffix) {
      const suffix = options.suffix.startsWith('/') ? options.suffix : `/${options.suffix}`;
      url.pathname = `${url.pathname}${suffix}`;
    }

    if (options?.start_param) {
      url.searchParams.set('startapp', options.start_param);
    }

    const key = url.searchParams.get('startapp');
    return {
      url: url.toString(),
      key: key || ''
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
        result.url
      )}&text=${encodeURIComponent(options.text || "")}`;

      // Open share link
      this.portex.webApp?.openTelegramLink(shareUrl);

      return result;
    } catch (error) {
      throw new Error('Failed to invite friends or groups');
    }
  }

  /**
   * Query invite result
   * @param key - Payload key
   * @returns Invite result
   */
  async getInvitePayload(key: string): Promise<InvitePayloadResult> {
    const resp = await this.portex.call<InvitePayloadResult>('/v1/getInvitationPayload', {
      method: 'POST',
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