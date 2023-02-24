import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { env, node, nodeless } from 'unenv'

const { alias } = env(node, nodeless)

const genStub: Plugin = {
  name: 'gen-stub',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'ssr-stub.js',
      source: 'module.exports = {}',
    })
  },
}

export default defineConfig({
  plugins: [vue(), genStub],
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      'onigasm',
      'vscode-uri',
    ],
  },
  resolve: {
    alias: {
      ...alias,
      'source-map-js': 'node_modules/source-map-js/source-map.js',
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => '[name].js',
    },

    rollupOptions: {
      input: {
        'pinceau-repl': './src/index.ts',
        'pinceau-repl-monaco-editor': './src/editor/MonacoEditor.vue',
      },
      external: ['vue', 'vue/compiler-sfc', 'pinceau/runtime', 'source-map-js', 'fs', 'jiti', 'pinceau'],
    },
  },
})
