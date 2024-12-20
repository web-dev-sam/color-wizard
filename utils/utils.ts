export function groupBy<K extends PropertyKey, T>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key: K = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<K, T[]>)
}
