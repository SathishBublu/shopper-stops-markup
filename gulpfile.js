/**
 * Settings
 * Turn on/off build features
 */

const settings = {
  clean: true,
  scripts: true,
  polyfills: true,
  styles: true,
  svgs: true,
  static: true,
  html: true,
  reload: true,
};

/**
 * Paths to project folders
 */

const paths = {
  input: 'src/',
  output: 'dist/',
  scripts: {
    input: 'src/js/*',
    polyfills: '.polyfill.js',
    output: 'dist/js/',
  },
  styles: {
    input: 'src/sass/**/*.{scss,sass}',
    output: 'dist/css/',
  },
  svgs: {
    input: 'src/svg/*.svg',
    output: 'dist/static/svg/',
  },
  static: {
    input: 'src/static/**/*',
    output: 'dist/static/',
  },
  html: {
    input: 'src/*.html',
    output: 'dist/',
  },
  reload: './dist/',
};

/**
 * Template for banner to add to file headers
 */

const banner = {
  main: `/*! 
          <%= package.name %> v<%= package.version %> 
          | (c) 
          ${new Date().getFullYear()}  
          <%= package.author %> 
          | <%= package.license %> License 
          | <%= package.repository.url %>  
          */\n`,
};

/**
 * Gulp Packages
 */

// General
const { src, dest, watch, series, parallel } = require('gulp');
const del = require('del');
const flatmap = require('gulp-flatmap');
const lazypipe = require('lazypipe');
const rename = require('gulp-rename');
const header = require('gulp-header');

// Scripts
const concat = require('gulp-concat');
const uglify = require('gulp-terser');
const bro = require('gulp-bro');
const babelify = require('babelify');

// Styles
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const prefix = require('autoprefixer');
const minify = require('cssnano');
const purgecss = require('gulp-purgecss');

// SVGs
const svgmin = require('gulp-svgmin');

// BrowserSync
const browserSync = require('browser-sync');

// Banner Config
const packageJSON = require('./package.json');

/**
 * Gulp Tasks
 */

// Remove pre-existing content from output folders
const cleanDist = function (done) {
  // Make sure this feature is activated before running
  if (!settings.clean) return done();

  // Clean the dist folder
  del.sync([paths.output]);

  // Signal completion
  return done();
};

// Repeated JavaScript tasks
const jsTasks = lazypipe()
  .pipe(header, banner.main, { package: packageJSON })
  .pipe(bro, {
    transform: [babelify.configure({ presets: ['@babel/env'] }), ['babelify', { global: true }]],
  })
  .pipe(dest, paths.scripts.output)
  .pipe(rename, { suffix: '.min' })
  .pipe(uglify)
  .pipe(header, banner.main, { package: packageJSON })
  .pipe(dest, paths.scripts.output);

// Lint, minify, and concatenate scripts
const buildScripts = function (done) {
  // Make sure this feature is activated before running
  if (!settings.scripts) return done();

  // Run tasks on script files
  return src(paths.scripts.input).pipe(
    flatmap((stream, file) => {
      // If the file is a directory
      if (file.isDirectory()) {
        // Setup a suffix constiable
        let suffix = '';

        // If separate polyfill files enabled
        if (settings.polyfills) {
          // Update the suffix
          suffix = '.polyfills';

          // Grab files that aren't polyfills, concatenate them, and process them
          src([`${file.path}/*.js`, `!${file.path}/*${paths.scripts.polyfills}`])
            .pipe(concat(`${file.relative}.js`))
            .pipe(jsTasks());
        }

        // Grab all files and concatenate them
        // If separate polyfills enabled, this will have .polyfills in the filename
        src(`${file.path}/*.js`)
          .pipe(concat(`${file.relative + suffix}.js`))
          .pipe(jsTasks());

        return stream;
      }

      // Otherwise, process the file
      return stream.pipe(jsTasks());
    })
  );
};

// Process, lint, and minify Sass files
const buildStyles = function (done) {
  // Make sure this feature is activated before running
  if (!settings.styles) return done();

  // Run tasks on all Sass files
  return src(paths.styles.input)
    .pipe(
      sass({
        outputStyle: 'expanded',
        sourceComments: false,
      })
    )
    .pipe(
      postcss([
        prefix({
          cascade: true,
          remove: true,
        }),
      ])
    )
    .pipe(purgecss({ content: ['src/*.html'] }))
    .pipe(header(banner.main, { package: packageJSON }))
    .pipe(dest(paths.styles.output))
    .pipe(rename({ suffix: '.min' }))
    .pipe(
      postcss([
        minify({
          discardComments: {
            removeAll: true,
          },
        }),
      ])
    )
    .pipe(dest(paths.styles.output));
};

// Optimize SVG files
const buildSVGs = function (done) {
  // Make sure this feature is activated before running
  if (!settings.svgs) return done();

  // Optimize SVG files
  return src(paths.svgs.input).pipe(svgmin()).pipe(dest(paths.svgs.output));
};

// Copy static files into output folder
const copyFiles = function (done) {
  // Make sure this feature is activated before running
  if (!settings.static) return done();

  // Copy static files
  return src(paths.static.input).pipe(dest(paths.static.output));
};

// Copy static files into output folder
const copyHTMLFiles = function (done) {
  // Make sure this feature is activated before running
  if (!settings.html) return done();

  // Copy HTML files
  return src(paths.html.input).pipe(dest(paths.html.output));
};

// Watch for changes to the src directory
const startServer = function (done) {
  // Make sure this feature is activated before running
  if (!settings.reload) return done();

  // Initialize BrowserSync
  browserSync.init({
    server: {
      baseDir: paths.reload,
    },
  });

  // Signal completion
  done();
};

// Reload the browser when files change
const reloadBrowser = function (done) {
  if (!settings.reload) return done();
  browserSync.reload();
  done();
};

// Watch for changes
const watchSource = function (done) {
  watch(paths.input, series(exports.default, reloadBrowser));
  done();
};

/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(cleanDist, parallel(buildScripts, buildStyles, buildSVGs, copyFiles, copyHTMLFiles));

// Watch and reload
// gulp watch
exports.watch = series(exports.default, startServer, watchSource);
