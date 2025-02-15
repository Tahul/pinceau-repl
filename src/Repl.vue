<script setup lang="ts">
import { computed, provide, toRef } from 'vue'
import SplitPane from './SplitPane.vue'
import Output from './output/Output.vue'
import ThemeOutput from './output/ThemeOutput.vue'
import { ReplStore } from './store'
import type { EditorComponentType, SFCOptions, Store } from './types'
import EditorContainer from './editor/EditorContainer.vue'
import MonacoEditor from './editor/MonacoEditor.vue'

export interface Props {
  store?: Store
  autoResize?: boolean
  showCompileOutput?: boolean
  showImportMap?: boolean
  clearConsole?: boolean
  sfcOptions?: SFCOptions
  layout?: string
  ssr?: boolean
  editor?: EditorComponentType
}

const props = withDefaults(defineProps<Props>(), {
  store: () => new ReplStore(),
  autoResize: true,
  showCompileOutput: true,
  showImportMap: true,
  clearConsole: true,
  ssr: false,
  editor: MonacoEditor,
})

// eslint-disable-next-line vue/no-mutating-props
props.store.options = props.sfcOptions
props.store.init()

provide('store', props.store)
provide('autoresize', props.autoResize)
provide('import-map', toRef(props, 'showImportMap'))
provide('clear-console', toRef(props, 'clearConsole'))

const isTheme = computed(() => (props.store.state.activeFile.filename === 'tokens.config.ts'))
</script>

<template>
  <div class="pinceau-repl">
    <SplitPane :layout="layout">
      <template #left>
        <EditorContainer :editor-component="editor" />
      </template>
      <template #right>
        <ThemeOutput
          v-if="isTheme"
          :show-compile-output="props.showCompileOutput"
          :ssr="!!props.ssr"
        />
        <Output
          :show-compile-output="props.showCompileOutput"
          :ssr="!!props.ssr"
        />
      </template>
    </SplitPane>
  </div>
</template>

<style scoped>
.pinceau-repl {
  --bg: #fff;
  --bg-soft: #f8f8f8;
  --border: #ddd;
  --text-light: #888;
  --font-code: Menlo, Monaco, Consolas, 'Courier New', monospace;
  --color-branding: #ED4D31;
  --color-branding-dark: #4560B0;
  --header-height: 38px;

  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  overflow: hidden;
  background-color: var(--bg-soft);
}

.dark .pinceau-repl {
  --bg: #1a1a1a;
  --bg-soft: #242424;
  --border: #383838;
  --text-light: #aaa;
  --color-branding: #F48E7C;
  --color-branding-dark: #7B8FCB;
}

:deep(button) {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
