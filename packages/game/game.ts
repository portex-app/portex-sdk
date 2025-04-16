import { GameRecordResult, IPortex } from "packages/core/types";

/**
 * Game module implementation
 * @internal
 */
export default class GameModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * Save game record
   * @param record - game record data
   * @returns boolean - true if success
   * @throws Error - if failed to save game record
   */
  async saveRecord(record: Uint8Array): Promise<boolean> {
    const resp = await this.portex.call<null>('/v1/saveGameRecord', {
      method: 'POST',
      data: { record }
    });
    if (!resp.ok) {
      throw new Error('Failed to save game record');
    }
    return resp.ok
  }

  /**
   * Get game record
   * @returns record - game record
   * @throws Error - if failed to get game record
   */
  async getRecord(): Promise<GameRecordResult> {
    const resp = await this.portex.call<GameRecordResult>('/v1/getGameRecord', {
      method: 'POST',
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