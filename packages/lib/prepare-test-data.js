const path = require('path');
const shell = require('shelljs');

const solutionDirectory = path.join('tests', 'data', 'TestData');

shell.exec(
	`dotnet pack ${path.join(
		solutionDirectory,
		'TestData.sln'
	)} -c Debug --version-suffix Debug --output ${path.join('..', '..', 'packages')}`,
	{
		stdio: [process.stdin, process.stdout, process.stderr],
	}
);
