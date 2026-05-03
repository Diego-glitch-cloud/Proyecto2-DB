<template>
  <div class="ventas-root">
    <PosterStrip left="BACKSTAGE · REPORTE DE VENTAS" :right="`${ventas.length} VENTAS REGISTRADAS`" />

    <div class="layout">
      <!-- Rail -->
      <aside class="rail hairline-r">
        <div class="rail-logo"><span class="f-display" style="font-size:20px;font-style:italic;color:var(--velvet)">4</span></div>
        <div class="rail-div" />
        <RouterLink class="rail-btn" to="/admin" title="Dashboard"><BarChart2 :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/admin/inventario" title="Inventario"><Package :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn active" to="/admin/ventas" title="Ventas"><ShoppingBag :size="18" :stroke-width="1.4" /></RouterLink>
        <RouterLink class="rail-btn" to="/" title="Ver catálogo"><Eye :size="18" :stroke-width="1.4" /></RouterLink>
        <div style="margin-top:auto">
          <button class="rail-btn" @click="auth.logout(); router.push('/login')"><LogOut :size="18" :stroke-width="1.4" /></button>
        </div>
      </aside>

      <div class="content">
        <!-- Header -->
        <div class="content-header hairline-b">
          <div>
            <p class="eyebrow brass">REPORTE</p>
            <h1 class="f-display page-title">Registro de <em class="accent">ventas.</em></h1>
            <p class="f-serif" style="font-size:14px;color:var(--mute);margin-top:4px">
              Datos reales desde <span class="eyebrow" style="color:var(--brass)">vw_resumen_ventas</span>
            </p>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <button class="btn btn-ghost" @click="exportCSV">EXPORTAR · CSV</button>
            <ThemeToggle />
          </div>
        </div>

        <!-- Filters -->
        <div class="filters hairline-b">
          <div style="display:flex;gap:14px;align-items:center">
            <div class="field-inline">
              <label class="eyebrow">DESDE</label>
              <input type="date" v-model="fechaDesde" class="date-input eyebrow" />
            </div>
            <div class="field-inline">
              <label class="eyebrow">HASTA</label>
              <input type="date" v-model="fechaHasta" class="date-input eyebrow" />
            </div>
            <button class="btn btn-outline" style="height:36px" @click="applyFilter">FILTRAR</button>
            <button class="eyebrow act-btn" @click="clearFilter">LIMPIAR</button>
          </div>
          <div class="summary">
            <div class="sum-item">
              <span class="eyebrow">TOTAL VENTAS</span>
              <span class="f-display brass" style="font-size:24px">{{ ventas.length }}</span>
            </div>
            <div class="sum-item">
              <span class="eyebrow">INGRESOS</span>
              <span class="f-display brass" style="font-size:24px">Q {{ totalIngresos }}</span>
            </div>
            <div class="sum-item">
              <span class="eyebrow">ÍTEMS VENDIDOS</span>
              <span class="f-display brass" style="font-size:24px">{{ totalItems }}</span>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrap">
          <p v-if="loading" class="eyebrow" style="color:var(--mute);padding:24px">CARGANDO…</p>
          <table v-else class="sales-table">
            <thead>
              <tr>
                <th class="eyebrow" v-for="h in ['#','FECHA','CLIENTE','NIT','PRODUCTO','VENDEDOR','FMT','UD.','TOTAL']" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, i) in ventas" :key="v.id_compra"
                  :class="{ 'dashed-b': i < ventas.length-1, 'row-clickable': true }"
                  @click="selectedVenta = v">
                <td class="eyebrow mute">{{ String(v.id_compra).padStart(4,'0') }}</td>
                <td class="eyebrow">{{ formatDate(v.fecha) }}</td>
                <td>
                  <p style="font-size:13px">{{ v.nombre_cliente }}</p>
                </td>
                <td class="eyebrow mute">{{ v.nit_cliente }}</td>
                <td>
                  <p class="f-display" style="font-size:14px;font-style:italic">{{ v.items?.[0]?.titulo_album || '—' }}</p>
                  <p v-if="v.items?.length > 1" class="eyebrow" style="color:var(--brass)">+{{ v.items.length - 1 }} más · VER →</p>
                </td>
                <td class="eyebrow mute">{{ v.nombre_empleado || 'Online' }}</td>
                <td><FormatChip :formato="v.items?.[0]?.tipo_formato || 'Vinilo'" /></td>
                <td class="eyebrow" style="text-align:center">{{ totalUds(v) }}</td>
                <td class="f-display brass" style="font-size:15px;text-align:right">
                  Q {{ Number(v.total).toLocaleString('es-GT') }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!loading && !ventas.length" class="eyebrow" style="color:var(--mute);padding:24px;text-align:center">
            SIN VENTAS EN EL PERÍODO SELECCIONADO
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Panel de detalle de venta -->
  <Transition name="panel">
    <div v-if="selectedVenta" class="vdetail-overlay" @click.self="selectedVenta = null">
      <div class="vdetail-panel hairline">
        <div class="vdetail-head hairline-b">
          <div>
            <p class="eyebrow brass">PEDIDO #{{ String(selectedVenta.id_compra).padStart(4,'0') }}</p>
            <p class="eyebrow" style="color:var(--mute);margin-top:4px">{{ formatDate(selectedVenta.fecha) }}</p>
          </div>
          <button class="eyebrow" style="background:none;border:none;cursor:pointer;color:var(--mute)" @click="selectedVenta = null">✕ CERRAR</button>
        </div>

        <!-- Datos del cliente -->
        <div class="vdetail-section hairline-b">
          <p class="eyebrow mute" style="margin-bottom:10px">CLIENTE</p>
          <div class="vdetail-row"><span class="eyebrow">NOMBRE</span><span style="font-size:14px">{{ selectedVenta.nombre_cliente }}</span></div>
          <div class="vdetail-row"><span class="eyebrow">NIT</span><span class="eyebrow" style="color:var(--ink)">{{ selectedVenta.nit_cliente }}</span></div>
          <div class="vdetail-row"><span class="eyebrow">VENDEDOR</span><span class="eyebrow" style="color:var(--ink)">{{ selectedVenta.nombre_empleado || 'ONLINE' }}</span></div>
        </div>

        <!-- Ítems -->
        <div class="vdetail-section">
          <p class="eyebrow mute" style="margin-bottom:12px">{{ selectedVenta.items?.length }} PRODUCTO{{ selectedVenta.items?.length > 1 ? 'S' : '' }}</p>
          <div v-for="item in selectedVenta.items" :key="item.id_producto" class="vdetail-item hairline-b">
            <div style="flex:1">
              <p class="f-display" style="font-size:16px;line-height:1.1">{{ item.titulo_album }}</p>
              <p class="eyebrow" style="margin-top:4px;color:var(--mute)">{{ item.nombre_artista }}</p>
              <div style="display:flex;gap:10px;margin-top:6px;align-items:center">
                <FormatChip :formato="item.tipo_formato" />
                <span class="eyebrow" style="color:var(--mute)">{{ item.categoria }}</span>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <p class="eyebrow" style="color:var(--mute)">× {{ item.cantidad }}</p>
              <p class="eyebrow" style="color:var(--mute);margin-top:2px">
                Q {{ Number(item.precio_unitario).toLocaleString('es-GT') }} c/u
              </p>
              <p class="f-display brass" style="font-size:18px;margin-top:4px">
                Q {{ Number(item.subtotal).toLocaleString('es-GT') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="vdetail-total hairline-t">
          <span class="eyebrow">TOTAL PEDIDO</span>
          <span class="f-display brass" style="font-size:28px">Q {{ Number(selectedVenta.total).toLocaleString('es-GT') }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2, Package, ShoppingBag, Eye, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/api/index.js'
import PosterStrip from '@/components/PosterStrip.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import FormatChip  from '@/components/FormatChip.vue'

const router        = useRouter()
const auth          = useAuthStore()
const ventas        = ref([])
const loading       = ref(true)
const selectedVenta = ref(null)
const fechaDesde = ref('')
const fechaHasta = ref('')

const totalIngresos = computed(() =>
  ventas.value.reduce((s, v) => s + Number(v.total), 0).toLocaleString('es-GT')
)
const totalItems = computed(() =>
  ventas.value.reduce((s, v) => s + totalUds(v), 0)
)

function totalUds(v) { return v.items?.reduce((s, i) => s + i.cantidad, 0) || 1 }
function formatDate(iso) { return new Date(iso).toLocaleDateString('es-GT', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase() }

async function loadVentas(params = {}) {
  loading.value = true
  try {
    const { data } = await api.get('/ventas', { params })
    ventas.value = data
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  const params = {}
  if (fechaDesde.value) params.fecha_desde = fechaDesde.value
  if (fechaHasta.value) params.fecha_hasta = fechaHasta.value
  loadVentas(params)
}

function clearFilter() { fechaDesde.value = ''; fechaHasta.value = ''; loadVentas() }

function exportCSV() {
  const headers = ['ID','Fecha','Cliente','NIT','Empleado','Producto','Formato','Cantidad','Total']
  const rows = ventas.value.flatMap(v =>
    (v.items || [{ titulo_album: '—', tipo_formato: '—', cantidad: 1, subtotal: v.total }]).map(item => [
      v.id_compra, formatDate(v.fecha), v.nombre_cliente, v.nit_cliente,
      v.nombre_empleado || 'Online', item.titulo_album, item.tipo_formato,
      item.cantidad, item.subtotal
    ])
  )
  const csv  = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `ventas_${new Date().toISOString().split('T')[0]}.csv` })
  a.click(); URL.revokeObjectURL(url)
}

onMounted(() => loadVentas())
</script>

<style scoped>
.ventas-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; }
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

.filters { display:flex; align-items:center; justify-content:space-between; padding:12px 24px; background:var(--paper); flex-shrink:0; flex-wrap:wrap; gap:12px; }
.field-inline { display:flex; align-items:center; gap:8px; }
.date-input { background:none; border:none; border-bottom:1px solid var(--line); outline:none; font-size:9px; letter-spacing:.18em; color:var(--ink); padding:4px 0; }
.act-btn { background:none; border:none; cursor:pointer; color:var(--mute); font-size:9px; letter-spacing:.18em; }

.summary { display:flex; gap:28px; }
.sum-item { display:flex; flex-direction:column; gap:2px; }

.table-wrap { flex:1; overflow-y:auto; padding:20px 24px; }
.sales-table { width:100%; border-collapse:collapse; }
.sales-table th { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); font-size:9px; letter-spacing:.22em; color:var(--mute); font-family:var(--f-mono); }
.sales-table td { padding:12px 8px; vertical-align:middle; }
.sales-table tr.dashed-b td { border-bottom:1px dashed var(--line); }
.row-clickable { cursor:pointer; transition:background 100ms; }
.row-clickable:hover td { background:rgba(255,255,255,.03); }
.mute { color:var(--mute); }

/* Panel de detalle */
.vdetail-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:200; display:flex; justify-content:flex-end; }
.vdetail-panel { width:480px; height:100%; background:var(--paper); overflow-y:auto; display:flex; flex-direction:column; }
.vdetail-head { display:flex; align-items:flex-start; justify-content:space-between; padding:20px 24px; flex-shrink:0; }
.vdetail-section { padding:16px 24px; }
.vdetail-row { display:flex; align-items:center; justify-content:space-between; padding:6px 0; }
.vdetail-item { display:flex; align-items:flex-start; gap:16px; padding:14px 0; }
.vdetail-total { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; flex-shrink:0; }

.panel-enter-active, .panel-leave-active { transition:opacity 200ms; }
.panel-enter-active .vdetail-panel, .panel-leave-active .vdetail-panel { transition:transform 220ms ease; }
.panel-enter-from { opacity:0; }
.panel-leave-to  { opacity:0; }
.panel-enter-from .vdetail-panel { transform:translateX(100%); }
.panel-leave-to  .vdetail-panel  { transform:translateX(100%); }
</style>
