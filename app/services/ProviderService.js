import { sign } from '../../lib/signer'
import { readFileSync, writeFile, statSync } from 'fs'
import { join as joinPath } from 'path'

class ProviderService {

  constructor() {
    this.version = 1
    this.fileMaxCacheAge = 31536e3
    this.cacheFilePath = joinPath(__dirname, '..', '..', '.cache')

    if (!process.env.RESET_CACHE) {
      this._data = this.loadCacheSync(this.cacheFilePath)
    } else {
      this._data = Object.create(null)
    }
  }

  provide(source, type) {
    let fileURI = `${this._uri}/${this._uid}.${type}`

    global.router.link(fileURI, (req, res) => {
      if (type === 'css') {
        req.accepts(type)
        res.header('Content-Type', 'text/css')
      }

      res.header('Cache-Control', `public, max-age=${this.fileMaxCacheAge}`)
      res.end(sign(source))//serve signed content
    })

    return fileURI
  }

  provideSource(path, type) { 
    let fileURI = `${this._uri}/${this._uid}.${type}`
    let content = readFileSync(joinPath(__dirname, '..', 'resources', path), 'utf8')

    let record = this._has(path, 'data') ? this._data[path].data : this._cache(path, content)

    global.router.link(fileURI, (req, res) => {      
      res.header('Cache-Control', `public, max-age=${this.fileMaxCacheAge}`)

      res.end(sign(record))//serve signed content
    })

    return fileURI
  }

  loadCacheSync(cacheFilePath) {
    console.log(`Loading cache file ${this.cacheFilePath}...`)

    this._data = Object.create(null)

    try {
      this._data = JSON.parse(readFileSync(cacheFilePath))
    } catch(err) { }

    return this._data
  }

  _cache(path, content) {
    let record = Object.create(null)
    this._data[path] = record
    this._data[path].data = content

    this._persistCache()

    return record.data
  }

  _has(filepath, field) {
    return Object.prototype.hasOwnProperty.call(this._data, filepath) &&
      (!field || Object.prototype.hasOwnProperty.call(this._data[filepath], field))
  }

  _persistCache() {
    writeFile(this.cacheFilePath, JSON.stringify(this._data))
  }

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