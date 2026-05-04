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
            <span class="eyebrow">RECOGER EN TIENDA (SIN ENVÍO)</span>
          </label>

          <template v-if="!recogerEnTienda">
            <!-- Fuente de datos: guardados vs manual -->
            <div class="datos-source">
              <p class="eyebrow" style="color:var(--mute);font-size:10px;margin-bottom:8px">DATOS DE FACTURACIÓN Y ENTREGA</p>
              <label class="option-row" style="padding:10px 12px;border:1px solid var(--line);margin-bottom:6px" :style="datosSource==='saved' ? 'border-color:var(--brass)' : ''">
                <input type="radio" v-model="datosSource" value="saved" class="checkbox" />
                <div>
                  <span class="eyebrow" style="color:var(--ink)">USAR DATOS GUARDADOS</span>
                  <span class="eyebrow" style="display:block;color:var(--mute);font-size:9px;margin-top:3px">
                    NIT: {{ perfil?.NIT || 'CF' }} · {{ perfil?.direccion || 'Sin dirección registrada' }}
                  </span>
                </div>
              </label>
              <label class="option-row" style="padding:10px 12px;border:1px solid var(--line)" :style="datosSource==='custom' ? 'border-color:var(--brass)' : ''">
                <input type="radio" v-model="datosSource" value="custom" class="checkbox" />
                <span class="eyebrow" style="color:var(--ink)">INGRESAR DATOS PARA ESTA COMPRA</span>
              </label>
            </div>

            <template v-if="datosSource === 'custom'">
              <div class="field">
                <label>NIT de facturación</label>
                <input v-model="nit" :placeholder="perfil?.NIT || 'CF'" />
              </div>
              <div class="field">
                <label>Dirección de entrega <span style="color:var(--mute)">(opcional)</span></label>
                <input v-model="direccion" :placeholder="perfil?.direccion || 'Sin dirección'" />
              </div>
              <label class="option-row" style="margin-top:0">
                <input type="checkbox" v-model="actualizarPerfil" class="checkbox" />
                <span class="eyebrow">GUARDAR COMO NUEVOS PREDETERMINADOS</span>
              </label>
            </template>
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

          <button class="btn btn-primary" style="width:100%;height:52px" @click="showConfirm = true" :disabled="loading || !cart.items.length">
            REVISAR Y CONFIRMAR →
          </button>
        </div>
      </div>

    </div>

    <!-- Modal: confirmar antes de comprar -->
    <Transition name="fade">
      <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm = false">
        <div class="confirm-card hairline">
          <p class="eyebrow velvet" style="font-size:10px">● CONFIRMAR PEDIDO</p>
          <h2 class="f-display" style="font-size:28px;margin-top:10px">¿Todo correcto?</h2>

          <!-- Items -->
          <div class="confirm-items" style="margin-top:16px">
            <div v-for="item in cart.items" :key="item.id" class="eyebrow confirm-item">
              {{ item.titulo_album }} ({{ item.tipo_formato }}) × {{ item.cantidad }} —
              <span class="brass">Q {{ (Number(item.precio) * item.cantidad).toLocaleString('es-GT') }}</span>
            </div>
          </div>

          <!-- Datos de entrega -->
          <div style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px;display:flex;flex-direction:column;gap:6px">
            <div class="eyebrow confirm-item">
              <span>CLIENTE</span>
              <span style="color:var(--ink)">{{ perfil?.nombre }}</span>
            </div>
            <div class="eyebrow confirm-item" v-if="!recogerEnTienda">
              <span>NIT</span>
              <span style="color:var(--ink)">{{ datosSource === 'saved' ? (perfil?.NIT || 'CF') : (nit || 'CF') }}</span>
            </div>
            <div class="eyebrow confirm-item" v-if="!recogerEnTienda && (datosSource === 'saved' ? perfil?.direccion : direccion)">
              <span>DIRECCIÓN</span>
              <span style="color:var(--ink)">{{ datosSource === 'saved' ? perfil?.direccion : direccion }}</span>
            </div>
            <div class="eyebrow confirm-item">
              <span>ENVÍO</span>
              <span style="color:var(--brass)">{{ recogerEnTienda ? 'RECOGER EN TIENDA' : 'A COORDINAR' }}</span>
            </div>
          </div>

          <p class="f-display brass" style="font-size:28px;text-align:right;margin-top:16px">
            Total: Q {{ cart.total }}
          </p>

          <p v-if="errorMsg" class="eyebrow" style="color:var(--velvet);font-size:10px;margin-top:8px">{{ errorMsg }}</p>

          <div style="display:flex;gap:10px;margin-top:20px">
            <button class="btn btn-outline" style="flex:1;height:44px" @click="showConfirm = false">CANCELAR</button>
            <button class="btn btn-primary" style="flex:1;height:44px" @click="checkout" :disabled="loading">
              {{ loading ? 'PROCESANDO…' : 'CONFIRMAR →' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
const datosSource      = ref('saved')   // 'saved' | 'custom'
const showConfirm      = ref(false)
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
    // Si eligió datos manuales y quiere guardarlos como predeterminados
    if (datosSource.value === 'custom' && actualizarPerfil.value && !recogerEnTienda.value) {
      await api.patch('/clientes/mi-perfil', {
        NIT:       nit.value      || undefined,
        direccion: direccion.value || null
      })
    }

    const items = cart.items.map(i => ({ id_producto: i.id, cantidad: i.cantidad }))
    const { data } = await api.post('/ventas', { items })

    showConfirm.value  = false
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
.datos-source { display:flex; flex-direction:column; }
/* confirm-item: texto largo de producto — desactivar uppercase y tracking del eyebrow */
.confirm-item { display:flex; justify-content:space-between; gap:12px; color:var(--mute); font-size:13px; padding:4px 0; text-transform:none; letter-spacing:0; font-weight:400; }

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
.confirm-items { display:flex; flex-direction:column; gap:8px; margin-top:16px; }
.confirm-item { color:var(--mute); font-size:14px; text-transform:none; letter-spacing:0; font-weight:400; }

.fade-enter-active, .fade-leave-active { transition:opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity:0; }
</style>
