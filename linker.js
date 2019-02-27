const { execFileSync } = require('child_process');
const { readRegistry } = require('./registry');
const { updateProjectFile } = require('./csproj');

module.exports = {
	link: projects => {
		const registry = readRegistry();
		const packages = Object.keys(registry).reduce((acc, package) => {
			const { name, version, assemblyVersion, directory } = registry[package];
			console.log(`Exec: nuget install ${name} -Version ${version} -Source ${directory}`);
			execFileSync('nuget', ['install', name, '-Version', version, '-Source', directory]);
			return [{ name, version, assemblyVersion }, ...acc];
		}, []);
		projects.forEach(project => {
			console.log('Updating: ', project);
			updateProjectFile(project, packages);
		});
		console.log('Success!');
	},
};
