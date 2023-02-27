import type { File } from './file'
import { compileFile } from './transform'
import type { Store } from './types'

self.onmessage = async (message: MessageEvent) => {
  const store = JSON.parse(message.data) as Store

  const files: Record<string, File['compiled']> = {}

  for (const file in store.state.files) {
    const compiled = await compileFile(store, store.state.files[file])
    if (compiled) { files[file] = compiled }
  }

  console.log(files)
}
