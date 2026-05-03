<template>
  <div class="catalog-root">
    <PosterStrip left="MEMBER LOUNGE ✦ CATÁLOGO COMPLETO ✦ NUEVA PRENSA ESTA SEMANA" :right="dateStr" />

    <!-- Barra de regreso para admin/vendedor -->
    <div v-if="auth.isStaff" class="admin-back-bar">
      <span class="eyebrow" style="color:rgba(242,233,218,.6)">VISTA DE CLIENTE</span>
      <RouterLink to="/admin" class="eyebrow" style="color:#F2E9DA;text-decoration:none">← VOLVER AL PANEL DE ADMIN</RouterLink>
    </div>

    <!-- Nav -->
    <nav class="nav hairline-b">
      <BLogo :size="20" />
      <div class="nav-links">
        <button class="nav-link" :class="{ active: !activeFormat && !activeGenre }"
                @click="clearFilters">Catálogo</button>
        <button class="nav-link" :class="{ active: activeFormat === 'Vinilo' }"
                @click="setFormat('Vinilo')">Vinilos</button>
        <button class="nav-link" :class="{ active: activeFormat === 'CD' }"
                @click="setFormat('CD')">CDs</button>
        <button class="nav-link" :class="{ active: activeFormat === 'Cassette' }"
                @click="setFormat('Cassette')">Cassettes</button>
        <button class="nav-link" :class="{ active: showGenres }"
                @click="showGenres = !showGenres">Géneros</button>
        <RouterLink class="nav-link" to="/perfil">Mi cuenta</RouterLink>
      </div>
      <div class="nav-right">
        <div class="search-box">
          <Search :size="13" color="var(--mute)" />
          <input v-model="searchRaw" placeholder="Buscar álbum, artista…" class="search-input" />
        </div>
        <ThemeToggle />
        <RouterLink to="/carrito" class="bag-btn">
          <ShoppingBag :size="18" />
          <span v-if="cart.count" class="bag-badge eyebrow">{{ cart.count }}</span>
        </RouterLink>
        <div class="avatar" @click="router.push('/perfil')">{{ initials }}</div>
      </div>
    </nav>

    <!-- Genre pills -->
    <div v-if="showGenres" class="genre-bar hairline-b">
      <button
        v-for="g in allGenres" :key="g"
        class="genre-pill eyebrow"
        :class="{ active: activeGenre === g }"
        @click="setGenre(g)"
      >{{ g }}</button>
    </div>

    <!-- Main -->
    <div class="main">

      <!-- Carrusel: más vendidos -->
      <FeaturedCarousel
        @select="selectProduct"
        @add="p => addToCart(p)"
      />

      <!-- Catalog grid -->
      <section v-if="filtered.length" class="section">
        <div class="section-head">
          <div>
            <p class="eyebrow brass">{{ filterLabel }}</p>
            <h3 class="section-title f-display">
              {{ activeGenre || activeFormat || 'Todo el' }}
              <em class="accent">{{ activeGenre || activeFormat ? '.' : 'catálogo.' }}</em>
            </h3>
          </div>
          <span class="eyebrow">{{ filtered.length }} TÍTULOS</span>
        </div>
        <div class="grid-catalog">
          <div v-for="p in filtered" :key="p.id" class="card-wrap" @click="selectProduct(p)">
            <AlbumCard :producto="p"
                       @add.stop="addToCart(p)" />
          </div>
        </div>
      </section>

      <p v-else-if="!loading" class="eyebrow" style="padding:40px;color:var(--mute);text-align:center">
        SIN RESULTADOS PARA "{{ searchQuery }}"
      </p>

    </div>

    <!-- Detail panel -->
    <Transition name="panel">
      <div v-if="selected" class="detail-overlay" @click.self="selected = null">
        <div class="detail-panel hairline">
          <button class="detail-close eyebrow" @click="selected = null">✕ CERRAR</button>
          <div class="detail-cover">
            <AlbumCover :album="selectedAlbum" :size="240" />
          </div>
          <div class="detail-info">
            <p class="eyebrow velvet">{{ selected.generos?.split(',')[0]?.trim() }}</p>
            <h2 class="f-display" style="font-size:32px;line-height:1.1;margin-top:6px">
              {{ selected.titulo_album }}
            </h2>
            <p class="f-serif" style="font-size:20px;color:var(--mute);margin-top:4px">
              {{ selected.artista }}, {{ selected.anio_album }}
            </p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <span v-for="g in (selected.generos || '').split(',')" :key="g"
                    class="eyebrow" style="border:1px solid var(--line);padding:2px 8px">
                {{ g.trim() }}
              </span>
            </div>
            <div class="detail-meta hairline-t" style="margin-top:16px;padding-top:14px">
              <div class="meta-row"><span class="eyebrow">FORMATO</span><FormatChip :formato="selected.tipo_formato" /></div>
              <div class="meta-row"><span class="eyebrow">CATEGORÍA</span><span class="eyebrow" style="color:var(--ink)">{{ selected.categoria }}</span></div>
              <div class="meta-row"><span class="eyebrow">PROVEEDOR</span><span class="eyebrow" style="color:var(--ink)">{{ selected.proveedor }}</span></div>
              <div class="meta-row"><span class="eyebrow">PISTAS</span><span class="eyebrow" style="color:var(--ink)">{{ selected.track_count }}</span></div>
              <div class="meta-row"><span class="eyebrow">STOCK</span>
                <span class="eyebrow" :style="{ color: selected.stock < 5 ? 'var(--velvet)' : 'var(--brass)' }">
                  {{ selected.stock }} UNIDADES
                </span>
              </div>
            </div>
            <p class="f-display" style="font-size:42px;color:var(--brass);margin-top:14px">
              Q {{ Number(selected.precio).toLocaleString('es-GT') }}
            </p>

            <!-- Selector de cantidad -->
            <div v-if="selected.stock > 0" style="display:flex;align-items:center;gap:0;margin-top:18px;border:1px solid var(--line);width:fit-content">
              <button class="detail-qty-btn" @click="detailQty = Math.max(1, detailQty - 1)">−</button>
              <span class="eyebrow" style="min-width:44px;text-align:center;color:var(--ink)">{{ detailQty }}</span>
              <button class="detail-qty-btn" @click="detailQty = Math.min(selected.stock, detailQty + 1)">+</button>
              <span class="eyebrow" style="padding:0 14px;color:var(--mute);border-left:1px solid var(--line)">
                de {{ selected.stock }}
              </span>
            </div>

            <div style="display:flex;gap:10px;margin-top:14px">
              <button class="btn btn-primary" style="flex:1;height:56px"
                      :disabled="selected.stock === 0" @click="addToCart(selected, detailQty); selected = null">
                {{ selected.stock === 0 ? 'SIN STOCK' : `+ AGREGAR (${detailQty})` }}
              </button>
              <button class="btn btn-outline" style="height:56px; width:56px; padding:0"
                      @click="wishlist.toggle(selected)"
                      :style="wishlist.has(selected.id) ? 'border-color:var(--velvet);color:var(--velvet)' : ''">
                {{ wishlist.has(selected.id) ? '♥' : '♡' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast }  from 'primevue/usetoast'
import { Search, ShoppingBag } from 'lucide-vue-next'
import { useAuthStore }    from '@/stores/auth.js'
import { useCartStore }    from '@/stores/cart.js'
import { useWishlistStore } from '@/stores/wishlist.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import BLogo       from '@/components/BLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import AlbumCover  from '@/components/AlbumCover.vue'
import AlbumCard        from '@/components/AlbumCard.vue'
import FormatChip       from '@/components/FormatChip.vue'
import FeaturedCarousel from '@/components/FeaturedCarousel.vue'

const router   = useRouter()
const auth     = useAuthStore()
const cart     = useCartStore()
const wishlist = useWishlistStore()
const toast    = useToast()

const products    = ref([])
const loading     = ref(true)
const searchRaw   = ref('')
const searchQuery = ref('')
const activeFormat = ref('')
const activeGenre  = ref('')
const showGenres   = ref(false)
const selected    = ref(null)
const detailQty   = ref(1)

// Debounce de 300ms sobre el campo de búsqueda
let debounce = null
watch(searchRaw, val => {
  clearTimeout(debounce)
  debounce = setTimeout(() => { searchQuery.value = val }, 300)
})

const initials = computed(() => {
  const n = auth.user?.nombre || ''
  return n.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
})

const dateStr = computed(() =>
  new Date().toLocaleDateString('es-GT', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase()
)

const allGenres = computed(() => {
  const set = new Set()
  products.value.forEach(p => (p.generos || '').split(',').forEach(g => { if (g.trim()) set.add(g.trim()) }))
  return Array.from(set).sort()
})

const filterLabel = computed(() => {
  if (activeGenre.value)  return `FILTRANDO POR GÉNERO · ${activeGenre.value.toUpperCase()}`
  if (activeFormat.value) return `FILTRANDO POR FORMATO · ${activeFormat.value.toUpperCase()}`
  if (searchQuery.value)  return `BÚSQUEDA · "${searchQuery.value.toUpperCase()}"`
  return 'CATÁLOGO COMPLETO'
})

const filtered = computed(() => {
  return products.value.filter(p => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q ||
      p.titulo_album?.toLowerCase().includes(q) ||
      p.artista?.toLowerCase().includes(q) ||
      (p.generos || '').toLowerCase().includes(q)
    const matchFormat = !activeFormat.value || p.tipo_formato === activeFormat.value
    const matchGenre  = !activeGenre.value  || (p.generos || '').includes(activeGenre.value)
    return matchSearch && matchFormat && matchGenre
  })
})

const selectedAlbum = computed(() => selected.value ? {
  titulo: selected.value.titulo_album, artista: selected.value.artista,
  anio: selected.value.anio_album, url_portada: selected.value.url_portada
} : null)

function setFormat(f) { activeFormat.value = activeFormat.value === f ? '' : f; activeGenre.value = ''; showGenres.value = false }
function setGenre(g)  { activeGenre.value  = activeGenre.value  === g ? '' : g; activeFormat.value = '' }
function clearFilters() { activeFormat.value = ''; activeGenre.value = ''; searchRaw.value = ''; showGenres.value = false }
function selectProduct(p) { selected.value = p; detailQty.value = 1 }

function addToCart(producto, qty = 1) {
  if (producto.stock === 0) { toast.add({ severity: 'warn', summary: 'Sin stock', life: 2000 }); return }
  for (let i = 0; i < qty; i++) cart.add(producto)
  toast.add({ severity: 'success', summary: `${qty} unidad${qty > 1 ? 'es' : ''} agregada${qty > 1 ? 's' : ''}`, detail: producto.titulo_album, life: 2000 })
}

onMounted(async () => {
  try {
    const { data } = await api.get('/productos')
    products.value = data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.catalog-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; }

.admin-back-bar { display:flex; align-items:center; justify-content:space-between; padding:8px 32px; background:var(--velvet); flex-shrink:0; }

.nav {
  display:flex; align-items:center; gap:24px;
  height:72px; padding:0 32px;
  background:var(--paper); flex-shrink:0;
}
.nav-links { display:flex; gap:20px; flex:1; }
.nav-link {
  font-size:16px; font-weight:500; color:var(--mute);
  background:none; border:none; cursor:pointer;
  transition:color 120ms; white-space:nowrap; padding-bottom:4px;
  text-decoration:none;
}
.nav-link.active, .nav-link:hover { color:var(--ink); }
.nav-link.active { border-bottom:2px solid var(--brass); }

.nav-right { display:flex; align-items:center; gap:16px; margin-left:auto; }
.search-box { display:flex; align-items:center; gap:8px; border:1px solid var(--line); padding:6px 14px; width:240px; }
.search-input { background:none; border:none; outline:none; font-size:14px; color:var(--ink); width:100%; }
.search-input::placeholder { color:var(--mute); }

.bag-btn { position:relative; display:flex; align-items:center; color:var(--ink); padding:4px; }
.bag-badge { position:absolute; top:-6px; right:-8px; width:20px; height:20px; border-radius:50%; background:var(--velvet); color:#F8EFD8; font-size:11px; display:flex; align-items:center; justify-content:center; }

.avatar { width:40px; height:40px; border-radius:50%; border:1px solid var(--brass); display:flex; align-items:center; justify-content:center; font-family:var(--f-display); font-size:16px; color:var(--brass); cursor:pointer; flex-shrink:0; }

.genre-bar { display:flex; flex-wrap:wrap; gap:10px; padding:12px 32px; background:var(--paper); flex-shrink:0; }
.genre-pill { border:1px solid var(--line); padding:4px 12px; background:none; cursor:pointer; color:var(--mute); font-size:12px; letter-spacing:0.2em; transition:border-color 120ms,color 120ms; }
.genre-pill.active, .genre-pill:hover { border-color:var(--brass); color:var(--brass); }

.main { flex:1; overflow-y:auto; padding:32px; display:flex; flex-direction:column; gap:48px; }

.hero { display:grid; grid-template-columns:1fr 1.2fr; min-height:420px; overflow:hidden; }
.hero-cover-wrap { position:relative; background:#000; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.hero-blur { position:absolute; inset:-20px; background-size:cover; background-position:center; filter:blur(40px) saturate(1.4) scale(1.2); opacity:.65; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.5),rgba(139,0,0,.35)); }
.hero-cover { position:relative; z-index:2; transform:rotate(-2deg); box-shadow:var(--card-shadow); }
.hero-badge { position:absolute; top:20px; left:20px; z-index:3; color:rgba(242,233,218,.9); font-size:12px; letter-spacing:.28em; }
.hero-info { padding:40px 48px; display:flex; flex-direction:column; gap:16px; background:var(--paper); }
.hero-title { font-size:clamp(44px,6vw,72px); line-height:0.92; letter-spacing:-0.025em; }
.hero-artist { font-size:24px; color:var(--mute); }
.hero-price-row { display:flex; align-items:baseline; gap:18px; flex-wrap:wrap; }
.hero-price { font-size:56px; color:var(--velvet); letter-spacing:-0.025em; line-height:1; }
.hero-actions { display:flex; gap:12px; margin-top:8px; }
.hero-actions .btn { height:52px; font-size:15px; }

.section { display:flex; flex-direction:column; gap:24px; }
.section-head { display:flex; align-items:flex-end; justify-content:space-between; border-bottom:1px solid var(--line); padding-bottom:12px; }
.section-title { font-size:44px; letter-spacing:-0.02em; margin-top:8px; }
.grid-catalog {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px 32px;
}
.card-wrap { cursor:pointer; }

/* Detail panel */
.detail-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:100; display:flex; justify-content:flex-end; }
.detail-panel { width:520px; height:100%; background:var(--paper); overflow-y:auto; padding:32px; display:flex; flex-direction:column; gap:20px; }
.detail-close { align-self:flex-end; font-size:12px; letter-spacing:.22em; color:var(--mute); background:none; border:none; cursor:pointer; }
.detail-cover { display:flex; justify-content:center; margin-bottom:12px; }
.detail-info { display:flex; flex-direction:column; }
.detail-meta { display:flex; flex-direction:column; gap:10px; }
.meta-row { display:flex; align-items:center; justify-content:space-between; }

.panel-enter-active, .panel-leave-active { transition:opacity 200ms; }
.panel-enter-active .detail-panel, .panel-leave-active .detail-panel { transition:transform 220ms ease; }
.panel-enter-from { opacity:0; }
.panel-leave-to  { opacity:0; }
.panel-enter-from .detail-panel { transform:translateX(100%); }
.panel-leave-to  .detail-panel  { transform:translateX(100%); }

.detail-qty-btn { width:44px; height:44px; font-size:20px; color:var(--ink); background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.detail-qty-btn:hover { background:rgba(255,255,255,0.04); }
.admin-back-bar { display:flex; align-items:center; justify-content:space-between; padding:8px 32px; background:var(--velvet); flex-shrink:0; }
</style>
