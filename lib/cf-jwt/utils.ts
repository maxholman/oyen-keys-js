import type { UnionToIntersection, Writable } from 'type-fest';

// Credit: https://stackoverflow.com/questions/69019873/how-can-i-get-typed-object-entries-and-object-fromentries-in-typescript
type EntriesType =
  | [PropertyKey, unknown][]
  | ReadonlyArray<readonly [PropertyKey, unknown]>;

type UnionObjectFromArrayOfPairs<T extends EntriesType> =
  Writable<T> extends (infer R)[]
    ? R extends [infer key, infer val]
      ? { [prop in key & PropertyKey]: val }
      : never
    : never;

type MergeIntersectingObjects<T> = { [key in keyof T]: T[key] };

type EntriesToObject<T extends EntriesType> = MergeIntersectingObjects<
  UnionToIntersection<UnionObjectFromArrayOfPairs<T>>
>;

export function assertString<T extends string>(
  value: unknown,
): asserts value is T {
  if (typeof value !== 'string') {
    throw new Error('value must be a string');
  }
}

export function assertArray(value: unknown): asserts value is Array<unknown> {
  if (!Array.isArray(value)) {
    throw new Error('value must be an array');
  }
}

export function assertObject(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('value must be an object');
  }
}

export function assertTruthy<T>(
  value: T,
): asserts value is Exclude<T, false | null | ''> {
  if (!value) {
    throw new Error('value must be truthy');
  }
}

export function assertKeyInObject<T extends string>(
  obj: { [key: string]: unknown },
  keyName: T,
): asserts obj is {
  [key in T]: unknown;
} {
  if (!(keyName in obj)) {
    throw new Error(`obj must have a ${keyName} property`);
  }
}

export function assertStringKeyInObject<T extends string>(
  obj: { [key: string]: unknown },
  keyName: T,
): asserts obj is {
  [key in T]: string;
} {
  assertKeyInObject(obj, keyName);
  assertString(obj[keyName]);
}

export function typedObjectFromEntries<T extends EntriesType>(
  arr: T,
): EntriesToObject<T> {
  return Object.fromEntries(arr) as EntriesToObject<T>;
}

export function typedObjectEntries<T extends Record<string, unknown>>(
  obj: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
