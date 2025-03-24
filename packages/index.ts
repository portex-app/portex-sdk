import { SDKConfig } from './core/types';
import { PortexAuth } from './auth/auth';
import { PortexSocial } from './social/social';
import { PortexPayment } from './payment/payment';

/**
 * Portex SDK 主类，提供游戏开发所需的各种功能模块
 */
export class PortexSDK {
  private _auth: PortexAuth;
  private _social: PortexSocial;
  private _payment: PortexPayment;

  /**
   * 创建 PortexSDK 实例
   * @param config - SDK 配置信息
   */
  constructor(config: SDKConfig) {
    this._auth = new PortexAuth(config);
    this._social = new PortexSocial(config);
    this._payment = new PortexPayment(config);
  }

  /**
   * 获取认证模块
   */
  get auth() {
    return this._auth;
  }

  /**
   * 获取社交模块
   */
  get social() {
    return this._social;
  }

  /**
   * 获取支付模块
   */
  get payment() {
    return this._payment;
  }
}

export * from './core/types';
export * from './auth/auth';
export * from './social/social';
export * from './payment/payment'; 