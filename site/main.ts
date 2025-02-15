import { createApp, h } from 'vue'
import PreviewPlugin from 'vite-plugin-vue-component-preview/client'

import { Repl as ReplComponent, ReplStore } from '../src'
import MonacoEditor from '../src/editor/MonacoEditor.vue'
import App from './app.vue'
(window as any).process = { env: {} }

// @ts-expect-error Custom window property
window.VUE_DEVTOOLS_CONFIG = {
  defaultSelectedAppId: 'repl',
}

const Repl = {
  setup() {
    const query = new URLSearchParams(location.search)
    const store = new ReplStore({
      serializedState: location.hash.slice(1),
      showOutput: query.has('so'),
      outputMode: query.get('om') || 'preview',
      defaultVueRuntimeURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/vue-dev-proxy`,
      defaultVueServerRendererURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/vue-server-renderer-dev-proxy`,
      defaultPinceauURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/pinceau-proxy`,
      defaultPinceauRuntimeURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/pinceau-runtime-proxy`,
      defaultPinceauUtilsURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/pinceau-utils-proxy`,
      defaultPinceauVolarURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/pinceau-volar-proxy`,
    })

    return () =>
      h(ReplComponent, {
        store,
        editor: MonacoEditor,
        ssr: false,
      })
  },
}

const app = createApp(App)

app.use(PreviewPlugin)

app.component('PinceauRepl', Repl)

app.mount('#app')
