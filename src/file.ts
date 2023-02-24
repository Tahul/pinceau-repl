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
    tokens: {},
  }

  constructor(filename: string, code = '', hidden = false) {
    this.filename = filename
    this.code = code
    this.hidden = hidden
  }
}
