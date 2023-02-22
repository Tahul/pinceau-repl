import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

const genStub: Plugin = {
  name: 'gen-stub',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'ssr-stub.js',
      source: `module.exports = {}`
    })
  }
}

export default defineConfig({
  plugins: [vue(), genStub],
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: [
      'onigasm'
    ],
  },
  resolve: {
    alias: {
      process: 'unenv/runtime/node/process/index',
      fs: 'unenv/runtime/node/fs/index',
      url: 'unenv/runtime/node/url/index',
      path: 'unenv/runtime/node/path/index',
			'source-map-js': 'node_modules/source-map-js/source-map.js',
    }
  },
  worker: {
    format: 'es'
  },
  build: {
    target: 'esnext',
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => '[name].js'
    },
    
    rollupOptions: {
      input: {
        'vue-repl': './src/index.ts',
        'vue-repl-monaco-editor': './src/editor/MonacoEditor.vue',
      },
      external: ['vue', 'vue/compiler-sfc', 'pinceau/runtime', 'source-map-js', 'fs']
    },
  }
})
