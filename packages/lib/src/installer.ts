import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
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

		const localPackagesDirectory = resolveLocalPackagesDirectory(
			execNuget,
			workingDirectory || process.cwd()
		);
		const guessedLocalPackagePath = path.join(localPackagesDirectory, `${name}.${version}`);
		log(`Guessed local path: ${guessedLocalPackagePath}`);
		if (fs.existsSync(guessedLocalPackagePath)) {
			log(`Removing existing package at: ${guessedLocalPackagePath}`);
			rimraf.sync(guessedLocalPackagePath);
		}

		const globalPackagesDirectory = path.join(os.homedir(), '.nuget', 'packages');
		const guessedGlobalPackagePath = path.join(
			globalPackagesDirectory,
			name.toLowerCase(),
			version.toLowerCase()
		);
		if (fs.existsSync(guessedGlobalPackagePath)) {
			log(`Removing existing package at: ${guessedGlobalPackagePath}`);
			rimraf.sync(guessedGlobalPackagePath);
		}

		const globalPackageLocation = path.join(globalPackagesDirectory, name.toLowerCase());
		const installGlobalCommand = `install ${name} -Version ${version} -Source ${directory} -OutputDirectory ${globalPackageLocation}`;
		log(`Installing package to global package directory.`);
		const existingFiles = fs.readdirSync(globalPackageLocation);
		log(`Exec: nuget ${installGlobalCommand}`);
		execNuget(installGlobalCommand, {
			cwd: workingDirectory,
		});
		fs.renameSync(path.join(globalPackageLocation, `${name}.${version}`), guessedGlobalPackagePath);
		fs.readdirSync(globalPackageLocation).forEach(file => {
			if (file !== version.toLowerCase() && existingFiles.indexOf(file) < 0) {
				rimraf.sync(path.join(globalPackageLocation, file));
			}
		});

		if (
			fs.existsSync(localPackagesDirectory) &&
			fs.readdirSync(localPackagesDirectory).some(x => x.startsWith(name))
		) {
			const installLocalCommand = `install ${name} -Version ${version} -Source ${directory} -OutputDirectory ${localPackagesDirectory}`;
			log(`Exec: nuget ${installLocalCommand}`);
			execNuget(installLocalCommand, {
				cwd: workingDirectory,
			});
		}

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

		const preferredShortCircuitPath = fs.existsSync(guessedLocalPackagePath)
			? guessedLocalPackagePath
			: guessedGlobalPackagePath;
		if (
			shortCircuitBuild &&
			fs.existsSync(shortCircuitBuild) &&
			fs.existsSync(preferredShortCircuitPath)
		) {
			const lib = path.join(preferredShortCircuitPath, 'lib');
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

function resolveLocalPackagesDirectory(execNuget: ExecToolFunction, fromDirectory: string) {
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
