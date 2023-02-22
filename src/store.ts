import { version, reactive, watchEffect } from 'vue'
import * as defaultCompiler from 'vue/compiler-sfc'
import { compileFile } from './transform'
import { utoa, atou } from './utils'
import {
  SFCScriptCompileOptions,
  SFCAsyncStyleCompileOptions,
  SFCTemplateCompileOptions
} from 'vue/compiler-sfc'
import { OutputModes } from './output/types'

const defaultMainFile = 'App.vue'

const defaultThemeFile = 'tokens.config.ts'

const defaultComponentFile = 'MyButton.vue'

const defaultTheme = `import { defineTheme } from 'pinceau'
import type { PinceauTheme, ThemeTokens } from 'pinceau'

export default defineTheme({
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
  },

  font: {
    primary: 'Inter, sans-serif',
    secondary: 'PaytoneOne, serif',
  },

  color: {
    white: '#FFFFFF',
    black: '#191919',
    dimmed: 'rgba(0, 0, 0, .35)',
    dark: 'rgba(255, 255, 255, .15)',
    blue: {
      50: '#C5CDE8',
      100: '#B6C1E2',
      200: '#99A8D7',
      300: '#7B8FCB',
      400: '#5E77C0',
      500: '#4560B0',
      600: '#354A88',
      700: '#25345F',
      800: '#161E37',
      900: '#06080F',
    },
    red: {
      50: '#FCDFDA',
      100: '#FACFC7',
      200: '#F7AEA2',
      300: '#F48E7C',
      400: '#F06D57',
      500: '#ED4D31',
      600: '#D32F12',
      700: '#A0240E',
      800: '#6C1809',
      900: '#390D05',
    },
    green: {
      50: '#CDF4E5',
      100: '#BCF0DC',
      200: '#9AE9CB',
      300: '#79E2BA',
      400: '#57DAA8',
      500: '#36D397',
      600: '#26AB78',
      700: '#1B7D58',
      800: '#114F38',
      900: '#072117',
    },
    yellow: {
      50: '#FFFFFF',
      100: '#FFFFFF',
      200: '#FFFFFF',
      300: '#FFFFFF',
      400: '#FFFFFF',
      500: '#FBEFDE',
      600: '#F5D7AC',
      700: '#EFBE7A',
      800: '#E9A648',
      900: '#DE8D1B',
    },
    grey: {
      50: '#F7F7F7',
      100: '#EBEBEB',
      200: '#D9D9D9',
      300: '#C0C0C0',
      400: '#A8A8A8',
      500: '#979797',
      600: '#7E7E7E',
      700: '#656565',
      800: '#4D4D4D',
      900: '#2E2E2E',
    },
    primary: {
      100: {
        initial: '{color.red.100}',
        dark: '{color.red.900}',
      },
      200: {
        initial: '{color.red.200}',
        dark: '{color.red.800}',
      },
      300: {
        initial: '{color.red.300}',
        dark: '{color.red.700}',
      },
      400: {
        initial: '{color.red.400}',
        dark: '{color.red.600}',
      },
      500: {
        initial: '{color.red.500}',
        dark: '{color.red.500}',
      },
      600: {
        initial: '{color.red.600}',
        dark: '{color.red.400}',
      },
      700: {
        initial: '{color.red.700}',
        dark: '{color.red.300}',
      },
      800: {
        initial: '{color.red.800}',
        dark: '{color.red.200}',
      },
      900: {
        initial: '{color.red.900}',
        dark: '{color.red.100}',
      },
    },
  },

  shadow: {
    xs: '0 1px 2px 0 {color.grey.800}',
    sm: '0 1px 2px -1px {color.grey.800}, 0 1px 3px 0 {color.grey.800}',
    md: '0 2px 4px -2px {color.grey.800}, 0 4px 6px -1px {color.grey.800}',
    lg: '0 4px 6px -4px {color.grey.800}, 0 10px 15px -3px {color.grey.800}',
    xl: '0 8px 10px -6px {color.grey.800}, 0 20px 25px -5px {color.grey.800}',
    xxl: '0 25px 50px -12px {color.grey.800}',
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  fontSize: {
    'xs': '12px',
    'sm': '14px',
    'md': '16px',
    'lg': '18px',
    'xl': '20px',
    'xxl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },

  letterSpacing: {
    tighter: '-.05em',
    tight: '-0025em',
    normal: '0em',
    wide: '0025em',
    wider: '.05em',
    widest: '0.1em',
  },

  lead: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  radii: {
    '2xs': '0.125rem',
    'xs': '0.25rem',
    'sm': '0.375rem',
    'md': '0.5rem',
    'lg': '1rem',
    'xl': '1rem',
    'xxl': '1.5rem',
    'full': '9999px',
  },

  size: {
    4: '4px',
    6: '6px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    200: '200px',
  },

  space: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    44: '44px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    140: '140px',
    200: '200px',
  },

  borderWidth: {
    noBorder: '0',
    sm: '1px',
    md: '2px',
    lg: '3px',
  },

  opacity: {
    noOpacity: '0',
    bright: '0.1',
    light: '0.15',
    soft: '0.3',
    medium: '0.5',
    high: '0.8',
    total: '1',
  },

  zIndex: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    44: '44px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    140: '140px',
    200: '200px',
  },

  transition: {
    all: 'all .1s ease-in-out',
  },

  utils: {
    my: (v) => ({
      marginTop: v,
      marginBottom: v,
    }),
    mx: (v) => ({
      marginLeft: v,
      marginRight: v,
    }),
  },
})
`

const defaultComponent = `<script setup lang="ts">
import MyButton from './MyButton.vue'
</script>

<template>
    <MyButton>Hello World!</MyButton>
</template>`.trim()

const buttonComponent = `<script setup lang="ts">
import type { PinceauTheme } from 'pinceau'
import { computedStyle } from 'pinceau/runtime'

defineProps({
  color: computedStyle<keyof PinceauTheme['color']>('red'),
  ...variants,
})
</script>

<template>
    <button class="my-button">
      <span>
        Hello fellow painter 👋
      </span>
    </button>
</template>

<style scoped lang="ts">
css({
    '.my-button': {
        '--button-primary': (props) => \`{color.\${props.color}.600}\`,
        '--button-secondary': (props) => \`{color.\${props.color}.500}\`,
        display: 'inline-block',
        borderRadius: '{radii.xl}',
        transition: '{transition.all}',
        color: '{color.white}',
        boxShadow: \`0 5px 0 {button.primary}, 0 12px 16px {color.dimmed}\`,
        span: {
            display: 'inline-block',
            fontFamily: '{typography.font.display}',
            borderRadius: '{radii.lg}',
            fontSize: '{fontSize.xl}',
            lineHeight: '{lead.none}',
            transition: '{transition.all}',
            backgroundColor: '{button.primary}',
            boxShadow: 'inset 0 -1px 1px {color.dark}',
        },
        '&:hover': {
            span: {
                backgroundColor: '{button.secondary}',
            }
        },
        '&:active': {
            span: {
                transform: 'translateY({space.1})'
            }
        }
    },
    variants: {
        size: {
            sm: {
                span: {
                    padding: '{space.6} {space.8}'
                },
            },
            md: {
                span: {
                    padding: '{space.8} {space.12}'
                },
            },
            lg: {
                span: {
                    padding: '{space.12} {space.24}'
                },
            },
            options: {
                default: 'sm',
            },
        },
    },
})
</style>`

export class File {
  filename: string
  code: string
  hidden: boolean
  compiled = {
    js: '',
    ts: '',
    css: '',
    utils: '',
    utilsCode: '',
    definitions: '',
    schema: '',
    ssr: '',
    tokens: {}
  }

  constructor(filename: string, code = '', hidden = false) {
    this.filename = filename
    this.code = code
    this.hidden = hidden
  }
}

export interface StoreState {
  mainFile: string
  files: Record<string, File>
  activeFile: File
  errors: (string | Error)[]
  vueRuntimeURL: string
  vueServerRendererURL: string
  // used to force reset the sandbox
  resetFlip: boolean
}

export interface SFCOptions {
  script?: Omit<SFCScriptCompileOptions, 'id'>
  style?: SFCAsyncStyleCompileOptions
  template?: SFCTemplateCompileOptions
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
  // loose type to allow getting from the URL without inducing a typing error
  outputMode?: OutputModes | string
  defaultVueRuntimeURL?: string
  defaultVueServerRendererURL?: string
  defaultPinceauURL?: string
  defaultPinceauRuntimeURL?: string
}

export class ReplStore implements Store {
  state: StoreState
  compiler = defaultCompiler
  vueVersion?: string
  pinceauVersion?: string
  options?: SFCOptions
  initialShowOutput: boolean
  initialOutputMode: OutputModes

  private defaultVueRuntimeURL: string
  private defaultVueServerRendererURL: string
  private defaultPinceauURL: string
  private defaultPinceauRuntimeURL: string
  private pendingCompiler: Promise<any> | null = null

  constructor({
    serializedState = '',
    defaultVueRuntimeURL = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`,
    defaultVueServerRendererURL = `https://unpkg.com/@vue/server-renderer@${version}/dist/server-renderer.esm-browser.js`,
    defaultPinceauURL = `https://unpkg.com/pinceau@latest/dist/index.mjs`,
    defaultPinceauRuntimeURL = `https://unpkg.com/pinceau@latest/dist/runtime.mjs`,
    showOutput = false,
    outputMode = 'preview'
  }: StoreOptions = {}) {
    let files: StoreState['files'] = {}

    if (serializedState) {
      const saved = JSON.parse(atou(serializedState))
      for (const filename in saved) {
        files[filename] = new File(filename, saved[filename])
      }
    } else {
      files = {
        [defaultThemeFile]: new File(defaultThemeFile, defaultTheme),
        [defaultMainFile]: new File(defaultMainFile, defaultComponent),
        [defaultComponentFile]: new File(defaultComponentFile, buttonComponent)
      }
    }

    this.defaultVueRuntimeURL = defaultVueRuntimeURL
    this.defaultVueServerRendererURL = defaultVueServerRendererURL
    this.defaultPinceauRuntimeURL = defaultPinceauRuntimeURL
    this.defaultPinceauURL = defaultPinceauURL
    this.initialShowOutput = showOutput
    this.initialOutputMode = outputMode as OutputModes

    let mainFile = defaultMainFile
    if (!files[mainFile]) mainFile = Object.keys(files)[0]
    this.state = reactive({
      mainFile,
      files,
      activeFile: files[mainFile],
      errors: [],
      vueRuntimeURL: this.defaultVueRuntimeURL,
      vueServerRendererURL: this.defaultVueServerRendererURL,
      resetFlip: true
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
    const file =
      typeof fileOrFilename === 'string'
        ? new File(fileOrFilename)
        : fileOrFilename
    this.state.files[file.filename] = file
    if (!file.hidden) this.setActive(file.filename)
  }

  deleteFile(filename: string) {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      if (this.state.activeFile.filename === filename) {
        this.state.activeFile = this.state.files[this.state.mainFile]
      }
      delete this.state.files[filename]
    }
  }

  serialize() {
    return '#' + utoa(JSON.stringify(this.getFiles()))
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
    this.state.mainFile = mainFile
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
              vue: this.defaultVueRuntimeURL,
              pinceau: this.defaultPinceauURL,
              'pinceau/runtime': this.defaultPinceauRuntimeURL
            }
          },
          null,
          2
        )
      )
    } else {
      try {
        const json = JSON.parse(map.code)

        // Add Pinceau imports proxy
        if (!json.imports['pinceau']) {
          json.imports['pinceau'] = this.defaultPinceauURL
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
      } catch (e) {
        //
      }
    }
  }

  getImportMap() {
    try {
      return JSON.parse(this.state.files['import-map.json'].code)
    } catch (e) {
      this.state.errors = [
        `Syntax error in import-map.json: ${(e as Error).message}`
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
    console.info(`[@vue/repl] Now using default Vue version`)
  }
}
