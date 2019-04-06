import * as path from 'path';
import * as rimraf from 'rimraf';
import * as uuid from 'uuid';
import {
	readRegistry,
	registerPackages,
	unregisterPackagesInDirectory,
	unregisterPackagesMatchingPattern,
} from '../src/registry';

const testRegistry = require('./data/testRegistry.json');
Object.keys(testRegistry).forEach(k => {
	testRegistry[k].directory = path.join(process.cwd(), 'tests', 'data', 'packages');
});

const testRegistryPartial = require('./data/testRegistry.partial.json');
Object.keys(testRegistryPartial).forEach(k => {
	testRegistryPartial[k].directory = path.join(process.cwd(), 'tests', 'data', 'packages');
});

describe('Registry Tests', () => {
	it('Reads an empty registry', () => {
		withRegistry(() => expect(readRegistry()).toEqual({}));
	});

	it('Can register packages in a directory', () => {
		withRegistry(() => {
			expect(readRegistry()).toEqual({});
			registerPackages(path.join(process.cwd(), 'tests', 'data', 'packages'), {});
			expect(readRegistry()).toEqual(testRegistry);
		});
	});

	it('Can unregister packages in a directory', () => {
		withRegistry(() => {
			const directory = path.join(process.cwd(), 'tests', 'data', 'packages');
			expect(readRegistry()).toEqual({});
			registerPackages(directory, {});
			expect(readRegistry()).toEqual(testRegistry);
			unregisterPackagesInDirectory(directory, {});
			expect(readRegistry()).toEqual({});
		});
	});

	it('Can unregister packages matching a pattern (partial)', () => {
		withRegistry(() => {
			const directory = path.join(process.cwd(), 'tests', 'data', 'packages');
			expect(readRegistry()).toEqual({});
			registerPackages(directory, {});
			expect(readRegistry()).toEqual(testRegistry);
			unregisterPackagesMatchingPattern('NugEx.Tests.*', {});
			expect(readRegistry()).toEqual(testRegistryPartial);
		});
	});

	it('Can unregister packages matching a pattern (all)', () => {
		withRegistry(() => {
			const directory = path.join(process.cwd(), 'tests', 'data', 'packages');
			expect(readRegistry()).toEqual({});
			registerPackages(directory, {});
			expect(readRegistry()).toEqual(testRegistry);
			unregisterPackagesMatchingPattern('NugEx.*', {});
			expect(readRegistry()).toEqual({});
		});
	});
});

function withRegistry(action: () => void) {
	const previous = process.env.NUGEX_DIR;
	const testEnv = path.join(process.cwd(), 'tests', 'data', uuid.v1());
	process.env.NUGEX_DIR = testEnv;
	action();
	process.env.NUGEX_DIR = previous;
	rimraf.sync(testEnv);
}
