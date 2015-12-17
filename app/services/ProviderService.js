import { sign } from '../../lib/signer'
import { readFileSync } from 'fs'
import { join as joinPath } from 'path'

class ProviderService {

  constructor() {
    this.version = 1
    this.fileMaxCacheAge = 31536e3
  }

  provide(source, type) {
    let fileURI = `${this._uri}/${this._uid}.${type}`

    global.birdy.router.link(fileURI, (req, res) => {
      if (type === 'css') {
        req.accepts(type)
        res.header('Content-Type', 'text/css')
      }

      res.header('Cache-Control', `public, max-age=${this.fileMaxCacheAge}`)
      res.end(sign(source)) //serve signed content
    })

    return fileURI
  }

  provideSource(path, type) { }

  get _uri() {
    return `${process.env.ASSETS_URI}/v${this.version}`
  }

  get _uid() {
    var S4 = function() {
      return (Math.floor(((1+Math.random())*0x10000))).toString(16).substring(1)
    }

    return S4() + S4() + '-' +  S4()
  }
  
}

export default ProviderService