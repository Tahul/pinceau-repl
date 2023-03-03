import * as onigasm from 'onigasm'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'
import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import type { LanguageService } from '@volar/vue-language-service'
import { editor, languages, Uri } from 'monaco-editor-core'
import * as volar from '@volar/monaco'
import { createDtsHost } from '@volar/monaco/worker'
import VueWorker from './vue.worker?worker'

export function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm)
}

export function setupMonacoEnv(
  takeoverMode = false,
) {
  let initialized = false

  languages.register({ id: 'vue', extensions: ['.vue'] })
  languages.onLanguage('vue', setup)

  if (takeoverMode) {
    languages.onLanguage('javascript', setup)
    languages.onLanguage('typescript', setup)
    languages.onLanguage('javascriptreact', setup)
    languages.onLanguage('typescriptreact', setup)
    languages.onLanguage('json', setup)
  }

  async function setup() {
    if (initialized) { return }
    initialized = true

    ;(self as any).MonacoEnvironment ??= {}
    ;(self as any).MonacoEnvironment.getWorker ??= () => new EditorWorker()

    const getWorker = (self as any).MonacoEnvironment.getWorker

      ; (self as any).MonacoEnvironment.getWorker = (_: any, label: string) => {
      // const theme = store.state.files['tokens.config.ts'].compiled.ts
      // const utils = store.state.files['tokens.config.ts'].compiled.utils
        if (label === 'vue') {
        console.log(VueWorker)
        const worker = new VueWorker()
        // worker.postMessage(JSON.stringify({ theme, utils }))
        return worker
      }
      return getWorker()
    }

    const dtsHost = createDtsHost(
      'https://unpkg.com/',
      (fileName, text) => {
        console.log(fileName, text?.length)
        // if (fileName.endsWith('.json')) { getOrCreateModel(Uri.file(fileName), 'json', text) }
        // else { getOrCreateModel(Uri.file(fileName), 'typescript', text) }
      }
    )
    // dtsServer.files.set('/node_modules/#pinceau/theme.d.ts', data.theme)
    // dtsServer.files.set('/node_modules/#pinceau/utils.d.ts', data.utils)
    // dtsServer.files.set('/node_modules/#pinceau/utils/index.d.ts', data.utils)
    // dtsServer.files.set('/node_modules/#pinceau/package.json', '{ "name": "#pinceau" }')

    console.log('setup')

    const worker = editor.createWebWorker<LanguageService>({
      moduleId: 'vs/language/vue/vueWorker',
      label: 'vue',
      createData: {},
      host: dtsHost,
    })
    const languageId = takeoverMode
      ? [
          'vue',
          'javascript',
          'typescript',
          'javascriptreact',
          'typescriptreact',
          'json',
        ]
      : ['vue']

    const getSyncUris = () => [
      Uri.file('/App.vue'),
      Uri.file('/MyButton.vue'),
    ]
    volar.editor.activateMarkers(worker, languageId, 'vue', getSyncUris, editor)
    volar.editor.activateAutoInsertion(worker, languageId, getSyncUris, editor)
    await volar.languages.registerProvides(worker, languageId, getSyncUris, languages)
  }
}
