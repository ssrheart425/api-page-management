export interface ApiEnvelope<T> {
  code: string | number
  msg?: string
  data: T
  extra?: unknown
}

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return Boolean(value) && typeof value === 'object' && 'code' in (value as any) && 'data' in (value as any)
}

function isOk(code: string | number): boolean {
  return code === 200 || code === '200' || code === 0 || code === '0'
}

export function unwrapApi<T>(payload: unknown): T {
  if (!isEnvelope(payload)) return payload as T
  const code = payload.code
  if (!isOk(code)) {
    const msg = typeof payload.msg === 'string' && payload.msg.trim() ? payload.msg : `请求失败(code=${String(code)})`
    throw new Error(msg)
  }
  return payload.data as T
}

