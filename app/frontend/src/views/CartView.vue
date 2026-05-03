<template>
  <div class="cart-root">
    <PosterStrip left="LA BOLSA · CONFIRMAR PEDIDO" :right="`${cart.count} ÍTEMS`" />

    <nav class="cart-nav hairline-b">
      <RouterLink to="/" class="back eyebrow">← CATÁLOGO</RouterLink>
      <BLogo :size="20" />
      <ThemeToggle />
    </nav>

    <div v-if="!cart.items.length" class="empty-state">
      <p class="f-display" style="font-size:32px">Tu bolsa está <em class="accent">vacía.</em></p>
      <RouterLink to="/" class="btn btn-primary" style="margin-top:24px;height:48px;width:220px">
        VER CATÁLOGO →
      </RouterLink>
    </div>

    <div v-else class="cart-grid">

      <!-- Items -->
      <div class="items-col">
        <h2 class="f-display" style="font-size:36px;margin-bottom:24px">
          Tu <em class="accent">bolsa.</em>
        </h2>

        <div v-for="item in cart.items" :key="item.id" class="item dashed-b">
          <AlbumCover :album="itemAlbum(item)" :size="72" />
          <div class="item-info">
            <p class="f-display" style="font-size:16px;line-height:1.1">{{ item.titulo_album }}</p>
            <p class="eyebrow" style="margin-top:4px">{{ item.artista }}</p>
            <FormatChip :formato="item.tipo_formato || 'Vinilo'" style="margin-top:6px" />
          </div>
          <div class="item-right">
            <p class="f-display brass" style="font-size:18px">
              Q {{ (Number(item.precio) * item.cantidad).toLocaleString('es-GT') }}
            </p>
            <div class="qty-ctrl">
              <button @click="cart.updateQty(item.id, item.cantidad - 1)">−</button>
              <span class="eyebrow">{{ item.cantidad }}</span>
              <button @click="cart.updateQty(item.id, item.cantidad + 1)">+</button>
            </div>
            <button class="remove-btn eyebrow" @click="cart.remove(item.id)">QUITAR</button>
          </div>
        </div>
      </div>

      <!-- Checkout -->
      <div class="checkout-col hairline">
        <div class="checkout-header hairline-b">
          <p class="eyebrow brass">DATOS DE PEDIDO</p>
        </div>
        <div class="checkout-body">

          <div v-if="perfil" class="perfil-info">
            <p class="eyebrow">CLIENTE</p>
            <p class="f-display" style="font-size:16px;margin-top:4px">{{ perfil.nombre }}</p>
            <p class="eyebrow" style="color:var(--mute);margin-top:2px">{{ perfil.correo }}</p>
          </div>

          <!-- Recoger en tienda -->
          <label class="option-row">
            <input type="checkbox" v-model="recogerEnTienda" class="checkbox" />
            <span class="eyebrow">RECOGER EN TIENDA</span>
          </label>

          <template v-if="!recogerEnTienda">
            <div class="field">
              <label>NIT de facturación</label>
              <input v-model="nit" :placeholder="perfil?.NIT || 'CF'" />
              <span v-if="perfil?.NIT" class="field-hint eyebrow">
                Predeterminado: {{ perfil.NIT }}
              </span>
            </div>
            <div class="field">
              <label>Dirección de entrega <span style="color:var(--mute)">(opcional)</span></label>
              <input v-model="direccion" :placeholder="perfil?.direccion || 'Sin dirección registrada'" />
              <span v-if="perfil?.direccion" class="field-hint eyebrow">
                Predeterminada: {{ perfil.direccion }}
              </span>
            </div>
            <label class="option-row" style="margin-top:0">
              <input type="checkbox" v-model="actualizarPerfil" class="checkbox" />
              <span class="eyebrow">GUARDAR COMO PREDETERMINADOS</span>
            </label>
          </template>

          <div class="total-box hairline-t">
            <div class="total-row">
              <span class="eyebrow">SUBTOTAL</span>
              <span class="f-display" style="font-size:14px">Q {{ cart.total }}</span>
            </div>
            <div class="total-row">
              <span class="eyebrow">ENVÍO</span>
              <span class="eyebrow" style="color:var(--brass)">{{ recogerEnTienda ? 'GRATIS' : 'A COORDINAR' }}</span>
            </div>
            <div class="total-row total-final">
              <span class="eyebrow">TOTAL</span>
              <span class="f-display brass" style="font-size:28px">Q {{ cart.total }}</span>
            </div>
          </div>

          <p v-if="errorMsg" class="eyebrow" style="color:var(--velvet);font-size:10px">{{ errorMsg }}</p>

          <button class="btn btn-primary" style="width:100%;height:52px" @click="checkout" :disabled="loading">
            {{ loading ? 'PROCESANDO…' : 'CONFIRMAR PEDIDO →' }}
          </button>
        </div>
      </div>

    </div>

    <!-- Confirmación -->
    <Transition name="fade">
      <div v-if="confirmacion" class="confirm-overlay">
        <div class="confirm-card hairline">
          <p class="eyebrow velvet" style="font-size:10px">● PEDIDO CONFIRMADO</p>
          <h2 class="f-display" style="font-size:36px;margin-top:12px">
            ¡Listo, <em class="accent">{{ auth.user?.nombre?.split(' ')[0] }}!</em>
          </h2>
          <p class="f-serif" style="font-size:18px;color:var(--mute);margin-top:8px">
            Tu pedido #{{ confirmacion.id_compra }} ha sido registrado.
          </p>
          <div class="confirm-items">
            <div v-for="item in confirmacion.items" :key="item.id_producto" class="eyebrow confirm-item">
              {{ item.nombre_producto }} × {{ item.cantidad }} —
              Q {{ Number(item.subtotal).toLocaleString('es-GT') }}
            </div>
          </div>
          <p class="f-display brass" style="font-size:24px;margin-top:16px">
            Total: Q {{ confirmacion.total }}
          </p>
          <div style="display:flex;gap:12px;margin-top:24px">
            <RouterLink to="/perfil" class="btn btn-outline" style="height:44px;flex:1">VER MIS PEDIDOS</RouterLink>
            <RouterLink to="/" class="btn btn-primary" style="height:44px;flex:1">SEGUIR COMPRANDO</RouterLink>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore }  from '@/stores/auth.js'
import { useCartStore }  from '@/stores/cart.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import BLogo       from '@/components/BLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import AlbumCover  from '@/components/AlbumCover.vue'
import FormatChip  from '@/components/FormatChip.vue'

const auth    = useAuthStore()
const cart    = useCartStore()
const perfil  = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const confirmacion = ref(null)

const recogerEnTienda  = ref(false)
const actualizarPerfil = ref(false)
const nit      = ref('')
const direccion = ref('')

function itemAlbum(item) {
  return { titulo: item.titulo_album, artista: item.artista, url_portada: item.url_portada }
}

onMounted(async () => {
  if (auth.user?.rol === 'cliente') {
    try {
      const { data } = await api.get('/clientes/mi-perfil')
      perfil.value = data
      nit.value      = data.NIT      || 'CF'
      direccion.value = data.direccion || ''
    } catch { /* no perfil */ }
  }
})

async function checkout() {
  errorMsg.value = ''; loading.value = true
  try {
    // Actualizar perfil si se pidió
    if (actualizarPerfil.value && !recogerEnTienda.value) {
      await api.patch('/clientes/mi-perfil', {
        NIT:       nit.value      || undefined,
        direccion: direccion.value || null
      })
    }

    const items = cart.items.map(i => ({ id_producto: i.id, cantidad: i.cantidad }))
    const { data } = await api.post('/ventas', { items })

    confirmacion.value = data
    cart.clear()
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Error al procesar el pedido'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cart-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; background:var(--bg); }

.cart-nav {
  display:flex; align-items:center; justify-content:space-between;
  height:58px; padding:0 24px; background:var(--paper); flex-shrink:0;
}
.back { font-size:10px; letter-spacing:.22em; color:var(--mute); text-decoration:none; }
.back:hover { color:var(--ink); }

.empty-state { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; }

.cart-grid {
  display:grid; grid-template-columns:1fr 380px;
  flex:1; overflow:hidden;
}

.items-col { overflow-y:auto; padding:28px 32px; }

.item {
  display:flex; align-items:center; gap:16px;
  padding:16px 0;
}
.item-info { flex:1; display:flex; flex-direction:column; }
.item-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
.qty-ctrl { display:flex; align-items:center; gap:10px; border:1px solid var(--line); padding:3px 10px; }
.qty-ctrl button { color:var(--mute); background:none; border:none; font-size:14px; cursor:pointer; }
.remove-btn { color:var(--mute); background:none; border:none; cursor:pointer; font-size:9px; }
.remove-btn:hover { color:var(--velvet); }

.checkout-col { display:flex; flex-direction:column; overflow-y:auto; background:var(--paper); }
.checkout-header { padding:20px 24px; }
.checkout-body { padding:20px 24px; display:flex; flex-direction:column; gap:18px; }

.perfil-info { padding-bottom:14px; border-bottom:1px dashed var(--line); }

.option-row {
  display:flex; align-items:center; gap:10px; cursor:pointer;
  padding:8px 0;
}
.checkbox { width:14px; height:14px; cursor:pointer; accent-color:var(--velvet); }

.field-hint { font-size:8px; letter-spacing:.18em; color:var(--mute); margin-top:2px; display:block; }

.total-box { display:flex; flex-direction:column; gap:10px; padding-top:14px; }
.total-row { display:flex; justify-content:space-between; align-items:center; }
.total-final { padding-top:10px; border-top:1px solid var(--line); }

.confirm-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:200;
  display:flex; align-items:center; justify-content:center; padding:24px;
}
.confirm-card {
  background:var(--paper); padding:36px; max-width:500px; width:100%;
  display:flex; flex-direction:column;
}
.confirm-items { display:flex; flex-direction:column; gap:6px; margin-top:16px; }
.confirm-item { color:var(--mute); font-size:10px; }

.fade-enter-active, .fade-leave-active { transition:opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity:0; }
</style>
