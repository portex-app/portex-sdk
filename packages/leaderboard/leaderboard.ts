/**
 * Leaderboard module implementation
 * @internal
 */

import { IPortex, LeaderboardTopNOptions, LeaderboardTopNResult, LeaderboardRankOptions, LeaderboardRankResult, LeaderboardUpdateUserScoreOptions } from "packages/core/types";

export default class LeaderboardModule {
    constructor(private readonly portex: IPortex) { }

    /**
     * Get leaderboard top N
     * @param options - Leaderboard top N options max:1000
     * @returns Leaderboard top N result
     */
    async getLeaderboardTopN(options: LeaderboardTopNOptions): Promise<LeaderboardTopNResult> {
        const resp = await this.portex.call<any>('/v1/getLeaderboardTopN', {
            method: 'POST',
            data: options
        });
        if (!resp.ok) {
            throw new Error('Failed to get leaderboard top N');
        }
        const LeaderBoardTopNResult = resp.body?.result;
        if (!LeaderBoardTopNResult) {
            throw new Error('Failed to get leaderboard top N');
        }
        return LeaderBoardTopNResult.leaderboard_users;
    }

    /**
     * Get leaderboard rank
     * @param options - Leaderboard rank options
     * @returns Leaderboard rank
     */
    async getLeaderboardRank(options: LeaderboardRankOptions): Promise<LeaderboardRankResult> {
        const resp = await this.portex.call<any>('/v1/getLeaderboardRank', {
            method: 'POST',
            data: options
        });
        if (!resp.ok) {
            throw new Error('Failed to get leaderboard rank');
        }
        const LeaderBoardRankResult = resp.body?.result;
        if (!LeaderBoardRankResult) {
            throw new Error('Failed to get leaderboard rank');
        }
        return LeaderBoardRankResult;
    }

    /**
     * Update user leaderboard score
     * @param options - Leaderboard update user score options
     */
    async updateUserLeaderboardScore(options: LeaderboardUpdateUserScoreOptions): Promise<void> {
        const resp = await this.portex.call<any>('/v1/updateLeaderboardUserScore', {
            method: 'POST',
            data: options
        });
        if (!resp.ok) {
            throw new Error('Failed to update user leaderboard score');
        }
        return;
    }
}