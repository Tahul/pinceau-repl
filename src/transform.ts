import type {
  BindingMetadata,
  CompilerOptions,
  SFCDescriptor,
} from 'vue/compiler-sfc'
import {
  MagicString,
  babelParse,
  shouldTransformRef,
  transformRef,
} from 'vue/compiler-sfc'
import { transform } from 'sucrase'
// @ts-ignore
import hashId from 'hash-sum'

// CSS Beautifier
// @ts-ignore
import { css as beautifyCss } from 'js-beautify'

// Pinceau's PostCSS Plugins
// @ts-ignore
import PostCSSCustomProperties from 'postcss-custom-properties'
// @ts-ignor
import PostCSSNested from 'postcss-nested'
// @ts-ignore
import PostCSSDarkThemeClass from 'postcss-dark-theme-class'
import type { Store } from './types'
import type { File } from './file'

export const COMP_IDENTIFIER = '__sfc__'

async function transformTS(src: string) {
  return transform(src, {
    transforms: ['typescript'],
  }).code
}

export async function compileFile(
  store: Store,
  { filename, code, compiled }: File,
) {
  const { defaultExport, visitAst, printAst, theme, createTokensHelper, transforms } = store.pinceauUtils

  if (!code.trim()) {
    store.state.errors = []
    return
  }

  // Get and compile tokens.config.ts file content
  if (filename === 'tokens.config.ts') {
    try {
      code = await transformTS(code)
      const defineThemeNode = defaultExport(babelParse(code, { sourceType: 'module' })) as any
      const themeExpression = defineThemeNode.arguments[0]
      // Eval utils to runtime from AST
      let utilsCode
      visitAst(
        themeExpression,
        {
          visitObjectProperty(node) {
            if (node?.parentPath?.parentPath?.name === 'root' && node.value.key.name === 'utils') {
              utilsCode = node.value.value
              return false
            }
            return this.traverse(node)
          },
        },
      )
      if (utilsCode) { utilsCode = printAst(utilsCode).code }
      code = printAst(themeExpression).code
      // eslint-disable-next-line no-eval
      const _eval = eval
      _eval(`var _tokensConfig = ${code}`)
      // @ts-ignore
      if (_tokensConfig) {
        const definitions = {}
        // @ts-ignore
        const builtTheme = await theme.generateTheme(_tokensConfig as any, definitions, { studio: true, definitions: true, colorSchemeMode: 'media' }, true, false)
        compiled.css = beautifyCss(builtTheme.outputs?.css)
        compiled.ts = builtTheme.outputs?.ts
        compiled.definitions = builtTheme.outputs?.definitions
        compiled.schema = builtTheme.outputs?.schema
        compiled.utils = builtTheme.outputs?.utils
        compiled.tokens = builtTheme?.tokens
        compiled.utilsCode = utilsCode || '{}'
      }
    }
    catch (e) {
      console.log({ e })
    }
    return
  }

  if (filename.endsWith('.css')) {
    compiled.css = beautifyCss(code)
    store.state.errors = []
    return
  }

  if (filename.endsWith('.js') || filename.endsWith('.ts')) {
    if (shouldTransformRef(code)) {
      code = transformRef(code, { filename }).code
    }
    if (filename.endsWith('.ts')) {
      code = await transformTS(code)
    }
    compiled.js = compiled.ssr = code
    store.state.errors = []
    return
  }

  if (!filename.endsWith('.vue')) {
    store.state.errors = []
    return
  }

  // Transform a Vue component with Pinceau transformers
  const pinceauOutputs = store?.state?.files?.['tokens.config.ts']
  const tokens = pinceauOutputs?.compiled?.tokens || {}
  const $tokens = createTokensHelper(tokens, { key: 'variable' })
  // Eval utils
  // eslint-disable-next-line no-eval
  const __eval = eval
  __eval(`var _pinceauThemeUtils = ${pinceauOutputs?.compiled?.utilsCode || '{}'}`)
  // @ts-ignore
  const pinceauUtils = _pinceauThemeUtils || {}
  code = transforms.replaceStyleTs(code, filename)
  const magicString = new MagicString(code, { filename }) as any
  const pinceauTransformed = transforms.transformVueSFC(code, { id: filename } as any, magicString, { utils: pinceauUtils, $tokens, runtime: true, options: { runtime: true } } as any)
  const id = hashId(filename)
  const { errors, descriptor } = store.compiler.parse(pinceauTransformed?.magicString?.toString() || pinceauTransformed?.code || code, {
    filename,
    sourceMap: true,
  })
  if (errors.length) {
    store.state.errors = errors
    return
  }

  if (
    descriptor.styles.some(s => !['postcss', 'ts', 'none'].includes(s?.lang || 'none'))
    || (descriptor.template && descriptor.template.lang)
  ) {
    store.state.errors = ['Only no lang, lang="ts" or lang="postcss" is supported for <style> blocks.']
    return
  }

  const scriptLang
    = (descriptor.script && descriptor.script.lang)
    || (descriptor.scriptSetup && descriptor.scriptSetup.lang)
  const isTS = scriptLang === 'ts'
  if (scriptLang && !isTS) {
    store.state.errors = ['Only lang="ts" is supported for <script> blocks.']
    return
  }

  const hasScoped = descriptor.styles.some(s => s.scoped)
  let clientCode = ''
  let ssrCode = ''

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  const clientScriptResult = await doCompileScript(
    store,
    descriptor,
    id,
    false,
    isTS,
  )
  if (!clientScriptResult) {
    return
  }
  const [clientScript, bindings] = clientScriptResult
  clientCode += clientScript

  // script ssr only needs to be performed if using <script setup> where
  // the render fn is inlined.
  if (descriptor.scriptSetup) {
    const ssrScriptResult = await doCompileScript(
      store,
      descriptor,
      id,
      true,
      isTS,
    )
    if (ssrScriptResult) {
      ssrCode += ssrScriptResult[0]
    }
    else {
      ssrCode = `/* SSR compile error: ${store.state.errors[0]} */`
    }
  }
  else {
    // when no <script setup> is used, the script result will be identical.
    ssrCode += clientScript
  }

  // template
  // only need dedicated compilation if not using <script setup>
  if (
    descriptor.template
    && (!descriptor.scriptSetup || store.options?.script?.inlineTemplate === false)
  ) {
    const clientTemplateResult = await doCompileTemplate(
      store,
      descriptor,
      id,
      bindings,
      false,
      isTS,
    )
    if (!clientTemplateResult) {
      return
    }
    clientCode += clientTemplateResult

    const ssrTemplateResult = await doCompileTemplate(
      store,
      descriptor,
      id,
      bindings,
      true,
      isTS,
    )
    if (ssrTemplateResult) {
      // ssr compile failure is fine
      ssrCode += ssrTemplateResult
    }
    else {
      ssrCode = `/* SSR compile error: ${store.state.errors[0]} */`
    }
  }

  if (hasScoped) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`,
    )
  }

  if (clientCode || ssrCode) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}`
      + `\nexport default ${COMP_IDENTIFIER}`,
    )
    compiled.js = clientCode.trimStart()
    compiled.ssr = ssrCode.trimStart()
  }

  // styles
  let css = ''
  for (const style of descriptor.styles) {
    if (style.module) {
      store.state.errors = [
        '<style module> is not supported in the playground.',
      ]
      return
    }

    const styleResult = store.compiler.compileStyle({
      ...store.options?.style,
      source: style.content,
      filename,
      id,
      scoped: style.scoped,
      postcssPlugins: [
        PostCSSCustomProperties,
        PostCSSDarkThemeClass,
        PostCSSNested,
      ],
    })

    if (styleResult.errors.length) {
      // postcss uses pathToFileURL which isn't polyfilled in the browser
      // ignore these errors for now
      if (!styleResult.errors[0].message.includes('pathToFileURL')) {
        store.state.errors = styleResult.errors
      }
      // proceed even if css compile errors
    }
    else {
      css += `${styleResult.code}\n`
    }
  }
  if (css) {
    compiled.css = beautifyCss(css.trim())
  }
  else {
    compiled.css = '/* No <style> tags present */'
  }

  // clear errors
  store.state.errors = []

  return compiled
}

async function doCompileScript(
  store: Store,
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean,
  isTS: boolean,
): Promise<[string, BindingMetadata | undefined] | undefined> {
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const expressionPlugins: CompilerOptions['expressionPlugins'] = isTS
        ? ['typescript']
        : undefined
      const compiledScript = store.compiler.compileScript(descriptor, {
        inlineTemplate: true,
        ...store.options?.script,
        id,
        templateOptions: {
          ...store.options?.template,
          ssr,
          ssrCssVars: descriptor.cssVars,
          compilerOptions: {
            ...store.options?.template?.compilerOptions,
            expressionPlugins,
          },
        },
      })
      let code = ''
      if (compiledScript.bindings) {
        code += `\n/* Analyzed bindings: ${JSON.stringify(
          compiledScript.bindings,
          null,
          2,
        )} */`
      }
      code
        += `\n${
         store.compiler.rewriteDefault(
          compiledScript.content,
          COMP_IDENTIFIER,
          expressionPlugins,
        )}`

      if ((descriptor.script || descriptor.scriptSetup)!.lang === 'ts') {
        code = await transformTS(code)
      }

      return [code, compiledScript.bindings]
    }
    catch (e: any) {
      store.state.errors = [e.stack.split('\n').slice(0, 12).join('\n')]
    }
  }
  else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

async function doCompileTemplate(
  store: Store,
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean,
  isTS: boolean,
) {
  const templateResult = store.compiler.compileTemplate({
    ...store.options?.template,
    source: descriptor.template!.content,
    filename: descriptor.filename,
    id,
    scoped: descriptor.styles.some(s => s.scoped),
    slotted: descriptor.slotted,
    ssr,
    ssrCssVars: descriptor.cssVars,
    isProd: false,
    compilerOptions: {
      ...store.options?.template?.compilerOptions,
      bindingMetadata,
      expressionPlugins: isTS ? ['typescript'] : undefined,
    },
  })
  if (templateResult.errors.length) {
    store.state.errors = templateResult.errors
    return
  }

  const fnName = ssr ? 'ssrRender' : 'render'

  let code
    = `\n${templateResult.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      `$1 ${fnName}`,
    )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`

  if ((descriptor.script || descriptor.scriptSetup)?.lang === 'ts') {
    code = await transformTS(code)
  }

  return code
}
