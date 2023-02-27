<script setup lang="ts">
import { inject, toRef } from 'vue'
import Message from '../Message.vue'
import { debounce } from '../utils'
import type { EditorComponentType, Store } from '../types'
import FileSelector from './FileSelector.vue'

const props = defineProps<{
  editorComponent: EditorComponentType
}>()

const EditorComponent = toRef(props, 'editorComponent')

const store = inject('store') as Store

const onChange = debounce((code: string) => store.state.activeFile.code = code, 500)
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
    <Message :err="store.state.errors[0]" />
  </div>
</template>

<style scoped>
.editor-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}
</style>
