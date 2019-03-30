const { execFileSync } = require('child_process');
const path = require('path');
const process = require('process');

const packages = ['packages/lib', 'packages/cli', 'packages/vscode'];

packages.reduce((_, package) => {
	console.log(`\nBuilding ${package}\n`);
	execFileSync('yarn', ['--force'], {
		cwd: path.join(process.cwd(), package),
		stdio: [process.stdin, process.stdout, process.stderr],
	});

	execFileSync('yarn', ['build'], {
		cwd: path.join(process.cwd(), package),
		stdio: [process.stdin, process.stdout, process.stderr],
	});

	if (package === 'packages/lib') {
		// yarn install destroys symlinks (in devDependency deps), make sure `yarn jest` works.
		execFileSync('yarn', ['add', '--dev', 'jest-cli'], {
			cwd: path.join(process.cwd(), package),
			stdio: [process.stdin, process.stdout, process.stderr],
		});
	}

	// The current travis.yml doesn't support launching VSCode windows for integration tests.
	if (package !== 'packages/vscode') {
		execFileSync('yarn', ['test'], {
			cwd: path.join(process.cwd(), package),
			stdio: [process.stdin, process.stdout, process.stderr],
		});
	}
	return _;
}, {});
