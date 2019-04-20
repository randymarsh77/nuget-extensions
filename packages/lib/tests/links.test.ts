import * as path from 'path';
import { ILinks, readLinks, writeLinks, mergeLinks, pruneLinks } from '../src/links';
import { ReferenceType } from '../src/csproj';
import { withTestEnvironment } from './environment';

const testRegistry = require('./data/testRegistry.json');
Object.keys(testRegistry).forEach(k => {
	testRegistry[k].directory = path.join(process.cwd(), 'tests', 'data', 'packages');
});

const testRegistryPartial = require('./data/testRegistry.partial.json');
Object.keys(testRegistryPartial).forEach(k => {
	testRegistryPartial[k].directory = path.join(process.cwd(), 'tests', 'data', 'packages');
});

describe('Links Tests', () => {
	it('Reads empty links', () => {
		withTestEnvironment(() => expect(readLinks()).toEqual({}));
	});

	it('Can write links', () => {
		withTestEnvironment(() => {
			expect(readLinks()).toEqual({});
			const links = {
				random: [],
			};
			writeLinks(links);
			expect(readLinks()).toEqual(links);
		});
	});

	it('Can prune links', () => {
		const links = {
			projectPath: [],
		};
		const pruned = pruneLinks(links);
		expect(pruned).toEqual({});
	});

	it('Can merge links', () => {
		const aData = {
			name: 'APackageName',
			type: ReferenceType.PackageReference,
			previous: { version: '1', assemblyVersion: '' },
			updated: { version: '2', assemblyVersion: '' },
		};
		const bData = {
			name: 'BPackageName',
			type: ReferenceType.PackagesConfig,
			previous: { version: '1', assemblyVersion: '1' },
			updated: { version: '2', assemblyVersion: '2' },
		};
		const a = {
			projectPath: [aData],
		};
		const b = {
			projectPath: [bData],
		};
		const merged = mergeLinks(a, b);
		expect(merged).toEqual({
			projectPath: [aData, bData],
		});
	});
});
