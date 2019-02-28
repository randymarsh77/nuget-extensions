const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { readRegistry } = require('./registry');
const { updateProjectFile } = require('./csproj');

const installPackages = shortCircuitBuild => {
	const registry = readRegistry();
	const packages = Object.keys(registry).reduce((acc, package) => {
		const { name, version, assemblyVersion, directory } = registry[package];
		const guessedPackagePath = path.join(process.cwd(), 'packages', `${name}.${version}`);
		console.log('Guessed path:', guessedPackagePath);
		if (fs.existsSync(guessedPackagePath)) {
			console.log('Removing existing package at:', guessedPackagePath);
			rimraf.sync(guessedPackagePath);
		}
		console.log(`Exec: nuget install ${name} -Version ${version} -Source ${directory}`);
		execFileSync('nuget', ['install', name, '-Version', version, '-Source', directory]);
		if (shortCircuitBuild && fs.existsSync(shortCircuitBuild)) {
			const availableTargets = fs.readdirSync(path.join(guessedPackagePath, 'lib'));
			if (availableTargets && availableTargets.length !== 0) {
				const target = availableTargets[0];
				const dllLocation = path.join(guessedPackagePath, 'lib', target);
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
};

module.exports = {
	installPackages,
	link: projects => {
		const packages = installPackages();
		projects.forEach(project => {
			console.log('Updating: ', project);
			updateProjectFile(project, packages);
		});
		console.log('Success!');
	},
};
