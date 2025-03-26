# Portex SDK

Portex SDK is designed for Telegram Web App, providing the following main features:

- User Verification
- Social Features (Friend Invitation)
- Payment Features (Payment, Order Query)

## Quick Start
Reference https://sdk.portex.app/portex-sdk.min.js

```javascript
// Initialize SDK
const portex = new Portex({
  appId: 'your-app-id',
  environment: 'prod' // or 'dev'
});

// Initialize and verify user
await portex.init();

// Invite friends
const inviteResult = await portex.invite({
  expire: 3600, // Expiration time (seconds)
  text: 'Come play with me!',
  payload: 'custom-data'
});
```

## Development
```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test
```

## API Documentation

### portex.init(): Promise<VerifyResult>

Initialize SDK and verify user.

```typescript
interface VerifyResult {
  status: 'ok' | 'failed' | 'pending';
  timestamp: number;
}
```

### portex.isVerified(): boolean

Check if user is verified.

### portex.invite(options: InviteOptions): Promise<InviteResult>

Friend invitation interface.

```typescript
interface InviteOptions {
  expire: number;      // Expiration time (seconds)
  text?: string;       // Share text
  payload?: string;    // Custom data
}

interface InviteResult {
  invite_url: string;  // Invitation link
  key: string;         // Invitation ID
}
```

### portex.queryInvitePayload(key: string): Promise<InvitePayloadResult>

Get invitation information

```typescript
interface InvitePayloadResult {
  payload: string;  // Invitation payload
}
```

## License

MIT 