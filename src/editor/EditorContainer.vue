<script setup lang="ts">
import { computed, inject, toRef } from 'vue'
import Message from '../Message.vue'
import { debounce } from '../utils'
import type { EditorComponentType, Store } from '../types'
import FileSelector from './FileSelector.vue'

const props = defineProps<{
  editorComponent: EditorComponentType
}>()

const EditorComponent = toRef(props, 'editorComponent')

const store = inject('store') as Store

const onChange = debounce((code: string) => (store.state.activeFile.code = code), 500)

const motdLocalStorageKey = 'pinceau-repl-motd-dismissed'

const localStorageDismiss = computed(() => localStorage.getItem(motdLocalStorageKey))

const dismissMotd = () => localStorage.setItem(motdLocalStorageKey, 'true')
</script>

<template>
  <FileSelector />
  <div class="editor-container">
    <EditorComponent
      :key="store.state.activeFile.filename"
      :value="store.state.activeFile.code"
      :filename="store.state.activeFile.filename"
      @change="onChange"
    />
    <Message v-if="!localStorageDismiss" warn="true" @dismiss="dismissMotd">
      <div class="pinceau-motd">
        <img src="/head.svg">
        <div>
          <p>
            This sandbox is still work in progress.
          </p>
          <p>
            It misses <b><a href="https://pinceau.dev/styling/css-function#css-function" target="_blank">TypeScript support</a></b> and the <b><a href="https://marketplace.visualstudio.com/items?itemName=yaelguilloux.pinceau-vscode" target="_blank">Pinceau VSCode extension</a></b>.
          </p>
          <p>
            Learn more on the <b><a href="https://pinceau.dev" target="_blank">documentation</a></b>.
          </p>
        </div>
      </div>
    </Message>
    <Message :err="store.state.errors[0]" />
  </div>
</template>

<style lang="postcss" scoped>
.editor-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}

.pinceau-motd {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

:deep(img) {
  width: 48px;
  height: 48px;
}

:deep(a) {
  text-decoration: none;
  border: none;
}

:deep(a:visited) {
  color: inherit;
}
</style>
