<script setup lang="ts">
import { computed } from 'vue'
import Monaco from '../monaco/Monaco.vue'

const props = defineProps<{
  value: string
  filename: string
  readonly?: boolean
}>()

const emits = defineEmits<{
  (e: 'change', code: string): void
}>()

const onChange = (code: string) => emits('change', code)

const language = computed(() => {
  const filename = props.filename
  if (filename.endsWith('.vue')) { return 'vue' }
  if (filename.endsWith('.html')) { return 'html' }
  if (filename.endsWith('.css')) { return 'css' }
  if (filename.endsWith('.ts')) { return 'typescript' }
  return 'javascript'
})
</script>

<template>
  <Monaco
    :value="value"
    :filename="filename"
    :language="language"
    @save="onChange"
    @change="onChange"
  />
</template>
