# Portex SDK

Portex SDK 是一个为 Telegram Web App 设计的 SDK，提供了以下主要功能：

- 用户验证
- 社交功能（好友邀请）
- 支付功能（支付、订单查询）

## 快速开始
引用 https://sdk.portex.app/portex-sdk.js

```javascript
// 初始化 SDK
const portex = new Portex({
  appId: 'your-app-id',
  environment: 'prod' // 或 'dev'
});

// 初始化并验证用户
await portex.init();

// 邀请好友
const inviteResult = await portex.invite({
  expire: 3600, // 过期时间（秒）
  text: '来玩游戏！',
  payload: 'custom-data'
});
```

## 开发
```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 测试
pnpm test
```

## API 文档

### portex.init(): Promise<VerifyResult>

初始化 SDK 并验证用户。

```typescript
interface VerifyResult {
  status: 'ok' | 'failed' | 'pending';
  timestamp: number;
}
```

### portex.isVerified(): boolean

检查用户是否已验证。

### portex.invite(options: InviteOptions): Promise<InviteResult>

好友邀请接口。

```typescript
interface InviteOptions {
  expire: number;      // 过期时间（秒）
  text?: string;       // 分享文本
  payload?: string;    // 自定义数据
}

interface InviteResult {
  invite_url: string;  // 邀请链接
  key: string;         // 邀请 ID
}
```
### portex.queryInvitePayload(key: string): Promise<InvitePayloadResult>

获取邀请信息

```typescript
interface InvitePayloadResult {
  payload: string;  // 邀请payload
}

```

## 许可证

MIT 