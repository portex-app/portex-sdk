# Portex SDK

Portex SDK 是一个为游戏开发设计的 SDK，支持 Laya 和 Cocos 引擎。它提供了以下主要功能：

- 用户认证（登录、登出、令牌刷新）
- 社交功能（好友邀请、游戏分享、好友列表）
- 支付功能（支付、订单查询）

## 安装

```bash
npm install portex-sdk
# 或
yarn add portex-sdk
# 或
pnpm add portex-sdk
```

## 快速开始

```typescript
import { PortexSDK } from 'portex-sdk';

const sdk = new PortexSDK({
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  environment: 'development'
});

// 使用认证模块
await sdk.auth.login();

// 使用社交模块
await sdk.social.inviteFriend();

// 使用支付模块
await sdk.payment.pay({
  amount: 100,
  currency: 'CNY',
  productId: 'product-id',
  productName: 'Product Name'
});
```

## 文档

详细的 API 文档请参考 [API 文档](./docs/index.html)。

## 功能模块

### 认证模块 (Auth)
- 登录
- 登出
- 刷新令牌

### 社交模块 (Social)
- 好友邀请
- 游戏分享
- 获取好友列表

### 支付模块 (Payment)
- 支付
- 订单查询

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 代码检查
pnpm lint
```

## 许可证

MIT 