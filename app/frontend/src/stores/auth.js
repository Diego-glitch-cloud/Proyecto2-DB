import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index.js'
import { useWishlistStore } from '@/stores/wishlist.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isStaff = computed(() => ['admin', 'vendedor'].includes(user.value?.rol))

  function _decodeJwt(t) {
    try { return JSON.parse(atob(t.split('.')[1])) } catch { return {} }
  }

  async function login(correo, contrasena) {
    const { data }   = await api.post('/auth/login', { correo, contrasena })
    const payload    = _decodeJwt(data.token)
    token.value      = data.token
    user.value       = { nombre: data.nombre, rol: data.rol, id: payload.id }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(user.value))
    useWishlistStore().loadForUser(payload.id)
    return data.rol
  }

  async function register(nombre, correo, contrasena) {
    await api.post('/auth/register', { nombre, correo, contrasena })
  }

  function logout() {
    useWishlistStore().clearForCurrentUser()
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, isStaff, login, register, logout }
})
