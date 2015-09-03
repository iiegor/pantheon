// Birdy build file

'use strict';

var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;
var del = require('del');

var vulcanize = require('gulp-vulcanize');
var crisper = require('gulp-crisper');

var pkg = require('./package.json');

var PUBLIC_DIR = 'public';
var PROD_DIR = PUBLIC_DIR + '/builds';
var ASSETS_DIR = 'app/assets';
var COMPONENTS_DIR = 'bower_components';

var DEV = Boolean(argv.dev) || false;
var VERSION = argv.build || 'pkg-' + pkg.version.charAt(0) + Math.random().toString(36).substr(1, 5); // pkg-VERSION.RANDOM
var CLEAN = Boolean(argv.clean) || true; // clean old builds

gulp.task('clean', function(callback) {
  del([
    PROD_DIR
  ], callback);
});

gulp.task('copy-bower_components', function() {
  gulp.src(COMPONENTS_DIR + '/webcomponentsjs/webcomponentsjs-lite.min.js', { base: './' })
    .pipe(gulp.dest( path.join(PUBLIC_DIR) ));
});

gulp.task('vulcanize-elements', function() {
  return gulp.src(['app/elements/elements.html'], { base: 'app/elements' })
    .pipe(vulcanize({
      inlineScripts: true,
      inlineCss: true,
      stripComments: true
    }))
    .pipe(crisper())
    .pipe(gulp.dest( path.join(PROD_DIR, VERSION) ));
});

gulp.task('bump', function() {
  fs.writeFile( path.join('.', '.build.json') , JSON.stringify({version: VERSION}), function(err) {
    if (err) console.error('Can\'t bump the version!');
  });
});

gulp.task('build', function() {
  var tasks = ['copy-bower_components', 'vulcanize-elements', 'bump'];

  if (CLEAN)
    tasks.unshift('clean');

  gulp.start(tasks);
});
gulp.task('default', ['build']);