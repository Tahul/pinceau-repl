<script setup lang="ts">
import { ref } from 'vue'
import { ReplStore } from '../src/store'
import Header from './Header.vue'

const setVH = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
}
window.addEventListener('resize', setVH)
setVH()

const useDevMode = ref(false)
const useSSRMode = ref(false)
let hash = location.hash.slice(1)
if (hash.startsWith('__DEV__')) {
  hash = hash.slice(7)
  useDevMode.value = true
}
if (hash.startsWith('__SSR__')) {
  hash = hash.slice(7)
  useSSRMode.value = true
}

const store = new ReplStore({
  serializedState: hash,
  defaultVueRuntimeURL: import.meta.env.PROD
    ? 'https://unpkg.com/@vue/runtime-dom@latest/dist/runtime-dom.esm-browser.js'
    : `${location.origin}/vue-dev-proxy`,
  defaultVueServerRendererURL: import.meta.env.PROD
    ? 'https://unpkg.com/@vue/server-renderer@latest/dist/server-renderer.esm-browser.js'
    : `${location.origin}/vue-server-renderer-dev-proxy`,
  defaultPinceauRuntimeURL: import.meta.env.PROD
    ? 'https://unpkg.com/pinceau@latest/dist/browser/runtime.js'
    : `${location.origin}/pinceau-runtime-proxy`,
  defaultPinceauUtilsURL: import.meta.env.PROD
    ? 'https://unpkg.com/pinceau@latest/dist/browser/utils.js'
    : `${location.origin}/pinceau-utils-proxy`,
  defaultPinceauURL: import.meta.env.PROD
    ? 'https://unpkg.com/pinceau@latest/dist/browser/index.js'
    : `${location.origin}/pinceau-proxy`,
})

// enable experimental features
const sfcOptions = {
  script: {
    inlineTemplate: !useDevMode.value,
    isProd: !useDevMode.value,
    reactivityTransform: true,
  },
  style: {
    isProd: !useDevMode.value,
  },
  template: {
    isProd: !useDevMode.value,
  },
}

/*
// persist state
watchEffect(() => {
  const newHash = store
    .serialize()
    .replace(/^#/, useSSRMode.value ? '#__SSR__' : '#')
    .replace(/^#/, useDevMode.value ? '#__DEV__' : '#')
  history.replaceState({}, '', newHash)
})
*/

function toggleDevMode() {
  const dev = (useDevMode.value = !useDevMode.value)
  sfcOptions.script.inlineTemplate
    = sfcOptions.script.isProd
    = sfcOptions.template.isProd
    = sfcOptions.style.isProd
      = !dev
  store.setFiles(store.getFiles())
}

function toggleSSR() {
  useSSRMode.value = !useSSRMode.value
  store.setFiles(store.getFiles())
}
</script>

<template>
  <Header
    :store="store"
    :dev="useDevMode"
    :ssr="useSSRMode"
    @toggle-dev="toggleDevMode"
    @toggle-ssr="toggleSSR"
  />
  <PinceauRepl
    :ssr="useSSRMode"
    :store="store"
    :show-compile-output="true"
    :auto-resize="true"
    :sfc-options="sfcOptions"
    :clear-console="false"
    @keydown.ctrl.s.prevent
    @keydown.meta.s.prevent
  />
</template>

<style>
.dark {
  color-scheme: dark;
}
body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}
.pinceau-repl {
  height: calc(var(--vh) - var(--nav-height));
}
button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
