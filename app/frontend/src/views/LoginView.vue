<template>
  <div class="login-root">

    <!-- ── Top strip ────────────────────────────────────────────────────── -->
    <PosterStrip
      left="NOW SPINNING ✦ SIDE A ✦ 33⅓ RPM ✦ MASTERED ANALOG"
      right="GUATEMALA · GT ✦ EST · MCMXCVIII"
      class="login-strip"
    />

    <div class="login-grid">

      <!-- ── Left — editorial ─────────────────────────────────────────── -->
      <div class="left-col">
        <div class="bleed-4">4</div>

        <div class="left-inner">
          <BLogo :size="22" caption="TIENDA MUSICAL" />

          <p class="eyebrow brass vol-label">VOL. XII · NOVIEMBRE MMXXV</p>

          <h1 class="headline">
            After<br />
            <em class="accent">hours.</em>
          </h1>

          <p class="pull-quote">
            Discos de primera prensa, ediciones limitadas y vinilos que
            no encontrarás en otro lugar. Curaduría desde Guatemala.
          </p>

          <!-- Cover cluster -->
          <div class="cluster-wrap">
            <div
              v-for="(album, i) in covers"
              :key="album.id"
              class="cluster-item"
              :style="clusterStyle(i)"
            >
              <AlbumCover :album="album" :size="130" />
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat">
              <span class="stat-n">287</span>
              <span class="eyebrow">EDICIONES</span>
            </div>
            <div class="stat">
              <span class="stat-n">12</span>
              <span class="eyebrow">GÉNEROS</span>
            </div>
            <div class="stat">
              <span class="stat-n">27</span>
              <span class="eyebrow">SELLOS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right — auth form ────────────────────────────────────────── -->
      <div class="right-col">
        <div class="right-inner">

          <!-- Meta bar -->
          <div class="meta-bar">
            <span class="eyebrow velvet">● ACCESO · CLIENTES</span>
            <ThemeToggle />
          </div>

          <!-- Headline -->
          <h2 class="form-headline">
            {{ tab === 'ingresar' ? 'Ingresa.' : 'Únete.' }}
          </h2>
          <p class="form-sub accent-sub">
            {{ tab === 'ingresar' ? 'Te esperan en cabina.' : 'Curaduría privada, primer prensa.' }}
          </p>

          <!-- Tabs -->
          <div class="tabs">
            <button
              class="tab eyebrow"
              :class="{ active: tab === 'ingresar' }"
              @click="tab = 'ingresar'; error = ''"
            >INGRESAR</button>
            <button
              class="tab eyebrow"
              :class="{ active: tab === 'registro' }"
              @click="tab = 'registro'; error = ''"
            >CREAR CUENTA</button>
          </div>

          <!-- Error -->
          <p v-if="error" class="field-error eyebrow velvet">{{ error }}</p>
          <p v-if="success" class="field-ok eyebrow">{{ success }}</p>

          <!-- INGRESAR form -->
          <form v-if="tab === 'ingresar'" class="form" @submit.prevent="handleLogin">
            <div class="field">
              <label>Correo electrónico</label>
              <input v-model="form.correo" type="email" placeholder="tu@correo.com" required />
            </div>
            <div class="field">
              <label>Contraseña</label>
              <input v-model="form.contrasena" type="password" placeholder="••••••••" required />
            </div>
            <button class="btn btn-primary btn-full" :disabled="loading">
              {{ loading ? 'VERIFICANDO…' : 'INGRESAR' }}
              <span class="btn-arrow">→</span>
            </button>
          </form>

          <!-- REGISTRO form -->
          <form v-else class="form" @submit.prevent="handleRegister">
            <div class="field">
              <label>Nombre completo</label>
              <input v-model="form.nombre" type="text" placeholder="Tu nombre" required minlength="2" />
            </div>
            <div class="field">
              <label>Correo electrónico</label>
              <input v-model="form.correo" type="email" placeholder="tu@correo.com" required />
            </div>
            <div class="field">
              <label>Contraseña</label>
              <input v-model="form.contrasena" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
            </div>
            <button class="btn btn-primary btn-full" :disabled="loading">
              {{ loading ? 'CREANDO CUENTA…' : 'CREAR CUENTA' }}
              <span class="btn-arrow">→</span>
            </button>
          </form>

          <!-- Footer -->
          <div class="form-footer hairline-t">
            <span class="eyebrow">STAFF · ACCESO INTERNO</span>
            <a href="/admin" class="eyebrow brass">m4u.gt/staff →</a>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/api/index.js'
import BLogo from '@/components/BLogo.vue'
import PosterStrip from '@/components/PosterStrip.vue'
import AlbumCover from '@/components/AlbumCover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const auth   = useAuthStore()

const tab     = ref('ingresar')
const loading = ref(false)
const error   = ref('')
const success = ref('')
const covers  = ref([])

const form = ref({ nombre: '', correo: '', contrasena: '' })

const rotations = [-8, -4, 0, 5, 9]
const offsets   = [
  { x: -28, y: 22 }, { x: -12, y: 10 },
  { x:   0, y:  0 },
  { x:  14, y: 12 }, { x:  28, y: 24 }
]

function clusterStyle(i) {
  return {
    transform:  `rotate(${rotations[i]}deg) translate(${offsets[i].x}px, ${offsets[i].y}px)`,
    zIndex:     i === 2 ? 5 : 5 - Math.abs(i - 2),
    position:   'absolute',
    boxShadow:  'var(--card-shadow)',
    transition: 'transform 200ms'
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/albums')
    covers.value = data.slice(0, 5)
  } catch { /* no covers, fallback renders */ }
})

async function handleLogin() {
  error.value = ''; loading.value = true
  try {
    const rol = await auth.login(form.value.correo, form.value.contrasena)
    router.push(['admin', 'vendedor'].includes(rol) ? '/admin' : '/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''; success.value = ''; loading.value = true
  try {
    await auth.register(form.value.nombre, form.value.correo, form.value.contrasena)
    success.value = 'Cuenta creada. Ahora puedes ingresar.'
    tab.value = 'ingresar'
    form.value = { nombre: '', correo: '', contrasena: '' }
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--paper);
}

.login-strip { flex-shrink: 0; }

.login-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  overflow: hidden;
}

/* ── Left column ── */
.left-col {
  position: relative;
  background: var(--bg);
  border-right: 1px solid var(--line);
  overflow: hidden;
  padding: 48px;
  display: flex;
  flex-direction: column;
}

.bleed-4 {
  position: absolute;
  top: -60px;
  left: -20px;
  font-family: var(--f-display);
  font-size: 480px;
  font-style: italic;
  color: var(--velvet);
  opacity: 0.10;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.left-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vol-label { margin-top: 24px; }

.headline {
  font-family: var(--f-display);
  font-size: clamp(56px, 7vw, 96px);
  line-height: 0.9;
  letter-spacing: -0.025em;
  margin-top: 18px;
  color: var(--ink);
}

.pull-quote {
  font-family: var(--f-serif);
  font-size: 16px;
  color: var(--mute);
  line-height: 1.55;
  max-width: 360px;
  margin-top: 18px;
}

.cluster-wrap {
  position: relative;
  width: 220px;
  height: 180px;
  margin-top: auto;
  margin-bottom: 32px;
}

.cluster-item { transition: transform 200ms ease; }

.stats-row {
  display: flex;
  gap: 32px;
  margin-top: auto;
}

.stat { display: flex; flex-direction: column; gap: 4px; }

.stat-n {
  font-family: var(--f-display);
  font-size: 36px;
  color: var(--brass);
  letter-spacing: -0.02em;
  line-height: 1;
}

/* ── Right column ── */
.right-col {
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.right-inner {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-headline {
  font-family: var(--f-display);
  font-size: clamp(36px, 4vw, 56px);
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
}

.form-sub {
  font-family: var(--f-serif);
  font-size: 22px;
  font-style: italic;
  color: var(--velvet);
  margin-top: -8px;
}

.tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0;
}

.tab {
  padding-bottom: 10px;
  color: var(--mute);
  letter-spacing: 0.24em;
  font-size: 10px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 150ms, border-color 150ms;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
}
.tab.active { color: var(--ink); border-bottom-color: var(--velvet); }
.tab:hover { color: var(--ink); }

.form { display: flex; flex-direction: column; gap: 20px; }

.btn-full { width: 100%; height: 54px; font-size: 11px; }
.btn-arrow { font-size: 18px; font-family: serif; }

button:disabled { opacity: 0.55; cursor: not-allowed; }

.field-error { color: var(--velvet) !important; font-size: 10px; }
.field-ok    { color: var(--brass);  font-size: 10px; font-family: var(--f-mono); letter-spacing: 0.22em; }

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  margin-top: 4px;
}
</style>
