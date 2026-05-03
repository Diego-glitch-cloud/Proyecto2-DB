<template>
  <button class="toggle" @click="theme.toggle()">
    <span class="eyebrow" :class="{ active: theme.mode === 'dark' }">DARK</span>
    <span class="sep">/</span>
    <span class="eyebrow" :class="{ active: theme.mode === 'light' }">LIGHT</span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme.js'
const theme = useThemeStore()
</script>

<style scoped>
.toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px 0;
}
.eyebrow { color: var(--mute); transition: color 150ms; }
.eyebrow.active { color: var(--ink); }
.sep { font-family: var(--f-mono); font-size: 9px; color: var(--line); }
</style>
