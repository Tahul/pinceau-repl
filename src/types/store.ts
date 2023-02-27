import type * as defaultCompiler from 'vue/compiler-sfc'
import type { File } from '../file'
import type { OutputModes } from './output'

export interface StoreState {
  mainFile: string
  files: Record<string, File>
  activeFile: File
  errors: (string | Error)[]
  vueRuntimeURL: string
  vueServerRendererURL: string
  pinceauRuntimeURL: string
  pinceauUtilsURL: string
  pinceauURL: string
  head: string[]
  // used to force reset the sandbox
  resetFlip: boolean
}

export interface SFCOptions {
  script?: Omit<defaultCompiler.SFCScriptCompileOptions, 'id'>
  style?: defaultCompiler.SFCAsyncStyleCompileOptions
  template?: defaultCompiler.SFCTemplateCompileOptions
}

export interface Store {
  state: StoreState
  options?: SFCOptions
  compiler: typeof defaultCompiler
  vueVersion?: string
  pinceauVersion?: string
  init: () => void
  setActive: (filename: string) => void
  addFile: (filename: string | File) => void
  deleteFile: (filename: string) => void
  getImportMap: () => any
  initialShowOutput: boolean
  initialOutputMode: OutputModes
}

export interface StoreOptions {
  serializedState?: string
  showOutput?: boolean
  head?: string[]

  // loose type to allow getting from the URL without inducing a typing error
  outputMode?: OutputModes | string

  // Runtime proxies
  defaultVueRuntimeURL?: string
  defaultVueServerRendererURL?: string
  defaultPinceauURL?: string
  defaultPinceauUtilsURL?: string
  defaultPinceauRuntimeURL?: string
  defaultPinceauVolarURL?: string
}
