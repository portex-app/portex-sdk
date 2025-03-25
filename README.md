# Portex SDK

Portex SDK 是一个为游戏开发设计的 SDK，支持 Laya 和 Cocos 引擎。它提供了以下主要功能：

- 用户认证（登录）
- 社交功能（好友邀请）
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
import { Portex } from 'portex-sdk';

// 初始化 SDK
const portex = new Portex({
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  environment: 'development'
});

// 用户登录
const loginResult = await portex.login({
  type: 'account',
  account: 'username',
  password: 'password'
});

// 邀请好友
const inviteResult = await portex.invite({
  type: 'friend',
  title: '来玩游戏！',
  description: '和我一起玩吧！'
});

// 支付
const payResult = await portex.pay({
  amount: 100,
  currency: 'CNY',
  productId: 'product-1',
  productName: '钻石礼包',
  channel: 'wechat'
});

// 查询订单
const orderResult = await portex.queryOrder('order-123');
```

## API 文档

### portex.login(options?: LoginOptions): Promise<LoginResult>

用户登录接口。

```typescript
interface LoginOptions {
  type?: 'guest' | 'account' | 'wechat';
  account?: string;
  password?: string;
}

interface LoginResult {
  userId: string;
  nickname: string;
  token: string;
  expireAt: number;
}
```

### portex.invite(options: InviteOptions): Promise<InviteResult>

好友邀请接口。

```typescript
interface InviteOptions {
  type: 'friend' | 'group';
  title?: string;
  description?: string;
  imageUrl?: string;
}

interface InviteResult {
  inviteId: string;
  inviteUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
}
```

### portex.pay(options: PayOptions): Promise<PayResult>

支付接口。

```typescript
interface PayOptions {
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  channel?: 'wechat' | 'alipay' | 'apple' | 'google';
}

interface PayResult {
  orderId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  timestamp: number;
}
```

### portex.queryOrder(orderId: string): Promise<PayResult>

订单查询接口。

## 详细文档

更多详细信息请参考 [API 文档](./docs/index.html)。

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