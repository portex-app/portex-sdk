import { IPortex } from "packages/core/types";

/**
 * Report module implementation
 * @internal
 */
export default class ReportModule {
  constructor(private readonly portex: IPortex) {}
  
  /**
   * Report user set
   * @param key - user set data
   * @returns boolean - true if success
   * @throws Error - if failed to report user set
   */
  async userSet(data: Object = {}): Promise<boolean> {
    const resp = await this.portex.call<null>('/v1/reportUserSet', {
      method: 'POST',
      data: { data }
    });
    if (!resp.ok) {
      throw new Error('Failed to report user set');
    }
    return resp.ok
  }

    /**
   * Report track
   * @param key - report track data
   * @returns boolean - true if success
   * @throws Error - if failed to report
   */
  async track(eventName: string, data: Object = {}): Promise<boolean> {
    const resp = await this.portex.call<null>('/v1/reportTrack', {
      method: 'POST',
      data: {
        event_name: eventName,
        data
      }
    });
    if (!resp.ok) {
      throw new Error('Failed to report track');
    }
    return resp.ok
  }
} 