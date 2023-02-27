import * as monaco from 'monaco-editor-core'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { type IGrammarDefinition, Registry } from 'monaco-textmate'

async function dispatchGrammars(scopeName: string): Promise<IGrammarDefinition> {
  switch (scopeName) {
    case 'source.vue':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./vue.tmLanguage.js'),
      }
    case 'source.ts':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./TypeScript.tmLanguage.js'),
      }
    case 'source.tsx':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./TypeScriptReact.tmLanguage.js'),
      }
    case 'source.js':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./JavaScript.tmLanguage.js'),
      }
    case 'source.js.jsx':
    case 'source.jsx':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./JavaScriptReact.tmLanguage.js'),
      }
    case 'text.html.basic':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./html.tmLanguage.js'),
      }
    case 'source.css':
    case 'source.postcss':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./css.tmLanguage.js'),
      }
    case 'source.stylus':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./stylus.tmLanguage.js'),
      }
    case 'source.markdown':
      return {
        format: 'json',
        // @ts-ignore
        content: await import('./markdown.tmLanguage.js'),
      }
    default:
      return {
        format: 'json',
        content: {
          scopeName: 'source',
          patterns: [],
        },
      }
  }
}

export async function loadGrammars(editor: monaco.editor.IStandaloneCodeEditor) {
  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      const dispatch = await dispatchGrammars(scopeName)
      return JSON.parse(JSON.stringify(dispatch))
    },
  })
  const grammars = new Map()
  grammars.set('vue', 'source.vue')
  grammars.set('typescript', 'source.ts')
  grammars.set('css', 'source.css')
  grammars.set('markdown', 'source.markdown')
  grammars.set('stylus', 'source.markdown')
  grammars.set('json', 'source.markdown')
  grammars.set('jsx', 'source.jsx')
  grammars.set('html', 'text.html.basic')

  for (const lang of grammars.keys()) {
    monaco.languages.register({
      id: lang,
    })
  }

  await wireTmGrammars(monaco as any, registry, grammars, editor as any)
}
