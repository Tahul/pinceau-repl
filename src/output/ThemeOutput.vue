<script setup lang="ts">
import type { Store, ThemeOutputModes } from '../types'
import { inject, ref, computed } from 'vue'
import Preview from './Preview.vue'
import Monaco from '../monaco/Monaco.vue'

const props = defineProps<{
  showCompileOutput?: boolean
  ssr: boolean
}>()

const store = inject('store') as Store
const modes = computed(() =>
  props.showCompileOutput
    ? (['preview', 'css', 'ts', 'utils', 'definitions', 'schema'] as const)
    : (['preview'] as const)
)

const mode = ref<ThemeOutputModes>(
  (modes.value as readonly string[]).includes(store.initialOutputMode)
    ? store.initialOutputMode as ThemeOutputModes
    : 'preview'
)

const value = computed(() => {
  if (mode.value === 'preview') return ''
  return store.state.activeFile.compiled[mode.value]
})
</script>

<template>
  <div class="tab-buttons">
    <button
      v-for="m of modes"
      :class="{ active: mode === m }"
      @click="mode = m"
    >
      <span>{{ m }}</span>
    </button>
  </div>

  <div class="output-container">
    <Preview :show="mode === 'preview'" :ssr="ssr"/>
    <Monaco
      :language="mode === 'css' ? 'css' : 'typescript'"
      :readonly="true"
      :filename="store.state.activeFile.filename + '.' + mode"
      :key="store.state.activeFile.filename + '.' + mode"
      :value="value"
    />
  </div>
</template>

<style scoped>
.output-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}
.tab-buttons {
  box-sizing: border-box;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  height: var(--header-height);
  overflow: hidden;
}
.tab-buttons button {
  padding: 0;
  box-sizing: border-box;
}
.tab-buttons span {
  font-size: 13px;
  font-family: var(--font-code);
  text-transform: uppercase;
  color: var(--text-light);
  display: inline-block;
  padding: 8px 16px 6px;
  line-height: 20px;
}
button.active {
  color: var(--color-branding-dark);
  border-bottom: 3px solid var(--color-branding-dark);
}
</style>
