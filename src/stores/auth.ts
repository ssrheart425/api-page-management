import { defineStore } from 'pinia'

import { apiLogin, apiRegister } from '@/api/auth'

const TOKEN_KEY = 'apm_token'
const USER_KEY = 'apm_user'

function safeGet(key: string): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(key) ?? ''
}

function safeSet(key: string, value: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value)
}

function safeRemove(key: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: safeGet(TOKEN_KEY),
    username: safeGet(USER_KEY),
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    async login(payload: { username: string; password: string }) {
      const username = payload.username.trim()
      const password = payload.password.trim()
      if (!username || !password) throw new Error('请输入账号和密码')

      const res = await apiLogin({ username, password })
      if (!res?.token) throw new Error('登录失败：未返回 token')

      this.token = res.token
      this.username = res.username ?? username
      safeSet(TOKEN_KEY, res.token)
      safeSet(USER_KEY, this.username)
    },
    async register(payload: { username: string; password: string }) {
      const username = payload.username.trim()
      const password = payload.password.trim()
      if (!username || !password) throw new Error('请输入账号和密码')

      const res = await apiRegister({ username, password })
      if (!res?.ok) throw new Error('注册失败')
    },
    logout() {
      this.token = ''
      this.username = ''
      safeRemove(TOKEN_KEY)
      safeRemove(USER_KEY)
    },
  },
})
