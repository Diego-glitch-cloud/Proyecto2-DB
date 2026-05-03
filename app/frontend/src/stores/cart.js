import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const open  = ref(false)

  const count = computed(() => items.value.reduce((s, i) => s + i.cantidad, 0))
  const total = computed(() =>
    items.value.reduce((s, i) => s + Number(i.precio) * i.cantidad, 0).toFixed(2)
  )

  function add(producto) {
    const existing = items.value.find(i => i.id === producto.id)
    if (existing) {
      existing.cantidad = Math.min(existing.cantidad + 1, producto.stock)
    } else {
      items.value.push({ ...producto, cantidad: 1 })
    }
    open.value = true
  }

  function remove(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function updateQty(id, qty) {
    const item = items.value.find(i => i.id === id)
    if (item) item.cantidad = Math.max(1, qty)
  }

  function clear() { items.value = [] }

  return { items, open, count, total, add, remove, updateQty, clear }
})
