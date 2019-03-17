const { execFileSync } = require('child_process');
const path = require('path');
const process = require('process');

execFileSync('yarn', [], {
	cwd: path.join(process.cwd(), 'packages/lib'),
	stdio: [process.stdin, process.stdout, process.stderr],
});

execFileSync('yarn', ['build'], {
	cwd: path.join(process.cwd(), 'packages/lib'),
	stdio: [process.stdin, process.stdout, process.stderr],
});

execFileSync('yarn', [], {
	cwd: path.join(process.cwd(), 'packages/cli'),
	stdio: [process.stdin, process.stdout, process.stderr],
});

execFileSync('yarn', ['build'], {
	cwd: path.join(process.cwd(), 'packages/cli'),
	stdio: [process.stdin, process.stdout, process.stderr],
});

execFileSync('yarn', [], {
	cwd: path.join(process.cwd(), 'packages/vscode'),
	stdio: [process.stdin, process.stdout, process.stderr],
});

execFileSync('yarn', ['build'], {
	cwd: path.join(process.cwd(), 'packages/vscode'),
	stdio: [process.stdin, process.stdout, process.stderr],
});
