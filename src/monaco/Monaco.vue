<script lang="ts">
import { loadTheme } from 'monaco-volar'
import * as monaco from 'monaco-editor-core'
import * as onigasm from 'onigasm'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watchEffect } from 'vue'
import { getOrCreateModel } from './utils'
import { setupMonacoEnv } from './env'
import { loadGrammars } from './grammars'
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value?: string
  filename?: string
  language?: string
  readonly?: boolean
}>(), {
  value: '',
  readonly: false,
})
const emits = defineEmits<{
  (e: 'change', value: string): void
  (e: 'save', value: string): void
}>()
setupMonacoEnv(true)
onigasm.loadWASM(onigasmWasm)
const containerRef = ref<HTMLDivElement | null>()
const ready = ref(false)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined)

const currentModel = shallowRef<monaco.editor.ITextModel>(
  getOrCreateModel(
    monaco.Uri.parse(`file:///${props.filename}`),
    props.language,
    props.value ?? '',
  ),
)

watchEffect(() => (currentModel?.value?.getValue() !== props.value) && currentModel?.value?.setValue(props.value))

onBeforeUnmount(() => editor.value?.dispose())

onMounted(async () => await refreshEditor())

async function refreshEditor() {
  const theme = await loadTheme()
  ready.value = true
  await nextTick()

  if (!containerRef.value) { throw new Error('Cannot find containerRef') }

  const editorInstance = monaco.editor.create(containerRef.value, {
    theme,
    language: props.language,
    model: currentModel.value,
    readOnly: props.readonly,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    disableLayerHinting: true,
    inlineSuggest: {
      enabled: false,
    },
    inlayHints: {
      enabled: 'off',
    },
    codeLens: false,
  })

  editor.value = editorInstance

  loadGrammars(editorInstance)

  if (!props.readonly) {
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => emits('save', editorInstance.getValue()))
    editorInstance.onDidChangeModelContent(() => emits('change', editorInstance.getValue()))
  }
}
</script>

<template>
  <div ref="containerRef" class="editor" />
</template>

<style>
.editor {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
