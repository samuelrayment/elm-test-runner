#! /usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var elmTestRunner = require('elm-test-runner');

elmTestRunner.run(argv['_'][0]);
