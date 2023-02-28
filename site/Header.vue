<script setup lang="ts">
import type { PropType } from 'vue'
import type { ReplStore } from 'src'
import { downloadProject } from './download/download'
import Sun from './icons/Sun.vue'
import Moon from './icons/Moon.vue'
import Share from './icons/Share.vue'
import Download from './icons/Download.vue'
import GitHub from './icons/GitHub.vue'
import Versions from './Versions.vue'

// @ts-ignore
const props = defineProps({
  store: {
    type: Object as PropType<ReplStore>,
    required: true,
  },
  ssr: {
    type: Boolean,
    required: true,
  },
  dev: {
    type: Boolean,
    required: true,
  },
})
const { store } = props

async function copyLink() {
  const newHash = store
    .serialize()
    .replace(/^#/, props.ssr ? '#__SSR__' : '#')
    .replace(/^#/, props.dev ? '#__DEV__' : '#')
  await navigator.clipboard.writeText(`${location.origin}${newHash}`)
  alert('Sharable URL has been copied to clipboard.')
}

function toggleDark() {
  const cls = document.documentElement.classList
  cls.toggle('dark')
  localStorage.setItem(
    'vue-sfc-playground-prefer-dark',
    String(cls.contains('dark')),
  )
}
</script>

<template>
  <nav>
    <h1>
      <img alt="logo" src="/logo.svg">
      <span>Pinceau Playground</span>
    </h1>
    <div class="links">
      <Versions repo="vuejs/core" :set="store.setVueVersion" :reset="store.resetVueVersion">
        Vue
      </Versions>
      <Versions repo="tahul/pinceau" :set="store.setPinceauVersion" :reset="store.resetPinceauVersion">
        Pinceau
      </Versions>
      <button
        title="Toggle development production mode"
        class="toggle-dev"
        :class="{ dev }"
        @click="$emit('toggleDev')"
      >
        <span>{{ dev ? 'DEV' : 'PROD' }}</span>
      </button>
      <button
        title="Toggle server rendering mode"
        class="toggle-ssr"
        :class="{ enabled: ssr }"
        @click="$emit('toggleSsr')"
      >
        <span>{{ ssr ? 'SSR ON' : 'SSR OFF' }}</span>
      </button>
      <button title="Toggle dark mode" class="toggle-dark" @click="toggleDark">
        <Sun class="light" />
        <Moon class="dark" />
      </button>
      <button title="Copy sharable URL" class="share" @click="copyLink">
        <Share />
      </button>
      <button
        title="Download project files"
        class="download"
        @click="downloadProject(store)"
      >
        <Download />
      </button>
      <button title="View on GitHub" class="github">
        <a
          href="https://github.com/vuejs/core/tree/main/packages/sfc-playground"
          target="_blank"
        >
          <GitHub />
        </a>
      </button>
    </div>
  </nav>
</template>

<style>
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --btn: #666;
  --highlight: #333;
  --green: #3ca877;
  --purple: #904cbc;
  --btn-bg: #eee;

  color: var(--base);
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  background-color: var(--bg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}

.dark nav {
  --base: #ddd;
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --highlight: #fff;
  --btn-bg: #333;

  box-shadow: none;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-weight: 500;
  display: inline-flex;
  place-items: center;
}

h1 img {
  height: 24px;
  margin-right: 10px;
}

@media (max-width: 560px) {
  h1 span {
    font-size: 0.9em;
  }
}

@media (max-width: 520px) {
  h1 span {
    display: none;
  }
}

.links {
  display: flex;
}

.version {
  margin-right: 12px;
  position: relative;
}

.active-version {
  cursor: pointer;
  position: relative;
  display: inline-flex;
  place-items: center;
}

.active-version .number {
  color: var(--green);
  margin-left: 4px;
}

.active-version::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #aaa;
  margin-left: 8px;
}

.toggle-dev span,
.toggle-ssr span {
  font-size: 12px;
  border-radius: 4px;
  padding: 4px 6px;
}

.toggle-dev span {
  background: var(--purple);
  color: #fff;
}

.toggle-dev.dev span {
  background: var(--green);
}

.toggle-ssr span {
  background-color: var(--btn-bg);
}

.toggle-ssr.enabled span {
  color: #fff;
  background-color: var(--green);
}

.toggle-dark svg {
  width: 18px;
  height: 18px;
}

.toggle-dark .dark,
.dark .toggle-dark .light {
  display: none;
}

.dark .toggle-dark .dark {
  display: inline-block;
}

.links button,
.links button a {
  color: var(--btn);
}

.links button:hover,
.links button:hover a {
  color: var(--highlight);
}

.version:hover .active-version::after {
  border-top-color: var(--btn);
}

.dark .version:hover .active-version::after {
  border-top-color: var(--highlight);
}

.versions {
  display: none;
  position: absolute;
  left: 0;
  top: 40px;
  background-color: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 4px;
  list-style-type: none;
  padding: 8px;
  margin: 0;
  width: 200px;
  max-height: calc(100vh - 70px);
  overflow: scroll;
}

.versions a {
  display: block;
  padding: 6px 12px;
  text-decoration: none;
  cursor: pointer;
  color: var(--base);
}

.versions a:hover {
  color: var(--green);
}

.versions.expanded {
  display: block;
}

.links > * {
  display: flex;
  align-items: center;
}

.links > * + * {
  margin-left: 4px;
}
</style>
