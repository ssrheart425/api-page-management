import axios from 'axios'

function normalizeBaseURL(raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return ''
  if (value.startsWith('/') || value.startsWith('//')) return value
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) return value

  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
  return `${protocol}//${value}`
}

const API_BASE_URL = normalizeBaseURL(import.meta.env.API_BASE_URL)

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
})

http.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config
  const token = window.localStorage.getItem('apm_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
