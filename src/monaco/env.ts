import * as onigasm from 'onigasm'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'
import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import type { LanguageService } from '@volar/vue-language-service'
import { editor, languages } from 'monaco-editor-core'
import * as volar from '@volar/monaco'
import type { Store } from '../types'
import { MyWorkerContextHost } from './host'
import VueWorker from './vue.worker?worker'

export function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm)
}

export function setupMonacoEnv(
  store: Store,
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
      const theme = store.state.files['tokens.config.ts'].compiled.ts
      const utils = store.state.files['tokens.config.ts'].compiled.utils
      if (label === 'vue') {
        const worker = new VueWorker()
        worker.postMessage(JSON.stringify({ theme, utils }))
        return worker
      }
      return getWorker()
    }

    const worker = editor.createWebWorker<LanguageService>({
      moduleId: 'vs/language/vue/vueWorker',
      label: 'vue',
      createData: {},
      host: new MyWorkerContextHost(),
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

    volar.editor.activateMarkers(worker, languageId, 'vue', editor)
    await volar.languages.registerProvides(worker, languageId, languages)
  }
}
