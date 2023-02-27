import path from 'path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { env, node, nodeless } from 'unenv'
import execa from 'execa'

const { alias } = env(node, nodeless)

const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

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
  root: path.resolve(__dirname, './site'),
  plugins: [vue(), genStub],
  define: {
    'process.env': {},
    'process.version': {},
    '__COMMIT__': JSON.stringify(commit),
    '__VUE_PROD_DEVTOOLS__': JSON.stringify(true),
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
    rollupOptions: {
      external: ['fs.realpath'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: './site/index.html',
      },
    },
  },
})
