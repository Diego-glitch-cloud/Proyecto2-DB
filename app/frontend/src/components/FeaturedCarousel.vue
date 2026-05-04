<template>
  <section v-if="items.length" class="carousel hairline"
           @mouseenter="pause" @mouseleave="resume">

    <!-- Fondo blur de portada -->
    <div class="carousel-bg" :style="bgStyle" />
    <div class="carousel-overlay" />

    <!-- Cover -->
    <div class="carousel-cover-col">
      <Transition name="cover-fade" mode="out-in">
        <div :key="current" class="cover-wrap">
          <AlbumCover :album="currentItem" :size="260" class="cover-img" />
        </div>
      </Transition>
    </div>

    <!-- Info -->
    <div class="carousel-info-col">
      <p class="eyebrow carousel-label">
        ● MÁS VENDIDOS · #{{ current + 1 }} DE {{ items.length }}
      </p>
      <Transition name="info-fade" mode="out-in">
        <div :key="current" class="info-inner">
          <p class="eyebrow" style="color:rgba(242,233,218,.6);margin-bottom:6px">
            {{ currentItem.generos?.split(',')[0]?.trim() || 'ESPECIAL' }}
          </p>
          <h2 class="carousel-title f-display">{{ currentItem.titulo_album }}</h2>
          <p class="f-serif carousel-artist">{{ currentItem.artista }}, {{ currentItem.anio_album }}</p>
          <div class="carousel-price-row">
            <span class="f-display carousel-price">Q {{ Number(currentItem.precio).toLocaleString('es-GT') }}</span>
            <FormatChip :formato="currentItem.tipo_formato" size="lg" />
          </div>
          <p class="eyebrow" style="color:rgba(242,233,218,.5)">
            {{ currentItem.total_vendido }} UNIDADES VENDIDAS
          </p>
          <div class="carousel-actions">
            <button class="btn btn-primary" style="height:48px" @click="$emit('select', currentItem)">
              VER DETALLES →
            </button>
            <button class="btn btn-outline" style="height:48px"
                    @click="$emit('add', currentItem)"
                    :disabled="currentItem.stock === 0">
              {{ currentItem.stock === 0 ? 'SIN STOCK' : '+ BOLSA' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Controles -->
    <button class="carousel-nav carousel-prev" @click="prev">‹</button>
    <button class="carousel-nav carousel-next" @click="next">›</button>

    <!-- Dots -->
    <div class="carousel-dots">
      <button v-for="(_, i) in items" :key="i"
              class="dot" :class="{ active: i === current }"
              @click="goTo(i)" />
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/api/index.js'
import AlbumCover from './AlbumCover.vue'
import FormatChip from './FormatChip.vue'

defineEmits(['select', 'add'])

const items   = ref([])
const current = ref(0)
let   timer   = null

const currentItem = computed(() => items.value[current.value] || {})

const bgStyle = computed(() => currentItem.value.url_portada
  ? { backgroundImage: `url(${currentItem.value.url_portada})` }
  : { background: 'var(--velvet)' }
)

function next()     { current.value = (current.value + 1) % items.value.length }
function prev()     { current.value = (current.value - 1 + items.value.length) % items.value.length }
function goTo(i)    { current.value = i }
function pause()    { clearInterval(timer) }
function resume()   { timer = setInterval(next, 4000) }

onMounted(async () => {
  try {
    const { data } = await api.get('/productos/mas-vendidos', { params: { limit: 8 } })
    items.value = data
  } catch { /* silencioso */ }
  resume()
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.carousel {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  min-height: 420px;
  overflow: hidden;
}

.carousel-bg {
  position: absolute; inset: -20px;
  background-size: cover; background-position: center;
  filter: blur(48px) saturate(1.4) scale(1.2);
  opacity: .55;
  transition: background-image 600ms ease;
}
.carousel-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,.6), rgba(139,0,0,.3));
}

.carousel-cover-col {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.cover-wrap { display: flex; justify-content: center; }
.cover-img  { transform: rotate(-2deg); box-shadow: var(--card-shadow); cursor: pointer; }

.carousel-info-col {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; justify-content: center;
  padding: 40px 48px;
  background: rgba(14,11,12,.4);
}
.carousel-label  { color: rgba(242,233,218,.7); font-size: 11px; letter-spacing: .28em; margin-bottom: 16px; }
.info-inner      { display: flex; flex-direction: column; gap: 10px; }
.carousel-title  { font-size: clamp(36px,4vw,60px); line-height: .92; letter-spacing: -.025em; color: #F2E9DA; }
.carousel-artist { font-size: 22px; color: rgba(242,233,218,.7); }
.carousel-price-row { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
.carousel-price  { font-size: 48px; color: var(--brass); letter-spacing: -.025em; line-height: 1; }
.carousel-actions { display: flex; gap: 12px; margin-top: 6px; }

/* Nav arrows */
.carousel-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 10; width: 44px; height: 44px;
  background: rgba(0,0,0,.5); color: #F2E9DA;
  border: 1px solid rgba(242,233,218,.2); font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 120ms;
}
.carousel-nav:hover { background: rgba(0,0,0,.8); }
.carousel-prev { left: 16px; }
.carousel-next { right: 16px; }

/* Dots */
.carousel-dots {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  z-index: 10; display: flex; gap: 8px;
}
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(242,233,218,.3); border: none; cursor: pointer;
  transition: background 200ms, transform 200ms;
}
.dot.active { background: var(--brass); transform: scale(1.3); }

/* Transitions */
.cover-fade-enter-active, .cover-fade-leave-active { transition: opacity 300ms, transform 300ms; }
.cover-fade-enter-from { opacity: 0; transform: scale(.94) rotate(-4deg); }
.cover-fade-leave-to   { opacity: 0; transform: scale(1.04) rotate(0deg); }

.info-fade-enter-active, .info-fade-leave-active { transition: opacity 250ms, transform 250ms; }
.info-fade-enter-from { opacity: 0; transform: translateY(12px); }
.info-fade-leave-to   { opacity: 0; transform: translateY(-8px); }
</style>
