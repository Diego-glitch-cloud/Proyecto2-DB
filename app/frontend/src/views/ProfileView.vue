<template>
  <div class="profile-root">
    <PosterStrip left="MI CUENTA · PERFIL DE CLIENTE" right="MUSIC4U" />

    <nav class="p-nav hairline-b">
      <RouterLink to="/" class="back eyebrow">← CATÁLOGO</RouterLink>
      <BLogo :size="20" />
      <button class="eyebrow" style="color:var(--velvet);background:none;border:none;cursor:pointer"
              @click="auth.logout(); router.push('/login')">CERRAR SESIÓN →</button>
    </nav>

    <div class="profile-grid">

      <!-- Perfil -->
      <div class="card hairline">
        <div class="card-head hairline-b">
          <p class="eyebrow brass">DATOS PERSONALES</p>
          <button class="eyebrow" style="color:var(--brass);background:none;border:none;cursor:pointer"
                  @click="editMode = !editMode">
            {{ editMode ? 'CANCELAR' : 'EDITAR →' }}
          </button>
        </div>
        <div class="card-body" v-if="perfil">
          <div class="data-row">
            <span class="eyebrow">NOMBRE</span>
            <span class="f-display" style="font-size:18px">{{ perfil.nombre }}</span>
          </div>
          <div class="data-row dashed-b">
            <span class="eyebrow">CORREO</span>
            <span class="f-serif" style="font-size:16px">{{ perfil.correo }}</span>
          </div>

          <template v-if="!editMode">
            <div class="data-row">
              <span class="eyebrow">NIT</span>
              <span class="f-display" style="font-size:18px">{{ perfil.NIT || 'CF' }}</span>
            </div>
            <div class="data-row">
              <span class="eyebrow">DIRECCIÓN</span>
              <span class="f-serif" style="font-size:16px">{{ perfil.direccion || 'Sin dirección' }}</span>
            </div>
          </template>
          <template v-else>
            <form class="edit-form" @submit.prevent="saveProfile">
              <div class="field">
                <label>NIT de facturación</label>
                <input v-model="editNit"      :placeholder="perfil.NIT || 'CF'" />
              </div>
              <div class="field">
                <label>Dirección de entrega</label>
                <input v-model="editDireccion" :placeholder="perfil.direccion || 'Tu dirección'" />
              </div>
              <p v-if="saveError" class="eyebrow" style="color:var(--velvet);font-size:9px">{{ saveError }}</p>
              <button class="btn btn-primary" style="height:44px;width:100%" :disabled="saving">
                {{ saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS →' }}
              </button>
            </form>
          </template>
        </div>
        <p v-else class="eyebrow" style="padding:24px;color:var(--mute)">CARGANDO…</p>
      </div>

      <!-- Wishlist -->
      <div class="card hairline">
        <div class="card-head hairline-b">
          <p class="eyebrow brass">♡ WISHLIST</p>
          <span class="eyebrow">{{ wishlist.items.length }} ÍTEMS</span>
        </div>
        <div class="card-body">
          <p v-if="!wishlist.items.length" class="eyebrow" style="color:var(--mute);padding:16px 0">
            TU WISHLIST ESTÁ VACÍA
          </p>
          <div v-for="item in wishlist.items" :key="item.id" class="wish-row dashed-b">
            <AlbumCover :album="{ titulo: item.titulo_album, artista: item.artista, url_portada: item.url_portada }" :size="48" />
            <div style="flex:1">
              <p class="f-display" style="font-size:14px;line-height:1.1">{{ item.titulo_album }}</p>
              <p class="eyebrow" style="margin-top:3px">{{ item.artista }}</p>
            </div>
            <div style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">
              <span class="f-display brass" style="font-size:16px">Q {{ Number(item.precio).toLocaleString('es-GT') }}</span>
              <button class="eyebrow" style="color:var(--velvet);background:none;border:none;cursor:pointer;font-size:9px"
                      @click="wishlist.toggle(item)">QUITAR</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de compras -->
      <div class="card hairline full-width">
        <div class="card-head hairline-b">
          <p class="eyebrow brass">MIS COMPRAS</p>
          <span class="eyebrow">{{ compras.length }} PEDIDOS</span>
        </div>
        <div class="card-body">
          <p v-if="loadingCompras" class="eyebrow" style="color:var(--mute);padding:16px 0">CARGANDO…</p>
          <p v-else-if="!compras.length" class="eyebrow" style="color:var(--mute);padding:16px 0">
            AÚN NO TIENES COMPRAS
          </p>
          <div v-else>
            <div v-for="compra in compras" :key="compra.id_compra" class="compra-block dashed-b">
              <div class="compra-head">
                <div>
                  <p class="eyebrow velvet">PEDIDO #{{ String(compra.id_compra).padStart(4,'0') }}</p>
                  <p class="eyebrow" style="color:var(--mute);margin-top:2px">{{ formatDate(compra.fecha) }}</p>
                </div>
                <p class="f-display brass" style="font-size:20px">Q {{ compra.total }}</p>
              </div>
              <div class="compra-items">
                <div v-for="item in compra.items" :key="item.id_producto" class="compra-item">
                  <FormatChip :formato="item.tipo_formato" />
                  <span class="f-display" style="font-size:14px">{{ item.titulo_album }}</span>
                  <span class="eyebrow">× {{ item.cantidad }}</span>
                  <span class="eyebrow brass">Q {{ Number(item.subtotal).toLocaleString('es-GT') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }    from '@/stores/auth.js'
import { useWishlistStore } from '@/stores/wishlist.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import BLogo       from '@/components/BLogo.vue'
import AlbumCover  from '@/components/AlbumCover.vue'
import FormatChip  from '@/components/FormatChip.vue'

const router   = useRouter()
const auth     = useAuthStore()
const wishlist = useWishlistStore()

const perfil       = ref(null)
const compras      = ref([])
const loadingCompras = ref(true)
const editMode     = ref(false)
const editNit      = ref('')
const editDireccion = ref('')
const saving       = ref(false)
const saveError    = ref('')

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-GT', { day:'2-digit', month:'long', year:'numeric' })
}

async function saveProfile() {
  saveError.value = ''; saving.value = true
  try {
    const { data } = await api.patch('/clientes/mi-perfil', {
      NIT:       editNit.value      || undefined,
      direccion: editDireccion.value || null
    })
    perfil.value = data
    editMode.value = false
  } catch (e) {
    saveError.value = e.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/clientes/mi-perfil')
    perfil.value       = data
    editNit.value      = data.NIT      || ''
    editDireccion.value = data.direccion || ''
  } catch { /* no profile */ }

  try {
    const { data } = await api.get('/ventas/mis-compras')
    compras.value = data
  } finally {
    loadingCompras.value = false
  }
})
</script>

<style scoped>
.profile-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; }
.p-nav { display:flex; align-items:center; justify-content:space-between; height:58px; padding:0 24px; background:var(--paper); flex-shrink:0; }
.back { font-size:10px; letter-spacing:.22em; color:var(--mute); text-decoration:none; }

.profile-grid {
  flex:1; overflow-y:auto; padding:24px;
  display:grid;
  grid-template-columns:1fr 1fr;
  grid-auto-rows:min-content;
  gap:18px;
}

.card { background:var(--paper); display:flex; flex-direction:column; }
.card-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; }
.card-body { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }
.full-width { grid-column:1/-1; }

.data-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; }
.data-row.dashed-b { border-bottom:1px dashed var(--line); }

.edit-form { display:flex; flex-direction:column; gap:16px; padding-top:8px; }

.wish-row { display:flex; align-items:center; gap:12px; padding:10px 0; }

.compra-block { padding:14px 0; }
.compra-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.compra-items { display:flex; flex-direction:column; gap:6px; }
.compra-item { display:flex; align-items:center; gap:10px; }
</style>
