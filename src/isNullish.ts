type Nullish = null | undefined;

export function isNullish(x: unknown): x is Nullish {
  // Normally, you should not use `==` or `!=` because they are very loose
  // which can lead to bugs. However, in this case, we want to check for both
  // `x === null && x === undefined` . `==` lets us do that in one operation.
  return x == null;
}

export function isNotNullish<T>(x: T | Nullish): x is NonNullable<T> {
  // See note in `isNullish` about using `==` and `!=`.
  return x != null;
}
