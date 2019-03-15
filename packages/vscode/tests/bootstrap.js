#!/usr/local/bin/node
import { execFileSync } from 'child_process';
import * as fs from 'fs';

console.log('Welcome to the NuGet Extensions test environment bootstrapper!');
console.log(
	'This script will clone some example open source repositories that consume and publish '
);

const projectsPath = path.join(pwd(), 'projects');
const manifest = ['https://github.com/Faithlife/FaithlifeAnalyzers.git'];

manifest.reduce((acc, v) => {
	execFileSync('git', ['clone', v], {
		cwd: projectsPath,
	});
	return acc;
}, {});

console.log('Complete!');
