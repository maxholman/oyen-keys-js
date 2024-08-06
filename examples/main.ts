/* eslint-disable no-console */
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
