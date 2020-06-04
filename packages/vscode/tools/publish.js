const path = require('path');
const shell = require('shelljs');

module.exports = {
	publish: () => {
		const vscode = {
			cwd: path.join(__dirname, '..'),
		};
		shell.exec('npx vsce package --yarn', vscode);
		shell.exec(`npx vsce publish -p ${process.env.VSCE_TOKEN} --yarn`, vscode);
	},
};
