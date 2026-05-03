<template>
  <div class="admin-root">

    <!-- ── Left rail ──────────────────────────────────────────────────── -->
    <aside class="rail hairline-r">
      <div class="rail-logo">
        <span class="f-display" style="font-size:22px;font-style:italic;color:var(--velvet)">4</span>
      </div>
      <div class="rail-divider" />
      <nav class="rail-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="rail-btn"
          :class="{ active: activeNav === item.key }"
          :title="item.label"
          @click="activeNav = item.key"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.4" />
        </button>
      </nav>
      <div class="rail-bottom">
        <button class="rail-btn" title="Configuración"><Settings :size="18" :stroke-width="1.4" /></button>
        <button class="rail-btn" title="Cerrar sesión" @click="logout"><LogOut :size="18" :stroke-width="1.4" /></button>
      </div>
    </aside>

    <!-- ── Right content ─────────────────────────────────────────────── -->
    <div class="content">

      <!-- Poster strip -->
      <PosterStrip
        :left="`BACKSTAGE · ADMIN ✦ USUARIO · ${auth.user?.nombre?.split(' ')[0].toUpperCase()}`"
        right="MariaDB · CONECTADA ✦ ● ONLINE"
        class="admin-strip"
      />

      <!-- Header -->
      <div class="content-header hairline-b">
        <div>
          <p class="eyebrow brass">HEADLINER</p>
          <h1 class="page-title">Resumen <em class="accent">general.</em></h1>
          <p class="f-serif page-sub">Últimos 30 días — comparativa contra el mes anterior.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-ghost" @click="exportCSV">EXPORTAR · CSV</button>
          <button class="btn btn-primary" @click="showNuevaVenta = true">+ NUEVA VENTA</button>
          <ThemeToggle />
        </div>
      </div>

      <!-- Main grid -->
      <div class="admin-main">

        <!-- KPI strip -->
        <div class="kpi-strip hairline">
          <div v-for="kpi in kpis" :key="kpi.label" class="kpi-cell hairline-r">
            <p class="eyebrow">{{ kpi.label }}</p>
            <p class="kpi-value f-display">{{ kpi.value }}</p>
            <p class="kpi-delta eyebrow" :style="{ color: kpi.color }">{{ kpi.delta }}</p>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="row-2">

          <!-- Sales chart -->
          <div class="card hairline">
            <div class="card-header">
              <div>
                <p class="eyebrow">● VW_RESUMEN_VENTAS</p>
                <h3 class="card-title f-display">Sala de <em class="accent">ventas</em></h3>
              </div>
            </div>
            <div class="chart-wrap">
              <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
              <p v-else class="eyebrow" style="padding:20px;color:var(--mute)">CARGANDO DATOS…</p>
            </div>
          </div>

          <!-- Stock alerts -->
          <div class="card hairline">
            <div class="card-header">
              <p class="eyebrow velvet">● UMBRAL · STOCK &lt; 5</p>
              <h3 class="card-title f-display">Alertas de <em class="accent">stock</em></h3>
            </div>
            <div class="alerts-list">
              <div
                v-for="(p, i) in stockAlerts"
                :key="p.id"
                class="alert-row"
                :class="{ 'dashed-b': i < stockAlerts.length - 1 }"
              >
                <AlbumCover :album="alertAlbum(p)" :size="44" />
                <div class="alert-info">
                  <p class="f-display" style="font-size:13px;line-height:1.1">{{ p.titulo_album }}</p>
                  <p class="eyebrow" style="margin-top:3px">{{ p.artista }} · {{ p.tipo_formato }}</p>
                </div>
                <div class="alert-stock" style="text-align:right">
                  <p class="f-display velvet" style="font-size:22px">{{ String(p.stock).padStart(2,'0') }}</p>
                  <p class="eyebrow">UD.</p>
                </div>
              </div>
              <p v-if="!stockAlerts.length" class="eyebrow" style="padding:20px;color:var(--mute)">SIN ALERTAS</p>
            </div>
          </div>

        </div>

        <!-- Sales table -->
        <div class="card hairline">
          <div class="table-header">
            <div>
              <p class="eyebrow">SETLIST DE LA SEMANA</p>
              <h3 class="card-title f-display">Ventas <em class="accent">recientes</em></h3>
            </div>
            <span class="eyebrow brass" style="cursor:pointer">VER TODAS →</span>
          </div>
          <table class="sales-table">
            <thead>
              <tr>
                <th class="eyebrow" v-for="h in tableHeaders" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(venta, i) in recentSales"
                :key="venta.id_compra"
                :class="{ 'dashed-b': i < recentSales.length - 1 }"
              >
                <td class="eyebrow mute">{{ String(venta.id_compra).padStart(4,'0') }}</td>
                <td class="eyebrow">{{ formatDate(venta.fecha) }}</td>
                <td>
                  <p style="font-size:13px">{{ venta.nombre_cliente }}</p>
                  <p class="eyebrow">{{ venta.nit_cliente }}</p>
                </td>
                <td>
                  <p class="f-display" style="font-size:14px;font-style:italic">
                    {{ venta.items?.[0]?.titulo_album || '—' }}
                  </p>
                </td>
                <td class="eyebrow">{{ venta.nombre_empleado || 'Online' }}</td>
                <td><FormatChip :formato="venta.items?.[0]?.tipo_formato || 'Vinilo'" /></td>
                <td class="eyebrow" style="text-align:center">{{ totalUnidades(venta) }}</td>
                <td class="f-display brass" style="font-size:15px;text-align:right">
                  Q {{ Number(venta.total).toLocaleString('es-GT') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- Nueva Venta Modal -->
    <Transition name="fade">
      <div v-if="showNuevaVenta" class="modal-overlay" @click.self="showNuevaVenta = false">
        <div class="modal hairline">
          <div class="modal-head hairline-b">
            <span class="eyebrow">REGISTRAR NUEVA VENTA</span>
            <button @click="showNuevaVenta = false"><X :size="16" /></button>
          </div>
          <form class="modal-body" @submit.prevent="submitVenta">
            <div class="field">
              <label>ID del cliente</label>
              <input v-model.number="ventaForm.id_cliente" type="number" min="1" required />
            </div>
            <div v-for="(item, i) in ventaForm.items" :key="i" class="venta-item hairline">
              <div class="field">
                <label>ID Producto</label>
                <input v-model.number="item.id_producto" type="number" min="1" required />
              </div>
              <div class="field">
                <label>Cantidad</label>
                <input v-model.number="item.cantidad" type="number" min="1" required />
              </div>
              <button type="button" class="eyebrow velvet" @click="ventaForm.items.splice(i,1)">QUITAR</button>
            </div>
            <button type="button" class="btn btn-ghost" style="width:100%" @click="ventaForm.items.push({id_producto:null,cantidad:1})">
              + AGREGAR PRODUCTO
            </button>
            <p v-if="ventaError" class="eyebrow velvet" style="font-size:10px">{{ ventaError }}</p>
            <button class="btn btn-primary" style="width:100%;height:48px" :disabled="ventaLoading">
              {{ ventaLoading ? 'PROCESANDO…' : 'CONFIRMAR VENTA →' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast }  from 'primevue/usetoast'
import {
  BarChart2, Package, ShoppingBag, Users,
  Settings, LogOut, X
} from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, BarElement, CategoryScale,
  LinearScale, Tooltip, Legend
} from 'chart.js'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import ThemeToggle  from '@/components/ThemeToggle.vue'
import AlbumCover   from '@/components/AlbumCover.vue'
import FormatChip   from '@/components/FormatChip.vue'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const activeNav      = ref('chart')
const showNuevaVenta = ref(false)
const ventas         = ref([])
const productos      = ref([])
const ventaError     = ref('')
const ventaLoading   = ref(false)

const ventaForm = ref({ id_cliente: null, items: [{ id_producto: null, cantidad: 1 }] })

const navItems = [
  { key: 'chart',   label: 'Resumen',    icon: BarChart2   },
  { key: 'inv',     label: 'Inventario', icon: Package     },
  { key: 'ventas',  label: 'Ventas',     icon: ShoppingBag },
  { key: 'clientes',label: 'Clientes',   icon: Users       },
]

const tableHeaders = ['#', 'FECHA', 'CLIENTE', 'PRODUCTO', 'VENDEDOR', 'FMT', 'UD.', 'TOTAL']

// KPIs computed from real data
const kpis = computed(() => {
  const now   = new Date()
  const thisM = ventas.value.filter(v => {
    const d = new Date(v.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const prevM = ventas.value.filter(v => {
    const d = new Date(v.fecha)
    const prev = new Date(now.getFullYear(), now.getMonth() - 1)
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
  })

  const sumTotal  = arr => arr.reduce((s, v) => s + Number(v.total), 0)
  const thisTotal = sumTotal(thisM)
  const prevTotal = sumTotal(prevM)
  const delta     = prevTotal ? Math.round((thisTotal - prevTotal) / prevTotal * 100) : 0

  const alerts = productos.value.filter(p => p.stock < 5).length

  return [
    {
      label: 'INGRESOS · MES',
      value: `Q ${thisTotal.toLocaleString('es-GT')}`,
      delta: `${delta >= 0 ? '+' : ''}${delta}% VS MES ANT.`,
      color: delta >= 0 ? 'var(--brass)' : 'var(--velvet)'
    },
    {
      label: 'PEDIDOS',
      value: String(thisM.length).padStart(3, '0'),
      delta: `${thisM.length} ESTE MES`,
      color: 'var(--brass)'
    },
    {
      label: 'TICKET PROMEDIO',
      value: thisM.length ? `Q ${(thisTotal / thisM.length).toLocaleString('es-GT', { maximumFractionDigits: 0 })}` : 'Q —',
      delta: 'POR COMPRA',
      color: 'var(--mute)'
    },
    {
      label: 'ALERTAS · STOCK',
      value: String(alerts).padStart(2, '0'),
      delta: `DE ${productos.value.length} SKUs`,
      color: alerts > 0 ? 'var(--velvet)' : 'var(--mute)'
    }
  ]
})

// Chart data: ventas grouped by month
const chartData = computed(() => {
  if (!ventas.value.length) return null
  const byMonth = {}
  ventas.value.forEach(v => {
    const d   = new Date(v.fecha)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const lbl = d.toLocaleDateString('es-GT', { month: 'short', year: '2-digit' }).toUpperCase()
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
      borderWidth:     1,
    }]
  }
})

const chartOptions = {
  responsive:          true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8E7E70', font: { family: 'JetBrains Mono', size: 9 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8E7E70', font: { family: 'JetBrains Mono', size: 9 } } }
  }
}

const stockAlerts  = computed(() => productos.value.filter(p => p.stock < 5).slice(0, 6))
const recentSales  = computed(() => ventas.value.slice(0, 8))

function alertAlbum(p) {
  return { titulo: p.titulo_album, artista: p.artista, url_portada: p.url_portada }
}

function totalUnidades(venta) {
  return venta.items?.reduce((s, i) => s + i.cantidad, 0) || 1
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' }).toUpperCase()
}

function exportCSV() {
  const headers = ['ID', 'Fecha', 'Cliente', 'NIT', 'Empleado', 'Total']
  const rows    = recentSales.value.map(v => [
    v.id_compra, formatDate(v.fecha), v.nombre_cliente, v.nit_cliente,
    v.nombre_empleado || 'Online', v.total
  ])
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'ventas.csv'; a.click()
  URL.revokeObjectURL(url)
}

async function submitVenta() {
  ventaError.value = ''; ventaLoading.value = true
  try {
    await api.post('/ventas', {
      id_cliente: ventaForm.value.id_cliente,
      items:      ventaForm.value.items
    })
    showNuevaVenta.value = false
    toast.add({ severity: 'success', summary: 'Venta registrada', life: 3000 })
    loadData()
  } catch (e) {
    ventaError.value = e.response?.data?.error || 'Error al registrar la venta'
  } finally {
    ventaLoading.value = false
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

async function loadData() {
  const [v, p] = await Promise.all([
    api.get('/ventas').then(r => r.data),
    api.get('/productos').then(r => r.data)
  ])
  ventas.value    = v
  productos.value = p
}

onMounted(loadData)
</script>

<style scoped>
.admin-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Rail ── */
.rail {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 0;
  background: var(--paper);
  flex-shrink: 0;
}

.rail-logo {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rail-divider {
  width: 32px;
  height: 1px;
  background: var(--line);
  margin: 10px 0 16px;
}

.rail-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.rail-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mute);
  border: 1px solid transparent;
  transition: color 120ms, border-color 120ms;
}

.rail-btn:hover { color: var(--ink); }
.rail-btn.active { color: var(--velvet); border-color: var(--velvet); }

.rail-bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
}

/* ── Content ── */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-strip { flex-shrink: 0; }

.content-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px 28px;
  background: var(--paper);
  flex-shrink: 0;
}

.page-title {
  font-family: var(--f-display);
  font-size: clamp(40px, 4vw, 64px);
  letter-spacing: -0.025em;
  line-height: 0.95;
  margin-top: 6px;
}

.page-sub {
  font-size: 15px;
  color: var(--mute);
  margin-top: 6px;
}

.header-actions { display: flex; align-items: center; gap: 10px; }

/* ── Main ── */
.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── KPI strip ── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--paper);
}

.kpi-cell {
  padding: 20px 22px;
}
.kpi-cell:last-child { border-right: none; }

.kpi-value {
  font-size: 38px;
  letter-spacing: -0.02em;
  margin-top: 8px;
  line-height: 1;
}

.kpi-delta {
  margin-top: 6px;
  font-size: 9px;
  letter-spacing: 0.18em;
}

/* ── Row 2 ── */
.row-2 {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 18px;
}

/* ── Card ── */
.card {
  background: var(--paper);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-header { display: flex; flex-direction: column; gap: 6px; }

.card-title {
  font-size: 26px;
  letter-spacing: -0.01em;
}

.chart-wrap {
  height: 180px;
  position: relative;
}

/* ── Alerts ── */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.alert-row {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
}

.alert-info { display: flex; flex-direction: column; }

/* ── Table ── */
.table-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table th {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid var(--line);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mute);
  font-family: var(--f-mono);
  font-weight: 500;
}

.sales-table td {
  padding: 12px 8px;
  vertical-align: middle;
}

.sales-table tr.dashed-b td {
  border-bottom: 1px dashed var(--line);
}

.mute { color: var(--mute); }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: var(--paper);
  width: 440px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
}

.modal-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.venta-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  align-items: flex-end;
}
.venta-item .field { flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity 180ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
