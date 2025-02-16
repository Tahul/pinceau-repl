// @ts-ignore
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import type * as monaco from 'monaco-editor-core'
import * as ts from 'typescript'
import { resolveConfig } from '@volar/vue-language-service'
import * as volarWorker from '@volar/monaco/worker'
// import pinceauVolar from 'pinceau/volar'

self.onmessage = (message: MessageEvent) => {
  // const data = JSON.parse(message.data)

  worker.initialize(
    (ctx: monaco.worker.IWorkerContext<ReturnType<typeof volarWorker['createDtsHost']>>) => {
      const compilerOptions: ts.CompilerOptions = {
        ...ts.getDefaultCompilerOptions(),
        allowJs: true,
        jsx: ts.JsxEmit.Preserve,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        paths: {
          '#pinceau/theme': [],
          '#pinceau/utils': [],
          '#pinceau/schema': [],
          '#pinceau/definitions': [],
        },
      }

      return volarWorker.createLanguageService({
        workerContext: ctx,
        dtsHost: ctx.host,
        config: resolveConfig(
          {
            plugins: {
              /* volar.config.js plugins */
            },
          },
          ts as any,
          compilerOptions,
          {
            plugins: [
              // pinceauVolar,
            ],
          },
        ),
        typescript: {
          module: ts as any,
          compilerOptions,
        },
      })
    },
  )
}
