'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');

const Closure = require('closurecompiler');

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

const safeExec = function(command, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  if (!options)
    options = {};

  // This needed to be increased for `apm test` runs that generate many failures
  // The default is 200KB.
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
// TODO: Read automatically all directory source files
const compileStyles = () => new Promise(resolve => {

  safeExec(`java -jar ${path.join(vendorDir, 'closure-stylesheets.jar')} ${path.join(stylesDir, 'home.css')} --output-file ${path.join(buildStylesDir, 'home.css')} --output-renaming-map-format JSON --rename CLOSURE --output-renaming-map ${path.join(buildMapsDir, 'css.json')}`, (e) => {

    resolve();
  });
});

// Compile templates
// TODO: Read automatically all directory files.
// TODO: Skip exported selectors from being replaced.
const compileTemplates = () => new Promise(resolve => {

  [path.join(viewsDir, 'view.html'),
   path.join(viewsDir, 'create.html'),
   path.join(viewsDir, 'components', 'layout.html'),].forEach(templatePath => {
    let source = fs.readFileSync(templatePath, 'utf-8');

    // Rename 'class' attr values
    source = source.replace(
      /class="([^"]*)"/g,
      (str, cls) => {
        if (cls) {
          const selectorsMap = JSON.parse(fs.readFileSync(path.join(buildMapsDir, 'css.json'), 'utf-8'));
          let selectors = cls.split(' ');

          selectors.forEach((slr, i) => {
            if (slr.indexOf('-') > -1) {
              let slrs = slr.split('-');

              slrs.forEach(slr_part => {
                str = str.replace(slr_part, selectorsMap[slr_part] || slr);
              });
            } else {
              str = str.replace(slr, selectorsMap[slr] || slr);
            }
          });

          return str;
        } else {
          return str;
        }
      }
    );

    // Rename 'jsaction' and 'jscontroller' values
    let actionMap = {};
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

            const evt = declaration[0],
              methodName = declaration[1];
            
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
    let jsnameMap = {};
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

    // Write
    fs.writeFileSync(path.join(buildMapsDir, 'jsaction.json'), JSON.stringify(actionMap), 'utf-8');
    fs.writeFileSync(path.join(buildMapsDir, 'jsname.json'), JSON.stringify(jsnameMap), 'utf-8');
    
    if (templatePath.indexOf('components') > -1) {
      fs.writeFileSync(path.join(buildViewsDir, 'components', path.basename(templatePath)), source, 'utf-8');
    } else {
      fs.writeFileSync(path.join(buildViewsDir, path.basename(templatePath)), source, 'utf-8');
    }
  });

  resolve();
});

// Compile scripts
// TODO: Read automatically all directory source files.
const compileScripts = () => new Promise(resolve => {

  Closure.compile([path.join(scriptsDir, 'home.js')], {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    language_out: 'ES5',
    debug: false,
  }, (err, source) => {
    if (err)
      console.log(err);

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
    Object.keys(jsnameMap).forEach(jsname => {
      source = source.replace(
        /jsname=["']([^"']*)["']/g,
        (line, jsname) => {
          if (jsname) {
            line = line.replace(jsname, jsnameMap[jsname]);
          }

          return line;
        }
      );
    });

    // Write
    fs.writeFileSync(path.join(buildScriptsDir, 'home.js'), source, 'utf-8');

    resolve();
  });
});

// Create needed directories
createDir(buildDir);
createDir(buildStaticsDir);
createDir(buildStylesDir);
createDir(buildScriptsDir);
createDir(buildMapsDir);
createDir(buildViewsDir);
createDir(path.join(buildViewsDir, 'components'));

compileStyles().then(_ => {
  log('> StyleSheets minified!');

  compileTemplates().then(_ => {
    log('> Templates preprocessed!');

    compileScripts().then(_ => {
      log('> JavaScript code minified!');
    });
  });
});
