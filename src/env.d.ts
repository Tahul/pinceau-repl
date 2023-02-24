/// <reference types="vite/client" />

declare const __COMMIT__: string

declare const __VUE_PROD_DEVTOOLS__: string

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const comp: ComponentOptions
  export default comp
}
