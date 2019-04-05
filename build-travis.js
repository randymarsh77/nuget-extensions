const { execFileSync } = require('child_process');
const path = require('path');
const process = require('process');

const packages = ['packages/lib', 'packages/cli', 'packages/vscode'];

packages.reduce((_, package) => {
	const execYarn = args => {
		execFileSync('yarn', args, {
			cwd: path.join(process.cwd(), package),
			stdio: [process.stdin, process.stdout, process.stderr],
		});
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
	if (package !== 'packages/vscode') {
		execYarn(['test', '--coverage']);
	}
	return _;
}, {});
