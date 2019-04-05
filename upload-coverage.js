const { execFileSync } = require('child_process');
const path = require('path');
const process = require('process');

const packages = ['packages/lib', 'packages/cli'];

packages.reduce((_, package) => {
	const exec = (command, args) => {
		execFileSync(command, args, {
			cwd: path.join(process.cwd(), package),
			stdio: [process.stdin, process.stdout, process.stderr],
		});
	};

	exec('codecov', ['-F', `${package.substring('packages/'.length)}`]);
});
