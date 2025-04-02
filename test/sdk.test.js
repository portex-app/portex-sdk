const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
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
      openTelegramLink: jest.fn(),
      openInvoice: jest.fn((url, callback) => {
        callback('paid');
      })
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
        ok: true,
        body: {
          result: {
            user_id: 'test-user',
            verified: true,
            token: 'test-token',
            expire_at: Date.now() + 3600000
          }
        }
      })
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with Telegram Web App', async () => {
      const result = await portex.init();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });

    it('should not be verified before initialization', () => {
      expect(portex.isVerified).toBe(false);
    });

    it('should throw error when calling methods before initialization', async () => {
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
      const mockInviteUrl = 'https://t.me/share/url?startapp=test-invite-key&text=Join%20my%20game!';
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({
          ok: true,
          result: {
            invite_url: mockInviteUrl,
            key: 'test-invite-key'
          }
        })
      });

      const result = await portex.invite({
        expire: 5,
        text: 'Join my game!',
        payload: 'test-payload'
      });

      expect(result.invite_url).toBe(mockInviteUrl);
      expect(result.key).toBe('test-invite-key');
      expect(window.Telegram.WebApp.openTelegramLink).toHaveBeenCalledWith(
        `https://t.me/share/url?url=${encodeURIComponent(mockInviteUrl)}&text=${encodeURIComponent('Join my game!')}`
      );
    });

    it('should query invite successfully', async () => {
      const mockPayload = {
        payload: 'test-payload',
        key: 'test-invite-key'
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({
          ok: true,
          result: mockPayload
        })
      });

      const result = await portex.getInvitePayload('test-invite-key');
      expect(result).toEqual(mockPayload);
    });

    it('should throw error when invite creation fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          ok: false,
          error: 'Invalid parameters'
        })
      });

      await expect(portex.invite({
        expire: 5,
        text: 'Join my game!',
        payload: 'test-payload'
      })).rejects.toThrow('Failed to get invite url');
    });

    it('should throw error when querying invite fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          ok: false,
          error: 'Invalid key'
        })
      });

      await expect(portex.getInvitePayload('invalid-key'))
        .rejects.toThrow('Failed to get invite result');
    });
  });

  describe('Payment Module', () => {
    let now;
    
    beforeEach(async () => {
      await portex.init();

      // Mock Date.now
      now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);

      // Mock WebApp.openInvoice
      window.Telegram.WebApp.openInvoice = jest.fn((url, callback) => {
        callback('paid');
      });

      // Mock localStorage
      global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create payment successfully', async () => {
      const mockPayment = {
        tg_payment_id: 12345,
        tg_payment_url: 'https://t.me/$123456789_987654321'
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({
          ok: true,
          result: mockPayment
        })
      });

      const result = await portex.pay({
        tg_use_id: '12345',
        amount: 100,
        label: 'Test Product',
        title: 'Test Payment',
        description: 'Test payment description'
      });

      expect(result).toEqual(mockPayment);
      expect(window.Telegram.WebApp.openInvoice).toHaveBeenCalledWith(
        mockPayment.tg_payment_url,
        expect.any(Function)
      );
    });

    it('should query order successfully', async () => {
      const mockOrder = {
        amount: 100,
        application_id: 'test-app-id',
        description: 'Test payment description',
        label: 'Test Product',
        payload: 'test-payload',
        status: 1,
        status_description: 'success',
        tg_payment_id: '12345',
        tg_use_id: '12345',
        title: 'Test Payment'
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({
          ok: true,
          result: mockOrder
        })
      });

      const result = await portex.queryOrder('test-order-id');
      expect(result).toEqual(mockOrder);
    });

    it('should throw error when payment creation fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({
          ok: true,
          result: {
            tg_payment_id: 12345
            // Missing tg_payment_url
          }
        })
      });

      await expect(portex.pay({
        tg_use_id: '12345',
        amount: 100,
        label: 'Test Product',
        title: 'Test Payment',
        description: 'Test payment description'
      })).rejects.toThrow('Failed to get payment url');
    });

    it('should handle different payment statuses', async () => {
      const mockPayment = {
        tg_payment_id: 12345,
        tg_payment_url: 'https://t.me/$123456789_987654321'
      };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({
          ok: true,
          result: mockPayment
        })
      });

      // Test cancelled status
      window.Telegram.WebApp.openInvoice = jest.fn((url, callback) => {
        callback('cancelled');
      });

      await portex.pay({
        tg_use_id: '12345',
        amount: 100,
        label: 'Test Product',
        title: 'Test Payment',
        description: 'Test payment description'
      });

      // Test failed status
      window.Telegram.WebApp.openInvoice = jest.fn((url, callback) => {
        callback('failed');
      });

      await portex.pay({
        tg_use_id: '12345',
        amount: 100,
        label: 'Test Product',
        title: 'Test Payment',
        description: 'Test payment description'
      });

      // Test pending status
      window.Telegram.WebApp.openInvoice = jest.fn((url, callback) => {
        callback('pending');
      });

      await portex.pay({
        tg_use_id: '12345',
        amount: 100,
        label: 'Test Product',
        title: 'Test Payment',
        description: 'Test payment description'
      });
    });

    it('should throw error when querying order fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          ok: false,
          error: 'Order not found'
        })
      });

      await expect(portex.queryOrder('invalid-order-id'))
        .rejects.toThrow('Failed to get order result');
    });

    it('should handle resumePayment correctly', async () => {
      const mockPaymentUrl = 'https://t.me/$123456789_987654321';
      const mockStorageData = {
        value: mockPaymentUrl,
        expire: now + 1000 * 60 * 5 // 5 minutes from now
      };
      
      global.localStorage.getItem = jest.fn(() => JSON.stringify(mockStorageData));

      // Test successful resume
      window.Telegram.WebApp.openInvoice = jest.fn((url, callback) => {
        callback('paid');
      });

      const result = await portex.resumePayment();
      expect(result).toBe(mockPaymentUrl);
      expect(window.Telegram.WebApp.openInvoice).toHaveBeenCalledWith(
        mockPaymentUrl,
        expect.any(Function)
      );

      // Test no pending payment
      global.localStorage.getItem = jest.fn(() => null);
      await expect(portex.resumePayment())
        .rejects.toThrow('No pending payment');
    });
  });
}); 