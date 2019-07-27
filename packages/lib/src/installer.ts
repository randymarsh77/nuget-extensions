import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { readRegistry, IPackage } from './registry';
import { ILogger } from './logger';
import { requireTool, ExecToolFunction } from './shell-utility';

type PartialPackageInfo = Pick<IPackage, 'name' | 'version' | 'targets'>;

export function installPackages({
	workingDirectory,
	shortCircuitBuild,
	logger,
}: {
	workingDirectory?: string;
	shortCircuitBuild?: string;
	logger?: ILogger;
} = {}) {
	const execNuget = requireTool('nuget');
	const log = (x: string) => logger && logger.log(x);
	const registry = readRegistry();
	const packages = Object.keys(registry).reduce((acc: PartialPackageInfo[], pkg: string) => {
		const { name, version, targets, directory } = registry[pkg];
		const guessedPackagePath = path.join(
			resolvePackagesDirectory(execNuget, workingDirectory || process.cwd()),
			`${name}.${version}`
		);
		log(`Guessed path: ${guessedPackagePath}`);
		if (fs.existsSync(guessedPackagePath)) {
			log(`Removing existing package at: ${guessedPackagePath}`);
			rimraf.sync(guessedPackagePath);
		}

		log(`Exec: nuget install ${name} -Version ${version} -Source ${directory}`);
		execNuget(`install ${name} -Version ${version} -Source ${directory}`, {
			cwd: workingDirectory,
		});

		log('Verifying package sources...');
		const sourceKey = crypto
			.createHash('md5')
			.update(directory)
			.digest('hex');
		const { stdout: sourceList } = execNuget(`sources list`, {
			cwd: workingDirectory,
		});
		const keyExists = sourceList.indexOf(sourceKey) !== -1;
		const operation = keyExists ? 'update' : 'add';
		log(`${keyExists ? 'Updating' : 'Adding'} package source for ${directory}`);
		execNuget(`sources ${operation} -Name ${sourceKey} -Source ${directory}`, {
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
		return [{ name, version, targets }, ...acc];
	}, []);
	return packages;
}

function resolvePackagesDirectory(execNuget: ExecToolFunction, fromDirectory: string) {
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
	const { stdout: configRepoPath } = execNuget(`config repositoryPath`, {
		cwd: fromDirectory,
	});
	const relativeLocation = configRepoPath.trim() || 'packages';
	return path.join(foundConfigDirectory ? currentDirectory : fromDirectory, relativeLocation);
}
