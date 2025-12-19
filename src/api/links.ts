import { http } from './http'
import { API } from './endpoints'
import { unwrapApi } from './envelope'

export interface LinkItem {
  id: number
  type: number
  link: string
  createdAt: string
  deleted: boolean
}

export interface LinkListQuery {
  type?: number
  link?: string
  deleted?: boolean
  page?: number
  size?: number
}

export interface LinkListResponse {
  items: LinkItem[]
  total: number
}

export type CreateLinkRequest = Pick<LinkItem, 'type' | 'link'>
export type UpdateLinkRequest = CreateLinkRequest

interface ServerLinkItem {
  id: number
  type: number
  link: string
  created_at: string
  deleted: boolean
}

interface ServerLinkListResponse {
  page: number
  size: number
  total: number
  items: ServerLinkItem[]
}

function mapLink(item: ServerLinkItem): LinkItem {
  return {
    id: item.id,
    type: item.type,
    link: item.link,
    createdAt: item.created_at,
    deleted: item.deleted,
  }
}

export async function apiFetchLinks(query: LinkListQuery): Promise<LinkListResponse> {
  const { data } = await http.get(API.links.list, { params: query })
  const res = unwrapApi<ServerLinkListResponse>(data)
  return { items: res.items.map(mapLink), total: res.total }
}

export async function apiCreateLink(payload: CreateLinkRequest): Promise<void> {
  const { data } = await http.post(API.links.create, payload)
  unwrapApi(data)
}

export async function apiUpdateLink(id: number, payload: UpdateLinkRequest): Promise<void> {
  const { data } = await http.put(API.links.update(id), payload)
  unwrapApi(data)
}

export async function apiDeleteLink(id: number): Promise<void> {
  const { data } = await http.delete(API.links.remove(id))
  unwrapApi(data)
}
