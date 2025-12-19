import { http } from './http'
import { API } from './endpoints'
import { unwrapApi } from './envelope'

export interface FbItem {
  id: number
  type: string
  token: string
  pixelId: string
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

export interface FbListQuery {
  type?: string
  pixel_id?: string
  token?: string
  page?: number
  size?: number
}

export interface FbListResponse {
  items: FbItem[]
  total: number
}

export interface CreateFbRequest {
  type: string
  token: string
  pixel_id: string
}

export type UpdateFbRequest = CreateFbRequest

interface ServerFbItem {
  id: number
  type: string
  token: string
  pixel_id: string
  deleted: boolean
  created_at?: string
  updated_at?: string
}

interface ServerFbListResponse {
  page: number
  size: number
  total: number
  items: ServerFbItem[]
}

function mapFb(item: ServerFbItem): FbItem {
  return {
    id: item.id,
    type: item.type,
    token: item.token,
    pixelId: item.pixel_id,
    deleted: item.deleted,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export async function apiFetchFbList(query: FbListQuery): Promise<FbListResponse> {
  const { data } = await http.get(API.fb.list, { params: query })
  const res = unwrapApi<ServerFbListResponse | FbListResponse | ServerFbItem[] | FbItem[]>(data)

  if (Array.isArray(res)) {
    const all = res.map((i) => (typeof i === 'object' && i && 'pixel_id' in (i as any) ? mapFb(i as ServerFbItem) : (i as FbItem)))
    const total = all.length
    const page = query.page ?? 1
    const size = query.size ?? total
    const start = (page - 1) * size
    const items = all.slice(start, start + size)
    return { items, total }
  }

  if ('items' in res) {
    const items = res.items.map((i: any) => ('pixel_id' in i ? mapFb(i as ServerFbItem) : (i as FbItem)))
    return { items, total: (res as any).total ?? items.length }
  }

  return res
}

export async function apiGetFbToken(tokenId: number): Promise<FbItem> {
  const { data } = await http.get(API.fb.get(tokenId))
  const res = unwrapApi<ServerFbItem | FbItem>(data)
  if ('pixel_id' in (res as any)) return mapFb(res as ServerFbItem)
  return res as FbItem
}

export async function apiCreateFb(payload: CreateFbRequest): Promise<void> {
  const { data } = await http.post(API.fb.create, payload)
  unwrapApi(data)
}

export async function apiUpdateFb(id: number, payload: UpdateFbRequest): Promise<void> {
  const { data } = await http.put(API.fb.update(id), payload)
  unwrapApi(data)
}

export async function apiDeleteFb(id: number): Promise<void> {
  const { data } = await http.delete(API.fb.remove(id))
  unwrapApi(data)
}
