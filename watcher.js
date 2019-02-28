const fs = require('fs');
const { installPackages } = require('./linker');
const { readRegistry } = require('./registry');
const debounce = require('lodash.debounce');

let batch = new Set();

const doRefresh = shortCircuitBuild => {
	const files = [...batch];
	console.log('Processing change events for:', JSON.stringify(files, null, 2));
	batch = new Set();
	installPackages(shortCircuitBuild);
};

const refreshSoon = debounce(doRefresh, 5000);

module.exports = {
	watch: ({ shortCircuitBuild }) => {
		const registry = readRegistry();
		const directories = Object.keys(registry).reduce((acc, package) => {
			const { directory } = registry[package];
			return acc.add(directory);
		}, new Set());

		[...directories].reduce((acc, v) => {
			fs.watch(v, (eventType, filename) => {
				console.log('event: ', eventType, filename);
				if (registry[filename]) {
					batch.add(filename);
					refreshSoon(shortCircuitBuild);
				}
			});
		}, []);
	},
};
