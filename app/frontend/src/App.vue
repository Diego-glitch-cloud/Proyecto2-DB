<template>
  <RouterView />
  <Toast position="bottom-right" />
</template>

<script setup>
import { useThemeStore } from '@/stores/theme.js'
import Toast from 'primevue/toast'

useThemeStore()
</script>
