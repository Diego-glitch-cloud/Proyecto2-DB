import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  {
    path:      '/login',
    component: () => import('@/views/LoginView.vue'),
    meta:      { guest: true }
  },
  {
    path:      '/',
    component: () => import('@/views/CatalogView.vue'),
    meta:      { requiresAuth: true }
  },
  {
    path:      '/carrito',
    component: () => import('@/views/CartView.vue'),
    meta:      { requiresAuth: true }
  },
  {
    path:      '/perfil',
    component: () => import('@/views/ProfileView.vue'),
    meta:      { requiresAuth: true }
  },
  {
    path:      '/admin',
    component: () => import('@/views/AdminView.vue'),
    meta:      { requiresAuth: true, roles: ['admin', 'vendedor'] }
  },
  {
    path:      '/admin/inventario',
    component: () => import('@/views/InventarioView.vue'),
    meta:      { requiresAuth: true, roles: ['admin', 'vendedor'] }
  },
  {
    path:      '/admin/ventas',
    component: () => import('@/views/VentasView.vue'),
    meta:      { requiresAuth: true, roles: ['admin', 'vendedor'] }
  }
]

const router = createRouter({
  history:     createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.guest && auth.isAuthenticated) {
    return next(auth.isStaff ? '/admin' : '/')
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.user?.rol)) {
    return next(auth.isStaff ? '/admin' : '/')
  }

  next()
})

export default router
