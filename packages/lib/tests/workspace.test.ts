import * as path from 'path';
import * as fs from 'fs';
import { generateWorkspace, writeWorkspaceFile } from '../src/workspace';
import { writeRegistry } from '../src/registry';
import { writeLinks } from '../src/links';
import { ReferenceType } from '../src/csproj';
import { withTestEnvironment } from './environment';

describe('Workspace Tests', () => {
	it('Generates an empty workspace with no registry or links', () => {
		withTestEnvironment(() => {
			const workspace = generateWorkspace();
			expect(workspace.folders).toEqual([]);
			expect(workspace.settings).toBeDefined();
			expect(workspace.tasks).toBeDefined();
			expect(workspace.tasks!.version).toBe('2.0.0');
			expect(workspace.tasks!.tasks.length).toBeGreaterThan(0);
		});
	});

	it('Includes consumer project folder when specified', () => {
		withTestEnvironment(() => {
			const consumerPath = path.join(process.cwd(), 'tests', 'data', 'Consumer.csproj');
			const workspace = generateWorkspace({ consumerProjectPath: consumerPath });
			expect(workspace.folders.length).toBe(1);
			expect(workspace.folders[0].path).toBe(path.dirname(consumerPath));
		});
	});

	it('Includes registered package directories', () => {
		withTestEnvironment(() => {
			const testDir = path.join(process.cwd(), 'tests', 'data', 'packages');
			writeRegistry({
				'TestPkg.1.0.0.nupkg': {
					name: 'TestPkg',
					version: '1.0.0',
					extension: 'nupkg',
					directory: testDir,
					targets: [{ assemblyVersion: '1.0.0.0', framework: 'net6.0' }],
				},
			});
			const workspace = generateWorkspace();
			expect(workspace.folders.length).toBe(1);
			expect(workspace.folders[0].path).toBe(testDir);
			expect(workspace.folders[0].name).toBe('TestPkg');
		});
	});

	it('Generates per-package build tasks', () => {
		withTestEnvironment(() => {
			const testDir = path.join(process.cwd(), 'tests', 'data', 'packages');
			writeRegistry({
				'PkgA.1.0.0.nupkg': {
					name: 'PkgA',
					version: '1.0.0',
					extension: 'nupkg',
					directory: testDir,
					targets: [{ assemblyVersion: '1.0.0.0', framework: 'net6.0' }],
				},
			});
			const workspace = generateWorkspace();
			const buildTask = workspace.tasks!.tasks.find(t => t.label === 'NugEx: Build PkgA');
			expect(buildTask).toBeDefined();
			expect(buildTask!.command).toBe('dotnet');
			expect(buildTask!.options!.cwd).toBe(testDir);
		});
	});

	it('Writes workspace file to disk', () => {
		withTestEnvironment(() => {
			const filePath = writeWorkspaceFile('test-workspace');
			expect(filePath.endsWith('.code-workspace')).toBe(true);
			expect(fs.existsSync(filePath)).toBe(true);
			const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
			expect(content.folders).toBeDefined();
			expect(content.tasks).toBeDefined();
		});
	});

	it('Deduplicates package directories', () => {
		withTestEnvironment(() => {
			const testDir = path.join(process.cwd(), 'tests', 'data', 'packages');
			writeRegistry({
				'PkgA.1.0.0.nupkg': {
					name: 'PkgA',
					version: '1.0.0',
					extension: 'nupkg',
					directory: testDir,
					targets: [{ assemblyVersion: '1.0.0.0', framework: 'net6.0' }],
				},
				'PkgA.2.0.0.nupkg': {
					name: 'PkgA',
					version: '2.0.0',
					extension: 'nupkg',
					directory: testDir,
					targets: [{ assemblyVersion: '2.0.0.0', framework: 'net6.0' }],
				},
			});
			const workspace = generateWorkspace();
			expect(workspace.folders.length).toBe(1);
		});
	});
});
