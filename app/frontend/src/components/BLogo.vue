<template>
  <div class="logo" :style="{ fontSize: size + 'px' }">
    <span class="logo-m">M</span><span class="logo-4">4</span><span class="logo-u">U</span>
    <span v-if="caption" class="logo-caption">{{ caption }}</span>
  </div>
</template>

<script setup>
defineProps({
  size:    { type: Number, default: 20 },
  caption: { type: String, default: '' }
})
</script>

<style scoped>
.logo {
  font-family: var(--f-display);
  font-weight: 400;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 1px;
  color: var(--ink);
}
.logo-4  { color: var(--velvet); font-style: italic; }
.logo-caption {
  font-family: var(--f-mono);
  font-size: 8px;
  letter-spacing: 0.22em;
  color: var(--mute);
  margin-left: 8px;
  text-transform: uppercase;
  align-self: center;
}
</style>
