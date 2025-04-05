import { PaymentOptions, PaymentResult, OrderResult,InvoiceClosedResult, IPortex } from '../core/types';
import { storage } from '../lib/until';

/**
 * Payment module implementation
 * @internal
 */
export default class PaymentModule {
  constructor(private readonly portex: IPortex) {}

  /**
   * Initiate payment
   * @param options - Payment options
   * @param callback - Optional callback for payment result
   * @returns Payment result
   */
  async pay(options: PaymentOptions,callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult> {
    const resp = await this.portex.call<any>('/sdk/v1/tg/payment/create', {
      method: 'POST',
      data: options
    });
    if (!resp.ok) {
      throw new Error('Failed to get payment result');
    }
    const paymentResult = resp.body?.result;
    if (!paymentResult) {
      throw new Error('Failed to get payment result');
    }
    
    const paymentUrl = paymentResult.tg_payment_url;
    if (!paymentUrl) {
      throw new Error('Failed to get payment url');
    }

    this.portex.webApp.openInvoice(paymentUrl, (result: string) => {
      console.log('payment result', result);
      if (result === 'pending' || result === 'cancelled') {
        this.cachePendingPayment(paymentResult);
      }else{
        this.clearPendingPayment();
      }

      callback?.({
        orderId: paymentResult.tg_payment_id,
        status: result as InvoiceClosedResult['status'],
      });
    });

    return paymentResult;
  }

  /**
   * Resume pending payment
   * @param callback - Optional callback for payment result
   * @returns Payment result or null if no pending payment
   */
  async resumePayment(callback?: (result: InvoiceClosedResult) => void): Promise<PaymentResult | null> {
    const paymentResult = storage.get<PaymentResult>('payment_pending');
    if (!paymentResult) {
      throw new Error('No pending payment');
    }

    this.portex.webApp.openInvoice(paymentResult.tg_payment_url, (result: string) => {
      if (result === 'pending' || result === 'cancelled') {
        this.cachePendingPayment(paymentResult);
      }else{
        this.clearPendingPayment();
      }

      callback?.({
        orderId: paymentResult.tg_payment_id,
        status: result as InvoiceClosedResult['status'],
      });
    });

    return paymentResult;
  }

  /**
   * Check if there is a pending payment
   * @returns Whether there is a pending payment
   */
  public hasPendingPayment(): boolean {
    return storage.get<InvoiceClosedResult>('payment_pending') !== null;
  }

  /**
   * Cache pending payment URL
   * @param paymentUrl - Payment URL to cache
   */
  private cachePendingPayment(result: PaymentResult) {
    storage.set('payment_pending', result, 1000 * 60 * 5);
  }
  
  /**
   * Clear pending payment URL
   */
  private clearPendingPayment() {
    storage.remove('payment_pending');
  }
  
  /**
   * Query order status
   * @param orderId - Order ID
   * @returns Order result
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