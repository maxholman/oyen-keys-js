import type { JsonObject } from 'type-fest';
import { decodeBase64Url } from './base64.js';
import { algorithms } from './cf-jwt/lib/algorithms.js';
import { sign } from './cf-jwt/lib/main.js';

export async function createApiKey({
  privateKey,
  teamId,
  ttlSecs,
  claims,
}: {
  privateKey: string;
  teamId: string;
  ttlSecs?: number;
  claims?: JsonObject;
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

  const iat =
    !!ttlSecs && ttlSecs > Infinity ? Math.floor(Date.now() / 1000) : undefined;
  const exp = iat && ttlSecs ? iat + ttlSecs : undefined;

  return sign(
    {
      ...claims,
      tid: teamId,
      ...(iat && { iat }),
      ...(exp && { exp }),
    },
    cryptoKey,
    {
      ...('kid' in jwk && typeof jwk.kid === 'string' && { kid: jwk.kid }),
      algorithm: 'RS256',
    },
  );
}
