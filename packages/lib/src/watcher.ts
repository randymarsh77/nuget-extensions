import * as fs from 'fs';
import { installPackages } from './linker';
import { readRegistry } from './registry';

const debounce = require('lodash.debounce');

let batch = new Set();

function doRefresh({
	shortCircuitBuild,
	workingDirectory,
}: {
	shortCircuitBuild?: string;
	workingDirectory?: string;
}) {
	const files = [...batch];
	console.log('Processing change events for:', JSON.stringify(files, null, 2));
	batch = new Set();
	installPackages({ shortCircuitBuild, workingDirectory });
}

const refreshSoon = debounce(doRefresh, 5000);

export function watch(options: { shortCircuitBuild?: string; workingDirectory?: string }) {
	const registry = readRegistry();
	const directories = Object.keys(registry).reduce((acc, pkg) => {
		const { directory } = registry[pkg];
		return acc.add(directory);
	}, new Set());

	[...directories].reduce((_, v) => {
		fs.watch(v, (eventType: string, filename: string) => {
			console.log('event: ', eventType, filename);
			if (registry[filename]) {
				batch.add(filename);
				refreshSoon(options);
			}
		});
	}, []);
}
