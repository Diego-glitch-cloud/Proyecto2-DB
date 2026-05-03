<template>
  <div class="admin-root">
    <PosterStrip
      :left="`BACKSTAGE · ADMIN ✦ ${auth.user?.nombre?.split(' ')[0]?.toUpperCase()}`"
      right="MariaDB · CONECTADA ✦ ● ONLINE"
    />

    <div class="layout">
      <!-- Rail -->
      <aside class="rail hairline-r">
        <div class="rail-logo"><span class="f-display" style="font-size:22px;font-style:italic;color:var(--velvet)">4</span></div>
        <div class="rail-div" />
        <RouterLink class="rail-btn active" to="/admin" title="Dashboard"><BarChart2 :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/admin/inventario" title="Inventario"><Package :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/admin/ventas" title="Ventas"><ShoppingBag :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/" title="Ver catálogo cliente"><Eye :size="18" :stroke-width="1.4" /></RouterLink>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:6px">
          <RouterLink class="rail-btn" to="/admin/inventario" title="Clientes"><Users :size="18" :stroke-width="1.4" /></RouterLink>
          <button class="rail-btn" @click="auth.logout(); router.push('/login')"><LogOut :size="18" :stroke-width="1.4" /></button>
        </div>
      </aside>

      <div class="content">
        <div class="content-header hairline-b">
          <div>
            <p class="eyebrow brass">HEADLINER</p>
            <h1 class="f-display page-title">Resumen <em class="accent">general.</em></h1>
            <p class="f-serif page-sub">Estado actual del sistema — datos en tiempo real.</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <button class="btn btn-primary" style="height:40px" @click="showVentaModal = true">+ VENTA PRESENCIAL</button>
            <RouterLink to="/admin/ventas" class="btn btn-ghost" style="height:40px;text-decoration:none">REPORTE VENTAS →</RouterLink>
            <RouterLink to="/admin/inventario" class="btn btn-ghost" style="height:40px;text-decoration:none">+ AGREGAR PRODUCTO</RouterLink>
            <ThemeToggle />
          </div>
        </div>

        <div class="admin-main">

          <!-- KPI strip — datos reales, sin deltas inventados -->
          <div class="kpi-strip hairline">
            <div v-for="kpi in kpis" :key="kpi.label" class="kpi-cell hairline-r">
              <p class="eyebrow">{{ kpi.label }}</p>
              <p class="f-display kpi-value">{{ kpi.value }}</p>
              <p class="eyebrow kpi-sub" :style="{ color: kpi.color }">{{ kpi.sub }}</p>
            </div>
          </div>

          <!-- Row 2: Stock alerts + Recent sales -->
          <div class="row-2">

            <!-- Stock alerts -->
            <div class="card hairline">
              <div class="card-head hairline-b">
                <div>
                  <p class="eyebrow velvet">● STOCK &lt; 5 UNIDADES</p>
                  <h3 class="f-display card-title">Alertas de <em class="accent">stock</em></h3>
                </div>
                <RouterLink to="/admin/inventario" class="eyebrow brass" style="font-size:9px;text-decoration:none">VER INVENTARIO →</RouterLink>
              </div>
              <div class="alerts-list">
                <p v-if="!stockAlerts.length" class="eyebrow" style="padding:20px;color:var(--mute)">
                  ✓ TODOS LOS PRODUCTOS TIENEN STOCK SUFICIENTE
                </p>
                <div v-for="(p, i) in stockAlerts" :key="p.id" class="alert-row" :class="{ 'dashed-b': i < stockAlerts.length-1 }">
                  <AlbumCover :album="alertAlbum(p)" :size="44" />
                  <div class="alert-info">
                    <p class="f-display" style="font-size:13px;line-height:1.1">{{ p.titulo_album }}</p>
                    <p class="eyebrow" style="color:var(--mute);margin-top:2px">{{ p.artista }} · {{ p.tipo_formato }}</p>
                  </div>
                  <div style="text-align:right">
                    <p class="f-display velvet" style="font-size:22px">{{ String(p.stock).padStart(2,'0') }}</p>
                    <p class="eyebrow" style="color:var(--mute)">UD.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bar chart: ventas agrupadas por mes (datos reales) -->
            <div class="card hairline">
              <div class="card-head hairline-b">
                <div>
                  <p class="eyebrow mute">● VW_RESUMEN_VENTAS</p>
                  <h3 class="f-display card-title">Ventas por <em class="accent">mes</em></h3>
                </div>
              </div>
              <div class="chart-wrap">
                <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
                <p v-else class="eyebrow" style="padding:20px;color:var(--mute)">CARGANDO…</p>
              </div>
            </div>

          </div>

          <!-- Recent sales table -->
          <div class="card hairline">
            <div class="table-header hairline-b">
              <div>
                <p class="eyebrow mute">ÚLTIMAS COMPRAS REGISTRADAS</p>
                <h3 class="f-display card-title">Ventas <em class="accent">recientes</em></h3>
              </div>
              <RouterLink to="/admin/ventas" class="eyebrow brass" style="font-size:9px;text-decoration:none">VER REPORTE COMPLETO →</RouterLink>
            </div>
            <table class="sales-table">
              <thead>
                <tr>
                  <th class="eyebrow" v-for="h in ['#','FECHA','CLIENTE','PRODUCTO','VENDEDOR','TOTAL']" :key="h">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(v, i) in recentSales" :key="v.id_compra" :class="{ 'dashed-b': i < recentSales.length-1 }">
                  <td class="eyebrow mute">{{ String(v.id_compra).padStart(4,'0') }}</td>
                  <td class="eyebrow">{{ formatDate(v.fecha) }}</td>
                  <td>
                    <p style="font-size:13px">{{ v.nombre_cliente }}</p>
                    <p class="eyebrow mute">{{ v.nit_cliente }}</p>
                  </td>
                  <td>
                    <p class="f-display" style="font-size:14px;font-style:italic">{{ v.items?.[0]?.titulo_album || '—' }}</p>
                  </td>
                  <td class="eyebrow mute">{{ v.nombre_empleado || 'Online' }}</td>
                  <td class="f-display brass" style="font-size:15px;text-align:right">
                    Q {{ Number(v.total).toLocaleString('es-GT') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- ── MODAL: VENTA PRESENCIAL ──────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showVentaModal" class="vp-overlay" @click.self="cerrarVentaModal">
      <div class="vp-modal">

        <!-- Pantalla de éxito -->
        <template v-if="ventaExito">
          <div class="vp-success">
            <p class="eyebrow brass" style="margin-bottom:8px">✓ VENTA REGISTRADA</p>
            <p class="f-display" style="font-size:36px;letter-spacing:-0.02em">#{{ String(ventaExito.id_compra).padStart(4,'0') }}</p>
            <p class="eyebrow mute" style="margin-top:6px">{{ ventaExito.nombre_cliente }} · {{ ventaExito.nit_cliente }}</p>
            <div style="width:100%;margin-top:20px">
              <div v-for="it in ventaExito.items" :key="it.id_producto" class="vp-item-row hairline-b">
                <span style="flex:1;font-size:12px">{{ it.nombre_producto }}</span>
                <span class="eyebrow" style="padding:0 12px">×{{ it.cantidad }}</span>
                <span class="eyebrow brass">Q {{ Number(it.subtotal).toFixed(2) }}</span>
              </div>
            </div>
            <p class="f-display brass" style="font-size:26px;text-align:right;width:100%;margin-top:14px">TOTAL Q {{ ventaExito.total }}</p>
            <button class="btn btn-primary" style="width:100%;height:46px;margin-top:20px" @click="cerrarVentaModal">CERRAR</button>
          </div>
        </template>

        <template v-else>
          <!-- Header -->
          <div class="vp-header hairline-b">
            <div>
              <p class="eyebrow brass">● NUEVA VENTA PRESENCIAL</p>
              <h2 class="f-display" style="font-size:22px;margin-top:2px">Venta <em class="accent">en tienda</em></h2>
            </div>
            <button class="rail-btn" @click="cerrarVentaModal"><X :size="18" :stroke-width="1.4"/></button>
          </div>

          <div class="vp-body">
            <!-- 01 · CLIENTE -->
            <div class="vp-section hairline-b">
              <p class="eyebrow mute" style="margin-bottom:10px">01 · CLIENTE</p>
              <div class="vp-tabs">
                <button :class="['vp-tab', tipoCliente==='cuenta' && 'active']" @click="tipoCliente='cuenta'; clienteEncontrado=null; correoError=''">CON CUENTA</button>
                <button :class="['vp-tab', tipoCliente==='cf' && 'active']"     @click="tipoCliente='cf'">CONSUMIDOR FINAL</button>
              </div>
              <div v-if="tipoCliente==='cuenta'" style="margin-top:10px">
                <div style="display:flex;gap:8px">
                  <input v-model="correoBusqueda" class="vp-field" placeholder="correo@ejemplo.com" style="flex:1" @keyup.enter="buscarClientePorCorreo"/>
                  <button class="btn btn-ghost" style="height:38px;font-size:9px;padding:0 12px;flex-shrink:0" @click="buscarClientePorCorreo">VERIFICAR</button>
                </div>
                <p v-if="clienteEncontrado" class="eyebrow brass" style="margin-top:6px">✓ {{ clienteEncontrado.nombre }} · NIT {{ clienteEncontrado.NIT }}</p>
                <p v-if="correoError"       class="eyebrow velvet" style="margin-top:6px">✗ {{ correoError }}</p>
              </div>
              <div v-else style="display:flex;gap:10px;margin-top:10px">
                <input v-model="nombreCF" class="vp-field" placeholder="Nombre del cliente" style="flex:1"/>
                <input v-model="nitCF"   class="vp-field" placeholder="NIT o CF" style="width:100px"/>
              </div>
            </div>

            <!-- 02 · PRODUCTOS -->
            <div class="vp-section hairline-b">
              <p class="eyebrow mute" style="margin-bottom:10px">02 · PRODUCTOS</p>
              <input v-model="productoBusqueda" class="vp-field" placeholder="Buscar álbum o artista…"/>
              <div class="vp-prod-list">
                <p v-if="!productosFiltrados.length" class="eyebrow mute" style="padding:10px 12px">Sin resultados</p>
                <div v-for="p in productosFiltrados" :key="p.id" class="vp-prod-row">
                  <div style="flex:1;min-width:0">
                    <p style="font-size:12px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ p.titulo_album }} ({{ p.tipo_formato }})</p>
                    <p class="eyebrow mute" style="font-size:8px;margin-top:2px">{{ p.artista }} · Q{{ p.precio }} · Stock: {{ p.stock }}</p>
                  </div>
                  <button class="vp-add-btn" :disabled="p.stock === 0" @click="agregarItem(p)">+</button>
                </div>
              </div>

              <!-- Items añadidos -->
              <div v-if="ventaItems.length" style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px">
                <p class="eyebrow mute" style="margin-bottom:8px">ÍTEMS AÑADIDOS</p>
                <div v-for="(item, i) in ventaItems" :key="item.producto.id" class="vp-item-row">
                  <span style="flex:1;font-size:12px">{{ item.producto.titulo_album }} ({{ item.producto.tipo_formato }})</span>
                  <div style="display:flex;align-items:center;gap:6px">
                    <button class="vp-qty-btn" @click="item.cantidad > 1 ? item.cantidad-- : quitarItem(i)">−</button>
                    <span class="eyebrow" style="min-width:20px;text-align:center">{{ item.cantidad }}</span>
                    <button class="vp-qty-btn" @click="item.cantidad < item.producto.stock && item.cantidad++">+</button>
                    <span class="eyebrow brass" style="min-width:64px;text-align:right">Q {{ (item.cantidad * Number(item.producto.precio)).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 03 · CONFIRMAR -->
            <div class="vp-section">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
                <p class="eyebrow mute">03 · TOTAL</p>
                <p class="f-display brass" style="font-size:28px">Q {{ totalVenta }}</p>
              </div>
              <p v-if="ventaError" class="eyebrow velvet" style="margin-bottom:10px">✗ {{ ventaError }}</p>
              <button class="btn btn-primary" style="width:100%;height:46px" :disabled="!puedeConfirmar || ventaLoading" @click="confirmarVenta">
                {{ ventaLoading ? 'PROCESANDO…' : 'REGISTRAR VENTA' }}
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2, Package, ShoppingBag, Eye, Users, LogOut, X } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import ThemeToggle  from '@/components/ThemeToggle.vue'
import AlbumCover   from '@/components/AlbumCover.vue'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const router = useRouter()
const auth   = useAuthStore()

const stats     = ref({})
const ventas    = ref([])
const productos = ref([])

// ── Venta presencial ──────────────────────────────────────────────────────
const showVentaModal    = ref(false)
const tipoCliente       = ref('cuenta')   // 'cuenta' | 'cf'
const correoBusqueda    = ref('')
const clienteEncontrado = ref(null)
const correoError       = ref('')
const nombreCF          = ref('')
const nitCF             = ref('CF')
const productoBusqueda  = ref('')
const ventaItems        = ref([])
const ventaLoading      = ref(false)
const ventaError        = ref('')
const ventaExito        = ref(null)

// KPIs: solo datos reales, sin deltas ni comparativas inventadas
const kpis = computed(() => [
  {
    label: 'PRODUCTOS EN CATÁLOGO',
    value: stats.value.total_productos ?? '—',
    sub:   'TÍTULOS DISPONIBLES',
    color: 'var(--brass)'
  },
  {
    label: 'CLIENTES REGISTRADOS',
    value: stats.value.total_clientes ?? '—',
    sub:   'CUENTAS ACTIVAS',
    color: 'var(--brass)'
  },
  {
    label: 'VENTAS TOTALES',
    value: stats.value.total_ventas ?? '—',
    sub:   'PEDIDOS REGISTRADOS',
    color: 'var(--brass)'
  },
  {
    label: 'PRODUCTOS STOCK BAJO',
    value: stats.value.alertas_stock ?? '—',
    sub:   'STOCK < 5 UNIDADES',
    color: stats.value.alertas_stock > 0 ? 'var(--velvet)' : 'var(--mute)'
  }
])

const stockAlerts  = computed(() => productos.value.filter(p => p.stock < 5).slice(0, 6))
const recentSales  = computed(() => ventas.value.slice(0, 8))

const productosFiltrados = computed(() => {
  const q    = productoBusqueda.value.toLowerCase().trim()
  const yaId = new Set(ventaItems.value.map(i => i.producto.id))
  const base = q
    ? productos.value.filter(p =>
        p.titulo_album?.toLowerCase().includes(q) ||
        p.artista?.toLowerCase().includes(q)
      )
    : productos.value.slice(0, 20)
  return base.filter(p => !yaId.has(p.id)).slice(0, 10)
})

const totalVenta = computed(() =>
  ventaItems.value.reduce((s, i) => s + i.cantidad * Number(i.producto.precio), 0).toFixed(2)
)

const puedeConfirmar = computed(() => {
  if (!ventaItems.value.length) return false
  if (tipoCliente.value === 'cuenta') return !!correoBusqueda.value.trim() && !!clienteEncontrado.value
  return !!nombreCF.value.trim()
})

// Gráfica de barras con datos REALES de ventas por mes
const chartData = computed(() => {
  if (!ventas.value.length) return null
  const byMonth = {}
  ventas.value.forEach(v => {
    const d   = new Date(v.fecha)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const lbl = d.toLocaleDateString('es-GT', { month:'short', year:'2-digit' }).toUpperCase()
    if (!byMonth[key]) byMonth[key] = { label: lbl, total: 0 }
    byMonth[key].total += Number(v.total)
  })
  const months = Object.values(byMonth).slice(-8)
  return {
    labels: months.map(m => m.label),
    datasets: [{
      data:            months.map(m => m.total),
      backgroundColor: 'rgba(201,168,106,0.35)',
      borderColor:     'rgba(201,168,106,0.9)',
      borderWidth:     1
    }]
  }
})

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8E7E70', font: { family: 'JetBrains Mono', size: 9 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8E7E70', font: { family: 'JetBrains Mono', size: 9 } } }
  }
}

function alertAlbum(p) { return { titulo: p.titulo_album, artista: p.artista, url_portada: p.url_portada } }
function formatDate(iso) { return new Date(iso).toLocaleDateString('es-GT', { day:'2-digit', month:'short' }).toUpperCase() }

function cerrarVentaModal() {
  showVentaModal.value    = false
  tipoCliente.value       = 'cuenta'
  correoBusqueda.value    = ''
  clienteEncontrado.value = null
  correoError.value       = ''
  nombreCF.value          = ''
  nitCF.value             = 'CF'
  productoBusqueda.value  = ''
  ventaItems.value        = []
  ventaLoading.value      = false
  ventaError.value        = ''
  ventaExito.value        = null
}

async function buscarClientePorCorreo() {
  correoError.value       = ''
  clienteEncontrado.value = null
  const correo = correoBusqueda.value.trim()
  if (!correo) return
  try {
    const { data } = await api.get(`/admin/buscar-cliente?correo=${encodeURIComponent(correo)}`)
    clienteEncontrado.value = data
  } catch (err) {
    correoError.value = err.response?.data?.error ?? 'Cliente no encontrado'
  }
}

function agregarItem(producto) {
  const existe = ventaItems.value.find(i => i.producto.id === producto.id)
  if (existe) {
    if (existe.cantidad < producto.stock) existe.cantidad++
  } else {
    ventaItems.value.push({ producto, cantidad: 1 })
  }
}

function quitarItem(idx) {
  ventaItems.value.splice(idx, 1)
}

async function confirmarVenta() {
  ventaError.value   = ''
  ventaLoading.value = true
  try {
    const body = {
      items: ventaItems.value.map(i => ({ id_producto: i.producto.id, cantidad: i.cantidad }))
    }
    if (tipoCliente.value === 'cuenta') {
      body.correo = correoBusqueda.value.trim()
    } else {
      body.nombre_cf = nombreCF.value.trim()
      body.nit_cf    = nitCF.value.trim() || 'CF'
    }
    const { data } = await api.post('/ventas/presencial', body)
    ventaExito.value = data
    const [s, v, p] = await Promise.all([
      api.get('/stats/publico').then(r => r.data),
      api.get('/ventas').then(r => r.data),
      api.get('/productos').then(r => r.data)
    ])
    stats.value     = s
    ventas.value    = v
    productos.value = p
  } catch (err) {
    ventaError.value = err.response?.data?.error ?? 'Error al registrar la venta'
  } finally {
    ventaLoading.value = false
  }
}

onMounted(async () => {
  const [s, v, p] = await Promise.all([
    api.get('/stats/publico').then(r => r.data),
    api.get('/ventas').then(r => r.data),
    api.get('/productos').then(r => r.data)
  ])
  stats.value    = s
  ventas.value   = v
  productos.value = p
})
</script>

<style scoped>
.admin-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; }
.layout { display:flex; flex:1; overflow:hidden; }

.rail { width:68px; display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:6px; background:var(--paper); flex-shrink:0; }
.rail-logo { width:44px; height:44px; display:flex; align-items:center; justify-content:center; }
.rail-div { width:28px; height:1px; background:var(--line); margin:8px 0 12px; }
.rail-btn { width:44px; height:44px; display:flex; align-items:center; justify-content:center; color:var(--mute); text-decoration:none; border:1px solid transparent; transition:color 120ms,border-color 120ms; }
.rail-btn:hover { color:var(--ink); }
.rail-btn.active { color:var(--velvet); border-color:var(--velvet); }

.content { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.content-header { display:flex; align-items:flex-end; justify-content:space-between; padding:20px 24px; background:var(--paper); flex-shrink:0; }
.page-title { font-size:clamp(36px,3.5vw,56px); letter-spacing:-0.025em; line-height:.95; margin-top:6px; }
.page-sub { font-size:14px; color:var(--mute); margin-top:6px; }

.admin-main { flex:1; overflow-y:auto; padding:18px 24px 32px; display:flex; flex-direction:column; gap:18px; }

.kpi-strip { display:grid; grid-template-columns:repeat(4,1fr); background:var(--paper); }
.kpi-cell { padding:20px 22px; }
.kpi-cell:last-child { border-right:none !important; }
.kpi-value { font-size:38px; letter-spacing:-0.02em; margin-top:8px; line-height:1; }
.kpi-sub { margin-top:6px; font-size:9px; letter-spacing:.18em; }

.row-2 { display:grid; grid-template-columns:1fr 1.4fr; gap:18px; }

.card { background:var(--paper); display:flex; flex-direction:column; }
.card-head { display:flex; align-items:flex-end; justify-content:space-between; padding:18px 20px; }
.card-title { font-size:24px; letter-spacing:-0.01em; margin-top:4px; }

.alerts-list { padding:0 20px; display:flex; flex-direction:column; }
.alert-row { display:grid; grid-template-columns:44px 1fr auto; gap:12px; align-items:center; padding:10px 0; }
.alert-info { display:flex; flex-direction:column; }

.chart-wrap { height:170px; position:relative; padding:0 20px 16px; }

.table-header { display:flex; align-items:flex-end; justify-content:space-between; padding:18px 20px; }
.sales-table { width:100%; border-collapse:collapse; }
.sales-table th { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); font-size:9px; letter-spacing:.22em; color:var(--mute); font-family:var(--f-mono); }
.sales-table td { padding:12px 8px; vertical-align:middle; }
.sales-table tr.dashed-b td { border-bottom:1px dashed var(--line); }
.mute { color:var(--mute); }

/* Venta presencial modal */
.vp-overlay { position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px; }
.vp-modal { background:var(--paper);width:100%;max-width:500px;max-height:90vh;display:flex;flex-direction:column;border:1px solid var(--line); }
.vp-header { display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px;flex-shrink:0; }
.vp-body { overflow-y:auto;flex:1; }
.vp-section { padding:14px 20px; }
.vp-tabs { display:flex;border:1px solid var(--line); }
.vp-tab { flex:1;height:34px;font-family:var(--f-mono);font-size:9px;letter-spacing:.18em;color:var(--mute);border:none;background:none;cursor:pointer;transition:background 120ms,color 120ms; }
.vp-tab.active { background:var(--ink);color:var(--paper); }
.vp-field { width:100%;height:38px;padding:0 10px;border:1px solid var(--line);background:transparent;color:var(--ink);font-family:var(--f-mono);font-size:11px;box-sizing:border-box; }
.vp-field:focus { outline:none;border-color:var(--brass); }
.vp-field::placeholder { color:var(--mute); }
.vp-prod-list { max-height:140px;overflow-y:auto;margin-top:10px;border:1px solid var(--line); }
.vp-prod-row { display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--line); }
.vp-prod-row:last-child { border-bottom:none; }
.vp-add-btn { width:28px;height:28px;border:1px solid var(--line);background:none;color:var(--ink);font-size:18px;cursor:pointer;flex-shrink:0;line-height:1;display:flex;align-items:center;justify-content:center; }
.vp-add-btn:disabled { color:var(--mute);cursor:not-allowed;opacity:.5; }
.vp-item-row { display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed var(--line); }
.vp-item-row:last-child { border-bottom:none; }
.vp-qty-btn { width:26px;height:26px;border:1px solid var(--line);background:none;color:var(--ink);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center; }
.vp-success { padding:32px 24px;display:flex;flex-direction:column;align-items:center;text-align:center; }
</style>
