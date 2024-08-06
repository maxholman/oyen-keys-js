/* eslint-disable no-console */
/// <reference types="node" />
import { expect, test, vi } from 'vitest';
import { signToken, verifyToken } from '../lib/main.js';

const publicExponent = new Uint8Array([1, 0, 1]);

const claims = {
  sub: 'me',
  cap: {
    'team:123': ['read', 'publish'] as const,
  },
};

vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));

test('RS256', async () => {
  const keys = await crypto.subtle
    .generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: 2048,
        publicExponent,
      },
      true,
      ['sign', 'verify'],
    )
    .then(async (keyPair) => ({
      id: crypto.randomUUID().slice(0, 6),
      privateKeyJwk: await crypto.subtle.exportKey('jwk', keyPair.privateKey),
      publicKeyJwk: await crypto.subtle.exportKey('jwk', keyPair.publicKey),
      ...keyPair,
    }));

  const jwt = await signToken(keys.privateKeyJwk, {
    kid: keys.id,
    claims,
    ttlSecs: 30,
  });

  console.log('RS256 JWT:', jwt);

  await expect(verifyToken(keys.publicKeyJwk, jwt)).resolves.toEqual({
    header: {
      typ: 'JWT',
      alg: 'RS256',
      kid: keys.id,
    },
    payload: {
      ...claims,
      iat: 1609459200,
      exp: 1609459230,
    },
  });
});

test('ES256', async () => {
  const keys = await crypto.subtle
    .generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify'],
    )
    .then(async (keyPair) => ({
      id: crypto.randomUUID().slice(0, 6),
      ...keyPair,
      privateKeyJwk: await crypto.subtle.exportKey('jwk', keyPair.privateKey),
      publicKeyJwk: await crypto.subtle.exportKey('jwk', keyPair.publicKey),
    }));

  const jwt = await signToken(keys.privateKeyJwk, {
    kid: keys.id,
    claims,
    ttlSecs: 30,
  });

  console.log('ES256 JWT:', jwt);

  await expect(verifyToken(keys.publicKeyJwk, jwt)).resolves.toEqual({
    header: {
      typ: 'JWT',
      alg: 'ES256',
      kid: keys.id,
    },
    payload: {
      ...claims,
      iat: 1609459200,
      exp: 1609459230,
    },
  });
});

test('Ed25519', async () => {
  const keys = await crypto.subtle
    .generateKey('Ed25519', true, ['sign', 'verify'])
    .then(async (keyPair) => ({
      id: crypto.randomUUID().slice(0, 6),
      ...keyPair,
      privateKeyJwk: await crypto.subtle.exportKey('jwk', keyPair.privateKey),
      publicKeyJwk: await crypto.subtle.exportKey('jwk', keyPair.publicKey),
    }));

  const jwt = await signToken(keys.privateKeyJwk, {
    kid: keys.id,
    claims,
    ttlSecs: 30,
  });

  console.log('Ed25519 JWT:', jwt);

  await expect(verifyToken(keys.publicKeyJwk, jwt)).resolves.toEqual({
    header: {
      typ: 'JWT',
      alg: 'EdDSA',
      kid: keys.id,
    },
    payload: {
      ...claims,
      iat: 1609459200,
      exp: 1609459230,
    },
  });
});
