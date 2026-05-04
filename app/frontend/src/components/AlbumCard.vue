<template>
  <div class="card" :class="{ compact }">
    <div class="card-cover" @click="$emit('add', producto)">
      <AlbumCover :album="albumData" :size="compact ? 130 : 220" />
      <span v-if="isNew" class="badge-new eyebrow">NUEVO</span>
      <button class="btn-plus" title="Agregar a la bolsa">+</button>
    </div>
    <div class="card-body">
      <p class="card-title" :class="compact ? 'ct-sm' : 'ct-md'">
        {{ producto.titulo_album || producto.titulo }}
      </p>
      <p class="card-meta eyebrow">{{ producto.artista }} · {{ producto.anio_album || producto.anio }}</p>
      <div class="card-footer">
        <FormatChip :formato="producto.tipo_formato || producto.formato || 'Vinilo'" />
        <span class="card-price" :class="compact ? 'cp-sm' : 'cp-md'">
          Q {{ Number(producto.precio).toLocaleString('es-GT') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AlbumCover from './AlbumCover.vue'
import FormatChip from './FormatChip.vue'

const props = defineProps({
  producto: { type: Object, required: true },
  compact:  { type: Boolean, default: false },
  isNew:    { type: Boolean, default: false }
})

defineEmits(['add'])

const albumData = computed(() => ({
  titulo:      props.producto.titulo_album || props.producto.titulo,
  artista:     props.producto.artista,
  anio:        props.producto.anio_album   || props.producto.anio,
  url_portada: props.producto.url_portada
}))
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: default;
  align-items: center;
  text-align: center;
  transition: transform 200ms ease;
}
.card:hover { transform: translateY(-4px); }

.card-cover {
  position: relative;
  overflow: visible;
  cursor: pointer;
  display: flex;
  justify-content: center;
}
.card-cover:hover .btn-plus { opacity: 1; }

.badge-new {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--velvet);
  color: #F8EFD8;
  padding: 4px 10px;
  pointer-events: none;
  z-index: 2;
}

.btn-plus {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(var(--velvet-rgb, 196, 34, 43), 0.9);
  color: #F2E9DA;
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 120ms, transform 120ms;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.btn-plus:hover { transform: scale(1.1); }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.card-title {
  font-family: var(--f-display);
  line-height: 1.1;
  color: var(--ink);
  margin: 0;
}
.ct-md { font-size: 22px; }
.ct-sm { font-size: 18px; }

.card-meta { margin: 0; color: var(--mute); }

.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
}

.card-price { font-family: var(--f-display); color: var(--brass); }
.cp-md { font-size: 20px; }
.cp-sm { font-size: 16px; }
</style>
