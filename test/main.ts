import { createApp, h, watchEffect } from 'vue'
import { Repl, ReplStore } from '../src'
import MonacoEditor from '../src/editor/MonacoEditor.vue'

;(window as any).process = { env: {} }

const App = {
  setup() {
    const query = new URLSearchParams(location.search)
    const store = new ReplStore({
      serializedState: location.hash.slice(1),
      showOutput: query.has('so'),
      outputMode: query.get('om') || 'preview',
      defaultVueRuntimeURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/src/vue-dev-proxy`,
      defaultVueServerRendererURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/src/vue-server-renderer-dev-proxy`,
      defaultPinceauRuntimeURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/src/pinceau-runtime-proxy`,
      defaultPinceauURL: import.meta.env.PROD
        ? undefined
        : `${location.origin}/src/pinceau-proxy`
    })

    watchEffect(() => history.replaceState({}, '', store.serialize()))

    return () =>
      h(Repl, {
        store,
        editor: MonacoEditor,
        ssr: false
      })
  }
}

createApp(App).mount('#app')
