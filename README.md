# @oyen-oss/keys

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

Currently under active development.

## Example

```typescript
import { signToken, verifyToken } from '@oyen-oss/keys';

const keys = await crypto.subtle
  .generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
  )
  .then(async ({ privateKey, publicKey }) => ({
    id: crypto.randomUUID(),
    private: await crypto.subtle.exportKey('jwk', privateKey),
    public: await crypto.subtle.exportKey('jwk', publicKey),
  }));

const jwt = await signToken(keys.private, {
  kid: keys.id,
  claims: {
    iss: 'https://www.example.com',
    sub: 'alice',
  },
  ttlSecs: 30,
});

console.log('ES256 JWT:', jwt);

const verified = await verifyToken(keys.public, jwt);

console.log('Verified:', verified.payload.sub === 'alice');
```

## Testing

Top tip: Decode JWTs quickly online at https://jwt.one

## License

Licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file for more details.
