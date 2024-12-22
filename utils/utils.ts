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

export function copy(text: string) {
  if (import.meta.client) {
    navigator.clipboard.writeText(text)
  }
}

export function roundNumbersInString(input: string, digits: number): string {
  const numberRegex = /-?\d+(\.\d+)?/g

  return input.replace(numberRegex, (match) => {
    const num = Number.parseFloat(match)
    const rounded = Math.round(num * 10 ** digits) / 10 ** digits
    return rounded.toString()
  })
}

export function getDevicePixelRatio() {
  return window.devicePixelRatio ?? 1
}
