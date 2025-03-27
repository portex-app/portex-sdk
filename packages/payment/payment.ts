import { PaymentOptions, PaymentResult, OrderResult, IPortex } from '../core/types';

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
  async pay(options: PaymentOptions): Promise<PaymentResult> {
    const resp = await this.portex.call<any>('/sdk/v1/tg/payment/create', {
      method: 'POST',
      data: options
    });
    if (!resp.ok) {
      throw new Error('Failed to get payment result');
    }
    const result = resp.body?.result;
    if (!result) {
      throw new Error('Failed to get payment result');
    }
    return result;
  }

  /**
   * 查询订单
   * @param orderId - 订单 ID
   * @returns 支付结果
   */
  async queryOrder(orderId: string): Promise<OrderResult> {
    const resp = await this.portex.call<any>(`/sdk/v1/tg/payment/${orderId}`, {
      method: 'GET'
    });
    if (!resp.ok) {
      throw new Error('Failed to get order result');
    }
    const result = resp.body?.result;
    if (!result) {
      throw new Error('Failed to get order result');
    }
    return result;
  }
} 