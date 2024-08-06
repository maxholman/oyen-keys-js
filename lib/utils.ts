import type { OmitIndexSignature } from 'type-fest';
import { ValidationError } from './errors.js';

export function withNullProto(obj: Record<string, unknown>) {
  return Object.assign(Object.create(null), obj);
}

export function assertString<T extends string>(
  value: unknown,
): asserts value is T {
  if (typeof value !== 'string') {
    throw new ValidationError('value must be a string').debug({ value });
  }
}

export function assertArray(value: unknown): asserts value is Array<unknown> {
  if (!Array.isArray(value)) {
    throw new ValidationError('value must be an array').debug({ value });
  }
}

export function assertObject(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new ValidationError('value must be a non-null object').debug({
      value,
    });
  }
}

export function assertTruthy<T>(
  value: T,
): asserts value is Exclude<T, false | null | ''> {
  if (!value) {
    throw new ValidationError('value must be truthy').debug({ value });
  }
}

export function assertKeyInObject<T extends string>(
  obj: OmitIndexSignature<Record<string, unknown>>,
  keyName: T,
): asserts obj is {
  [key in T]: unknown;
} {
  if (!(keyName in obj)) {
    throw new ValidationError(`obj must have a ${keyName} property`).debug({
      obj,
      keyName,
    });
  }
}

export function assertKeyInObjectIsString<T extends string>(
  obj: OmitIndexSignature<Record<string, unknown>>,
  keyName: T,
): asserts obj is {
  [key in T]: string;
} {
  assertObject(obj);
  assertKeyInObject(obj, keyName);
  assertString(obj[keyName]);
}

// cute little helper that means we can do things like switch statements inline
// instead of creating a new function and then calling it, or doing both at
// (once()=>{}())
export function inline<T>(fn: () => T) {
  return fn();
}
