import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isStaff = computed(() => ['admin', 'vendedor'].includes(user.value?.rol))

  async function login(correo, contrasena) {
    const { data } = await api.post('/auth/login', { correo, contrasena })
    token.value = data.token
    user.value  = { nombre: data.nombre, rol: data.rol }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(user.value))
    return data.rol
  }

  async function register(nombre, correo, contrasena) {
    await api.post('/auth/register', { nombre, correo, contrasena })
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, isStaff, login, register, logout }
})
