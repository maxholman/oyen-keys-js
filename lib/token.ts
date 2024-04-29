import type { JsonObject } from 'type-fest';
import { decodeBase64Url } from './base64.js';
import { algorithms } from './cf-jwt/lib/algorithms.js';
import { sign } from './cf-jwt/lib/main.js';

export async function createToken<T extends JsonObject>({
  privateKey,
  ttlSecs,
  claims,
}: {
  privateKey: string;
  ttlSecs?: number;
  claims?: T;
}) {
  const decoded = decodeBase64Url(privateKey);
  const jwk = JSON.parse(new TextDecoder().decode(decoded)) as JsonWebKey;

  const algorithm = 'RS256';

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    algorithms[algorithm],
    false,
    ['sign'],
  );

  const iat = Math.floor(Date.now() / 1000);
  const exp = ttlSecs ? iat + ttlSecs : undefined;

  return sign(
    {
      ...claims,
      iat,
      ...(exp && { exp }),
    },
    cryptoKey,
    {
      ...('kid' in jwk && typeof jwk.kid === 'string' && { kid: jwk.kid }),
      algorithm: 'RS256',
    },
  );
}
