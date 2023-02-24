import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import VueWorker from 'monaco-volar/vue.worker?worker'
import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import * as onigasm from 'onigasm'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'

// Avoid HMR breakings
let onigasmReady = false
export function loadWasm() {
  if (onigasmReady) { return }
  const wasmImport = onigasm.loadWASM(onigasmWasm)
  onigasmReady = true
  return wasmImport
}

export function loadMonacoEnv() {
  (self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === 'vue') { return new VueWorker() }
      if (label === 'json') { return new JSONWorker() }
      if (label === 'css' || label === 'scss' || label === 'less') { return new CSSWorker() }
      if (label === 'html') { return new HTMLWorker() }
      if (label === 'typescript' || label === 'javascript') { return new TSWorker() }
      return new EditorWorker()
    },
  }
}
