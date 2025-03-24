import { PortexSDK } from 'portex-sdk';

describe('PortexSDK', () => {
  let sdk: PortexSDK;

  beforeEach(() => {
    sdk = new PortexSDK({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      environment: 'development'
    });
  });

  describe('Auth Module', () => {
    it('should initialize auth module', () => {
      expect(sdk.auth).toBeDefined();
    });

    it('should throw error when calling unimplemented login method', async () => {
      await expect(sdk.auth.login()).rejects.toThrow('Method not implemented.');
    });

    it('should throw error when calling unimplemented logout method', async () => {
      await expect(sdk.auth.logout()).rejects.toThrow('Method not implemented.');
    });

    it('should throw error when calling unimplemented refreshToken method', async () => {
      await expect(sdk.auth.refreshToken()).rejects.toThrow('Method not implemented.');
    });
  });

  describe('Social Module', () => {
    it('should initialize social module', () => {
      expect(sdk.social).toBeDefined();
    });

    it('should throw error when calling unimplemented inviteFriend method', async () => {
      await expect(sdk.social.inviteFriend()).rejects.toThrow('Method not implemented.');
    });

    it('should throw error when calling unimplemented shareGame method', async () => {
      await expect(sdk.social.shareGame()).rejects.toThrow('Method not implemented.');
    });

    it('should throw error when calling unimplemented getFriendsList method', async () => {
      await expect(sdk.social.getFriendsList()).rejects.toThrow('Method not implemented.');
    });
  });

  describe('Payment Module', () => {
    it('should initialize payment module', () => {
      expect(sdk.payment).toBeDefined();
    });

    it('should throw error when calling unimplemented pay method', async () => {
      const paymentOptions = {
        amount: 100,
        currency: 'CNY',
        productId: 'test-product',
        productName: 'Test Product'
      };
      await expect(sdk.payment.pay(paymentOptions)).rejects.toThrow('Method not implemented.');
    });

    it('should throw error when calling unimplemented queryOrder method', async () => {
      await expect(sdk.payment.queryOrder('test-order-id')).rejects.toThrow('Method not implemented.');
    });
  });
}); 