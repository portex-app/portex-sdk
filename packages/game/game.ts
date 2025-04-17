import { GameRecordResult, IPortex } from "packages/core/types";

/**
 * Game module implementation
 * @internal
 */
export default class GameModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * Save game record
   * @param name - game record name
   * @param record - game record data
   * @returns boolean - true if success
   * @throws Error - if failed to save game record
   */
  async saveRecord(name: string, record: string): Promise<boolean> {
    const resp = await this.portex.call<null>('/v1/saveGameRecord', {
      method: 'POST',
      data: { name, record }
    });
    if (!resp.ok) {
      throw new Error('Failed to save game record');
    }
    return resp.ok
  }

  /**
   * Get game record
   * @param name - game record name
   * @returns record - game record
   * @throws Error - if failed to get game record
   */
  async getRecord(name: string): Promise<GameRecordResult> {
    const resp = await this.portex.call<GameRecordResult>('/v1/getGameRecord', {
      method: 'POST',
      data: { name }
    });
    if (!resp.ok) {
      throw new Error('Failed to get game record');
    }
    const result = resp.body?.result;
    if (!result) {
      throw new Error('Failed to get game record');
    }
    return result;
  }
}