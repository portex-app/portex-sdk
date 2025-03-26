const { describe, it, expect, beforeEach } = require('@jest/globals');
const Portex = require('../dist/portex-sdk.js');

// Mock browser environment
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
      },
      openTelegramLink: jest.fn()
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

    // Mock WebApp
    window.Telegram.WebApp.openTelegramLink = jest.fn();

    // Mock fetch API with default success response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({
        data: {
          user_id: 'test-user',
          verified: true,
          token: 'test-token',
          expire_at: Date.now() + 3600000
        }
      })
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with Telegram Web App', async () => {
      const result = await portex.init();
      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('number');
    });

    it('should not be verified before initialization', () => {
      expect(portex.isVerified()).toBe(false);
    });

    it('should throw error when calling methods before initialization', async () => {
      // Mock fetch to fail for unverified user
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({
          error: 'User not verified, please call init() method first'
        })
      });

      await expect(portex.invite({
        expire: 5,
        text: 'Join my game!',
        payload: 'test-payload'
      })).rejects.toThrow('User not verified, please call init() method first');

      await expect(portex.pay({
        amount: 100,
        currency: 'CNY',
        productId: 'test-product',
        productName: 'Test Product'
      })).rejects.toThrow('User not verified, please call init() method first');

      await expect(portex.queryOrder('test-order-id'))
        .rejects.toThrow('User not verified, please call init() method first');
    });
  });

  describe('Social Module', () => {
    beforeEach(async () => {
      await portex.init();
    });

    it('should create invite successfully', async () => {
      const mockResponse = {
        invite_url: 'https://t.me/share/url?startapp=test-invite-key&text=Join%20my%20game!',
        key: 'test-invite-key'
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse)
      });

      const result = await portex.invite({
        expire: 5,
        text: 'Join my game!',
        payload: 'test-payload'
      });

      expect(result.invite_url).toBe(mockResponse.invite_url);
      expect(result.key).toBe(mockResponse.key);
      expect(window.Telegram.WebApp.openTelegramLink).toHaveBeenCalledWith(
        `https://t.me/share/url?url=${encodeURIComponent(mockResponse.invite_url)}&text=${encodeURIComponent('Join my game!')}`
      );
    });

    it('should query invite successfully', async () => {
      const mockResponse = {
        data: {
          payload: 'test-payload',
          key: 'test-invite-key'
        }
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse)
      });

      const result = await portex.social.queryInvitePayload('test-invite-key');
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should throw error when invite creation fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error: 'Invalid parameters'
        })
      });

      await expect(portex.invite({
        expire: 5,
        text: 'Join my game!',
        payload: 'test-payload'
      })).rejects.toThrow('Request failed: Bad Request');
    });
  });

  describe('Payment Module', () => {
    beforeEach(async () => {
      await portex.init();
    });

    it('should create payment successfully', async () => {
      const mockResponse = {
        data: {
          orderId: 'test-order-id',
          status: 'pending',
          amount: 100,
          timestamp: Date.now()
        }
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse)
      });

      const result = await portex.pay({
        amount: 100,
        currency: 'CNY',
        productId: 'test-product',
        productName: 'Test Product'
      });

      expect(result.data).toEqual(mockResponse.data);
    });

    it('should query order successfully', async () => {
      const mockResponse = {
        data: {
          orderId: 'test-order-id',
          status: 'completed',
          amount: 100,
          timestamp: Date.now()
        }
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse)
      });

      const result = await portex.queryOrder('test-order-id');
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should throw error when payment creation fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error: 'Invalid payment parameters'
        })
      });

      await expect(portex.pay({
        amount: 100,
        currency: 'CNY',
        productId: 'test-product',
        productName: 'Test Product'
      })).rejects.toThrow('Request failed: Bad Request');
    });
  });
}); 