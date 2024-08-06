import { assertKeyInObjectIsString } from './utils.js';

export type JwtAlg =
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'EdDSA'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512';

export type ImportParams =
  | AlgorithmIdentifier
  | RsaHashedImportParams
  | EcKeyImportParams
  | HmacImportParams
  | AesKeyAlgorithm;

const importParams = {
  ES256: { name: 'ECDSA', namedCurve: 'P-256' },
  ES384: { name: 'ECDSA', namedCurve: 'P-384' },
  ES512: { name: 'ECDSA', namedCurve: 'P-521' },
  HS256: { name: 'HMAC', hash: { name: 'SHA-256' } },
  HS384: { name: 'HMAC', hash: { name: 'SHA-384' } },
  HS512: { name: 'HMAC', hash: { name: 'SHA-512' } },
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
  RS384: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-384' } },
  RS512: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-512' } },
  EdDSA: 'Ed25519', // Ed448 how?
} satisfies Record<JwtAlg, ImportParams>;

export function getImportParams(jwkish: {
  kty?: string;
  alg?: JwtAlg | string;
  crv?: JwtAlg | string;
}): ImportParams {
  switch (jwkish.kty) {
    case 'EC':
      assertKeyInObjectIsString(jwkish, 'crv');
      switch (jwkish.crv) {
        case 'P-256':
          return importParams.ES256;
        case 'P-384':
          return importParams.ES384;
        case 'P-521':
          return importParams.ES512;
        default:
          throw new Error(`Unsupported EC crv ${JSON.stringify(jwkish.crv)}`);
      }
    case 'RSA':
      assertKeyInObjectIsString(jwkish, 'alg');
      if (
        jwkish.alg === 'RS256' ||
        jwkish.alg === 'RS384' ||
        jwkish.alg === 'RS512'
      ) {
        return importParams[jwkish.alg];
      }
      throw new Error(`Unsupported RSA alg ${JSON.stringify(jwkish.alg)}`);

    case 'OKP': {
      assertKeyInObjectIsString(jwkish, 'crv'); // Ed25519 or Ed448
      return importParams.EdDSA;
    }
    default:
      throw new Error(`Unsupported key type ${JSON.stringify(jwkish.kty)}`);
  }
}

export type SigningParams = RsaPssParams | EcdsaParams | AlgorithmIdentifier;

const signingParams = {
  ES256: { name: 'ECDSA', hash: { name: 'SHA-256' } },
  ES384: { name: 'ECDSA', hash: { name: 'SHA-384' } },
  ES512: { name: 'ECDSA', hash: { name: 'SHA-512' } },
  HS256: { name: 'HMAC', hash: { name: 'SHA-256' } },
  HS384: { name: 'HMAC', hash: { name: 'SHA-384' } },
  HS512: { name: 'HMAC', hash: { name: 'SHA-512' } },
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
  RS384: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-384' } },
  RS512: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-512' } },
  EdDSA: 'Ed25519',
} satisfies Record<JwtAlg, SigningParams>;

export function getSigningParamsFromJwk(
  alg: JwtAlg | string,
  jwk: JsonWebKey,
): SigningParams {
  switch (jwk.kty) {
    case 'EC':
      assertKeyInObjectIsString(jwk, 'crv');
      if (alg === 'ES256' || alg === 'ES384' || alg === 'ES512') {
        return signingParams[alg];
      }
      throw new Error(`Unsupported EC alg ${JSON.stringify(alg)}`);
    case 'RSA':
      assertKeyInObjectIsString(jwk, 'alg');
      if (alg === 'RS256' || alg === 'RS384' || alg === 'RS512') {
        return signingParams[alg];
      }
      throw new Error(`Unsupported RSA alg ${JSON.stringify(alg)}`);

    case 'OKP':
      assertKeyInObjectIsString(jwk, 'crv');
      return signingParams.EdDSA;

    default:
      throw new Error(`Unsupported kty ${JSON.stringify(jwk.kty)}`);
  }
}
