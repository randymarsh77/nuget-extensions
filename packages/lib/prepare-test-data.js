const path = require('path');
const shell = require('shelljs');

const solutionDirectory = path.join(__dirname, 'tests', 'data', 'TestData');

shell.exec(
	`dotnet pack ${path.join(
		solutionDirectory,
		'TestData.sln'
	)} -c Debug --version-suffix Debug --output ${path.join(__dirname, '..', '..', 'packages')}`,
	{
		stdio: [process.stdin, process.stdout, process.stderr],
	}
);
