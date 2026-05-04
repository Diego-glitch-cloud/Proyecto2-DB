<template>
  <div class="login-root">
    <PosterStrip
      left="NOW SPINNING ✦ SIDE A ✦ 33⅓ RPM ✦ MASTERED ANALOG"
      right="GUATEMALA · GT ✦ EST · MCMXCVIII"
    />

    <div class="login-grid">

      <!-- Left — editorial -->
      <div class="left-col">
        <div class="bleed-4">4</div>
        <div class="left-inner">
          <BLogo :size="24" caption="TIENDA MUSICAL" />
          <p class="eyebrow brass vol-label">VOL. XII · MMXXV</p>

          <h1 class="headline">
            MUSIC<br /><em class="accent">4 U.</em>
          </h1>

          <p class="pull-quote">
            Discos de primera, ediciones limitadas y vinilos que
            no encontrarás en otro lugar. Curaduría desde Guatemala.
          </p>

          <div class="cluster-wrap">
            <div v-for="(album, i) in covers" :key="album.id"
                 class="cluster-item" :style="clusterStyle(i)">
              <AlbumCover :album="album" :size="130" />
            </div>
          </div>

          <!-- Stats reales desde la DB -->
          <div class="stats-row">
            <div class="stat">
              <span class="stat-n">{{ stats.total_productos ?? '—' }}</span>
              <span class="eyebrow">EDICIONES</span>
            </div>
            <div class="stat">
              <span class="stat-n">{{ stats.total_generos ?? '—' }}</span>
              <span class="eyebrow">GÉNEROS</span>
            </div>
            <div class="stat">
              <span class="stat-n">{{ stats.total_proveedores ?? '—' }}</span>
              <span class="eyebrow">SELLOS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right — auth form -->
      <div class="right-col">
        <div class="right-inner">
          <div class="meta-bar">
            <span class="eyebrow velvet">● ACCESO · CLIENTES</span>
            <ThemeToggle />
          </div>

          <h2 class="form-headline">
            {{ tab === 'ingresar' ? 'Ingresa.' : 'Únete.' }}
          </h2>
          <p class="form-sub">
            {{ tab === 'ingresar' ? 'Te esperan en cabina.' : 'Curaduría privada, primer prensa.' }}
          </p>

          <div class="tabs">
            <button class="tab eyebrow" :class="{ active: tab === 'ingresar' }"
                    @click="switchTab('ingresar')">INGRESAR</button>
            <button class="tab eyebrow" :class="{ active: tab === 'registro' }"
                    @click="switchTab('registro')">CREAR CUENTA</button>
          </div>

          <p v-if="error"   class="msg-error eyebrow">{{ error }}</p>
          <p v-if="success" class="msg-ok eyebrow">{{ success }}</p>

          <!-- INGRESAR -->
          <form v-if="tab === 'ingresar'" class="form" @submit.prevent="handleLogin">
            <div class="field">
              <label>Correo electrónico</label>
              <input v-model="form.correo" type="email" placeholder="tu@correo.com" required />
            </div>
            <div class="field pass-field">
              <label>Contraseña</label>
              <div class="pass-wrap">
                <input v-model="form.contrasena" :type="showPass ? 'text' : 'password'"
                       placeholder="••••••••" required />
                <button type="button" class="eye-btn eyebrow" @click="showPass = !showPass">
                  {{ showPass ? 'OCULTAR' : 'VER' }}
                </button>
              </div>
            </div>
            <button class="btn btn-primary btn-full" :disabled="loading">
              {{ loading ? 'VERIFICANDO…' : 'INGRESAR' }} <span class="arr">→</span>
            </button>
          </form>

          <!-- REGISTRO -->
          <form v-else class="form" @submit.prevent="handleRegister">
            <div class="field">
              <label>Nombre completo</label>
              <input v-model="form.nombre" type="text" placeholder="Tu nombre" required minlength="2" />
            </div>
            <div class="field">
              <label>Correo electrónico</label>
              <input v-model="form.correo" type="email" placeholder="tu@correo.com" required />
            </div>
            <div class="field pass-field">
              <label>Contraseña <span style="color:var(--mute);font-size:9px">(mín. 6 caracteres)</span></label>
              <div class="pass-wrap">
                <input v-model="form.contrasena" :type="showPass ? 'text' : 'password'"
                       placeholder="••••••••" required minlength="6" />
                <button type="button" class="eye-btn eyebrow" @click="showPass = !showPass">
                  {{ showPass ? 'OCULTAR' : 'VER' }}
                </button>
              </div>
            </div>
            <button class="btn btn-primary btn-full" :disabled="loading">
              {{ loading ? 'CREANDO…' : 'CREAR CUENTA' }} <span class="arr">→</span>
            </button>
          </form>

          <div class="form-footer hairline-t">
            <span class="eyebrow">STAFF · ACCESO INTERNO</span>
            <RouterLink to="/admin" class="eyebrow brass">m4u.gt/staff →</RouterLink>
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
import BLogo      from '@/components/BLogo.vue'
import PosterStrip from '@/components/PosterStrip.vue'
import AlbumCover  from '@/components/AlbumCover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router  = useRouter()
const auth    = useAuthStore()
const tab     = ref('ingresar')
const loading = ref(false)
const showPass = ref(false)
const error   = ref('')
const success = ref('')
const covers  = ref([])
const stats   = ref({})
const form    = ref({ nombre: '', correo: '', contrasena: '' })

const rotations = [-8, -4, 0, 5, 9]
const offsets   = [
  { x: -28, y: 22 }, { x: -12, y: 10 },
  { x:   0, y:  0 },
  { x:  14, y: 12 }, { x:  28, y: 24 }
]

function clusterStyle(i) {
  return {
    transform: `rotate(${rotations[i]}deg) translate(${offsets[i].x}px, ${offsets[i].y}px)`,
    zIndex:    i === 2 ? 5 : 5 - Math.abs(i - 2),
    position:  'absolute',
    boxShadow: 'var(--card-shadow)'
  }
}

function switchTab(t) {
  tab.value = t; error.value = ''; showPass.value = false
}

onMounted(async () => {
  try {
    const [albumsRes, statsRes] = await Promise.all([
      api.get('/albums'),
      api.get('/stats/publico')
    ])
    covers.value = albumsRes.data.slice(0, 5)
    stats.value  = statsRes.data
  } catch { /* silencioso */ }
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
    success.value = '¡Cuenta creada! Ahora puedes ingresar.'
    switchTab('ingresar')
    form.value = { nombre: '', correo: '', contrasena: '' }
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; background:var(--paper); }

.login-grid { display:grid; grid-template-columns:1fr 1fr; flex:1; overflow:hidden; }

/* Left */
.left-col {
  position:relative; background:var(--bg);
  border-right:1px solid var(--line);
  overflow:hidden; padding:48px;
  display:flex; flex-direction:column;
}
.bleed-4 {
  position:absolute; top:-60px; left:-20px;
  font-family:var(--f-display); font-size:480px; font-style:italic;
  color:var(--velvet); opacity:0.10; line-height:1;
  pointer-events:none; user-select:none;
}
.left-inner { position:relative; z-index:1; display:flex; flex-direction:column; height:100%; }
.vol-label { margin-top:24px; }
.headline {
  font-family:var(--f-display);
  font-size:clamp(60px,7vw,96px);
  line-height:0.88; letter-spacing:-0.025em;
  margin-top:18px;
}
.pull-quote {
  font-family:var(--f-serif); font-size:20px;
  color:var(--mute); line-height:1.55;
  max-width:400px; margin-top:18px;
}
.cluster-wrap {
  position:relative; width:220px; height:180px;
  margin-top:auto; margin-bottom:28px;
}
.stats-row { display:flex; gap:32px; }
.stat { display:flex; flex-direction:column; gap:4px; }
.stat-n { font-family:var(--f-display); font-size:42px; color:var(--brass); letter-spacing:-0.02em; line-height:1; }

/* Right */
.right-col { overflow-y:auto; display:flex; align-items:center; justify-content:center; padding:40px; }
.right-inner { width:100%; max-width:460px; display:flex; flex-direction:column; gap:20px; }
.meta-bar { display:flex; align-items:center; justify-content:space-between; }
.form-headline { font-family:var(--f-display); font-size:clamp(38px,4vw,56px); letter-spacing:-0.02em; line-height:1; }
.form-sub { font-family:var(--f-serif); font-size:26px; font-style:italic; color:var(--velvet); margin-top:-8px; }

.tabs { display:flex; gap:24px; border-bottom:1px solid var(--line); }
.tab {
  padding-bottom:10px; color:var(--mute); letter-spacing:0.24em; font-size:12px;
  border:none; border-bottom:2px solid transparent; margin-bottom:-1px;
  background:none; transition:color 150ms, border-color 150ms;
}
.tab.active { color:var(--ink); border-bottom-color:var(--velvet); }

.form { display:flex; flex-direction:column; gap:20px; }

.pass-wrap { display:flex; align-items:center; gap:0; }
.pass-wrap input { flex:1; }
.eye-btn {
  font-size:11px; letter-spacing:0.2em; color:var(--brass);
  background:none; border:none; cursor:pointer; padding:0 0 0 10px; white-space:nowrap;
}

.btn-full { width:100%; height:52px; font-size:13px; }
.arr { font-size:20px; font-family:serif; }
button:disabled { opacity:.55; cursor:not-allowed; }

.msg-error { color:var(--velvet) !important; font-size:12px; }
.msg-ok    { color:var(--brass);  font-size:12px; font-family:var(--f-mono); letter-spacing:.22em; }

.form-footer { display:flex; align-items:center; justify-content:space-between; padding-top:16px; }
</style>
