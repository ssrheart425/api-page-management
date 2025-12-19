export const API = {
  auth: {
    login: '/api/v1/user/login',
    register: '/api/v1/user/register',
  },
  links: {
    list: '/api/v1/links',
    create: '/api/v1/links',
    update: (id: number) => `/api/v1/links/${id}`,
    remove: (id: number) => `/api/v1/links/${id}`,
  },
  fb: {
    list: '/api/v1/fb_token',
    create: '/api/v1/fb_token',
    get: (tokenId: number) => `/api/v1/fb_token/${tokenId}`,
    update: (tokenId: number) => `/api/v1/fb_token/${tokenId}`,
    remove: (tokenId: number) => `/api/v1/fb_token/${tokenId}`,
  },
} as const
