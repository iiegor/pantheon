import { sign } from '../../lib/signer'
import config from '../../config'
import { readFileSync, writeFile } from 'fs'
import path from 'path'

import { minify } from 'uglify-js'
import cssModulesHook from 'css-modules-require-hook'
import postcss from 'postcss'
import postcssWring from 'csswring'
import chalk from 'chalk'
import loaderUtils from 'loader-utils'
import cx from 'classnames/bind'

import React from 'react'
import ReactDOM from 'react-dom/server'

class ProviderService {

  constructor() {
    this.version = config.APP.ASSETS.version
    this.fileMaxCacheAge = 31536e3
    this.cacheFilePath = path.join(__dirname, '..', '..', '.cache')

    this.setupRequireHooks()

    if (config.FEATURES['with-asset-cache']) {
      this._data = this.loadCacheSync(this.cacheFilePath)
    } else {
      this._data = Object.create(null)
    }
  }

  provideSource(filepaths) {
    let record = this._has(filepaths, 'data') ? this._data[filepaths] : this._cache(filepaths)
    
    // Sign the record data
    if (config.environment !== 'development') {
      record.data = sign(record.data)
    }

    global.router.link(record.meta.uri, (req, res) => {
      if (record.meta.type === 'css') {
        req.accepts('css')
        res.header('Content-Type', 'text/css; charset=utf-8')
      } else if (record.meta.type === 'js') {
        res.header('Content-Type', 'application/x-javascript; charset=utf-8')
      }
      res.header('Cache-Control', `public, max-age=${this.fileMaxCacheAge}`)

      res.end(record.data)
    })

    return record.meta.uri
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
      prepend: [].concat(
        // CSS Minification plugin
        config.environment !== 'development' ? [postcssWring()] : []
      ),
      generateScopedName: config.FEATURES['with-hashed-selectors'] ? '_[hash:base64:5]' : '[name]_[local]',
      processCss: (css, filepath) => {
        this._cache(filepath, css, true)
      },
    })
  }

  /**
   * The `provide` method compiles all the assets at boot time
   * and returns template data about them.
   */
  provide(css, js) {
    let cssMap = Object.create(null)

    // Create a selector map
    css.forEach((key) => Object.assign(cssMap, require(path.join(__dirname, '..', 'resources', key))))

    return {
      css: cx.bind(cssMap),
      
      stylesheets: this.provideSource(css.join(',')),
      javascripts: this.provideSource(js.join(',')),
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
    this._data[filepath].meta.type = fileEXT.substr(1)

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

    const fileNAME = filepath.replace(/js\/|css\//g, '').replace('/', '').replace(/\//g, ',')
    const fileHASH = config.environment !== 'development'
      ? this._hash(content)
      : fileNAME
    const fileURI = config.environment !== 'development'
      ? this._uri.replace('{type}', record.meta.type).replace('{name}', fileHASH)
      : this._uri.replace('{type}', record.meta.type).replace('{name}', fileNAME)

    this._data[filepath].meta.hash = fileHASH
    this._data[filepath].meta.name = fileNAME
    this._data[filepath].meta.uri = fileURI

    if (fileEXT === '.js') {
      this._data[filepath].data = config.environment !== 'development' ? minify(content, { fromString: true }).code : content
    } else {
      this._data[filepath].data = content
    }

    this._persistCache()

    return record
  }

  _buildAssetsMap(resources) {
    const files = Object.create(null)
    const resourceMap = Object.create(null)

    resources.forEach((asset, i) => {
      this.provideSource(asset)

      if (this._has(asset, 'data')) {
        let file = this._data[asset]

        files[file.meta.hash] = {type: file.meta.type, src: file.meta.uri, crossOrigin: 1}
        resourceMap[file.meta.name] = file.meta.hash
      }
    })

    return {files, resourceMap}
  }

  _has(filepath, field) {
    return Object.prototype.hasOwnProperty.call(this._data, filepath) &&
      (!field || Object.prototype.hasOwnProperty.call(this._data[filepath], field))
  }

  _persistCache() {
    writeFile(this.cacheFilePath, JSON.stringify(this._data))
  }

  _hash(data) {
    return loaderUtils.getHashDigest(data, 'sha256', 'base64', 11)
  }

  /**
   * Returns the base path for assets
   */
  get _uri() {
    return `/_/${config.modulePrefix}/_/${config.APP.ASSETS.path}`
  }
}

export default ProviderService
