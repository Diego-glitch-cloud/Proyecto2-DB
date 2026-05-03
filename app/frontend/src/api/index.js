import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 12000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Solo redirige si había sesión activa (token expirado).
      // Si no había token, el 401 viene de un intento de login fallido —
      // dejar que el componente muestre el mensaje de error normalmente.
      if (hadToken) window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
