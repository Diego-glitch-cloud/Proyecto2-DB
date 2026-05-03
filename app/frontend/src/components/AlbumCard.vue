<template>
  <div class="card" :class="{ compact }">
    <div class="card-cover" @click="$emit('add', producto)">
      <AlbumCover :album="albumData" :size="compact ? 110 : 160" />
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
.card { display: flex; flex-direction: column; gap: 10px; cursor: default; }

.card-cover {
  position: relative;
  overflow: visible;
  cursor: pointer;
}
.card-cover:hover .btn-plus { opacity: 1; }

.badge-new {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--velvet);
  color: #F8EFD8;
  padding: 2px 8px;
  pointer-events: none;
}

.btn-plus {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.72);
  color: #F2E9DA;
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 120ms;
  backdrop-filter: blur(4px);
}

.card-body { display: flex; flex-direction: column; gap: 6px; }

.card-title { font-family: var(--f-display); line-height: 1.15; color: var(--ink); }
.ct-md { font-size: 16px; }
.ct-sm { font-size: 14px; }

.card-meta { margin-top: 0; }

.card-footer { display: flex; align-items: center; justify-content: space-between; }

.card-price { font-family: var(--f-display); color: var(--brass); }
.cp-md { font-size: 17px; }
.cp-sm { font-size: 14px; }
</style>
