const { describe, it, expect, beforeEach } = require('@jest/globals');
const { Portex } = require('../dest/portex-sdk');

// 模拟浏览器环境
global.window = {
  Telegram: {
    WebApp: {
      initData: 'test-init-data',
      initDataUnsafe: {
        user: {
          id: 12345,
          first_name: 'Test',
          username: 'test_user'
        },
        auth_date: Date.now(),
        hash: 'test-hash'
      }
    }
  }
};

describe('Portex SDK', () => {
  let portex;

  beforeEach(() => {
    portex = new Portex({
      appId: 'test-app-id',
      environment: 'dev'
    });

    // 模拟fetch API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        userId: 'test-user',
        verified: true,
        token: 'test-token',
        expireAt: Date.now() + 3600000
      })
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with Telegram Web App', async () => {
      const result = await portex.init();
      expect(result.userId).toBe('test-user');
      expect(result.verified).toBe(true);
      expect(result.token).toBe('test-token');
      expect(typeof result.expireAt).toBe('number');
    });

    it('should not be verified before initialization', () => {
      expect(portex.isVerified()).toBe(false);
    });

    it('should throw error when calling methods before initialization', async () => {
      await expect(portex.invite({
        type: 'friend',
        title: 'Join my game!',
        description: 'Come play with me!'
      })).rejects.toThrow('用户未验证，请先调用init()方法');

      await expect(portex.pay({
        amount: 100,
        currency: 'CNY',
        productId: 'test-product',
        productName: 'Test Product'
      })).rejects.toThrow('用户未验证，请先调用init()方法');

      await expect(portex.queryOrder('test-order-id'))
        .rejects.toThrow('用户未验证，请先调用init()方法');
    });
  });

  describe('Social', () => {
    beforeEach(async () => {
      await portex.init();
    });

    it('should throw error when calling unimplemented invite method', async () => {
      await expect(portex.invite({
        type: 'friend',
        title: 'Join my game!',
        description: 'Come play with me!'
      })).rejects.toThrow('Method not implemented.');
    });
  });

  describe('Payment', () => {
    beforeEach(async () => {
      await portex.init();
    });

    it('should throw error when calling unimplemented pay method', async () => {
      await expect(portex.pay({
        amount: 100,
        currency: 'CNY',
        productId: 'test-product',
        productName: 'Test Product'
      })).rejects.toThrow('Method not implemented.');
    });

    it('should throw error when calling unimplemented queryOrder method', async () => {
      await expect(portex.queryOrder('test-order-id'))
        .rejects.toThrow('Method not implemented.');
    });
  });
}); 