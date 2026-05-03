<template>
  <div class="catalog-root">

    <!-- Poster strip -->
    <PosterStrip
      left="MEMBER LOUNGE ✦ SIDE A · TUESDAY ✦ NEW PRESSINGS THIS WEEK"
      :right="dateStr"
    />

    <!-- Nav -->
    <nav class="nav hairline-b">
      <BLogo :size="20" />

      <div class="nav-links">
        <a class="nav-link active">Catálogo</a>
        <a class="nav-link">Vinilos</a>
        <a class="nav-link">CDs</a>
        <a class="nav-link">Cassettes</a>
        <a class="nav-link">Géneros</a>
      </div>

      <div class="nav-right">
        <div class="search-box">
          <Search :size="13" color="var(--mute)" />
          <input v-model="search" placeholder="Buscar álbum, artista…" class="search-input" />
        </div>
        <ThemeToggle />
        <button class="bag-btn" @click="cart.open = !cart.open">
          <ShoppingBag :size="18" />
          <span v-if="cart.count" class="bag-badge eyebrow">{{ cart.count }}</span>
        </button>
        <div class="avatar">{{ initials }}</div>
      </div>
    </nav>

    <!-- Main content -->
    <div class="main">

      <!-- Hero: oferta de la semana -->
      <section v-if="hero" class="hero hairline">
        <div class="hero-cover-wrap">
          <div class="hero-blur" :style="heroBg" />
          <div class="hero-overlay" />
          <AlbumCover :album="heroAlbum" :size="280" class="hero-cover" />
          <span class="hero-badge eyebrow">● OFERTA DE LA SEMANA · −15%</span>
        </div>
        <div class="hero-info">
          <p class="eyebrow velvet">EDICIÓN DESTACADA · {{ hero.generos?.split(',')[0]?.trim() || 'ESPECIAL' }}</p>
          <h2 class="hero-title">
            {{ hero.titulo_album?.split(' ').slice(0,-1).join(' ') }}
            <em class="accent"> {{ hero.titulo_album?.split(' ').slice(-1)[0] }}</em>
          </h2>
          <p class="hero-artist f-serif">{{ hero.artista }}, {{ hero.anio_album }}</p>
          <div class="hero-price-row">
            <span class="hero-price">Q {{ discounted(hero.precio) }}</span>
            <span class="hero-orig">Q {{ Number(hero.precio).toLocaleString('es-GT') }}</span>
            <FormatChip :formato="hero.tipo_formato" size="lg" />
          </div>
          <p class="eyebrow brass hero-copy-info">500 COPIAS · EDICIÓN NUMERADA</p>
          <div class="hero-actions">
            <button class="btn btn-primary" @click="addToCart(hero)">+ AGREGAR A LA BOLSA</button>
            <button class="btn btn-outline">♡ WISHLIST</button>
          </div>
          <p class="eyebrow hero-stock">QUEDAN {{ hero.stock }} EN INVENTARIO</p>
        </div>
      </section>

      <!-- Catalog rows -->
      <section v-if="filtered.length" class="section">
        <div class="section-head">
          <div>
            <p class="eyebrow brass">CATÁLOGO COMPLETO</p>
            <h3 class="section-title">Todo el <em class="accent">catálogo.</em></h3>
          </div>
          <span class="eyebrow">{{ filtered.length }} TÍTULOS</span>
        </div>
        <div class="grid-4">
          <AlbumCard
            v-for="p in filtered"
            :key="p.id"
            :producto="p"
            :isNew="p.stock > 8"
            @add="addToCart"
          />
        </div>
      </section>

    </div>

    <!-- Cart drawer -->
    <Transition name="drawer">
      <div v-if="cart.open" class="cart-overlay" @click.self="cart.open = false">
        <div class="cart-drawer hairline">
          <div class="cart-header hairline-b">
            <span class="eyebrow">LA BOLSA · {{ cart.count }} ÍT.</span>
            <button @click="cart.open = false"><X :size="16" /></button>
          </div>

          <div class="cart-items">
            <div v-if="!cart.items.length" class="cart-empty eyebrow">BOLSA VACÍA</div>
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="cart-item dashed-b"
            >
              <AlbumCover :album="itemAlbum(item)" :size="52" />
              <div class="cart-item-info">
                <p class="f-display" style="font-size:14px;line-height:1.1">{{ item.titulo_album }}</p>
                <p class="eyebrow">{{ item.artista }}</p>
              </div>
              <div class="cart-item-right">
                <span class="f-display brass" style="font-size:15px">Q {{ (Number(item.precio) * item.cantidad).toLocaleString('es-GT') }}</span>
                <div class="qty-ctrl">
                  <button @click="cart.updateQty(item.id, item.cantidad - 1)">−</button>
                  <span class="eyebrow">{{ item.cantidad }}</span>
                  <button @click="cart.updateQty(item.id, item.cantidad + 1)">+</button>
                </div>
                <button @click="cart.remove(item.id)" class="remove-btn"><Trash2 :size="12" /></button>
              </div>
            </div>
          </div>

          <div v-if="cart.items.length" class="cart-footer hairline-t">
            <div class="cart-total">
              <span class="eyebrow">TOTAL</span>
              <span class="f-display brass" style="font-size:22px">Q {{ cart.total }}</span>
            </div>
            <button class="btn btn-primary btn-full" :disabled="checking" @click="checkout">
              {{ checking ? 'PROCESANDO…' : 'CONFIRMAR PEDIDO →' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Search, ShoppingBag, X, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'
import { useCartStore }  from '@/stores/cart.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import BLogo      from '@/components/BLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import AlbumCover  from '@/components/AlbumCover.vue'
import AlbumCard   from '@/components/AlbumCard.vue'
import FormatChip  from '@/components/FormatChip.vue'

const auth    = useAuthStore()
const cart    = useCartStore()
const toast   = useToast()
const search  = ref('')
const products = ref([])
const checking = ref(false)

const initials = computed(() => {
  const n = auth.user?.nombre || ''
  return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const dateStr = computed(() => {
  return new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
})

const hero = computed(() => products.value[0] || null)
const heroAlbum = computed(() => hero.value ? {
  titulo: hero.value.titulo_album,
  artista: hero.value.artista,
  anio: hero.value.anio_album,
  url_portada: hero.value.url_portada
} : null)

const heroBg = computed(() => hero.value?.url_portada
  ? { backgroundImage: `url(${hero.value.url_portada})` }
  : { background: 'var(--velvet)' }
)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return products.value.slice(1).filter(p =>
    !q ||
    p.titulo_album?.toLowerCase().includes(q) ||
    p.artista?.toLowerCase().includes(q)
  )
})

function discounted(precio) {
  return (Number(precio) * 0.85).toLocaleString('es-GT', { minimumFractionDigits: 2 })
}

function addToCart(producto) {
  cart.add(producto)
  toast.add({ severity: 'success', summary: 'Agregado a la bolsa', life: 2000 })
}

function itemAlbum(item) {
  return { titulo: item.titulo_album, artista: item.artista, url_portada: item.url_portada }
}

async function checkout() {
  checking.value = true
  try {
    const items = cart.items.map(i => ({ id_producto: i.id, cantidad: i.cantidad }))
    await api.post('/ventas', { items })
    cart.clear()
    toast.add({ severity: 'success', summary: '¡Pedido confirmado!', detail: 'Gracias por tu compra.', life: 4000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.error || 'No se pudo procesar el pedido', life: 4000 })
  } finally {
    checking.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/productos')
    products.value = data
  } catch { /* handled by interceptor */ }
})
</script>

<style scoped>
.catalog-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ── Nav ── */
.nav {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 68px;
  padding: 0 28px;
  background: var(--paper);
  flex-shrink: 0;
}

.nav-links { display: flex; gap: 20px; flex: 1; }
.nav-link {
  font-size: 12px;
  font-weight: 500;
  color: var(--mute);
  cursor: pointer;
  transition: color 120ms;
  white-space: nowrap;
}
.nav-link.active,
.nav-link:hover { color: var(--ink); }
.nav-link.active { border-bottom: 2px solid var(--brass); padding-bottom: 2px; }

.nav-right { display: flex; align-items: center; gap: 14px; margin-left: auto; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  padding: 6px 12px;
  width: 220px;
}
.search-input {
  background: none;
  border: none;
  outline: none;
  font-size: 11px;
  color: var(--ink);
  width: 100%;
}
.search-input::placeholder { color: var(--mute); }

.bag-btn {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--ink);
  padding: 4px;
}
.bag-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--velvet);
  color: #F8EFD8;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--brass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--f-display);
  font-size: 13px;
  color: var(--brass);
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Main ── */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ── Hero ── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  min-height: 400px;
  overflow: hidden;
}

.hero-cover-wrap {
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-blur {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(40px) saturate(1.4) scale(1.2);
  opacity: 0.65;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(139,0,0,0.35));
}

.hero-cover {
  position: relative;
  z-index: 2;
  transform: rotate(-2deg);
  box-shadow: var(--card-shadow);
}

.hero-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  color: rgba(242,233,218,0.9);
  font-size: 9px;
  letter-spacing: 0.28em;
}

.hero-info {
  padding: 36px 44px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--paper);
}

.hero-title {
  font-family: var(--f-display);
  font-size: clamp(44px, 5vw, 64px);
  line-height: 0.92;
  letter-spacing: -0.025em;
}

.hero-artist {
  font-size: 20px;
  color: var(--mute);
}

.hero-price-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-price {
  font-family: var(--f-display);
  font-size: 48px;
  color: var(--velvet);
  letter-spacing: -0.025em;
  line-height: 1;
}

.hero-orig {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--mute);
  text-decoration: line-through;
}

.hero-copy-info { margin-top: -4px; }

.hero-actions { display: flex; gap: 10px; }
.hero-actions .btn { height: 52px; }

.hero-stock { color: var(--mute); }

/* ── Section ── */
.section { display: flex; flex-direction: column; gap: 22px; }

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.section-title {
  font-family: var(--f-display);
  font-size: 36px;
  letter-spacing: -0.02em;
  margin-top: 6px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

/* ── Cart drawer ── */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  width: 380px;
  height: 100%;
  background: var(--paper);
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.cart-empty {
  text-align: center;
  padding: 40px 22px;
  color: var(--mute);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
}

.cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }

.cart-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.qty-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  padding: 2px 8px;
}
.qty-ctrl button {
  color: var(--mute);
  font-size: 14px;
  background: none;
  border: none;
}

.remove-btn { color: var(--mute); }
.remove-btn:hover { color: var(--velvet); }

.cart-footer {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-full { width: 100%; }

/* ── Transition ── */
.drawer-enter-active,
.drawer-leave-active { transition: opacity 200ms; }
.drawer-enter-active .cart-drawer,
.drawer-leave-active .cart-drawer { transition: transform 220ms ease; }
.drawer-enter-from { opacity: 0; }
.drawer-leave-to  { opacity: 0; }
.drawer-enter-from .cart-drawer { transform: translateX(100%); }
.drawer-leave-to  .cart-drawer  { transform: translateX(100%); }
</style>
