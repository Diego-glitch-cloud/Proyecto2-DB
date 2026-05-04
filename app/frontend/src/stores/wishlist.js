import { defineStore } from 'pinia'
import { ref } from 'vue'

function decodeJwtId() {
  const t = localStorage.getItem('token')
  if (!t) return null
  try { return JSON.parse(atob(t.split('.')[1])).id } catch { return null }
}

function key(userId) { return userId ? `wishlist_${userId}` : 'wishlist' }

export const useWishlistStore = defineStore('wishlist', () => {
  // Inicializa desde el token ya guardado (recargas de página)
  let userId = decodeJwtId()
  const items = ref(JSON.parse(localStorage.getItem(key(userId)) || '[]'))

  function loadForUser(id) {
    userId = id
    items.value = JSON.parse(localStorage.getItem(key(userId)) || '[]')
  }

  function clearForCurrentUser() {
    localStorage.removeItem(key(userId))
    items.value = []
    userId = null
  }

  function toggle(producto) {
    const idx = items.value.findIndex(i => i.id === producto.id)
    if (idx >= 0) {
      items.value.splice(idx, 1)
    } else {
      items.value.push({
        id:           producto.id,
        titulo_album: producto.titulo_album,
        artista:      producto.artista,
        precio:       producto.precio,
        url_portada:  producto.url_portada,
        tipo_formato: producto.tipo_formato
      })
    }
    localStorage.setItem(key(userId), JSON.stringify(items.value))
  }

  function has(id) { return items.value.some(i => i.id === id) }

  return { items, toggle, has, loadForUser, clearForCurrentUser }
})
