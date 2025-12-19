import { http } from './http'
import { API } from './endpoints'
import { unwrapApi } from './envelope'

export interface AuthLoginRequest {
  username: string
  password: string
}

export interface AuthLoginResponse {
  token: string
  username?: string
}

export interface AuthRegisterRequest {
  username: string
  password: string
}

export interface AuthRegisterResponse {
  ok: boolean
}

export async function apiLogin(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
  const { data } = await http.post(API.auth.login, payload)
  const res = unwrapApi<{ token: string; user?: { username?: string } }>(data)
  return { token: res.token, username: res.user?.username }
}

export async function apiRegister(payload: AuthRegisterRequest): Promise<AuthRegisterResponse> {
  const { data } = await http.post(API.auth.register, payload)
  unwrapApi(data)
  return { ok: true }
}
