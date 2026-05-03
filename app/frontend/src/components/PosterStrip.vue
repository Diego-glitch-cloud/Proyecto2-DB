<template>
  <div class="strip hairline-b">
    <span class="strip-left eyebrow brass">{{ left }}</span>
    <span class="strip-right eyebrow">{{ right }}</span>
  </div>
</template>

<script setup>
defineProps({
  left:  { type: String, required: true },
  right: { type: String, default: '' }
})
</script>

<style scoped>
.strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 22px;
  background: var(--paper);
  flex-shrink: 0;
}
</style>
