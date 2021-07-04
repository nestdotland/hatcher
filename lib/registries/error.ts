type OkResult<T> = [data: T, error: null];
type ErrResult = [data: null, error: { reason: string; code: number }];
export type Result<T> = Promise<OkResult<T> | ErrResult>;

export async function Ok<T>(value: T | Promise<T>): Promise<OkResult<T>> {
  if (value instanceof Promise) {
    return [await value, null]
  }
  return [value, null];
}

export function Err(reason: string, code: number): ErrResult {
  return [null, { reason, code }];
}
