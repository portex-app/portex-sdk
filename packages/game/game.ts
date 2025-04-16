import { IPortex } from "packages/core/types";

/**
 * Game module implementation
 * @internal
 */
export default class GameModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * Save game data
   * @param data - game data
   * @returns boolean - true if success
   * @throws Error - if failed to report user set
   */
  async save(data: Object = {}): Promise<boolean> {
    const resp = await this.portex.call<null>('/v1/saveGameRecord', {
      method: 'POST',
      data: { data }
    });
    if (!resp.ok) {
      throw new Error('Failed to report user set');
    }
    return resp.ok
  }
}