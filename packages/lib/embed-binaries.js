const path = require('path');
const shell = require('shelljs');

const projectDirectory = path.join('..', '..', 'tools', 'NuGetPackageInfo', 'NuGetPackageInfo');

shell.config.execPath = shell.which('node').toString();
shell.exec(`dotnet build ${path.join(projectDirectory, 'NuGetPackageInfo.csproj')} -c Release`, {
	stdio: [process.stdin, process.stdout, process.stderr],
});

const from = path.join(projectDirectory, 'bin', 'Release', 'netcoreapp3.1');
const to = path.join('out', 'bin', 'NuGetPackageInfo');

shell.mkdir('out/bin');
shell.cp('-r', from, to);
