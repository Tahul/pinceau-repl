import { Uri, editor } from 'monaco-editor-core';

export function getOrCreateModel(uri: Uri, lang: string | undefined, value: string) {
  const model = editor.getModel(uri);
  if (model) {
    model.setValue(value);
    return model;
  }
  console.log({value, lang, uri})
  return editor.createModel(value, lang, uri);
}
