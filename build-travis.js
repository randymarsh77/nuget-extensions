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

	execFileSync('yarn', ['test'], {
		cwd: path.join(process.cwd(), package),
		stdio: [process.stdin, process.stdout, process.stderr],
	});
	return _;
}, {});
