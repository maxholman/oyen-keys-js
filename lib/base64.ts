import type { JsonObject } from 'type-fest';
import type { JsonifiableObject } from 'type-fest/source/jsonifiable.js';
import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras';
import { ValidationError } from './errors.js';
import { withNullProto } from './utils.js';

export {
  base64ToUint8Array,
  hexToUint8Array,
  toUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToHex,
} from 'uint8array-extras';

export function encodeBase64Url(arr: Uint8Array): string {
  return uint8ArrayToBase64(arr, { urlSafe: true });
}

export function decodeBase64Url(str: string): Uint8Array {
  return base64ToUint8Array(str);
}

export function base64UrlToObject<T extends JsonObject>(str: string): T {
  try {
    return withNullProto(
      JSON.parse(new TextDecoder().decode(base64ToUint8Array(str))) as T,
    );
  } catch (err) {
    throw new ValidationError('base64tou8/decode/json.parse failed').debug({
      str,
    });
  }
}

export function objectToBase64Url<T extends JsonifiableObject>(obj: T): string {
  return encodeBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}
