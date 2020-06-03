const shell = require('shelljs');
const process = require('process');

const createExecYarn = package => args => {
	shell.config.execPath = shell.which('node').toString();
	const { code } = shell.exec(
		`yarn ${(package && `workspace ${package}`) || ''} ${(args || []).join(' ')}`
	);
	if (code !== 0) {
		console.error('Failing build due to last error.');
		process.exit(1);
	}
};

const packages = ['nuget-extensions-lib', 'nuget-extensions', 'nuget-extensions-vscode'];

createExecYarn()();

packages.reduce((_, package) => {
	const execYarn = createExecYarn(package);

	console.log(`\nBuilding ${package}\n`);

	if (package === 'nuget-extensions-vscode') {
		execYarn(['link', 'nuget-extensions-lib']);
	}

	execYarn(['build']);

	if (package === 'nuget-extensions-lib') {
		// yarn install destroys symlinks (in devDependency deps), make sure `yarn jest` works.
		execYarn(['add', '--dev', 'jest-cli']);
		execYarn(['link']);
	}

	// The current travis.yml doesn't support launching VSCode windows for integration tests.
	if (package === 'nuget-extensions-lib') {
		execYarn(['test', '--coverage']);
	}

	execYarn(['semantic-release']);

	return _;
}, {});
