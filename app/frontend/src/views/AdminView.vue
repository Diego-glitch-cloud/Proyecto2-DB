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
            <RouterLink to="/admin/ventas" class="btn btn-ghost" style="height:40px;text-decoration:none">REPORTE VENTAS →</RouterLink>
            <RouterLink to="/admin/inventario" class="btn btn-primary" style="height:40px;text-decoration:none">+ AGREGAR PRODUCTO</RouterLink>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2, Package, ShoppingBag, Eye, Users, LogOut } from 'lucide-vue-next'
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

const stats    = ref({})
const ventas   = ref([])
const productos = ref([])

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
</style>
