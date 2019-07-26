const path = require('path');
const shell = require('shelljs');

const solutionDirectory = path.join(__dirname, 'tests', 'data', 'TestData');
const outputDirectory = path.join(__dirname, 'tests', 'data', 'packages');

shell.exec(
	`dotnet pack ${path.join(
		solutionDirectory,
		'TestData.sln'
	)} -c Debug --version-suffix Debug --output ${outputDirectory}`,
	{
		stdio: [process.stdin, process.stdout, process.stderr],
	}
);
