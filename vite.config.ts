import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import preview from 'vite-plugin-vue-component-preview'
import { env, node, nodeless } from 'unenv'

const unenv = env(node, nodeless)

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

const define = {
  '__filename': undefined,
  'process.env': {},
  'process.version': {},
  '__VUE_PROD_DEVTOOLS__': JSON.stringify(true),
}

export default defineConfig({
  plugins: [preview(), vue(), genStub],
  define,
  optimizeDeps: {
    include: [
      'onigasm',
      'vscode-uri',
    ],
  },
  resolve: {
    alias: {
      ...unenv.alias,
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
      external: [
        'vue',
        'vue/compiler-sfc',
        'pinceau/runtime',
        'source-map-js',
        'fs',
        'jiti',
        'pinceau',
        'monaco',
        'monaco-textmate',
        'monaco-editor',
        'monaco-editor-core',
        'monaco-editor-textmate',
        'monaco-volar',
        'onigasm',
        '@volar/monaco',
      ],
    },
  },
})
