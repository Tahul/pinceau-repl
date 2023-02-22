import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker';
import vueWorker from 'monaco-volar/vue.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";

// Avoid HMR breakings
let onigasmReady = false;
export function loadWasm() {
  if (onigasmReady) return
  const wasmImport = onigasm.loadWASM(onigasmWasm);
  onigasmReady = true;
  return wasmImport
}

export function loadMonacoEnv() {
  (self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === 'vue') return new vueWorker();
      if (label === 'json') { return new jsonWorker() }
      if (label === 'css' || label === 'scss' || label === 'less') { return new cssWorker() }
      if (label === 'html') { return new htmlWorker() }
      if (label === 'typescript' || label === 'javascript') { return new tsWorker() }
      return new editorWorker();
    },
  };
}
