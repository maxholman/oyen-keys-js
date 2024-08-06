import type { JsonObject } from 'type-fest';
import {
  base64UrlToObject,
  base64UrlToUint8Array,
  objectToBase64Url,
} from './base64.js';
import { TokenValidationError } from './errors.js';
import type { JwtAlg } from './jwk.js';

export interface JwtHeader {
  typ: 'JWT';
  alg: JwtAlg;
  kid: string;
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
} & JsonObject;

export function encode(header: Omit<JwtHeader, 'typ'>, payload: JwtPayload) {
  const encodedHeader = objectToBase64Url({
    ...header,
    typ: 'JWT',
  });

  const encodedPayload = objectToBase64Url(payload);
  const encodedData = `${encodedHeader}.${encodedPayload}`;
  return `${encodedData}`;
}

export function decode<P extends JwtPayload | JsonObject>(token: string) {
  const tokenParts = token.split('.') as [string, string, string];

  if (tokenParts.length !== 3) {
    throw new TokenValidationError('token must consist of 3 parts').addDetail({
      reason: 'token-format',
      metadata: {
        parts: tokenParts.length,
      },
    });
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = tokenParts;

  return {
    header: base64UrlToObject(headerEncoded),
    payload: base64UrlToObject<P>(payloadEncoded),
    signature: base64UrlToUint8Array(signatureEncoded),
    signedData: new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`),
  };
}
