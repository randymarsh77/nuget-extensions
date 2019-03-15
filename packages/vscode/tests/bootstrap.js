#!/usr/local/bin/node
const { execFileSync } = require('child_process');
const path = require('path');
const process = require('process');

console.log('Welcome to the NuGet Extensions test environment bootstrapper!');
console.log(
	'This script will clone some example open source repositories that consume and publish '
);

const projectsPath = path.join(process.cwd(), 'projects');
const manifest = ['https://github.com/Faithlife/FaithlifeAnalyzers.git'];

manifest.reduce((acc, v) => {
	execFileSync('git', ['clone', v], {
		cwd: projectsPath,
	});
	return acc;
}, {});

console.log('Complete!');
