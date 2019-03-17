const { execFileSync } = require('child_process');
const path = require('path');
const process = require('process');

const packages = ['packages/lib', 'packages/cli'];

packages.reduce((_, package) => {
	console.log('Building', package);
	execFileSync('yarn', [], {
		cwd: path.join(process.cwd(), package),
		stdio: [process.stdin, process.stdout, process.stderr],
	});

	execFileSync('yarn', ['build'], {
		cwd: path.join(process.cwd(), package),
		stdio: [process.stdin, process.stdout, process.stderr],
	});
	return _;
}, {});
