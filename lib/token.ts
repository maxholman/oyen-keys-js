import type { JsonObject, SimplifyDeep } from 'type-fest';
import { base64UrlToObject, uint8ArrayToBase64Url } from './base64.js';
import { TokenExpiredError } from './errors.js';
import {
  getImportParams,
  getSigningParamsFromJwk,
  type JwtAlg,
} from './jwk.js';
import { decode, encode, type JwtPayload } from './jwt.js';
import {
  assertKeyInObjectIsString,
  assertString,
  assertTruthy,
  inline,
} from './utils.js';

async function definitelyJwk<T extends JsonWebKey>(
  maybeJwk: string | T,
  keyUsages: ReadonlyArray<KeyUsage>,
) {
  const jwk =
    typeof maybeJwk === 'string'
      ? base64UrlToObject<SimplifyDeep<T>>(maybeJwk)
      : maybeJwk;

  const importParams = getImportParams(jwk);

  return {
    key: await crypto.subtle.importKey(
      'jwk',
      jwk,
      importParams,
      false,
      keyUsages,
    ),
    jwk,
  };
}

export async function signToken<T extends JwtPayload>(
  maybeJwk: string | JsonWebKey,
  {
    kid,
    claims,
    ttlSecs = 60 * 60,
  }: {
    kid: string;
    claims: Omit<T, 'exp' | 'iat'> & Partial<Pick<T, 'exp' | 'iat'>>;
    ttlSecs: number;
  },
) {
  assertString(kid);

  const { jwk, key } = await definitelyJwk(maybeJwk, ['sign']);

  const alg = inline((): JwtAlg => {
    switch (jwk.kty) {
      case 'EC':
        return 'ES256';
      case 'RSA':
        return 'RS256';
      case 'OKP':
        return 'EdDSA';
      default:
        throw new Error(`Unsupported key type ${JSON.stringify(jwk.kty)}`);
    }
  });

  const header = {
    typ: 'JWT',
    kid,
    alg,
  };

  const iat =
    claims && 'iat' in claims && typeof claims.iat === 'number'
      ? claims.iat
      : Math.floor(Date.now() / 1000);

  const payload = {
    ...claims,
    iat,
    exp: iat + ttlSecs,
  };

  const encodedData = encode(header, payload);
  const signParams = getSigningParamsFromJwk(alg, jwk);

  const signature = await crypto.subtle.sign(
    signParams,
    key,
    new TextEncoder().encode(encodedData),
  );

  return `${encodedData}.${uint8ArrayToBase64Url(new Uint8Array(signature))}`;
}

export function decodeToken<T extends JwtPayload | JsonObject>(jwt: string) {
  return decode<T>(jwt);
}

export async function verifyToken<T extends JwtPayload | JsonObject>(
  maybeJwk: string | JsonWebKey,
  jwt: string,
) {
  const { header, payload, signature, signedData } = decodeToken<T>(jwt);

  if (
    'nbf' in payload &&
    typeof payload.nbf === 'number' &&
    payload.nbf > Math.floor(Date.now() / 1000)
  ) {
    throw new TokenExpiredError('Not yet valid').debug({
      nbf: payload.nbf,
      payload,
    });
  }

  if (
    'exp' in payload &&
    typeof payload.exp === 'number' &&
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new TokenExpiredError('Expired').debug({
      exp: payload.exp,
      payload,
    });
  }

  // must have an alg we know of
  assertKeyInObjectIsString(header, 'alg');

  // paranoia
  assertTruthy(header.alg !== 'none');

  const { jwk, key } = await definitelyJwk(maybeJwk, ['verify']);

  const verified = await crypto.subtle.verify(
    getSigningParamsFromJwk(header.alg, jwk),
    key,
    signature,
    signedData,
  );

  if (!verified) {
    throw new Error('Token did not verify');
  }
  return { header, payload };
}
