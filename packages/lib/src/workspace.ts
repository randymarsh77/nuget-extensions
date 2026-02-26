import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import home from 'user-home';
import { readRegistry, IRegistry, IPackage } from './registry';
import { readLinks, ILinks } from './links';
import { ILogger } from './logger';

export interface IWorkspaceFolder {
	path: string;
	name?: string;
}

export interface IWorkspaceTaskDefinition {
	label: string;
	type: string;
	command: string;
	args?: string[];
	options?: { cwd?: string };
	group?: string;
	problemMatcher?: string[];
}

export interface IWorkspace {
	folders: IWorkspaceFolder[];
	settings: { [key: string]: unknown };
	tasks?: {
		version: string;
		tasks: IWorkspaceTaskDefinition[];
	};
}

function resolveWorkspaceDir(): string {
	const nugexDataDir = process.env.NUGEX_DIR || path.join(home, '.nugex');
	return path.join(nugexDataDir, 'workspaces');
}

function getUniquePackageDirectories(registry: IRegistry): Map<string, IPackage> {
	const directories = new Map<string, IPackage>();
	for (const key of Object.keys(registry)) {
		const pkg = registry[key];
		if (!directories.has(pkg.directory)) {
			directories.set(pkg.directory, pkg);
		}
	}
	return directories;
}

function getLinkedProjectPaths(links: ILinks): string[] {
	return Object.keys(links);
}

export function generateWorkspace(options: {
	consumerProjectPath?: string;
	logger?: ILogger;
} = {}): IWorkspace {
	const { consumerProjectPath, logger } = options;
	const log = (x: string) => logger && logger.log(x);

	const registry = readRegistry();
	const links = readLinks();
	const packageDirs = getUniquePackageDirectories(registry);
	const linkedProjects = getLinkedProjectPaths(links);

	const folders: IWorkspaceFolder[] = [];

	// Add consumer project folder if specified
	if (consumerProjectPath) {
		const consumerDir = path.dirname(consumerProjectPath);
		log(`Adding consumer project: ${consumerDir}`);
		folders.push({ path: consumerDir, name: path.basename(consumerDir) });
	}

	// Add each registered package directory
	for (const [directory, pkg] of packageDirs) {
		log(`Adding package directory: ${directory} (${pkg.name})`);
		folders.push({ path: directory, name: pkg.name });
	}

	// Build specialized tasks inspired by yalcspace
	const tasks: IWorkspaceTaskDefinition[] = [
		{
			label: 'NugEx: Link All Packages',
			type: 'shell',
			command: 'nuget-extensions',
			args: ['link', ...linkedProjects],
			group: 'build',
			problemMatcher: [],
		},
		{
			label: 'NugEx: Watch for Changes',
			type: 'shell',
			command: 'nuget-extensions',
			args: ['watch'],
			group: 'build',
			problemMatcher: [],
		},
		{
			label: 'NugEx: List Registered Packages',
			type: 'shell',
			command: 'nuget-extensions',
			args: ['list'],
			problemMatcher: [],
		},
		{
			label: 'NugEx: Reset Registry',
			type: 'shell',
			command: 'nuget-extensions',
			args: ['reset'],
			problemMatcher: [],
		},
	];

	// Add per-directory build tasks for each package source
	for (const [directory, pkg] of packageDirs) {
		tasks.push({
			label: `NugEx: Build ${pkg.name}`,
			type: 'shell',
			command: 'dotnet',
			args: ['build'],
			options: { cwd: directory },
			group: 'build',
			problemMatcher: ['$msCompile'],
		});
	}

	const workspace: IWorkspace = {
		folders,
		settings: {
			'cSpell.words': ['nugex', 'nuget', 'nupkg'],
		},
		tasks: {
			version: '2.0.0',
			tasks,
		},
	};

	return workspace;
}

export function writeWorkspaceFile(
	name: string,
	options: {
		consumerProjectPath?: string;
		logger?: ILogger;
	} = {}
): string {
	const { logger } = options;
	const log = (x: string) => logger && logger.log(x);

	const workspace = generateWorkspace(options);
	const workspaceDir = resolveWorkspaceDir();

	if (!fs.existsSync(workspaceDir)) {
		fs.mkdirSync(workspaceDir, { recursive: true });
	}

	const workspacePath = path.join(workspaceDir, `${name}.code-workspace`);
	fs.writeFileSync(workspacePath, JSON.stringify(workspace, null, 2));
	log(`Workspace written to: ${workspacePath}`);

	return workspacePath;
}
