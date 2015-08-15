'use strict'

var babelify = require('babelify')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var filter = require('gulp-filter')
var gulp = require('gulp')
var gutil = require('gulp-util')
var jscs = require('gulp-jscs')
var jshint = require('gulp-jshint')
var sass = require('gulp-sass')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var watchify = require('watchify')
var browserSync = require('browser-sync').create()

require('babel/register')

var globs = {
  javascripts: ['src/**/*.js', '*.js'],
  package_json: ['package.json'],
  rc_files: ['.js*rc'],
  html: ['src/**/*.html'],
  sass: ['src/**/*.scss'],
}

function wrapWatchify(bundler, watch) {
  if (watch) { return watchify(bundler) }
  return bundler
}

function buildBrowserBundle(watch) {
  var bundler = wrapWatchify(browserify(watchify.args), watch)
    .transform(babelify)
    .add('./src/index.js')
    .on('update', buildBrowserBundle)
    .on('log', gutil.log)
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'))
    .pipe(filter('**/*.js'))
    .pipe(browserSync.reload({ stream: true }))
}

gulp.task('js-bundle', function () { return buildBrowserBundle(false) })
gulp.task('watch-js-bundle', function () { return buildBrowserBundle(true) })
gulp.task('html-bundle', function () {
  return gulp.src(globs.html)
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('css-bundle', function () {
  gulp.src(globs.sass)
    .pipe(sass())
    .pipe(gulp.dest('./dist'))
    .pipe(filter('**/*.css'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
})

gulp.task('browser-bundle', ['js-bundle', 'html-bundle', 'css-bundle'])

gulp.task('watch-html-bundle', ['html-bundle'], function () {
  return gulp.watch(globs.html, ['html-bundle'])
})
gulp.task('watch-css-bundle', ['css-bundle'], function () {
  return gulp.watch(globs.sass, ['css-bundle'])
})

gulp.task('jscs', function () {
  return gulp.src(globs.javascripts)
    .pipe(jscs())
})

gulp.task('jshint', function () {
  return gulp.src(globs.javascripts + globs.package_json + globs.rc_files)
    .pipe(jshint())
})

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', function () {
  return gulp.watch(globs.javascripts, ['lint'])
})

gulp.task('default', [
  'lint',
  'watch-lint',
  'browser-bundle',
  'watch-html-bundle',
  'watch-css-bundle',
  'browser-sync',
])
