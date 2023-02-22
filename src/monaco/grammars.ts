import * as monaco from 'monaco-editor-core';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { Registry, type IGrammarDefinition } from 'monaco-textmate';

async function dispatchGrammars(scopeName: string): Promise<IGrammarDefinition> {
  switch (scopeName) {
    case 'source.vue':
      return {
        format: 'json',
        content: await import('./grammars/vue.tmLanguage.js'),
      };
    case 'source.ts':
      return {
        format: 'json',
        content: await import('./grammars/TypeScript.tmLanguage.js'),
      };
    case 'source.tsx':
      return {
        format: 'json',
        content: await import('./grammars/TypeScriptReact.tmLanguage.js'),
      };
    case 'source.js':
      return {
        format: 'json',
        content: await import('./grammars/JavaScript.tmLanguage.js'),
      };
    case 'source.js.jsx':
    case 'source.jsx':
      return {
        format: 'json',
        content: await import('./grammars/JavaScriptReact.tmLanguage.js'),
      };
    case 'text.html.basic':
      return {
        format: 'json',
        content: await import('./grammars/html.tmLanguage.js'),
      };
    case 'source.css':
      return {
        format: 'json',
        content: await import('./grammars/css.tmLanguage.js'),
      };
    case 'source.stylus':
      return {
        format: 'json',
        content: await import('./grammars/stylus.tmLanguage.js'),
      };
    case 'source.markdown':
      return {
        format: 'json',
        content: await import('./grammars/markdown.tmLanguage.js'),
      };
    default:
      return {
        format: 'json',
        content: {
          scopeName: 'source',
          patterns: [],
        },
      };
  }
}

export async function loadGrammars(editor: monaco.editor.IStandaloneCodeEditor) {
  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      const dispatch = await dispatchGrammars(scopeName);
      return JSON.parse(JSON.stringify(dispatch));
    },
  });
  const grammars = new Map();
  grammars.set('vue', 'source.vue');
  grammars.set('typescript', 'source.ts');
  grammars.set('css', 'source.css');
  grammars.set('markdown', 'source.markdown');
  grammars.set('stylus', 'source.markdown');
  grammars.set('json', 'source.markdown');
  grammars.set('jsx', 'source.jsx');
  grammars.set('html', 'text.html.basic');

  for (const lang of grammars.keys()) {
    monaco.languages.register({
      id: lang,
    });
  }

  await wireTmGrammars(monaco as any, registry, grammars, editor as any);
}
