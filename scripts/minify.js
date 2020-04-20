#!/usr/bin/env node

/**
 * IDS Enterprise Minify Process
 */

// -------------------------------------
// Requirements
// -------------------------------------
const commandLineArgs = require('yargs').argv;

const logger = require('./logger');
const runBuildProcess = require('./build/run-build-process');

// -------------------------------------
// Main
// -------------------------------------

const cssArgs = ['./scripts/minify-css'];
const jsArgs = ['./scripts/minify-js'];

if (commandLineArgs.verbose) {
  const vb = '--verbose';
  cssArgs.push(vb);
  jsArgs.push(vb);
}

const minifyPromises = [
  runBuildProcess(`node ${cssArgs.join(' ')}`),
  runBuildProcess(`node ${jsArgs.join(' ')}`)
];

Promise.all(minifyPromises).then(() => {
  logger('success', 'All Minification Complete!');
  process.exit(0);
});
