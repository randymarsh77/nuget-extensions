import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { readRegistry, IPackage } from './registry';
import { updateProjectFile } from './csproj';

type PartialPackageInfo = Pick<IPackage, 'name' | 'version' | 'assemblyVersion'>;

export function installPackages({
	workingDirectory,
	shortCircuitBuild,
}: {
	workingDirectory?: string;
	shortCircuitBuild?: string;
} = {}) {
	const registry = readRegistry();
	const packages = Object.keys(registry).reduce((acc: PartialPackageInfo[], pkg: string) => {
		const { name, version, assemblyVersion, directory } = registry[pkg];
		const guessedPackagePath = path.join(process.cwd(), 'packages', `${name}.${version}`);
		console.log('Guessed path:', guessedPackagePath);
		if (fs.existsSync(guessedPackagePath)) {
			console.log('Removing existing package at:', guessedPackagePath);
			rimraf.sync(guessedPackagePath);
		}
		console.log(`Exec: nuget install ${name} -Version ${version} -Source ${directory}`);
		execFileSync('nuget', ['install', name, '-Version', version, '-Source', directory], {
			cwd: workingDirectory,
		});
		if (shortCircuitBuild && fs.existsSync(shortCircuitBuild)) {
			const availableTargets = fs.readdirSync(path.join(guessedPackagePath, 'lib'));
			if (availableTargets && availableTargets.length !== 0) {
				const target = availableTargets[0];
				const dllLocation = path.join(workingDirectory || '', guessedPackagePath, 'lib', target);
				console.log('Short circuiting your build using', dllLocation);

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
	projects: string[],
	options: {
		workingDirectory?: string;
		shortCircuitBuild?: string;
	}
) {
	const packages = installPackages(options);
	projects.forEach(project => {
		console.log('Updating: ', project);
		updateProjectFile(project, packages);
	});
	console.log('Success!');
}
