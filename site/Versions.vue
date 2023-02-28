<script setup lang="ts">
import type { PropType } from 'vue'
import { onMounted, ref } from 'vue'

const props = defineProps({
  set: {
    type: Function as PropType<(v: string) => Promise<void>>,
    required: true,
  },
  reset: {
    type: Function as PropType<() => void>,
    required: true,
  },
  repo: {
    type: String,
    required: true,
  },
  filtered: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },
})

const activeVersion = ref('latest')
const publishedVersions = ref<string[]>()
const expanded = ref(false)

async function toggle() {
  expanded.value = !expanded.value
  if (!publishedVersions.value) {
    publishedVersions.value = await fetchVersions()
  }
}

async function setVersion(v: string) {
  activeVersion.value = 'loading...'
  await props.set(v)
  activeVersion.value = `v${v}`
  expanded.value = false
}

function resetVersion() {
  props.reset()
  activeVersion.value = 'latest'
  expanded.value = false
}

onMounted(async () => {
  window.addEventListener('click', () => {
    expanded.value = false
  })
  window.addEventListener('blur', () => {
    if (document.activeElement?.tagName === 'IFRAME') {
      expanded.value = false
    }
  })
})

async function fetchVersions(): Promise<string[]> {
  const res = await fetch(
      `https://api.github.com/repos/${props.repo}/releases?per_page=100`,
  )
  const releases: any[] = await res.json()
  const versions = releases.map(r =>
    r.tag_name.startsWith('v') ? r.tag_name.slice(1) : r.tag_name,
  )
  // if the latest version is a pre-release, list all current pre-releases
  // otherwise filter out pre-releases
  let isInPreRelease = versions[0].includes('-')
  const filteredVersions: string[] = []
  for (const v of versions) {
    if (v.includes('-')) {
      if (isInPreRelease) {
        filteredVersions.push(v)
      }
    }
    else {
      filteredVersions.push(v)
      isInPreRelease = false
    }
    if (filteredVersions.length >= 30 || [...(props?.filtered || [])].includes(v)) { break }
  }
  return filteredVersions
}
</script>

<template>
  <form class="version" @click.stop>
    <span class="active-version" @click="toggle">
      <slot />
      <span class="number">{{ activeVersion }}</span>
    </span>
    <ul class="versions" :class="{ expanded }">
      <li class="title">
        <b>{{ props.repo }}</b> versions
      </li>
      <li v-if="!publishedVersions">
        <a>loading versions...</a>
      </li>
      <li v-for="version of publishedVersions" :key="version">
        <a @click="setVersion(version)">v{{ version }}</a>
      </li>
      <li>
        <a @click="resetVersion">Latest</a>
      </li>
      <li>
        <a
          href="https://app.netlify.com/sites/vue-sfc-playground/deploys"
          target="_blank"
        >Commits History</a>
      </li>
    </ul>
  </form>
</template>

<style>
.version svg {
  filter: grayscale(40%) saturate(125%);
}

.version:hover .active-version::after {
  border-top-color: var(--btn);
}

.dark .version:hover .active-version::after {
  border-top-color: var(--highlight);
}

@media (max-width: 720px) {
  .version {
    display: none;
  }
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

.versions .title {
  margin: 0.5rem;
}
</style>
