import { reactive, version, watchEffect } from 'vue'
import * as defaultCompiler from 'vue/compiler-sfc'
import * as pinceauUtils from 'pinceau/utils'
import { compileFile } from './transform'
import { atou, utoa } from './utils'
import { File } from './file'
import { PINCEAU_VERSION, buttonComponent, defaultComponent, defaultComponentFile, defaultMainFile, defaultTheme, defaultThemeFile } from './defaults'
import type { OutputModes, SFCOptions, Store, StoreOptions, StoreState } from './types'

export class ReplStore implements Store {
  state: StoreState
  compiler = defaultCompiler
  pinceauUtils = pinceauUtils
  vueVersion?: string
  pinceauVersion?: string
  options?: SFCOptions
  initialShowOutput: boolean
  initialOutputMode: OutputModes

  private defaultVueRuntimeURL: string
  private defaultVueServerRendererURL: string
  private defaultPinceauURL: string
  private defaultPinceauUtilsURL: string
  private defaultPinceauRuntimeURL: string
  private defaultPinceauVolarURL: string
  private pendingCompiler: Promise<any> | null = null
  private pendingUtils: Promise<any> | null = null

  constructor({
    serializedState = '',
    head = [],
    defaultVueRuntimeURL = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`,
    defaultVueServerRendererURL = `https://unpkg.com/@vue/server-renderer@${version}/dist/server-renderer.esm-browser.js`,
    defaultPinceauURL = `https://unpkg.com/pinceau@${PINCEAU_VERSION}/dist/browser/index.js`,
    defaultPinceauUtilsURL = `https://unpkg.com/pinceau@${PINCEAU_VERSION}/dist/browser/utils.js`,
    defaultPinceauRuntimeURL = `https://unpkg.com/pinceau@${PINCEAU_VERSION}/dist/browser/runtime.js`,
    defaultPinceauVolarURL = `https://unpkg.com/pinceau@${PINCEAU_VERSION}/dist/browser/volar.js`,
    showOutput = false,
    outputMode = 'preview',
  }: StoreOptions = {}) {
    let files: StoreState['files'] = {}

    // Try to deserialize state from URL
    let resolvedState: any
    if (serializedState) {
      resolvedState = atou(serializedState)
      if (resolvedState) {
        const saved = JSON.parse(resolvedState)
        for (const filename in saved) {
          files[filename] = new File(filename, saved[filename])
        }
      }
      history.replaceState(null, '', window.location.pathname)
    }

    // No state deserialized, add default files
    if (!resolvedState) {
      files = {
        [defaultThemeFile]: new File(defaultThemeFile, defaultTheme),
        [defaultMainFile]: new File(defaultMainFile, defaultComponent),
        [defaultComponentFile]: new File(defaultComponentFile, buttonComponent),
      }
    }

    this.defaultVueRuntimeURL = defaultVueRuntimeURL
    this.defaultVueServerRendererURL = defaultVueServerRendererURL
    this.defaultPinceauRuntimeURL = defaultPinceauRuntimeURL
    this.defaultPinceauVolarURL = defaultPinceauVolarURL
    this.defaultPinceauUtilsURL = defaultPinceauUtilsURL
    this.defaultPinceauURL = defaultPinceauURL
    this.initialShowOutput = showOutput
    this.initialOutputMode = outputMode as OutputModes

    let mainFile = defaultMainFile
    if (!files[mainFile]) { mainFile = Object.keys(files)[0] }
    this.state = reactive({
      mainFile,
      files,
      activeFile: files[mainFile],
      errors: [],
      head,
      vueRuntimeURL: this.defaultVueRuntimeURL,
      vueServerRendererURL: this.defaultVueServerRendererURL,
      pinceauRuntimeURL: this.defaultPinceauRuntimeURL,
      pinceauUtilsURL: this.defaultPinceauUtilsURL,
      pinceauVolarURL: this.defaultPinceauVolarURL,
      pinceauURL: this.defaultPinceauURL,
      resetFlip: true,
    })

    this.initImportMap()
  }

  // don't start compiling until the options are set
  init() {
    watchEffect(() => compileFile(this, this.state.activeFile))
    for (const file in this.state.files) {
      if (file !== defaultMainFile) {
        compileFile(this, this.state.files[file])
      }
    }
  }

  setActive(filename: string) {
    this.state.activeFile = this.state.files[filename]
  }

  addFile(fileOrFilename: string | File): void {
    const file
      = typeof fileOrFilename === 'string'
        ? new File(fileOrFilename)
        : fileOrFilename
    this.state.files[file.filename] = file
    if (!file.hidden) { this.setActive(file.filename) }
  }

  deleteFile(filename: string) {
    // eslint-disable-next-line no-alert
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      if (this.state.activeFile.filename === filename) {
        this.state.activeFile = this.state.files[this.state.mainFile]
      }
      delete this.state.files[filename]
    }
  }

  serialize() {
    return `#${utoa(JSON.stringify(this.getFiles()))}`
  }

  getFiles() {
    const exported: Record<string, string> = {}
    for (const filename in this.state.files) {
      exported[filename] = this.state.files[filename].code
    }
    return exported
  }

  async setFiles(newFiles: Record<string, string>, mainFile = defaultMainFile) {
    const files: Record<string, File> = {}
    if (mainFile === defaultMainFile && !newFiles[mainFile]) {
      files[mainFile] = new File(mainFile, defaultComponent)
    }
    for (const filename in newFiles) {
      files[filename] = new File(filename, newFiles[filename])
    }
    for (const file in files) {
      await compileFile(this, files[file])
    }
    this.state.mainFile = defaultMainFile
    this.state.files = files
    this.initImportMap()
    this.setActive(mainFile)
    this.forceSandboxReset()
  }

  private forceSandboxReset() {
    this.state.resetFlip = !this.state.resetFlip
  }

  private initImportMap() {
    const map = this.state.files['import-map.json']
    if (!map) {
      this.state.files['import-map.json'] = new File(
        'import-map.json',
        JSON.stringify(
          {
            imports: {
              'vue': this.defaultVueRuntimeURL,
              'vue/server-renderer': this.defaultVueServerRendererURL,
              'pinceau': this.defaultPinceauURL,
              'pinceau/runtime': this.defaultPinceauRuntimeURL,
            },
            head: [
              '<link rel="stylesheet" href="https://unpkg.com/@unocss/reset/tailwind.css" />',
            ],
          },
          null,
          2,
        ),
      )
    }
    else {
      try {
        const json = JSON.parse(map.code)

        // Add Pinceau imports proxy
        if (!json.imports.pinceau) {
          json.imports.pinceau = this.defaultPinceauURL
          map.code = JSON.stringify(json, null, 2)
        }

        // Add Pinceau runtime imports proxy
        if (!json.imports['pinceau/runtime']) {
          json.imports['pinceau/runtime'] = this.defaultPinceauRuntimeURL
          map.code = JSON.stringify(json, null, 2)
        }

        // Regular Vue imports
        if (!json.imports.vue) {
          json.imports.vue = this.defaultVueRuntimeURL
          map.code = JSON.stringify(json, null, 2)
        }
        if (!json.imports['vue/server-renderer']) {
          json.imports['vue/server-renderer'] = this.defaultVueServerRendererURL
          map.code = JSON.stringify(json, null, 2)
        }
      }
      catch (e) {
        //
      }
    }
  }

  getImportMap() {
    try {
      return JSON.parse(this.state.files['import-map.json'].code)
    }
    catch (e) {
      this.state.errors = [
        `Syntax error in import-map.json: ${(e as Error).message}`,
      ]
      return {}
    }
  }

  setImportMap(map: {
    imports: Record<string, string>
    scopes?: Record<string, Record<string, string>>
  }) {
    this.state.files['import-map.json']!.code = JSON.stringify(map, null, 2)
  }

  async setVueVersion(version: string) {
    this.vueVersion = version
    const compilerUrl = `https://unpkg.com/@vue/compiler-sfc@${version}/dist/compiler-sfc.esm-browser.js`
    const runtimeUrl = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`
    const ssrUrl = `https://unpkg.com/@vue/server-renderer@${version}/dist/server-renderer.esm-browser.js`
    this.pendingCompiler = import(/* @vite-ignore */ compilerUrl)
    this.compiler = await this.pendingCompiler
    this.pendingCompiler = null
    this.state.vueRuntimeURL = runtimeUrl
    this.state.vueServerRendererURL = ssrUrl
    const importMap = this.getImportMap()
    const imports = importMap.imports || (importMap.imports = {})
    imports.vue = runtimeUrl
    imports['vue/server-renderer'] = ssrUrl
    this.setImportMap(importMap)
    this.forceSandboxReset()
    console.info(`[@vue/repl] Now using Vue version: ${version}`)
  }

  async setPinceauVersion(version: string) {
    this.pinceauVersion = version
    const newPinceauURL = `https://unpkg.com/pinceau@${version}/dist/browser/index.js`
    const newPinceauUtilsURL = `https://unpkg.com/pinceau@${version}/dist/browser/utils.js`
    const newPinceauRuntimeURL = `https://unpkg.com/pinceau@${version}/dist/browser/runtime.js`
    const newPinceauVolarURL = `https://unpkg.com/pinceau@${version}/dist/browser/volar.js`
    this.pendingUtils = import(/* @vite-ignore */ newPinceauUtilsURL)
    this.pinceauUtils = await this.pendingUtils
    this.pendingUtils = null
    this.state.pinceauRuntimeURL = newPinceauRuntimeURL
    this.state.pinceauURL = newPinceauURL
    this.state.pinceauUtilsURL = newPinceauUtilsURL
    this.state.pinceauVolarURL = newPinceauVolarURL
    const importMap = this.getImportMap()
    const imports = importMap.imports || (importMap.imports = {})
    imports.pinceau = newPinceauURL
    imports['pinceau/runtime'] = newPinceauRuntimeURL
    imports['pinceau/utils'] = newPinceauUtilsURL
    imports['pinceau/volar'] = newPinceauVolarURL
    this.setImportMap(importMap)
    this.forceSandboxReset()
    console.info(`[@vue/repl] Now using Pinceau version: ${version}`)
  }

  resetPinceauVersion() {
    this.pinceauVersion = undefined
    const importMap = this.getImportMap()
    const imports = importMap.imports || (importMap.imports = {})
    this.state.pinceauURL = this.defaultPinceauURL
    this.state.pinceauRuntimeURL = this.defaultPinceauRuntimeURL
    this.state.pinceauUtilsURL = this.defaultPinceauUtilsURL
    this.state.pinceauVolarURL = this.defaultPinceauVolarURL
    imports.pinceau = this.defaultPinceauURL
    imports['pinceau/runtime'] = this.defaultPinceauRuntimeURL
    imports['pinceau/utils'] = this.defaultPinceauUtilsURL
    imports['pinceau/volar'] = this.defaultPinceauVolarURL
    this.setImportMap(importMap)
    this.forceSandboxReset()
    console.info('[@vue/repl] Now using default Pinceau version')
  }

  resetVueVersion() {
    this.vueVersion = undefined
    this.compiler = defaultCompiler
    this.state.vueRuntimeURL = this.defaultVueRuntimeURL
    this.state.vueServerRendererURL = this.defaultVueServerRendererURL
    const importMap = this.getImportMap()
    const imports = importMap.imports || (importMap.imports = {})
    imports.vue = this.defaultVueRuntimeURL
    imports['vue/server-renderer'] = this.defaultVueServerRendererURL
    this.setImportMap(importMap)
    this.forceSandboxReset()
    console.info('[@vue/repl] Now using default Vue version')
  }
}
