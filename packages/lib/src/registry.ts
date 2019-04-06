import * as fs from 'fs';
import * as path from 'path';
import * as home from 'user-home';
import { ILogger } from './logger';

function resolveEnvironment() {
	const nugexDataDir = process.env.NUGEX_DIR || path.join(home, '.nugex');
	const registryPath = path.join(nugexDataDir, 'registry.json');
	return { registryPath, nugexDataDir };
}

export interface IPackage {
	name: string;
	version: string;
	assemblyVersion: string;
	extension: string;
	directory: string;
}

export interface IRegistry {
	[key: string]: IPackage;
}

export function readRegistry(): IRegistry {
	const { registryPath } = resolveEnvironment();
	if (!fs.existsSync(registryPath)) {
		return {};
	}
	const data = fs.readFileSync(registryPath).toString('utf-8');
	return (data && JSON.parse(data)) || {};
}

export function writeRegistry(registry: IRegistry) {
	const { registryPath, nugexDataDir } = resolveEnvironment();
	if (!fs.existsSync(nugexDataDir)) {
		fs.mkdirSync(nugexDataDir);
	}
	fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

function parsePackage(pkg: string): Pick<IPackage, 'name' | 'version' | 'extension'> | null {
	const parts = pkg.split('.');
	if (parts.length < 5) {
		return null;
	}
	const count = parts.length;
	const name = parts.slice(0, count - 4).join('.');
	const version = parts.slice(count - 4, count - 1).join('.');
	const extension = parts[count - 1];
	return {
		name,
		version,
		extension,
	};
}

export function registerPackages(directory: string, { logger }: { logger?: ILogger }) {
	const log = (x: string) => logger && logger.log(x);
	const registry = fs
		.readdirSync(directory)
		.filter(x => x.endsWith('.nupkg'))
		.reduce((acc, v) => {
			const parsed = parsePackage(v);
			if (!parsed) {
				return acc;
			}

			if (acc[v]) {
				log(`Registry entry exists for ${v}... skipping.`);
			} else {
				log(`Registering ${v}.`);
				const { name, version, extension } = parsed;
				acc[v] = {
					name,
					version,
					assemblyVersion: '0.0.0.0', // TODO: Don't assume/force
					extension,
					directory,
				};
			}
			return acc;
		}, readRegistry());
	writeRegistry(registry);
	log('Success!');
}

export function unregisterPackagesInDirectory(directory: string, { logger }: { logger?: ILogger }) {
	const log = (x: string) => logger && logger.log(x);
	log(`Unregistering packages in ${directory}`);
	const registry = readRegistry();
	const updated = Object.keys(registry).reduce((acc, v) => {
		if (directory === acc[v].directory) {
			delete acc[v];
		}
		return acc;
	}, registry);
	writeRegistry(updated);
	log('Success!');
}

export function unregisterPackagesMatchingPattern(
	pattern: string,
	{ logger }: { logger?: ILogger }
) {
	const log = (x: string) => logger && logger.log(x);
	log(`Unregistering packages matching ${pattern}`);
	const registry = readRegistry();
	const updated = Object.keys(registry).reduce((acc, v) => {
		if (matchesPattern(acc[v].name, pattern)) {
			delete acc[v];
		}
		return acc;
	}, registry);
	writeRegistry(updated);
	log('Success!');
}

function matchesPattern(name: string, pattern: string): boolean {
	if (!pattern.endsWith('*')) {
		return name === pattern;
	}

	return name.indexOf(pattern.substring(0, pattern.length - 1)) !== -1;
}
