import * as path from 'path';
import {
	readRegistry,
	registerPackagesInDirectory,
	unregisterPackagesInDirectory,
	unregisterPackagesMatchingPattern,
} from '../src/registry';
import { withTestEnvironment } from './environment';

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
		withTestEnvironment(() => expect(readRegistry()).toEqual({}));
	});

	it('Can register packages in a directory', () => {
		withTestEnvironment(() => {
			expect(readRegistry()).toEqual({});
			registerPackagesInDirectory(path.join(process.cwd(), 'tests', 'data', 'packages'), {});
			expect(readRegistry()).toEqual(testRegistry);
		});
	});

	it('Can unregister packages in a directory', () => {
		withTestEnvironment(() => {
			const directory = path.join(process.cwd(), 'tests', 'data', 'packages');
			expect(readRegistry()).toEqual({});
			registerPackagesInDirectory(directory, {});
			expect(readRegistry()).toEqual(testRegistry);
			unregisterPackagesInDirectory(directory, {});
			expect(readRegistry()).toEqual({});
		});
	});

	it('Can unregister packages matching a pattern (partial)', () => {
		withTestEnvironment(() => {
			const directory = path.join(process.cwd(), 'tests', 'data', 'packages');
			expect(readRegistry()).toEqual({});
			registerPackagesInDirectory(directory, {});
			expect(readRegistry()).toEqual(testRegistry);
			unregisterPackagesMatchingPattern('NugEx.Tests.*', {});
			expect(readRegistry()).toEqual(testRegistryPartial);
		});
	});

	it('Can unregister packages matching a pattern (all)', () => {
		withTestEnvironment(() => {
			const directory = path.join(process.cwd(), 'tests', 'data', 'packages');
			expect(readRegistry()).toEqual({});
			registerPackagesInDirectory(directory, {});
			expect(readRegistry()).toEqual(testRegistry);
			unregisterPackagesMatchingPattern('NugEx.*', {});
			expect(readRegistry()).toEqual({});
		});
	});
});
