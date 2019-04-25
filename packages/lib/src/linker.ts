import * as path from 'path';
import { updateProjectFile, PartialPackageInfo, IProjectFileChange } from './csproj';
import { installPackages } from './installer';
import { mergeLinks, pruneLinks, readLinks, writeLinks } from './links';
import { ILogger } from './logger';
import { parseSolution } from './solution';

export interface IUnlinkTarget {
	pattern: string;
	projects: string[];
}

export function link(
	destinations: string[],
	options: {
		workingDirectory?: string;
		shortCircuitBuild?: string;
		logger?: ILogger;
	}
) {
	const logger = options.logger;
	const log = (x: string) => logger && logger.log(x);
	const logError = (x: string) => logger && logger.error(x);
	const packages = installPackages(options);
	const links = destinations.reduce((links, destination) => {
		let newLinks = links;
		if (destination.endsWith('.csproj')) {
			log(`Updating:  ${destination}`);
			newLinks = mergeLinks(newLinks, {
				[destination]: updateProjectFile(destination, packages),
			});
		} else if (destination.endsWith('.sln')) {
			log('Scanning solution...');
			const projects = parseSolution(destination);
			projects.forEach(project => {
				const resolvedProjectPath = path.normalize(
					path.join(path.dirname(destination), project.path.split('\\').join(path.sep))
				);
				log(`Updating: ${project.name} @ ${resolvedProjectPath}`);
				newLinks = mergeLinks(newLinks, {
					[resolvedProjectPath]: updateProjectFile(resolvedProjectPath, packages),
				});
			});
		} else {
			logError(`Unrecognized link destination: ${destination}`);
		}
		return newLinks;
	}, readLinks());
	writeLinks(pruneLinks(links));
}

export function findUnlinkTargets(
	destinations: string[],
	options: {
		logger?: ILogger;
	}
): IUnlinkTarget[] {
	const logger = options.logger;
	const log = (x: string) => logger && logger.log(x);
	const logError = (x: string) => logger && logger.error(x);

	const projects = destinations.reduce((projects, destination) => {
		if (destination.endsWith('.csproj')) {
			projects.add(destination);
		} else if (destination.endsWith('.sln')) {
			const solutionProjects = parseSolution(destination);
			solutionProjects.forEach(project => {
				const resolvedProjectPath = path.normalize(
					path.join(path.dirname(destination), project.path.split('\\').join(path.sep))
				);
				projects.add(resolvedProjectPath);
			});
		} else {
			logError(`Unrecognized link destination: ${destination}`);
		}
		return projects;
	}, new Set<string>());

	const links = readLinks();
	const targetMap = Object.keys(links)
		.filter(x => projects.has(x))
		.reduce(
			(targetMap, project) => {
				const changes = links[project];
				changes.forEach(change => {
					const { name } = change;
					name.split('.').reduce((prefix, segment) => {
						const next = `${prefix}${prefix.length !== 0 ? '.' : ''}${segment}`;
						const pattern = next === name ? name : `${next}.*`;
						if (!targetMap[pattern]) {
							targetMap[pattern] = [];
						}
						targetMap[pattern].push(project);
						return next;
					}, '');
				});
				return targetMap;
			},
			{} as { [pattern: string]: string[] }
		);

	const targets = Object.keys(targetMap).reduce(
		(targets, pattern) => {
			targets.push({ pattern, projects: targetMap[pattern] });
			return targets;
		},
		[] as IUnlinkTarget[]
	);

	return targets;
}

export function unlink(targets: IUnlinkTarget[]) {
	const links = targets.reduce((links, { projects, pattern }) => {
		projects.forEach(project => {
			const projectLinks = links[project];
			if (projectLinks) {
				const { packages, newProjectLinks } = projectLinks.reduce(
					({ packages, newProjectLinks }, { name, previous }) => {
						const { version, assemblyVersion } = previous;
						return matchesPattern(name, pattern)
							? {
									packages: [...packages, { name, version, assemblyVersion }],
									newProjectLinks: newProjectLinks.filter(x => x.name !== name),
							  }
							: { packages, newProjectLinks };
					},
					{ packages: [] as PartialPackageInfo[], newProjectLinks: projectLinks }
				);
				updateProjectFile(project, packages);
				links[project] = newProjectLinks;
			}
		});
		return links;
	}, readLinks());
	writeLinks(pruneLinks(links));
}

function matchesPattern(name: string, pattern: string): boolean {
	if (!pattern.endsWith('*')) {
		return name === pattern;
	}

	return name.indexOf(pattern.substring(0, pattern.length - 1)) !== -1;
}
