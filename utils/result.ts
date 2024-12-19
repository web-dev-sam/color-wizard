export type Result<T, E = string> = Ok<T> | Unhandled<E>
export type Ok<T> = { success: true, data: T }
export type Unhandled<E> = { success: false, error: E }
export type Either<O, E> = Ok<O> | Unhandled<E>
export type DefaultValues<E> = {
  [K in keyof E]: E[K] extends Unhandled<infer ErrorType> ? ErrorType : never;
}

export function ok<T>(data: T): Ok<T> {
  return { success: true, data }
}

export function err<const E = string>(error: E): Unhandled<E> {
  return { success: false, error }
}

/**
 * ExtractUnhandled<Ok<"z"> | Unhandled<"a"> | Unhandled<"b">>
 * > "a" | "b"
 */
export type ExtractUnhandled<T> = T extends Unhandled<infer E> ? E : never

/**
 * ExtractOk<Ok<"z"> | Unhandled<"a"> | Unhandled<"b">>
 * > "z"
 */
export type ExtractOk<T> = T extends Ok<infer O> ? O : never

/**
 * ReplaceUnhandled<Unhandled<"a"> | Unhandled<"b">, { a: string }>
 * > Unhandled<"b"> | Ok<string>
 */
export type ReplaceUnhandled<R, D> = R extends Unhandled<infer E>
  ? E extends keyof D
    ? Ok<D[E]>
    : R
  : R

export function def<
  R extends Result<any, any>,
  D extends Partial<Record<ExtractUnhandled<R>, any>>,
>(
  result: R,
  defaultValues: D,
): ReplaceUnhandled<R, D> {
  if ("success" in result && result.success) {
    return result as ReplaceUnhandled<R, D>
  }

  if ("error" in result && result.error in defaultValues) {
    return ok(defaultValues[result.error as keyof D]) as ReplaceUnhandled<R, D>
  }

  return result as ReplaceUnhandled<R, D>
}
