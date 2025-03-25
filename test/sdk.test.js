const { describe, it, expect, beforeEach } = require('@jest/globals');
const { Portex } = require('../dest/portex-sdk');

describe('Portex SDK', () => {
  let portex;

  beforeEach(() => {
    portex = new Portex({
      appId: 'test-app-id',
      initData: 'test-init-data',
      environment: 'development'
    });
  });

  describe('Initialization', () => {
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
    it('should throw error when calling unimplemented invite method', async () => {
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
      
      await portex.init();
      
      await expect(portex.invite({
        type: 'friend',
        title: 'Join my game!',
        description: 'Come play with me!'
      })).rejects.toThrow('Method not implemented.');
    });
  });

  describe('Payment', () => {
    beforeEach(async () => {
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