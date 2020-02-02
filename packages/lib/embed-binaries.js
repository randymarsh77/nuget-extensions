const path = require('path');
const shell = require('shelljs');

const projectDirectory = path.join('..', '..', 'tools', 'NuGetPackageInfo', 'NuGetPackageInfo');

shell.config.execPath = shell.which('node').toString();
const { code } = shell.exec(
	`dotnet build ${path.join(projectDirectory, 'NuGetPackageInfo.csproj')} -c Release`
);
if (code !== 0) {
	console.error('Failing build due to last error.');
	process.exit(1);
}

const from = path.join(projectDirectory, 'bin', 'Release', 'netcoreapp3.1');
const to = path.join('out', 'bin', 'NuGetPackageInfo');

shell.mkdir('out/bin');
shell.cp('-r', from, to);
