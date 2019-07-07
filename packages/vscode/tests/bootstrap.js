#!/usr/local/bin/node
const shell = require('shelljs');
const path = require('path');
const process = require('process');

console.log('Welcome to the NuGet Extensions test environment bootstrapper!');
console.log(
	'This script will clone some example open source repositories that consume and publish '
);

const projectsPath = path.join(process.cwd(), 'projects');
const manifest = ['https://github.com/Faithlife/FaithlifeUtility.git'];

manifest.reduce((acc, v) => {
	shell.exec(`git clone ${v}`, {
		cwd: projectsPath,
	});
	return acc;
}, {});

console.log('Complete!');
