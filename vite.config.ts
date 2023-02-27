import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import preview from 'vite-plugin-vue-component-preview'
import { env, node, nodeless } from 'unenv'

const { alias } = env(nodeless, node)

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
  plugins: [preview(), vue(), genStub],
  define: {
    '__filename': undefined,
    'process.env': '0',
    'process.platform': '0',
    'process.cwd': '() => \'\'',
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
        'vue-repl': './src/index.ts',
        'vue-repl-monaco-editor': './src/editor/MonacoEditor.vue',
      },
      external: ['vue', 'vue/compiler-sfc', 'source-map-js'],
    },
  },
})
