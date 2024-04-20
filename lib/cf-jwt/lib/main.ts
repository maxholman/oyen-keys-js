import { CustomError } from '@block65/custom-error';
import {
  encodeBase64Url,
  decodeBase64Url,
  base64UrlToObject,
  objectToBase64Url,
} from '../../base64.js';
import {
  assertObject,
  assertArray,
  assertStringKeyInObject,
  assertString,
} from '../utils.js';
import { algorithms } from './algorithms.js';

class ValidationError extends CustomError {}

export type JwtAlgorithm =
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512';

export interface JwtHeader {
  typ: 'JWT';
  alg: JwtAlgorithm;
  kid?: string;
  [key: string]: unknown;
}

export type JwtPayload = {
  /** Issuer */
  iss?: string;

  /** Subject */
  sub?: string;

  /** Audience */
  aud?: string | string[];

  /** Expiration Time */
  exp?: number;

  /** Not Before */
  nbf?: number;

  /** Issued At */
  iat?: number;

  /** JWT ID */
  jti?: string;

  [key: string]: unknown;
};

export function decode(token: string) {
  const tokenParts = token.split('.') as [string, string, string];

  if (tokenParts.length !== 3) {
    throw new ValidationError('token must consist of 3 parts').addDetail({
      reason: 'token-format',
      metadata: {
        parts: tokenParts.length,
      },
    });
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = tokenParts;

  return {
    // headerStr,
    header: base64UrlToObject<JwtHeader>(headerEncoded),
    // payloadStr,
    payload: base64UrlToObject<JwtPayload>(payloadEncoded),
    // signatureStr,
    signature: decodeBase64Url(signatureEncoded),
    signedData: new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`),
  };
}

export async function sign(
  payload: JwtPayload,
  key: CryptoKey,
  options: {
    algorithm: JwtAlgorithm;
    kid?: string;
  },
): Promise<string> {
  if (payload === null || typeof payload !== 'object') {
    throw new Error('payload must be an object');
  }

  if (!(key instanceof CryptoKey)) {
    throw new Error('key must be a CryptoKey');
  }

  if (typeof options.algorithm !== 'string') {
    throw new Error('options.algorithm must be a string');
  }

  const headerStr = objectToBase64Url<JwtHeader>({
    typ: 'JWT',
    alg: options.algorithm,
    ...(options.kid && { kid: options.kid }),
  });

  const payloadStr = objectToBase64Url<JwtPayload>({
    // iat: Math.floor(Date.now() / 1000),
    ...payload,
  });

  const dataStr = `${headerStr}.${payloadStr}`;

  const signature = await crypto.subtle.sign(
    algorithms[options.algorithm],
    key,
    new TextEncoder().encode(dataStr),
  );

  return `${dataStr}.${encodeBase64Url(signature)}`;
}

export async function verify<
  P extends JwtPayload,
  H extends JwtHeader = JwtHeader,
>(token: string, key: CryptoKey): Promise<{ header: H; payload: P }> {
  if (typeof token !== 'string') {
    throw new Error('token argument must be a string');
  }

  if (!(key instanceof CryptoKey)) {
    throw new Error('key argument must be a CryptoKey');
  }

  const { header, payload, signature, signedData } = decode(token);

  if (payload.nbf && payload.nbf > Math.floor(Date.now() / 1000)) {
    throw new Error('NOT_YET_VALID');
  }

  if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('EXPIRED');
  }

  const verified = await crypto.subtle.verify(
    algorithms[header.alg],
    key,
    signature,
    signedData,
  );

  if (!verified) {
    throw new Error('Token did not verify');
  }
  return { header, payload } as { header: H; payload: P };
}

export async function verifyJwks<
  P extends JwtPayload,
  H extends JwtHeader = JwtHeader,
>(token: string, jwksUri: URL): Promise<{ header: JwtHeader; payload: P }> {
  if (typeof token !== 'string') {
    throw new Error('token argument must be a string');
  }

  const { header } = decode(token);

  const jwks = await fetch(jwksUri).then((res) => res.json());

  assertObject(jwks);
  assertArray(jwks.keys);

  const key = jwks.keys.find((k) => {
    assertObject(k);
    return k.kid === header.kid;
  });

  if (!key) {
    throw new ValidationError('No usable key found for verification').debug({
      header,
      jwks,
      jwksUri,
      keysCount: jwks.keys.length,
    });
  }

  assertObject(key);
  assertStringKeyInObject(key, 'alg');
  assertString<JwtAlgorithm>(key.alg);

  // assertKeyInObject(key, 'e');
  // assertKeyInObject(key, 'kty');
  // assertKeyInObject(key, 'n');
  // assertKeyInObject(key, 'use');

  const algorithm = algorithms[key.alg];

  const keyData = await crypto.subtle.importKey('jwk', key, algorithm, false, [
    'verify',
  ]);
  return verify<P, H>(token, keyData);
}
