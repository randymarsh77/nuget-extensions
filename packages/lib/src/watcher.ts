import * as fs from 'fs';
import { installPackages } from './linker';
import { readRegistry } from './registry';
import { ILogger } from './logger';

const debounce = require('lodash.debounce');

let batch = new Set();

function doRefresh({
	shortCircuitBuild,
	workingDirectory,
	logger,
}: {
	shortCircuitBuild?: string;
	workingDirectory?: string;
	logger?: ILogger;
}) {
	const log = (x: string) => logger && logger.log(x);
	const files = [...batch];
	log(`Processing change events for: ${JSON.stringify(files, null, 2)}`);
	batch = new Set();
	installPackages({ shortCircuitBuild, workingDirectory, logger });
}

const refreshSoon = debounce(doRefresh, 5000);

export function watch(options: {
	shortCircuitBuild?: string;
	workingDirectory?: string;
	logger?: ILogger;
}): fs.FSWatcher[] {
	const registry = readRegistry();
	const directories = Object.keys(registry).reduce((acc, pkg) => {
		const { directory } = registry[pkg];
		return acc.add(directory);
	}, new Set());

	const logger = options.logger;
	const log = (x: string) => logger && logger.log(x);

	const watchers = [...directories].reduce((acc, v) => {
		log(`Watching for changes in: ${v}`);
		return [
			...acc,
			fs.watch(v, (eventType: string, filename: string) => {
				log(`event: ${eventType} ${filename}`);
				if (registry[filename]) {
					batch.add(filename);
					refreshSoon(options);
				}
			}),
		];
	}, []);

	if (options.shortCircuitBuild) {
		log(`Shortcircuiting is enabled for: ${options.shortCircuitBuild}`);
		log(`Executing an initial install...`);
		refreshSoon(options);
	}

	return watchers;
}
