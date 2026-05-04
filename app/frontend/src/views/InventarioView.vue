<template>
  <div class="inv-root">
    <PosterStrip left="BACKSTAGE · INVENTARIO" right="CRUD DE PRODUCTOS" />

    <!-- Rail + content layout -->
    <div class="layout">

      <!-- Sidebar nav -->
      <aside class="rail hairline-r">
        <div class="rail-logo"><span class="f-display" style="font-size:20px;font-style:italic;color:var(--velvet)">4</span></div>
        <div class="rail-div" />
        <RouterLink class="rail-btn" :class="{ active: false }" to="/admin" title="Dashboard"><BarChart2 :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn active" to="/admin/inventario" title="Inventario"><Package :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/admin/ventas" title="Ventas"><ShoppingBag :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/" title="Ver catálogo"><Eye :size="18" :stroke-width="1.4" /></RouterLink>
        <div style="margin-top:auto">
          <button class="rail-btn" title="Cerrar sesión" @click="auth.logout(); router.push('/login')"><LogOut :size="18" :stroke-width="1.4" /></button>
        </div>
      </aside>

      <div class="content">
        <!-- Header -->
        <div class="content-header hairline-b">
          <div>
            <p class="eyebrow brass">INVENTARIO</p>
            <h1 class="f-display page-title">Gestión de <em class="accent">productos.</em></h1>
          </div>
          <button class="btn btn-primary" @click="showAddModal = true">+ AGREGAR PRODUCTO</button>
        </div>

        <!-- Product table -->
        <div class="table-wrap">
          <div class="filter-bar">
            <input v-model="filterQ" placeholder="Filtrar por nombre, artista…" class="filter-input eyebrow" />
            <span class="eyebrow" style="color:var(--mute)">{{ filteredProds.length }} PRODUCTOS</span>
          </div>

          <table class="prod-table">
            <thead>
              <tr>
                <th class="eyebrow" v-for="h in ['#','PORTADA','PRODUCTO','FORMATO','CATEGORÍA','PRECIO','STOCK','ACCIONES']" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in filteredProds" :key="p.id" :class="{ 'dashed-b': i < filteredProds.length-1 }">
                <td class="eyebrow mute">{{ p.id }}</td>
                <td><AlbumCover :album="pAlbum(p)" :size="44" /></td>
                <td>
                  <p class="f-display" style="font-size:14px;line-height:1.1">{{ p.titulo_album }}</p>
                  <p class="eyebrow" style="color:var(--mute);margin-top:2px">{{ p.artista }} · {{ p.anio_album }}</p>
                </td>
                <td><FormatChip :formato="p.tipo_formato" /></td>
                <td class="eyebrow">{{ p.categoria }}</td>
                <td>
                  <span v-if="editing !== p.id" class="f-display brass" style="font-size:16px">
                    Q {{ Number(p.precio).toLocaleString('es-GT') }}
                  </span>
                  <input v-else v-model.number="editPrecio" type="number" step="0.01" class="inline-input" style="width:80px" />
                </td>
                <td>
                  <span v-if="editing !== p.id" :style="{ color: p.stock < 5 ? 'var(--velvet)' : 'var(--brass)', fontFamily: 'var(--f-display)', fontSize: '18px' }">
                    {{ String(p.stock).padStart(2,'0') }}
                  </span>
                  <input v-else v-model.number="editStock" type="number" min="0" class="inline-input" style="width:60px" />
                </td>
                <td>
                  <div class="actions">
                    <template v-if="editing !== p.id">
                      <button class="eyebrow act-btn" @click="startEdit(p)">EDITAR</button>
                      <button class="eyebrow act-btn" style="color:var(--brass)" @click="openStockAdj(p)">STOCK −</button>
                      <button class="eyebrow act-btn danger" @click="confirmDelete(p)" title="Elimina el registro completo">BORRAR</button>
                    </template>
                    <template v-else>
                      <button class="eyebrow act-btn" @click="saveEdit(p.id)" :disabled="saving">GUARDAR</button>
                      <button class="eyebrow act-btn" @click="editing = null">CANCELAR</button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD PRODUCT MODAL -->
    <Transition name="fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal hairline">
          <div class="modal-head hairline-b">
            <p class="eyebrow brass">AGREGAR PRODUCTO VÍA ITUNES</p>
            <button @click="closeAddModal"><X :size="16" /></button>
          </div>
          <div class="modal-body">

            <!-- Paso 1: buscar -->
            <div v-if="!itunesSelected">
              <div class="field">
                <label>Buscar álbum</label>
                <div style="display:flex;gap:8px">
                  <input v-model="itunesQ" placeholder="Ej: Jeff Buckley Grace" @keyup.enter="buscarItunes" />
                  <button class="btn btn-primary" style="height:40px;padding:0 16px;flex-shrink:0" @click="buscarItunes" :disabled="buscando">
                    {{ buscando ? '…' : 'BUSCAR' }}
                  </button>
                </div>
              </div>
              <div v-if="itunesResults.length" class="itunes-grid">
                <div v-for="r in itunesResults" :key="r.itunes_id"
                     class="itunes-card hairline" @click="selectItunes(r)">
                  <img v-if="r.url_100" :src="r.url_100" :alt="r.titulo" style="width:80px;height:80px;object-fit:cover" />
                  <div v-else style="width:80px;height:80px;background:var(--line)" />
                  <div class="itunes-info">
                    <p class="f-display" style="font-size:13px;line-height:1.1">{{ r.titulo }}</p>
                    <p class="eyebrow" style="color:var(--mute);margin-top:3px">{{ r.artista }}</p>
                    <p class="eyebrow" style="color:var(--brass);margin-top:2px">{{ r.anio }}</p>
                  </div>
                </div>
              </div>
              <p v-if="itunesNoResults" class="eyebrow" style="color:var(--mute);padding:12px 0">SIN RESULTADOS</p>
            </div>

            <!-- Paso 2: formulario -->
            <div v-else>
              <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:20px">
                <img v-if="itunesSelected.url_500" :src="itunesSelected.url_500" style="width:100px;height:100px;object-fit:cover;border:1px solid var(--line)" />
                <div>
                  <p class="f-display" style="font-size:18px">{{ itunesSelected.titulo }}</p>
                  <p class="eyebrow" style="color:var(--mute);margin-top:4px">{{ itunesSelected.artista }} · {{ itunesSelected.anio }}</p>
                  <button class="eyebrow" style="color:var(--brass);background:none;border:none;cursor:pointer;margin-top:8px;font-size:9px" @click="itunesSelected = null">
                    ← CAMBIAR SELECCIÓN
                  </button>
                </div>
              </div>

              <form class="add-form" @submit.prevent="submitProducto">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                  <div class="field">
                    <label>Precio (Q)</label>
                    <input v-model.number="newProducto.precio" type="number" step="0.01" min="1" required />
                  </div>
                  <div class="field">
                    <label>Stock inicial</label>
                    <input v-model.number="newProducto.stock" type="number" min="0" required />
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
                  <div class="field">
                    <label>Formato</label>
                    <select v-model.number="newProducto.id_album_tipo" required class="sel">
                      <option v-for="t in albumTipos" :key="t.id" :value="t.id">{{ t.detalle }}</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Categoría</label>
                    <select v-model.number="newProducto.id_categoria" required class="sel">
                      <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.detalle }}</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Proveedor</label>
                    <select v-model.number="newProducto.id_proveedor" required class="sel">
                      <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                    </select>
                  </div>
                </div>
                <p v-if="addError" class="eyebrow" style="color:var(--velvet);font-size:9px">{{ addError }}</p>
                <button class="btn btn-primary" style="width:100%;height:48px" :disabled="submitting">
                  {{ submitting ? 'AGREGANDO…' : 'AGREGAR AL INVENTARIO →' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Ajuste de stock -->
    <Transition name="fade">
      <div v-if="stockAdjTarget" class="modal-overlay" @click.self="stockAdjTarget = null">
        <div class="modal hairline" style="max-width:360px">
          <div class="modal-head hairline-b">
            <p class="eyebrow brass">● AJUSTAR STOCK</p>
            <button @click="stockAdjTarget = null"><X :size="16" /></button>
          </div>
          <div class="modal-body">
            <p class="f-serif" style="font-size:15px">
              <strong>{{ stockAdjTarget.titulo_album }}</strong> — Stock actual:
              <span class="f-display brass" style="font-size:18px">{{ stockAdjTarget.stock }}</span>
            </p>
            <div style="display:flex;align-items:center;gap:12px;margin-top:16px">
              <label class="eyebrow" style="color:var(--mute)">REDUCIR EN</label>
              <input v-model.number="stockAdjAmount" type="number" min="1" :max="stockAdjTarget.stock"
                     class="inline-input" style="width:80px;text-align:center" />
              <span class="eyebrow mute">UNIDADES</span>
            </div>
            <p class="eyebrow" style="color:var(--mute);font-size:9px;margin-top:8px">
              Nuevo stock: {{ Math.max(0, (stockAdjTarget.stock || 0) - (stockAdjAmount || 0)) }}
            </p>
            <p v-if="stockAdjError" class="eyebrow" style="color:var(--velvet);font-size:9px;margin-top:6px">{{ stockAdjError }}</p>
            <div style="display:flex;gap:10px;margin-top:20px">
              <button class="btn btn-outline" style="flex:1;height:44px" @click="stockAdjTarget = null">CANCELAR</button>
              <button class="btn btn-primary" style="flex:1;height:44px" @click="doStockAdj" :disabled="stockAdjSaving || stockAdjAmount < 1">
                {{ stockAdjSaving ? 'GUARDANDO…' : 'APLICAR' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete confirmation -->
    <Transition name="fade">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal hairline" style="max-width:400px">
          <div class="modal-head hairline-b">
            <p class="eyebrow velvet">● ELIMINAR REGISTRO</p>
            <button @click="deleteTarget = null"><X :size="16" /></button>
          </div>
          <div class="modal-body">
            <p class="f-serif" style="font-size:16px">
              ¿Eliminar <strong>{{ deleteTarget.titulo_album }}</strong> ({{ deleteTarget.tipo_formato }}) del catálogo?
            </p>
            <p class="eyebrow" style="color:var(--mute);margin-top:8px">
              Elimina el producto completo. Solo funciona si no tiene ventas registradas.
              Para reducir unidades usa el botón <strong style="color:var(--brass)">STOCK −</strong>.
            </p>
            <p v-if="deleteError" class="eyebrow" style="color:var(--velvet);font-size:9px;margin-top:8px">{{ deleteError }}</p>
            <div style="display:flex;gap:10px;margin-top:20px">
              <button class="btn btn-outline" style="flex:1;height:44px" @click="deleteTarget = null">CANCELAR</button>
              <button class="btn btn-primary" style="flex:1;height:44px;background:var(--velvet)"
                      @click="doDelete" :disabled="deleting">
                {{ deleting ? 'ELIMINANDO…' : 'ELIMINAR REGISTRO' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2, Package, ShoppingBag, Eye, LogOut, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import AlbumCover  from '@/components/AlbumCover.vue'
import FormatChip  from '@/components/FormatChip.vue'

const router = useRouter()
const auth   = useAuthStore()

const products     = ref([])
const categorias   = ref([])
const proveedores  = ref([])
const albumTipos   = ref([])
const filterQ      = ref('')
const editing      = ref(null)
const editPrecio   = ref(0)
const editStock    = ref(0)
const saving       = ref(false)
const showAddModal = ref(false)
const itunesQ      = ref('')
const itunesResults = ref([])
const itunesSelected = ref(null)
const itunesNoResults = ref(false)
const buscando     = ref(false)
const submitting   = ref(false)
const addError     = ref('')
const deleteTarget = ref(null)
const deleteError  = ref('')
const deleting     = ref(false)

const stockAdjTarget = ref(null)
const stockAdjAmount = ref(1)
const stockAdjError  = ref('')
const stockAdjSaving = ref(false)

const newProducto = ref({ precio: 0, stock: 0, id_album_tipo: null, id_categoria: null, id_proveedor: null })

const filteredProds = computed(() => {
  const q = filterQ.value.toLowerCase()
  if (!q) return products.value
  return products.value.filter(p =>
    p.titulo_album?.toLowerCase().includes(q) || p.artista?.toLowerCase().includes(q)
  )
})

function pAlbum(p) {
  return { titulo: p.titulo_album, artista: p.artista, url_portada: p.url_portada }
}

function startEdit(p) {
  editing.value  = p.id
  editPrecio.value = Number(p.precio)
  editStock.value  = p.stock
}

async function saveEdit(id) {
  saving.value = true
  try {
    await api.patch(`/productos/${id}`, { precio: editPrecio.value, stock: editStock.value })
    const idx = products.value.findIndex(p => p.id === id)
    if (idx >= 0) { products.value[idx].precio = editPrecio.value; products.value[idx].stock = editStock.value }
    editing.value = null
  } catch (e) {
    alert(e.response?.data?.error || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

function confirmDelete(p) { deleteTarget.value = p; deleteError.value = '' }

function openStockAdj(p) {
  stockAdjTarget.value = p
  stockAdjAmount.value = 1
  stockAdjError.value  = ''
}

async function doStockAdj() {
  const amt = stockAdjAmount.value
  if (!amt || amt < 1) return
  stockAdjSaving.value = true; stockAdjError.value = ''
  const nuevoStock = Math.max(0, (stockAdjTarget.value.stock || 0) - amt)
  try {
    const { data } = await api.patch(`/productos/${stockAdjTarget.value.id}`, { stock: nuevoStock })
    const idx = products.value.findIndex(p => p.id === stockAdjTarget.value.id)
    if (idx >= 0) products.value[idx] = data
    stockAdjTarget.value = null
  } catch (e) {
    stockAdjError.value = e.response?.data?.error || 'No se pudo ajustar el stock'
  } finally {
    stockAdjSaving.value = false
  }
}

async function doDelete() {
  deleting.value = true; deleteError.value = ''
  try {
    await api.delete(`/productos/${deleteTarget.value.id}`)
    products.value = products.value.filter(p => p.id !== deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    deleteError.value = e.response?.data?.error || 'No se pudo eliminar'
  } finally {
    deleting.value = false
  }
}

async function buscarItunes() {
  if (!itunesQ.value.trim()) return
  buscando.value = true; itunesResults.value = []; itunesNoResults.value = false
  try {
    const { data } = await api.get('/albums/buscar-portada', { params: { q: itunesQ.value, limit: 8 } })
    itunesResults.value = data
    itunesNoResults.value = !data.length
  } catch { /* silencioso */ } finally {
    buscando.value = false
  }
}

function selectItunes(r) {
  itunesSelected.value = r
  newProducto.value = { precio: 0, stock: 0, id_album_tipo: null, id_categoria: null, id_proveedor: null }
  addError.value = ''
}

async function submitProducto() {
  submitting.value = true; addError.value = ''
  try {
    // 1. Crear o verificar álbum
    let id_album
    try {
      const { data } = await api.post('/albums', {
        titulo:         itunesSelected.value.titulo,
        anio:           itunesSelected.value.anio || new Date().getFullYear(),
        track_count:    itunesSelected.value.track_count || 1,
        url_portada:    itunesSelected.value.url_500,
        nombre_artista: itunesSelected.value.artista
      })
      id_album = data.id
    } catch (e) {
      if (e.response?.status === 409) {
        id_album = e.response.data.id_album
      } else throw e
    }

    // 2. Crear producto
    await api.post('/productos', {
      precio:        newProducto.value.precio,
      stock:         newProducto.value.stock,
      id_album,
      id_album_tipo: newProducto.value.id_album_tipo,
      id_categoria:  newProducto.value.id_categoria,
      id_proveedor:  newProducto.value.id_proveedor
    })

    closeAddModal()
    await loadProducts()
  } catch (e) {
    addError.value = e.response?.data?.error || 'Error al agregar el producto'
  } finally {
    submitting.value = false
  }
}

function closeAddModal() {
  showAddModal.value = false; itunesQ.value = ''; itunesResults.value = [];
  itunesSelected.value = null; itunesNoResults.value = false; addError.value = ''
}

async function loadProducts() {
  const { data } = await api.get('/productos')
  products.value = data
}

onMounted(async () => {
  await Promise.all([
    loadProducts(),
    api.get('/categorias').then(r => { categorias.value = r.data }),
    api.get('/proveedores').then(r => { proveedores.value = r.data }),
    api.get('/album-tipos').then(r => { albumTipos.value = r.data })
  ])
})
</script>

<style scoped>
.inv-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; }
.layout { display:flex; flex:1; overflow:hidden; }

.rail { width:68px; display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:6px; background:var(--paper); flex-shrink:0; }
.rail-logo { width:44px; height:44px; display:flex; align-items:center; justify-content:center; }
.rail-div { width:28px; height:1px; background:var(--line); margin:8px 0 12px; }
.rail-btn { width:44px; height:44px; display:flex; align-items:center; justify-content:center; color:var(--mute); text-decoration:none; border:1px solid transparent; transition:color 120ms,border-color 120ms; }
.rail-btn:hover { color:var(--ink); }
.rail-btn.active { color:var(--velvet); border-color:var(--velvet); }

.content { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.content-header { display:flex; align-items:flex-end; justify-content:space-between; padding:20px 24px; background:var(--paper); flex-shrink:0; }
.page-title { font-size:clamp(32px,3vw,48px); letter-spacing:-0.02em; line-height:1; margin-top:6px; }

.table-wrap { flex:1; overflow-y:auto; padding:20px 24px; }
.filter-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.filter-input { background:none; border:none; border-bottom:1px solid var(--line); padding:6px 0; outline:none; font-family:var(--f-mono); font-size:10px; letter-spacing:.18em; color:var(--ink); width:300px; }
.filter-input::placeholder { color:var(--mute); }

.prod-table { width:100%; border-collapse:collapse; }
.prod-table th { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); font-size:9px; letter-spacing:.22em; color:var(--mute); font-family:var(--f-mono); }
.prod-table td { padding:12px 8px; vertical-align:middle; }
.prod-table tr.dashed-b td { border-bottom:1px dashed var(--line); }
.mute { color:var(--mute); }

.inline-input { background:none; border:none; border-bottom:1px solid var(--velvet); outline:none; font-family:var(--f-display); font-size:16px; color:var(--ink); padding:2px 4px; }

.actions { display:flex; gap:8px; align-items:center; }
.act-btn { background:none; border:none; cursor:pointer; color:var(--brass); font-size:9px; letter-spacing:.18em; }
.act-btn:hover { text-decoration:underline; }
.act-btn.danger { color:var(--velvet); }
.act-btn:disabled { opacity:.5; cursor:not-allowed; }

.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
.modal { background:var(--paper); width:600px; max-height:85vh; overflow-y:auto; display:flex; flex-direction:column; }
.modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; }
.modal-body { padding:22px; display:flex; flex-direction:column; gap:16px; }

.itunes-grid { display:flex; flex-direction:column; gap:8px; max-height:300px; overflow-y:auto; margin-top:12px; }
.itunes-card { display:flex; gap:12px; align-items:center; padding:10px; cursor:pointer; transition:background 120ms; }
.itunes-card:hover { background:rgba(201,168,106,.06); }
.itunes-info { flex:1; }

.add-form { display:flex; flex-direction:column; gap:14px; }
.sel { background:var(--bg); border:none; border-bottom:1px solid var(--line); outline:none; font-family:var(--f-serif); font-size:16px; color:var(--ink); padding:4px 0; width:100%; cursor:pointer; }

.fade-enter-active, .fade-leave-active { transition:opacity 180ms; }
.fade-enter-from, .fade-leave-to { opacity:0; }
</style>
