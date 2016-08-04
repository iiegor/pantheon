'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');

const Closure = require('closurecompiler');
const Glob = require('glob');
const Postcss = require('postcss');
const CleanCSS = require('clean-css');
const Del = require('del');
const Minifier = require('html-minifier');
const Utils = require('loader-utils');

const config = require('./config');

const vendorDir = path.join(__dirname, 'vendor');

const buildDir = path.join(__dirname, '.build');
const buildStaticsDir = path.join(__dirname, '.build', 'statics');
const buildStylesDir = path.join(buildStaticsDir, 'styles');
const buildScriptsDir = path.join(buildStaticsDir, 'scripts');
const buildMapsDir = path.join(__dirname, '.build', 'maps');
const buildViewsDir = path.join(__dirname, '.build', 'views');

const stylesDir = path.join(__dirname, 'statics', 'styles');
const scriptsDir = path.join(__dirname, 'statics', 'scripts');
const viewsDir = path.join(__dirname, 'views');

// Utilities
const log = (str) => console.log(str);
const createDir = (path) => !fs.existsSync(path) ? fs.mkdirSync(path) : true;
const encodeString = (str) => new Buffer(crypto.createHash('md5').update(str).digest('hex')).toString('base64').substring(0, 5);
const getDirname = (_path) => path.dirname(_path);

const safeExec = function(command, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  if (!options)
    options = {};

  options.maxBuffer = 1024 * 1024;

  var child = childProcess.exec(command, options, function(error, stdout, stderr) {
    if (error)
      process.exit(error.code || 1);
    else if (callback)
      callback(null);
  });
  child.stderr.pipe(process.stderr);
  if (!options.ignoreStdout)
    child.stdout.pipe(process.stdout);
}

// Compile stylesheets
// TODO: Support user-defined plugins.
const compileStyles = () => new Promise(resolve => {
  let cssMap = {};

  Glob(path.join(stylesDir, '**', '*.css'), (err, files) => files.forEach((file, index) => {
    Postcss([
      require('autoprefixer'),
      require('postcss-modules')({
        scopeBehaviour: config.build.css.scopeBehaviour,
        generateScopedName: function(name, filename, css) {
          // check if its a exported className
          if (name.indexOf('export') > -1) {
            return name;
          }

          let selector = name.split('-');

          selector.forEach((str, index) => {
            const selectorPattern = config.build.css.selectorPattern;

            if (selectorPattern == 'advanced') {
              selector[index] = '_' + Utils.getHashDigest(str, 'sha1', 'base64', 3);
            } else if (selectorPattern == 'basic') {
              selector[index] = new Buffer(crypto.createHash('md5').update(str).digest('hex')).toString('base64').substring(0, 3);
            }
          });

          return selector.join('-');
        },

        getJSON: (fileName, map) => {
          if (index == files.length - 1) {
            // Write the final map
            fs.writeFile(path.join(buildMapsDir, 'css.json'), JSON.stringify(Object.assign(cssMap, map)), () => {
              resolve();
            });
          } else {
            // Append more data
            Object.assign(cssMap, map);
          }
        },
      })
    ]).process(fs.readFileSync(file, 'utf-8')).then(result => {
      const source = new CleanCSS().minify(result.css).styles;

      const relativePath = path.relative(stylesDir, file);
      const filePath = path.join(buildStylesDir, relativePath);
      
      createDir(getDirname(filePath));

      fs.writeFileSync(filePath, source, 'utf-8');
    });
  }));
});

// Compile templates
// TODO: Minify jsaction attr event names.
const compileTemplates = () => new Promise(resolve => {
  const selectorsMap = JSON.parse(fs.readFileSync(path.join(buildMapsDir, 'css.json'), 'utf-8'));

  let actionMap = {};
  let jsnameMap = {};

  Glob(path.join(viewsDir, '**', '*.html'), (err, templates) => templates.forEach((templatePath, index) => {
    let source = fs.readFileSync(templatePath, 'utf-8');

    // Rename 'class' attr values
    source = source.replace(
      /class="([^"]*)"/g,
      (str, cls) => {
        if (cls) {
          let selectors = cls.replace(/{{(.*)}}/g, '').split(' '); // remove template code

          selectors.forEach(slr => {
            str = str.replace(slr, selectorsMap[slr] || slr);
          });

          // TODO: This can easily break our build, we need to find a more
          //  accurated way.
          str = str.replace(/{{(.*)}}/g, (str, cls) => {

            return str.replace(/["']([^"']*)["']/g, function (str, cls) {
              let tplSelectors = cls.split(' ');

              tplSelectors.forEach(slr => {
                str = str.replace(slr, selectorsMap[slr] || slr);
              })

              return str;
            });
          });

          return str;
        } else {
          return str;
        }
      }
    );

    // Rename 'id' attr values
    source = source.replace(
      /id="([^"]*)"/g,
      (str, cls) => {
        if (cls) {
          str = str.replace(cls, selectorsMap[cls] || cls);

          return str;
        } else {
          return str;
        }
      }
    );

    // Rename 'jsaction' and 'jscontroller' values
    source = source.replace(
      /jsaction=["']([^"']*)["']/g,
      (str, cls) => {
        if (cls) {
          const actions = cls.split(';');

          actions.forEach(action => {
            // check if it's empty
            if (!action) {
              return;
            }

            const declaration = action.split(':');

            let evt = declaration[0],
              methodName = declaration[1];

            if (!methodName) {
              methodName = evt;
              evt = 'click';
            }
            
            actionMap[methodName] = encodeString(methodName);

            str = str.replace(methodName, actionMap[methodName]);
          });

          return str;
        } else {
          return str;
        }
      }
    );

    // Rename 'jsname' attr value
    source = source.replace(
      /jsname=["']([^"']*)["']/g,
      (line, jsname) => {
        if (jsname) {
          jsnameMap[jsname] = encodeString(jsname);

          line = line.replace(jsname, jsnameMap[jsname]);
        }

        return line;
      }
    );

    // Minify template code
    const njAttrWrapOpen = /\{\%[^}]+\%\}/;
    const njAttrWrapClose = /\{\%[^}]+\%\}/;
    const njAttrWrapPair = [njAttrWrapOpen, njAttrWrapClose];

    source = Minifier.minify(source, Object.assign({
      // nunjucks support
      customAttrSurround: [njAttrWrapPair],
    }, config.build.html));

    // Write template file
    if (templatePath.indexOf('components') > -1) {
      createDir(path.join(buildViewsDir, 'components'));
      
      fs.writeFileSync(path.join(buildViewsDir, 'components', path.basename(templatePath)), source, 'utf-8');
    } else {
      fs.writeFileSync(path.join(buildViewsDir, path.basename(templatePath)), source, 'utf-8');
    }

    if (index === templates.length - 1) {
      // Write
      fs.writeFileSync(path.join(buildMapsDir, 'jsaction.json'), JSON.stringify(actionMap), 'utf-8');
      fs.writeFileSync(path.join(buildMapsDir, 'jsname.json'), JSON.stringify(jsnameMap), 'utf-8');
    }
  }));

  resolve();
});

// Compile scripts
// TODO: Rename classNames in .querySelector and .querySelectorAll methods.
const compileScripts = () => new Promise(resolve => {
  const compileScript = (name, source, cb) => {
    // Process jsaction map
    // TODO: Add more precision to the replace in a future,
    //  some components name can conflict with jsaction names.
    const jsactionMap = JSON.parse(fs.readFileSync(path.join(buildMapsDir, 'jsaction.json'), 'utf-8'));
    Object.keys(jsactionMap).forEach(action => {
      source = source.replace(action, jsactionMap[action]);
    });

    // Process css map
    const cssMap = JSON.parse(fs.readFileSync(path.join(buildMapsDir, 'css.json'), 'utf-8'));
    source = source.replace(
      /classList.(?:add|remove|contains)\(["']([^"']*)["']\)/g,
      (line, selector) => {
        if (selector) {
          line = line.replace(selector, cssMap[selector] || selector);
        }

        return line;
      }
    );

    // Process jsname map
    const jsnameMap = JSON.parse(fs.readFileSync(path.join(buildMapsDir, 'jsname.json'), 'utf-8'));
    source = source.replace(
      /jsname=["']([^"']*)["']/g,
      (line, jsname) => {
        if (jsname) {
          line = line.replace(jsname, jsnameMap[jsname]);
        }

        return line;
      }
    );

    // Write
    fs.writeFile(path.join(buildScriptsDir, name), source, () => {
      cb(true);
    });
  };

  // TODO: Fix high memory usage (probably due to parallel compilation)
  Glob(path.join(scriptsDir, '**', '*.js'), (err, files) => files.forEach((file, index) => {
    Closure.compile([file], {
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      language_out: 'ES5',
      debug: false,
    }, (err, source) => {
      if (err)
        console.log(err);

      compileScript(path.basename(file), source, () => {

        if (index === files.length - 1)
          resolve();
      });
    });
  }));
});

// Clean last build files
Del.sync(path.join(buildDir));

// Create needed directories
createDir(buildDir);
createDir(buildStaticsDir);
createDir(buildStylesDir);
createDir(buildScriptsDir);
createDir(buildMapsDir);
createDir(buildViewsDir);

compileStyles().then(_ => {
  log('> StyleSheets minified!');

  compileTemplates().then(_ => {
    log('> Templates preprocessed!');

    compileScripts().then(_ => {
      log('> JavaScript code minified!');
    });
  });
});
