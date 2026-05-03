<template>
  <div class="cover" :style="{ width: sz + 'px', height: sz + 'px' }">
    <img v-if="url" :src="url" :alt="alt" class="cover-img" />
    <div v-else class="cover-fallback">
      <span class="cover-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  album:  { type: Object, default: null },
  size:   { type: Number, default: 140 },
})

const sz    = computed(() => props.size)
const url   = computed(() => props.album?.url_portada || null)
const alt   = computed(() => props.album ? `${props.album.artista} — ${props.album.titulo}` : '')
const label = computed(() => {
  if (!props.album) return '?'
  return `${props.album.artista?.slice(0,3).toUpperCase()} / ${props.album.anio || ''}`
})
</script>

<style scoped>
.cover {
  flex-shrink: 0;
  border: 1px solid var(--cover-border);
  overflow: hidden;
  position: relative;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-fallback {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    var(--line),
    var(--line) 1px,
    var(--paper) 1px,
    var(--paper) 8px
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-label {
  font-family: var(--f-mono);
  font-size: 8px;
  letter-spacing: 0.2em;
  color: var(--mute);
  text-transform: uppercase;
  text-align: center;
  padding: 4px;
}
</style>
