import { execFileSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { readRegistry, IPackage } from './registry';
import { updateProjectFile } from './csproj';
import { parseSolution } from './solution';
import { ILogger } from './logger';

type PartialPackageInfo = Pick<IPackage, 'name' | 'version' | 'assemblyVersion'>;

export function installPackages({
	workingDirectory,
	shortCircuitBuild,
	logger,
}: {
	workingDirectory?: string;
	shortCircuitBuild?: string;
	logger?: ILogger;
} = {}) {
	const log = (x: string) => logger && logger.log(x);
	const registry = readRegistry();
	const packages = Object.keys(registry).reduce((acc: PartialPackageInfo[], pkg: string) => {
		const { name, version, assemblyVersion, directory } = registry[pkg];
		const guessedPackagePath = path.join(
			resolvePackagesDirectory(workingDirectory || process.cwd()),
			`${name}.${version}`
		);
		log(`Guessed path: ${guessedPackagePath}`);
		if (fs.existsSync(guessedPackagePath)) {
			log(`Removing existing package at: ${guessedPackagePath}`);
			rimraf.sync(guessedPackagePath);
		}

		log(`Exec: nuget install ${name} -Version ${version} -Source ${directory}`);
		execFileSync('nuget', ['install', name, '-Version', version, '-Source', directory], {
			cwd: workingDirectory,
		});

		log('Verifying package sources...');
		const sourceKey = crypto
			.createHash('md5')
			.update(directory)
			.digest('hex');
		const keyExists =
			execFileSync('nuget', ['sources', 'list'], {
				cwd: workingDirectory,
			})
				.toString()
				.indexOf(sourceKey) !== -1;
		const operation = keyExists ? 'update' : 'add';
		log(`${keyExists ? 'Updating' : 'Adding'} package source for ${directory}`);
		execFileSync('nuget', ['sources', operation, '-Name', sourceKey, '-Source', directory], {
			cwd: workingDirectory,
		});

		if (shortCircuitBuild && fs.existsSync(shortCircuitBuild)) {
			const lib = path.join(guessedPackagePath, 'lib');
			const availableTargets = fs.existsSync(lib) ? fs.readdirSync(lib) : [];
			if (availableTargets && availableTargets.length !== 0) {
				const target = availableTargets[0];
				const dllLocation = path.join(lib, target);
				log(`Short circuiting your build using ${dllLocation}`);

				fs.copyFileSync(
					path.join(dllLocation, `${name}.dll`),
					path.join(shortCircuitBuild, `${name}.dll`)
				);
				fs.copyFileSync(
					path.join(dllLocation, `${name}.pdb`),
					path.join(shortCircuitBuild, `${name}.pdb`)
				);
			}
		}
		return [{ name, version, assemblyVersion }, ...acc];
	}, []);
	return packages;
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
	destinations.forEach(destination => {
		if (destination.endsWith('.csproj')) {
			log(`Updating:  ${destination}`);
			updateProjectFile(destination, packages);
		} else if (destination.endsWith('.sln')) {
			log('Scanning solution...');
			const projects = parseSolution(destination);
			projects.forEach(project => {
				const resolvedProjectPath = path.normalize(
					path.join(path.dirname(destination), project.path.split('\\').join(path.sep))
				);
				log(`Updating: ${project.name} @ ${resolvedProjectPath}`);
				updateProjectFile(resolvedProjectPath, packages);
			});
		} else {
			logError(`Unrecognized link destination: ${destination}`);
		}
	});
	log('Done!');
}

function resolvePackagesDirectory(fromDirectory: string) {
	let foundConfigDirectory = false;
	let keepSearching = true;
	let currentDirectory = fromDirectory;
	while (!foundConfigDirectory && keepSearching) {
		foundConfigDirectory = fs.existsSync(path.join(currentDirectory, 'nuget.config'));
		if (!foundConfigDirectory) {
			const parts = currentDirectory.split(path.sep);
			if (parts.length > 1) {
				currentDirectory = path.join(...parts.slice(0, parts.length - 1));
			} else {
				keepSearching = false;
			}
		}
	}
	const relativeLocation =
		execFileSync('nuget', ['config', 'repositoryPath'], { cwd: fromDirectory })
			.toString()
			.trim() || 'packages';
	return path.join(foundConfigDirectory ? currentDirectory : fromDirectory, relativeLocation);
}
