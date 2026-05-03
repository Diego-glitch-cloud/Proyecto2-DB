<template>
  <div class="nf-root">
    <div class="nf-inner">
      <span class="nf-code f-display">404</span>
      <h1 class="f-display nf-title">Pagina<em class="accent">no encontrada.</em></h1>
      <p class="f-serif nf-sub">Esta pista no existe en nuestro catálogo.</p>
      <RouterLink to="/" class="btn btn-primary" style="height:52px;margin-top:32px">
        ← VOLVER AL CATÁLOGO
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.nf-root {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.nf-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
.nf-code {
  font-size: clamp(120px, 20vw, 220px);
  color: var(--velvet);
  opacity: 0.18;
  line-height: 1;
  letter-spacing: -0.04em;
  position: absolute;
  pointer-events: none;
  user-select: none;
}
.nf-title {
  font-size: clamp(36px, 5vw, 64px);
  letter-spacing: -0.025em;
  line-height: 1;
  position: relative;
}
.nf-sub {
  font-size: 22px;
  color: var(--mute);
  position: relative;
}
</style>
