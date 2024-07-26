export function isElementOf<T>(
  array: readonly T[],
  value: unknown
): value is T {
  return array.includes(value as T);
}
