import { PayOptions, PayResult, IPortex } from '../core/types';

/**
 * 支付模块实现
 * @internal
 */
export default class PaymentModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * 发起支付
   * @param options - 支付选项
   * @returns 支付结果
   */
  async pay(options: PayOptions): Promise<PayResult> {
    const result = await this.portex.request<PayResult>('/sdk/v1/tg/pay', {
      method: 'POST',
      data: options
    });
    if (!result.data) {
      throw new Error('Failed to get payment result');
    }
    return result.data;
  }

  /**
   * 查询订单
   * @param orderId - 订单 ID
   * @returns 支付结果
   */
  async queryOrder(orderId: string): Promise<PayResult> {
    const result = await this.portex.request<PayResult>('/sdk/v1/tg/order', {
      method: 'GET',
      data: { orderId }
    });
    if (!result.data) {
      throw new Error('Failed to get order result');
    }
    return result.data;
  }
} 