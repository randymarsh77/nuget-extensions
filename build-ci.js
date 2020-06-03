const shell = require('shelljs');
const path = require('path');
const process = require('process');

const packages = ['packages/lib', 'packages/cli', 'packages/vscode'];

packages.reduce((_, package) => {
	const execYarn = args => {
		shell.config.execPath = shell.which('node').toString();
		const { code } = shell.exec(`yarn ${args.join(' ')}`, {
			cwd: path.join(process.cwd(), package),
		});
		if (code !== 0) {
			console.error('Failing build due to last error.');
			process.exit(1);
		}
	};

	console.log(`\nBuilding ${package}\n`);
	execYarn(['--force']);

	if (package === 'packages/vscode') {
		execYarn(['link', 'nuget-extensions-lib']);
	}

	execYarn(['build']);

	if (package === 'packages/lib') {
		// yarn install destroys symlinks (in devDependency deps), make sure `yarn jest` works.
		execYarn(['add', '--dev', 'jest-cli']);
		execYarn(['link']);
	}

	// The current travis.yml doesn't support launching VSCode windows for integration tests.
	if (package === 'packages/lib') {
		execYarn(['test', '--coverage']);
	}

	execYarn(['semantic-release']);

	return _;
}, {});
