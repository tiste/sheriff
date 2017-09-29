#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

require('babel-core/register');

const meow = require('meow');
const sheriff = require('./lib/sheriff');

const cli = meow(`
	Usage
	  $ sheriff <feature> [--param=<value>]
	Example
	  $ sheriff commitMsg --commits='feat: foobar'
	  { isSuccesss: true, description: 'All commit messages are okay' }
`);

const feature = cli.input[0];

if (!feature) {
    console.error('Specify a feature');
    process.exit(1);
}


let params;

if (cli.flags.labels) {
    params = Array.isArray(cli.flags.labels) ? cli.flags.labels : [cli.flags.labels];
}

if (cli.flags.reviews) {
    params = Array.isArray(cli.flags.reviews) ? cli.flags.reviews : [cli.flags.reviews];
}

if (cli.flags.commits) {
    params = Array.isArray(cli.flags.commits) ? cli.flags.commits : [cli.flags.commits];
}

if (cli.flags.name) {
    params = cli.flags.name;
}

console.log(sheriff[feature](params));
