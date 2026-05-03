import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref(JSON.parse(localStorage.getItem('wishlist') || '[]'))

  function toggle(producto) {
    const idx = items.value.findIndex(i => i.id === producto.id)
    if (idx >= 0) {
      items.value.splice(idx, 1)
    } else {
      items.value.push({
        id:          producto.id,
        titulo_album: producto.titulo_album,
        artista:     producto.artista,
        precio:      producto.precio,
        url_portada: producto.url_portada,
        tipo_formato: producto.tipo_formato
      })
    }
    localStorage.setItem('wishlist', JSON.stringify(items.value))
  }

  function has(id) {
    return items.value.some(i => i.id === id)
  }

  return { items, toggle, has }
})
