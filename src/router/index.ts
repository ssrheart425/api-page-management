import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/links',
        },
        {
          path: 'links',
          name: 'links',
          component: () => import('@/views/links/LinkListView.vue'),
          meta: { title: 'Link 管理' },
        },
        {
          path: 'fb',
          name: 'fb',
          component: () => import('@/views/fb/FbManagementView.vue'),
          meta: { title: 'FB 管理' },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/links',
    },
  ],
})

function hasToken(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.localStorage.getItem('apm_token'))
}

router.beforeEach((to) => {
  const authed = hasToken()

  if (to.meta.requiresAuth && !authed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login' && authed) {
    return { path: '/links' }
  }
})

export default router
