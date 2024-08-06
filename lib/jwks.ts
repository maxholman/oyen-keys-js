import { JwksFetchError, KeyNotFoundError } from './errors.js';
import { decode, type JwtPayload } from './jwt.js';
import { verifyToken } from './token.js';
import {
  assertArray,
  assertKeyInObjectIsString,
  assertObject,
  assertString,
  assertTruthy,
} from './utils.js';

export async function verifyTokenWithJwks<P extends JwtPayload>(
  token: string | unknown,
  jwksUri: URL,
  { fetch = globalThis.fetch }: { fetch: typeof globalThis.fetch },
) {
  assertString(token);

  const { header } = decode(token);
  assertKeyInObjectIsString(header, 'kid');
  assertKeyInObjectIsString(header, 'alg');

  // no point even trying
  assertTruthy(header.alg !== 'none');

  const jwks = await fetch(jwksUri).then((res) => {
    if (
      res.ok &&
      res.headers.get('content-type')?.startsWith('application/json')
    ) {
      return res.json();
    }
    throw new JwksFetchError('Failed to fetch JWKS').debug({
      status: res.status,
      contentType: res.headers.get('content-type'),
      statusText: res.statusText,
    });
  });

  assertObject(jwks);
  assertArray(jwks.keys);

  const key = jwks.keys.find((k) => {
    assertObject(k);
    assertKeyInObjectIsString(k, 'kid');
    return k.kid === header.kid;
  });

  if (!key) {
    throw new KeyNotFoundError('No usable key found for verification').debug({
      header,
      jwks,
      jwksUri,
      keysCount: jwks.keys.length,
    });
  }

  assertObject(key);
  assertKeyInObjectIsString(key, 'alg');
  assertKeyInObjectIsString(key, 'kty');

  return verifyToken<P>(key, token);
}
