<template>
  <span class="chip" :class="size">
    <span v-if="formato === 'Vinilo'" class="dot" />
    {{ formato }}
  </span>
</template>

<script setup>
defineProps({
  formato: { type: String, required: true },
  size:    { type: String, default: 'sm' }
})
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--line);
  font-family: var(--f-mono);
  text-transform: uppercase;
  color: var(--mute);
  white-space: nowrap;
}
.chip.sm { font-size: 8px; letter-spacing: 0.18em; padding: 2px 7px; }
.chip.lg { font-size: 9px; letter-spacing: 0.18em; padding: 4px 10px; }
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--mute);
  flex-shrink: 0;
}
</style>
