import { sign } from '../../lib/signer'
import { readFileSync, writeFile } from 'fs'
import path from 'path'

import { minify } from 'uglify-js'
import cssModulesHook from 'css-modules-require-hook'
import postcssWring from 'csswring'
import chalk from 'chalk'
import loaderUtils from 'loader-utils'

import React from 'react'
import ReactDOM from 'react-dom/server'

class ProviderService {

  constructor() {
    this.version = process.env.ASSET_VERSION || 1
    this.fileMaxCacheAge = 31536e3
    this.cacheFilePath = path.join(__dirname, '..', '..', '.cache')

    this.setupRequireHooks()
    this.setupGlobals()

    if (process.env.ASSET_CACHE) {
      this._data = this.loadCacheSync(this.cacheFilePath)
    } else {
      this._data = Object.create(null)
    }
  }

  provideSource(filepaths) {
    let record = this._has(filepaths, 'data') ? this._data[filepaths] : this._cache(filepaths)
    
    // Sign the record data
    record.data = sign(record.data)

    global.router.link(record.meta.uri, (req, res) => {
      if (record.meta.type === '.css') {
        req.accepts('css')
        res.header('Content-Type', 'text/css; charset=utf-8')
      } else if (record.meta.type === '.js') {
        res.header('Content-Type', 'application/x-javascript; charset=utf-8')
      }
      res.header('Cache-Control', `public, max-age=${this.fileMaxCacheAge}`)

      res.end(record.data)
    })

    return record.meta.uri
  }

  provideSources(filepaths) {
    // Filter array items
    const css = filepaths.filter((value) => {
      return value.indexOf('.css') !== -1
    })

    const js = filepaths.filter((value) => {
      return value.indexOf('.js') !== -1
    })

    // Provide them
    return {
      css: this.provideSource(css.join(',')),
      js: this.provideSource(js.join(',')),
    }
  }

  loadCacheSync(cacheFilePath) {
    console.log(chalk.grey(`Loading cache file ${this.cacheFilePath}...`))

    this._data = Object.create(null)

    try {
      this._data = JSON.parse(readFileSync(cacheFilePath))
    } catch (err) {
      console.log(chalk.red('Failed to load the cache file :('))
    }

    return this._data
  }

  setupRequireHooks() {
    // CSS Modules
    cssModulesHook({
      append: [],
      prepend: [
        // CSS Minification plugin
        postcssWring(),
      ],
      generateScopedName: process.env.CSS_SCOPE_NAME || '_[hash:base64:5]',
      processCss: (css, filepath) => {
        this._cache(filepath, css, true)
      },
    })
  }

  setupGlobals() {
    /**
     * The `provide` method returns template data.
     */
    global.provide = (arr) => {
      let {css, js} = this.provideSources(arr)

      return function render(Component = null, Style = null) {
        let res = {
          css,
          js,
        }

        if (Component !== null) {
          res.output = ReactDOM[Component.renderMethod || process.env.RENDER_METHOD || 'renderToStaticMarkup'](<Component />)
        }

        if (Style !== null) {
          res.style = Style
        }

        return res
      }
    }
  }

  _cache(filepath, content = null, isRelative = false) {
    let filepathArr = filepath.split(',')

    const fileEXT = path.extname(filepathArr[0])

    if (isRelative) {
      filepath = path.relative(path.join(__dirname, '..', 'resources'), filepath)
    } else {
      filepathArr = filepathArr.map(function(value) {
        return path.normalize(value)
      })
    }

    const record = Object.create(null)
    this._data[filepath] = record
    this._data[filepath].meta = Object.create(null)
    this._data[filepath].meta.type = fileEXT

    if (content === null) {
      content = ''
      
      filepathArr.forEach((value) => {
        if (this._has(value, 'data')) {
          content += this._data[value].data
        } else {
          content += readFileSync(path.join(__dirname, '..', 'resources', value), 'utf8')
        }
      })
    }

    const fileURI = `${this._uri}/${this._hash(content)}${fileEXT}`
    this._data[filepath].meta.uri = fileURI

    if (fileEXT === '.js') {
      this._data[filepath].data = minify(content, { fromString: true }).code
    } else {
      this._data[filepath].data = content
    }

    this._persistCache()

    return record
  }

  _has(filepath, field) {
    return Object.prototype.hasOwnProperty.call(this._data, filepath) &&
      (!field || Object.prototype.hasOwnProperty.call(this._data[filepath], field))
  }

  _persistCache() {
    writeFile(this.cacheFilePath, JSON.stringify(this._data))
  }

  _hash(data) {
    return loaderUtils.getHashDigest(data, '', 'base64', 7)
  }

  /**
   * Returns the base path for assets
   */
  get _uri() {
    return `${process.env.ASSET_URI}/v${this.version}`
  }

  /**
   * Returns a random unique id
   */
  get _uid() {
    const s4 = function s4() {
      return (Math.floor(((1 + Math.random()) * 0x10000))).toString(16).substring(1)
    }

    return `${s4() + s4()}-${s4()}`
  }

}

export default ProviderService
